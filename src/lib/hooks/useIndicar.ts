'use client'

import { useState, useCallback, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Paciente, ProfissionalBase } from '@/types/database'
import type { Indicacao } from '@/lib/utils/constants'

type Step = 'profissional' | 'search' | 'form' | 'success'

interface IndicarState {
  step: Step
  profissional: ProfissionalBase | null
  profissionais: ProfissionalBase[]
  paciente: Paciente | null
  indicacoes: Indicacao[]
  searchQuery: string
  searchResults: Paciente[]
  isSearching: boolean
  isSubmitting: boolean
  isLoadingProfissionais: boolean
  error: string | null
}

const createEmptyIndicacao = (): Indicacao => ({
  nome: '',
  telefone: '',
  parentesco: '',
})

const createInitialIndicacoes = () => Array(10).fill(null).map(() => createEmptyIndicacao())

const initialState: IndicarState = {
  step: 'profissional',
  profissional: null,
  profissionais: [],
  paciente: null,
  indicacoes: createInitialIndicacoes(),
  searchQuery: '',
  searchResults: [],
  isSearching: false,
  isSubmitting: false,
  isLoadingProfissionais: true,
  error: null,
}

export function useIndicar() {
  const [state, setState] = useState<IndicarState>(initialState)

  // Carregar profissionais ao iniciar
  useEffect(() => {
    const loadProfissionais = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('form_profissionais')
        .select('*')
        .eq('ativo', true)
        .order('ordem')

      // Ordenar para colocar Dr Leonardo em primeiro
      const sortedProfissionais = (data || []).sort((a, b) => {
        if (a.nome.toLowerCase().includes('leonardo')) return -1
        if (b.nome.toLowerCase().includes('leonardo')) return 1
        return a.ordem - b.ordem
      })

      setState(prev => ({
        ...prev,
        profissionais: sortedProfissionais,
        isLoadingProfissionais: false,
      }))
    }

    loadProfissionais()
  }, [])

  // Debounced search effect
  useEffect(() => {
    if (state.searchQuery.length < 2) {
      setState(prev => ({ ...prev, searchResults: [], isSearching: false }))
      return
    }

    setState(prev => ({ ...prev, isSearching: true }))

    const timer = setTimeout(async () => {
      const supabase = createClient()

      const { data } = await supabase
        .from('form_pacientes')
        .select('id, nome, whatsapp, whatsapp_formatado, created_at, updated_at')
        .or(`nome.ilike.%${state.searchQuery}%,whatsapp.ilike.%${state.searchQuery}%,whatsapp_formatado.ilike.%${state.searchQuery}%`)
        .order('nome')
        .limit(10)

      setState(prev => ({
        ...prev,
        searchResults: data || [],
        isSearching: false,
      }))
    }, 300)

    return () => clearTimeout(timer)
  }, [state.searchQuery])

  // Actions
  const selectProfissional = useCallback((profissional: ProfissionalBase) => {
    setState(prev => ({ ...prev, profissional, step: 'search' }))
  }, [])

  const setSearchQuery = useCallback((query: string) => {
    setState(prev => ({ ...prev, searchQuery: query }))
  }, [])

  const selectPaciente = useCallback((paciente: Paciente) => {
    setState(prev => ({ ...prev, paciente, step: 'form' }))
  }, [])

  const goBack = useCallback(() => {
    setState(prev => {
      if (prev.step === 'form') {
        return { ...prev, step: 'search', paciente: null }
      }
      if (prev.step === 'search') {
        return { ...prev, step: 'profissional', profissional: null, searchQuery: '', searchResults: [] }
      }
      return prev
    })
  }, [])

  const updateIndicacao = useCallback((
    index: number,
    field: keyof Indicacao,
    value: string
  ) => {
    setState(prev => ({
      ...prev,
      indicacoes: prev.indicacoes.map((ind, i) =>
        i === index ? { ...ind, [field]: value } : ind
      ),
    }))
  }, [])

  const addIndicacao = useCallback(() => {
    setState(prev => ({
      ...prev,
      indicacoes: [...prev.indicacoes, createEmptyIndicacao()],
    }))
  }, [])

  const removeIndicacao = useCallback((index: number) => {
    setState(prev => {
      // Não permitir remover se só tiver 1
      if (prev.indicacoes.length <= 1) return prev
      return {
        ...prev,
        indicacoes: prev.indicacoes.filter((_, i) => i !== index),
      }
    })
  }, [])

  const submitIndicacoes = useCallback(async () => {
    if (!state.paciente) return

    setState(prev => ({ ...prev, isSubmitting: true, error: null }))

    try {
      const supabase = createClient()
      const indicacoesValidas = state.indicacoes.filter(ind => ind.nome.trim())

      if (indicacoesValidas.length === 0) {
        setState(prev => ({
          ...prev,
          isSubmitting: false,
          error: 'Por favor, preencha pelo menos uma indicação.',
        }))
        return
      }

      const indicacoesData = indicacoesValidas.map(ind => ({
        nome: ind.nome.trim(),
        telefone: ind.telefone.replace(/\D/g, ''),
        telefone_formatado: formatPhone(ind.telefone),
        parentesco: ind.parentesco || null,
        paciente_id: state.paciente!.id,
        profissional_id: state.profissional?.id || null,
        pergunta_id: null,
        status: 'aguardando',
        convertido: false,
      }))

      const { error } = await supabase
        .from('form_indicacoes')
        .insert(indicacoesData)

      if (error) throw error

      setState(prev => ({ ...prev, step: 'success', isSubmitting: false }))
    } catch (err) {
      console.error('Erro ao salvar indicações:', err)
      setState(prev => ({
        ...prev,
        isSubmitting: false,
        error: 'Erro ao salvar indicações. Por favor, tente novamente.',
      }))
    }
  }, [state.paciente, state.indicacoes, state.profissional])

  const reset = useCallback(() => {
    setState({
      ...initialState,
      indicacoes: createInitialIndicacoes(),
    })
  }, [])

  // Computed
  const indicacoesPreenchidas = state.indicacoes.filter(ind => ind.nome.trim()).length
  const canSubmit = indicacoesPreenchidas > 0 && !state.isSubmitting

  return {
    state,
    selectProfissional,
    setSearchQuery,
    selectPaciente,
    goBack,
    updateIndicacao,
    addIndicacao,
    removeIndicacao,
    submitIndicacoes,
    reset,
    indicacoesPreenchidas,
    canSubmit,
  }
}

function formatPhone(value: string): string {
  const cleaned = value.replace(/\D/g, '')
  if (cleaned.length === 0) return ''
  if (cleaned.length <= 2) return `(${cleaned}`
  if (cleaned.length <= 7) return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2)}`
  if (cleaned.length <= 11) return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`
  return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7, 11)}`
}
