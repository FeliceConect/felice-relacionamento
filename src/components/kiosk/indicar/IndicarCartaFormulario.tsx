'use client'

import { motion } from 'framer-motion'
import { Heart, ArrowLeft, Send, Plus, X, User, Phone, Users } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { GRAUS_PARENTESCO, type Indicacao } from '@/lib/utils/constants'

interface IndicarCartaFormularioProps {
  nomePaciente: string
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

export function IndicarCartaFormulario({
  nomePaciente,
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
}: IndicarCartaFormularioProps) {
  const firstName = nomePaciente.split(' ')[0]

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
    <>
      {/* Conteúdo com scroll - área entre header e footer */}
      <div className="overflow-y-auto pb-28" style={{ height: 'calc(100vh - 80px)' }}>
        <div className="px-4 md:px-6 py-6 max-w-2xl mx-auto">
          {/* Carta Emocional */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-8"
          >
            {/* Heart Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="mb-6 inline-flex"
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-dourado/20 to-vinho/20 flex items-center justify-center">
                <Heart className="h-8 w-8 text-vinho fill-vinho/20" />
              </div>
            </motion.div>

            {/* Letter Content */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="font-butler text-2xl md:text-3xl text-cafe mb-2"
            >
              Querida {firstName},
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="font-butler text-xl md:text-2xl text-dourado mb-4"
            >
              Você agora faz parte da nossa família Felice!
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="font-sarabun text-cafe/80 leading-relaxed space-y-3 mb-6"
            >
              <p>
                Foi uma honra poder cuidar de você e fazer parte dessa
                transformação tão especial na sua vida.
              </p>
              <p>
                Acreditamos que a beleza e o bem-estar devem ser
                compartilhados. Por isso, gostaríamos que você ajudasse outras
                pessoas queridas que também merecem essa experiência única.
              </p>
              <p className="italic text-vinho font-medium">
                Quem são as pessoas que você ama e que também
                poderiam fazer parte dessa família?
              </p>
            </motion.div>
          </motion.div>

          {/* Divider */}
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ delay: 0.6 }}
            className="h-px bg-gradient-to-r from-transparent via-dourado/30 to-transparent mb-6"
          />

          {/* Header do Formulário */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-center mb-4"
          >
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

          {/* Cards de Indicação */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="space-y-4"
          >
            {indicacoes.map((indicacao, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + index * 0.03 }}
                className="relative p-4 rounded-xl border-2 border-nude/30 bg-white"
              >
                {/* Card Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-dourado/10 flex items-center justify-center">
                      <span className="font-butler text-xs text-dourado">
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
                      className="p-1.5 rounded-full hover:bg-red-50 text-cafe/40 hover:text-red-500 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {/* Form Fields - Layout mais compacto */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Nome */}
                  <div className="relative sm:col-span-1">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-cafe/40" />
                    <Input
                      type="text"
                      placeholder="Nome"
                      value={indicacao.nome}
                      onChange={(e) => onUpdateIndicacao(index, 'nome', e.target.value)}
                      className="pl-9 py-4 font-sarabun bg-seda/20 border-nude/30 focus:border-dourado focus:ring-dourado/20"
                    />
                  </div>

                  {/* Telefone */}
                  <div className="relative sm:col-span-1">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-cafe/40" />
                    <Input
                      type="tel"
                      placeholder="Telefone"
                      value={indicacao.telefone}
                      onChange={(e) => handlePhoneChange(index, e.target.value)}
                      className="pl-9 py-4 font-sarabun bg-seda/20 border-nude/30 focus:border-dourado focus:ring-dourado/20"
                    />
                  </div>

                  {/* Parentesco */}
                  <div className="relative sm:col-span-1">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-cafe/40 z-10 pointer-events-none" />
                    <Select
                      value={indicacao.parentesco}
                      onValueChange={(value) => onUpdateIndicacao(index, 'parentesco', value)}
                    >
                      <SelectTrigger className="pl-9 py-4 font-sarabun bg-seda/20 border-nude/30 focus:border-dourado focus:ring-dourado/20 h-auto">
                        <SelectValue placeholder="Relação" />
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
              transition={{ delay: 1 }}
              onClick={onAddIndicacao}
              className="w-full p-3 rounded-xl border-2 border-dashed border-dourado/30 bg-dourado/5 hover:bg-dourado/10 hover:border-dourado/50 transition-all flex items-center justify-center gap-2 text-dourado font-sarabun"
            >
              <Plus className="h-5 w-5" />
              Adicionar mais uma indicação
            </motion.button>
          </motion.div>
        </div>
      </div>

      {/* Footer Fixo */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1 }}
        className="fixed bottom-0 left-0 right-0 border-t border-nude/30 bg-white p-4 shadow-lg z-40"
      >
        <div className="max-w-2xl mx-auto flex flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            onClick={onBack}
            disabled={isSubmitting}
            className="py-5 text-base font-sarabun border-nude hover:bg-seda/30 sm:flex-1"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Voltar
          </Button>
          <Button
            onClick={onSubmit}
            disabled={!canSubmit}
            className="py-5 text-base font-sarabun bg-dourado hover:bg-dourado/90 text-white sm:flex-[2]"
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
        </div>
      </motion.div>
    </>
  )
}
