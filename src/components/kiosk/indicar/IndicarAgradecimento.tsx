'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Heart, Sparkles } from 'lucide-react'

interface IndicarAgradecimentoProps {
  nomePaciente: string
  quantidadeIndicacoes: number
  onReset: () => void
}

export function IndicarAgradecimento({
  nomePaciente,
  quantidadeIndicacoes,
}: IndicarAgradecimentoProps) {
  const router = useRouter()
  const firstName = nomePaciente.split(' ')[0]
  const [countdown, setCountdown] = useState(30)

  // Auto-redirect para vitrine após 30 segundos
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
        {/* Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="mb-8 inline-flex"
        >
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-dourado/20 to-vinho/20 flex items-center justify-center">
              <Heart className="h-12 w-12 text-vinho fill-vinho/30" />
            </div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4, type: 'spring' }}
              className="absolute -top-2 -right-2 w-10 h-10 rounded-full bg-dourado flex items-center justify-center"
            >
              <Sparkles className="h-5 w-5 text-white" />
            </motion.div>
          </div>
        </motion.div>

        {/* Title */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="font-butler text-3xl md:text-4xl text-cafe mb-4"
        >
          Obrigada, {firstName}!
        </motion.h2>

        {/* Message */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="font-sarabun text-xl text-dourado font-medium mb-4"
        >
          Sua generosidade nos emociona.
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="font-sarabun text-lg text-cafe/70 mb-2"
        >
          Você indicou{' '}
          <span className="text-dourado font-medium">
            {quantidadeIndicacoes} {quantidadeIndicacoes === 1 ? 'pessoa' : 'pessoas'}
          </span>{' '}
          queridas.
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="font-sarabun text-lg text-cafe/70 mb-8"
        >
          Entraremos em contato com suas indicações
          com todo o carinho que você merece.
        </motion.p>

        {/* Redirect info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="flex items-center justify-center gap-2"
        >
          <div className="w-2 h-2 rounded-full bg-dourado animate-pulse" />
          <p className="font-sarabun text-sm text-cafe/50">
            Conhecendo nossos profissionais em {countdown}...
          </p>
        </motion.div>
      </motion.div>

      {/* Confetti effect */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="fixed inset-0 pointer-events-none overflow-hidden"
      >
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-3 h-3 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              backgroundColor: ['#c29863', '#663739', '#ae9b89', '#ddd5c7'][i % 4],
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

      {/* Hearts floating */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="fixed inset-0 pointer-events-none overflow-hidden"
      >
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={`heart-${i}`}
            className="absolute"
            style={{
              left: `${10 + Math.random() * 80}%`,
              bottom: '-20px',
            }}
            animate={{
              y: [0, -window.innerHeight - 100],
              x: [0, (Math.random() - 0.5) * 100],
              opacity: [1, 0],
              scale: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 4 + Math.random() * 2,
              delay: 0.5 + i * 0.3,
              ease: 'easeOut',
            }}
          >
            <Heart
              className="h-6 w-6 text-vinho/30 fill-vinho/20"
              style={{ transform: `rotate(${Math.random() * 30 - 15}deg)` }}
            />
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}
