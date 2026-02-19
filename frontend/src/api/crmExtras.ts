/**
 * API functions for CRM Extras:
 * - Actividades
 * - Tareas
 * - Notas
 * - Tags
 * - Audit Log
 * - Timeline
 */
import { apiClient } from "./client";
import type {
  ActividadListResponse,
  ActividadResponse,
  ActividadCreate,
  ActividadUpdate,
  TareaListResponse,
  TareaResponse,
  TareaCreate,
  TareaUpdate,
  TareaStats,
  NotaListResponse,
  NotaResponse,
  NotaCreate,
  NotaUpdate,
  TagListResponse,
  TagResponse,
  TagCreate,
  TagUpdate,
  LeadTimelineItem,
  AuditLogListResponse,
} from "@/types";

// =============================================================================
// ACTIVIDADES
// =============================================================================

export async function getActividades(
  accountId: string,
  params?: {
    lead_id?: string;
    user_id?: string;
    tipo?: string;
    desde?: string;
    hasta?: string;
    page?: number;
    page_size?: number;
  }
): Promise<ActividadListResponse> {
  const response = await apiClient.get<ActividadListResponse>(
    `/api/v1/admin/accounts/${accountId}/actividades`,
    { params }
  );
  return response.data;
}

export async function createActividad(
  accountId: string,
  payload: ActividadCreate
): Promise<ActividadResponse> {
  const response = await apiClient.post<ActividadResponse>(
    `/api/v1/admin/accounts/${accountId}/actividades`,
    payload
  );
  return response.data;
}

export async function getActividad(actividadId: string): Promise<ActividadResponse> {
  const response = await apiClient.get<ActividadResponse>(
    `/api/v1/admin/actividades/${actividadId}`
  );
  return response.data;
}

export async function updateActividad(
  actividadId: string,
  payload: ActividadUpdate
): Promise<ActividadResponse> {
  const response = await apiClient.put<ActividadResponse>(
    `/api/v1/admin/actividades/${actividadId}`,
    payload
  );
  return response.data;
}

export async function deleteActividad(actividadId: string): Promise<void> {
  await apiClient.delete(`/api/v1/admin/actividades/${actividadId}`);
}

// =============================================================================
// TAREAS
// =============================================================================

export async function getTareas(
  accountId: string,
  params?: {
    lead_id?: string;
    user_id?: string;
    estado?: string;
    prioridad?: string;
    vencidas?: boolean;
    page?: number;
    page_size?: number;
  }
): Promise<TareaListResponse> {
  const response = await apiClient.get<TareaListResponse>(
    `/api/v1/admin/accounts/${accountId}/tareas`,
    { params }
  );
  return response.data;
}

export async function getTareasStats(
  accountId: string,
  userId?: string
): Promise<TareaStats> {
  const response = await apiClient.get<TareaStats>(
    `/api/v1/admin/accounts/${accountId}/tareas/stats`,
    { params: { user_id: userId } }
  );
  return response.data;
}

export async function createTarea(
  accountId: string,
  payload: TareaCreate
): Promise<TareaResponse> {
  const response = await apiClient.post<TareaResponse>(
    `/api/v1/admin/accounts/${accountId}/tareas`,
    payload
  );
  return response.data;
}

export async function updateTarea(
  tareaId: string,
  payload: TareaUpdate
): Promise<TareaResponse> {
  const response = await apiClient.put<TareaResponse>(
    `/api/v1/admin/tareas/${tareaId}`,
    payload
  );
  return response.data;
}

export async function completarTarea(tareaId: string): Promise<TareaResponse> {
  const response = await apiClient.post<TareaResponse>(
    `/api/v1/admin/tareas/${tareaId}/completar`
  );
  return response.data;
}

export async function deleteTarea(tareaId: string): Promise<void> {
  await apiClient.delete(`/api/v1/admin/tareas/${tareaId}`);
}

