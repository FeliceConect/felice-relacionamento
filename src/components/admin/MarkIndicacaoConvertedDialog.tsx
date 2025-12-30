'use client'

import { useState, useEffect } from 'react'
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
import { Loader2, CheckCircle } from 'lucide-react'
import type { Nucleo, IndicacaoView } from '@/types/database'

interface MarkIndicacaoConvertedDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  indicacao: IndicacaoView | null
  nucleos: Nucleo[]
  onConfirm: (data: {
    indicacaoId: string
    nucleoId: string
    procedimento: string
    valor: number | null
    observacoes: string
  }) => Promise<void>
}

export function MarkIndicacaoConvertedDialog({
  open,
  onOpenChange,
  indicacao,
  nucleos,
  onConfirm,
}: MarkIndicacaoConvertedDialogProps) {
  const [nucleoId, setNucleoId] = useState('')
  const [procedimento, setProcedimento] = useState('')
  const [valor, setValor] = useState('')
  const [observacoes, setObservacoes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setNucleoId('')
      setProcedimento('')
      setValor('')
      setObservacoes('')
    }
  }, [open])

  const handleSubmit = async () => {
    if (!indicacao?.id || !nucleoId) return

    setIsSubmitting(true)
    try {
      await onConfirm({
        indicacaoId: indicacao.id,
        nucleoId,
        procedimento,
        valor: valor ? parseFloat(valor.replace(/[^\d,]/g, '').replace(',', '.')) : null,
        observacoes,
      })
      onOpenChange(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatCurrency = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    if (!numbers) return ''

    const amount = parseInt(numbers) / 100
    return amount.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    })
  }

  const handleValorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCurrency(e.target.value)
    setValor(formatted)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-butler text-cafe">
            Marcar como Convertido
          </DialogTitle>
          <DialogDescription className="font-sarabun">
            Registre a conversao de {indicacao?.nome}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Nucleo */}
          <div>
            <Label className="label-felice">Nucleo *</Label>
            <Select value={nucleoId} onValueChange={setNucleoId}>
              <SelectTrigger className="input-felice">
                <SelectValue placeholder="Selecione o nucleo..." />
              </SelectTrigger>
              <SelectContent>
                {nucleos.map((nucleo) => (
                  <SelectItem key={nucleo.id} value={nucleo.id}>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: nucleo.cor || '#c29863' }}
                      />
                      {nucleo.nome}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Procedimento */}
          <div>
            <Label className="label-felice">Procedimento (opcional)</Label>
            <Input
              value={procedimento}
              onChange={(e) => setProcedimento(e.target.value)}
              placeholder="Ex: Rinoplastia, Botox, Harmonizacao..."
              className="input-felice"
            />
          </div>

          {/* Valor */}
          <div>
            <Label className="label-felice">Valor (opcional)</Label>
            <Input
              value={valor}
              onChange={handleValorChange}
              placeholder="R$ 0,00"
              className="input-felice"
            />
          </div>

          {/* Observacoes */}
          <div>
            <Label className="label-felice">Observacoes (opcional)</Label>
            <Textarea
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Notas adicionais sobre a conversao..."
              className="input-felice"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-cafe/30"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !nucleoId}
            className="bg-success hover:bg-success/90 text-white"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Confirmar Conversao
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
