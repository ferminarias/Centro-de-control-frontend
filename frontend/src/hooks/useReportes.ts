/**
 * Hooks para el Módulo de Reportes y Monitores
 */
import { useQuery } from "@tanstack/react-query"
import { apiClient } from "@/api/client"
import type {
  DashboardStats,
  ReporteBasesResponse,
  EstadoBaseResponse,
  MetricasAgentesResponse,
  MetricasCampanaResponse,
  MonitorResponse,
} from "@/types/reportes"

// =============================================================================
// Dashboard
// =============================================================================

export function useDashboardStats(accountId: string | undefined) {
  return useQuery({
    queryKey: ["reportes", "dashboard", accountId],
    queryFn: async () => {
      const { data } = await apiClient.get<DashboardStats>(
        `/api/v1/admin/reportes/dashboard?account_id=${accountId}`
      )
      return data
    },
    enabled: !!accountId,
    refetchInterval: 60000, // Refrescar cada minuto
  })
}

// =============================================================================
// Reporte de Bases
// =============================================================================

interface BasesFilters {
  base_id?: string
  fecha_desde?: string
  fecha_hasta?: string
  tipificacion_id?: string
  agente_id?: string
}

export function useReporteBases(
  accountId: string | undefined,
  filters: BasesFilters = {},
  limit: number = 100,
  offset: number = 0
) {
  const params = new URLSearchParams()
  if (accountId) params.append("account_id", accountId)
  if (filters.base_id) params.append("base_id", filters.base_id)
  if (filters.fecha_desde) params.append("fecha_desde", filters.fecha_desde)
  if (filters.fecha_hasta) params.append("fecha_hasta", filters.fecha_hasta)
  if (filters.tipificacion_id) params.append("tipificacion_id", filters.tipificacion_id)
  if (filters.agente_id) params.append("agente_id", filters.agente_id)
  params.append("limit", limit.toString())
  params.append("offset", offset.toString())
  
  return useQuery({
    queryKey: ["reportes", "bases", accountId, filters, limit, offset],
    queryFn: async () => {
      const { data } = await apiClient.get<ReporteBasesResponse>(
        `/api/v1/admin/reportes/bases?${params.toString()}`
      )
      return data
    },
    enabled: !!accountId,
  })
}

export function useEstadoBase(baseId: string | undefined) {
  return useQuery({
    queryKey: ["reportes", "bases", baseId, "estado"],
    queryFn: async () => {
      const { data } = await apiClient.get<EstadoBaseResponse>(
        `/api/v1/admin/reportes/bases/${baseId}/estado`
      )
      return data
    },
    enabled: !!baseId,
  })
}

// =============================================================================
// Métricas de Agentes
// =============================================================================

interface AgentesFilters {
  campania_id?: string
  fecha_desde?: string
  fecha_hasta?: string
}

export function useMetricasAgentes(
  accountId: string | undefined,
  filters: AgentesFilters = {}
) {
  const params = new URLSearchParams()
  if (accountId) params.append("account_id", accountId)
  if (filters.campania_id) params.append("campania_id", filters.campania_id)
  if (filters.fecha_desde) params.append("fecha_desde", filters.fecha_desde)
  if (filters.fecha_hasta) params.append("fecha_hasta", filters.fecha_hasta)
  
  return useQuery({
    queryKey: ["reportes", "agentes", accountId, filters],
    queryFn: async () => {
      const { data } = await apiClient.get<MetricasAgentesResponse>(
        `/api/v1/admin/reportes/agentes?${params.toString()}`
      )
      return data
    },
    enabled: !!accountId,
  })
}

// =============================================================================
// Métricas de Campaña
// =============================================================================

export function useMetricasCampana(campaniaId: string | undefined) {
  return useQuery({
    queryKey: ["reportes", "campanas", campaniaId, "metricas"],
    queryFn: async () => {
      const { data } = await apiClient.get<MetricasCampanaResponse>(
        `/api/v1/admin/reportes/campanas/${campaniaId}/metricas`
      )
      return data
    },
    enabled: !!campaniaId,
    refetchInterval: 30000, // Refrescar cada 30 seg
  })
}

// =============================================================================
// Monitor en Tiempo Real
// =============================================================================

export function useMonitor(accountId: string | undefined) {
  return useQuery({
    queryKey: ["reportes", "monitor", accountId],
    queryFn: async () => {
      const { data } = await apiClient.get<MonitorResponse>(
        `/api/v1/admin/reportes/monitor?account_id=${accountId}`
      )
      return data
    },
    enabled: !!accountId,
    refetchInterval: 10000, // Refrescar cada 10 seg
  })
}
