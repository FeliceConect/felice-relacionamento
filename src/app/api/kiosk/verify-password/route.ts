import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const { password } = await request.json()

    if (!password) {
      return NextResponse.json(
        { success: false, error: 'Senha não informada' },
        { status: 400 }
      )
    }

    const supabase = await createServerSupabaseClient()

    // Buscar a senha configurada do kiosk
    const { data, error } = await supabase
      .from('form_configuracoes')
      .select('valor')
      .eq('chave', 'kiosk_password')
      .single()

    if (error) {
      console.error('Erro ao buscar configuração:', error)
      return NextResponse.json(
        { success: false, error: 'Erro interno' },
        { status: 500 }
      )
    }

    const kioskPassword = data?.valor || '1234' // Fallback padrão

    if (password === kioskPassword) {
      return NextResponse.json({ success: true })
    }

    return NextResponse.json(
      { success: false, error: 'Senha incorreta' },
      { status: 401 }
    )
  } catch (error) {
    console.error('Erro na verificação de senha:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno' },
      { status: 500 }
    )
  }
}
