import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getActividades,
  createActividad,
  updateActividad,
  deleteActividad,
  getTareas,
  getTareasStats,
  createTarea,
  updateTarea,
  completarTarea,
  deleteTarea,
  getNotas,
  createNota,
  updateNota,
  deleteNota,
  getTags,
  createTag,
  updateTag,
  deleteTag,
  getLeadTags,
  assignTagsToLead,
  getLeadTimeline,
  getAuditLogs,
} from "@/api/crmExtras";
import type {
  ActividadCreate,
  ActividadUpdate,
  TareaCreate,
  TareaUpdate,
  NotaCreate,
  NotaUpdate,
  TagCreate,
  TagUpdate,
} from "@/types";

// =============================================================================
// ACTIVIDADES
// =============================================================================

export function useActividades(
  accountId: string | undefined,
  params?: {
    lead_id?: string;
    user_id?: string;
    tipo?: string;
    desde?: string;
    hasta?: string;
    page?: number;
    page_size?: number;
  }
) {
  return useQuery({
    queryKey: ["actividades", accountId, params],
    queryFn: () => getActividades(accountId!, params),
    enabled: !!accountId,
  });
}

export function useCreateActividad(accountId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: ActividadCreate) => createActividad(accountId, payload),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ["actividades", accountId] });
      qc.invalidateQueries({ queryKey: ["leads", accountId] });
      if (variables.lead_id) {
        qc.invalidateQueries({ queryKey: ["timeline", variables.lead_id] });
      }
      toast.success("Actividad registrada");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Error al registrar actividad");
    },
  });
}

export function useUpdateActividad(accountId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ActividadUpdate }) =>
      updateActividad(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["actividades", accountId] });
      toast.success("Actividad actualizada");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Error al actualizar");
    },
  });
}

export function useDeleteActividad(accountId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteActividad(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["actividades", accountId] });
      toast.success("Actividad eliminada");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Error al eliminar");
    },
  });
}

// =============================================================================
// TAREAS
// =============================================================================

export function useTareas(
  accountId: string | undefined,
  params?: {
    lead_id?: string;
    user_id?: string;
    estado?: string;
    prioridad?: string;
    vencidas?: boolean;
    page?: number;
    page_size?: number;
  }
) {
  return useQuery({
    queryKey: ["tareas", accountId, params],
    queryFn: () => getTareas(accountId!, params),
    enabled: !!accountId,
  });
}

export function useTareasStats(accountId: string | undefined, userId?: string) {
  return useQuery({
    queryKey: ["tareas", accountId, "stats", userId],
    queryFn: () => getTareasStats(accountId!, userId),
    enabled: !!accountId,
  });
}

export function useCreateTarea(accountId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: TareaCreate) => createTarea(accountId, payload),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ["tareas", accountId] });
      if (variables.lead_id) {
        qc.invalidateQueries({ queryKey: ["timeline", variables.lead_id] });
      }
      toast.success("Tarea creada");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Error al crear tarea");
    },
  });
}

export function useUpdateTarea(accountId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: TareaUpdate }) =>
      updateTarea(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tareas", accountId] });
      toast.success("Tarea actualizada");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Error al actualizar");
    },
  });
}

export function useCompletarTarea(accountId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => completarTarea(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tareas", accountId] });
      qc.invalidateQueries({ queryKey: ["tareas", accountId, "stats"] });
      toast.success("Tarea completada");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Error al completar");
    },
  });
}

export function useDeleteTarea(accountId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteTarea(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tareas", accountId] });
      toast.success("Tarea eliminada");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Error al eliminar");
    },
  });
}

// =============================================================================
// NOTAS
// =============================================================================

export function useNotas(leadId: string | undefined, params?: { page?: number; page_size?: number }) {
  return useQuery({
    queryKey: ["notas", leadId, params],
    queryFn: () => getNotas(leadId!, params),
    enabled: !!leadId,
  });
}

export function useCreateNota(accountId: string, leadId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: NotaCreate) => createNota(leadId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notas", leadId] });
      qc.invalidateQueries({ queryKey: ["timeline", leadId] });
      toast.success("Nota agregada");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Error al agregar nota");
    },
  });
}

export function useUpdateNota(accountId: string, leadId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: NotaUpdate }) =>
      updateNota(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notas", leadId] });
      toast.success("Nota actualizada");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Error al actualizar");
    },
  });
}

export function useDeleteNota(accountId: string, leadId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteNota(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notas", leadId] });
      toast.success("Nota eliminada");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Error al eliminar");
    },
  });
}

// =============================================================================
// TAGS
// =============================================================================

export function useTags(accountId: string | undefined, activos: boolean = true) {
  return useQuery({
    queryKey: ["tags", accountId, { activos }],
    queryFn: () => getTags(accountId!, activos),
    enabled: !!accountId,
  });
}

export function useCreateTag(accountId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: TagCreate) => createTag(accountId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tags", accountId] });
      toast.success("Tag creado");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Error al crear tag");
    },
  });
}

export function useUpdateTag(accountId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: TagUpdate }) =>
      updateTag(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tags", accountId] });
      toast.success("Tag actualizado");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Error al actualizar");
    },
  });
}

export function useDeleteTag(accountId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteTag(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tags", accountId] });
      toast.success("Tag eliminado");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Error al eliminar");
    },
  });
}

// Lead Tags
export function useLeadTags(leadId: string | undefined) {
  return useQuery({
    queryKey: ["lead-tags", leadId],
    queryFn: () => getLeadTags(leadId!),
    enabled: !!leadId,
  });
}

export function useAssignTagsToLead(accountId: string, leadId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (tagIds: string[]) => assignTagsToLead(leadId, tagIds),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["lead-tags", leadId] });
      qc.invalidateQueries({ queryKey: ["leads", accountId] });
      toast.success("Tags actualizados");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Error al asignar tags");
    },
  });
}

// =============================================================================
// TIMELINE
// =============================================================================

export function useLeadTimeline(leadId: string | undefined, limit: number = 50) {
  return useQuery({
    queryKey: ["timeline", leadId, limit],
    queryFn: () => getLeadTimeline(leadId!, limit),
    enabled: !!leadId,
  });
}

// =============================================================================
// AUDIT LOG
// =============================================================================

export function useAuditLogs(
  accountId: string | undefined,
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
) {
  return useQuery({
    queryKey: ["audit-logs", accountId, params],
    queryFn: () => getAuditLogs(accountId!, params),
    enabled: !!accountId,
  });
}
