import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

// PUT - Update user
// Note: This route is protected by middleware, so only authenticated users can access it
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { email, password, nome, telefone, role, ativo } = body

    const adminClient = createAdminClient()

    // Update auth user if email or password changed
    const authUpdates: { email?: string; password?: string } = {}
    if (email) authUpdates.email = email
    if (password) authUpdates.password = password

    if (Object.keys(authUpdates).length > 0) {
      const { error: authError } = await adminClient.auth.admin.updateUserById(id, authUpdates)
      if (authError) {
        console.error('Error updating auth user:', authError)
        if (authError.message.includes('already been registered')) {
          return NextResponse.json({ error: 'Este email já está em uso' }, { status: 400 })
        }
        return NextResponse.json({ error: 'Erro ao atualizar credenciais' }, { status: 500 })
      }
    }

    // Update or create equipe entry
    const equipeUpdates: Record<string, unknown> = {}
    if (email) equipeUpdates.email = email
    if (nome !== undefined) equipeUpdates.nome = nome
    if (telefone !== undefined) equipeUpdates.telefone = telefone
    if (role !== undefined) equipeUpdates.role = role
    if (ativo !== undefined) equipeUpdates.ativo = ativo

    if (Object.keys(equipeUpdates).length > 0) {
      // Check if equipe record exists
      const { data: existingEquipe } = await adminClient
        .from('form_equipe')
        .select('id')
        .eq('id', id)
        .single()

      if (existingEquipe) {
        // Update existing record
        const { error: equipeError } = await adminClient
          .from('form_equipe')
          .update(equipeUpdates)
          .eq('id', id)

        if (equipeError) {
          console.error('Error updating equipe:', equipeError)
          return NextResponse.json({ error: 'Erro ao atualizar dados do usuário' }, { status: 500 })
        }
      } else {
        // Create new record
        const { error: equipeError } = await adminClient
          .from('form_equipe')
          .insert({
            id,
            email: email || '',
            nome: nome || 'Sem nome',
            telefone: telefone || null,
            role: role || 'atendente',
            ativo: ativo !== undefined ? ativo : true,
            nucleo_id: null,
          })

        if (equipeError) {
          console.error('Error creating equipe:', equipeError)
          return NextResponse.json({ error: 'Erro ao criar dados do usuário' }, { status: 500 })
        }
      }
    }

    return NextResponse.json({ message: 'Usuário atualizado com sucesso' })
  } catch (error) {
    console.error('Error in PUT /api/usuarios/[id]:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

// DELETE - Delete user
// Note: This route is protected by middleware, so only authenticated users can access it
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const adminClient = createAdminClient()

    // Delete from form_equipe first
    const { error: equipeError } = await adminClient
      .from('form_equipe')
      .delete()
      .eq('id', id)

    if (equipeError) {
      console.error('Error deleting equipe:', equipeError)
    }

    // Delete from auth
    const { error: authError } = await adminClient.auth.admin.deleteUser(id)

    if (authError) {
      console.error('Error deleting auth user:', authError)
      return NextResponse.json({ error: 'Erro ao excluir usuário' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Usuário excluído com sucesso' })
  } catch (error) {
    console.error('Error in DELETE /api/usuarios/[id]:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
