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
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2, Send, ExternalLink, Image as ImageIcon, Video } from 'lucide-react'
import type { Template, Nucleo, IndicacaoView } from '@/types/database'

interface SendIndicacaoMessageDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  indicacao: IndicacaoView | null
  templates: (Template & { nucleo: Nucleo | null })[]
  onSend: (indicacaoId: string, message: string, templateId?: string) => Promise<void>
}

export function SendIndicacaoMessageDialog({
  open,
  onOpenChange,
  indicacao,
  templates,
  onSend,
}: SendIndicacaoMessageDialogProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setSelectedTemplate('')
      setMessage('')
    }
  }, [open])

  // Update message when template changes
  useEffect(() => {
    if (selectedTemplate) {
      const template = templates.find((t) => t.id === selectedTemplate)
      if (template) {
        // Replace {nome} placeholder with actual name
        const personalizedMessage = template.conteudo.replace(
          /\{nome\}/gi,
          indicacao?.nome || ''
        )
        setMessage(personalizedMessage)
      }
    }
  }, [selectedTemplate, templates, indicacao?.nome])

  const handleSubmit = async () => {
    if (!indicacao?.id || !message.trim()) return

    setIsSubmitting(true)
    try {
      await onSend(indicacao.id, message, selectedTemplate || undefined)
      onOpenChange(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleOpenWhatsApp = () => {
    if (!indicacao?.telefone) return

    const phone = indicacao.telefone.replace(/\D/g, '')
    const encodedMessage = encodeURIComponent(message)
    window.open(`https://wa.me/55${phone}?text=${encodedMessage}`, '_blank')
  }

  const currentTemplate = templates.find((t) => t.id === selectedTemplate)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="font-butler text-cafe">
            Enviar Mensagem
          </DialogTitle>
          <DialogDescription className="font-sarabun">
            Envie uma mensagem para {indicacao?.nome}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Info da indicacao */}
          <div className="flex items-center gap-2 text-sm text-cafe/70">
            <span>Indicado por:</span>
            <Badge variant="outline">{indicacao?.indicado_por_nome}</Badge>
            {indicacao?.parentesco && (
              <>
                <span>-</span>
                <Badge variant="secondary">{indicacao.parentesco}</Badge>
              </>
            )}
          </div>

          {/* Template selector */}
          <div>
            <Label className="label-felice">Template (opcional)</Label>
            <Select
              value={selectedTemplate}
              onValueChange={setSelectedTemplate}
            >
              <SelectTrigger className="input-felice">
                <SelectValue placeholder="Selecione um template..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nenhum template</SelectItem>
                {templates.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    <div className="flex items-center gap-2">
                      <span>{template.titulo}</span>
                      {template.nucleo && (
                        <Badge
                          variant="outline"
                          className="text-xs"
                          style={{ borderColor: template.nucleo.cor || undefined }}
                        >
                          {template.nucleo.nome}
                        </Badge>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Template preview with media */}
          {currentTemplate?.arquivo_url && (
            <Card className="border-nude/30">
              <CardContent className="p-3">
                <div className="flex items-center gap-3">
                  {currentTemplate.tipo === 'imagem' ? (
                    <>
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-seda flex-shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={currentTemplate.arquivo_url}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 text-sm text-cafe/70">
                          <ImageIcon className="h-4 w-4" />
                          <span>Imagem anexada</span>
                        </div>
                        <a
                          href={currentTemplate.arquivo_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-dourado hover:underline"
                        >
                          Ver imagem
                        </a>
                      </div>
                    </>
                  ) : currentTemplate.tipo === 'video' ? (
                    <>
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-seda flex-shrink-0 flex items-center justify-center">
                        <Video className="h-8 w-8 text-cafe/40" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 text-sm text-cafe/70">
                          <Video className="h-4 w-4" />
                          <span>Video anexado</span>
                        </div>
                        <a
                          href={currentTemplate.arquivo_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-dourado hover:underline"
                        >
                          Ver video
                        </a>
                      </div>
                    </>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Message */}
          <div>
            <Label className="label-felice">Mensagem</Label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Digite sua mensagem..."
              className="input-felice min-h-[150px]"
            />
            <p className="text-xs text-cafe/50 mt-1">
              Use {'{nome}'} para inserir o nome automaticamente
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-cafe/30"
          >
            Cancelar
          </Button>
          <Button
            variant="outline"
            onClick={handleOpenWhatsApp}
            disabled={!message.trim()}
            className="border-success text-success hover:bg-success/10"
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            Abrir no WhatsApp
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !message.trim()}
            className="bg-dourado hover:bg-dourado-600 text-white"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Registrando...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Registrar Envio
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
