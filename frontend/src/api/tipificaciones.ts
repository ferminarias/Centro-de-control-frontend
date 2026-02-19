/**
 * API functions for Tipificacion and Subtipificacion management
 */
import { apiClient } from "./client"
import type {
  TipificacionListResponse,
  TipificacionResponse,
  SubtipificacionListResponse,
  SubtipificacionResponse,
  TipificacionCreate,
  TipificacionUpdate,
  SubtipificacionCreate,
  SubtipificacionUpdate,
  LeadTipificacionUpdate,
  TipificacionStats,
} from "@/types"

// ─────────────────────────────────────────────────────────────────────────────
// Tipificaciones
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get all tipificaciones for an account
 */
export async function getTipificaciones(
  accountId: string,
  includeInactive = false
): Promise<TipificacionListResponse> {
  const response = await apiClient.get<TipificacionListResponse>(
    `/api/v1/admin/accounts/${accountId}/tipificaciones`,
    { params: { include_inactive: includeInactive } }
  )
  return response.data
}

/**
 * Create a new tipificacion
 */
export async function createTipificacion(
  accountId: string,
  payload: TipificacionCreate
): Promise<TipificacionResponse> {
  const response = await apiClient.post<TipificacionResponse>(
    `/api/v1/admin/accounts/${accountId}/tipificaciones`,
    payload
  )
  return response.data
}

/**
 * Get a single tipificacion by ID
 */
export async function getTipificacion(tipificacionId: string): Promise<TipificacionResponse> {
  const response = await apiClient.get<TipificacionResponse>(
    `/api/v1/admin/tipificaciones/${tipificacionId}`
  )
  return response.data
}

/**
 * Update a tipificacion
 */
export async function updateTipificacion(
  tipificacionId: string,
  payload: TipificacionUpdate
): Promise<TipificacionResponse> {
  const response = await apiClient.put<TipificacionResponse>(
    `/api/v1/admin/tipificaciones/${tipificacionId}`,
    payload
  )
  return response.data
}

/**
 * Delete a tipificacion
 */
export async function deleteTipificacion(tipificacionId: string): Promise<void> {
  await apiClient.delete(`/api/v1/admin/tipificaciones/${tipificacionId}`)
}

// ─────────────────────────────────────────────────────────────────────────────
// Subtipificaciones
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get all subtipificaciones for a tipificacion
 */
export async function getSubtipificaciones(
  tipificacionId: string,
  includeInactive = false
): Promise<SubtipificacionListResponse> {
  const response = await apiClient.get<SubtipificacionListResponse>(
    `/api/v1/admin/tipificaciones/${tipificacionId}/subtipificaciones`,
    { params: { include_inactive: includeInactive } }
  )
  return response.data
}

/**
 * Create a new subtipificacion
 */
export async function createSubtipificacion(
  tipificacionId: string,
  payload: SubtipificacionCreate
): Promise<SubtipificacionResponse> {
  const response = await apiClient.post<SubtipificacionResponse>(
    `/api/v1/admin/tipificaciones/${tipificacionId}/subtipificaciones`,
    payload
  )
  return response.data
}

/**
 * Update a subtipificacion
 */
export async function updateSubtipificacion(
  subtipificacionId: string,
  payload: SubtipificacionUpdate
): Promise<SubtipificacionResponse> {
  const response = await apiClient.put<SubtipificacionResponse>(
    `/api/v1/admin/subtipificaciones/${subtipificacionId}`,
    payload
  )
  return response.data
}

/**
 * Delete a subtipificacion
 */
export async function deleteSubtipificacion(subtipificacionId: string): Promise<void> {
  await apiClient.delete(`/api/v1/admin/subtipificaciones/${subtipificacionId}`)
}

// ─────────────────────────────────────────────────────────────────────────────
// Lead Tipification
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Update a lead's tipificacion
 */
export async function updateLeadTipificacion(
  leadId: string,
  payload: LeadTipificacionUpdate
): Promise<{ success: boolean; lead_id: string }> {
  const response = await apiClient.put(
    `/api/v1/admin/leads/${leadId}/tipificacion`,
    payload
  )
  return response.data
}

/**
 * Bulk update tipificacion for multiple leads
 */
export async function bulkUpdateTipificacion(
  leadIds: string[],
  tipificacionId?: string | null,
  subtipificacionId?: string | null
): Promise<{ success: boolean; updated: number }> {
  const response = await apiClient.post(`/api/v1/admin/leads/bulk-tipificacion`, {
    lead_ids: leadIds,
    tipificacion_id: tipificacionId,
    subtipificacion_id: subtipificacionId,
  })
  return response.data
}

// ─────────────────────────────────────────────────────────────────────────────
// Stats
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get tipificaciones statistics
 */
export async function getTipificacionesStats(
  accountId: string
): Promise<{ stats: TipificacionStats[] }> {
  const response = await apiClient.get<{ stats: TipificacionStats[] }>(
    `/api/v1/admin/accounts/${accountId}/tipificaciones/stats`
  )
  return response.data
}
