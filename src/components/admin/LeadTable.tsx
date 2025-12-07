'use client'

import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  MoreHorizontal,
  MessageSquare,
  Eye,
  Phone,
  CheckCircle,
  Trash2,
} from 'lucide-react'
import type { LeadView, Interesse, Nucleo } from '@/types/database'

export interface LeadComInteresses extends LeadView {
  interesses?: (Interesse & { nucleo: Nucleo })[]
}

interface LeadTableProps {
  leads: LeadComInteresses[]
  onSendMessage: (lead: LeadComInteresses) => void
  onMarkConverted: (lead: LeadComInteresses) => void
  onDelete: (lead: LeadComInteresses) => void
}

export function LeadTable({
  leads,
  onSendMessage,
  onMarkConverted,
  onDelete,
}: LeadTableProps) {
  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case 'aguardando':
        return <Badge className="badge-aguardando">Aguardando</Badge>
      case '1_mensagem':
        return <Badge className="badge-1-mensagem">1 Mensagem</Badge>
      case '2_mensagens':
        return <Badge className="badge-2-mensagens">2 Mensagens</Badge>
      case '3_mais_mensagens':
        return <Badge className="badge-3-mais">3+ Mensagens</Badge>
      case 'convertido':
        return <Badge className="badge-convertido">Convertido</Badge>
      default:
        return <Badge variant="outline">Desconhecido</Badge>
    }
  }

  const getInitials = (nome: string | null) => {
    if (!nome) return '??'
    return nome
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase()
  }

  const formatWhatsApp = (whatsapp: string | null) => {
    if (!whatsapp) return '-'
    const cleaned = whatsapp.replace(/\D/g, '')
    if (cleaned.length === 11) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`
    }
    return whatsapp
  }

  return (
    <div className="rounded-lg border border-nude/30 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-seda/30 hover:bg-seda/30">
            <TableHead>Lead</TableHead>
            <TableHead>WhatsApp</TableHead>
            <TableHead>Interesses</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Data</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leads.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-32 text-center text-cafe/60">
                Nenhum lead encontrado
              </TableCell>
            </TableRow>
          ) : (
            leads.map((lead) => (
              <TableRow key={lead.id} className="group">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="bg-dourado/10 text-dourado text-sm">
                        {getInitials(lead.nome)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <Link
                        href={`/leads/${lead.id}`}
                        className="font-medium text-cafe hover:text-dourado transition-colors"
                      >
                        {lead.nome}
                      </Link>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <a
                    href={`https://wa.me/55${lead.whatsapp?.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cafe/70 hover:text-dourado transition-colors flex items-center gap-1"
                  >
                    <Phone className="h-3 w-3" />
                    {formatWhatsApp(lead.whatsapp)}
                  </a>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {lead.interesses && lead.interesses.length > 0 ? (
                      lead.interesses.slice(0, 2).map((interesse) => (
                        <Badge
                          key={interesse.id}
                          variant="outline"
                          className="text-xs"
                          style={{
                            borderColor: interesse.nucleo?.cor || '#c29863',
                            color: interesse.nucleo?.cor || '#c29863',
                          }}
                        >
                          {interesse.nucleo?.nome}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-cafe/40 text-sm">-</span>
                    )}
                    {lead.interesses && lead.interesses.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{lead.interesses.length - 2}
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>{getStatusBadge(lead.status)}</TableCell>
                <TableCell className="text-cafe/60 text-sm">
                  {lead.created_at
                    ? formatDistanceToNow(new Date(lead.created_at), {
                        addSuffix: true,
                        locale: ptBR,
                      })
                    : '-'}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/leads/${lead.id}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          Ver detalhes
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onSendMessage(lead)}>
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Enviar mensagem
                      </DropdownMenuItem>
                      {lead.status !== 'convertido' && (
                        <DropdownMenuItem onClick={() => onMarkConverted(lead)}>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Marcar como convertido
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => onDelete(lead)}
                        className="text-error focus:text-error"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
