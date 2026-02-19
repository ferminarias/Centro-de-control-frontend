/**
 * Hooks para gestión de Ficha Config (Configuración de ficha de contacto)
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { apiClient } from "@/api/client"
import type {
  FichaConfigResponse,
  FichaConfigCreate,
  AvailableFieldsResponse,
} from "@/types/fichaConfig"

/**
 * GET ficha-config with fallback resolution.
 * If campaniaId is provided, tries campaign-specific config first;
 * backend resolves to account-level if no campaign config exists.
 */
export function useFichaConfig(accountId: string | undefined, campaniaId?: string) {
  return useQuery({
    queryKey: ["ficha-config", accountId, campaniaId ?? "global"],
    queryFn: async () => {
      const params: Record<string, string> = {}
      if (campaniaId) params.campania_id = campaniaId
      const { data } = await apiClient.get<FichaConfigResponse>(
        `/api/v1/admin/accounts/${accountId}/ficha-config`,
        { params }
      )
      return data
    },
    enabled: !!accountId,
  })
}

/**
 * GET available fields for the account (all lead field keys)
 */
export function useAvailableFields(accountId: string | undefined) {
  return useQuery({
    queryKey: ["ficha-config-fields", accountId],
    queryFn: async () => {
      const { data } = await apiClient.get<AvailableFieldsResponse>(
        `/api/v1/admin/accounts/${accountId}/ficha-config/available-fields`
      )
      return data
    },
    enabled: !!accountId,
  })
}

/**
 * PUT upsert ficha config
 */
export function useSaveFichaConfig(accountId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: FichaConfigCreate) => {
      const { data } = await apiClient.put<FichaConfigResponse>(
        `/api/v1/admin/accounts/${accountId}/ficha-config`,
        payload
      )
      return data
    },
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ["ficha-config", accountId] })
      toast.success("Configuración de ficha guardada")
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Error al guardar configuración de ficha")
    },
  })
}

/**
 * DELETE ficha config
 */
export function useDeleteFichaConfig(accountId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (campaniaId?: string) => {
      const params: Record<string, string> = {}
      if (campaniaId) params.campania_id = campaniaId
      await apiClient.delete(`/api/v1/admin/accounts/${accountId}/ficha-config`, { params })
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ficha-config", accountId] })
      toast.success("Configuración de ficha eliminada")
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Error al eliminar configuración de ficha")
    },
  })
}
