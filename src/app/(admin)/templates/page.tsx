'use client'

import { useEffect, useState, useRef } from 'react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { EmptyState } from '@/components/shared/EmptyState'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { useToast } from '@/lib/hooks/use-toast'
import {
  MessageSquare,
  Plus,
  Edit2,
  Trash2,
  FileText,
  Image as ImageIcon,
  Video,
  Loader2,
  Upload,
  X,
} from 'lucide-react'
import type { Nucleo, Template } from '@/types/database'

type TemplateComNucleo = Template & { nucleo: Nucleo | null }

export default function TemplatesPage() {
  const { toast } = useToast()
  const [templates, setTemplates] = useState<TemplateComNucleo[]>([])
  const [nucleos, setNucleos] = useState<Nucleo[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Form state
  const [formOpen, setFormOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateComNucleo | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form data
  const [titulo, setTitulo] = useState('')
  const [conteudo, setConteudo] = useState('')
  const [tipo, setTipo] = useState('texto')
  const [nucleoId, setNucleoId] = useState('')
  const [arquivoUrl, setArquivoUrl] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function loadData() {
    const supabase = createClient()

    try {
      const { data: templatesData } = await supabase
        .from('form_templates')
        .select('*, nucleo:form_nucleos(*)')
        .order('ordem')

      setTemplates(templatesData || [])

      const { data: nucleosData } = await supabase
        .from('form_nucleos')
        .select('*')
        .eq('ativo', true)
        .order('ordem')

      setNucleos(nucleosData || [])
    } catch (error) {
      console.error('Erro:', error)
      toast({ variant: 'destructive', title: 'Erro ao carregar templates' })
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setTitulo('')
    setConteudo('')
    setTipo('texto')
    setNucleoId('')
    setArquivoUrl('')
    setSelectedTemplate(null)
  }

  const handleCreate = () => {
    resetForm()
    setFormOpen(true)
  }

  const handleEdit = (template: TemplateComNucleo) => {
    setSelectedTemplate(template)
    setTitulo(template.titulo)
    setConteudo(template.conteudo)
    setTipo(template.tipo)
    setNucleoId(template.nucleo_id || '')
    setArquivoUrl(template.arquivo_url || '')
    setFormOpen(true)
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', 'templates')

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao fazer upload')
      }

      setArquivoUrl(data.url)
      toast({ title: 'Arquivo enviado com sucesso!' })
    } catch (error) {
      console.error('Upload error:', error)
      toast({
        variant: 'destructive',
        title: 'Erro ao enviar arquivo',
        description: error instanceof Error ? error.message : 'Tente novamente',
      })
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleRemoveFile = () => {
    setArquivoUrl('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const supabase = createClient()

    try {
      if (selectedTemplate) {
        const { error } = await supabase
          .from('form_templates')
          .update({
            titulo,
            conteudo,
            tipo,
            nucleo_id: nucleoId || null,
            arquivo_url: arquivoUrl || null,
          })
          .eq('id', selectedTemplate.id)

        if (error) throw error
        toast({ title: 'Template atualizado' })
      } else {
        const { error } = await supabase.from('form_templates').insert({
          titulo,
          conteudo,
          tipo,
          nucleo_id: nucleoId || null,
          arquivo_url: arquivoUrl || null,
          ordem: templates.length,
        })

        if (error) throw error
        toast({ title: 'Template criado' })
      }

      setFormOpen(false)
      resetForm()
      loadData()
    } catch (error) {
      console.error('Erro:', error)
      toast({ variant: 'destructive', title: 'Erro ao salvar template' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleToggleAtivo = async (template: TemplateComNucleo) => {
    const supabase = createClient()

    try {
      await supabase
        .from('form_templates')
        .update({ ativo: !template.ativo })
        .eq('id', template.id)

      setTemplates((prev) =>
        prev.map((t) => (t.id === template.id ? { ...t, ativo: !t.ativo } : t))
      )
    } catch (error) {
      console.error('Erro:', error)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!selectedTemplate) return

    const supabase = createClient()

    try {
      await supabase.from('form_templates').delete().eq('id', selectedTemplate.id)
      setTemplates((prev) => prev.filter((t) => t.id !== selectedTemplate.id))
      setDeleteDialogOpen(false)
      toast({ title: 'Template excluído' })
    } catch (error) {
      console.error('Erro:', error)
      toast({ variant: 'destructive', title: 'Erro ao excluir' })
    }
  }

  const getTipoIcon = (t: string) => {
    switch (t) {
      case 'imagem': return <ImageIcon className="h-4 w-4" />
      case 'video': return <Video className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <LoadingSpinner size="lg" text="Carregando templates..." />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <MessageSquare className="h-8 w-8 text-dourado" />
            Templates
          </h1>
          <p className="page-subtitle">Modelos de mensagens para follow-up</p>
        </div>

        <Button onClick={handleCreate} className="bg-dourado hover:bg-dourado-600 text-white">
          <Plus className="mr-2 h-4 w-4" />
          Novo Template
        </Button>
      </div>

      {/* Lista */}
      {templates.length === 0 ? (
        <Card className="card-felice">
          <CardContent className="py-12">
            <EmptyState
              icon={MessageSquare}
              title="Nenhum template cadastrado"
              description="Crie templates para agilizar o envio de mensagens."
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {templates.map((template) => (
            <Card
              key={template.id}
              className={`card-felice ${!template.ativo ? 'opacity-60' : ''}`}
            >
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      {getTipoIcon(template.tipo)}
                      <h3 className="font-medium text-cafe truncate">{template.titulo}</h3>
                    </div>

                    {/* Preview de mídia */}
                    {template.arquivo_url && template.tipo === 'imagem' && (
                      <div className="relative aspect-video w-full max-w-[200px] rounded-lg overflow-hidden bg-seda mb-3">
                        <Image
                          src={template.arquivo_url}
                          alt={template.titulo}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}

                    {template.arquivo_url && template.tipo === 'video' && (
                      <video
                        src={template.arquivo_url}
                        className="w-full max-w-[200px] rounded-lg mb-3"
                        muted
                        playsInline
                      />
                    )}

                    <p className="text-sm text-cafe/60 line-clamp-3 mb-3">
                      {template.conteudo}
                    </p>

                    {template.nucleo && (
                      <Badge
                        variant="outline"
                        style={{
                          borderColor: template.nucleo.cor || '#c29863',
                          color: template.nucleo.cor || '#c29863',
                        }}
                      >
                        {template.nucleo.nome}
                      </Badge>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <Switch
                      checked={template.ativo}
                      onCheckedChange={() => handleToggleAtivo(template)}
                    />
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(template)}
                        className="h-8 w-8"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedTemplate(template)
                          setDeleteDialogOpen(true)
                        }}
                        className="h-8 w-8 text-error"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Form Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-butler text-cafe">
              {selectedTemplate ? 'Editar Template' : 'Novo Template'}
            </DialogTitle>
            <DialogDescription className="font-sarabun">
              {selectedTemplate ? 'Atualize o modelo de mensagem' : 'Crie um novo modelo de mensagem'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div>
              <Label className="label-felice">Título *</Label>
              <Input
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Ex: Boas-vindas Cirurgia Plástica"
                className="input-felice"
                required
              />
            </div>

            <div>
              <Label className="label-felice">Conteúdo *</Label>
              <Textarea
                value={conteudo}
                onChange={(e) => setConteudo(e.target.value)}
                placeholder="Olá {nome}! Obrigado pelo interesse..."
                className="input-felice min-h-[120px]"
                required
              />
              <p className="text-xs text-cafe/50 mt-1">Use {'{nome}'} para inserir o nome do lead</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="label-felice">Tipo</Label>
                <Select value={tipo} onValueChange={setTipo}>
                  <SelectTrigger className="input-felice">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="texto">Texto</SelectItem>
                    <SelectItem value="imagem">Imagem</SelectItem>
                    <SelectItem value="video">Vídeo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="label-felice">Núcleo</Label>
                <Select value={nucleoId || 'none'} onValueChange={(value) => setNucleoId(value === 'none' ? '' : value)}>
                  <SelectTrigger className="input-felice">
                    <SelectValue placeholder="Geral" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Geral</SelectItem>
                    {nucleos.map((n) => (
                      <SelectItem key={n.id} value={n.id}>{n.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Upload de mídia */}
            {(tipo === 'imagem' || tipo === 'video') && (
              <div>
                <Label className="label-felice">
                  {tipo === 'imagem' ? 'Imagem' : 'Vídeo'}
                </Label>

                {arquivoUrl ? (
                  <div className="relative mt-2">
                    {tipo === 'imagem' ? (
                      <div className="relative aspect-video w-full max-w-xs rounded-lg overflow-hidden bg-seda">
                        <Image
                          src={arquivoUrl}
                          alt="Preview"
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <video
                        src={arquivoUrl}
                        controls
                        className="w-full max-w-xs rounded-lg"
                      />
                    )}
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-8 w-8"
                      onClick={handleRemoveFile}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="mt-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept={tipo === 'imagem' ? 'image/*' : 'video/*'}
                      onChange={handleFileUpload}
                      className="hidden"
                      id="file-upload"
                    />
                    <label htmlFor="file-upload">
                      <Button
                        type="button"
                        variant="outline"
                        className="cursor-pointer"
                        disabled={isUploading}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        {isUploading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Enviando...
                          </>
                        ) : (
                          <>
                            <Upload className="mr-2 h-4 w-4" />
                            Selecionar {tipo === 'imagem' ? 'imagem' : 'vídeo'}
                          </>
                        )}
                      </Button>
                    </label>
                    <p className="text-xs text-cafe/50 mt-2">
                      {tipo === 'imagem'
                        ? 'JPG, PNG, WebP ou GIF. Máximo 5MB.'
                        : 'MP4 ou WebM. Máximo 50MB.'}
                    </p>
                  </div>
                )}
              </div>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !titulo || !conteudo}
                className="bg-dourado hover:bg-dourado-600"
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Salvar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Excluir Template"
        description={`Excluir "${selectedTemplate?.titulo}"?`}
        confirmLabel="Excluir"
        variant="destructive"
        onConfirm={handleDeleteConfirm}
      />
    </div>
  )
}
