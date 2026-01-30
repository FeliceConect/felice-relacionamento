'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, User, Phone, ChevronRight, UserPlus, ArrowLeft } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { createClient } from '@/lib/supabase/client'
import type { Paciente } from '@/types/database'

interface IndicarBuscaPacienteProps {
  searchQuery: string
  searchResults: Paciente[]
  isSearching: boolean
  selectedPaciente: Paciente | null
  onSearchChange: (query: string) => void
  onSelectPaciente: (paciente: Paciente) => void
  onBack?: () => void
  profissionalNome?: string
}

export function IndicarBuscaPaciente({
  searchQuery,
  searchResults,
  isSearching,
  selectedPaciente,
  onSearchChange,
  onSelectPaciente,
  onBack,
  profissionalNome,
}: IndicarBuscaPacienteProps) {
  const [showCadastro, setShowCadastro] = useState(false)
  const [novoNome, setNovoNome] = useState('')
  const [novoTelefone, setNovoTelefone] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const formatPhone = (value: string) => {
    const cleaned = value.replace(/\D/g, '')
    if (cleaned.length <= 2) return cleaned
    if (cleaned.length <= 7) return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2)}`
    if (cleaned.length <= 11) return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7, 11)}`
  }

  const handlePhoneChange = (value: string) => {
    setNovoTelefone(formatPhone(value))
  }

  const handleCadastrar = async () => {
    if (novoNome.trim().length < 3) {
      setError('O nome deve ter pelo menos 3 caracteres')
      return
    }
    if (novoTelefone.replace(/\D/g, '').length < 10) {
      setError('O telefone deve ter pelo menos 10 dígitos')
      return
    }

    setIsSaving(true)
    setError(null)

    try {
      const supabase = createClient()
      const telefoneNumeros = novoTelefone.replace(/\D/g, '')

      const { data, error: insertError } = await supabase
        .from('form_pacientes')
        .insert({
          nome: novoNome.trim(),
          whatsapp: telefoneNumeros,
          whatsapp_formatado: novoTelefone,
        })
        .select()
        .single()

      if (insertError) throw insertError

      // Selecionar o novo paciente
      onSelectPaciente(data)
    } catch (err) {
      console.error('Erro ao cadastrar paciente:', err)
      setError('Erro ao cadastrar. Tente novamente.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleVoltar = () => {
    setShowCadastro(false)
    setNovoNome('')
    setNovoTelefone('')
    setError(null)
  }

  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-start px-6 py-12">
      <AnimatePresence mode="wait">
        {!showCadastro ? (
          <motion.div
            key="busca"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-xl"
          >
            {/* Back button and Title */}
            <div className="text-center mb-8">
              {onBack && (
                <button
                  onClick={onBack}
                  className="mb-4 inline-flex items-center gap-2 text-cafe/60 hover:text-cafe transition-colors font-sarabun"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Trocar profissional
                </button>
              )}
              <h1 className="font-butler text-3xl md:text-4xl text-cafe mb-3">
                Indicações Felice
              </h1>
              {profissionalNome && (
                <p className="font-sarabun text-dourado text-base mb-2">
                  Profissional: {profissionalNome}
                </p>
              )}
              <p className="font-sarabun text-cafe/70 text-lg">
                Busque o paciente pelo nome ou telefone
              </p>
            </div>

            {/* Search Input */}
            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-cafe/40" />
              <Input
                type="text"
                placeholder="Digite o nome ou telefone..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-12 py-6 text-lg font-sarabun bg-white border-nude/50 focus:border-dourado focus:ring-dourado/20"
              />
              {isSearching && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <LoadingSpinner size="sm" />
                </div>
              )}
            </div>

            {/* Results List */}
            <div className="space-y-3">
              {searchQuery.length >= 2 && !isSearching && searchResults.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-6"
                >
                  <p className="text-cafe/50 font-sarabun mb-4">
                    Nenhum paciente encontrado
                  </p>
                  <Button
                    onClick={() => setShowCadastro(true)}
                    className="bg-dourado hover:bg-dourado/90 text-white font-sarabun"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Cadastrar Novo Paciente
                  </Button>
                </motion.div>
              )}

              {searchResults.map((paciente, index) => (
                <motion.button
                  key={paciente.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => onSelectPaciente(paciente)}
                  className={`
                    w-full p-4 rounded-xl border-2 transition-all duration-200
                    flex items-center justify-between
                    ${selectedPaciente?.id === paciente.id
                      ? 'border-dourado bg-dourado/5'
                      : 'border-nude/30 bg-white hover:border-dourado/50 hover:bg-seda/30'
                    }
                  `}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-dourado/20 to-vinho/20 flex items-center justify-center">
                      <User className="h-6 w-6 text-vinho" />
                    </div>
                    <div className="text-left">
                      <p className="font-sarabun font-medium text-cafe text-lg">
                        {paciente.nome}
                      </p>
                      <div className="flex items-center gap-1 text-cafe/60">
                        <Phone className="h-3.5 w-3.5" />
                        <span className="font-sarabun text-sm">
                          {paciente.whatsapp_formatado || paciente.whatsapp}
                        </span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight className={`h-5 w-5 transition-colors ${
                    selectedPaciente?.id === paciente.id ? 'text-dourado' : 'text-cafe/30'
                  }`} />
                </motion.button>
              ))}
            </div>

            {/* Instructions + Cadastrar button */}
            {searchQuery.length < 2 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-center mt-12 space-y-4"
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-seda/50 text-cafe/60 font-sarabun text-sm">
                  <Search className="h-4 w-4" />
                  Digite pelo menos 2 caracteres para buscar
                </div>
                <div>
                  <Button
                    variant="outline"
                    onClick={() => setShowCadastro(true)}
                    className="border-dourado/30 text-dourado hover:bg-dourado hover:text-white font-sarabun"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Ou cadastrar novo paciente
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Cadastrar button when there are results */}
            {searchQuery.length >= 2 && searchResults.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center mt-6"
              >
                <Button
                  variant="outline"
                  onClick={() => setShowCadastro(true)}
                  className="border-dourado/30 text-dourado hover:bg-dourado hover:text-white font-sarabun"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Cadastrar novo paciente
                </Button>
              </motion.div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="cadastro"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-xl"
          >
            {/* Title */}
            <div className="text-center mb-8">
              <h1 className="font-butler text-3xl md:text-4xl text-cafe mb-3">
                Novo Paciente
              </h1>
              <p className="font-sarabun text-cafe/70 text-lg">
                Preencha os dados para cadastrar
              </p>
            </div>

            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 font-sarabun text-center"
              >
                {error}
              </motion.div>
            )}

            {/* Form */}
            <div className="space-y-4 mb-8">
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-cafe/40" />
                <Input
                  type="text"
                  placeholder="Nome completo do paciente"
                  value={novoNome}
                  onChange={(e) => setNovoNome(e.target.value)}
                  className="pl-12 py-6 text-lg font-sarabun bg-white border-nude/50 focus:border-dourado focus:ring-dourado/20"
                />
              </div>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-cafe/40" />
                <Input
                  type="tel"
                  placeholder="Telefone/WhatsApp"
                  value={novoTelefone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  className="pl-12 py-6 text-lg font-sarabun bg-white border-nude/50 focus:border-dourado focus:ring-dourado/20"
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                onClick={handleVoltar}
                disabled={isSaving}
                className="py-6 text-lg font-sarabun border-nude hover:bg-seda/30 sm:flex-1"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Voltar
              </Button>
              <Button
                onClick={handleCadastrar}
                disabled={isSaving || novoNome.trim().length < 3 || novoTelefone.replace(/\D/g, '').length < 10}
                className="py-6 text-lg font-sarabun bg-dourado hover:bg-dourado/90 text-white sm:flex-[2]"
              >
                {isSaving ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Cadastrando...
                  </>
                ) : (
                  <>
                    <UserPlus className="h-5 w-5 mr-2" />
                    Cadastrar e Continuar
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
