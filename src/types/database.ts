export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      form_nucleos: {
        Row: {
          id: string
          nome: string
          slug: string
          descricao: string | null
          icone: string | null
          cor: string | null
          ativo: boolean
          ordem: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          nome: string
          slug: string
          descricao?: string | null
          icone?: string | null
          cor?: string | null
          ativo?: boolean
          ordem?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nome?: string
          slug?: string
          descricao?: string | null
          icone?: string | null
          cor?: string | null
          ativo?: boolean
          ordem?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      form_profissionais: {
        Row: {
          id: string
          nome: string
          especialidade: string | null
          crm: string | null
          descricao: string | null
          foto_url: string | null
          nucleo_id: string | null
          procedimentos: string[] | null
          instagram: string | null
          ativo: boolean
          ordem: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          nome: string
          especialidade?: string | null
          crm?: string | null
          descricao?: string | null
          foto_url?: string | null
          nucleo_id?: string | null
          procedimentos?: string[] | null
          instagram?: string | null
          ativo?: boolean
          ordem?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nome?: string
          especialidade?: string | null
          crm?: string | null
          descricao?: string | null
          foto_url?: string | null
          nucleo_id?: string | null
          procedimentos?: string[] | null
          instagram?: string | null
          ativo?: boolean
          ordem?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'form_profissionais_nucleo_id_fkey'
            columns: ['nucleo_id']
            isOneToOne: false
            referencedRelation: 'form_nucleos'
            referencedColumns: ['id']
          }
        ]
      }
      form_perguntas: {
        Row: {
          id: string
          titulo: string
          subtitulo: string | null
          nucleo_id: string | null
          tipo: string
          imagem_url: string | null
          multipla_selecao: boolean
          obrigatoria: boolean
          ativo: boolean
          ordem: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          titulo: string
          subtitulo?: string | null
          nucleo_id?: string | null
          tipo?: string
          imagem_url?: string | null
          multipla_selecao?: boolean
          obrigatoria?: boolean
          ativo?: boolean
          ordem?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          titulo?: string
          subtitulo?: string | null
          nucleo_id?: string | null
          tipo?: string
          imagem_url?: string | null
          multipla_selecao?: boolean
          obrigatoria?: boolean
          ativo?: boolean
          ordem?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'form_perguntas_nucleo_id_fkey'
            columns: ['nucleo_id']
            isOneToOne: false
            referencedRelation: 'form_nucleos'
            referencedColumns: ['id']
          }
        ]
      }
      form_opcoes: {
        Row: {
          id: string
          pergunta_id: string
          texto: string
          letra: string | null
          ordem: number
          ativo: boolean
          created_at: string
        }
        Insert: {
          id?: string
          pergunta_id: string
          texto: string
          letra?: string | null
          ordem?: number
          ativo?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          pergunta_id?: string
          texto?: string
          letra?: string | null
          ordem?: number
          ativo?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'form_opcoes_pergunta_id_fkey'
            columns: ['pergunta_id']
            isOneToOne: false
            referencedRelation: 'form_perguntas'
            referencedColumns: ['id']
          }
        ]
      }
      form_pacientes: {
        Row: {
          id: string
          nome: string
          whatsapp: string
          whatsapp_formatado: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          nome: string
          whatsapp: string
          whatsapp_formatado?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nome?: string
          whatsapp?: string
          whatsapp_formatado?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      form_respostas: {
        Row: {
          id: string
          paciente_id: string
          pergunta_id: string
          opcao_id: string | null
          resposta_texto: string | null
          created_at: string
        }
        Insert: {
          id?: string
          paciente_id: string
          pergunta_id: string
          opcao_id?: string | null
          resposta_texto?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          paciente_id?: string
          pergunta_id?: string
          opcao_id?: string | null
          resposta_texto?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'form_respostas_paciente_id_fkey'
            columns: ['paciente_id']
            isOneToOne: false
            referencedRelation: 'form_pacientes'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'form_respostas_pergunta_id_fkey'
            columns: ['pergunta_id']
            isOneToOne: false
            referencedRelation: 'form_perguntas'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'form_respostas_opcao_id_fkey'
            columns: ['opcao_id']
            isOneToOne: false
            referencedRelation: 'form_opcoes'
            referencedColumns: ['id']
          }
        ]
      }
      form_interesses: {
        Row: {
          id: string
          paciente_id: string
          nucleo_id: string
          quantidade_respostas: number
          created_at: string
        }
        Insert: {
          id?: string
          paciente_id: string
          nucleo_id: string
          quantidade_respostas?: number
          created_at?: string
        }
        Update: {
          id?: string
          paciente_id?: string
          nucleo_id?: string
          quantidade_respostas?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'form_interesses_paciente_id_fkey'
            columns: ['paciente_id']
            isOneToOne: false
            referencedRelation: 'form_pacientes'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'form_interesses_nucleo_id_fkey'
            columns: ['nucleo_id']
            isOneToOne: false
            referencedRelation: 'form_nucleos'
            referencedColumns: ['id']
          }
        ]
      }
      form_templates: {
        Row: {
          id: string
          nucleo_id: string | null
          titulo: string
          conteudo: string
          tipo: string
          arquivo_url: string | null
          tempo_envio: string | null
          ordem: number
          ativo: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          nucleo_id?: string | null
          titulo: string
          conteudo: string
          tipo?: string
          arquivo_url?: string | null
          tempo_envio?: string | null
          ordem?: number
          ativo?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nucleo_id?: string | null
          titulo?: string
          conteudo?: string
          tipo?: string
          arquivo_url?: string | null
          tempo_envio?: string | null
          ordem?: number
          ativo?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'form_templates_nucleo_id_fkey'
            columns: ['nucleo_id']
            isOneToOne: false
            referencedRelation: 'form_nucleos'
            referencedColumns: ['id']
          }
        ]
      }
      form_followups: {
        Row: {
          id: string
          paciente_id: string
          nucleo_id: string | null
          template_id: string | null
          tipo_contato: string
          conteudo_enviado: string | null
          arquivo_url: string | null
          data_envio: string
          data_agendada: string | null
          status: string
          observacoes: string | null
          enviado_por: string | null
          created_at: string
        }
        Insert: {
          id?: string
          paciente_id: string
          nucleo_id?: string | null
          template_id?: string | null
          tipo_contato?: string
          conteudo_enviado?: string | null
          arquivo_url?: string | null
          data_envio?: string
          data_agendada?: string | null
          status?: string
          observacoes?: string | null
          enviado_por?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          paciente_id?: string
          nucleo_id?: string | null
          template_id?: string | null
          tipo_contato?: string
          conteudo_enviado?: string | null
          arquivo_url?: string | null
          data_envio?: string
          data_agendada?: string | null
          status?: string
          observacoes?: string | null
          enviado_por?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'form_followups_paciente_id_fkey'
            columns: ['paciente_id']
            isOneToOne: false
            referencedRelation: 'form_pacientes'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'form_followups_nucleo_id_fkey'
            columns: ['nucleo_id']
            isOneToOne: false
            referencedRelation: 'form_nucleos'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'form_followups_template_id_fkey'
            columns: ['template_id']
            isOneToOne: false
            referencedRelation: 'form_templates'
            referencedColumns: ['id']
          }
        ]
      }
      form_conversoes: {
        Row: {
          id: string
          paciente_id: string
          nucleo_id: string
          procedimento: string | null
          valor: number | null
          data_conversao: string
          observacoes: string | null
          registrado_por: string | null
          created_at: string
        }
        Insert: {
          id?: string
          paciente_id: string
          nucleo_id: string
          procedimento?: string | null
          valor?: number | null
          data_conversao?: string
          observacoes?: string | null
          registrado_por?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          paciente_id?: string
          nucleo_id?: string
          procedimento?: string | null
          valor?: number | null
          data_conversao?: string
          observacoes?: string | null
          registrado_por?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'form_conversoes_paciente_id_fkey'
            columns: ['paciente_id']
            isOneToOne: false
            referencedRelation: 'form_pacientes'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'form_conversoes_nucleo_id_fkey'
            columns: ['nucleo_id']
            isOneToOne: false
            referencedRelation: 'form_nucleos'
            referencedColumns: ['id']
          }
        ]
      }
      form_equipe: {
        Row: {
          id: string
          nome: string
          email: string
          telefone: string | null
          nucleo_id: string | null
          role: string
          avatar_url: string | null
          ativo: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          nome: string
          email: string
          telefone?: string | null
          nucleo_id?: string | null
          role?: string
          avatar_url?: string | null
          ativo?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nome?: string
          email?: string
          telefone?: string | null
          nucleo_id?: string | null
          role?: string
          avatar_url?: string | null
          ativo?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'form_equipe_nucleo_id_fkey'
            columns: ['nucleo_id']
            isOneToOne: false
            referencedRelation: 'form_nucleos'
            referencedColumns: ['id']
          }
        ]
      }
      form_configuracoes: {
        Row: {
          id: string
          chave: string
          valor: string | null
          tipo: string
          descricao: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          chave: string
          valor?: string | null
          tipo?: string
          descricao?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          chave?: string
          valor?: string | null
          tipo?: string
          descricao?: string | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      form_leads_view: {
        Row: {
          id: string | null
          nome: string | null
          whatsapp: string | null
          created_at: string | null
          total_followups: number | null
          status: string | null
          convertido: boolean | null
          nucleo_convertido: string | null
          data_conversao: string | null
        }
        Relationships: []
      }
      form_dashboard_view: {
        Row: {
          nucleo_id: string | null
          nucleo_nome: string | null
          nucleo_slug: string | null
          total_interessados: number | null
          total_followups: number | null
          total_conversoes: number | null
          taxa_conversao: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Helper types
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type InsertTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type UpdateTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']
export type Views<T extends keyof Database['public']['Views']> = Database['public']['Views'][T]['Row']

// Procedimento type
export interface Procedimento {
  nome: string
  descricao: string
}

// Specific table types for convenience
export type Nucleo = Tables<'form_nucleos'>
export type ProfissionalBase = Tables<'form_profissionais'>
export type Profissional = Omit<ProfissionalBase, 'procedimentos'> & {
  procedimentos: Procedimento[] | null
}
export type Pergunta = Tables<'form_perguntas'>
export type Opcao = Tables<'form_opcoes'>
export type Paciente = Tables<'form_pacientes'>
export type Resposta = Tables<'form_respostas'>
export type Interesse = Tables<'form_interesses'>
export type Template = Tables<'form_templates'>
export type Followup = Tables<'form_followups'>
export type Conversao = Tables<'form_conversoes'>
export type Equipe = Tables<'form_equipe'>
export type Configuracao = Tables<'form_configuracoes'>

// View types
export type LeadView = Views<'form_leads_view'>
export type DashboardView = Views<'form_dashboard_view'>

// Pergunta with options
export type PerguntaComOpcoes = Pergunta & {
  opcoes: Opcao[]
  nucleo?: Nucleo | null
}

// Lead with details
export type LeadComDetalhes = Paciente & {
  interesses: (Interesse & { nucleo: Nucleo })[]
  respostas: (Resposta & { pergunta: Pergunta; opcao: Opcao | null })[]
  followups: (Followup & { template: Template | null })[]
  conversoes: (Conversao & { nucleo: Nucleo })[]
}

// Equipe with nucleo
export type EquipeComNucleo = Equipe & {
  nucleo: Nucleo | null
}

// User roles
export type UserRole = 'admin' | 'gerente' | 'atendente'

// Lead status
export type LeadStatus = 'aguardando' | '1_mensagem' | '2_mensagens' | '3_mais_mensagens'

// Pergunta tipos
export type PerguntaTipo = 'multipla_escolha' | 'texto' | 'telefone'

// Template tipos
export type TemplateTipo = 'texto' | 'imagem' | 'video'
