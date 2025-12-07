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
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2, Plus, X } from 'lucide-react'
import type { Nucleo, PerguntaComOpcoes } from '@/types/database'

export interface OpcaoForm {
  id?: string
  texto: string
  letra: string
  ordem: number
}

export interface PerguntaFormData {
  titulo: string
  subtitulo: string
  nucleo_id: string
  tipo: string
  multipla_selecao: boolean
  obrigatoria: boolean
  opcoes: OpcaoForm[]
}

interface PerguntaFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  pergunta?: PerguntaComOpcoes | null
  nucleos: Nucleo[]
  onSubmit: (data: PerguntaFormData) => Promise<void>
}

const letras = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']

const initialFormData: PerguntaFormData = {
  titulo: '',
  subtitulo: '',
  nucleo_id: '',
  tipo: 'multipla_escolha',
  multipla_selecao: false,
  obrigatoria: true,
  opcoes: [
    { texto: '', letra: 'A', ordem: 0 },
    { texto: '', letra: 'B', ordem: 1 },
  ],
}

export function PerguntaForm({
  open,
  onOpenChange,
  pergunta,
  nucleos,
  onSubmit,
}: PerguntaFormProps) {
  const [formData, setFormData] = useState<PerguntaFormData>(initialFormData)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (pergunta) {
      setFormData({
        titulo: pergunta.titulo,
        subtitulo: pergunta.subtitulo || '',
        nucleo_id: pergunta.nucleo_id || '',
        tipo: pergunta.tipo,
        multipla_selecao: pergunta.multipla_selecao,
        obrigatoria: pergunta.obrigatoria,
        opcoes: pergunta.opcoes.map((o, i) => ({
          id: o.id,
          texto: o.texto,
          letra: o.letra || letras[i],
          ordem: o.ordem,
        })),
      })
    } else {
      setFormData(initialFormData)
    }
  }, [pergunta, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await onSubmit(formData)
      onOpenChange(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  const addOpcao = () => {
    const nextIndex = formData.opcoes.length
    if (nextIndex >= 10) return

    setFormData((prev) => ({
      ...prev,
      opcoes: [
        ...prev.opcoes,
        { texto: '', letra: letras[nextIndex], ordem: nextIndex },
      ],
    }))
  }

  const removeOpcao = (index: number) => {
    if (formData.opcoes.length <= 2) return

    setFormData((prev) => ({
      ...prev,
      opcoes: prev.opcoes
        .filter((_, i) => i !== index)
        .map((o, i) => ({ ...o, letra: letras[i], ordem: i })),
    }))
  }

  const updateOpcao = (index: number, texto: string) => {
    setFormData((prev) => ({
      ...prev,
      opcoes: prev.opcoes.map((o, i) => (i === index ? { ...o, texto } : o)),
    }))
  }

  const isValid =
    formData.titulo.trim() &&
    (formData.tipo !== 'multipla_escolha' ||
      formData.opcoes.filter((o) => o.texto.trim()).length >= 2)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-butler text-cafe">
            {pergunta ? 'Editar Pergunta' : 'Nova Pergunta'}
          </DialogTitle>
          <DialogDescription className="font-sarabun">
            {pergunta
              ? 'Atualize os dados da pergunta'
              : 'Adicione uma nova pergunta ao formulário'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          {/* Título */}
          <div>
            <Label className="label-felice">Título da Pergunta *</Label>
            <Input
              value={formData.titulo}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, titulo: e.target.value }))
              }
              placeholder="Ex: Qual procedimento você tem interesse?"
              className="input-felice"
              required
            />
          </div>

          {/* Subtítulo */}
          <div>
            <Label className="label-felice">Subtítulo (opcional)</Label>
            <Textarea
              value={formData.subtitulo}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, subtitulo: e.target.value }))
              }
              placeholder="Texto adicional para explicar a pergunta..."
              className="input-felice"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {/* Núcleo */}
            <div>
              <Label className="label-felice">Núcleo (opcional)</Label>
              <Select
                value={formData.nucleo_id || 'none'}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, nucleo_id: value === 'none' ? '' : value }))
                }
              >
                <SelectTrigger className="input-felice">
                  <SelectValue placeholder="Selecione o núcleo..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum (pergunta geral)</SelectItem>
                  {nucleos.map((nucleo) => (
                    <SelectItem key={nucleo.id} value={nucleo.id}>
                      {nucleo.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Tipo */}
            <div>
              <Label className="label-felice">Tipo *</Label>
              <Select
                value={formData.tipo}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, tipo: value }))
                }
              >
                <SelectTrigger className="input-felice">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="multipla_escolha">Múltipla Escolha</SelectItem>
                  <SelectItem value="texto">Texto Livre</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Switches */}
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-3">
              <Switch
                id="multipla_selecao"
                checked={formData.multipla_selecao}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, multipla_selecao: checked }))
                }
              />
              <Label htmlFor="multipla_selecao" className="cursor-pointer">
                Permitir múltipla seleção
              </Label>
            </div>

            <div className="flex items-center gap-3">
              <Switch
                id="obrigatoria"
                checked={formData.obrigatoria}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, obrigatoria: checked }))
                }
              />
              <Label htmlFor="obrigatoria" className="cursor-pointer">
                Resposta obrigatória
              </Label>
            </div>
          </div>

          {/* Opções (apenas para múltipla escolha) */}
          {formData.tipo === 'multipla_escolha' && (
            <div>
              <Label className="label-felice mb-3 block">Opções de Resposta *</Label>
              <div className="space-y-2">
                {formData.opcoes.map((opcao, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-seda text-cafe/60 font-medium text-sm">
                      {opcao.letra}
                    </div>
                    <Input
                      value={opcao.texto}
                      onChange={(e) => updateOpcao(index, e.target.value)}
                      placeholder={`Opção ${opcao.letra}...`}
                      className="input-felice flex-1"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeOpcao(index)}
                      disabled={formData.opcoes.length <= 2}
                      className="text-cafe/40 hover:text-error"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              {formData.opcoes.length < 10 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={addOpcao}
                  className="mt-3 border-dashed border-dourado text-dourado hover:bg-dourado/10"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar Opção
                </Button>
              )}
            </div>
          )}

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
              disabled={isSubmitting || !isValid}
              className="bg-dourado hover:bg-dourado-600 text-white"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : pergunta ? (
                'Salvar Alterações'
              ) : (
                'Criar Pergunta'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
