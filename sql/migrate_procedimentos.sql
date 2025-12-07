-- Migration: Converter procedimentos de text[] para jsonb com objetos {nome, descricao}
-- Execute este SQL no Supabase SQL Editor

-- Passo 1: Alterar o tipo da coluna de text[] para jsonb
ALTER TABLE form_profissionais
ALTER COLUMN procedimentos TYPE jsonb
USING to_jsonb(procedimentos);

-- Passo 2: Migrar dados existentes - converte strings para objetos {nome, descricao}
UPDATE form_profissionais
SET procedimentos = (
  SELECT jsonb_agg(
    jsonb_build_object('nome', elem, 'descricao', '')
  )
  FROM jsonb_array_elements_text(procedimentos) AS elem
)
WHERE procedimentos IS NOT NULL
  AND jsonb_array_length(procedimentos) > 0;

-- Verificar resultado
SELECT id, nome, procedimentos FROM form_profissionais;
