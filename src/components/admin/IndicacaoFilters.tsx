'use client'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Search, X, Calendar } from 'lucide-react'
import type { DateRange } from 'react-day-picker'
import type { ProfissionalBase } from '@/types/database'
import { format } from 'date-fns'

export interface IndicacaoFiltersState {
  search: string
  status: string
  parentesco: string
  profissional: string
  dateRange: DateRange | undefined
}

interface IndicacaoFiltersProps {
  filters: IndicacaoFiltersState
  onFiltersChange: (filters: IndicacaoFiltersState) => void
  onClearFilters: () => void
  totalResults: number
  profissionais?: ProfissionalBase[]
}

const statusOptions = [
  { value: 'all', label: 'Todos os status' },
  { value: 'aguardando', label: 'Aguardando' },
  { value: '1_mensagem', label: '1 mensagem' },
  { value: '2_mensagens', label: '2 mensagens' },
  { value: '3_mais_mensagens', label: '3+ mensagens' },
  { value: 'convertido', label: 'Convertido' },
]

const parentescoOptions = [
  { value: 'all', label: 'Todos os parentescos' },
  { value: 'Mae', label: 'Mae' },
  { value: 'Pai', label: 'Pai' },
  { value: 'Esposa', label: 'Esposa' },
  { value: 'Esposo', label: 'Esposo' },
  { value: 'Filha', label: 'Filha' },
  { value: 'Filho', label: 'Filho' },
  { value: 'Irma', label: 'Irma' },
  { value: 'Irmao', label: 'Irmao' },
  { value: 'Sogra', label: 'Sogra' },
  { value: 'Sogro', label: 'Sogro' },
  { value: 'Cunhada', label: 'Cunhada' },
  { value: 'Cunhado', label: 'Cunhado' },
  { value: 'Amiga', label: 'Amiga' },
  { value: 'Amigo', label: 'Amigo' },
  { value: 'Colega de trabalho', label: 'Colega de trabalho' },
  { value: 'Outro', label: 'Outro' },
]

export function IndicacaoFilters({
  filters,
  onFiltersChange,
  onClearFilters,
  totalResults,
  profissionais = [],
}: IndicacaoFiltersProps) {
  const activeFiltersCount = [
    filters.search,
    filters.status !== 'all' ? filters.status : null,
    filters.parentesco !== 'all' ? filters.parentesco : null,
    filters.profissional !== 'all' ? filters.profissional : null,
    filters.dateRange?.from ? 'date' : null,
  ].filter(Boolean).length

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-cafe/40" />
          <Input
            placeholder="Buscar por nome ou telefone..."
            value={filters.search}
            onChange={(e) =>
              onFiltersChange({ ...filters, search: e.target.value })
            }
            className="input-felice pl-10"
          />
        </div>

        {/* Status */}
        <Select
          value={filters.status}
          onValueChange={(value) =>
            onFiltersChange({ ...filters, status: value })
          }
        >
          <SelectTrigger className="w-full sm:w-48 input-felice">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Parentesco */}
        <Select
          value={filters.parentesco}
          onValueChange={(value) =>
            onFiltersChange({ ...filters, parentesco: value })
          }
        >
          <SelectTrigger className="w-full sm:w-48 input-felice">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {parentescoOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Profissional */}
        {profissionais.length > 0 && (
          <Select
            value={filters.profissional}
            onValueChange={(value) =>
              onFiltersChange({ ...filters, profissional: value })
            }
          >
            <SelectTrigger className="w-full sm:w-52 input-felice">
              <SelectValue placeholder="Todos os profissionais" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os profissionais</SelectItem>
              <SelectItem value="none">Sem profissional</SelectItem>
              {profissionais.map((prof) => (
                <SelectItem key={prof.id} value={prof.id}>
                  {prof.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Filtro de Data */}
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-cafe/40" />
          <span className="text-sm text-cafe/60">Periodo:</span>
        </div>
        <div className="flex items-center gap-2">
          <Input
            type="date"
            value={filters.dateRange?.from ? format(filters.dateRange.from, 'yyyy-MM-dd') : ''}
            onChange={(e) => {
              const date = e.target.value ? new Date(e.target.value + 'T00:00:00') : undefined
              onFiltersChange({
                ...filters,
                dateRange: date ? { from: date, to: filters.dateRange?.to } : undefined
              })
            }}
            className="input-felice w-40"
            placeholder="Data inicial"
          />
          <span className="text-cafe/40">ate</span>
          <Input
            type="date"
            value={filters.dateRange?.to ? format(filters.dateRange.to, 'yyyy-MM-dd') : ''}
            onChange={(e) => {
              const date = e.target.value ? new Date(e.target.value + 'T23:59:59') : undefined
              onFiltersChange({
                ...filters,
                dateRange: filters.dateRange?.from
                  ? { from: filters.dateRange.from, to: date }
                  : undefined
              })
            }}
            className="input-felice w-40"
            placeholder="Data final"
            disabled={!filters.dateRange?.from}
          />
        </div>
      </div>

      {/* Results and clear */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-cafe/60">
            {totalResults} {totalResults === 1 ? 'indicacao' : 'indicacoes'} encontrada{totalResults === 1 ? '' : 's'}
          </span>
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {activeFiltersCount} filtro{activeFiltersCount > 1 ? 's' : ''} ativo{activeFiltersCount > 1 ? 's' : ''}
            </Badge>
          )}
        </div>

        {activeFiltersCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="text-cafe/60 hover:text-cafe"
          >
            <X className="mr-1 h-4 w-4" />
            Limpar filtros
          </Button>
        )}
      </div>
    </div>
  )
}
