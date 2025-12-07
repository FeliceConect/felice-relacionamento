/**
 * Funções de formatação para o sistema Felice Endomarketing
 */

/**
 * Formata número de telefone brasileiro
 * @param phone - Número a ser formatado (com ou sem formatação)
 * @returns Número formatado: (XX) XXXXX-XXXX ou (XX) XXXX-XXXX
 */
export function formatPhone(phone: string | null | undefined): string {
  if (!phone) return ''

  // Remove tudo que não é número
  const numbers = phone.replace(/\D/g, '')

  // Se tiver código do país, remove
  const cleaned = numbers.startsWith('55') ? numbers.slice(2) : numbers

  if (cleaned.length === 11) {
    // Celular: (XX) XXXXX-XXXX
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`
  } else if (cleaned.length === 10) {
    // Fixo: (XX) XXXX-XXXX
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`
  }

  return phone
}

/**
 * Remove formatação do telefone, mantendo apenas números
 * @param phone - Número formatado
 * @returns Apenas números
 */
export function unformatPhone(phone: string | null | undefined): string {
  if (!phone) return ''
  return phone.replace(/\D/g, '')
}

/**
 * Formata link do WhatsApp
 * @param phone - Número do telefone
 * @param message - Mensagem opcional
 * @returns URL do WhatsApp
 */
export function formatWhatsAppLink(phone: string, message?: string): string {
  const cleaned = unformatPhone(phone)
  const number = cleaned.startsWith('55') ? cleaned : `55${cleaned}`
  const encodedMessage = message ? encodeURIComponent(message) : ''
  return `https://wa.me/${number}${encodedMessage ? `?text=${encodedMessage}` : ''}`
}

/**
 * Formata data no padrão brasileiro
 * @param date - Data a ser formatada
 * @param options - Opções de formatação
 * @returns Data formatada
 */
export function formatDate(
  date: string | Date | null | undefined,
  options: {
    showTime?: boolean
    showSeconds?: boolean
    relative?: boolean
  } = {}
): string {
  if (!date) return ''

  const dateObj = typeof date === 'string' ? new Date(date) : date

  if (options.relative) {
    return formatRelativeDate(dateObj)
  }

  const dateOptions: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }

  if (options.showTime) {
    dateOptions.hour = '2-digit'
    dateOptions.minute = '2-digit'
    if (options.showSeconds) {
      dateOptions.second = '2-digit'
    }
  }

  return dateObj.toLocaleDateString('pt-BR', dateOptions)
}

/**
 * Formata data relativa (ex: "há 2 dias")
 * @param date - Data a ser formatada
 * @returns Texto relativo
 */
export function formatRelativeDate(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSecs = Math.floor(diffMs / 1000)
  const diffMins = Math.floor(diffSecs / 60)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)
  const diffWeeks = Math.floor(diffDays / 7)
  const diffMonths = Math.floor(diffDays / 30)

  if (diffSecs < 60) return 'agora'
  if (diffMins < 60) return `há ${diffMins} min`
  if (diffHours < 24) return `há ${diffHours}h`
  if (diffDays === 1) return 'ontem'
  if (diffDays < 7) return `há ${diffDays} dias`
  if (diffWeeks === 1) return 'há 1 semana'
  if (diffWeeks < 4) return `há ${diffWeeks} semanas`
  if (diffMonths === 1) return 'há 1 mês'
  if (diffMonths < 12) return `há ${diffMonths} meses`
  return formatDate(date)
}

/**
 * Formata valor monetário em Real brasileiro
 * @param value - Valor a ser formatado
 * @returns Valor formatado (ex: R$ 1.234,56)
 */
export function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined) return ''

  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

/**
 * Formata número com separadores de milhar
 * @param value - Número a ser formatado
 * @returns Número formatado
 */
export function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined) return ''

  return new Intl.NumberFormat('pt-BR').format(value)
}

/**
 * Formata porcentagem
 * @param value - Valor decimal (0.1 = 10%)
 * @param decimals - Casas decimais
 * @returns Porcentagem formatada
 */
export function formatPercent(
  value: number | null | undefined,
  decimals: number = 1
): string {
  if (value === null || value === undefined) return ''

  return `${(value * 100).toFixed(decimals)}%`
}

/**
 * Trunca texto com ellipsis
 * @param text - Texto a ser truncado
 * @param maxLength - Tamanho máximo
 * @returns Texto truncado
 */
export function truncate(text: string | null | undefined, maxLength: number): string {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return `${text.slice(0, maxLength)}...`
}

/**
 * Formata nome próprio (primeira letra maiúscula)
 * @param name - Nome a ser formatado
 * @returns Nome formatado
 */
export function formatName(name: string | null | undefined): string {
  if (!name) return ''

  return name
    .toLowerCase()
    .split(' ')
    .map((word) => {
      // Palavras que não devem ser capitalizadas
      const exceptions = ['de', 'da', 'do', 'das', 'dos', 'e']
      if (exceptions.includes(word)) return word
      return word.charAt(0).toUpperCase() + word.slice(1)
    })
    .join(' ')
}

/**
 * Gera iniciais do nome
 * @param name - Nome completo
 * @param max - Número máximo de iniciais
 * @returns Iniciais
 */
export function getInitials(name: string | null | undefined, max: number = 2): string {
  if (!name) return ''

  return name
    .split(' ')
    .filter((word) => word.length > 0)
    .map((word) => word.charAt(0).toUpperCase())
    .slice(0, max)
    .join('')
}

/**
 * Gera slug a partir de texto
 * @param text - Texto para gerar slug
 * @returns Slug
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^a-z0-9]+/g, '-') // Substitui caracteres especiais por hífen
    .replace(/^-+|-+$/g, '') // Remove hífens do início e fim
}

/**
 * Formata tamanho de arquivo
 * @param bytes - Tamanho em bytes
 * @returns Tamanho formatado
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'

  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}
