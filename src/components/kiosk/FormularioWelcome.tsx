'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

interface FormularioWelcomeProps {
  onStart: () => void
}

export function FormularioWelcome({ onStart }: FormularioWelcomeProps) {
  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-lg"
      >
        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="font-butler text-3xl md:text-4xl text-cafe mb-4"
        >
          Seja muito bem-vinda(o) ao{' '}
          <span className="text-dourado">Complexo Felice!</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="font-sarabun text-lg text-cafe/70 mb-10"
        >
          Este é um momento muito importante da sua jornada conosco.
          Por favor preencha este formulário.
        </motion.p>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <Button
            onClick={onStart}
            size="lg"
            className="bg-dourado hover:bg-dourado-600 text-white font-sarabun font-medium px-10 py-6 text-lg rounded-xl shadow-felice hover:shadow-felice-lg transition-all"
          >
            Começar
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </motion.div>

        {/* Info text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="font-sarabun text-sm text-cafe/50 mt-8"
        >
          Leva menos de 2 minutos
        </motion.p>
      </motion.div>
    </div>
  )
}
