import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import {
  getTipificaciones,
  createTipificacion,
  updateTipificacion,
  deleteTipificacion,
  getSubtipificaciones,
  createSubtipificacion,
  updateSubtipificacion,
  deleteSubtipificacion,
  updateLeadTipificacion,
  bulkUpdateTipificacion,
  getTipificacionesStats,
} from "@/api/tipificaciones"
import type {
  TipificacionCreate,
  TipificacionUpdate,
  SubtipificacionCreate,
  SubtipificacionUpdate,
  LeadTipificacionUpdate,
} from "@/types"

// ─────────────────────────────────────────────────────────────────────────────
// Tipificaciones Queries
// ─────────────────────────────────────────────────────────────────────────────

export function useTipificacionesList(accountId: string | undefined, includeInactive = false) {
  return useQuery({
    queryKey: ["tipificaciones", accountId, { includeInactive }],
    queryFn: () => getTipificaciones(accountId!, includeInactive),
    enabled: !!accountId,
  })
}

export function useTipificacionesStats(accountId: string | undefined) {
  return useQuery({
    queryKey: ["tipificaciones", accountId, "stats"],
    queryFn: () => getTipificacionesStats(accountId!),
    enabled: !!accountId,
  })
}

export function useCreateTipificacion(accountId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: TipificacionCreate) => createTipificacion(accountId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tipificaciones", accountId] })
      toast.success("Tipificación creada")
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Error al crear tipificación")
    },
  })
}

export function useUpdateTipificacion(accountId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: TipificacionUpdate }) =>
      updateTipificacion(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tipificaciones", accountId] })
      toast.success("Tipificación actualizada")
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Error al actualizar tipificación")
    },
  })
}

export function useDeleteTipificacion(accountId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteTipificacion(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tipificaciones", accountId] })
      toast.success("Tipificación eliminada")
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Error al eliminar tipificación")
    },
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// Subtipificaciones Queries
// ─────────────────────────────────────────────────────────────────────────────

export function useSubtipificacionesList(tipificacionId: string | undefined, includeInactive = false) {
  return useQuery({
    queryKey: ["subtipificaciones", tipificacionId, { includeInactive }],
    queryFn: () => getSubtipificaciones(tipificacionId!, includeInactive),
    enabled: !!tipificacionId,
  })
}

export function useCreateSubtipificacion(accountId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ tipificacionId, payload }: { tipificacionId: string; payload: SubtipificacionCreate }) => 
      createSubtipificacion(tipificacionId, payload),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ["tipificaciones", accountId] })
      qc.invalidateQueries({ queryKey: ["subtipificaciones", variables.tipificacionId] })
      toast.success("Subtipificación creada")
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Error al crear subtipificación")
    },
  })
}

export function useUpdateSubtipificacion(accountId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: SubtipificacionUpdate }) =>
      updateSubtipificacion(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tipificaciones", accountId] })
      qc.invalidateQueries({ queryKey: ["subtipificaciones"] })
      toast.success("Subtipificación actualizada")
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Error al actualizar subtipificación")
    },
  })
}

export function useDeleteSubtipificacion(accountId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteSubtipificacion(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tipificaciones", accountId] })
      qc.invalidateQueries({ queryKey: ["subtipificaciones"] })
      toast.success("Subtipificación eliminada")
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Error al eliminar subtipificación")
    },
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// Lead Tipification Mutations
// ─────────────────────────────────────────────────────────────────────────────

export function useUpdateLeadTipificacion(accountId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ leadId, payload }: { leadId: string; payload: LeadTipificacionUpdate }) =>
      updateLeadTipificacion(leadId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["leads", accountId] })
      qc.invalidateQueries({ queryKey: ["tipificaciones", accountId] })
      toast.success("Lead tipificado")
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Error al tipificar lead")
    },
  })
}

export function useBulkUpdateTipificacion(accountId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      leadIds,
      tipificacionId,
      subtipificacionId,
    }: {
      leadIds: string[]
      tipificacionId?: string | null
      subtipificacionId?: string | null
    }) => bulkUpdateTipificacion(leadIds, tipificacionId, subtipificacionId),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["leads", accountId] })
      qc.invalidateQueries({ queryKey: ["tipificaciones", accountId] })
      toast.success(`${data.updated} leads tipificados`)
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Error al tipificar leads")
    },
  })
}
