'use client'

import { useEffect } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ArrowLeft, ArrowRight, Check, X, UserPlus } from 'lucide-react'
import type { PerguntaComOpcoes } from '@/types/database'
import { cn } from '@/lib/utils'
import { GRAUS_PARENTESCO, type Indicacao } from '@/lib/utils/constants'

interface FormularioQuestionProps {
  pergunta: PerguntaComOpcoes
  selectedOptions: string[]
  indicacoes: Indicacao[]
  textoLivre: string
  progress: number
  currentIndex: number
  totalQuestions: number
  canGoNext: boolean
  onSelectOption: (opcaoId: string) => void
  onUpdateIndicacoes: (indicacoes: Indicacao[]) => void
  onUpdateTextoLivre: (texto: string) => void
  onNext: () => void
  onPrev: () => void
}

export function FormularioQuestion({
  pergunta,
  selectedOptions,
  indicacoes,
  textoLivre,
  progress,
  currentIndex,
  totalQuestions,
  canGoNext,
  onSelectOption,
  onUpdateIndicacoes,
  onUpdateTextoLivre,
  onNext,
  onPrev,
}: FormularioQuestionProps) {
  const letras = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']
  const quantidadeInicial = pergunta.max_indicacoes || 5

  // Inicializar indicacoes vazias quando a pergunta de indicacoes for exibida
  useEffect(() => {
    if (pergunta.tipo === 'indicacoes' && indicacoes.length === 0) {
      const indicacoesIniciais = Array.from(
        { length: quantidadeInicial },
        () => ({ nome: '', telefone: '', parentesco: '' })
      )
      onUpdateIndicacoes(indicacoesIniciais)
    }
  }, [pergunta.id, pergunta.tipo, quantidadeInicial, indicacoes.length, onUpdateIndicacoes])

  // Indicacoes handlers
  const addIndicacao = () => {
    onUpdateIndicacoes([...indicacoes, { nome: '', telefone: '', parentesco: '' }])
  }

  const removeIndicacao = (index: number) => {
    onUpdateIndicacoes(indicacoes.filter((_, i) => i !== index))
  }

  const updateIndicacao = (index: number, field: keyof Indicacao, value: string) => {
    const updated = indicacoes.map((ind, i) =>
      i === index ? { ...ind, [field]: value } : ind
    )
    onUpdateIndicacoes(updated)
  }

  const formatPhone = (value: string) => {
    const cleaned = value.replace(/\D/g, '')
    if (cleaned.length <= 2) return cleaned
    if (cleaned.length <= 7) return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2)}`
    if (cleaned.length <= 11) return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7, 11)}`
  }

  const renderMultiplaEscolha = () => (
    <>
      {/* Selection hint */}
      <p className="font-sarabun text-sm text-cafe/50 mb-6">
        {pergunta.multipla_selecao
          ? 'Selecione todas as opcoes que se aplicam'
          : 'Selecione uma opcao'}
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
    </>
  )

  const renderIndicacoes = () => (
    <>
      {/* Indicacoes List */}
      <div className="space-y-4">
        {indicacoes.map((indicacao, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.03 }}
            className="p-4 rounded-xl border-2 border-nude/30 bg-white"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="font-sarabun text-sm font-medium text-cafe">
                Indicacao {index + 1}
              </span>
              {indicacoes.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeIndicacao(index)}
                  className="h-8 w-8 text-cafe/40 hover:text-error"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            <div className="space-y-3">
              {/* Nome */}
              <div>
                <Input
                  value={indicacao.nome}
                  onChange={(e) => updateIndicacao(index, 'nome', e.target.value)}
                  placeholder="Nome da pessoa"
                  className="input-felice"
                />
              </div>

              {/* Telefone */}
              <div>
                <Input
                  value={formatPhone(indicacao.telefone)}
                  onChange={(e) => updateIndicacao(index, 'telefone', e.target.value.replace(/\D/g, ''))}
                  placeholder="Telefone"
                  className="input-felice"
                  maxLength={15}
                />
              </div>

              {/* Parentesco */}
              <div>
                <Select
                  value={indicacao.parentesco}
                  onValueChange={(value) => updateIndicacao(index, 'parentesco', value)}
                >
                  <SelectTrigger className="input-felice">
                    <SelectValue placeholder="Selecione o parentesco" />
                  </SelectTrigger>
                  <SelectContent>
                    {GRAUS_PARENTESCO.map((grau) => (
                      <SelectItem key={grau} value={grau}>
                        {grau}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </motion.div>
        ))}

        {/* Add button - sempre visivel, sem limite */}
        <motion.button
          onClick={addIndicacao}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="w-full flex items-center justify-center gap-2 p-4 rounded-xl border-2 border-dashed border-dourado/50 text-dourado hover:bg-dourado/5 transition-colors"
        >
          <UserPlus className="h-5 w-5" />
          <span className="font-sarabun font-medium">
            Adicionar outra pessoa
          </span>
        </motion.button>
      </div>
    </>
  )

  const renderTextoLivre = () => (
    <>
      {/* Hint */}
      <p className="font-sarabun text-sm text-cafe/50 mb-6">
        Digite sua resposta abaixo
      </p>

      <textarea
        value={textoLivre}
        onChange={(e) => onUpdateTextoLivre(e.target.value)}
        placeholder="Sua resposta..."
        rows={4}
        className="w-full p-4 rounded-xl border-2 border-nude/30 bg-white font-sarabun text-cafe placeholder:text-cafe/40 focus:border-dourado focus:outline-none resize-none"
      />
    </>
  )

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
      <div className="flex-1 flex flex-col items-center justify-start px-6 py-8 overflow-y-auto">
        <motion.div
          key={pergunta.id}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-2xl"
        >
          {/* Imagem opcional - Layout melhorado */}
          {pergunta.imagem_url && (
            <div className="mb-8 relative">
              {/* Container com proporcao 16:9 e cantos arredondados elegantes */}
              <div className="relative aspect-[16/9] rounded-2xl overflow-hidden shadow-lg">
                <Image
                  src={pergunta.imagem_url}
                  alt=""
                  fill
                  className="object-cover"
                  unoptimized
                  sizes="(max-width: 768px) 100vw, 672px"
                />
                {/* Overlay gradiente sutil na parte inferior */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
              </div>
              {/* Borda decorativa dourada sutil */}
              <div className="absolute -inset-1 rounded-2xl border border-dourado/20 -z-10" />
            </div>
          )}

          {/* Nucleo tag */}
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

          {/* Render based on question type */}
          {pergunta.tipo === 'indicacoes' && renderIndicacoes()}
          {pergunta.tipo === 'texto' && renderTextoLivre()}
          {(pergunta.tipo === 'multipla_escolha' || !pergunta.tipo) && renderMultiplaEscolha()}
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
            {currentIndex === totalQuestions - 1 ? 'Continuar' : 'Proxima'}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
