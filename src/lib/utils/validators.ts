import { z } from 'zod'

/**
 * Validadores Zod para o sistema Felice Endomarketing
 */

// Regex para telefone brasileiro (disponível para uso futuro)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const phoneRegex = /^(\+55)?[\s]?\(?\d{2}\)?[\s]?\d{4,5}[-\s]?\d{4}$/

/**
 * Schema de telefone brasileiro
 */
export const phoneSchema = z
  .string()
  .min(1, 'Telefone é obrigatório')
  .refine(
    (val) => {
      const numbers = val.replace(/\D/g, '')
      return numbers.length >= 10 && numbers.length <= 13
    },
    { message: 'Telefone inválido' }
  )

/**
 * Schema de email
 */
export const emailSchema = z
  .string()
  .min(1, 'Email é obrigatório')
  .email('Email inválido')

/**
 * Schema de nome
 */
export const nameSchema = z
  .string()
  .min(2, 'Nome deve ter pelo menos 2 caracteres')
  .max(200, 'Nome deve ter no máximo 200 caracteres')
  .refine(
    (val) => val.trim().includes(' '),
    { message: 'Informe nome e sobrenome' }
  )

/**
 * Schema de nome simples (sem sobrenome obrigatório)
 */
export const simpleNameSchema = z
  .string()
  .min(2, 'Nome deve ter pelo menos 2 caracteres')
  .max(200, 'Nome deve ter no máximo 200 caracteres')

/**
 * Schema de senha
 */
export const passwordSchema = z
  .string()
  .min(6, 'Senha deve ter pelo menos 6 caracteres')
  .max(100, 'Senha deve ter no máximo 100 caracteres')

/**
 * Schema de slug
 */
export const slugSchema = z
  .string()
  .min(2, 'Slug deve ter pelo menos 2 caracteres')
  .max(100, 'Slug deve ter no máximo 100 caracteres')
  .regex(/^[a-z0-9-]+$/, 'Slug deve conter apenas letras minúsculas, números e hífens')

/**
 * Schema de URL
 */
export const urlSchema = z
  .string()
  .url('URL inválida')
  .or(z.literal(''))

/**
 * Schema de cor hexadecimal
 */
export const hexColorSchema = z
  .string()
  .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Cor hexadecimal inválida')

/**
 * Schema de CRM
 */
export const crmSchema = z
  .string()
  .max(50, 'CRM deve ter no máximo 50 caracteres')
  .optional()

/**
 * Schema de valor monetário
 */
export const moneySchema = z
  .number()
  .min(0, 'Valor deve ser positivo')
  .max(999999999.99, 'Valor muito alto')

/**
 * Schema para formulário de paciente (Kiosk)
 */
export const pacienteFormSchema = z.object({
  nome: nameSchema,
  whatsapp: phoneSchema,
})

/**
 * Schema para formulário de profissional
 */
export const profissionalFormSchema = z.object({
  nome: simpleNameSchema,
  especialidade: z.string().max(150).optional(),
  crm: crmSchema,
  descricao: z.string().max(2000).optional(),
  nucleo_id: z.string().uuid().optional().nullable(),
  procedimentos: z.array(z.string()).optional(),
  instagram: z.string().max(100).optional(),
  ativo: z.boolean().default(true),
})

/**
 * Schema para formulário de pergunta
 */
export const perguntaFormSchema = z.object({
  titulo: z.string().min(3).max(255),
  subtitulo: z.string().max(255).optional(),
  nucleo_id: z.string().uuid().optional().nullable(),
  tipo: z.enum(['multipla_escolha', 'texto', 'telefone']).default('multipla_escolha'),
  multipla_selecao: z.boolean().default(true),
  obrigatoria: z.boolean().default(false),
  ativo: z.boolean().default(true),
})

/**
 * Schema para formulário de opção
 */
export const opcaoFormSchema = z.object({
  texto: z.string().min(1).max(255),
  letra: z.string().max(1).optional(),
  ordem: z.number().int().min(0).default(0),
  ativo: z.boolean().default(true),
})

/**
 * Schema para formulário de template
 */
export const templateFormSchema = z.object({
  titulo: z.string().min(3).max(150),
  conteudo: z.string().min(1).max(5000),
  nucleo_id: z.string().uuid().optional().nullable(),
  tipo: z.enum(['texto', 'imagem', 'video']).default('texto'),
  tempo_envio: z.string().optional(),
  ativo: z.boolean().default(true),
})

/**
 * Schema para formulário de núcleo
 */
export const nucleoFormSchema = z.object({
  nome: z.string().min(2).max(100),
  slug: slugSchema,
  descricao: z.string().max(500).optional(),
  icone: z.string().max(50).optional(),
  cor: hexColorSchema.optional(),
  ativo: z.boolean().default(true),
})

/**
 * Schema para formulário de equipe/usuário
 */
export const equipeFormSchema = z.object({
  nome: simpleNameSchema,
  email: emailSchema,
  telefone: phoneSchema.optional(),
  nucleo_id: z.string().uuid().optional().nullable(),
  role: z.enum(['admin', 'gerente', 'atendente']).default('atendente'),
  ativo: z.boolean().default(true),
})

/**
 * Schema para login
 */
export const loginFormSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
})

/**
 * Schema para registro de conversão
 */
export const conversaoFormSchema = z.object({
  paciente_id: z.string().uuid(),
  nucleo_id: z.string().uuid(),
  procedimento: z.string().max(255).optional(),
  valor: moneySchema.optional(),
  data_conversao: z.string().optional(),
  observacoes: z.string().max(1000).optional(),
})

/**
 * Schema para follow-up
 */
export const followupFormSchema = z.object({
  paciente_id: z.string().uuid(),
  nucleo_id: z.string().uuid().optional().nullable(),
  template_id: z.string().uuid().optional().nullable(),
  tipo_contato: z.enum(['whatsapp', 'telefone', 'email']).default('whatsapp'),
  conteudo_enviado: z.string().max(5000).optional(),
  observacoes: z.string().max(1000).optional(),
})

// Tipos inferidos
export type PacienteFormData = z.infer<typeof pacienteFormSchema>
export type ProfissionalFormData = z.infer<typeof profissionalFormSchema>
export type PerguntaFormData = z.infer<typeof perguntaFormSchema>
export type OpcaoFormData = z.infer<typeof opcaoFormSchema>
export type TemplateFormData = z.infer<typeof templateFormSchema>
export type NucleoFormData = z.infer<typeof nucleoFormSchema>
export type EquipeFormData = z.infer<typeof equipeFormSchema>
export type LoginFormData = z.infer<typeof loginFormSchema>
export type ConversaoFormData = z.infer<typeof conversaoFormSchema>
export type FollowupFormData = z.infer<typeof followupFormSchema>
