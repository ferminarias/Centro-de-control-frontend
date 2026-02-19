/**
 * Types for Campañas (Contact Center Campaigns)
 */

export type TipoDiscador = "sin_discador" | "preview" | "progresivo" | "predictivo"
export type EstadoCampania = "borrador" | "activa" | "pausada" | "finalizada"
export type EstadoCola = "pendiente" | "asignado" | "gestionando" | "completado" | "rechazado"
export type EstadoAgente = "offline" | "disponible" | "pausado" | "gestionando" | "en_llamada"

export interface Campania {
  id: string
  cuenta_id: string
  nombre: string
  descripcion?: string
  tipo_discador: TipoDiscador
  estado: EstadoCampania
  config_discador: {
    timeout?: number
    demora_llamada?: number
    canales_max?: number
    [key: string]: any
  }
  permite_llamada_manual: boolean
  grabar_llamadas: boolean
  horario_inicio?: string
  horario_fin?: string
  dias_operacion: number[]
  tipificaciones_permitidas: string[]
  prioridad: number
  created_at: string
  updated_at: string
  created_by?: string
  // Contadores
  total_bases?: number
  total_agentes?: number
  leads_en_cola?: number
}

export interface CampaniaCreate {
  nombre: string
  descripcion?: string
  tipo_discador?: TipoDiscador
  config_discador?: Record<string, any>
  permite_llamada_manual?: boolean
  grabar_llamadas?: boolean
  horario_inicio?: string
  horario_fin?: string
  dias_operacion?: number[]
  tipificaciones_permitidas?: string[]
  prioridad?: number
  base_ids?: string[]
  agente_ids?: string[]
}

export interface CampaniaUpdate extends Partial<CampaniaCreate> {
  estado?: EstadoCampania
}

export interface CampaniaListResponse {
  items: Campania[]
  total: number
}

// ─────────────────────────────────────────────────────────────────────────────
// Agentes en Campaña
// ─────────────────────────────────────────────────────────────────────────────

export interface CampaniaAgente {
  agente_id: string
  agente_nombre: string
  agente_email: string
  activo: boolean
  nivel_skill: number
  max_fichas: number
  added_at: string
  estado_actual?: EstadoAgente
  fichas_gestionadas_hoy: number
}

export interface AgenteEstadoUpdate {
  estado: EstadoAgente
  motivo?: string
}

// ─────────────────────────────────────────────────────────────────────────────
// Cola de Leads
// ─────────────────────────────────────────────────────────────────────────────

export interface ColaLead {
  id: string
  lead_id: string
  estado: EstadoCola
  prioridad: number
  intentos: number
  agente_asignado_id?: string
  agente_asignado_nombre?: string
  proximo_intento?: string
  added_at: string
  lead_datos: Record<string, any>
  lead_telefono?: string
}

export interface ColaLeadListResponse {
  items: ColaLead[]
  total: number
  pendientes: number
  asignados: number
  completados: number
}

// ─────────────────────────────────────────────────────────────────────────────
// Gestión de Fichas (Agente)
// ─────────────────────────────────────────────────────────────────────────────

export interface Ficha {
  cola_id: string
  lead_id: string
  campania_id: string
  campania_nombre: string
  lead: {
    id: string
    datos: Record<string, any>
    tipificacion?: {
      id: string
      nombre: string
      color: string
    }
    subtipificacion?: {
      id: string
      nombre: string
      color: string
    }
  }
  historial: any[]
  script?: string
  ficha_config?: {
    campos: import("./fichaConfig").FichaCampoConfig[]
  } | null
}

export interface GestionFichaRequest {
  tipificacion_id?: string
  subtipificacion_id?: string
  notas?: string
  resultado_llamada?: "contestado" | "no_contestado" | "ocupado" | "buzon_voz" | "equivocado"
  duracion_segundos?: number
  grabacion_url?: string
  agendar_callback?: boolean
  callback_fecha?: string
  callback_observacion?: string
}

export interface SolicitarFichaResponse {
  success: boolean
  message: string
  ficha?: Ficha
}

// ─────────────────────────────────────────────────────────────────────────────
// Métricas
// ─────────────────────────────────────────────────────────────────────────────

export interface MetricasCampania {
  campania_id: string
  campania_nombre: string
  total_leads: number
  leads_pendientes: number
  leads_gestionados_hoy: number
  agentes_conectados: number
  agentes_disponibles: number
  agentes_en_llamada: number
  agentes_pausados: number
  llamadas_realizadas: number
  llamadas_conectadas: number
  porcentaje_contacto: number
  top_tipificaciones: Array<{
    tipificacion_id: string
    nombre: string
    count: number
  }>
}
