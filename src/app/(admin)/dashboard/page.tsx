'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import {
  Users,
  TrendingUp,
  MessageSquare,
  Target,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react'
import type { DashboardView } from '@/types/database'

interface DashboardStats {
  totalLeads: number
  leadsHoje: number
  totalFollowups: number
  totalConversoes: number
  taxaConversaoGeral: number
  nucleosStats: DashboardView[]
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadStats() {
      const supabase = createClient()

      try {
        // Carregar estatísticas dos núcleos
        const { data: nucleosData } = await supabase
          .from('form_dashboard_view')
          .select('*')

        // Contar leads totais
        const { count: totalLeads } = await supabase
          .from('form_pacientes')
          .select('*', { count: 'exact', head: true })

        // Contar leads de hoje
        const today = new Date().toISOString().split('T')[0]
        const { count: leadsHoje } = await supabase
          .from('form_pacientes')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', today)

        // Contar followups
        const { count: totalFollowups } = await supabase
          .from('form_followups')
          .select('*', { count: 'exact', head: true })

        // Contar conversões
        const { count: totalConversoes } = await supabase
          .from('form_conversoes')
          .select('*', { count: 'exact', head: true })

        // Calcular taxa de conversão geral
        const taxaConversaoGeral = totalLeads && totalLeads > 0
          ? ((totalConversoes || 0) / totalLeads) * 100
          : 0

        setStats({
          totalLeads: totalLeads || 0,
          leadsHoje: leadsHoje || 0,
          totalFollowups: totalFollowups || 0,
          totalConversoes: totalConversoes || 0,
          taxaConversaoGeral,
          nucleosStats: nucleosData || [],
        })
      } catch (error) {
        console.error('Erro ao carregar estatísticas:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadStats()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <LoadingSpinner size="lg" text="Carregando dashboard..." />
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <p className="text-cafe/70">Erro ao carregar estatísticas</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Visão geral do sistema de endomarketing</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total de Leads"
          value={stats.totalLeads}
          description={`${stats.leadsHoje} novos hoje`}
          icon={Users}
          trend={stats.leadsHoje > 0 ? 'up' : 'neutral'}
        />
        <StatsCard
          title="Follow-ups Enviados"
          value={stats.totalFollowups}
          description="Mensagens enviadas"
          icon={MessageSquare}
        />
        <StatsCard
          title="Conversões"
          value={stats.totalConversoes}
          description="Agendamentos realizados"
          icon={Target}
          trend={stats.totalConversoes > 0 ? 'up' : 'neutral'}
        />
        <StatsCard
          title="Taxa de Conversão"
          value={`${stats.taxaConversaoGeral.toFixed(1)}%`}
          description="Conversão geral"
          icon={TrendingUp}
          trend={stats.taxaConversaoGeral > 10 ? 'up' : stats.taxaConversaoGeral > 0 ? 'neutral' : 'down'}
        />
      </div>

      {/* Núcleos Performance */}
      <Card className="card-felice">
        <CardHeader>
          <CardTitle className="font-butler">Performance por Núcleo</CardTitle>
          <CardDescription className="font-sarabun">
            Estatísticas de leads, follow-ups e conversões por especialidade
          </CardDescription>
        </CardHeader>
        <CardContent>
          {stats.nucleosStats.length === 0 ? (
            <p className="text-center text-cafe/60 py-8 font-sarabun">
              Nenhum dado disponível ainda. Os dados aparecerão conforme os leads preencherem o formulário.
            </p>
          ) : (
            <div className="space-y-4">
              {stats.nucleosStats.map((nucleo) => (
                <div
                  key={nucleo.nucleo_id}
                  className="flex items-center justify-between p-4 rounded-lg bg-seda/30 border border-nude/20"
                >
                  <div className="flex items-center gap-4">
                    <div className="font-sarabun">
                      <p className="font-medium text-cafe">{nucleo.nucleo_nome}</p>
                      <p className="text-sm text-cafe/60">
                        {nucleo.total_interessados || 0} interessados
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 text-sm">
                    <div className="text-center">
                      <p className="font-medium text-cafe">{nucleo.total_followups || 0}</p>
                      <p className="text-cafe/60">Follow-ups</p>
                    </div>
                    <div className="text-center">
                      <p className="font-medium text-cafe">{nucleo.total_conversoes || 0}</p>
                      <p className="text-cafe/60">Conversões</p>
                    </div>
                    <div className="text-center">
                      <Badge
                        className={`font-sarabun ${
                          (nucleo.taxa_conversao || 0) >= 20
                            ? 'badge-convertido'
                            : (nucleo.taxa_conversao || 0) >= 10
                            ? 'badge-3-mais'
                            : 'badge-aguardando'
                        }`}
                      >
                        {(nucleo.taxa_conversao || 0).toFixed(1)}%
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

interface StatsCardProps {
  title: string
  value: number | string
  description: string
  icon: React.ComponentType<{ className?: string }>
  trend?: 'up' | 'down' | 'neutral'
}

function StatsCard({ title, value, description, icon: Icon, trend = 'neutral' }: StatsCardProps) {
  return (
    <Card className="card-felice">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-cafe/70 font-sarabun">
          {title}
        </CardTitle>
        <Icon className="h-5 w-5 text-dourado" />
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-cafe font-butler">{value}</span>
          {trend === 'up' && (
            <ArrowUpRight className="h-4 w-4 text-success" />
          )}
          {trend === 'down' && (
            <ArrowDownRight className="h-4 w-4 text-error" />
          )}
        </div>
        <p className="text-xs text-cafe/60 font-sarabun mt-1">{description}</p>
      </CardContent>
    </Card>
  )
}
