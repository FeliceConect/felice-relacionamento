'use client'

import { useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/lib/hooks/use-toast'
import { getErrorDetail, isNetworkError, isSessionError } from '@/lib/supabase/errors'

const LOGIN_REDIRECT_DELAY_MS = 2500
const SESSION_CHECK_TIMEOUT_MS = 8000

/**
 * Guarda de sessão para operações de gravação.
 *
 * - `ensureSession()`: chame no início de um handler de gravação; se a sessão
 *   expirou, avisa o usuário, manda para o login e retorna false.
 * - `handleMutationError(error, fallback)`: chame no catch; distingue sessão
 *   expirada de outros erros e mostra o detalhe técnico quando houver.
 */
export function useSessionGuard() {
  const { toast } = useToast()

  const redirectToLogin = useCallback(() => {
    toast({
      variant: 'destructive',
      title: 'Sessão expirada',
      description: 'Sua sessão expirou. Faça login novamente para continuar.',
    })
    // Preserva a página atual para o login devolver a pessoa ao mesmo lugar
    const returnTo = window.location.pathname + window.location.search
    setTimeout(() => {
      window.location.href = `/login?redirect=${encodeURIComponent(returnTo)}`
    }, LOGIN_REDIRECT_DELAY_MS)
  }, [toast])

  const ensureSession = useCallback(async (): Promise<boolean> => {
    const supabase = createClient()
    try {
      // getUser() vai à rede e renova o token automaticamente quando o refresh
      // token ainda é válido. O timeout evita que um clique fique pendurado
      // para sempre em conexão ruim.
      const timeout = new Promise<'timeout'>((resolve) =>
        setTimeout(() => resolve('timeout'), SESSION_CHECK_TIMEOUT_MS)
      )
      const result = await Promise.race([supabase.auth.getUser(), timeout])

      // Sem resposta a tempo: deixa a gravação tentar e o catch mostra o erro real
      if (result === 'timeout') return true

      if (result.data?.user) return true
      // Sem rede não dá para validar a sessão: mesma lógica do timeout
      if (result.error && isNetworkError(result.error)) return true

      redirectToLogin()
      return false
    } catch {
      redirectToLogin()
      return false
    }
  }, [redirectToLogin])

  const handleMutationError = useCallback(
    (error: unknown, fallbackMessage: string) => {
      if (isSessionError(error)) {
        redirectToLogin()
        return
      }
      const detail = getErrorDetail(error)
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: detail ? `${fallbackMessage} Detalhe: ${detail}` : fallbackMessage,
      })
    },
    [redirectToLogin, toast]
  )

  return { ensureSession, handleMutationError }
}
