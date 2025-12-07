'use client'

import Image from 'next/image'
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { X } from 'lucide-react'
import type { Profissional, Nucleo, Procedimento } from '@/types/database'

interface ProfissionalModalProps {
  profissional: (Profissional & { nucleo?: Nucleo | null }) | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ProfissionalModal({
  profissional,
  open,
  onOpenChange,
}: ProfissionalModalProps) {
  if (!profissional) return null

  const initials = profissional.nome
    .split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  // Handle both old format (string[]) and new format ({nome, descricao}[])
  const procedimentos: Procedimento[] = (profissional.procedimentos || []).map((p) => {
    if (typeof p === 'string') {
      return { nome: p, descricao: '' }
    }
    return p as Procedimento
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl h-[85vh] max-h-[700px] p-0 overflow-hidden bg-white">
        {/* Close button */}
        <button
          onClick={() => onOpenChange(false)}
          className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-seda/80 backdrop-blur-sm flex items-center justify-center text-cafe hover:bg-seda transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col md:flex-row h-full">
          {/* Foto - Lado esquerdo - FIXA */}
          <div className="relative w-full md:w-2/5 h-48 md:h-full bg-seda flex-shrink-0">
            {profissional.foto_url ? (
              <Image
                src={profissional.foto_url}
                alt={profissional.nome}
                fill
                className="object-cover object-top"
                unoptimized
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Avatar className="w-32 h-32">
                  <AvatarFallback className="bg-dourado/20 text-dourado text-4xl font-butler">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </div>
            )}
          </div>

          {/* Content - Lado direito - COM SCROLL */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6 md:p-8">
              {/* Núcleo badge */}
              {profissional.nucleo && (
                <Badge
                  className="font-sarabun text-xs mb-4"
                  style={{
                    backgroundColor: `${profissional.nucleo.cor}20`,
                    color: profissional.nucleo.cor || '#c29863',
                    borderColor: `${profissional.nucleo.cor}40`,
                  }}
                >
                  {profissional.nucleo.nome}
                </Badge>
              )}

              {/* Nome */}
              <h2 className="font-butler text-2xl md:text-3xl text-cafe mb-2">
                {profissional.nome}
              </h2>

              {/* Especialidade */}
              {profissional.especialidade && (
                <p className="font-sarabun text-lg text-dourado mb-1">
                  {profissional.especialidade}
                </p>
              )}

              {/* CRM */}
              {profissional.crm && (
                <p className="font-sarabun text-sm text-cafe/60 mb-6">
                  CRM: {profissional.crm}
                </p>
              )}

              {/* Descrição */}
              {profissional.descricao && (
                <div className="mb-6">
                  <h3 className="font-butler text-sm text-cafe/80 mb-2">
                    Sobre
                  </h3>
                  <p className="font-sarabun text-cafe/70 text-sm leading-relaxed">
                    {profissional.descricao}
                  </p>
                </div>
              )}

              {/* Procedimentos com nome e descrição */}
              {procedimentos.length > 0 && (
                <div>
                  <h3 className="font-butler text-sm text-cafe/80 mb-3">
                    Procedimentos
                  </h3>
                  <div className="space-y-4">
                    {procedimentos.map((proc, i) => (
                      <div
                        key={i}
                        className="border-l-2 border-dourado/40 pl-4"
                      >
                        <h4 className="font-sarabun font-medium text-cafe text-sm">
                          {proc.nome}
                        </h4>
                        {proc.descricao && (
                          <p className="font-sarabun text-cafe/60 text-sm mt-1 leading-relaxed">
                            {proc.descricao}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
