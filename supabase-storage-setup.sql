-- =====================================================
-- SQL para configurar o Supabase Storage para imagens
-- Execute este script no SQL Editor do Supabase
-- =====================================================

-- 1. Criar o bucket para imagens das perguntas
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'perguntas-imagens',
  'perguntas-imagens',
  true,  -- bucket público para exibir imagens
  5242880,  -- limite de 5MB por arquivo
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

-- 2. Política para permitir leitura pública das imagens
CREATE POLICY "Imagens das perguntas são públicas" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'perguntas-imagens');

-- 3. Política para permitir upload por usuários autenticados
CREATE POLICY "Usuários autenticados podem fazer upload" ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'perguntas-imagens'
    AND auth.role() = 'authenticated'
  );

-- 4. Política para permitir atualização por usuários autenticados
CREATE POLICY "Usuários autenticados podem atualizar" ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'perguntas-imagens'
    AND auth.role() = 'authenticated'
  );

-- 5. Política para permitir exclusão por usuários autenticados
CREATE POLICY "Usuários autenticados podem excluir" ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'perguntas-imagens'
    AND auth.role() = 'authenticated'
  );

-- =====================================================
-- IMPORTANTE: Se você receber erro de "policy already exists",
-- execute os comandos abaixo para remover as políticas antigas
-- e depois execute o script novamente:
-- =====================================================
-- DROP POLICY IF EXISTS "Imagens das perguntas são públicas" ON storage.objects;
-- DROP POLICY IF EXISTS "Usuários autenticados podem fazer upload" ON storage.objects;
-- DROP POLICY IF EXISTS "Usuários autenticados podem atualizar" ON storage.objects;
-- DROP POLICY IF EXISTS "Usuários autenticados podem excluir" ON storage.objects;
