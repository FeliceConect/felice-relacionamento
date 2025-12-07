/**
 * Script para definir um usuário como administrador
 * Execute com: npx tsx scripts/set-admin.ts
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import path from 'path'

// Carregar variáveis de ambiente
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Erro: Variáveis de ambiente não configuradas')
  console.error('Certifique-se de que NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY estão no .env.local')
  process.exit(1)
}

const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

async function setUserAsAdmin(email: string) {
  console.log(`Buscando usuário com email: ${email}...`)

  // Buscar o usuário no auth
  const { data: authUsers, error: listError } = await adminClient.auth.admin.listUsers()

  if (listError) {
    console.error('Erro ao listar usuários:', listError)
    process.exit(1)
  }

  const user = authUsers.users.find(u => u.email === email)

  if (!user) {
    console.error(`Usuário com email ${email} não encontrado`)
    process.exit(1)
  }

  console.log(`Usuário encontrado: ${user.id}`)

  // Verificar se já existe registro em form_equipe
  const { data: existingEquipe } = await adminClient
    .from('form_equipe')
    .select('*')
    .eq('id', user.id)
    .single()

  if (existingEquipe) {
    console.log('Registro form_equipe existente, atualizando para admin...')
    const { error: updateError } = await adminClient
      .from('form_equipe')
      .update({
        role: 'admin',
        nome: existingEquipe.nome || 'Administrador Felice',
      })
      .eq('id', user.id)

    if (updateError) {
      console.error('Erro ao atualizar:', updateError)
      process.exit(1)
    }
  } else {
    console.log('Criando novo registro form_equipe como admin...')
    const { error: insertError } = await adminClient
      .from('form_equipe')
      .insert({
        id: user.id,
        email: email,
        nome: 'Administrador Felice',
        role: 'admin',
        ativo: true,
        nucleo_id: null,
        telefone: null,
      })

    if (insertError) {
      console.error('Erro ao criar registro:', insertError)
      process.exit(1)
    }
  }

  console.log(`\nUsuário ${email} definido como administrador com sucesso!`)
  console.log('Faça logout e login novamente para aplicar as alterações.')
}

// Executar para felicemed@gmail.com
setUserAsAdmin('felicemed@gmail.com')
