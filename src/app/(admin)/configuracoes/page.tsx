'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { useToast } from '@/lib/hooks/use-toast'
import {
  Settings,
  Key,
  Building2,
  Palette,
  Monitor,
  Plus,
  Edit2,
  Trash2,
  Save,
  Loader2,
  Users,
  Mail,
  Shield,
} from 'lucide-react'
import type { Nucleo, EquipeComNucleo } from '@/types/database'

interface Usuario {
  id: string
  email: string
  created_at: string
  last_sign_in_at?: string
  equipe?: EquipeComNucleo | null
}

export default function ConfiguracoesPage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  // Configurações gerais
  const [kioskPassword, setKioskPassword] = useState('')
  const [kioskTimeout, setKioskTimeout] = useState('')
  const [empresaNome, setEmpresaNome] = useState('')
  const [empresaWhatsapp, setEmpresaWhatsapp] = useState('')

  // Núcleos
  const [nucleos, setNucleos] = useState<Nucleo[]>([])
  const [nucleoFormOpen, setNucleoFormOpen] = useState(false)
  const [deleteNucleoOpen, setDeleteNucleoOpen] = useState(false)
  const [selectedNucleo, setSelectedNucleo] = useState<Nucleo | null>(null)
  const [nucleoNome, setNucleoNome] = useState('')
  const [nucleoCor, setNucleoCor] = useState('#c29863')

  // Usuários
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [usuarioFormOpen, setUsuarioFormOpen] = useState(false)
  const [deleteUsuarioOpen, setDeleteUsuarioOpen] = useState(false)
  const [selectedUsuario, setSelectedUsuario] = useState<Usuario | null>(null)
  const [usuarioNome, setUsuarioNome] = useState('')
  const [usuarioEmail, setUsuarioEmail] = useState('')
  const [usuarioSenha, setUsuarioSenha] = useState('')
  const [usuarioTelefone, setUsuarioTelefone] = useState('')
  const [usuarioRole, setUsuarioRole] = useState('atendente')
  const [isSavingUsuario, setIsSavingUsuario] = useState(false)

  useEffect(() => {
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function loadData() {
    const supabase = createClient()

    try {
      // Carregar configurações
      const { data: configs } = await supabase
        .from('form_configuracoes')
        .select('*')

      if (configs) {
        const configMap = Object.fromEntries(configs.map((c) => [c.chave, c.valor]))
        setKioskPassword(configMap.kiosk_password || '1234')
        setKioskTimeout(configMap.kiosk_timeout_minutes || '5')
        setEmpresaNome(configMap.empresa_nome || '')
        setEmpresaWhatsapp(configMap.empresa_whatsapp || '')
      }

      // Carregar núcleos
      const { data: nucleosData } = await supabase
        .from('form_nucleos')
        .select('*')
        .order('ordem')

      setNucleos(nucleosData || [])

      // Carregar usuários via API
      await loadUsuarios()
    } catch (error) {
      console.error('Erro:', error)
      toast({ variant: 'destructive', title: 'Erro ao carregar configurações' })
    } finally {
      setIsLoading(false)
    }
  }

  const saveConfig = async (chave: string, valor: string) => {
    const supabase = createClient()

    const { error } = await supabase
      .from('form_configuracoes')
      .upsert({ chave, valor }, { onConflict: 'chave' })

    if (error) throw error
  }

  const handleSaveGeral = async () => {
    setIsSaving(true)

    try {
      await Promise.all([
        saveConfig('kiosk_password', kioskPassword),
        saveConfig('kiosk_timeout_minutes', kioskTimeout),
        saveConfig('empresa_nome', empresaNome),
        saveConfig('empresa_whatsapp', empresaWhatsapp),
      ])

      toast({ title: 'Configurações salvas' })
    } catch (error) {
      console.error('Erro:', error)
      toast({ variant: 'destructive', title: 'Erro ao salvar' })
    } finally {
      setIsSaving(false)
    }
  }

  const handleCreateNucleo = () => {
    setSelectedNucleo(null)
    setNucleoNome('')
    setNucleoCor('#c29863')
    setNucleoFormOpen(true)
  }

  const handleEditNucleo = (nucleo: Nucleo) => {
    setSelectedNucleo(nucleo)
    setNucleoNome(nucleo.nome)
    setNucleoCor(nucleo.cor || '#c29863')
    setNucleoFormOpen(true)
  }

  const handleSaveNucleo = async () => {
    const supabase = createClient()
    const slug = nucleoNome.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

    try {
      if (selectedNucleo) {
        await supabase
          .from('form_nucleos')
          .update({ nome: nucleoNome, cor: nucleoCor, slug })
          .eq('id', selectedNucleo.id)
      } else {
        await supabase.from('form_nucleos').insert({
          nome: nucleoNome,
          cor: nucleoCor,
          slug,
          ordem: nucleos.length,
        })
      }

      toast({ title: selectedNucleo ? 'Núcleo atualizado' : 'Núcleo criado' })
      setNucleoFormOpen(false)
      loadData()
    } catch (error) {
      console.error('Erro:', error)
      toast({ variant: 'destructive', title: 'Erro ao salvar núcleo' })
    }
  }

  const handleDeleteNucleo = async () => {
    if (!selectedNucleo) return

    const supabase = createClient()

    try {
      await supabase.from('form_nucleos').delete().eq('id', selectedNucleo.id)
      toast({ title: 'Núcleo excluído' })
      setDeleteNucleoOpen(false)
      loadData()
    } catch (error) {
      console.error('Erro:', error)
      toast({ variant: 'destructive', title: 'Erro ao excluir' })
    }
  }

  // === Usuários Functions ===
  async function loadUsuarios() {
    try {
      const response = await fetch('/api/usuarios')
      const data = await response.json()

      if (response.ok) {
        setUsuarios(data.usuarios || [])
      }
    } catch (error) {
      console.error('Erro ao carregar usuários:', error)
    }
  }

  const handleCreateUsuario = () => {
    setSelectedUsuario(null)
    setUsuarioNome('')
    setUsuarioEmail('')
    setUsuarioSenha('')
    setUsuarioTelefone('')
    setUsuarioRole('atendente')
    setUsuarioFormOpen(true)
  }

  const handleEditUsuario = (usuario: Usuario) => {
    setSelectedUsuario(usuario)
    setUsuarioNome(usuario.equipe?.nome || '')
    setUsuarioEmail(usuario.email || '')
    setUsuarioSenha('')
    setUsuarioTelefone(usuario.equipe?.telefone || '')
    setUsuarioRole(usuario.equipe?.role || 'atendente')
    setUsuarioFormOpen(true)
  }

  const handleSaveUsuario = async () => {
    if (!usuarioNome || !usuarioEmail) {
      toast({ variant: 'destructive', title: 'Nome e email são obrigatórios' })
      return
    }

    if (!selectedUsuario && !usuarioSenha) {
      toast({ variant: 'destructive', title: 'Senha é obrigatória para novos usuários' })
      return
    }

    setIsSavingUsuario(true)

    try {
      if (selectedUsuario) {
        // Update
        const body: Record<string, unknown> = {
          nome: usuarioNome,
          email: usuarioEmail,
          telefone: usuarioTelefone,
          role: usuarioRole,
        }
        if (usuarioSenha) {
          body.password = usuarioSenha
        }

        const response = await fetch(`/api/usuarios/${selectedUsuario.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Erro ao atualizar usuário')
        }

        toast({ title: 'Usuário atualizado com sucesso' })
      } else {
        // Create
        const response = await fetch('/api/usuarios', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nome: usuarioNome,
            email: usuarioEmail,
            password: usuarioSenha,
            telefone: usuarioTelefone,
            role: usuarioRole,
          }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Erro ao criar usuário')
        }

        toast({ title: 'Usuário criado com sucesso' })
      }

      setUsuarioFormOpen(false)
      loadUsuarios()
    } catch (error) {
      console.error('Erro:', error)
      toast({
        variant: 'destructive',
        title: error instanceof Error ? error.message : 'Erro ao salvar usuário',
      })
    } finally {
      setIsSavingUsuario(false)
    }
  }

  const handleDeleteUsuario = async () => {
    if (!selectedUsuario) return

    try {
      const response = await fetch(`/api/usuarios/${selectedUsuario.id}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao excluir usuário')
      }

      toast({ title: 'Usuário excluído com sucesso' })
      setDeleteUsuarioOpen(false)
      loadUsuarios()
    } catch (error) {
      console.error('Erro:', error)
      toast({
        variant: 'destructive',
        title: error instanceof Error ? error.message : 'Erro ao excluir usuário',
      })
    }
  }

  const getRoleLabel = (role: string) => {
    const roles: Record<string, string> = {
      admin: 'Administrador',
      atendente: 'Atendente',
    }
    return roles[role] || role
  }

  const getRoleBadgeVariant = (role: string) => {
    if (role === 'admin') return 'default'
    return 'outline'
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <LoadingSpinner size="lg" text="Carregando configurações..." />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="page-title flex items-center gap-2">
          <Settings className="h-8 w-8 text-dourado" />
          Configurações
        </h1>
        <p className="page-subtitle">Gerencie as configurações do sistema</p>
      </div>

      <Tabs defaultValue="geral" className="space-y-6">
        <TabsList className="bg-seda/50">
          <TabsTrigger value="geral" className="data-[state=active]:bg-white">
            <Building2 className="mr-2 h-4 w-4" />
            Geral
          </TabsTrigger>
          <TabsTrigger value="kiosk" className="data-[state=active]:bg-white">
            <Monitor className="mr-2 h-4 w-4" />
            Kiosk
          </TabsTrigger>
          <TabsTrigger value="nucleos" className="data-[state=active]:bg-white">
            <Palette className="mr-2 h-4 w-4" />
            Núcleos
          </TabsTrigger>
          <TabsTrigger value="usuarios" className="data-[state=active]:bg-white">
            <Users className="mr-2 h-4 w-4" />
            Usuários
          </TabsTrigger>
        </TabsList>

        {/* Configurações Gerais */}
        <TabsContent value="geral">
          <Card className="card-felice">
            <CardHeader>
              <CardTitle className="font-butler">Dados da Empresa</CardTitle>
              <CardDescription className="font-sarabun">
                Informações gerais do Complexo Felice
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label className="label-felice">Nome da Empresa</Label>
                  <Input
                    value={empresaNome}
                    onChange={(e) => setEmpresaNome(e.target.value)}
                    placeholder="Complexo Felice"
                    className="input-felice"
                  />
                </div>
                <div>
                  <Label className="label-felice">WhatsApp Principal</Label>
                  <Input
                    value={empresaWhatsapp}
                    onChange={(e) => setEmpresaWhatsapp(e.target.value)}
                    placeholder="5534999999999"
                    className="input-felice"
                  />
                </div>
              </div>

              <div className="pt-4">
                <Button
                  onClick={handleSaveGeral}
                  disabled={isSaving}
                  className="bg-dourado hover:bg-dourado-600"
                >
                  {isSaving ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  Salvar
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configurações do Kiosk */}
        <TabsContent value="kiosk">
          <Card className="card-felice">
            <CardHeader>
              <CardTitle className="font-butler">Modo Kiosk</CardTitle>
              <CardDescription className="font-sarabun">
                Configurações do modo totem/tablet
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label className="label-felice flex items-center gap-2">
                    <Key className="h-4 w-4" />
                    Senha de Saída
                  </Label>
                  <Input
                    value={kioskPassword}
                    onChange={(e) => setKioskPassword(e.target.value)}
                    placeholder="1234"
                    className="input-felice"
                  />
                  <p className="text-xs text-cafe/50 mt-1">
                    Senha para sair do modo kiosk (5 toques no logo)
                  </p>
                </div>
                <div>
                  <Label className="label-felice">Timeout de Inatividade (minutos)</Label>
                  <Input
                    type="number"
                    value={kioskTimeout}
                    onChange={(e) => setKioskTimeout(e.target.value)}
                    min="1"
                    max="30"
                    className="input-felice"
                  />
                  <p className="text-xs text-cafe/50 mt-1">
                    Tempo até exibir a tela de descanso
                  </p>
                </div>
              </div>

              <div className="pt-4">
                <Button
                  onClick={handleSaveGeral}
                  disabled={isSaving}
                  className="bg-dourado hover:bg-dourado-600"
                >
                  {isSaving ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  Salvar
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Núcleos */}
        <TabsContent value="nucleos">
          <Card className="card-felice">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="font-butler">Núcleos / Especialidades</CardTitle>
                <CardDescription className="font-sarabun">
                  Áreas de atuação do Complexo Felice
                </CardDescription>
              </div>
              <Button
                onClick={handleCreateNucleo}
                className="bg-dourado hover:bg-dourado-600"
              >
                <Plus className="mr-2 h-4 w-4" />
                Novo Núcleo
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {nucleos.map((nucleo) => (
                  <div
                    key={nucleo.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-seda/30 border border-nude/20"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: nucleo.cor || '#c29863' }}
                      />
                      <div>
                        <p className="font-medium text-cafe">{nucleo.nome}</p>
                        <p className="text-xs text-cafe/50">/{nucleo.slug}</p>
                      </div>
                      {!nucleo.ativo && (
                        <Badge variant="outline" className="text-cafe/50">
                          Inativo
                        </Badge>
                      )}
                    </div>

                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditNucleo(nucleo)}
                        className="h-8 w-8"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedNucleo(nucleo)
                          setDeleteNucleoOpen(true)
                        }}
                        className="h-8 w-8 text-error"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Usuários */}
        <TabsContent value="usuarios">
          <Card className="card-felice">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="font-butler">Usuários do Sistema</CardTitle>
                <CardDescription className="font-sarabun">
                  Gerencie quem pode acessar o painel administrativo
                </CardDescription>
              </div>
              <Button
                onClick={handleCreateUsuario}
                className="bg-dourado hover:bg-dourado-600"
              >
                <Plus className="mr-2 h-4 w-4" />
                Novo Usuário
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {usuarios.length === 0 ? (
                  <p className="text-center text-cafe/50 py-8">
                    Nenhum usuário cadastrado
                  </p>
                ) : (
                  usuarios.map((usuario) => (
                    <div
                      key={usuario.id}
                      className="flex items-center justify-between p-4 rounded-lg bg-seda/30 border border-nude/20"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-dourado/20 flex items-center justify-center">
                          <Users className="h-5 w-5 text-dourado" />
                        </div>
                        <div>
                          <p className="font-medium text-cafe">
                            {usuario.equipe?.nome || usuario.email}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-cafe/50">
                            <Mail className="h-3 w-3" />
                            {usuario.email}
                          </div>
                        </div>
                        <Badge variant={getRoleBadgeVariant(usuario.equipe?.role || 'atendente')}>
                          <Shield className="h-3 w-3 mr-1" />
                          {getRoleLabel(usuario.equipe?.role || 'atendente')}
                        </Badge>
                        {usuario.equipe && !usuario.equipe.ativo && (
                          <Badge variant="outline" className="text-error">
                            Inativo
                          </Badge>
                        )}
                      </div>

                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditUsuario(usuario)}
                          className="h-8 w-8"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedUsuario(usuario)
                            setDeleteUsuarioOpen(true)
                          }}
                          className="h-8 w-8 text-error"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Núcleo Form Dialog */}
      <Dialog open={nucleoFormOpen} onOpenChange={setNucleoFormOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-butler text-cafe">
              {selectedNucleo ? 'Editar Núcleo' : 'Novo Núcleo'}
            </DialogTitle>
            <DialogDescription className="font-sarabun">
              Preencha os dados do núcleo/especialidade
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label className="label-felice">Nome *</Label>
              <Input
                value={nucleoNome}
                onChange={(e) => setNucleoNome(e.target.value)}
                placeholder="Ex: Cirurgia Plástica"
                className="input-felice"
              />
            </div>
            <div>
              <Label className="label-felice">Cor</Label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={nucleoCor}
                  onChange={(e) => setNucleoCor(e.target.value)}
                  className="h-10 w-20 rounded border border-nude/30 cursor-pointer"
                />
                <Input
                  value={nucleoCor}
                  onChange={(e) => setNucleoCor(e.target.value)}
                  className="input-felice flex-1"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setNucleoFormOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSaveNucleo}
              disabled={!nucleoNome}
              className="bg-dourado hover:bg-dourado-600"
            >
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Núcleo Dialog */}
      <ConfirmDialog
        open={deleteNucleoOpen}
        onOpenChange={setDeleteNucleoOpen}
        title="Excluir Núcleo"
        description={`Excluir "${selectedNucleo?.nome}"? Profissionais e perguntas vinculados perderão a associação.`}
        confirmLabel="Excluir"
        variant="destructive"
        onConfirm={handleDeleteNucleo}
      />

      {/* Usuário Form Dialog */}
      <Dialog open={usuarioFormOpen} onOpenChange={setUsuarioFormOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-butler text-cafe">
              {selectedUsuario ? 'Editar Usuário' : 'Novo Usuário'}
            </DialogTitle>
            <DialogDescription className="font-sarabun">
              Preencha os dados do usuário
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label className="label-felice">Nome *</Label>
              <Input
                value={usuarioNome}
                onChange={(e) => setUsuarioNome(e.target.value)}
                placeholder="Nome completo"
                className="input-felice"
              />
            </div>
            <div>
              <Label className="label-felice flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email *
              </Label>
              <Input
                type="email"
                value={usuarioEmail}
                onChange={(e) => setUsuarioEmail(e.target.value)}
                placeholder="email@exemplo.com"
                className="input-felice"
              />
            </div>
            <div>
              <Label className="label-felice flex items-center gap-2">
                <Key className="h-4 w-4" />
                Senha {selectedUsuario ? '(deixe em branco para manter)' : '*'}
              </Label>
              <Input
                type="password"
                value={usuarioSenha}
                onChange={(e) => setUsuarioSenha(e.target.value)}
                placeholder={selectedUsuario ? '••••••••' : 'Mínimo 6 caracteres'}
                className="input-felice"
              />
            </div>
            <div>
              <Label className="label-felice">Telefone</Label>
              <Input
                value={usuarioTelefone}
                onChange={(e) => setUsuarioTelefone(e.target.value)}
                placeholder="(34) 99999-9999"
                className="input-felice"
              />
            </div>
            <div>
              <Label className="label-felice flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Função
              </Label>
              <Select value={usuarioRole} onValueChange={setUsuarioRole}>
                <SelectTrigger className="input-felice">
                  <SelectValue placeholder="Selecione a função" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Administrador</SelectItem>
                  <SelectItem value="atendente">Atendente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setUsuarioFormOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSaveUsuario}
              disabled={!usuarioNome || !usuarioEmail || isSavingUsuario}
              className="bg-dourado hover:bg-dourado-600"
            >
              {isSavingUsuario ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Usuário Dialog */}
      <ConfirmDialog
        open={deleteUsuarioOpen}
        onOpenChange={setDeleteUsuarioOpen}
        title="Excluir Usuário"
        description={`Excluir "${selectedUsuario?.equipe?.nome || selectedUsuario?.email}"? Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        variant="destructive"
        onConfirm={handleDeleteUsuario}
      />
    </div>
  )
}
