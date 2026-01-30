'use client'

import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { EmptyState } from '@/components/shared/EmptyState'
import { Card, CardContent } from '@/components/ui/card'
import {
  MoreHorizontal,
  MessageSquare,
  CheckCircle,
  Phone,
  Trash2,
  Eye,
  UserPlus,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { IndicacaoView } from '@/types/database'

interface IndicacaoTableProps {
  indicacoes: IndicacaoView[]
  onSendMessage: (indicacao: IndicacaoView) => void
  onMarkConverted: (indicacao: IndicacaoView) => void
  onDelete: (indicacao: IndicacaoView) => void
  userRole: string
}

const statusConfig: Record<
  string,
  { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }
> = {
  aguardando: { label: 'Aguardando', variant: 'secondary' },
  '1_mensagem': { label: '1 mensagem', variant: 'outline' },
  '2_mensagens': { label: '2 mensagens', variant: 'outline' },
  '3_mais_mensagens': { label: '3+ mensagens', variant: 'default' },
  convertido: { label: 'Convertido', variant: 'default' },
}

export function IndicacaoTable({
  indicacoes,
  onSendMessage,
  onMarkConverted,
  onDelete,
  userRole,
}: IndicacaoTableProps) {
  const formatPhone = (phone: string | null) => {
    if (!phone) return '-'
    const cleaned = phone.replace(/\D/g, '')
    if (cleaned.length === 11) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`
    }
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`
    }
    return phone
  }

  if (indicacoes.length === 0) {
    return (
      <Card className="card-felice">
        <CardContent className="py-12">
          <EmptyState
            icon={UserPlus}
            title="Nenhuma indicacao encontrada"
            description="As indicacoes feitas pelos pacientes aparecerao aqui."
          />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="card-felice overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-nude/30 hover:bg-transparent">
            <TableHead className="text-cafe/70 w-12">#</TableHead>
            <TableHead className="text-cafe/70">Indicacao</TableHead>
            <TableHead className="text-cafe/70">Telefone</TableHead>
            <TableHead className="text-cafe/70">Parentesco</TableHead>
            <TableHead className="text-cafe/70">Indicado por</TableHead>
            <TableHead className="text-cafe/70">Profissional</TableHead>
            <TableHead className="text-cafe/70">Status</TableHead>
            <TableHead className="text-cafe/70">Data</TableHead>
            <TableHead className="text-cafe/70 text-right">Acoes</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {indicacoes.map((indicacao, index) => {
            const status = statusConfig[indicacao.status || 'aguardando']
            const initials = indicacao.nome
              ?.split(' ')
              .map((n) => n[0])
              .slice(0, 2)
              .join('')
              .toUpperCase()

            return (
              <TableRow
                key={indicacao.id}
                className="border-nude/30 hover:bg-seda/30"
              >
                {/* Numeração */}
                <TableCell className="text-cafe/50 font-medium">
                  {index + 1}
                </TableCell>

                {/* Nome */}
                <TableCell>
                  <Link
                    href={`/indicacoes/${indicacao.id}`}
                    className="flex items-center gap-3 group"
                  >
                    <Avatar className="h-10 w-10 border-2 border-nude/50">
                      <AvatarFallback className="bg-dourado/10 text-dourado text-sm">
                        {initials || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-cafe group-hover:text-dourado transition-colors">
                      {indicacao.nome}
                    </span>
                  </Link>
                </TableCell>

                {/* Telefone */}
                <TableCell>
                  <a
                    href={`https://wa.me/55${indicacao.telefone?.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-cafe/70 hover:text-success transition-colors"
                  >
                    <Phone className="h-4 w-4" />
                    {formatPhone(indicacao.telefone)}
                  </a>
                </TableCell>

                {/* Parentesco */}
                <TableCell>
                  <span className="text-cafe/70">
                    {indicacao.parentesco || '-'}
                  </span>
                </TableCell>

                {/* Indicado por */}
                <TableCell>
                  <div className="text-sm">
                    <span className="text-cafe">{indicacao.indicado_por_nome}</span>
                    {indicacao.indicado_por_whatsapp && (
                      <a
                        href={`https://wa.me/55${indicacao.indicado_por_whatsapp.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-cafe/50 hover:text-success transition-colors text-xs"
                      >
                        {formatPhone(indicacao.indicado_por_whatsapp)}
                      </a>
                    )}
                  </div>
                </TableCell>

                {/* Profissional */}
                <TableCell>
                  <span className="text-cafe/70">
                    {indicacao.profissional_nome || '-'}
                  </span>
                </TableCell>

                {/* Status */}
                <TableCell>
                  <Badge
                    variant={status.variant}
                    className={
                      indicacao.status === 'convertido'
                        ? 'bg-success/10 text-success border-success/30'
                        : indicacao.status === 'aguardando'
                          ? 'bg-warning/10 text-warning border-warning/30'
                          : ''
                    }
                  >
                    {status.label}
                  </Badge>
                </TableCell>

                {/* Data */}
                <TableCell className="text-cafe/60 text-sm">
                  {indicacao.created_at
                    ? formatDistanceToNow(new Date(indicacao.created_at), {
                        addSuffix: true,
                        locale: ptBR,
                      })
                    : '-'}
                </TableCell>

                {/* Acoes */}
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-cafe/50 hover:text-cafe"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem asChild>
                        <Link href={`/indicacoes/${indicacao.id}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          Ver detalhes
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onSendMessage(indicacao)}>
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Enviar mensagem
                      </DropdownMenuItem>
                      {!indicacao.convertido && (
                        <DropdownMenuItem onClick={() => onMarkConverted(indicacao)}>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Marcar convertido
                        </DropdownMenuItem>
                      )}
                      {userRole === 'admin' && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => onDelete(indicacao)}
                            className="text-error focus:text-error"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Excluir
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </Card>
  )
}
