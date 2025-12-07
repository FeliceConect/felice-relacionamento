'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, Mail, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react'

export default function RecuperarSenhaPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const supabase = createClient()

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/redefinir-senha`,
      })

      if (resetError) {
        setError(resetError.message)
        return
      }

      setSuccess(true)
    } catch {
      setError('Ocorreu um erro ao enviar o e-mail. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <Card className="card-felice border-nude/30">
        <CardHeader className="space-y-1 text-center pb-6">
          <div className="mx-auto w-12 h-12 rounded-full bg-success/10 flex items-center justify-center mb-4">
            <CheckCircle2 className="h-6 w-6 text-success" />
          </div>
          <CardTitle className="font-butler text-2xl text-cafe">
            E-mail enviado!
          </CardTitle>
          <CardDescription className="font-sarabun text-cafe/70">
            Verifique sua caixa de entrada e siga as instruções para redefinir sua senha.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <p className="text-sm text-center text-cafe/60 font-sarabun">
            Não recebeu o e-mail? Verifique sua pasta de spam ou tente novamente.
          </p>

          <div className="flex flex-col gap-3">
            <Button
              onClick={() => setSuccess(false)}
              variant="outline"
              className="w-full border-dourado text-dourado hover:bg-dourado hover:text-white font-sarabun"
            >
              Tentar novamente
            </Button>

            <Link href="/login">
              <Button
                variant="ghost"
                className="w-full text-cafe/70 hover:text-cafe hover:bg-seda/50 font-sarabun"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar ao login
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="card-felice border-nude/30">
      <CardHeader className="space-y-1 text-center pb-6">
        <CardTitle className="font-butler text-2xl text-cafe">
          Esqueceu sua senha?
        </CardTitle>
        <CardDescription className="font-sarabun text-cafe/70">
          Digite seu e-mail e enviaremos instruções para redefinir sua senha.
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
            disabled={isLoading || !email}
            className="w-full bg-dourado hover:bg-dourado-600 text-white font-sarabun font-medium py-3"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Enviando...
              </span>
            ) : (
              'Enviar instruções'
            )}
          </Button>

          {/* Back to Login */}
          <Link href="/login">
            <Button
              variant="ghost"
              className="w-full text-cafe/70 hover:text-cafe hover:bg-seda/50 font-sarabun"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar ao login
            </Button>
          </Link>
        </form>
      </CardContent>
    </Card>
  )
}
