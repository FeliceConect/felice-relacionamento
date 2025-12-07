'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect') || '/dashboard'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const supabase = createClient()

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        if (signInError.message.includes('Invalid login credentials')) {
          setError('E-mail ou senha incorretos')
        } else if (signInError.message.includes('Email not confirmed')) {
          setError('Por favor, confirme seu e-mail antes de fazer login')
        } else {
          setError(signInError.message)
        }
        return
      }

      // Redirecionar para a página solicitada ou dashboard
      router.push(redirectTo)
      router.refresh()
    } catch {
      setError('Ocorreu um erro ao fazer login. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="card-felice border-nude/30">
      <CardHeader className="space-y-1 text-center pb-6">
        <CardTitle className="font-butler text-2xl text-cafe">
          Bem-vindo de volta
        </CardTitle>
        <CardDescription className="font-sarabun text-cafe/70">
          Entre com suas credenciais para acessar o painel
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="label-felice">
              E-mail
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-nude" />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="input-felice pl-10"
                autoComplete="email"
                disabled={isLoading}
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="label-felice">
                Senha
              </Label>
              <Link
                href="/recuperar-senha"
                className="text-sm font-medium text-dourado hover:text-dourado-600 transition-colors"
              >
                Esqueceu a senha?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-nude" />
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input-felice pl-10"
                autoComplete="current-password"
                disabled={isLoading}
                required
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-error/10 text-error text-sm font-sarabun">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isLoading || !email || !password}
            className="w-full bg-dourado hover:bg-dourado-600 text-white font-sarabun font-medium py-3"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Entrando...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Entrar
                <ArrowRight className="h-4 w-4" />
              </span>
            )}
          </Button>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-nude/30" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-cafe/50 font-sarabun">
              Acesso restrito
            </span>
          </div>
        </div>

        {/* Back to Kiosk */}
        <Link href="/formulario">
          <Button
            variant="outline"
            className="w-full border-vinho/30 text-vinho hover:bg-vinho hover:text-white font-sarabun"
          >
            Voltar ao Modo Kiosk
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <Card className="card-felice border-nude/30">
        <CardContent className="py-16">
          <LoadingSpinner size="lg" text="Carregando..." />
        </CardContent>
      </Card>
    }>
      <LoginForm />
    </Suspense>
  )
}
