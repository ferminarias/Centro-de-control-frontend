/**
 * Hooks para gestión de Campañas de Contact Center
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { apiClient } from "@/api/client"
import type {
  Campania,
  CampaniaCreate,
  CampaniaUpdate,
  CampaniaListResponse,
  CampaniaAgente,
  ColaLeadListResponse,
  Ficha,
  GestionFichaRequest,
  SolicitarFichaResponse,
  MetricasCampania,
} from "@/types/campania"

// ─────────────────────────────────────────────────────────────────────────────
// Admin: CRUD Campañas
// ─────────────────────────────────────────────────────────────────────────────

export function useCampaniasList(accountId: string | undefined) {
  return useQuery({
    queryKey: ["campanias", accountId],
    queryFn: async () => {
      const { data } = await apiClient.get<CampaniaListResponse>(
        `/api/v1/admin/accounts/${accountId}/campanias`
      )
      return data
    },
    enabled: !!accountId,
  })
}

export function useCampania(campaniaId: string | undefined) {
  return useQuery({
    queryKey: ["campania", campaniaId],
    queryFn: async () => {
      const { data } = await apiClient.get<Campania>(`/api/v1/admin/campanias/${campaniaId}`)
      return data
    },
    enabled: !!campaniaId,
  })
}

export function useCreateCampania(accountId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: CampaniaCreate) => {
      const { data } = await apiClient.post<Campania>(
        `/api/v1/admin/accounts/${accountId}/campanias`,
        payload
      )
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["campanias", accountId] })
      toast.success("Campaña creada exitosamente")
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Error al crear campaña")
    },
  })
}

export function useUpdateCampania(accountId: string, campaniaId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: CampaniaUpdate) => {
      const { data } = await apiClient.put<Campania>(
        `/api/v1/admin/campanias/${campaniaId}`,
        payload
      )
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["campanias", accountId] })
      qc.invalidateQueries({ queryKey: ["campania", campaniaId] })
      toast.success("Campaña actualizada")
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Error al actualizar campaña")
    },
  })
}

export function useDeleteCampania(accountId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (campaniaId: string) => {
      await apiClient.delete(`/api/v1/admin/campanias/${campaniaId}`)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["campanias", accountId] })
      toast.success("Campaña eliminada")
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Error al eliminar campaña")
    },
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// Agentes en Campaña
// ─────────────────────────────────────────────────────────────────────────────

export function useCampaniaAgentes(campaniaId: string | undefined) {
  return useQuery({
    queryKey: ["campania-agentes", campaniaId],
    queryFn: async () => {
      const { data } = await apiClient.get<CampaniaAgente[]>(
        `/api/v1/admin/campanias/${campaniaId}/agentes`
      )
      return data
    },
    enabled: !!campaniaId,
  })
}

export function useAssignAgentes(campaniaId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (agenteIds: string[]) => {
      const { data } = await apiClient.post(
        `/api/v1/admin/campanias/${campaniaId}/agentes`,
        { agente_ids: agenteIds }
      )
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["campania-agentes", campaniaId] })
      toast.success("Agentes asignados")
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Error al asignar agentes")
    },
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// Cola de Leads
// ─────────────────────────────────────────────────────────────────────────────

export function useColaLeads(campaniaId: string | undefined, estado?: string) {
  return useQuery({
    queryKey: ["cola-leads", campaniaId, estado],
    queryFn: async () => {
      const { data } = await apiClient.get<ColaLeadListResponse>(
        `/api/v1/admin/campanias/${campaniaId}/cola`,
        { params: { estado } }
      )
      return data
    },
    enabled: !!campaniaId,
    refetchInterval: 30000, // Refrescar cada 30 seg
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// Agente: Gestión de Contactos
// ─────────────────────────────────────────────────────────────────────────────

export function useEntrarCampania() {
  return useMutation({
    mutationFn: async (campaniaId: string) => {
      const { data } = await apiClient.post(`/api/v1/admin/campanias/${campaniaId}/entrar`)
      return data
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Error al entrar a la campaña")
    },
  })
}

export function useSolicitarFicha(campaniaId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      const { data } = await apiClient.post<SolicitarFichaResponse>(
        `/api/v1/admin/campanias/${campaniaId}/solicitar-ficha`
      )
      return data
    },
    onSuccess: (data) => {
      if (data.ficha) {
        qc.setQueryData(["ficha-actual", campaniaId], data.ficha)
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Error al solicitar ficha")
    },
  })
}

export function useGestionarFicha(campaniaId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ colaId, payload }: { colaId: string; payload: GestionFichaRequest }) => {
      const { data } = await apiClient.post(
        `/api/v1/admin/campanias/${campaniaId}/gestionar-ficha/${colaId}`,
        payload
      )
      return data
    },
    onSuccess: () => {
      qc.removeQueries({ queryKey: ["ficha-actual", campaniaId] })
      qc.invalidateQueries({ queryKey: ["cola-leads", campaniaId] })
      toast.success("Ficha gestionada correctamente")
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Error al guardar gestión")
    },
  })
}

export function useSaltarFicha(campaniaId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ colaId, motivo }: { colaId: string; motivo: string }) => {
      const { data } = await apiClient.post(
        `/api/v1/admin/campanias/${campaniaId}/saltar-ficha/${colaId}?motivo=${encodeURIComponent(motivo)}`
      )
      return data
    },
    onSuccess: () => {
      qc.removeQueries({ queryKey: ["ficha-actual", campaniaId] })
      toast.success("Ficha liberada")
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Error al liberar ficha")
    },
  })
}

// Hook para obtener la ficha actual de la caché
export function useFichaActual(campaniaId: string | undefined) {
  const qc = useQueryClient()
  return {
    getFicha: () => qc.getQueryData<Ficha>(["ficha-actual", campaniaId]),
    clearFicha: () => qc.removeQueries({ queryKey: ["ficha-actual", campaniaId] }),
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Métricas
// ─────────────────────────────────────────────────────────────────────────────

export function useMetricasCampania(campaniaId: string | undefined) {
  return useQuery({
    queryKey: ["metricas-campania", campaniaId],
    queryFn: async () => {
      const { data } = await apiClient.get<MetricasCampania>(
        `/api/v1/admin/campanias/${campaniaId}/metricas`
      )
      return data
    },
    enabled: !!campaniaId,
    refetchInterval: 10000, // Refrescar cada 10 seg
  })
}
