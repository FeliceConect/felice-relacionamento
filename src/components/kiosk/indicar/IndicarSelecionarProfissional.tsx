'use client'

import { motion } from 'framer-motion'
import { Stethoscope, ChevronRight } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import type { ProfissionalBase } from '@/types/database'

interface IndicarSelecionarProfissionalProps {
  profissionais: ProfissionalBase[]
  isLoading: boolean
  onSelectProfissional: (profissional: ProfissionalBase) => void
}

export function IndicarSelecionarProfissional({
  profissionais,
  isLoading,
  onSelectProfissional,
}: IndicarSelecionarProfissionalProps) {
  const getInitials = (nome: string) => {
    return nome
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase()
  }

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center px-6 py-12">
        <LoadingSpinner size="lg" />
        <p className="mt-4 font-sarabun text-cafe/70">Carregando profissionais...</p>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-start px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-xl"
      >
        {/* Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-dourado/20 to-vinho/20 mb-4">
            <Stethoscope className="h-8 w-8 text-vinho" />
          </div>
          <h1 className="font-butler text-3xl md:text-4xl text-cafe mb-3">
            Selecionar Profissional
          </h1>
          <p className="font-sarabun text-cafe/70 text-lg">
            Escolha o profissional para vincular as indicacoes
          </p>
        </div>

        {/* Profissionais List */}
        {profissionais.length === 0 ? (
          <div className="text-center py-8">
            <p className="font-sarabun text-cafe/50">
              Nenhum profissional cadastrado
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {profissionais.map((profissional, index) => (
              <motion.button
                key={profissional.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => onSelectProfissional(profissional)}
                className="w-full p-4 rounded-xl border-2 transition-all duration-200
                  flex items-center justify-between
                  border-nude/30 bg-white hover:border-dourado/50 hover:bg-seda/30"
              >
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12 border-2 border-nude/50">
                    {profissional.foto_url ? (
                      <AvatarImage src={profissional.foto_url} alt={profissional.nome} />
                    ) : null}
                    <AvatarFallback className="bg-gradient-to-br from-dourado/20 to-vinho/20 text-vinho">
                      {getInitials(profissional.nome)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-left">
                    <p className="font-sarabun font-medium text-cafe text-lg">
                      {profissional.nome}
                    </p>
                    {profissional.especialidade && (
                      <p className="font-sarabun text-sm text-cafe/60">
                        {profissional.especialidade}
                      </p>
                    )}
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-cafe/30" />
              </motion.button>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  )
}
