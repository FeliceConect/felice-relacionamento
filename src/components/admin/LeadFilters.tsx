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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { Search, Filter, CalendarIcon, X } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { Nucleo } from '@/types/database'
import type { DateRange } from 'react-day-picker'

export interface LeadFiltersState {
  search: string
  status: string
  nucleo: string
  dateRange: DateRange | undefined
}

interface LeadFiltersProps {
  filters: LeadFiltersState
  nucleos: Nucleo[]
  onFiltersChange: (filters: LeadFiltersState) => void
  onClearFilters: () => void
  totalResults: number
}

const statusOptions = [
  { value: 'all', label: 'Todos os status' },
  { value: 'aguardando', label: 'Aguardando' },
  { value: '1_mensagem', label: '1 Mensagem' },
  { value: '2_mensagens', label: '2 Mensagens' },
  { value: '3_mais_mensagens', label: '3+ Mensagens' },
  { value: 'convertido', label: 'Convertido' },
]

export function LeadFilters({
  filters,
  nucleos,
  onFiltersChange,
  onClearFilters,
  totalResults,
}: LeadFiltersProps) {
  const hasActiveFilters =
    filters.search ||
    filters.status !== 'all' ||
    filters.nucleo !== 'all' ||
    filters.dateRange?.from

  const activeFiltersCount = [
    filters.search,
    filters.status !== 'all' ? filters.status : null,
    filters.nucleo !== 'all' ? filters.nucleo : null,
    filters.dateRange?.from,
  ].filter(Boolean).length

  return (
    <div className="space-y-4">
      {/* Search and main filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-cafe/40" />
          <Input
            placeholder="Buscar por nome ou WhatsApp..."
            value={filters.search}
            onChange={(e) =>
              onFiltersChange({ ...filters, search: e.target.value })
            }
            className="pl-10 input-felice"
          />
        </div>

        {/* Status filter */}
        <Select
          value={filters.status}
          onValueChange={(value) =>
            onFiltersChange({ ...filters, status: value })
          }
        >
          <SelectTrigger className="w-full sm:w-[180px] input-felice">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Núcleo filter */}
        <Select
          value={filters.nucleo}
          onValueChange={(value) =>
            onFiltersChange({ ...filters, nucleo: value })
          }
        >
          <SelectTrigger className="w-full sm:w-[180px] input-felice">
            <SelectValue placeholder="Núcleo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os núcleos</SelectItem>
            {nucleos.map((nucleo) => (
              <SelectItem key={nucleo.id} value={nucleo.id}>
                {nucleo.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Date range filter */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full sm:w-[200px] justify-start text-left font-normal input-felice"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {filters.dateRange?.from ? (
                filters.dateRange.to ? (
                  <>
                    {format(filters.dateRange.from, 'dd/MM', { locale: ptBR })} -{' '}
                    {format(filters.dateRange.to, 'dd/MM', { locale: ptBR })}
                  </>
                ) : (
                  format(filters.dateRange.from, 'dd/MM/yyyy', { locale: ptBR })
                )
              ) : (
                <span className="text-cafe/50">Período</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={filters.dateRange?.from}
              selected={filters.dateRange}
              onSelect={(range) =>
                onFiltersChange({ ...filters, dateRange: range })
              }
              numberOfMonths={2}
              locale={ptBR}
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Active filters and results count */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-cafe/60">
            {totalResults} {totalResults === 1 ? 'resultado' : 'resultados'}
          </span>

          {hasActiveFilters && (
            <>
              <span className="text-cafe/30">|</span>
              <div className="flex items-center gap-2">
                <Filter className="h-3 w-3 text-cafe/40" />
                <span className="text-sm text-cafe/60">
                  {activeFiltersCount} {activeFiltersCount === 1 ? 'filtro' : 'filtros'}
                </span>
              </div>
            </>
          )}
        </div>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="text-cafe/60 hover:text-cafe"
          >
            <X className="mr-1 h-3 w-3" />
            Limpar filtros
          </Button>
        )}
      </div>
    </div>
  )
}
