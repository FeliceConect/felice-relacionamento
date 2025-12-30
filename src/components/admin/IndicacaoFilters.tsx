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
import { Search, X } from 'lucide-react'
import type { DateRange } from 'react-day-picker'

export interface IndicacaoFiltersState {
  search: string
  status: string
  parentesco: string
  dateRange: DateRange | undefined
}

interface IndicacaoFiltersProps {
  filters: IndicacaoFiltersState
  onFiltersChange: (filters: IndicacaoFiltersState) => void
  onClearFilters: () => void
  totalResults: number
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
}: IndicacaoFiltersProps) {
  const activeFiltersCount = [
    filters.search,
    filters.status !== 'all' ? filters.status : null,
    filters.parentesco !== 'all' ? filters.parentesco : null,
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
