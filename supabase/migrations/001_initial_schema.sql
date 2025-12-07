-- ============================================
-- Felice Endomarketing - Schema Inicial
-- Migration 001 - Criação das tabelas base
-- ============================================

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- Tabela: form_nucleos
-- Núcleos/especialidades do Complexo Felice
-- ============================================
CREATE TABLE IF NOT EXISTS form_nucleos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  descricao TEXT,
  icone VARCHAR(50),
  cor VARCHAR(20),
  ativo BOOLEAN DEFAULT true,
  ordem INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para form_nucleos
CREATE INDEX idx_nucleos_slug ON form_nucleos(slug);
CREATE INDEX idx_nucleos_ativo ON form_nucleos(ativo);
CREATE INDEX idx_nucleos_ordem ON form_nucleos(ordem);

-- ============================================
-- Tabela: form_profissionais
-- Profissionais/médicos de cada núcleo
-- ============================================
CREATE TABLE IF NOT EXISTS form_profissionais (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome VARCHAR(150) NOT NULL,
  especialidade VARCHAR(100),
  crm VARCHAR(20),
  descricao TEXT,
  foto_url TEXT,
  nucleo_id UUID REFERENCES form_nucleos(id) ON DELETE SET NULL,
  procedimentos TEXT[],
  instagram VARCHAR(100),
  ativo BOOLEAN DEFAULT true,
  ordem INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para form_profissionais
CREATE INDEX idx_profissionais_nucleo ON form_profissionais(nucleo_id);
CREATE INDEX idx_profissionais_ativo ON form_profissionais(ativo);
CREATE INDEX idx_profissionais_ordem ON form_profissionais(ordem);

-- ============================================
-- Tabela: form_perguntas
-- Perguntas do formulário de interesses
-- ============================================
CREATE TABLE IF NOT EXISTS form_perguntas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  titulo VARCHAR(255) NOT NULL,
  subtitulo TEXT,
  nucleo_id UUID REFERENCES form_nucleos(id) ON DELETE SET NULL,
  tipo VARCHAR(30) DEFAULT 'multipla_escolha', -- multipla_escolha, texto, telefone
  imagem_url TEXT,
  multipla_selecao BOOLEAN DEFAULT false,
  obrigatoria BOOLEAN DEFAULT true,
  ativo BOOLEAN DEFAULT true,
  ordem INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para form_perguntas
CREATE INDEX idx_perguntas_nucleo ON form_perguntas(nucleo_id);
CREATE INDEX idx_perguntas_ativo ON form_perguntas(ativo);
CREATE INDEX idx_perguntas_ordem ON form_perguntas(ordem);
CREATE INDEX idx_perguntas_tipo ON form_perguntas(tipo);

-- ============================================
-- Tabela: form_opcoes
-- Opções de resposta para perguntas
-- ============================================
CREATE TABLE IF NOT EXISTS form_opcoes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pergunta_id UUID NOT NULL REFERENCES form_perguntas(id) ON DELETE CASCADE,
  texto VARCHAR(255) NOT NULL,
  letra VARCHAR(5),
  ordem INTEGER DEFAULT 0,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para form_opcoes
CREATE INDEX idx_opcoes_pergunta ON form_opcoes(pergunta_id);
CREATE INDEX idx_opcoes_ordem ON form_opcoes(ordem);

-- ============================================
-- Tabela: form_pacientes
-- Leads/pacientes que preencheram o formulário
-- ============================================
CREATE TABLE IF NOT EXISTS form_pacientes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome VARCHAR(150) NOT NULL,
  whatsapp VARCHAR(20) NOT NULL,
  whatsapp_formatado VARCHAR(20),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para form_pacientes
CREATE INDEX idx_pacientes_whatsapp ON form_pacientes(whatsapp);
CREATE INDEX idx_pacientes_created ON form_pacientes(created_at DESC);

-- ============================================
-- Tabela: form_respostas
-- Respostas dos pacientes às perguntas
-- ============================================
CREATE TABLE IF NOT EXISTS form_respostas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  paciente_id UUID NOT NULL REFERENCES form_pacientes(id) ON DELETE CASCADE,
  pergunta_id UUID NOT NULL REFERENCES form_perguntas(id) ON DELETE CASCADE,
  opcao_id UUID REFERENCES form_opcoes(id) ON DELETE SET NULL,
  resposta_texto TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para form_respostas
CREATE INDEX idx_respostas_paciente ON form_respostas(paciente_id);
CREATE INDEX idx_respostas_pergunta ON form_respostas(pergunta_id);
CREATE INDEX idx_respostas_opcao ON form_respostas(opcao_id);

-- ============================================
-- Tabela: form_interesses
-- Interesses calculados por núcleo
-- ============================================
CREATE TABLE IF NOT EXISTS form_interesses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  paciente_id UUID NOT NULL REFERENCES form_pacientes(id) ON DELETE CASCADE,
  nucleo_id UUID NOT NULL REFERENCES form_nucleos(id) ON DELETE CASCADE,
  quantidade_respostas INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(paciente_id, nucleo_id)
);

