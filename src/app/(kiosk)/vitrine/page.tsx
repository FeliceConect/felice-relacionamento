'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { EmptyState } from '@/components/shared/EmptyState'
import { ProfissionalCard, ProfissionalModal } from '@/components/kiosk'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { FileText, Users } from 'lucide-react'
import Link from 'next/link'
import type { Profissional, Nucleo } from '@/types/database'

type ProfissionalComNucleo = Profissional & { nucleo: Nucleo | null }

export default function VitrinePage() {
  const [profissionais, setProfissionais] = useState<ProfissionalComNucleo[]>([])
  const [nucleos, setNucleos] = useState<Nucleo[]>([])
  const [selectedNucleo, setSelectedNucleo] = useState<string | null>(null)
  const [selectedProfissional, setSelectedProfissional] = useState<ProfissionalComNucleo | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      const supabase = createClient()

      try {
        // Carregar núcleos
        const { data: nucleosData } = await supabase
          .from('form_nucleos')
          .select('*')
          .eq('ativo', true)
          .order('ordem')

        if (nucleosData) {
          setNucleos(nucleosData)
        }

        // Carregar profissionais com núcleos
        const { data: profissionaisData } = await supabase
          .from('form_profissionais')
          .select(`
            *,
            nucleo:form_nucleos(*)
          `)
          .eq('ativo', true)
          .order('ordem')

        if (profissionaisData) {
          setProfissionais(profissionaisData as ProfissionalComNucleo[])
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  const filteredProfissionais = selectedNucleo
    ? profissionais.filter(p => p.nucleo_id === selectedNucleo)
    : profissionais

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center">
        <LoadingSpinner size="lg" text="Carregando profissionais..." />
      </div>
    )
  }

  if (profissionais.length === 0) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center px-6">
        <EmptyState
          icon={Users}
          title="Nenhum profissional cadastrado"
          description="Em breve você poderá conhecer nossa equipe de especialistas."
        />
        <Link href="/formulario" className="mt-6">
          <Button className="bg-dourado hover:bg-dourado-600 text-white">
            <FileText className="mr-2 h-4 w-4" />
            Preencher Formulário
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col">
      {/* Header */}
      <div className="px-6 pt-6 pb-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-2xl mx-auto"
        >
          <h1 className="font-butler text-2xl md:text-3xl text-cafe mb-2">
            Nossa Equipe
          </h1>
          <p className="font-sarabun text-cafe/70">
            Conheça os profissionais do Complexo Felice
          </p>
        </motion.div>

        {/* Filtro por núcleo */}
        {nucleos.length > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-6"
          >
            <ScrollArea className="w-full whitespace-nowrap">
              <div className="flex gap-2 justify-center pb-2">
                <Badge
                  variant={selectedNucleo === null ? 'default' : 'outline'}
                  className={`cursor-pointer px-4 py-2 font-sarabun text-sm transition-all ${
                    selectedNucleo === null
                      ? 'bg-dourado text-white border-dourado'
                      : 'border-nude/50 text-cafe/70 hover:border-dourado hover:text-dourado'
                  }`}
                  onClick={() => setSelectedNucleo(null)}
                >
                  Todos
                </Badge>

                {nucleos.map(nucleo => (
                  <Badge
                    key={nucleo.id}
                    variant={selectedNucleo === nucleo.id ? 'default' : 'outline'}
                    className="cursor-pointer px-4 py-2 font-sarabun text-sm transition-all"
                    style={{
                      backgroundColor: selectedNucleo === nucleo.id ? nucleo.cor || '#c29863' : 'transparent',
                      color: selectedNucleo === nucleo.id ? 'white' : nucleo.cor || '#c29863',
                      borderColor: nucleo.cor || '#c29863',
                    }}
                    onClick={() => setSelectedNucleo(nucleo.id)}
                  >
                    {nucleo.nome}
                  </Badge>
                ))}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </motion.div>
        )}
      </div>

      {/* Grid de profissionais */}
      <div className="flex-1 px-6 pb-6 overflow-auto">
        {filteredProfissionais.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center h-full"
          >
            <EmptyState
              icon={Users}
              title="Nenhum profissional neste núcleo"
              description="Selecione outro núcleo para ver os profissionais disponíveis."
            />
          </motion.div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
            {filteredProfissionais.map((profissional, index) => (
              <ProfissionalCard
                key={profissional.id}
                profissional={profissional}
                index={index}
                onClick={() => setSelectedProfissional(profissional)}
              />
            ))}
          </div>
        )}
      </div>

      {/* CTA para formulário */}
      <div className="px-6 py-4 bg-white/80 backdrop-blur-sm border-t border-nude/30">
        <div className="max-w-md mx-auto text-center">
          <Link href="/formulario">
            <Button className="bg-dourado hover:bg-dourado-600 text-white font-sarabun w-full sm:w-auto px-8">
              <FileText className="mr-2 h-4 w-4" />
              Preencher Formulário
            </Button>
          </Link>
        </div>
      </div>

      {/* Modal de detalhes */}
      <ProfissionalModal
        profissional={selectedProfissional}
        open={!!selectedProfissional}
        onOpenChange={(open) => !open && setSelectedProfissional(null)}
      />
    </div>
  )
}
