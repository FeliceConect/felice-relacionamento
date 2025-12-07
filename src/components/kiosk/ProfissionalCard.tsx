'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import type { Profissional, Nucleo } from '@/types/database'

interface ProfissionalCardProps {
  profissional: Profissional & { nucleo?: Nucleo | null }
  index: number
  onClick?: () => void
}

export function ProfissionalCard({ profissional, index, onClick }: ProfissionalCardProps) {
  const initials = profissional.nome
    .split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card
        className="card-felice cursor-pointer overflow-hidden group"
        onClick={onClick}
      >
        <CardContent className="p-0">
          {/* Foto */}
          <div className="relative aspect-[3/4] bg-seda overflow-hidden">
            {profissional.foto_url ? (
              <Image
                src={profissional.foto_url}
                alt={profissional.nome}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                unoptimized
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Avatar className="w-24 h-24">
                  <AvatarFallback className="bg-dourado/20 text-dourado text-3xl font-butler">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </div>
            )}

            {/* Núcleo badge */}
            {profissional.nucleo && (
              <div className="absolute top-3 left-3">
                <Badge
                  className="font-sarabun text-xs"
                  style={{
                    backgroundColor: `${profissional.nucleo.cor}20`,
                    color: profissional.nucleo.cor || '#c29863',
                    borderColor: `${profissional.nucleo.cor}40`,
                  }}
                >
                  {profissional.nucleo.nome}
                </Badge>
              </div>
            )}


          </div>

          {/* Info - Fora da imagem */}
          <div className="p-4 bg-white">
            <h3 className="font-butler text-lg text-cafe leading-tight">
              {profissional.nome}
            </h3>
            {profissional.especialidade && (
              <p className="font-sarabun text-sm text-dourado mt-1">
                {profissional.especialidade}
              </p>
            )}
            {profissional.crm && (
              <p className="font-sarabun text-xs text-cafe/60 mt-1">
                CRM: {profissional.crm}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
