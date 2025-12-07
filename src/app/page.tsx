import { redirect } from 'next/navigation'

/**
 * Página inicial - Redireciona para login
 */
export default function HomePage() {
  redirect('/login')
}
