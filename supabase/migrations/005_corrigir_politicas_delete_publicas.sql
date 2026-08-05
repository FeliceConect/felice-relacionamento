-- Corrige politicas de DELETE abertas ao publico (role PUBLIC, inclui anon).
--
-- PROBLEMA: as politicas "Permitir delete de ..." usam USING (true) e valem para
-- PUBLIC, ou seja, qualquer pessoa com a chave anon (que fica exposta no bundle
-- JavaScript do navegador) pode apagar pacientes, respostas e interesses.
-- Confirmado em producao: um DELETE anonimo em form_pacientes retorna HTTP 200
-- em vez de ser bloqueado pelo RLS.
--
-- CUIDADO AO APLICAR: em form_pacientes, form_respostas e form_interesses a
-- politica aberta e a UNICA que permite DELETE. Se ela for apenas removida, os
-- administradores tambem perdem a exclusao. Por isso cada DROP abaixo vem com um
-- CREATE equivalente restrito a usuarios autenticados.
--
-- form_followups e form_conversoes ja possuem a politica "Admin acesso total"
-- (FOR ALL, authenticated), que cobre DELETE — nesses casos basta remover.

-- 1. Tabelas que ja tem politica FOR ALL para authenticated: apenas remover a aberta
DROP POLICY IF EXISTS "Permitir delete de followups" ON public.form_followups;
DROP POLICY IF EXISTS "Permitir delete de conversoes" ON public.form_conversoes;

-- 2. Tabelas sem outra politica de DELETE: substituir por versao autenticada
DROP POLICY IF EXISTS "Permitir delete de pacientes" ON public.form_pacientes;
CREATE POLICY "Autenticados podem excluir pacientes" ON public.form_pacientes
  FOR DELETE TO authenticated USING (true);

DROP POLICY IF EXISTS "Permitir delete de respostas" ON public.form_respostas;
CREATE POLICY "Autenticados podem excluir respostas" ON public.form_respostas
  FOR DELETE TO authenticated USING (true);

DROP POLICY IF EXISTS "Permitir delete de interesses" ON public.form_interesses;
CREATE POLICY "Autenticados podem excluir interesses" ON public.form_interesses
  FOR DELETE TO authenticated USING (true);
