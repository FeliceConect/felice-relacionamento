-- Tabela de indicações (pessoas indicadas pelos pacientes)
CREATE TABLE IF NOT EXISTS public.form_indicacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(255) NOT NULL,
  telefone VARCHAR(20) NOT NULL,
  telefone_formatado VARCHAR(20),
  parentesco VARCHAR(50),
  paciente_id UUID NOT NULL REFERENCES public.form_pacientes(id) ON DELETE CASCADE,
  pergunta_id UUID REFERENCES public.form_perguntas(id) ON DELETE SET NULL,
  status VARCHAR(50) DEFAULT 'aguardando',
  convertido BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para buscas
CREATE INDEX IF NOT EXISTS idx_indicacoes_paciente ON public.form_indicacoes(paciente_id);
CREATE INDEX IF NOT EXISTS idx_indicacoes_status ON public.form_indicacoes(status);
CREATE INDEX IF NOT EXISTS idx_indicacoes_created ON public.form_indicacoes(created_at DESC);

-- Tabela de follow-ups específica para indicações
CREATE TABLE IF NOT EXISTS public.form_indicacoes_followups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  indicacao_id UUID NOT NULL REFERENCES public.form_indicacoes(id) ON DELETE CASCADE,
  template_id UUID REFERENCES public.form_templates(id) ON DELETE SET NULL,
  tipo_contato VARCHAR(50) DEFAULT 'whatsapp',
  conteudo_enviado TEXT,
  data_envio TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status VARCHAR(50) DEFAULT 'enviado',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_indicacoes_followups_indicacao ON public.form_indicacoes_followups(indicacao_id);

-- Tabela de conversões específica para indicações
CREATE TABLE IF NOT EXISTS public.form_indicacoes_conversoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  indicacao_id UUID NOT NULL REFERENCES public.form_indicacoes(id) ON DELETE CASCADE,
  nucleo_id UUID REFERENCES public.form_nucleos(id) ON DELETE SET NULL,
  procedimento VARCHAR(255),
  valor DECIMAL(10, 2),
  data_conversao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_indicacoes_conversoes_indicacao ON public.form_indicacoes_conversoes(indicacao_id);

-- View para listagem de indicações com status calculado
CREATE OR REPLACE VIEW public.form_indicacoes_view AS
SELECT
  i.id,
  i.nome,
  i.telefone,
  i.telefone_formatado,
  i.parentesco,
  i.paciente_id,
  i.pergunta_id,
  i.created_at,
  i.updated_at,
  p.nome AS indicado_por_nome,
  p.whatsapp AS indicado_por_whatsapp,
  COALESCE(f.total_followups, 0) AS total_followups,
  CASE
    WHEN c.id IS NOT NULL THEN 'convertido'
    WHEN COALESCE(f.total_followups, 0) >= 3 THEN '3_mais_mensagens'
    WHEN COALESCE(f.total_followups, 0) = 2 THEN '2_mensagens'
    WHEN COALESCE(f.total_followups, 0) = 1 THEN '1_mensagem'
    ELSE 'aguardando'
  END AS status,
  CASE WHEN c.id IS NOT NULL THEN TRUE ELSE FALSE END AS convertido,
  c.nucleo_id AS nucleo_convertido_id,
  c.data_conversao
FROM public.form_indicacoes i
LEFT JOIN public.form_pacientes p ON i.paciente_id = p.id
LEFT JOIN (
  SELECT indicacao_id, COUNT(*) AS total_followups
  FROM public.form_indicacoes_followups
  GROUP BY indicacao_id
) f ON i.id = f.indicacao_id
LEFT JOIN LATERAL (
  SELECT id, nucleo_id, data_conversao
  FROM public.form_indicacoes_conversoes
  WHERE indicacao_id = i.id
  ORDER BY data_conversao DESC
  LIMIT 1
) c ON TRUE;

-- Habilitar RLS
ALTER TABLE public.form_indicacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_indicacoes_followups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_indicacoes_conversoes ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso (permitir tudo para usuários autenticados)
CREATE POLICY "Allow all for authenticated users" ON public.form_indicacoes
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for authenticated users" ON public.form_indicacoes_followups
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for authenticated users" ON public.form_indicacoes_conversoes
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_indicacoes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_indicacoes_updated_at
  BEFORE UPDATE ON public.form_indicacoes
  FOR EACH ROW
  EXECUTE FUNCTION update_indicacoes_updated_at();

-- Migrar indicacoes existentes de form_respostas para form_indicacoes
-- Esta query encontra todas as respostas de tipo 'indicacoes' e extrai os dados do JSON
DO $$
DECLARE
  r RECORD;
  indicacao JSONB;
  phone_formatted TEXT;
BEGIN
  FOR r IN
    SELECT
      fr.id as resposta_id,
      fr.paciente_id,
      fr.pergunta_id,
      fr.resposta_texto,
      fr.created_at
    FROM public.form_respostas fr
    INNER JOIN public.form_perguntas fp ON fr.pergunta_id = fp.id
    WHERE fp.tipo = 'indicacoes'
    AND fr.resposta_texto IS NOT NULL
    AND fr.resposta_texto != '[]'
  LOOP
    -- Parse o JSON e insere cada indicacao
    FOR indicacao IN SELECT * FROM jsonb_array_elements(r.resposta_texto::jsonb)
    LOOP
      -- Verifica se tem nome (campo obrigatorio)
      IF indicacao->>'nome' IS NOT NULL AND indicacao->>'nome' != '' THEN
        -- Formatar telefone
        phone_formatted := NULL;
        IF indicacao->>'telefone' IS NOT NULL AND indicacao->>'telefone' != '' THEN
          phone_formatted := CONCAT(
            '(',
            SUBSTRING(indicacao->>'telefone' FROM 1 FOR 2),
            ') ',
            SUBSTRING(indicacao->>'telefone' FROM 3 FOR 5),
            '-',
            SUBSTRING(indicacao->>'telefone' FROM 8)
          );
        END IF;

        -- Inserir na tabela de indicacoes
        INSERT INTO public.form_indicacoes (
          nome,
          telefone,
          telefone_formatado,
          parentesco,
          paciente_id,
          pergunta_id,
          created_at
        ) VALUES (
          indicacao->>'nome',
          COALESCE(indicacao->>'telefone', ''),
          phone_formatted,
          indicacao->>'parentesco',
          r.paciente_id,
          r.pergunta_id,
          r.created_at
        )
        ON CONFLICT DO NOTHING;
      END IF;
    END LOOP;
  END LOOP;
END $$;
