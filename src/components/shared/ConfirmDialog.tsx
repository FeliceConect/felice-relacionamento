'use client'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { cn } from '@/lib/utils'

interface ConfirmDialogProps {
  /** Controle de abertura */
  open: boolean
  /** Callback para fechar */
  onOpenChange: (open: boolean) => void
  /** Título do diálogo */
  title: string
  /** Descrição/mensagem */
  description: string
  /** Texto do botão de confirmação */
  confirmLabel?: string
  /** Texto do botão de cancelamento */
  cancelLabel?: string
  /** Callback de confirmação */
  onConfirm: () => void
  /** Callback de cancelamento */
  onCancel?: () => void
  /** Variante de estilo */
  variant?: 'default' | 'destructive'
  /** Loading state */
  loading?: boolean
}

/**
 * Diálogo de confirmação com estilo Felice
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  onConfirm,
  onCancel,
  variant = 'default',
  loading = false,
}: ConfirmDialogProps) {
  const handleCancel = () => {
    onCancel?.()
    onOpenChange(false)
  }

  const handleConfirm = () => {
    onConfirm()
    if (!loading) {
      onOpenChange(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="border-nude/30">
        <AlertDialogHeader>
          <AlertDialogTitle className="font-butler text-cafe">
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className="font-sarabun text-cafe/70">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            onClick={handleCancel}
            disabled={loading}
            className="font-sarabun border-nude/50 hover:bg-seda/50"
          >
            {cancelLabel}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={loading}
            className={cn(
              'font-sarabun',
              variant === 'destructive'
                ? 'bg-error hover:bg-error-600 text-white'
                : 'bg-dourado hover:bg-dourado-600 text-white'
            )}
          >
            {loading ? 'Aguarde...' : confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default ConfirmDialog
