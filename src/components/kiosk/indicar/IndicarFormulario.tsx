'use client'

import { motion } from 'framer-motion'
import { ArrowLeft, Send, Plus, X, User, Phone, Users } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { GRAUS_PARENTESCO, type Indicacao } from '@/lib/utils/constants'

interface IndicarFormularioProps {
  indicacoes: Indicacao[]
  indicacoesPreenchidas: number
  isSubmitting: boolean
  error: string | null
  canSubmit: boolean
  onUpdateIndicacao: (index: number, field: keyof Indicacao, value: string) => void
  onAddIndicacao: () => void
  onRemoveIndicacao: (index: number) => void
  onSubmit: () => void
  onBack: () => void
}

export function IndicarFormulario({
  indicacoes,
  indicacoesPreenchidas,
  isSubmitting,
  error,
  canSubmit,
  onUpdateIndicacao,
  onAddIndicacao,
  onRemoveIndicacao,
  onSubmit,
  onBack,
}: IndicarFormularioProps) {
  const formatPhone = (value: string) => {
    const cleaned = value.replace(/\D/g, '')
    if (cleaned.length <= 2) return cleaned
    if (cleaned.length <= 7) return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2)}`
    if (cleaned.length <= 11) return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7, 11)}`
  }

  const handlePhoneChange = (index: number, value: string) => {
    const formatted = formatPhone(value)
    onUpdateIndicacao(index, 'telefone', formatted)
  }

  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col px-4 md:px-6 py-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-6"
      >
        <h1 className="font-butler text-2xl md:text-3xl text-cafe mb-2">
          Suas Indicações
        </h1>
        <p className="font-sarabun text-cafe/70">
          <span className="text-dourado font-medium">{indicacoesPreenchidas}</span> de{' '}
          {indicacoes.length} indicações preenchidas
        </p>
      </motion.div>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 font-sarabun text-center"
        >
          {error}
        </motion.div>
      )}

      {/* Scrollable Form Area */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-[calc(100vh-320px)]">
          <div className="space-y-4 pr-4">
            {indicacoes.map((indicacao, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                className="relative p-4 rounded-xl border-2 border-nude/30 bg-white"
              >
                {/* Card Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-dourado/10 flex items-center justify-center">
                      <span className="font-butler text-sm text-dourado">
                        {index + 1}
                      </span>
                    </div>
                    <span className="font-sarabun text-sm text-cafe/60">
                      Indicação {index + 1}
                    </span>
                  </div>
                  {indicacoes.length > 1 && (
                    <button
                      type="button"
                      onClick={() => onRemoveIndicacao(index)}
                      className="p-2 rounded-full hover:bg-red-50 text-cafe/40 hover:text-red-500 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {/* Form Fields */}
                <div className="space-y-3">
                  {/* Nome */}
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-cafe/40" />
                    <Input
                      type="text"
                      placeholder="Nome da pessoa"
                      value={indicacao.nome}
                      onChange={(e) => onUpdateIndicacao(index, 'nome', e.target.value)}
                      className="pl-10 py-5 font-sarabun bg-seda/20 border-nude/30 focus:border-dourado focus:ring-dourado/20"
                    />
                  </div>

                  {/* Telefone */}
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-cafe/40" />
                    <Input
                      type="tel"
                      placeholder="Telefone/WhatsApp"
                      value={indicacao.telefone}
                      onChange={(e) => handlePhoneChange(index, e.target.value)}
                      className="pl-10 py-5 font-sarabun bg-seda/20 border-nude/30 focus:border-dourado focus:ring-dourado/20"
                    />
                  </div>

                  {/* Parentesco */}
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-cafe/40 z-10 pointer-events-none" />
                    <Select
                      value={indicacao.parentesco}
                      onValueChange={(value) => onUpdateIndicacao(index, 'parentesco', value)}
                    >
                      <SelectTrigger className="pl-10 py-5 font-sarabun bg-seda/20 border-nude/30 focus:border-dourado focus:ring-dourado/20 h-auto">
                        <SelectValue placeholder="Qual a relação?" />
                      </SelectTrigger>
                      <SelectContent>
                        {GRAUS_PARENTESCO.map((grau) => (
                          <SelectItem key={grau} value={grau} className="font-sarabun">
                            {grau}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Add More Button */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              onClick={onAddIndicacao}
              className="w-full p-4 rounded-xl border-2 border-dashed border-dourado/30 bg-dourado/5 hover:bg-dourado/10 hover:border-dourado/50 transition-all flex items-center justify-center gap-2 text-dourado font-sarabun"
            >
              <Plus className="h-5 w-5" />
              Adicionar mais uma indicação
            </motion.button>
          </div>
        </ScrollArea>
      </div>

      {/* Footer Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-6 flex flex-col sm:flex-row gap-3"
      >
        <Button
          variant="outline"
          onClick={onBack}
          disabled={isSubmitting}
          className="py-6 text-lg font-sarabun border-nude hover:bg-seda/30 sm:flex-1"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Voltar
        </Button>
        <Button
          onClick={onSubmit}
          disabled={!canSubmit}
          className="py-6 text-lg font-sarabun bg-dourado hover:bg-dourado/90 text-white sm:flex-[2]"
        >
          {isSubmitting ? (
            <>
              <LoadingSpinner size="sm" className="mr-2" />
              Enviando...
            </>
          ) : (
            <>
              <Send className="h-5 w-5 mr-2" />
              Enviar Indicações ({indicacoesPreenchidas})
            </>
          )}
        </Button>
      </motion.div>
    </div>
  )
}
