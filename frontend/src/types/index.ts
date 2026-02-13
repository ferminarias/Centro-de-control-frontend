// ── Accounts ──

export interface AccountResponse {
  id: string
  nombre: string
  api_key: string
  activo: boolean
  auto_crear_campos: boolean
  created_at: string
  updated_at: string
}

export interface AccountListResponse {
  items: AccountResponse[]
  total: number
}

export interface AccountCreate {
  nombre: string
  auto_crear_campos?: boolean
}

export interface AccountUpdate {
  nombre?: string
  activo?: boolean
  auto_crear_campos?: boolean
}

// ── Fields ──

export type TipoDato = "string" | "number" | "boolean" | "datetime" | "email" | "phone"

export interface FieldResponse {
  id: string
  cuenta_id: string
  nombre_campo: string
  tipo_dato: TipoDato
  descripcion: string | null
  es_requerido: boolean
  created_at: string
}

export interface FieldListResponse {
  items: FieldResponse[]
  total: number
}

export interface FieldCreate {
  nombre_campo: string
  tipo_dato?: TipoDato
  descripcion?: string
  es_requerido?: boolean
}

export interface FieldUpdate {
  tipo_dato?: TipoDato
  descripcion?: string
  es_requerido?: boolean
}

// ── Leads ──

export interface LeadResponse {
  id: string
  cuenta_id: string
  record_id: string
  lead_base_id: string | null
  base_nombre: string | null
  datos: Record<string, unknown>
  created_at: string
}

export interface LeadListResponse {
  items: LeadResponse[]
  total: number
  page: number
  page_size: number
}

// ── Records ──

export interface RecordResponse {
  id: string
  cuenta_id: string
  datos: Record<string, unknown>
  metadata_: {
    source_ip: string | null
    unknown_fields: string[] | null
  } | null
  created_at: string
}

export interface RecordListResponse {
  items: RecordResponse[]
  total: number
  page: number
  page_size: number
}

// ── Lead Bases ──

export interface LeadBaseResponse {
  id: string
  cuenta_id: string
  nombre: string
  descripcion: string | null
  es_default: boolean
  created_at: string
  updated_at: string
  leads_count?: number
  total_leads?: number
}

export interface LeadBaseListResponse {
  items: LeadBaseResponse[]
  total: number
}

export interface LeadBaseCreate {
  nombre: string
  descripcion?: string
  es_default?: boolean
}

export interface LeadBaseUpdate {
  nombre?: string
  descripcion?: string
  es_default?: boolean
}

// ── Routing Rules ──

export type RuleOperator = "equals" | "not_equals" | "contains" | "greater_than" | "less_than"

export interface RoutingRuleResponse {
  id: string
  lead_base_id: string
  campo: string
  operador: RuleOperator
  valor: string
  prioridad: number
  created_at: string
}

export interface RoutingRuleListResponse {
  items: RoutingRuleResponse[]
  total: number
}

export interface RoutingRuleCreate {
  campo: string
  operador: RuleOperator
  valor: string
  prioridad?: number
}

export interface RoutingRuleUpdate {
  campo?: string
  operador?: RuleOperator
  valor?: string
  prioridad?: number
}

// ── Ingest ──

export interface IngestResponse {
  success: boolean
  record_id: string
  lead_id: string
  unknown_fields: string[]
  auto_create_enabled: boolean
  fields_created: string[] | null
}
