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

export interface IngestResponse {
  success: boolean
  record_id: string
  unknown_fields: string[]
  auto_create_enabled: boolean
  fields_created: string[] | null
}

export type TipoDato = "string" | "number" | "boolean" | "datetime" | "email" | "phone"
