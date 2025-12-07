'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import {
  LeadTable,
  LeadFilters,
  SendMessageDialog,
  MarkConvertedDialog,
} from '@/components/admin'
import type { LeadComInteresses, LeadFiltersState } from '@/components/admin'
import { useToast } from '@/lib/hooks/use-toast'
import { Download, Users } from 'lucide-react'
import type { Nucleo, Template } from '@/types/database'

const initialFilters: LeadFiltersState = {
  search: '',
  status: 'all',
  nucleo: 'all',
  dateRange: undefined,
}

export default function LeadsPage() {
  const { toast } = useToast()
  const [leads, setLeads] = useState<LeadComInteresses[]>([])
  const [nucleos, setNucleos] = useState<Nucleo[]>([])
  const [templates, setTemplates] = useState<(Template & { nucleo: Nucleo | null })[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filters, setFilters] = useState<LeadFiltersState>(initialFilters)

  // Dialogs state
  const [messageDialogOpen, setMessageDialogOpen] = useState(false)
  const [convertDialogOpen, setConvertDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedLead, setSelectedLead] = useState<LeadComInteresses | null>(null)

  // Load data
  useEffect(() => {
    async function loadData() {
      const supabase = createClient()

      try {
        // Carregar leads com interesses
        const { data: leadsData, error: leadsError } = await supabase
          .from('form_leads_view')
          .select('*')
          .order('created_at', { ascending: false })

        if (leadsError) throw leadsError

        // Carregar interesses para cada lead
        const leadsWithInteresses = await Promise.all(
          (leadsData || [])
            .filter((lead) => lead.id !== null)
            .map(async (lead) => {
              const { data: interesses } = await supabase
                .from('form_interesses')
                .select('*, nucleo:form_nucleos(*)')
                .eq('paciente_id', lead.id!)

              return {
                ...lead,
                interesses: interesses || [],
              }
            })
        )

        setLeads(leadsWithInteresses)

        // Carregar núcleos
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
          description: 'Não foi possível carregar os leads.',
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [toast])

  // Filtered leads
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        const matchesName = lead.nome?.toLowerCase().includes(searchLower)
        const matchesPhone = lead.whatsapp?.includes(filters.search.replace(/\D/g, ''))
        if (!matchesName && !matchesPhone) return false
      }

      // Status filter
      if (filters.status !== 'all' && lead.status !== filters.status) {
        return false
      }

      // Núcleo filter
      if (filters.nucleo !== 'all') {
        const hasNucleo = lead.interesses?.some((i) => i.nucleo_id === filters.nucleo)
        if (!hasNucleo) return false
      }

      // Date range filter
      if (filters.dateRange?.from) {
        const leadDate = new Date(lead.created_at || '')
        if (leadDate < filters.dateRange.from) return false
        if (filters.dateRange.to && leadDate > filters.dateRange.to) return false
      }

      return true
    })
  }, [leads, filters])

  // Action handlers
  const handleSendMessage = useCallback((lead: LeadComInteresses) => {
    setSelectedLead(lead)
    setMessageDialogOpen(true)
  }, [])

  const handleMarkConverted = useCallback((lead: LeadComInteresses) => {
    setSelectedLead(lead)
    setConvertDialogOpen(true)
  }, [])

  const handleDelete = useCallback((lead: LeadComInteresses) => {
    setSelectedLead(lead)
    setDeleteDialogOpen(true)
  }, [])

  // Submit handlers
  const handleSendMessageSubmit = async (
    leadId: string,
    message: string,
    templateId?: string
  ) => {
    const supabase = createClient()

    try {
      // Registrar follow-up
      const { error } = await supabase.from('form_followups').insert({
        paciente_id: leadId,
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

      // Recarregar leads
      window.location.reload()
    } catch (error) {
      console.error('Erro ao registrar mensagem:', error)
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Não foi possível registrar a mensagem.',
      })
    }
  }

  const handleConvertSubmit = async (data: {
    leadId: string
    nucleoId: string
    procedimento: string
    valor: number | null
    observacoes: string
  }) => {
    const supabase = createClient()

    try {
      const { error } = await supabase.from('form_conversoes').insert({
        paciente_id: data.leadId,
        nucleo_id: data.nucleoId,
        procedimento: data.procedimento || null,
        valor: data.valor,
        observacoes: data.observacoes || null,
      })

      if (error) throw error

      toast({
        title: 'Conversão registrada',
        description: 'O lead foi marcado como convertido.',
      })

      // Recarregar leads
      window.location.reload()
    } catch (error) {
      console.error('Erro ao registrar conversão:', error)
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Não foi possível registrar a conversão.',
      })
    }
  }

  const handleDeleteConfirm = async () => {
    if (!selectedLead?.id) return

    const supabase = createClient()

    try {
      const { error } = await supabase
        .from('form_pacientes')
        .delete()
        .eq('id', selectedLead.id)

      if (error) throw error

      toast({
        title: 'Lead excluído',
        description: 'O lead foi excluído com sucesso.',
      })

      setLeads((prev) => prev.filter((l) => l.id !== selectedLead.id))
      setDeleteDialogOpen(false)
    } catch (error) {
      console.error('Erro ao excluir lead:', error)
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Não foi possível excluir o lead.',
      })
    }
  }

  // Export to CSV
  const handleExport = () => {
    const csvContent = [
      ['Nome', 'WhatsApp', 'Status', 'Interesses', 'Data'].join(','),
      ...filteredLeads.map((lead) =>
        [
          `"${lead.nome || ''}"`,
          lead.whatsapp || '',
          lead.status || '',
          `"${lead.interesses?.map((i) => i.nucleo?.nome).join(', ') || ''}"`,
          lead.created_at ? new Date(lead.created_at).toLocaleDateString('pt-BR') : '',
        ].join(',')
      ),
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `leads_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <LoadingSpinner size="lg" text="Carregando leads..." />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <Users className="h-8 w-8 text-dourado" />
            Leads
          </h1>
          <p className="page-subtitle">Gerencie os leads captados pelo formulário</p>
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
          <LeadFilters
            filters={filters}
            nucleos={nucleos}
            onFiltersChange={setFilters}
            onClearFilters={() => setFilters(initialFilters)}
            totalResults={filteredLeads.length}
          />
        </CardContent>
      </Card>

      {/* Table */}
      <LeadTable
        leads={filteredLeads}
        onSendMessage={handleSendMessage}
        onMarkConverted={handleMarkConverted}
        onDelete={handleDelete}
      />

      {/* Dialogs */}
      <SendMessageDialog
        open={messageDialogOpen}
        onOpenChange={setMessageDialogOpen}
        lead={selectedLead}
        templates={templates}
        onSend={handleSendMessageSubmit}
      />

      <MarkConvertedDialog
        open={convertDialogOpen}
        onOpenChange={setConvertDialogOpen}
        lead={selectedLead}
        nucleos={nucleos}
        onConfirm={handleConvertSubmit}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Excluir Lead"
        description={`Tem certeza que deseja excluir o lead "${selectedLead?.nome}"? Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        variant="destructive"
        onConfirm={handleDeleteConfirm}
      />
    </div>
  )
}
