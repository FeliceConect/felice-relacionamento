'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { KioskExitDialog } from '@/components/kiosk/KioskExitDialog'
import { KioskIdleOverlay } from '@/components/kiosk/KioskIdleOverlay'

const IDLE_TIMEOUT_MS = 5 * 60 * 1000 // 5 minutos

interface KioskLayoutProps {
  children: React.ReactNode
}

export default function KioskLayout({ children }: KioskLayoutProps) {
  const [isIdle, setIsIdle] = useState(false)
  const [showExitDialog, setShowExitDialog] = useState(false)
  const [tapCount, setTapCount] = useState(0)
  const [lastTapTime, setLastTapTime] = useState(0)

  // Reset idle timer on activity
  const resetIdleTimer = useCallback(() => {
    setIsIdle(false)
  }, [])

  // Handle activity events
  useEffect(() => {
    let idleTimer: NodeJS.Timeout

    const handleActivity = () => {
      resetIdleTimer()
      clearTimeout(idleTimer)
      idleTimer = setTimeout(() => setIsIdle(true), IDLE_TIMEOUT_MS)
    }

    // Add activity listeners
    const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart']
    events.forEach(event => {
      document.addEventListener(event, handleActivity, { passive: true })
    })

    // Initial timer
    idleTimer = setTimeout(() => setIsIdle(true), IDLE_TIMEOUT_MS)

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity)
      })
      clearTimeout(idleTimer)
    }
  }, [resetIdleTimer])

  // Handle logo tap for exit (5 taps rápidos no logo)
  const handleLogoTap = () => {
    const now = Date.now()

    if (now - lastTapTime < 500) {
      const newCount = tapCount + 1
      setTapCount(newCount)

      if (newCount >= 5) {
        setShowExitDialog(true)
        setTapCount(0)
      }
    } else {
      setTapCount(1)
    }

    setLastTapTime(now)
  }

  // Prevent context menu and selection (modo kiosk)
  useEffect(() => {
    const preventContextMenu = (e: MouseEvent) => e.preventDefault()
    const preventSelection = (e: Event) => e.preventDefault()

    document.addEventListener('contextmenu', preventContextMenu)
    document.addEventListener('selectstart', preventSelection)

    return () => {
      document.removeEventListener('contextmenu', preventContextMenu)
      document.removeEventListener('selectstart', preventSelection)
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-soft flex flex-col select-none">
      {/* Header fixo com logo */}
      <header className="bg-white/90 backdrop-blur-sm border-b border-nude/30 py-4 px-6 safe-top">
        <div className="max-w-4xl mx-auto flex justify-center">
          <button
            onClick={handleLogoTap}
            className="focus:outline-none transition-transform active:scale-95"
            aria-label="Logo Felice"
          >
            <Image
              src="/images/logo.png"
              alt="Felice"
              width={160}
              height={50}
              priority
            />
          </button>
        </div>
      </header>

      {/* Conteúdo principal */}
      <main className="flex-1 overflow-auto safe-bottom">
        <AnimatePresence mode="wait">
          <motion.div
            key="kiosk-content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="h-full"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Dialog de saída do kiosk */}
      <KioskExitDialog
        open={showExitDialog}
        onOpenChange={setShowExitDialog}
      />

      {/* Overlay de inatividade */}
      <KioskIdleOverlay
        isVisible={isIdle}
        onDismiss={resetIdleTimer}
      />
    </div>
  )
}
