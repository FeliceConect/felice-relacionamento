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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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
  UserCircle,
  Plus,
  Edit2,
  Trash2,
  Loader2,
  Upload,
  X,
} from 'lucide-react'
import type { Nucleo, Profissional, Procedimento } from '@/types/database'

type ProfissionalComNucleo = Profissional & { nucleo: Nucleo | null }

export default function ProfissionaisPage() {
  const { toast } = useToast()
  const [profissionais, setProfissionais] = useState<ProfissionalComNucleo[]>([])
  const [nucleos, setNucleos] = useState<Nucleo[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Form state
  const [formOpen, setFormOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedProf, setSelectedProf] = useState<ProfissionalComNucleo | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form data
  const [nome, setNome] = useState('')
  const [especialidade, setEspecialidade] = useState('')
  const [crm, setCrm] = useState('')
  const [descricao, setDescricao] = useState('')
  const [fotoUrl, setFotoUrl] = useState('')
  const [nucleoId, setNucleoId] = useState('')
  const [procedimentos, setProcedimentos] = useState<Procedimento[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function loadData() {
    const supabase = createClient()

    try {
      const { data: profsData } = await supabase
        .from('form_profissionais')
        .select('*, nucleo:form_nucleos(*)')
        .order('ordem')

      // Convert old format (string[]) to new format ({nome, descricao}[]) if needed
      const profsConverted = (profsData || []).map((prof) => {
        if (prof.procedimentos && Array.isArray(prof.procedimentos)) {
          // Check if it's already in new format
          if (prof.procedimentos.length > 0 && typeof prof.procedimentos[0] === 'string') {
            // Old format - convert
            prof.procedimentos = prof.procedimentos.map((p: string) => ({
              nome: p,
              descricao: '',
            }))
          }
        }
        return prof
      })

      setProfissionais(profsConverted)

      const { data: nucleosData } = await supabase
        .from('form_nucleos')
        .select('*')
        .eq('ativo', true)
        .order('ordem')

      setNucleos(nucleosData || [])
    } catch (error) {
      console.error('Erro:', error)
      toast({ variant: 'destructive', title: 'Erro ao carregar profissionais' })
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setNome('')
    setEspecialidade('')
    setCrm('')
    setDescricao('')
    setFotoUrl('')
    setNucleoId('')
    setProcedimentos([])
    setSelectedProf(null)
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', 'profissionais')

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao fazer upload')
      }

      setFotoUrl(data.url)
      toast({ title: 'Foto enviada com sucesso' })
    } catch (error) {
      console.error('Erro upload:', error)
      toast({
        variant: 'destructive',
        title: error instanceof Error ? error.message : 'Erro ao enviar foto',
      })
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleCreate = () => {
    resetForm()
    setFormOpen(true)
  }

  const handleEdit = (prof: ProfissionalComNucleo) => {
    setSelectedProf(prof)
    setNome(prof.nome)
    setEspecialidade(prof.especialidade || '')
    setCrm(prof.crm || '')
    setDescricao(prof.descricao || '')
    setFotoUrl(prof.foto_url || '')
    setNucleoId(prof.nucleo_id || '')
    setProcedimentos(prof.procedimentos || [])
    setFormOpen(true)
  }

  const handleAddProcedimento = () => {
    setProcedimentos([...procedimentos, { nome: '', descricao: '' }])
  }

  const handleRemoveProcedimento = (index: number) => {
    setProcedimentos(procedimentos.filter((_, i) => i !== index))
  }

  const handleProcedimentoChange = (index: number, field: 'nome' | 'descricao', value: string) => {
    const updated = [...procedimentos]
    updated[index] = { ...updated[index], [field]: value }
    setProcedimentos(updated)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const supabase = createClient()

    // Filter out empty procedimentos
    const procedimentosValidos = procedimentos.filter((p) => p.nome.trim())

    try {
      const data = {
        nome,
        especialidade: especialidade || null,
        crm: crm || null,
        descricao: descricao || null,
        foto_url: fotoUrl || null,
        nucleo_id: nucleoId || null,
        procedimentos: procedimentosValidos.length > 0 ? procedimentosValidos : null,
      }

      if (selectedProf) {
        const { error } = await supabase
          .from('form_profissionais')
          .update(data)
          .eq('id', selectedProf.id)

        if (error) throw error
        toast({ title: 'Profissional atualizado' })
      } else {
        const { error } = await supabase.from('form_profissionais').insert({
          ...data,
          ordem: profissionais.length,
        })

        if (error) throw error
        toast({ title: 'Profissional cadastrado' })
      }

      setFormOpen(false)
      resetForm()
      loadData()
    } catch (error) {
      console.error('Erro:', error)
      toast({ variant: 'destructive', title: 'Erro ao salvar' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleToggleAtivo = async (prof: ProfissionalComNucleo) => {
    const supabase = createClient()

    try {
      await supabase
        .from('form_profissionais')
        .update({ ativo: !prof.ativo })
        .eq('id', prof.id)

      setProfissionais((prev) =>
        prev.map((p) => (p.id === prof.id ? { ...p, ativo: !p.ativo } : p))
      )
    } catch (error) {
      console.error('Erro:', error)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!selectedProf) return

    const supabase = createClient()

    try {
      await supabase.from('form_profissionais').delete().eq('id', selectedProf.id)
      setProfissionais((prev) => prev.filter((p) => p.id !== selectedProf.id))
      setDeleteDialogOpen(false)
      toast({ title: 'Profissional excluído' })
    } catch (error) {
      console.error('Erro:', error)
      toast({ variant: 'destructive', title: 'Erro ao excluir' })
    }
  }

  const getInitials = (name: string) =>
    name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <LoadingSpinner size="lg" text="Carregando profissionais..." />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <UserCircle className="h-8 w-8 text-dourado" />
            Profissionais
          </h1>
          <p className="page-subtitle">Equipe médica do Complexo Felice</p>
        </div>

        <Button onClick={handleCreate} className="bg-dourado hover:bg-dourado-600 text-white">
          <Plus className="mr-2 h-4 w-4" />
          Novo Profissional
        </Button>
      </div>

      {/* Lista */}
      {profissionais.length === 0 ? (
        <Card className="card-felice">
          <CardContent className="py-12">
            <EmptyState
              icon={UserCircle}
              title="Nenhum profissional cadastrado"
              description="Adicione os profissionais que aparecerão na vitrine."
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {profissionais.map((prof) => (
            <Card
              key={prof.id}
              className={`card-felice ${!prof.ativo ? 'opacity-60' : ''}`}
            >
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <Avatar className="h-14 w-14">
                    {prof.foto_url ? (
                      <AvatarImage src={prof.foto_url} alt={prof.nome} />
                    ) : null}
                    <AvatarFallback className="bg-dourado/10 text-dourado font-butler text-lg">
                      {getInitials(prof.nome)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-cafe truncate">{prof.nome}</h3>
                    {prof.especialidade && (
                      <p className="text-sm text-dourado">{prof.especialidade}</p>
                    )}
                    {prof.crm && (
                      <p className="text-xs text-cafe/50">CRM: {prof.crm}</p>
                    )}

                    <div className="flex flex-wrap gap-1 mt-2">
                      {prof.nucleo && (
                        <Badge
                          variant="outline"
                          className="text-xs"
                          style={{
                            borderColor: prof.nucleo.cor || '#c29863',
                            color: prof.nucleo.cor || '#c29863',
                          }}
                        >
                          {prof.nucleo.nome}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-nude/20">
                  <Switch
                    checked={prof.ativo}
                    onCheckedChange={() => handleToggleAtivo(prof)}
                  />
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(prof)}
                      className="h-8 w-8"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setSelectedProf(prof)
                        setDeleteDialogOpen(true)
                      }}
                      className="h-8 w-8 text-error"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Form Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-butler text-cafe">
              {selectedProf ? 'Editar Profissional' : 'Novo Profissional'}
            </DialogTitle>
            <DialogDescription className="font-sarabun">
              Preencha os dados do profissional
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div>
              <Label className="label-felice">Nome Completo *</Label>
              <Input
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Dr. João Silva"
                className="input-felice"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="label-felice">Especialidade</Label>
                <Input
                  value={especialidade}
                  onChange={(e) => setEspecialidade(e.target.value)}
                  placeholder="Cirurgião Plástico"
                  className="input-felice"
                />
              </div>
              <div>
                <Label className="label-felice">CRM</Label>
                <Input
                  value={crm}
                  onChange={(e) => setCrm(e.target.value)}
                  placeholder="12345-MG"
                  className="input-felice"
                />
              </div>
            </div>

            <div>
              <Label className="label-felice">Núcleo</Label>
              <Select value={nucleoId || 'none'} onValueChange={(value) => setNucleoId(value === 'none' ? '' : value)}>
                <SelectTrigger className="input-felice">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum</SelectItem>
                  {nucleos.map((n) => (
                    <SelectItem key={n.id} value={n.id}>{n.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="label-felice">Foto do Profissional</Label>
              <div className="mt-2">
                {fotoUrl ? (
                  <div className="relative inline-block">
                    <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-dourado/30">
                      <Image
                        src={fotoUrl}
                        alt="Foto do profissional"
                        width={96}
                        height={96}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                      onClick={() => setFotoUrl('')}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="w-24 h-24 rounded-full border-2 border-dashed border-nude/50 flex flex-col items-center justify-center cursor-pointer hover:border-dourado/50 transition-colors"
                  >
                    {isUploading ? (
                      <Loader2 className="h-6 w-6 text-cafe/50 animate-spin" />
                    ) : (
                      <>
                        <Upload className="h-6 w-6 text-cafe/50" />
                        <span className="text-xs text-cafe/50 mt-1">Upload</span>
                      </>
                    )}
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <p className="text-xs text-cafe/50 mt-2">JPG, PNG ou WebP. Máx 5MB.</p>
              </div>
            </div>

            <div>
              <Label className="label-felice">Descrição / Sobre</Label>
              <Textarea
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder="Breve descrição do profissional..."
                className="input-felice"
              />
            </div>

            {/* Procedimentos */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="label-felice">Procedimentos</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddProcedimento}
                  className="text-dourado border-dourado/30 hover:bg-dourado/10"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Adicionar
                </Button>
              </div>

              {procedimentos.length === 0 ? (
                <p className="text-sm text-cafe/50 italic">Nenhum procedimento cadastrado. Clique em "Adicionar" para incluir.</p>
              ) : (
                <div className="space-y-3">
                  {procedimentos.map((proc, index) => (
                    <div
                      key={index}
                      className="p-3 border border-nude/30 rounded-lg bg-seda/30 space-y-2"
                    >
                      <div className="flex items-center gap-2">
                        <Input
                          value={proc.nome}
                          onChange={(e) => handleProcedimentoChange(index, 'nome', e.target.value)}
                          placeholder="Nome do procedimento"
                          className="input-felice flex-1"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveProcedimento(index)}
                          className="h-8 w-8 text-error shrink-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <Textarea
                        value={proc.descricao}
                        onChange={(e) => handleProcedimentoChange(index, 'descricao', e.target.value)}
                        placeholder="Descrição do procedimento..."
                        className="input-felice text-sm"
                        rows={2}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !nome}
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
        title="Excluir Profissional"
        description={`Excluir "${selectedProf?.nome}"?`}
        confirmLabel="Excluir"
        variant="destructive"
        onConfirm={handleDeleteConfirm}
      />
    </div>
  )
}
