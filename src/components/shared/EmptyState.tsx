'use client'

import { cn } from '@/lib/utils'
import { LucideIcon, Inbox, Search, FileX, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface EmptyStateProps {
  /** Ícone a ser exibido */
  icon?: LucideIcon
  /** Título do estado vazio */
  title: string
  /** Descrição adicional */
  description?: string
  /** Texto do botão de ação */
  actionLabel?: string
  /** Callback do botão de ação */
  onAction?: () => void
  /** Variante pré-definida */
  variant?: 'default' | 'search' | 'error' | 'empty-list'
  /** Classes adicionais */
  className?: string
}

const variantConfig = {
  default: {
    icon: Inbox,
    iconColor: 'text-nude',
  },
  search: {
    icon: Search,
    iconColor: 'text-nude',
  },
  error: {
    icon: FileX,
    iconColor: 'text-error',
  },
  'empty-list': {
    icon: Users,
    iconColor: 'text-nude',
  },
}

/**
 * Componente para estados vazios ou sem resultados
 */
export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  variant = 'default',
  className,
}: EmptyStateProps) {
  const config = variantConfig[variant]
  const Icon = icon || config.icon

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center p-8 rounded-xl',
        'bg-seda/20 border border-dashed border-nude/30',
        className
      )}
    >
      <div
        className={cn(
          'w-16 h-16 rounded-full flex items-center justify-center mb-4',
          'bg-white shadow-felice'
        )}
      >
        <Icon className={cn('w-8 h-8', config.iconColor)} />
      </div>

      <h3 className="font-butler text-xl text-cafe mb-2">
        {title}
      </h3>

      {description && (
        <p className="font-sarabun text-cafe/60 max-w-md mb-4">
          {description}
        </p>
      )}

      {actionLabel && onAction && (
        <Button
          onClick={onAction}
          className="bg-dourado hover:bg-dourado-600 text-white"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  )
}

export default EmptyState