// =============================================================================
// NOTAS
// =============================================================================

export async function getNotas(
  leadId: string,
  params?: { page?: number; page_size?: number }
): Promise<NotaListResponse> {
  const response = await apiClient.get<NotaListResponse>(
    `/api/v1/admin/leads/${leadId}/notas`,
    { params }
  );
  return response.data;
}

export async function createNota(
  leadId: string,
  payload: NotaCreate
): Promise<NotaResponse> {
  const response = await apiClient.post<NotaResponse>(
    `/api/v1/admin/leads/${leadId}/notas`,
    payload
  );
  return response.data;
}

export async function updateNota(
  notaId: string,
  payload: NotaUpdate
): Promise<NotaResponse> {
  const response = await apiClient.put<NotaResponse>(
    `/api/v1/admin/notas/${notaId}`,
    payload
  );
  return response.data;
}

export async function deleteNota(notaId: string): Promise<void> {
  await apiClient.delete(`/api/v1/admin/notas/${notaId}`);
}

// =============================================================================
// TAGS
// =============================================================================

export async function getTags(
  accountId: string,
  activos: boolean = true
): Promise<TagListResponse> {
  const response = await apiClient.get<TagListResponse>(
    `/api/v1/admin/accounts/${accountId}/tags`,
    { params: { activos } }
  );
  return response.data;
}

export async function createTag(
  accountId: string,
  payload: TagCreate
): Promise<TagResponse> {
  const response = await apiClient.post<TagResponse>(
    `/api/v1/admin/accounts/${accountId}/tags`,
    payload
  );
  return response.data;
}

export async function updateTag(
  tagId: string,
  payload: TagUpdate
): Promise<TagResponse> {
  const response = await apiClient.put<TagResponse>(
    `/api/v1/admin/tags/${tagId}`,
    payload
  );
  return response.data;
}

export async function deleteTag(tagId: string): Promise<void> {
  await apiClient.delete(`/api/v1/admin/tags/${tagId}`);
}

// Lead Tags
export async function getLeadTags(leadId: string): Promise<TagResponse[]> {
  const response = await apiClient.get<TagResponse[]>(
    `/api/v1/admin/leads/${leadId}/tags`
  );
  return response.data;
}

export async function assignTagsToLead(
  leadId: string,
  tagIds: string[]
): Promise<{ success: boolean; lead_id: string; tags_count: number }> {
  const response = await apiClient.put(
    `/api/v1/admin/leads/${leadId}/tags`,
    { tag_ids: tagIds }
  );
  return response.data;
}

// =============================================================================
// TIMELINE
// =============================================================================

export async function getLeadTimeline(
  leadId: string,
  limit: number = 50
): Promise<LeadTimelineItem[]> {
  const response = await apiClient.get<LeadTimelineItem[]>(
    `/api/v1/admin/leads/${leadId}/timeline`,
    { params: { limit } }
  );
  return response.data;
}

// =============================================================================
// AUDIT LOG
// =============================================================================

export async function getAuditLogs(
  accountId: string,
  params?: {
    entidad_tipo?: string;
    entidad_id?: string;
    user_id?: string;
    accion?: string;
    desde?: string;
    hasta?: string;
    page?: number;
    page_size?: number;
  }
): Promise<AuditLogListResponse> {
  const response = await apiClient.get<AuditLogListResponse>(
    `/api/v1/admin/accounts/${accountId}/audit-logs`,
    { params }
  );
  return response.data;
}

// =============================================================================
// ASIGNACIÓN DE LEADS
// =============================================================================

export async function assignLead(
  leadId: string,
  userId: string | null,
  assignedByRule: string = "manual"
): Promise<{ success: boolean; lead_id: string }> {
  const response = await apiClient.put(`/api/v1/admin/leads/${leadId}/assign`, {
    assigned_to_id: userId,
    assigned_by_rule: assignedByRule,
  });
  return response.data;
}
