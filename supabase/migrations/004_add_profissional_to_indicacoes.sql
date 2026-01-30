-- Adicionar campo profissional_id na tabela de indicações
ALTER TABLE public.form_indicacoes
ADD COLUMN IF NOT EXISTS profissional_id UUID REFERENCES public.form_profissionais(id) ON DELETE SET NULL;

-- Índice para buscas por profissional
CREATE INDEX IF NOT EXISTS idx_indicacoes_profissional ON public.form_indicacoes(profissional_id);

-- Atualizar a view para incluir o nome do profissional
DROP VIEW IF EXISTS public.form_indicacoes_view;

CREATE VIEW public.form_indicacoes_view AS
SELECT
  i.id,
  i.nome,
  i.telefone,
  i.telefone_formatado,
  i.parentesco,
  i.paciente_id,
  i.pergunta_id,
  i.profissional_id,
  i.created_at,
  i.updated_at,
  p.nome AS indicado_por_nome,
  p.whatsapp AS indicado_por_whatsapp,
  prof.nome AS profissional_nome,
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
LEFT JOIN public.form_profissionais prof ON i.profissional_id = prof.id
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
