/**
 * Types for Ficha Config (Configurable Contact Card)
 */

export interface FichaCampoConfig {
  key: string
  label: string
  visible: boolean
  orden: number
  seccion: "header" | "telefonos" | "datos"
}

export interface FichaConfigResponse {
  id: string
  cuenta_id: string
  campania_id: string | null
  campos: FichaCampoConfig[]
  created_at: string
  updated_at: string
}

export interface FichaConfigCreate {
  campania_id?: string
  campos: FichaCampoConfig[]
}

export interface AvailableFieldsResponse {
  fields: string[]
}
