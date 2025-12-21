'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Image from 'next/image'

interface ImageUploadProps {
  /** URL da imagem atual */
  value?: string | null
  /** Callback quando uma imagem é enviada (retorna URL) */
  onChange: (url: string | null) => void
  /** Callback quando a imagem é removida */
  onRemove?: () => void
  /** Texto de placeholder */
  placeholder?: string
  /** Tipos de arquivo aceitos */
  accept?: string
  /** Tamanho máximo em MB */
  maxSize?: number
  /** Aspecto da imagem */
  aspect?: 'square' | 'video' | 'portrait'
  /** Desabilitar upload */
  disabled?: boolean
  /** Classes adicionais */
  className?: string
  /** Pasta dentro do storage */
  folder?: string
}

const aspectMap = {
  square: 'aspect-square',
  video: 'aspect-video',
  portrait: 'aspect-[3/4]',
}

/**
 * Componente de upload de imagem com preview e upload via API
 */
export function ImageUpload({
  value,
  onChange,
  onRemove,
  placeholder = 'Clique ou arraste uma imagem',
  accept = 'image/jpeg,image/png,image/webp,image/gif',
  maxSize = 5,
  aspect = 'square',
  disabled = false,
  className,
  folder = 'perguntas',
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(value || null)
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Sincronizar preview com value externo
  useEffect(() => {
    setPreview(value || null)
  }, [value])

  const uploadToServer = async (file: File): Promise<string | null> => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('folder', folder)

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Erro ao fazer upload da imagem')
    }

    const data = await response.json()
    return data.url
  }

  const handleFile = useCallback(async (file: File) => {
    setError(null)

    // Validar tamanho
    if (file.size > maxSize * 1024 * 1024) {
      setError(`Arquivo muito grande. Máximo: ${maxSize}MB`)
      return
    }

    // Validar tipo
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!validTypes.includes(file.type)) {
      setError('Formato inválido. Use JPG, PNG, WebP ou GIF.')
      return
    }

    // Criar preview local imediato
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)

    // Fazer upload via API
    setIsUploading(true)
    try {
      const url = await uploadToServer(file)
      if (url) {
        onChange(url)
      }
    } catch (err) {
      console.error('Erro ao fazer upload:', err)
      setError(err instanceof Error ? err.message : 'Erro ao fazer upload. Tente novamente.')
      setPreview(null)
    } finally {
      setIsUploading(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [maxSize, onChange, folder])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    if (disabled) return

    const file = e.dataTransfer.files[0]
    if (file) {
      handleFile(file)
    }
  }, [disabled, handleFile])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    if (!disabled) {
      setIsDragging(true)
    }
  }, [disabled])

  const handleDragLeave = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleClick = () => {
    if (!disabled) {
      inputRef.current?.click()
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFile(file)
    }
  }

  const handleRemove = async (e: React.MouseEvent) => {
    e.stopPropagation()

    // Nota: A remoção do storage pode ser implementada via API se necessário
    // Por enquanto, apenas limpamos a referência local

    setPreview(null)
    setError(null)
    onChange(null)
    onRemove?.()
    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }

  return (
    <div className={cn('w-full', className)}>
      <div
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          'relative rounded-xl border-2 border-dashed transition-all cursor-pointer overflow-hidden',
          aspectMap[aspect],
          isDragging
            ? 'border-dourado bg-dourado/5'
            : 'border-nude/50 hover:border-dourado/50 bg-seda/20',
          disabled && 'opacity-50 cursor-not-allowed',
          error && 'border-error/50 bg-error/5'
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleChange}
          disabled={disabled}
          className="hidden"
        />

        {preview ? (
          <>
            <Image
              src={preview}
              alt="Preview"
              fill
              className="object-cover"
              unoptimized
            />
            {isUploading && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <div className="flex flex-col items-center">
                  <Loader2 className="w-8 h-8 text-white animate-spin mb-2" />
                  <span className="text-white text-sm font-sarabun">Enviando...</span>
                </div>
              </div>
            )}
            {!isUploading && (
              <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handleRemove}
                  className="bg-white/90 hover:bg-white text-cafe"
                >
                  <X className="w-4 h-4 mr-1" />
                  Remover
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
            <div className="w-12 h-12 rounded-full bg-white shadow-felice flex items-center justify-center mb-3">
              {isUploading ? (
                <Loader2 className="w-6 h-6 text-dourado animate-spin" />
              ) : isDragging ? (
                <Upload className="w-6 h-6 text-dourado" />
              ) : (
                <ImageIcon className="w-6 h-6 text-nude" />
              )}
            </div>
            <p className="font-sarabun text-sm text-cafe/70 mb-1">
              {isUploading ? 'Enviando imagem...' : isDragging ? 'Solte a imagem aqui' : placeholder}
            </p>
            <p className="font-sarabun text-xs text-cafe/50">
              PNG, JPG ou WEBP até {maxSize}MB
            </p>
          </div>
        )}
      </div>

      {error && (
        <p className="mt-2 text-sm text-error font-sarabun">
          {error}
        </p>
      )}
    </div>
  )
}

export default ImageUpload
