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
import {
  SendIndicacaoMessageDialog,
  MarkIndicacaoConvertedDialog,
} from '@/components/admin'
import { useToast } from '@/lib/hooks/use-toast'
import { useSessionGuard } from '@/lib/hooks/useSessionGuard'
import {
  ArrowLeft,
  Phone,
  MessageSquare,
  CheckCircle,
  Calendar,
  Clock,
  ExternalLink,
  Trash2,
  UserPlus,
  User,
} from 'lucide-react'
import type { IndicacaoComDetalhes, Nucleo, Template, IndicacaoView, ProfissionalBase } from '@/types/database'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Stethoscope, Pencil } from 'lucide-react'

// Helper para formatar telefone
function formatPhoneDisplay(value: string): string {
  const cleaned = value.replace(/\D/g, '')
  if (cleaned.length <= 2) return cleaned
  if (cleaned.length <= 7) return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2)}`
  if (cleaned.length <= 11) return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`
  return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7, 11)}`
}

export default function IndicacaoDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const { ensureSession, handleMutationError } = useSessionGuard()
  const indicacaoId = params.id as string

  const [indicacao, setIndicacao] = useState<IndicacaoComDetalhes | null>(null)
  const [nucleos, setNucleos] = useState<Nucleo[]>([])
  const [templates, setTemplates] = useState<(Template & { nucleo: Nucleo | null })[]>([])
  const [profissionais, setProfissionais] = useState<ProfissionalBase[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [userRole, setUserRole] = useState<string>('atendente')
  const [isEditingProfissional, setIsEditingProfissional] = useState(false)
  const [isSavingProfissional, setIsSavingProfissional] = useState(false)

  // Dialogs
  const [messageDialogOpen, setMessageDialogOpen] = useState(false)
  const [convertDialogOpen, setConvertDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  useEffect(() => {
    async function loadIndicacao() {
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
        // Carregar indicacao
        const { data: indicacaoData, error: indicacaoError } = await supabase
          .from('form_indicacoes')
          .select('*')
          .eq('id', indicacaoId)
          .single()

        if (indicacaoError) throw indicacaoError

        // Carregar paciente que indicou
        const { data: paciente } = await supabase
          .from('form_pacientes')
          .select('*')
          .eq('id', indicacaoData.paciente_id)
          .single()

        // Carregar followups
        const { data: followups } = await supabase
          .from('form_indicacoes_followups')
          .select('*, template:form_templates(*)')
          .eq('indicacao_id', indicacaoId)
          .order('data_envio', { ascending: false })

        // Carregar conversoes
        const { data: conversoes } = await supabase
          .from('form_indicacoes_conversoes')
          .select('*, nucleo:form_nucleos(*)')
          .eq('indicacao_id', indicacaoId)
          .order('data_conversao', { ascending: false })

        setIndicacao({
          ...indicacaoData,
          paciente: paciente!,
          followups: followups || [],
          conversoes: conversoes || [],
        })

        // Carregar nucleos
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

        // Carregar profissionais
        const { data: profissionaisData } = await supabase
          .from('form_profissionais')
          .select('*')
          .eq('ativo', true)
          .order('ordem')

        // Ordenar para colocar Dr Leonardo em primeiro
        const sortedProfissionais = (profissionaisData || []).sort((a, b) => {
          if (a.nome.toLowerCase().includes('leonardo')) return -1
          if (b.nome.toLowerCase().includes('leonardo')) return 1
          return a.ordem - b.ordem
        })

        setProfissionais(sortedProfissionais)
      } catch (error) {
        console.error('Erro ao carregar indicacao:', error)
        toast({
          variant: 'destructive',
          title: 'Erro',
          description: 'Nao foi possivel carregar os dados da indicacao.',
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadIndicacao()
  }, [indicacaoId, toast])

  const handleSendMessage = async (
    _indicacaoId: string,
    message: string,
    templateId?: string
  ) => {
    if (!(await ensureSession())) return

    const supabase = createClient()

    try {
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

      window.location.reload()
    } catch (error) {
      console.error('Erro ao registrar mensagem:', error)
      handleMutationError(error, 'Nao foi possivel registrar a mensagem.')
    }
  }

  const handleConvert = async (data: {
    indicacaoId: string
    nucleoId: string
    procedimento: string
    valor: number | null
    observacoes: string
  }) => {
    if (!(await ensureSession())) return

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

      window.location.reload()
    } catch (error) {
      console.error('Erro ao registrar conversao:', error)
      handleMutationError(error, 'Nao foi possivel registrar a conversao.')
    }
  }

  const handleUpdateProfissional = async (profissionalId: string | null) => {
    if (!(await ensureSession())) return

    const supabase = createClient()
    setIsSavingProfissional(true)

    try {
      const { error } = await supabase
        .from('form_indicacoes')
        .update({ profissional_id: profissionalId })
        .eq('id', indicacaoId)

      if (error) throw error

      // Atualizar estado local
      setIndicacao(prev => prev ? { ...prev, profissional_id: profissionalId } : null)
      setIsEditingProfissional(false)

      toast({
        title: 'Profissional atualizado',
        description: 'O profissional foi vinculado com sucesso.',
      })
    } catch (error) {
      console.error('Erro ao atualizar profissional:', error)
      handleMutationError(error, 'Nao foi possivel atualizar o profissional.')
    } finally {
      setIsSavingProfissional(false)
    }
  }

  const handleDelete = async () => {
    if (!(await ensureSession())) return

    const supabase = createClient()

    try {
      // Deletar em ordem para respeitar foreign keys
      // 1. Deletar follow-ups
      const { error: followupsError } = await supabase
        .from('form_indicacoes_followups')
        .delete()
        .eq('indicacao_id', indicacaoId)

      if (followupsError) {
        console.error('Erro ao deletar followups:', followupsError)
      }

      // 2. Deletar conversoes
      const { error: conversoesError } = await supabase
        .from('form_indicacoes_conversoes')
        .delete()
        .eq('indicacao_id', indicacaoId)

      if (conversoesError) {
        console.error('Erro ao deletar conversoes:', conversoesError)
      }

      // 3. Finalmente, deletar a indicacao
      const { error: indicacaoError } = await supabase
        .from('form_indicacoes')
        .delete()
        .eq('id', indicacaoId)

      if (indicacaoError) throw indicacaoError

      toast({
        title: 'Indicacao excluida',
        description: 'A indicacao e todos os dados relacionados foram excluidos com sucesso.',
      })

      router.push('/indicacoes')
    } catch (error) {
      console.error('Erro ao excluir indicacao:', error)
      handleMutationError(error, 'Nao foi possivel excluir a indicacao.')
    }
  }

  // Create a view-like object for the dialogs
  const indicacaoView: IndicacaoView | null = indicacao ? {
    id: indicacao.id,
    nome: indicacao.nome,
    telefone: indicacao.telefone,
    telefone_formatado: indicacao.telefone_formatado,
    parentesco: indicacao.parentesco,
    paciente_id: indicacao.paciente_id,
    pergunta_id: indicacao.pergunta_id,
    profissional_id: indicacao.profissional_id,
    created_at: indicacao.created_at,
    updated_at: indicacao.updated_at,
    indicado_por_nome: indicacao.paciente?.nome || null,
    indicado_por_whatsapp: indicacao.paciente?.whatsapp || null,
    profissional_nome: profissionais.find(p => p.id === indicacao.profissional_id)?.nome || null,
    total_followups: indicacao.followups?.length || 0,
    status: indicacao.conversoes?.length > 0 ? 'convertido' :
            indicacao.followups?.length >= 3 ? '3_mais_mensagens' :
            indicacao.followups?.length === 2 ? '2_mensagens' :
            indicacao.followups?.length === 1 ? '1_mensagem' : 'aguardando',
    convertido: indicacao.conversoes?.length > 0,
    nucleo_convertido_id: indicacao.conversoes?.[0]?.nucleo_id || null,
    data_conversao: indicacao.conversoes?.[0]?.data_conversao || null,
  } : null

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <LoadingSpinner size="lg" text="Carregando..." />
      </div>
    )
  }

  if (!indicacao) {
    return (
      <div className="text-center py-12">
        <p className="text-cafe/60">Indicacao nao encontrada</p>
        <Link href="/indicacoes">
          <Button variant="link" className="mt-2">
            Voltar para lista
          </Button>
        </Link>
      </div>
    )
  }

  const initials = indicacao.nome
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  const isConverted = indicacao.conversoes && indicacao.conversoes.length > 0
  const totalFollowups = indicacao.followups?.length || 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/indicacoes">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="page-title">{indicacao.nome}</h1>
          <p className="page-subtitle">
            Indicacao desde {format(new Date(indicacao.created_at), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
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
                    <h2 className="font-butler text-xl text-cafe">{indicacao.nome}</h2>
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
                      href={`https://wa.me/55${indicacao.telefone.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-cafe/70 hover:text-dourado transition-colors"
                    >
                      <Phone className="h-4 w-4" />
                      {indicacao.telefone_formatado || formatPhoneDisplay(indicacao.telefone)}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                    {indicacao.parentesco && (
                      <div className="flex items-center gap-2 text-cafe/60 text-sm">
                        <User className="h-4 w-4" />
                        {indicacao.parentesco}
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-cafe/60 text-sm">
                      <Stethoscope className="h-4 w-4" />
                      {isEditingProfissional ? (
                        <Select
                          value={indicacao.profissional_id || 'none'}
                          onValueChange={(value) => handleUpdateProfissional(value === 'none' ? null : value)}
                          disabled={isSavingProfissional}
                        >
                          <SelectTrigger className="h-7 w-48 text-xs">
                            <SelectValue placeholder="Selecione..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Nenhum profissional</SelectItem>
                            {profissionais.map((prof) => (
                              <SelectItem key={prof.id} value={prof.id}>
                                {prof.nome}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <span>
                          {profissionais.find(p => p.id === indicacao.profissional_id)?.nome || 'Sem profissional'}
                        </span>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsEditingProfissional(!isEditingProfissional)}
                        className="h-6 w-6 p-0 text-cafe/40 hover:text-dourado"
                        disabled={isSavingProfissional}
                      >
                        <Pencil className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-2 text-cafe/60 text-sm">
                      <Calendar className="h-4 w-4" />
                      {formatDistanceToNow(new Date(indicacao.created_at), {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Indicado por */}
          <Card className="card-felice">
            <CardHeader>
              <CardTitle className="font-butler text-lg flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-dourado" />
                Indicado por
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-seda text-cafe text-sm font-butler">
                    {indicacao.paciente?.nome
                      ?.split(' ')
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join('')
                      .toUpperCase() || '?'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <Link
                    href={`/leads/${indicacao.paciente_id}`}
                    className="font-medium text-cafe hover:text-dourado transition-colors"
                  >
                    {indicacao.paciente?.nome}
                  </Link>
                  {indicacao.paciente?.whatsapp && (
                    <a
                      href={`https://wa.me/55${indicacao.paciente.whatsapp.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-sm text-cafe/60 hover:text-dourado transition-colors"
                    >
                      <Phone className="h-3 w-3" />
                      {indicacao.paciente.whatsapp_formatado || formatPhoneDisplay(indicacao.paciente.whatsapp)}
                    </a>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Timeline */}
        <div className="space-y-6">
          {/* Conversoes */}
          {indicacao.conversoes && indicacao.conversoes.length > 0 && (
            <Card className="card-felice border-success/30 bg-success/5">
              <CardHeader>
                <CardTitle className="font-butler text-lg flex items-center gap-2 text-success">
                  <CheckCircle className="h-5 w-5" />
                  Conversoes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {indicacao.conversoes.map((conversao) => (
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
                Historico
              </CardTitle>
              <CardDescription className="font-sarabun">
                {totalFollowups} follow-up(s) enviado(s)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {indicacao.followups && indicacao.followups.length > 0 ? (
                <div className="relative">
                  {/* Timeline line */}
                  <div className="absolute left-3 top-0 bottom-0 w-px bg-nude/30" />

                  <div className="space-y-4">
                    {indicacao.followups.map((followup) => (
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
                              {format(new Date(followup.data_envio), "dd/MM 'as' HH:mm")}
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
                  Excluir Indicacao
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Dialogs */}
      <SendIndicacaoMessageDialog
        open={messageDialogOpen}
        onOpenChange={setMessageDialogOpen}
        indicacao={indicacaoView}
        templates={templates}
        onSend={handleSendMessage}
      />

      <MarkIndicacaoConvertedDialog
        open={convertDialogOpen}
        onOpenChange={setConvertDialogOpen}
        indicacao={indicacaoView}
        nucleos={nucleos}
        onConfirm={handleConvert}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Excluir Indicacao"
        description={`Tem certeza que deseja excluir "${indicacao.nome}"? Todos os dados relacionados serao perdidos. Esta acao nao pode ser desfeita.`}
        confirmLabel="Excluir"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </div>
  )
}
