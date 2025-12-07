'use client'

import { cn } from '@/lib/utils'

interface LogoProps {
  /** Variante do logo */
  variant?: 'full' | 'horizontal' | 'symbol'
  /** Tamanho do logo */
  size?: 'sm' | 'md' | 'lg' | 'xl'
  /** Cor do logo (usa currentColor se não especificado) */
  color?: 'dourado' | 'cafe' | 'white' | 'current'
  /** Classes adicionais */
  className?: string
}

const sizeMap = {
  sm: { full: 'h-8', horizontal: 'h-6', symbol: 'h-8 w-8' },
  md: { full: 'h-12', horizontal: 'h-8', symbol: 'h-12 w-12' },
  lg: { full: 'h-16', horizontal: 'h-12', symbol: 'h-16 w-16' },
  xl: { full: 'h-24', horizontal: 'h-16', symbol: 'h-24 w-24' },
}

const colorMap = {
  dourado: 'text-dourado',
  cafe: 'text-cafe',
  white: 'text-white',
  current: '',
}

/**
 * Logo do Complexo Felice
 *
 * Variantes:
 * - full: Logo completo com símbolo e texto
 * - horizontal: Logo horizontal (símbolo + texto lado a lado)
 * - symbol: Apenas o símbolo (flor)
 */
export function Logo({
  variant = 'full',
  size = 'md',
  color = 'current',
  className
}: LogoProps) {
  const sizeClass = sizeMap[size][variant]
  const colorClass = colorMap[color]

  if (variant === 'symbol') {
    return (
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn(sizeClass, colorClass, className)}
        aria-label="Felice - Símbolo"
      >
        {/* Flor estilizada - símbolo Felice */}
        <circle cx="50" cy="50" r="48" stroke="currentColor" strokeWidth="2" fill="none" />
        <path
          d="M50 15C50 15 65 30 65 45C65 60 50 65 50 65C50 65 35 60 35 45C35 30 50 15 50 15Z"
          fill="currentColor"
          opacity="0.9"
        />
        <path
          d="M50 85C50 85 35 70 35 55C35 40 50 35 50 35C50 35 65 40 65 55C65 70 50 85 50 85Z"
          fill="currentColor"
          opacity="0.7"
        />
        <path
          d="M15 50C15 50 30 35 45 35C60 35 65 50 65 50C65 50 60 65 45 65C30 65 15 50 15 50Z"
          fill="currentColor"
          opacity="0.8"
        />
        <path
          d="M85 50C85 50 70 65 55 65C40 65 35 50 35 50C35 50 40 35 55 35C70 35 85 50 85 50Z"
          fill="currentColor"
          opacity="0.6"
        />
        <circle cx="50" cy="50" r="8" fill="currentColor" />
      </svg>
    )
  }

  if (variant === 'horizontal') {
    return (
      <svg
        viewBox="0 0 200 50"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn(sizeClass, colorClass, 'w-auto', className)}
        aria-label="Complexo Felice"
      >
        {/* Símbolo pequeno */}
        <g transform="translate(0, 0) scale(0.5)">
          <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="2.5" fill="none" />
          <path
            d="M50 18C50 18 62 30 62 42C62 54 50 58 50 58C50 58 38 54 38 42C38 30 50 18 50 18Z"
            fill="currentColor"
            opacity="0.9"
          />
          <path
            d="M50 82C50 82 38 70 38 58C38 46 50 42 50 42C50 42 62 46 62 58C62 70 50 82 50 82Z"
            fill="currentColor"
            opacity="0.7"
          />
          <path
            d="M18 50C18 50 30 38 42 38C54 38 58 50 58 50C58 50 54 62 42 62C30 62 18 50 18 50Z"
            fill="currentColor"
            opacity="0.8"
          />
          <path
            d="M82 50C82 50 70 62 58 62C46 62 42 50 42 50C42 50 46 38 58 38C70 38 82 50 82 50Z"
            fill="currentColor"
            opacity="0.6"
          />
          <circle cx="50" cy="50" r="6" fill="currentColor" />
        </g>
        {/* Texto FELICE */}
        <text
          x="60"
          y="35"
          fill="currentColor"
          fontFamily="var(--font-butler), Georgia, serif"
          fontSize="28"
          fontWeight="500"
          letterSpacing="3"
        >
          FELICE
        </text>
      </svg>
    )
  }

  // Variant: full
  return (
    <svg
      viewBox="0 0 120 150"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(sizeClass, colorClass, 'w-auto', className)}
      aria-label="Complexo Felice"
    >
      {/* Símbolo */}
      <g transform="translate(10, 0) scale(1)">
        <circle cx="50" cy="50" r="48" stroke="currentColor" strokeWidth="2" fill="none" />
        <path
          d="M50 15C50 15 65 30 65 45C65 60 50 65 50 65C50 65 35 60 35 45C35 30 50 15 50 15Z"
          fill="currentColor"
          opacity="0.9"
        />
        <path
          d="M50 85C50 85 35 70 35 55C35 40 50 35 50 35C50 35 65 40 65 55C65 70 50 85 50 85Z"
          fill="currentColor"
          opacity="0.7"
        />
        <path
          d="M15 50C15 50 30 35 45 35C60 35 65 50 65 50C65 50 60 65 45 65C30 65 15 50 15 50Z"
          fill="currentColor"
          opacity="0.8"
        />
        <path
          d="M85 50C85 50 70 65 55 65C40 65 35 50 35 50C35 50 40 35 55 35C70 35 85 50 85 50Z"
          fill="currentColor"
          opacity="0.6"
        />
        <circle cx="50" cy="50" r="8" fill="currentColor" />
      </g>
      {/* Texto */}
      <text
        x="60"
        y="130"
        fill="currentColor"
        fontFamily="var(--font-butler), Georgia, serif"
        fontSize="22"
        fontWeight="500"
        letterSpacing="4"
        textAnchor="middle"
      >
        FELICE
      </text>
    </svg>
  )
}

export default Logo
