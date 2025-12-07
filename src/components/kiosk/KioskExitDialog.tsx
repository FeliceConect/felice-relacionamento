'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertCircle, Lock, LogOut } from 'lucide-react'

interface KioskExitDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function KioskExitDialog({ open, onOpenChange }: KioskExitDialogProps) {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/kiosk/verify-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })

      const data = await response.json()

      if (data.success) {
        onOpenChange(false)
        router.push('/login')
      } else {
        setError('Senha incorreta')
        setPassword('')
      }
    } catch {
      setError('Erro ao verificar senha')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setPassword('')
    setError('')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-butler text-cafe">
            <Lock className="w-5 h-5 text-dourado" />
            Sair do Modo Kiosk
          </DialogTitle>
          <DialogDescription className="font-sarabun text-cafe/70">
            Digite a senha de administrador para acessar o painel.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="kiosk-password" className="label-felice">
              Senha
            </Label>
            <Input
              id="kiosk-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Digite a senha"
              className="input-felice"
              autoFocus
              autoComplete="off"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-error text-sm font-sarabun">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1 border-nude text-cafe hover:bg-seda"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={!password || isLoading}
              className="flex-1 bg-dourado hover:bg-dourado-600 text-white"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Verificando...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <LogOut className="w-4 h-4" />
                  Acessar Painel
                </span>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
