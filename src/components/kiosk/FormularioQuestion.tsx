'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ArrowLeft, ArrowRight, Check } from 'lucide-react'
import type { PerguntaComOpcoes } from '@/types/database'
import { cn } from '@/lib/utils'

interface FormularioQuestionProps {
  pergunta: PerguntaComOpcoes
  selectedOptions: string[]
  progress: number
  currentIndex: number
  totalQuestions: number
  canGoNext: boolean
  onSelectOption: (opcaoId: string) => void
  onNext: () => void
  onPrev: () => void
}

export function FormularioQuestion({
  pergunta,
  selectedOptions,
  progress,
  currentIndex,
  totalQuestions,
  canGoNext,
  onSelectOption,
  onNext,
  onPrev,
}: FormularioQuestionProps) {
  const letras = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']

  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col">
      {/* Progress Bar */}
      <div className="px-6 pt-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <span className="font-sarabun text-sm text-cafe/60">
              Pergunta {currentIndex + 1} de {totalQuestions}
            </span>
            <span className="font-sarabun text-sm text-dourado font-medium">
              {Math.round(progress)}%
            </span>
          </div>
          <Progress value={progress} className="h-2 bg-seda" />
        </div>
      </div>

      {/* Question Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
        <motion.div
          key={pergunta.id}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-2xl"
        >
          {/* Imagem opcional */}
          {pergunta.imagem_url && (
            <div className="mb-6 rounded-xl overflow-hidden relative h-48">
              <Image
                src={pergunta.imagem_url}
                alt=""
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          )}

          {/* Núcleo tag */}
          {pergunta.nucleo && (
            <div className="mb-4">
              <span
                className="inline-block px-3 py-1 rounded-full text-xs font-medium font-sarabun"
                style={{
                  backgroundColor: `${pergunta.nucleo.cor}15`,
                  color: pergunta.nucleo.cor || '#c29863',
                }}
              >
                {pergunta.nucleo.nome}
              </span>
            </div>
          )}

          {/* Question Title */}
          <h2 className="font-butler text-2xl md:text-3xl text-cafe mb-2">
            {pergunta.titulo}
          </h2>

          {/* Subtitle */}
          {pergunta.subtitulo && (
            <p className="font-sarabun text-cafe/70 mb-6">
              {pergunta.subtitulo}
            </p>
          )}

          {/* Selection hint */}
          <p className="font-sarabun text-sm text-cafe/50 mb-6">
            {pergunta.multipla_selecao
              ? 'Selecione todas as opções que se aplicam'
              : 'Selecione uma opção'}
          </p>

          {/* Options */}
          <div className="space-y-3">
            {pergunta.opcoes.map((opcao, index) => {
              const isSelected = selectedOptions.includes(opcao.id)
              const letra = opcao.letra || letras[index]

              return (
                <motion.button
                  key={opcao.id}
                  onClick={() => onSelectOption(opcao.id)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={cn(
                    'w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-200 text-left',
                    isSelected
                      ? 'border-dourado bg-dourado/10 shadow-felice'
                      : 'border-nude/30 bg-white hover:border-dourado/50 hover:bg-seda/30'
                  )}
                >
                  {/* Letter indicator */}
                  <span
                    className={cn(
                      'flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center font-sarabun font-semibold text-lg transition-colors',
                      isSelected
                        ? 'bg-dourado text-white'
                        : 'bg-seda text-cafe/60'
                    )}
                  >
                    {isSelected ? <Check className="w-5 h-5" /> : letra}
                  </span>

                  {/* Option text */}
                  <span
                    className={cn(
                      'font-sarabun text-base flex-1',
                      isSelected ? 'text-cafe font-medium' : 'text-cafe/80'
                    )}
                  >
                    {opcao.texto}
                  </span>
                </motion.button>
              )
            })}
          </div>
        </motion.div>
      </div>

      {/* Navigation */}
      <div className="px-6 pb-6">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
          <Button
            onClick={onPrev}
            variant="ghost"
            className="text-cafe/70 hover:text-cafe hover:bg-seda/50 font-sarabun"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>

          <Button
            onClick={onNext}
            disabled={!canGoNext}
            className="bg-dourado hover:bg-dourado-600 text-white font-sarabun px-8"
          >
            {currentIndex === totalQuestions - 1 ? 'Continuar' : 'Próxima'}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
