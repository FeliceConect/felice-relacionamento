'use client'

import { useState, useCallback, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { PerguntaComOpcoes, Nucleo } from '@/types/database'
import type { Indicacao } from '@/lib/utils/constants'

interface FormularioState {
  step: 'welcome' | 'questions' | 'contact' | 'success'
  currentQuestion: number
  answers: Record<string, string[]> // pergunta_id -> opcao_ids[]
  indicacoes: Record<string, Indicacao[]> // pergunta_id -> indicacoes[]
  textosLivres: Record<string, string> // pergunta_id -> texto
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
  updateIndicacoes: (perguntaId: string, indicacoes: Indicacao[]) => void
  updateTextoLivre: (perguntaId: string, texto: string) => void
  setNome: (nome: string) => void
  setWhatsapp: (whatsapp: string) => void
  submitForm: () => Promise<void>
  resetForm: () => void
  // Computed
  progress: number
  currentPergunta: PerguntaComOpcoes | null
  currentIndicacoes: Indicacao[]
  currentTextoLivre: string
  canGoNext: boolean
  canSubmit: boolean
}

const initialState: FormularioState = {
  step: 'welcome',
  currentQuestion: 0,
  answers: {},
  indicacoes: {},
  textosLivres: {},
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

  // Carregar perguntas e nucleos
  useEffect(() => {
    async function loadData() {
      const supabase = createClient()

      try {
        // Carregar nucleos
        const { data: nucleosData } = await supabase
          .from('form_nucleos')
          .select('*')
          .eq('ativo', true)
          .order('ordem')

        if (nucleosData) {
          setNucleos(nucleosData)
        }

        // Carregar perguntas com opcoes
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
          // Ordenar opcoes dentro de cada pergunta
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
        // Toggle para multipla selecao
        if (currentAnswers.includes(opcaoId)) {
          newAnswers = currentAnswers.filter(id => id !== opcaoId)
        } else {
          newAnswers = [...currentAnswers, opcaoId]
        }
      } else {
        // Substituir para selecao unica
        newAnswers = [opcaoId]
      }

      return {
        ...prev,
        answers: { ...prev.answers, [perguntaId]: newAnswers },
      }
    })
  }, [])

  const updateIndicacoes = useCallback((perguntaId: string, indicacoes: Indicacao[]) => {
    setState(prev => ({
      ...prev,
      indicacoes: { ...prev.indicacoes, [perguntaId]: indicacoes },
    }))
  }, [])

  const updateTextoLivre = useCallback((perguntaId: string, texto: string) => {
    setState(prev => ({
      ...prev,
      textosLivres: { ...prev.textosLivres, [perguntaId]: texto },
    }))
  }, [])

  const setNome = useCallback((nome: string) => {
    setState(prev => ({ ...prev, nome }))
  }, [])

  const setWhatsapp = useCallback((whatsapp: string) => {
    // Formatar WhatsApp removendo caracteres nao numericos
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

      // 2. Salvar respostas de multipla escolha
      const respostasMultipla = Object.entries(state.answers).flatMap(([perguntaId, opcaoIds]) =>
        opcaoIds.map(opcaoId => ({
          paciente_id: paciente.id,
          pergunta_id: perguntaId,
          opcao_id: opcaoId,
          resposta_texto: null,
        }))
      )

      // 3. Salvar respostas de indicacoes (como JSON no campo resposta_texto)
      const respostasIndicacoes = Object.entries(state.indicacoes)
        .filter(([, indicacoes]) => indicacoes.length > 0)
        .map(([perguntaId, indicacoes]) => ({
          paciente_id: paciente.id,
          pergunta_id: perguntaId,
          opcao_id: null,
          resposta_texto: JSON.stringify(indicacoes),
        }))

      // 4. Salvar respostas de texto livre
      const respostasTexto = Object.entries(state.textosLivres)
        .filter(([, texto]) => texto.trim())
        .map(([perguntaId, texto]) => ({
          paciente_id: paciente.id,
          pergunta_id: perguntaId,
          opcao_id: null,
          resposta_texto: texto,
        }))

      const todasRespostas = [...respostasMultipla, ...respostasIndicacoes, ...respostasTexto]

      if (todasRespostas.length > 0) {
        const { error: respostasError } = await supabase
          .from('form_respostas')
          .insert(todasRespostas)

        if (respostasError) throw respostasError
      }

      // 5. Calcular e salvar interesses por nucleo (apenas multipla escolha)
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

      // 6. Salvar indicacoes na tabela dedicada form_indicacoes
      for (const [perguntaId, indicacoes] of Object.entries(state.indicacoes)) {
        const indicacoesValidas = indicacoes.filter(ind => ind.nome.trim())
        if (indicacoesValidas.length > 0) {
          const indicacoesData = indicacoesValidas.map(ind => ({
            nome: ind.nome,
            telefone: ind.telefone || '',
            telefone_formatado: formatWhatsApp(ind.telefone || ''),
            parentesco: ind.parentesco || null,
            paciente_id: paciente.id,
            pergunta_id: perguntaId,
          }))

          const { error: indicacoesError } = await supabase
            .from('form_indicacoes')
            .insert(indicacoesData)

          if (indicacoesError) {
            console.error('Erro ao salvar indicacoes:', indicacoesError)
            // Nao bloqueia o fluxo se falhar
          }
        }
      }

      setState(prev => ({ ...prev, step: 'success', isSubmitting: false }))
    } catch (error) {
      console.error('Erro ao submeter formulario:', error)
      setState(prev => ({
        ...prev,
        isSubmitting: false,
        error: 'Ocorreu um erro ao salvar suas informacoes. Tente novamente.',
      }))
    }
  }, [state.nome, state.whatsapp, state.answers, state.indicacoes, state.textosLivres, perguntas])

  const resetForm = useCallback(() => {
    setState(initialState)
  }, [])

  // Computed values
  const progress = perguntas.length > 0
    ? ((state.currentQuestion + 1) / perguntas.length) * 100
    : 0

  const currentPergunta = perguntas[state.currentQuestion] || null

  const currentIndicacoes = currentPergunta
    ? state.indicacoes[currentPergunta.id] || []
    : []

  const currentTextoLivre = currentPergunta
    ? state.textosLivres[currentPergunta.id] || ''
    : ''

  // Determinar se pode avancar baseado no tipo de pergunta
  const canGoNext = (() => {
    if (!currentPergunta) return false

    // Se nao e obrigatoria, sempre pode avancar
    if (!currentPergunta.obrigatoria) return true

    // Verificar baseado no tipo
    switch (currentPergunta.tipo) {
      case 'multipla_escolha':
        return (state.answers[currentPergunta.id]?.length ?? 0) > 0
      case 'texto':
        return (state.textosLivres[currentPergunta.id]?.trim().length ?? 0) > 0
      case 'indicacoes':
        // Para indicacoes, verificar se tem pelo menos uma indicacao com nome preenchido
        const indicacoes = state.indicacoes[currentPergunta.id] || []
        return indicacoes.some(ind => ind.nome.trim().length > 0)
      default:
        return (state.answers[currentPergunta.id]?.length ?? 0) > 0
    }
  })()

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
    updateIndicacoes,
    updateTextoLivre,
    setNome,
    setWhatsapp,
    submitForm,
    resetForm,
    progress,
    currentPergunta,
    currentIndicacoes,
    currentTextoLivre,
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
