/**
 * Types for Reportes Module
 */

// =============================================================================
// Dashboard
// =============================================================================

export interface DashboardResumen {
  campanas_activas: number
  agentes_conectados: number
  leads_gestionados_hoy: number
  leads_pendientes: number
}

export interface GestionPorHora {
  hora: string
  cantidad: number
}

export interface TopCampana {
  nombre: string
  gestiones: number
}

export interface DashboardStats {
  fecha: string
  resumen: DashboardResumen
  gestiones_por_hora: GestionPorHora[]
  top_campanas: TopCampana[]
}

// =============================================================================
// Reporte de Bases
// =============================================================================

export interface ReporteBaseItem {
  cola_id: string
  lead_id: string
  lead_nombre: string
  lead_telefono: string
  base_nombre: string
  campania_nombre: string
  estado: string
  agente_nombre: string | null
  tipificacion: string | null
  subtipificacion: string | null
  intentos: number
  completed_at: string | null
  assigned_at: string | null
}

export interface ReporteBasesResponse {
  items: ReporteBaseItem[]
  total: number
  limit: number
  offset: number
}

export interface DistribucionTipificacion {
  nombre: string
  color: string
  cantidad: number
}

export interface EstadoBaseMetricas {
  total_leads: number
  pendientes: number
  gestionados: number
  avance: number
}

export interface EstadoBaseResponse {
  base: {
    id: string
    nombre: string
  }
  metricas: EstadoBaseMetricas
  distribucion_tipificaciones: DistribucionTipificacion[]
}

// =============================================================================
// Métricas de Agentes
// =============================================================================

export interface AgenteTipificacion {
  nombre: string
  cantidad: number
}

export interface AgenteTiempo {
  conectado_minutos: number
  pausado_minutos: number
  conectado_horas: number
}

export interface AgenteProductividad {
  fichas_gestionadas: number
  fichas_por_hora: number
}

export interface AgenteMetrica {
  agente_id: string
  nombre: string
  email: string
  tiempo: AgenteTiempo
  productividad: AgenteProductividad
  tipificaciones: AgenteTipificacion[]
}

export interface MetricasAgentesPeriodo {
  desde: string
  hasta: string
}

export interface MetricasAgentesResponse {
  periodo: MetricasAgentesPeriodo
  agentes: AgenteMetrica[]
}

// =============================================================================
// Métricas de Campaña
// =============================================================================

export interface CampanaInfo {
  id: string
  nombre: string
  estado: string
  tipo_discador: string
}

export interface CampanaMetricas {
  total_leads: number
  pendientes: number
  completados: number
  gestionados_hoy: number
  porcentaje_avance: number
  agentes_asignados: number
  agentes_conectados: number
}

export interface TipificacionMetrica {
  nombre: string
  color: string
  cantidad: number
}

export interface GestionPorDia {
  fecha: string
  cantidad: number
}

export interface MetricasCampanaResponse {
  campania: CampanaInfo
  metricas: CampanaMetricas
  tipificaciones: TipificacionMetrica[]
  gestiones_por_dia: GestionPorDia[]
}

// =============================================================================
// Monitor en Tiempo Real
// =============================================================================

export interface AgenteMonitor {
  agente_id: string
  nombre: string
  estado: string
  tiempo_en_estado: number
  ficha_actual: string | null
}

export interface CampanaMonitor {
  campania_id: string
  nombre: string
  tipo_discador: string
  agentes_conectados: number
  agentes: AgenteMonitor[]
  cola_pendientes: number
}

export interface MonitorResponse {
  timestamp: string
  campanas_activas: number
  campanas: CampanaMonitor[]
}
