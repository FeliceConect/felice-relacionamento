'use client'

import { useState, useCallback, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { PerguntaComOpcoes, Nucleo } from '@/types/database'

interface FormularioState {
  step: 'welcome' | 'questions' | 'contact' | 'success'
  currentQuestion: number
  answers: Record<string, string[]> // pergunta_id -> opcao_ids[]
  nome: string
  whatsapp: string
  isSubmitting: boolean
  error: string | null
}

interface UseFormularioReturn {
  state: FormularioState
  perguntas: PerguntaComOpcoes[]
  nucleos: Nucleo[]
  isLoading: boolean
  // Actions
  startForm: () => void
  nextQuestion: () => void
  prevQuestion: () => void
  selectOption: (perguntaId: string, opcaoId: string, multipla: boolean) => void
  setNome: (nome: string) => void
  setWhatsapp: (whatsapp: string) => void
  submitForm: () => Promise<void>
  resetForm: () => void
  // Computed
  progress: number
  currentPergunta: PerguntaComOpcoes | null
  canGoNext: boolean
  canSubmit: boolean
}

const initialState: FormularioState = {
  step: 'welcome',
  currentQuestion: 0,
  answers: {},
  nome: '',
  whatsapp: '',
  isSubmitting: false,
  error: null,
}

export function useFormulario(): UseFormularioReturn {
  const [state, setState] = useState<FormularioState>(initialState)
  const [perguntas, setPerguntas] = useState<PerguntaComOpcoes[]>([])
  const [nucleos, setNucleos] = useState<Nucleo[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Carregar perguntas e núcleos
  useEffect(() => {
    async function loadData() {
      const supabase = createClient()

      try {
        // Carregar núcleos
        const { data: nucleosData } = await supabase
          .from('form_nucleos')
          .select('*')
          .eq('ativo', true)
          .order('ordem')

        if (nucleosData) {
          setNucleos(nucleosData)
        }

        // Carregar perguntas com opções
        const { data: perguntasData } = await supabase
          .from('form_perguntas')
          .select(`
            *,
            nucleo:form_nucleos(*),
            opcoes:form_opcoes(*)
          `)
          .eq('ativo', true)
          .order('ordem')

        if (perguntasData) {
          // Ordenar opções dentro de cada pergunta
          const perguntasOrdenadas = perguntasData.map(p => ({
            ...p,
            opcoes: (p.opcoes || []).sort((a: { ordem: number }, b: { ordem: number }) => a.ordem - b.ordem),
          })) as PerguntaComOpcoes[]

          setPerguntas(perguntasOrdenadas)
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  // Actions
  const startForm = useCallback(() => {
    setState(prev => ({ ...prev, step: 'questions', currentQuestion: 0 }))
  }, [])

  const nextQuestion = useCallback(() => {
    setState(prev => {
      if (prev.currentQuestion < perguntas.length - 1) {
        return { ...prev, currentQuestion: prev.currentQuestion + 1 }
      }
      return { ...prev, step: 'contact' }
    })
  }, [perguntas.length])

  const prevQuestion = useCallback(() => {
    setState(prev => {
      if (prev.currentQuestion > 0) {
        return { ...prev, currentQuestion: prev.currentQuestion - 1 }
      }
      return { ...prev, step: 'welcome' }
    })
  }, [])

  const selectOption = useCallback((perguntaId: string, opcaoId: string, multipla: boolean) => {
    setState(prev => {
      const currentAnswers = prev.answers[perguntaId] || []

      let newAnswers: string[]
      if (multipla) {
        // Toggle para múltipla seleção
        if (currentAnswers.includes(opcaoId)) {
          newAnswers = currentAnswers.filter(id => id !== opcaoId)
        } else {
          newAnswers = [...currentAnswers, opcaoId]
        }
      } else {
        // Substituir para seleção única
        newAnswers = [opcaoId]
      }

      return {
        ...prev,
        answers: { ...prev.answers, [perguntaId]: newAnswers },
      }
    })
  }, [])

  const setNome = useCallback((nome: string) => {
    setState(prev => ({ ...prev, nome }))
  }, [])

  const setWhatsapp = useCallback((whatsapp: string) => {
    // Formatar WhatsApp removendo caracteres não numéricos
    const formatted = whatsapp.replace(/\D/g, '')
    setState(prev => ({ ...prev, whatsapp: formatted }))
  }, [])

  const submitForm = useCallback(async () => {
    setState(prev => ({ ...prev, isSubmitting: true, error: null }))

    try {
      const supabase = createClient()

      // 1. Criar paciente
      const { data: paciente, error: pacienteError } = await supabase
        .from('form_pacientes')
        .insert({
          nome: state.nome,
          whatsapp: state.whatsapp,
          whatsapp_formatado: formatWhatsApp(state.whatsapp),
        })
        .select()
        .single()

      if (pacienteError) throw pacienteError

      // 2. Salvar respostas
      const respostas = Object.entries(state.answers).flatMap(([perguntaId, opcaoIds]) =>
        opcaoIds.map(opcaoId => ({
          paciente_id: paciente.id,
          pergunta_id: perguntaId,
          opcao_id: opcaoId,
        }))
      )

      if (respostas.length > 0) {
        const { error: respostasError } = await supabase
          .from('form_respostas')
          .insert(respostas)

        if (respostasError) throw respostasError
      }

      // 3. Calcular e salvar interesses por núcleo
      const interessesPorNucleo = calcularInteresses(state.answers, perguntas)

      if (Object.keys(interessesPorNucleo).length > 0) {
        const interesses = Object.entries(interessesPorNucleo).map(([nucleoId, quantidade]) => ({
          paciente_id: paciente.id,
          nucleo_id: nucleoId,
          quantidade_respostas: quantidade,
        }))

        const { error: interessesError } = await supabase
          .from('form_interesses')
          .insert(interesses)

        if (interessesError) throw interessesError
      }

      setState(prev => ({ ...prev, step: 'success', isSubmitting: false }))
    } catch (error) {
      console.error('Erro ao submeter formulário:', error)
      setState(prev => ({
        ...prev,
        isSubmitting: false,
        error: 'Ocorreu um erro ao salvar suas informações. Tente novamente.',
      }))
    }
  }, [state.nome, state.whatsapp, state.answers, perguntas])

  const resetForm = useCallback(() => {
    setState(initialState)
  }, [])

  // Computed values
  const progress = perguntas.length > 0
    ? ((state.currentQuestion + 1) / perguntas.length) * 100
    : 0

  const currentPergunta = perguntas[state.currentQuestion] || null

  const canGoNext = currentPergunta
    ? !currentPergunta.obrigatoria || (state.answers[currentPergunta.id]?.length ?? 0) > 0
    : false

  const canSubmit = state.nome.trim().length >= 3 &&
    state.whatsapp.length >= 10 &&
    !state.isSubmitting

  return {
    state,
    perguntas,
    nucleos,
    isLoading,
    startForm,
    nextQuestion,
    prevQuestion,
    selectOption,
    setNome,
    setWhatsapp,
    submitForm,
    resetForm,
    progress,
    currentPergunta,
    canGoNext,
    canSubmit,
  }
}

// Helpers
function formatWhatsApp(value: string): string {
  const cleaned = value.replace(/\D/g, '')
  if (cleaned.length <= 2) return cleaned
  if (cleaned.length <= 7) return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2)}`
  if (cleaned.length <= 11) return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`
  return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7, 11)}`
}

function calcularInteresses(
  answers: Record<string, string[]>,
  perguntas: PerguntaComOpcoes[]
): Record<string, number> {
  const interessesPorNucleo: Record<string, number> = {}

  for (const [perguntaId, opcaoIds] of Object.entries(answers)) {
    const pergunta = perguntas.find(p => p.id === perguntaId)
    if (pergunta?.nucleo_id) {
      interessesPorNucleo[pergunta.nucleo_id] =
        (interessesPorNucleo[pergunta.nucleo_id] || 0) + opcaoIds.length
    }
  }

  return interessesPorNucleo
}
