'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import {
  IndicacaoTable,
  IndicacaoFilters,
  SendIndicacaoMessageDialog,
  MarkIndicacaoConvertedDialog,
} from '@/components/admin'
import type { IndicacaoFiltersState } from '@/components/admin'
import { useToast } from '@/lib/hooks/use-toast'
import { Download, UserPlus } from 'lucide-react'
import type { Nucleo, Template, IndicacaoView } from '@/types/database'

const initialFilters: IndicacaoFiltersState = {
  search: '',
  status: 'all',
  parentesco: 'all',
  dateRange: undefined,
}

export default function IndicacoesPage() {
  const { toast } = useToast()
  const [indicacoes, setIndicacoes] = useState<IndicacaoView[]>([])
  const [nucleos, setNucleos] = useState<Nucleo[]>([])
  const [templates, setTemplates] = useState<(Template & { nucleo: Nucleo | null })[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filters, setFilters] = useState<IndicacaoFiltersState>(initialFilters)
  const [userRole, setUserRole] = useState<string>('atendente')

  // Dialogs state
  const [messageDialogOpen, setMessageDialogOpen] = useState(false)
  const [convertDialogOpen, setConvertDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedIndicacao, setSelectedIndicacao] = useState<IndicacaoView | null>(null)

  // Load data
  useEffect(() => {
    async function loadData() {
      const supabase = createClient()

      // Get user role
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data: equipeData } = await supabase
            .from('form_equipe')
            .select('role')
            .eq('id', user.id)
            .single()

          if (equipeData?.role) {
            setUserRole(equipeData.role)
          }
        }
      } catch (error) {
        console.error('Error loading user role:', error)
      }

      try {
        // Carregar indicacoes
        const { data: indicacoesData, error: indicacoesError } = await supabase
          .from('form_indicacoes_view')
          .select('*')
          .order('created_at', { ascending: false })

        if (indicacoesError) throw indicacoesError

        setIndicacoes((indicacoesData || []).filter((i) => i.id !== null))

        // Carregar nucleos
        const { data: nucleosData } = await supabase
          .from('form_nucleos')
          .select('*')
          .eq('ativo', true)
          .order('ordem')

        setNucleos(nucleosData || [])

        // Carregar templates
        const { data: templatesData } = await supabase
          .from('form_templates')
          .select('*, nucleo:form_nucleos(*)')
          .eq('ativo', true)
          .order('ordem')

        setTemplates(templatesData || [])
      } catch (error) {
        console.error('Erro ao carregar dados:', error)
        toast({
          variant: 'destructive',
          title: 'Erro',
          description: 'Nao foi possivel carregar as indicacoes.',
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [toast])

  // Filtered indicacoes
  const filteredIndicacoes = useMemo(() => {
    return indicacoes.filter((indicacao) => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        const matchesName = indicacao.nome?.toLowerCase().includes(searchLower)
        const matchesPhone = indicacao.telefone?.includes(filters.search.replace(/\D/g, ''))
        const matchesIndicadoPor = indicacao.indicado_por_nome?.toLowerCase().includes(searchLower)
        if (!matchesName && !matchesPhone && !matchesIndicadoPor) return false
      }

      // Status filter
      if (filters.status !== 'all' && indicacao.status !== filters.status) {
        return false
      }

      // Parentesco filter
      if (filters.parentesco !== 'all' && indicacao.parentesco !== filters.parentesco) {
        return false
      }

      // Date range filter
      if (filters.dateRange?.from) {
        const indicacaoDate = new Date(indicacao.created_at || '')
        if (indicacaoDate < filters.dateRange.from) return false
        if (filters.dateRange.to && indicacaoDate > filters.dateRange.to) return false
      }

      return true
    })
  }, [indicacoes, filters])

  // Action handlers
  const handleSendMessage = useCallback((indicacao: IndicacaoView) => {
    setSelectedIndicacao(indicacao)
    setMessageDialogOpen(true)
  }, [])

  const handleMarkConverted = useCallback((indicacao: IndicacaoView) => {
    setSelectedIndicacao(indicacao)
    setConvertDialogOpen(true)
  }, [])

  const handleDelete = useCallback((indicacao: IndicacaoView) => {
    setSelectedIndicacao(indicacao)
    setDeleteDialogOpen(true)
  }, [])

  // Submit handlers
  const handleSendMessageSubmit = async (
    indicacaoId: string,
    message: string,
    templateId?: string
  ) => {
    const supabase = createClient()

    try {
      // Registrar follow-up
      const { error } = await supabase.from('form_indicacoes_followups').insert({
        indicacao_id: indicacaoId,
        template_id: templateId || null,
        tipo_contato: 'whatsapp',
        conteudo_enviado: message,
        status: 'enviado',
      })

      if (error) throw error

      toast({
        title: 'Mensagem registrada',
        description: 'O follow-up foi registrado com sucesso.',
      })

      // Recarregar indicacoes
      window.location.reload()
    } catch (error) {
      console.error('Erro ao registrar mensagem:', error)
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Nao foi possivel registrar a mensagem.',
      })
    }
  }

  const handleConvertSubmit = async (data: {
    indicacaoId: string
    nucleoId: string
    procedimento: string
    valor: number | null
    observacoes: string
  }) => {
    const supabase = createClient()

    try {
      const { error } = await supabase.from('form_indicacoes_conversoes').insert({
        indicacao_id: data.indicacaoId,
        nucleo_id: data.nucleoId,
        procedimento: data.procedimento || null,
        valor: data.valor,
        observacoes: data.observacoes || null,
      })

      if (error) throw error

      toast({
        title: 'Conversao registrada',
        description: 'A indicacao foi marcada como convertida.',
      })

      // Recarregar indicacoes
      window.location.reload()
    } catch (error) {
      console.error('Erro ao registrar conversao:', error)
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Nao foi possivel registrar a conversao.',
      })
    }
  }

  const handleDeleteConfirm = async () => {
    if (!selectedIndicacao?.id) return

    // Verificar se e admin
    if (userRole !== 'admin') {
      toast({
        variant: 'destructive',
        title: 'Acesso negado',
        description: 'Apenas administradores podem excluir indicacoes.',
      })
      setDeleteDialogOpen(false)
      return
    }

    const supabase = createClient()
    const indicacaoId = selectedIndicacao.id

    try {
      // Deletar em ordem para respeitar foreign keys
      // 1. Deletar follow-ups
      await supabase
        .from('form_indicacoes_followups')
        .delete()
        .eq('indicacao_id', indicacaoId)

      // 2. Deletar conversoes
      await supabase
        .from('form_indicacoes_conversoes')
        .delete()
        .eq('indicacao_id', indicacaoId)

      // 3. Finalmente, deletar a indicacao
      const { error } = await supabase
        .from('form_indicacoes')
        .delete()
        .eq('id', indicacaoId)

      if (error) throw error

      toast({
        title: 'Indicacao excluida',
        description: 'A indicacao e todos os dados relacionados foram excluidos com sucesso.',
      })

      setIndicacoes((prev) => prev.filter((i) => i.id !== indicacaoId))
      setDeleteDialogOpen(false)
    } catch (error) {
      console.error('Erro ao excluir indicacao:', error)
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Nao foi possivel excluir a indicacao.',
      })
    }
  }

  // Export to CSV
  const handleExport = () => {
    const csvContent = [
      ['Nome', 'Telefone', 'Parentesco', 'Indicado Por', 'Status', 'Data'].join(','),
      ...filteredIndicacoes.map((indicacao) =>
        [
          `"${indicacao.nome || ''}"`,
          indicacao.telefone || '',
          indicacao.parentesco || '',
          `"${indicacao.indicado_por_nome || ''}"`,
          indicacao.status || '',
          indicacao.created_at ? new Date(indicacao.created_at).toLocaleDateString('pt-BR') : '',
        ].join(',')
      ),
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `indicacoes_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <LoadingSpinner size="lg" text="Carregando indicacoes..." />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <UserPlus className="h-8 w-8 text-dourado" />
            Indicacoes
          </h1>
          <p className="page-subtitle">Gerencie as indicacoes feitas pelos pacientes</p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleExport}
            className="border-cafe/30"
          >
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="card-felice">
        <CardContent className="pt-6">
          <IndicacaoFilters
            filters={filters}
            onFiltersChange={setFilters}
            onClearFilters={() => setFilters(initialFilters)}
            totalResults={filteredIndicacoes.length}
          />
        </CardContent>
      </Card>

      {/* Table */}
      <IndicacaoTable
        indicacoes={filteredIndicacoes}
        onSendMessage={handleSendMessage}
        onMarkConverted={handleMarkConverted}
        onDelete={handleDelete}
        userRole={userRole}
      />

      {/* Dialogs */}
      <SendIndicacaoMessageDialog
        open={messageDialogOpen}
        onOpenChange={setMessageDialogOpen}
        indicacao={selectedIndicacao}
        templates={templates}
        onSend={handleSendMessageSubmit}
      />

      <MarkIndicacaoConvertedDialog
        open={convertDialogOpen}
        onOpenChange={setConvertDialogOpen}
        indicacao={selectedIndicacao}
        nucleos={nucleos}
        onConfirm={handleConvertSubmit}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Excluir Indicacao"
        description={`Tem certeza que deseja excluir a indicacao "${selectedIndicacao?.nome}"? Esta acao nao pode ser desfeita.`}
        confirmLabel="Excluir"
        variant="destructive"
        onConfirm={handleDeleteConfirm}
      />
    </div>
  )
}
