/**
 * Constantes do sistema Felice Endomarketing
 */

// Núcleos do Complexo Felice
export const NUCLEOS = {
  CIRURGIA_PLASTICA: 'cirurgia-plastica',
  DERMATOLOGIA: 'dermatologia',
  SPA_CAPILAR: 'spa-capilar',
  SPA_ESTETICO: 'spa-estetico',
  NUTRICAO: 'nutricao',
  MEDICINA_INTEGRATIVA: 'medicina-integrativa',
  SOROTERAPIA: 'soroterapia',
} as const

export type NucleoSlug = typeof NUCLEOS[keyof typeof NUCLEOS]

// Ícones dos núcleos (Lucide)
export const NUCLEO_ICONS: Record<NucleoSlug, string> = {
  'cirurgia-plastica': 'Scissors',
  'dermatologia': 'Sparkles',
  'spa-capilar': 'Wind',
  'spa-estetico': 'Heart',
  'nutricao': 'Apple',
  'medicina-integrativa': 'Activity',
  'soroterapia': 'Droplet',
}

// Cores dos núcleos
export const NUCLEO_COLORS: Record<NucleoSlug, string> = {
  'cirurgia-plastica': '#663739',
  'dermatologia': '#c29863',
  'spa-capilar': '#ae9b89',
  'spa-estetico': '#ddd5c7',
  'nutricao': '#4ade80',
  'medicina-integrativa': '#60a5fa',
  'soroterapia': '#fbbf24',
}

// Status de leads
export const LEAD_STATUS = {
  AGUARDANDO: 'aguardando',
  UMA_MENSAGEM: '1_mensagem',
  DUAS_MENSAGENS: '2_mensagens',
  TRES_MAIS_MENSAGENS: '3_mais_mensagens',
} as const

export type LeadStatusType = typeof LEAD_STATUS[keyof typeof LEAD_STATUS]

// Labels dos status
export const LEAD_STATUS_LABELS: Record<LeadStatusType, string> = {
  'aguardando': 'Aguardando contato',
  '1_mensagem': '1 mensagem enviada',
  '2_mensagens': '2 mensagens enviadas',
  '3_mais_mensagens': '3+ mensagens enviadas',
}

// Roles de usuários
export const USER_ROLES = {
  ADMIN: 'admin',
  GERENTE: 'gerente',
  ATENDENTE: 'atendente',
} as const

export type UserRoleType = typeof USER_ROLES[keyof typeof USER_ROLES]

// Labels dos roles
export const USER_ROLE_LABELS: Record<UserRoleType, string> = {
  'admin': 'Administrador',
  'gerente': 'Gerente',
  'atendente': 'Atendente',
}

// Tipos de pergunta
export const PERGUNTA_TIPOS = {
  MULTIPLA_ESCOLHA: 'multipla_escolha',
  TEXTO: 'texto',
  TELEFONE: 'telefone',
} as const

export type PerguntaTipoType = typeof PERGUNTA_TIPOS[keyof typeof PERGUNTA_TIPOS]

// Tipos de template
export const TEMPLATE_TIPOS = {
  TEXTO: 'texto',
  IMAGEM: 'imagem',
  VIDEO: 'video',
} as const

export type TemplateTipoType = typeof TEMPLATE_TIPOS[keyof typeof TEMPLATE_TIPOS]

// Tempos de envio para templates
export const TEMPOS_ENVIO = [
  { value: 'imediato', label: 'Imediato' },
  { value: '24h', label: 'Após 24 horas' },
  { value: '48h', label: 'Após 48 horas' },
  { value: '3d', label: 'Após 3 dias' },
  { value: '7d', label: 'Após 7 dias' },
  { value: '15d', label: 'Após 15 dias' },
  { value: '30d', label: 'Após 30 dias' },
] as const

// Configurações do Kiosk
export const KIOSK_CONFIG = {
  TIMEOUT_SECONDS: 300, // 5 minutos de inatividade
  DEFAULT_PASSWORD: '1234',
  TRANSITION_DURATION: 300, // ms
}

// Limites de paginação
export const PAGINATION = {
  LEADS_PER_PAGE: 20,
  TEMPLATES_PER_PAGE: 12,
  PROFISSIONAIS_PER_PAGE: 12,
}

// Formatos de arquivo aceitos
export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
export const ACCEPTED_VIDEO_TYPES = ['video/mp4', 'video/webm']
export const MAX_FILE_SIZE_MB = 10
