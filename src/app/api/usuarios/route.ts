import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

// GET - List all users
// Note: This route is protected by middleware, so only authenticated users can access it
export async function GET() {
  try {
    const adminClient = createAdminClient()

    const { data: authUsers, error: authError } = await adminClient.auth.admin.listUsers()

    if (authError) {
      console.error('Error listing users:', authError)
      return NextResponse.json({ error: 'Erro ao listar usuários' }, { status: 500 })
    }

    // Get equipe data to merge with auth users
    const { data: equipeData } = await adminClient
      .from('form_equipe')
      .select('*, nucleo:form_nucleos(*)')

    const equipeMap = new Map(equipeData?.map(e => [e.id, e]) || [])

    // Merge auth users with equipe data
    const usuarios = authUsers.users.map(authUser => {
      const equipe = equipeMap.get(authUser.id)
      return {
        id: authUser.id,
        email: authUser.email,
        created_at: authUser.created_at,
        last_sign_in_at: authUser.last_sign_in_at,
        equipe: equipe || {
          id: authUser.id,
          nome: authUser.email?.split('@')[0] || 'Sem nome',
          email: authUser.email,
          role: 'atendente',
          ativo: true,
          _missing: true, // Flag to indicate no form_equipe record
        },
      }
    })

    return NextResponse.json({ usuarios })
  } catch (error) {
    console.error('Error in GET /api/usuarios:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

// POST - Create new user
// Note: This route is protected by middleware, so only authenticated users can access it
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, nome, telefone, role } = body

    if (!email || !password || !nome) {
      return NextResponse.json(
        { error: 'Email, senha e nome são obrigatórios' },
        { status: 400 }
      )
    }

    // Verificar se service role key está configurada
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('SUPABASE_SERVICE_ROLE_KEY não está configurada')
      return NextResponse.json(
        { error: 'Configuração do servidor incompleta. Configure SUPABASE_SERVICE_ROLE_KEY no .env.local' },
        { status: 500 }
      )
    }

    const adminClient = createAdminClient()

    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
    })

    if (authError) {
      console.error('Error creating auth user:', authError)
      if (authError.message.includes('already been registered')) {
        return NextResponse.json({ error: 'Este email já está cadastrado' }, { status: 400 })
      }
      if (authError.message.includes('Invalid API key')) {
        return NextResponse.json({ error: 'Chave de API inválida. Verifique SUPABASE_SERVICE_ROLE_KEY' }, { status: 500 })
      }
      return NextResponse.json({ error: `Erro ao criar usuário: ${authError.message}` }, { status: 500 })
    }

    // Create entry in form_equipe
    const { error: equipeError } = await adminClient
      .from('form_equipe')
      .insert({
        id: authData.user.id,
        email,
        nome,
        telefone: telefone || null,
        nucleo_id: null,
        role: role || 'atendente',
        ativo: true,
      })

    if (equipeError) {
      console.error('Error creating equipe entry:', equipeError)
      // Try to delete the auth user if equipe creation fails
      await adminClient.auth.admin.deleteUser(authData.user.id)
      return NextResponse.json({ error: 'Erro ao salvar dados do usuário' }, { status: 500 })
    }

    return NextResponse.json({
      message: 'Usuário criado com sucesso',
      user: {
        id: authData.user.id,
        email: authData.user.email,
      }
    }, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/usuarios:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
