'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Send, Loader2, User, Phone } from 'lucide-react'

interface FormularioContactProps {
  nome: string
  whatsapp: string
  isSubmitting: boolean
  error: string | null
  canSubmit: boolean
  onNomeChange: (nome: string) => void
  onWhatsappChange: (whatsapp: string) => void
  onSubmit: () => void
  onPrev: () => void
}

export function FormularioContact({
  nome,
  whatsapp: _whatsapp,
  isSubmitting,
  error,
  canSubmit,
  onNomeChange,
  onWhatsappChange,
  onSubmit,
  onPrev,
}: FormularioContactProps) {
  // _whatsapp é usado apenas para validação no componente pai
  void _whatsapp
  const [whatsappDisplay, setWhatsappDisplay] = useState('')

  const handleWhatsappChange = (value: string) => {
    // Formatar para exibição
    const cleaned = value.replace(/\D/g, '')
    let formatted = ''

    if (cleaned.length <= 2) {
      formatted = cleaned
    } else if (cleaned.length <= 7) {
      formatted = `(${cleaned.slice(0, 2)}) ${cleaned.slice(2)}`
    } else if (cleaned.length <= 11) {
      formatted = `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`
    } else {
      formatted = `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7, 11)}`
    }

    setWhatsappDisplay(formatted)
    onWhatsappChange(value)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (canSubmit) {
      onSubmit()
    }
  }

  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-success/10 mb-6"
          >
            <Phone className="w-8 h-8 text-success" />
          </motion.div>

          <h2 className="font-butler text-2xl md:text-3xl text-cafe">
            Quase lá!
          </h2>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nome */}
          <div className="space-y-2">
            <Label htmlFor="nome" className="label-felice">
              Nome completo
            </Label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-nude" />
              <Input
                id="nome"
                type="text"
                value={nome}
                onChange={(e) => onNomeChange(e.target.value)}
                placeholder="Digite seu nome"
                className="input-felice pl-12 py-4 text-base"
                autoComplete="name"
                disabled={isSubmitting}
                required
              />
            </div>
          </div>

          {/* WhatsApp */}
          <div className="space-y-2">
            <Label htmlFor="whatsapp" className="label-felice">
              WhatsApp
            </Label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-nude" />
              <Input
                id="whatsapp"
                type="tel"
                value={whatsappDisplay}
                onChange={(e) => handleWhatsappChange(e.target.value)}
                placeholder="(00) 00000-0000"
                className="input-felice pl-12 py-4 text-base"
                autoComplete="tel"
                disabled={isSubmitting}
                maxLength={15}
                required
              />
            </div>
            <p className="font-sarabun text-xs text-cafe/50">
              Entraremos em contato pelo WhatsApp
            </p>
          </div>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 rounded-lg bg-error/10 text-error text-sm font-sarabun text-center"
            >
              {error}
            </motion.div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between gap-4 pt-4">
            <Button
              type="button"
              onClick={onPrev}
              variant="ghost"
              disabled={isSubmitting}
              className="text-cafe/70 hover:text-cafe hover:bg-seda/50 font-sarabun"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>

            <Button
              type="submit"
              disabled={!canSubmit}
              className="bg-dourado hover:bg-dourado-600 text-white font-sarabun px-8"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  Enviar
                  <Send className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </form>

        {/* Privacy note */}
        <p className="font-sarabun text-xs text-cafe/50 text-center mt-8">
          Seus dados são protegidos e não serão compartilhados com terceiros.
        </p>
      </motion.div>
    </div>
  )
}
