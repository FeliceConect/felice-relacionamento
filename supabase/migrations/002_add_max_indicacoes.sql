-- Adiciona campo max_indicacoes na tabela form_perguntas
-- Para perguntas do tipo 'indicacoes', define quantas indicacoes o usuario pode adicionar

ALTER TABLE form_perguntas
ADD COLUMN IF NOT EXISTS max_indicacoes INTEGER DEFAULT 5;

-- Comentario para documentacao
COMMENT ON COLUMN form_perguntas.max_indicacoes IS 'Quantidade maxima de indicacoes permitidas para perguntas do tipo indicacoes';
