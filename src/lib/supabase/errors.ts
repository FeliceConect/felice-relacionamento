/**
 * Classificação de erros do Supabase para feedback honesto ao usuário.
 *
 * Neste app todas as tabelas liberam leitura/escrita para qualquer usuário
 * autenticado (política "Allow all for authenticated users"). Portanto uma
 * violação de RLS (42501) em produção significa que a requisição chegou como
 * anônima — ou seja, a sessão do navegador expirou ou foi revogada.
 */

interface SupabaseErrorLike {
  code?: string
  message?: string
  name?: string
  status?: number
}

/** PGRST301 = JWT expirado (PostgREST); 42501 = RLS negou (requisição anônima) */
const SESSION_ERROR_CODES = new Set(['PGRST301', '42501'])

function asErrorLike(error: unknown): SupabaseErrorLike | null {
  return error && typeof error === 'object' ? (error as SupabaseErrorLike) : null
}

export function isSessionError(error: unknown): boolean {
  const e = asErrorLike(error)
  if (!e) return false
  if (e.code && SESSION_ERROR_CODES.has(e.code)) return true
  if (e.status === 401) return true
  if (e.name === 'AuthSessionMissingError') return true
  if (typeof e.message === 'string' && /jwt|token|expired|session missing/i.test(e.message)) {
    return true
  }
  return false
}

/** Falha de rede/conexão (offline, DNS, timeout) — não é problema de sessão */
export function isNetworkError(error: unknown): boolean {
  const e = asErrorLike(error)
  if (!e) return false
  if (e.status === 0) return true
  if (e.name === 'AuthRetryableFetchError') return true
  if (typeof e.message === 'string' && /failed to fetch|network|load failed/i.test(e.message)) {
    return true
  }
  return false
}

/** Mensagem técnica do erro, para exibir junto do texto amigável */
export function getErrorDetail(error: unknown): string | null {
  const message = asErrorLike(error)?.message
  return typeof message === 'string' && message.length > 0 ? message : null
}
