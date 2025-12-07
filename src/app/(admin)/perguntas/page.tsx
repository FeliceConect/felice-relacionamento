'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { EmptyState } from '@/components/shared/EmptyState'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { PerguntaForm, type PerguntaFormData, type OpcaoForm } from '@/components/admin/PerguntaForm'
import { useToast } from '@/lib/hooks/use-toast'
import {
  FileText,
  Plus,
  Edit2,
  Trash2,
  GripVertical,
  List,
  Type,
} from 'lucide-react'
import type { Nucleo, PerguntaComOpcoes } from '@/types/database'

export default function PerguntasPage() {
  const { toast } = useToast()
  const [perguntas, setPerguntas] = useState<PerguntaComOpcoes[]>([])
  const [nucleos, setNucleos] = useState<Nucleo[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Dialogs
  const [formOpen, setFormOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedPergunta, setSelectedPergunta] = useState<PerguntaComOpcoes | null>(null)

  useEffect(() => {
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function loadData() {
    const supabase = createClient()

    try {
      // Carregar perguntas com opções
      const { data: perguntasData, error } = await supabase
        .from('form_perguntas')
        .select(`
          *,
          nucleo:form_nucleos(*),
          opcoes:form_opcoes(*)
        `)
        .order('ordem')

      if (error) throw error

      // Ordenar opções
      const perguntasOrdenadas = (perguntasData || []).map((p) => ({
        ...p,
        opcoes: (p.opcoes || []).sort((a: { ordem: number }, b: { ordem: number }) => a.ordem - b.ordem),
      })) as PerguntaComOpcoes[]

      setPerguntas(perguntasOrdenadas)

      // Carregar núcleos
      const { data: nucleosData } = await supabase
        .from('form_nucleos')
        .select('*')
        .eq('ativo', true)
        .order('ordem')

      setNucleos(nucleosData || [])
    } catch (error) {
      console.error('Erro ao carregar perguntas:', error)
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Não foi possível carregar as perguntas.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreate = () => {
    setSelectedPergunta(null)
    setFormOpen(true)
  }

  const handleEdit = (pergunta: PerguntaComOpcoes) => {
    setSelectedPergunta(pergunta)
    setFormOpen(true)
  }

  const handleDelete = (pergunta: PerguntaComOpcoes) => {
    setSelectedPergunta(pergunta)
    setDeleteDialogOpen(true)
  }

  const handleToggleAtivo = async (pergunta: PerguntaComOpcoes) => {
    const supabase = createClient()

    try {
      const { error } = await supabase
        .from('form_perguntas')
        .update({ ativo: !pergunta.ativo })
        .eq('id', pergunta.id)

      if (error) throw error

      setPerguntas((prev) =>
        prev.map((p) =>
          p.id === pergunta.id ? { ...p, ativo: !p.ativo } : p
        )
      )

      toast({
        title: pergunta.ativo ? 'Pergunta desativada' : 'Pergunta ativada',
      })
    } catch (error) {
      console.error('Erro ao atualizar pergunta:', error)
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Não foi possível atualizar a pergunta.',
      })
    }
  }

  const handleFormSubmit = async (data: PerguntaFormData) => {
    const supabase = createClient()

    try {
      if (selectedPergunta) {
        // Atualizar pergunta existente
        const { error: perguntaError } = await supabase
          .from('form_perguntas')
          .update({
            titulo: data.titulo,
            subtitulo: data.subtitulo || null,
            nucleo_id: data.nucleo_id || null,
            tipo: data.tipo,
            multipla_selecao: data.multipla_selecao,
            obrigatoria: data.obrigatoria,
          })
          .eq('id', selectedPergunta.id)

        if (perguntaError) throw perguntaError

        // Deletar opções antigas
        await supabase
          .from('form_opcoes')
          .delete()
          .eq('pergunta_id', selectedPergunta.id)

        // Inserir novas opções
        if (data.tipo === 'multipla_escolha' && data.opcoes.length > 0) {
          const opcoes = data.opcoes
            .filter((o: OpcaoForm) => o.texto.trim())
            .map((o: OpcaoForm, i: number) => ({
              pergunta_id: selectedPergunta.id,
              texto: o.texto,
              letra: o.letra,
              ordem: i,
            }))

          const { error: opcoesError } = await supabase
            .from('form_opcoes')
            .insert(opcoes)

          if (opcoesError) throw opcoesError
        }

        toast({
          title: 'Pergunta atualizada',
          description: 'As alterações foram salvas com sucesso.',
        })
      } else {
        // Criar nova pergunta
        const maxOrdem = perguntas.length > 0
          ? Math.max(...perguntas.map((p) => p.ordem)) + 1
          : 0

        const { data: novaPergunta, error: perguntaError } = await supabase
          .from('form_perguntas')
          .insert({
            titulo: data.titulo,
            subtitulo: data.subtitulo || null,
            nucleo_id: data.nucleo_id || null,
            tipo: data.tipo,
            multipla_selecao: data.multipla_selecao,
            obrigatoria: data.obrigatoria,
            ordem: maxOrdem,
          })
          .select()
          .single()

        if (perguntaError) throw perguntaError

        // Inserir opções
        if (data.tipo === 'multipla_escolha' && data.opcoes.length > 0) {
          const opcoes = data.opcoes
            .filter((o: OpcaoForm) => o.texto.trim())
            .map((o: OpcaoForm, i: number) => ({
              pergunta_id: novaPergunta.id,
              texto: o.texto,
              letra: o.letra,
              ordem: i,
            }))

          const { error: opcoesError } = await supabase
            .from('form_opcoes')
            .insert(opcoes)

          if (opcoesError) throw opcoesError
        }

        toast({
          title: 'Pergunta criada',
          description: 'A nova pergunta foi adicionada ao formulário.',
        })
      }

      loadData()
    } catch (error) {
      console.error('Erro ao salvar pergunta:', error)
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Não foi possível salvar a pergunta.',
      })
      throw error
    }
  }

  const handleDeleteConfirm = async () => {
    if (!selectedPergunta) return

    const supabase = createClient()

    try {
      const { error } = await supabase
        .from('form_perguntas')
        .delete()
        .eq('id', selectedPergunta.id)

      if (error) throw error

      setPerguntas((prev) => prev.filter((p) => p.id !== selectedPergunta.id))
      setDeleteDialogOpen(false)

      toast({
        title: 'Pergunta excluída',
        description: 'A pergunta foi removida do formulário.',
      })
    } catch (error) {
      console.error('Erro ao excluir pergunta:', error)
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Não foi possível excluir a pergunta.',
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <LoadingSpinner size="lg" text="Carregando perguntas..." />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <FileText className="h-8 w-8 text-dourado" />
            Perguntas
          </h1>
          <p className="page-subtitle">
            Gerencie as perguntas do formulário de captação
          </p>
        </div>

        <Button
          onClick={handleCreate}
          className="bg-dourado hover:bg-dourado-600 text-white"
        >
          <Plus className="mr-2 h-4 w-4" />
          Nova Pergunta
        </Button>
      </div>

      {/* Lista de Perguntas */}
      {perguntas.length === 0 ? (
        <Card className="card-felice">
          <CardContent className="py-12">
            <EmptyState
              icon={FileText}
              title="Nenhuma pergunta cadastrada"
              description="Adicione perguntas para começar a captar leads."
            />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {perguntas.map((pergunta, index) => (
            <Card
              key={pergunta.id}
              className={`card-felice transition-opacity ${
                !pergunta.ativo ? 'opacity-60' : ''
              }`}
            >
              <CardContent className="py-4">
                <div className="flex items-start gap-4">
                  {/* Drag handle e ordem */}
                  <div className="flex items-center gap-2 pt-1">
                    <GripVertical className="h-5 w-5 text-cafe/30 cursor-grab" />
                    <span className="w-6 h-6 rounded-full bg-dourado/10 text-dourado text-sm font-medium flex items-center justify-center">
                      {index + 1}
                    </span>
                  </div>

                  {/* Conteúdo */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-medium text-cafe">{pergunta.titulo}</h3>
                        {pergunta.subtitulo && (
                          <p className="text-sm text-cafe/60 mt-1">
                            {pergunta.subtitulo}
                          </p>
                        )}

                        {/* Tags */}
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          {pergunta.nucleo && (
                            <Badge
                              variant="outline"
                              style={{
                                borderColor: pergunta.nucleo.cor || '#c29863',
                                color: pergunta.nucleo.cor || '#c29863',
                              }}
                            >
                              {pergunta.nucleo.nome}
                            </Badge>
                          )}

                          <Badge variant="outline" className="text-cafe/60">
                            {pergunta.tipo === 'multipla_escolha' ? (
                              <>
                                <List className="mr-1 h-3 w-3" />
                                {pergunta.opcoes.length} opções
                              </>
                            ) : (
                              <>
                                <Type className="mr-1 h-3 w-3" />
                                Texto livre
                              </>
                            )}
                          </Badge>

                          {pergunta.multipla_selecao && (
                            <Badge variant="outline" className="text-info">
                              Múltipla seleção
                            </Badge>
                          )}

                          {pergunta.obrigatoria && (
                            <Badge variant="outline" className="text-vinho">
                              Obrigatória
                            </Badge>
                          )}
                        </div>

                        {/* Opções preview */}
                        {pergunta.tipo === 'multipla_escolha' && pergunta.opcoes.length > 0 && (
                          <div className="mt-3 text-sm text-cafe/60">
                            {pergunta.opcoes.slice(0, 3).map((opcao, i) => (
                              <span key={opcao.id}>
                                {opcao.letra}. {opcao.texto}
                                {i < Math.min(2, pergunta.opcoes.length - 1) && ' | '}
                              </span>
                            ))}
                            {pergunta.opcoes.length > 3 && (
                              <span className="text-cafe/40">
                                {' '}+{pergunta.opcoes.length - 3} mais
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2 mr-4">
                          <Switch
                            checked={pergunta.ativo}
                            onCheckedChange={() => handleToggleAtivo(pergunta)}
                          />
                          <span className="text-xs text-cafe/60">
                            {pergunta.ativo ? 'Ativa' : 'Inativa'}
                          </span>
                        </div>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(pergunta)}
                          className="text-cafe/60 hover:text-dourado"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(pergunta)}
                          className="text-cafe/60 hover:text-error"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Form Dialog */}
      <PerguntaForm
        open={formOpen}
        onOpenChange={setFormOpen}
        pergunta={selectedPergunta}
        nucleos={nucleos}
        onSubmit={handleFormSubmit}
      />

      {/* Delete Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Excluir Pergunta"
        description={`Tem certeza que deseja excluir a pergunta "${selectedPergunta?.titulo}"? As respostas associadas serão mantidas, mas não estarão mais vinculadas a esta pergunta.`}
        confirmLabel="Excluir"
        variant="destructive"
        onConfirm={handleDeleteConfirm}
      />
    </div>
  )
}
