'use client'

import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
  /** Tamanho do spinner */
  size?: 'sm' | 'md' | 'lg' | 'xl'
  /** Cor do spinner */
  color?: 'dourado' | 'cafe' | 'white' | 'current'
  /** Texto de carregamento (opcional) */
  text?: string
  /** Centralizar na tela */
  fullScreen?: boolean
  /** Classes adicionais */
  className?: string
}

const sizeMap = {
  sm: 'h-4 w-4',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
  xl: 'h-16 w-16',
}

const colorMap = {
  dourado: 'text-dourado',
  cafe: 'text-cafe',
  white: 'text-white',
  current: '',
}

const textSizeMap = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
  xl: 'text-lg',
}

/**
 * Spinner de carregamento com estilo Felice
 */
export function LoadingSpinner({
  size = 'md',
  color = 'dourado',
  text,
  fullScreen = false,
  className,
}: LoadingSpinnerProps) {
  const spinner = (
    <div className={cn('flex flex-col items-center justify-center gap-3', className)}>
      <svg
        className={cn(
          sizeMap[size],
          colorMap[color],
          'animate-spin'
        )}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="3"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      {text && (
        <p className={cn(
          textSizeMap[size],
          colorMap[color],
          'font-sarabun animate-pulse'
        )}>
          {text}
        </p>
      )}
    </div>
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50">
        {spinner}
      </div>
    )
  }

  return spinner
}

/**
 * Spinner alternativo com logo Felice
 */
export function LoadingLogo({
  size = 'md',
  text = 'Carregando...',
  className,
}: Omit<LoadingSpinnerProps, 'color'>) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-4', className)}>
      <div className={cn(
        sizeMap[size],
        'relative'
      )}>
        {/* Círculo externo animado */}
        <svg
          className="absolute inset-0 animate-spin-slow"
          viewBox="0 0 100 100"
          fill="none"
        >
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke="currentColor"
            strokeWidth="2"
            strokeDasharray="70 200"
            className="text-dourado"
          />
        </svg>
        {/* Símbolo central */}
        <svg
          className="absolute inset-0 text-dourado"
          viewBox="0 0 100 100"
          fill="none"
        >
          <path
            d="M50 20C50 20 62 32 62 44C62 56 50 60 50 60C50 60 38 56 38 44C38 32 50 20 50 20Z"
            fill="currentColor"
            opacity="0.9"
          />
          <circle cx="50" cy="50" r="6" fill="currentColor" />
        </svg>
      </div>
      {text && (
        <p className={cn(
          textSizeMap[size],
          'text-cafe/70 font-sarabun'
        )}>
          {text}
        </p>
      )}
    </div>
  )
}

export default LoadingSpinner
