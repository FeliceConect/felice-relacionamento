'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
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
import { Loader2, Send, MessageSquare, ExternalLink, Download, Image as ImageIcon, Video } from 'lucide-react'
import type { Template, Nucleo } from '@/types/database'
import type { LeadComInteresses } from './LeadTable'

interface SendMessageDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  lead: LeadComInteresses | null
  templates: (Template & { nucleo: Nucleo | null })[]
  onSend: (leadId: string, message: string, templateId?: string) => Promise<void>
}

export function SendMessageDialog({
  open,
  onOpenChange,
  lead,
  templates,
  onSend,
}: SendMessageDialogProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('')
  const [message, setMessage] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [mediaUrl, setMediaUrl] = useState<string | null>(null)
  const [mediaType, setMediaType] = useState<string>('texto')

  // Reset quando abrir o dialog
  useEffect(() => {
    if (open) {
      setSelectedTemplate('')
      setMessage('')
      setMediaUrl(null)
      setMediaType('texto')
    }
  }, [open])

  // Atualizar mensagem quando selecionar template
  useEffect(() => {
    if (selectedTemplate) {
      const template = templates.find((t) => t.id === selectedTemplate)
      if (template) {
        // Substituir placeholders
        let content = template.conteudo
        if (lead?.nome) {
          content = content.replace(/\{nome\}/g, lead.nome.split(' ')[0])
        }
        setMessage(content)
        setMediaUrl(template.arquivo_url || null)
        setMediaType(template.tipo)
      }
    } else {
      setMediaUrl(null)
      setMediaType('texto')
    }
  }, [selectedTemplate, templates, lead])

  const handleDownloadMedia = () => {
    if (!mediaUrl) return
    window.open(mediaUrl, '_blank')
  }

  const handleSend = async () => {
    if (!lead?.id || !message.trim()) return

    setIsSending(true)
    try {
      await onSend(lead.id, message, selectedTemplate || undefined)
      onOpenChange(false)
    } finally {
      setIsSending(false)
    }
  }

  const handleOpenWhatsApp = () => {
    if (!lead?.whatsapp || !message) return

    const phone = lead.whatsapp.replace(/\D/g, '')
    const encodedMessage = encodeURIComponent(message)
    window.open(`https://wa.me/55${phone}?text=${encodedMessage}`, '_blank')
  }

  if (!lead) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-butler text-cafe">
            <MessageSquare className="h-5 w-5 text-dourado" />
            Enviar Mensagem
          </DialogTitle>
          <DialogDescription className="font-sarabun">
            Envie uma mensagem para <strong>{lead.nome}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Interesses do lead */}
          {lead.interesses && lead.interesses.length > 0 && (
            <div>
              <Label className="label-felice mb-2 block">Interesses do Lead</Label>
              <div className="flex flex-wrap gap-2">
                {lead.interesses.map((interesse) => (
                  <Badge
                    key={interesse.id}
                    variant="outline"
                    style={{
                      borderColor: interesse.nucleo?.cor || '#c29863',
                      color: interesse.nucleo?.cor || '#c29863',
                    }}
                  >
                    {interesse.nucleo?.nome}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Seleção de template */}
          <div>
            <Label className="label-felice">Template (opcional)</Label>
            <Select
              value={selectedTemplate || 'none'}
              onValueChange={(value) => setSelectedTemplate(value === 'none' ? '' : value)}
            >
              <SelectTrigger className="input-felice">
                <SelectValue placeholder="Selecione um template..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nenhum (mensagem personalizada)</SelectItem>
                {templates.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    <div className="flex items-center gap-2">
                      <span>{template.titulo}</span>
                      {template.nucleo && (
                        <Badge
                          variant="outline"
                          className="text-xs"
                          style={{ color: template.nucleo.cor || '#c29863' }}
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

          {/* Mídia do template */}
          {mediaUrl && (
            <div>
              <Label className="label-felice flex items-center gap-2">
                {mediaType === 'imagem' ? (
                  <><ImageIcon className="h-4 w-4" /> Imagem do Template</>
                ) : (
                  <><Video className="h-4 w-4" /> Vídeo do Template</>
                )}
              </Label>
              <div className="mt-2 space-y-2">
                {mediaType === 'imagem' ? (
                  <div className="relative aspect-video w-full max-w-[200px] rounded-lg overflow-hidden bg-seda">
                    <Image
                      src={mediaUrl}
                      alt="Mídia do template"
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <video
                    src={mediaUrl}
                    controls
                    className="w-full max-w-[200px] rounded-lg"
                  />
                )}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadMedia}
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  Baixar {mediaType === 'imagem' ? 'imagem' : 'vídeo'}
                </Button>
                <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded-lg">
                  Baixe a mídia e envie manualmente no WhatsApp junto com a mensagem de texto.
                </p>
              </div>
            </div>
          )}

          {/* Mensagem */}
          <div>
            <Label className="label-felice">Mensagem</Label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Digite sua mensagem..."
              className="input-felice min-h-[150px]"
            />
            <p className="text-xs text-cafe/50 mt-1">
              Use {'{nome}'} para inserir o nome do lead
            </p>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={handleOpenWhatsApp}
            disabled={!message.trim()}
            className="border-success text-success hover:bg-success hover:text-white"
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            Abrir no WhatsApp
          </Button>
          <Button
            onClick={handleSend}
            disabled={isSending || !message.trim()}
            className="bg-dourado hover:bg-dourado-600 text-white"
          >
            {isSending ? (
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