-- Índices para form_interesses
CREATE INDEX idx_interesses_paciente ON form_interesses(paciente_id);
CREATE INDEX idx_interesses_nucleo ON form_interesses(nucleo_id);

-- ============================================
-- Tabela: form_templates
-- Templates de mensagens para follow-up
-- ============================================
CREATE TABLE IF NOT EXISTS form_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nucleo_id UUID REFERENCES form_nucleos(id) ON DELETE SET NULL,
  titulo VARCHAR(150) NOT NULL,
  conteudo TEXT NOT NULL,
  tipo VARCHAR(20) DEFAULT 'texto', -- texto, imagem, video
  arquivo_url TEXT,
  tempo_envio VARCHAR(50), -- Ex: "imediato", "1_hora", "1_dia"
  ordem INTEGER DEFAULT 0,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para form_templates
CREATE INDEX idx_templates_nucleo ON form_templates(nucleo_id);
CREATE INDEX idx_templates_ativo ON form_templates(ativo);
CREATE INDEX idx_templates_tipo ON form_templates(tipo);

-- ============================================
-- Tabela: form_followups
-- Histórico de follow-ups enviados
-- ============================================
CREATE TABLE IF NOT EXISTS form_followups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  paciente_id UUID NOT NULL REFERENCES form_pacientes(id) ON DELETE CASCADE,
  nucleo_id UUID REFERENCES form_nucleos(id) ON DELETE SET NULL,
  template_id UUID REFERENCES form_templates(id) ON DELETE SET NULL,
  tipo_contato VARCHAR(30) DEFAULT 'whatsapp', -- whatsapp, ligacao, email
  conteudo_enviado TEXT,
  arquivo_url TEXT,
  data_envio TIMESTAMPTZ DEFAULT NOW(),
  data_agendada TIMESTAMPTZ,
  status VARCHAR(30) DEFAULT 'enviado', -- enviado, agendado, falhou
  observacoes TEXT,
  enviado_por UUID, -- Referência ao usuário da equipe
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para form_followups
CREATE INDEX idx_followups_paciente ON form_followups(paciente_id);
CREATE INDEX idx_followups_nucleo ON form_followups(nucleo_id);
CREATE INDEX idx_followups_data ON form_followups(data_envio DESC);
CREATE INDEX idx_followups_status ON form_followups(status);

-- ============================================
-- Tabela: form_conversoes
-- Registro de conversões (pacientes que agendaram)
-- ============================================
CREATE TABLE IF NOT EXISTS form_conversoes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  paciente_id UUID NOT NULL REFERENCES form_pacientes(id) ON DELETE CASCADE,
  nucleo_id UUID NOT NULL REFERENCES form_nucleos(id) ON DELETE CASCADE,
  procedimento VARCHAR(150),
  valor DECIMAL(10, 2),
  data_conversao DATE DEFAULT CURRENT_DATE,
  observacoes TEXT,
  registrado_por UUID, -- Referência ao usuário da equipe
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para form_conversoes
CREATE INDEX idx_conversoes_paciente ON form_conversoes(paciente_id);
CREATE INDEX idx_conversoes_nucleo ON form_conversoes(nucleo_id);
CREATE INDEX idx_conversoes_data ON form_conversoes(data_conversao DESC);

