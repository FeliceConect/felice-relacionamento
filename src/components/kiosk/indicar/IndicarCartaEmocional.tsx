'use client'

import { motion } from 'framer-motion'
import { Heart, ArrowLeft, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface IndicarCartaEmocionalProps {
  nomePaciente: string
  onContinue: () => void
  onBack: () => void
}

export function IndicarCartaEmocional({
  nomePaciente,
  onContinue,
  onBack,
}: IndicarCartaEmocionalProps) {
  const firstName = nomePaciente.split(' ')[0]

  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-lg text-center"
      >
        {/* Heart Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="mb-8 inline-flex"
        >
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-dourado/20 to-vinho/20 flex items-center justify-center">
            <Heart className="h-10 w-10 text-vinho fill-vinho/20" />
          </div>
        </motion.div>

        {/* Letter Content */}
        <div className="space-y-6 mb-10">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="font-butler text-3xl md:text-4xl text-cafe"
          >
            Querida {firstName},
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="font-butler text-2xl md:text-3xl text-dourado"
          >
            Você agora faz parte da nossa família Felice!
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="font-sarabun text-lg text-cafe/80 leading-relaxed"
          >
            Foi uma honra poder cuidar de você e fazer parte dessa
            transformação tão especial na sua vida.
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="font-sarabun text-lg text-cafe/80 leading-relaxed"
          >
            Acreditamos que a beleza e o bem-estar devem ser
            compartilhados. Por isso, gostaríamos que você ajudasse outras
            pessoas queridas que também merecem essa
            experiência única.
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="font-sarabun text-lg text-cafe/80 leading-relaxed italic"
          >
            Quem são as pessoas que você ama e que também
            poderiam fazer parte dessa família?
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="font-butler text-xl text-vinho pt-4"
          >
            Com carinho,
            <br />
            Equipe Felice
          </motion.p>
        </div>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="flex flex-col sm:flex-row gap-3 justify-center"
        >
          <Button
            variant="outline"
            onClick={onBack}
            className="py-6 px-8 text-lg font-sarabun border-nude hover:bg-seda/30"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Voltar
          </Button>
          <Button
            onClick={onContinue}
            className="py-6 px-8 text-lg font-sarabun bg-dourado hover:bg-dourado/90 text-white"
          >
            Quero Indicar
            <ArrowRight className="h-5 w-5 ml-2" />
          </Button>
        </motion.div>
      </motion.div>
    </div>
  )
}
