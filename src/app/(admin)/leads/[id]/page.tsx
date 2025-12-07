'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { format, formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { SendMessageDialog, MarkConvertedDialog, type LeadComInteresses } from '@/components/admin'
import { useToast } from '@/lib/hooks/use-toast'
import {
  ArrowLeft,
  Phone,
  MessageSquare,
  CheckCircle,
  Calendar,
  FileText,
  Clock,
  ExternalLink,
  Trash2,
} from 'lucide-react'
import type { LeadComDetalhes, Nucleo, Template } from '@/types/database'

export default function LeadDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const leadId = params.id as string

  const [lead, setLead] = useState<LeadComDetalhes | null>(null)
  const [nucleos, setNucleos] = useState<Nucleo[]>([])
  const [templates, setTemplates] = useState<(Template & { nucleo: Nucleo | null })[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [userRole, setUserRole] = useState<string>('atendente')

  // Dialogs
  const [messageDialogOpen, setMessageDialogOpen] = useState(false)
  const [convertDialogOpen, setConvertDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  useEffect(() => {
    async function loadLead() {
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
        // Carregar paciente
        const { data: paciente, error: pacienteError } = await supabase
          .from('form_pacientes')
          .select('*')
          .eq('id', leadId)
          .single()

        if (pacienteError) throw pacienteError

        // Carregar interesses
        const { data: interesses } = await supabase
          .from('form_interesses')
          .select('*, nucleo:form_nucleos(*)')
          .eq('paciente_id', leadId)

        // Carregar respostas
        const { data: respostas } = await supabase
          .from('form_respostas')
          .select('*, pergunta:form_perguntas(*), opcao:form_opcoes(*)')
          .eq('paciente_id', leadId)

        // Carregar followups
        const { data: followups } = await supabase
          .from('form_followups')
          .select('*, template:form_templates(*)')
          .eq('paciente_id', leadId)
          .order('data_envio', { ascending: false })

        // Carregar conversões
        const { data: conversoes } = await supabase
          .from('form_conversoes')
          .select('*, nucleo:form_nucleos(*)')
          .eq('paciente_id', leadId)
          .order('data_conversao', { ascending: false })

        setLead({
          ...paciente,
          interesses: interesses || [],
          respostas: respostas || [],
          followups: followups || [],
          conversoes: conversoes || [],
        })

        // Carregar núcleos
        const { data: nucleosData } = await supabase
          .from('form_nucleos')
          .select('*')
          .eq('ativo', true)

        setNucleos(nucleosData || [])

        // Carregar templates
        const { data: templatesData } = await supabase
          .from('form_templates')
          .select('*, nucleo:form_nucleos(*)')
          .eq('ativo', true)

        setTemplates(templatesData || [])
      } catch (error) {
        console.error('Erro ao carregar lead:', error)
        toast({
          variant: 'destructive',
          title: 'Erro',
          description: 'Não foi possível carregar os dados do lead.',
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadLead()
  }, [leadId, toast])

  const handleSendMessage = async (
    _leadId: string,
    message: string,
    templateId?: string
  ) => {
    const supabase = createClient()

    try {
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

      window.location.reload()
    } catch (error) {
      console.error('Erro:', error)
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Não foi possível registrar a mensagem.',
      })
    }
  }

  const handleConvert = async (data: {
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

      window.location.reload()
    } catch (error) {
      console.error('Erro:', error)
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Não foi possível registrar a conversão.',
      })
    }
  }

  const handleDelete = async () => {
    const supabase = createClient()

    try {
      const { error } = await supabase
        .from('form_pacientes')
        .delete()
        .eq('id', leadId)

      if (error) throw error

      toast({
        title: 'Lead excluído',
        description: 'O lead foi excluído com sucesso.',
      })

      router.push('/leads')
    } catch (error) {
      console.error('Erro:', error)
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Não foi possível excluir o lead.',
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <LoadingSpinner size="lg" text="Carregando..." />
      </div>
    )
  }

  if (!lead) {
    return (
      <div className="text-center py-12">
        <p className="text-cafe/60">Lead não encontrado</p>
        <Link href="/leads">
          <Button variant="link" className="mt-2">
            Voltar para lista
          </Button>
        </Link>
      </div>
    )
  }

  const initials = lead.nome
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  const isConverted = lead.conversoes && lead.conversoes.length > 0
  const totalFollowups = lead.followups?.length || 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/leads">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="page-title">{lead.nome}</h1>
          <p className="page-subtitle">
            Lead desde {format(new Date(lead.created_at), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setMessageDialogOpen(true)}
            className="border-dourado text-dourado hover:bg-dourado hover:text-white"
          >
            <MessageSquare className="mr-2 h-4 w-4" />
            Enviar Mensagem
          </Button>
          {!isConverted && (
            <Button
              onClick={() => setConvertDialogOpen(true)}
              className="bg-success hover:bg-success-600 text-white"
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Marcar Convertido
            </Button>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Card */}
          <Card className="card-felice">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="bg-dourado/10 text-dourado text-xl font-butler">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h2 className="font-butler text-xl text-cafe">{lead.nome}</h2>
                    {isConverted ? (
                      <Badge className="badge-convertido">Convertido</Badge>
                    ) : totalFollowups === 0 ? (
                      <Badge className="badge-aguardando">Aguardando</Badge>
                    ) : totalFollowups === 1 ? (
                      <Badge className="badge-1-mensagem">1 Mensagem</Badge>
                    ) : totalFollowups === 2 ? (
                      <Badge className="badge-2-mensagens">2 Mensagens</Badge>
                    ) : (
                      <Badge className="badge-3-mais">3+ Mensagens</Badge>
                    )}
                  </div>

                  <div className="mt-2 space-y-1">
                    <a
                      href={`https://wa.me/55${lead.whatsapp.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-cafe/70 hover:text-dourado transition-colors"
                    >
                      <Phone className="h-4 w-4" />
                      {lead.whatsapp_formatado || lead.whatsapp}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                    <div className="flex items-center gap-2 text-cafe/60 text-sm">
                      <Calendar className="h-4 w-4" />
                      {formatDistanceToNow(new Date(lead.created_at), {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Interesses */}
              {lead.interesses && lead.interesses.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm font-medium text-cafe/60 mb-2">Interesses</h3>
                  <div className="flex flex-wrap gap-2">
                    {lead.interesses.map((interesse) => (
                      <Badge
                        key={interesse.id}
                        variant="outline"
                        style={{
                          borderColor: interesse.nucleo?.cor || '#c29863',
                          color: interesse.nucleo?.cor || '#c29863',
                        }}
                      >
                        {interesse.nucleo?.nome} ({interesse.quantidade_respostas} respostas)
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Respostas */}
          {lead.respostas && lead.respostas.length > 0 && (
            <Card className="card-felice">
              <CardHeader>
                <CardTitle className="font-butler text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5 text-dourado" />
                  Respostas do Formulário
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {lead.respostas.map((resposta) => (
                  <div key={resposta.id} className="border-b border-nude/20 pb-4 last:border-0 last:pb-0">
                    <p className="text-sm font-medium text-cafe">
                      {resposta.pergunta?.titulo}
                    </p>
                    <p className="text-cafe/70 mt-1">
                      {resposta.opcao?.texto || resposta.resposta_texto || '-'}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar - Timeline */}
        <div className="space-y-6">
          {/* Conversões */}
          {lead.conversoes && lead.conversoes.length > 0 && (
            <Card className="card-felice border-success/30 bg-success/5">
              <CardHeader>
                <CardTitle className="font-butler text-lg flex items-center gap-2 text-success">
                  <CheckCircle className="h-5 w-5" />
                  Conversões
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {lead.conversoes.map((conversao) => (
                  <div key={conversao.id} className="p-3 bg-white rounded-lg border border-success/20">
                    <div className="flex items-center justify-between">
                      <Badge
                        style={{
                          backgroundColor: `${conversao.nucleo?.cor}20`,
                          color: conversao.nucleo?.cor || '#c29863',
                        }}
                      >
                        {conversao.nucleo?.nome}
                      </Badge>
                      <span className="text-xs text-cafe/60">
                        {format(new Date(conversao.data_conversao), 'dd/MM/yyyy')}
                      </span>
                    </div>
                    {conversao.procedimento && (
                      <p className="text-sm text-cafe mt-2">{conversao.procedimento}</p>
                    )}
                    {conversao.valor && (
                      <p className="text-sm font-medium text-success mt-1">
                        {conversao.valor.toLocaleString('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        })}
                      </p>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Timeline de Follow-ups */}
          <Card className="card-felice">
            <CardHeader>
              <CardTitle className="font-butler text-lg flex items-center gap-2">
                <Clock className="h-5 w-5 text-dourado" />
                Histórico
              </CardTitle>
              <CardDescription className="font-sarabun">
                {totalFollowups} follow-up(s) enviado(s)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {lead.followups && lead.followups.length > 0 ? (
                <div className="relative">
                  {/* Timeline line */}
                  <div className="absolute left-3 top-0 bottom-0 w-px bg-nude/30" />

                  <div className="space-y-4">
                    {lead.followups.map((followup) => (
                      <div key={followup.id} className="relative pl-8">
                        {/* Timeline dot */}
                        <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-dourado/10 border-2 border-dourado flex items-center justify-center">
                          <MessageSquare className="h-3 w-3 text-dourado" />
                        </div>

                        <div className="bg-seda/30 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium text-cafe/60">
                              {followup.tipo_contato === 'whatsapp' ? 'WhatsApp' : followup.tipo_contato}
                            </span>
                            <span className="text-xs text-cafe/40">
                              {format(new Date(followup.data_envio), "dd/MM 'às' HH:mm")}
                            </span>
                          </div>
                          {followup.template && (
                            <Badge variant="outline" className="text-xs mb-2">
                              {followup.template.titulo}
                            </Badge>
                          )}
                          {followup.conteudo_enviado && (
                            <p className="text-sm text-cafe/70 line-clamp-3">
                              {followup.conteudo_enviado}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-center text-cafe/50 py-6">
                  Nenhum follow-up enviado ainda
                </p>
              )}
            </CardContent>
          </Card>

          {/* Danger Zone - Only for admin */}
          {userRole === 'admin' && (
            <Card className="card-felice border-error/30">
              <CardHeader>
                <CardTitle className="font-butler text-lg text-error">Zona de Perigo</CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  variant="outline"
                  onClick={() => setDeleteDialogOpen(true)}
                  className="w-full border-error text-error hover:bg-error hover:text-white"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Excluir Lead
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Dialogs */}
      <SendMessageDialog
        open={messageDialogOpen}
        onOpenChange={setMessageDialogOpen}
        lead={lead as unknown as LeadComInteresses}
        templates={templates}
        onSend={handleSendMessage}
      />

      <MarkConvertedDialog
        open={convertDialogOpen}
        onOpenChange={setConvertDialogOpen}
        lead={lead as unknown as LeadComInteresses}
        nucleos={nucleos}
        onConfirm={handleConvert}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Excluir Lead"
        description={`Tem certeza que deseja excluir "${lead.nome}"? Todos os dados relacionados serão perdidos. Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </div>
  )
}