-- ============================================
-- Tabela: form_equipe
-- Usuários da equipe (vinculado ao Supabase Auth)
-- ============================================
CREATE TABLE IF NOT EXISTS form_equipe (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome VARCHAR(150) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  telefone VARCHAR(20),
  nucleo_id UUID REFERENCES form_nucleos(id) ON DELETE SET NULL,
  role VARCHAR(20) DEFAULT 'atendente', -- admin, gerente, atendente
  avatar_url TEXT,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para form_equipe
CREATE INDEX idx_equipe_email ON form_equipe(email);
CREATE INDEX idx_equipe_nucleo ON form_equipe(nucleo_id);
CREATE INDEX idx_equipe_role ON form_equipe(role);
CREATE INDEX idx_equipe_ativo ON form_equipe(ativo);

-- ============================================
-- Tabela: form_configuracoes
-- Configurações gerais do sistema
-- ============================================
CREATE TABLE IF NOT EXISTS form_configuracoes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chave VARCHAR(100) NOT NULL UNIQUE,
  valor TEXT,
  tipo VARCHAR(20) DEFAULT 'string', -- string, number, boolean, json
  descricao TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para form_configuracoes
CREATE INDEX idx_configuracoes_chave ON form_configuracoes(chave);

-- ============================================
-- Triggers para updated_at automático
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger nas tabelas que têm updated_at
CREATE TRIGGER update_nucleos_updated_at
  BEFORE UPDATE ON form_nucleos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profissionais_updated_at
  BEFORE UPDATE ON form_profissionais
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_perguntas_updated_at
  BEFORE UPDATE ON form_perguntas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pacientes_updated_at
  BEFORE UPDATE ON form_pacientes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_templates_updated_at
  BEFORE UPDATE ON form_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_equipe_updated_at
  BEFORE UPDATE ON form_equipe
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_configuracoes_updated_at
  BEFORE UPDATE ON form_configuracoes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Views para facilitar consultas
-- ============================================

-- View de leads com status calculado
CREATE OR REPLACE VIEW form_leads_view AS
SELECT
  p.id,
  p.nome,
  p.whatsapp,
  p.created_at,
  COALESCE(COUNT(DISTINCT f.id), 0) AS total_followups,
  CASE
    WHEN EXISTS(SELECT 1 FROM form_conversoes c WHERE c.paciente_id = p.id) THEN 'convertido'
    WHEN COALESCE(COUNT(DISTINCT f.id), 0) = 0 THEN 'aguardando'
    WHEN COALESCE(COUNT(DISTINCT f.id), 0) = 1 THEN '1_mensagem'
    WHEN COALESCE(COUNT(DISTINCT f.id), 0) = 2 THEN '2_mensagens'
    ELSE '3_mais_mensagens'
  END AS status,
  EXISTS(SELECT 1 FROM form_conversoes c WHERE c.paciente_id = p.id) AS convertido,
  (SELECT n.nome FROM form_conversoes c
   JOIN form_nucleos n ON c.nucleo_id = n.id
   WHERE c.paciente_id = p.id
   ORDER BY c.data_conversao DESC LIMIT 1) AS nucleo_convertido,
  (SELECT c.data_conversao FROM form_conversoes c
   WHERE c.paciente_id = p.id
   ORDER BY c.data_conversao DESC LIMIT 1) AS data_conversao
FROM form_pacientes p
LEFT JOIN form_followups f ON p.id = f.paciente_id
GROUP BY p.id, p.nome, p.whatsapp, p.created_at;

-- View de dashboard por núcleo
CREATE OR REPLACE VIEW form_dashboard_view AS
SELECT
  n.id AS nucleo_id,
  n.nome AS nucleo_nome,
  n.slug AS nucleo_slug,
  COALESCE(COUNT(DISTINCT i.paciente_id), 0) AS total_interessados,
  COALESCE(COUNT(DISTINCT f.id), 0) AS total_followups,
  COALESCE(COUNT(DISTINCT c.id), 0) AS total_conversoes,
  CASE
    WHEN COALESCE(COUNT(DISTINCT i.paciente_id), 0) = 0 THEN 0
    ELSE ROUND((COALESCE(COUNT(DISTINCT c.id), 0)::DECIMAL / COALESCE(COUNT(DISTINCT i.paciente_id), 0)) * 100, 2)
  END AS taxa_conversao
FROM form_nucleos n
LEFT JOIN form_interesses i ON n.id = i.nucleo_id
LEFT JOIN form_followups f ON n.id = f.nucleo_id
LEFT JOIN form_conversoes c ON n.id = c.nucleo_id
WHERE n.ativo = true
GROUP BY n.id, n.nome, n.slug;

-- ============================================
-- Row Level Security (RLS)
-- ============================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE form_nucleos ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_profissionais ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_perguntas ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_opcoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_pacientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_respostas ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_interesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_followups ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_conversoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_equipe ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_configuracoes ENABLE ROW LEVEL SECURITY;

-- Políticas para acesso público (kiosk) - apenas leitura em dados públicos
CREATE POLICY "Nucleos visíveis publicamente" ON form_nucleos
  FOR SELECT USING (ativo = true);

CREATE POLICY "Profissionais visíveis publicamente" ON form_profissionais
  FOR SELECT USING (ativo = true);

CREATE POLICY "Perguntas ativas visíveis publicamente" ON form_perguntas
  FOR SELECT USING (ativo = true);

CREATE POLICY "Opcoes de perguntas ativas visíveis" ON form_opcoes
  FOR SELECT USING (
    ativo = true AND
    EXISTS(SELECT 1 FROM form_perguntas p WHERE p.id = form_opcoes.pergunta_id AND p.ativo = true)
  );

-- Políticas para inserção pública (kiosk submissão)
CREATE POLICY "Pacientes podem ser criados publicamente" ON form_pacientes
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Respostas podem ser criadas publicamente" ON form_respostas
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Interesses podem ser criados publicamente" ON form_interesses
  FOR INSERT WITH CHECK (true);

-- Políticas para usuários autenticados (admin)
CREATE POLICY "Admin acesso total nucleos" ON form_nucleos
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Admin acesso total profissionais" ON form_profissionais
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Admin acesso total perguntas" ON form_perguntas
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Admin acesso total opcoes" ON form_opcoes
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Admin leitura pacientes" ON form_pacientes
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admin leitura respostas" ON form_respostas
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admin leitura interesses" ON form_interesses
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admin acesso total templates" ON form_templates
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Admin acesso total followups" ON form_followups
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Admin acesso total conversoes" ON form_conversoes
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Admin acesso total equipe" ON form_equipe
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Admin acesso total configuracoes" ON form_configuracoes
  FOR ALL USING (auth.role() = 'authenticated');

-- ============================================
-- Dados iniciais
-- ============================================

-- Inserir configuração de senha do kiosk
INSERT INTO form_configuracoes (chave, valor, tipo, descricao) VALUES
  ('kiosk_password', '1234', 'string', 'Senha para sair do modo kiosk'),
  ('kiosk_timeout_minutes', '5', 'number', 'Tempo de inatividade antes de resetar o kiosk'),
  ('empresa_nome', 'Complexo Felice', 'string', 'Nome da empresa'),
  ('empresa_whatsapp', '5534999999999', 'string', 'WhatsApp principal da empresa')
ON CONFLICT (chave) DO NOTHING;

-- Inserir núcleos iniciais
INSERT INTO form_nucleos (nome, slug, descricao, icone, cor, ordem) VALUES
  ('Cirurgia Plástica', 'cirurgia-plastica', 'Procedimentos de cirurgia plástica estética e reparadora', 'Scissors', '#663739', 1),
  ('Dermatologia', 'dermatologia', 'Tratamentos dermatológicos e estéticos para pele', 'Sparkles', '#c29863', 2),
  ('Ginecologia', 'ginecologia', 'Saúde íntima feminina e procedimentos ginecológicos', 'Heart', '#ae9b89', 3),
  ('Nutrologia', 'nutrologia', 'Emagrecimento, nutrição e saúde metabólica', 'Apple', '#4ade80', 4)
ON CONFLICT DO NOTHING;
