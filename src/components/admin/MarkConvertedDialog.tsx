'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2, CheckCircle, DollarSign } from 'lucide-react'
import type { Nucleo } from '@/types/database'
import type { LeadComInteresses } from './LeadTable'

interface MarkConvertedDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  lead: LeadComInteresses | null
  nucleos: Nucleo[]
  onConfirm: (data: {
    leadId: string
    nucleoId: string
    procedimento: string
    valor: number | null
    observacoes: string
  }) => Promise<void>
}

export function MarkConvertedDialog({
  open,
  onOpenChange,
  lead,
  nucleos,
  onConfirm,
}: MarkConvertedDialogProps) {
  const [nucleoId, setNucleoId] = useState('')
  const [procedimento, setProcedimento] = useState('')
  const [valor, setValor] = useState('')
  const [observacoes, setObservacoes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!lead?.id || !nucleoId) return

    setIsSubmitting(true)
    try {
      await onConfirm({
        leadId: lead.id,
        nucleoId,
        procedimento,
        valor: valor ? parseFloat(valor.replace(/[^\d.,]/g, '').replace(',', '.')) : null,
        observacoes,
      })
      onOpenChange(false)
      // Reset form
      setNucleoId('')
      setProcedimento('')
      setValor('')
      setObservacoes('')
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatCurrency = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    const amount = parseInt(numbers) / 100
    return amount.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    })
  }

  const handleValorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '')
    if (value) {
      setValor(formatCurrency(value))
    } else {
      setValor('')
    }
  }

  if (!lead) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-butler text-cafe">
            <CheckCircle className="h-5 w-5 text-success" />
            Registrar Conversão
          </DialogTitle>
          <DialogDescription className="font-sarabun">
            Registrar conversão de <strong>{lead.nome}</strong>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {/* Núcleo */}
          <div>
            <Label className="label-felice">Núcleo *</Label>
            <Select value={nucleoId} onValueChange={setNucleoId} required>
              <SelectTrigger className="input-felice">
                <SelectValue placeholder="Selecione o núcleo..." />
              </SelectTrigger>
              <SelectContent>
                {nucleos.map((nucleo) => (
                  <SelectItem key={nucleo.id} value={nucleo.id}>
                    {nucleo.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Procedimento */}
          <div>
            <Label className="label-felice">Procedimento</Label>
            <Input
              value={procedimento}
              onChange={(e) => setProcedimento(e.target.value)}
              placeholder="Ex: Rinoplastia, Botox..."
              className="input-felice"
            />
          </div>

          {/* Valor */}
          <div>
            <Label className="label-felice">Valor</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-cafe/40" />
              <Input
                value={valor}
                onChange={handleValorChange}
                placeholder="R$ 0,00"
                className="input-felice pl-10"
              />
            </div>
          </div>

          {/* Observações */}
          <div>
            <Label className="label-felice">Observações</Label>
            <Textarea
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Informações adicionais..."
              className="input-felice"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-cafe/30"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !nucleoId}
              className="bg-success hover:bg-success-600 text-white"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Registrar Conversão
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
