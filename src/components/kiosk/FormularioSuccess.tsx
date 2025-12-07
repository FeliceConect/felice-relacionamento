'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'

interface FormularioSuccessProps {
  nome: string
  onReset: () => void
}

export function FormularioSuccess({ nome }: FormularioSuccessProps) {
  const router = useRouter()
  const firstName = nome.split(' ')[0]
  const [countdown, setCountdown] = useState(4)

  // Auto-redirect para vitrine após 4 segundos
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          router.push('/vitrine')
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [router])

  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center px-6 py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-lg"
      >
        {/* Title */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="font-butler text-3xl md:text-4xl text-cafe mb-4"
        >
          Obrigado, {firstName}!
        </motion.h2>

        {/* Message */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="font-sarabun text-lg text-cafe/70 mb-8"
        >
          Agora vamos te mostrar tudo o que você pode aproveitar no{' '}
          <span className="text-dourado font-medium">Complexo Felice</span>.
        </motion.p>

        {/* Redirect info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="flex items-center justify-center gap-2"
        >
          <div className="w-2 h-2 rounded-full bg-dourado animate-pulse" />
          <p className="font-sarabun text-sm text-cafe/50">
            Carregando em {countdown}...
          </p>
        </motion.div>
      </motion.div>

      {/* Confetti effect (optional visual enhancement) */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="fixed inset-0 pointer-events-none overflow-hidden"
      >
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-3 h-3 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              backgroundColor: ['#c29863', '#663739', '#4ade80', '#ae9b89'][i % 4],
            }}
            initial={{ y: -20, opacity: 1 }}
            animate={{
              y: '100vh',
              opacity: 0,
              rotate: Math.random() * 360,
            }}
            transition={{
              duration: 2 + Math.random() * 2,
              delay: Math.random() * 0.5,
              ease: 'easeIn',
            }}
          />
        ))}
      </motion.div>
    </div>
  )
}
