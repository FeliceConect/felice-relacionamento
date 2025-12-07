'use client'

import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { Hand } from 'lucide-react'

interface KioskIdleOverlayProps {
  isVisible: boolean
  onDismiss: () => void
}

export function KioskIdleOverlay({ isVisible, onDismiss }: KioskIdleOverlayProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          onClick={onDismiss}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-felice cursor-pointer"
        >
          {/* Logo animado */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="relative"
          >
            <Image
              src="/images/logo.png"
              alt="Felice"
              width={280}
              height={90}
              priority
              className="brightness-0 invert"
            />
          </motion.div>

          {/* Mensagem de toque */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="mt-12 text-center"
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 mb-4"
            >
              <Hand className="w-8 h-8 text-white" />
            </motion.div>

            <p className="text-white text-xl font-sarabun">
              Toque na tela para continuar
            </p>
          </motion.div>

          {/* Indicador pulsante */}
          <motion.div
            className="absolute bottom-16 left-1/2 transform -translate-x-1/2"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <div className="flex space-x-2">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 rounded-full bg-white"
                  animate={{ scale: [1, 1.5, 1] }}
                  transition={{
                    repeat: Infinity,
                    duration: 1.5,
                    delay: i * 0.2,
                  }}
                />
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
