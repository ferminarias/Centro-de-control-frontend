import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  getAutomations,
  getAutomation,
  createAutomation,
  updateAutomation,
  deleteAutomation,
  toggleAutomation,
  addCondition,
  deleteCondition,
  addAction,
  deleteAction,
  getAutomationLogs,
  getAutomationMeta,
} from "@/api/automations"
import type {
  AutomationCreate,
  AutomationUpdate,
  AutomationConditionCreate,
  AutomationActionCreate,
} from "@/types"
import { toast } from "sonner"

export function useAutomationsList(accountId: string | undefined) {
  return useQuery({
    queryKey: ["automations", accountId],
    queryFn: () => getAutomations(accountId!),
    enabled: !!accountId,
  })
}

export function useAutomationDetail(automationId: string | undefined) {
  return useQuery({
    queryKey: ["automation", automationId],
    queryFn: () => getAutomation(automationId!),
    enabled: !!automationId,
  })
}

export function useAutomationMeta() {
  return useQuery({
    queryKey: ["automationMeta"],
    queryFn: getAutomationMeta,
  })
}

export function useCreateAutomation(accountId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: AutomationCreate) => createAutomation(accountId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["automations", accountId] })
      toast.success("Automatizacion creada exitosamente")
    },
    onError: () => toast.error("Error al crear la automatizacion"),
  })
}

export function useUpdateAutomation(accountId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ automationId, payload }: { automationId: string; payload: AutomationUpdate }) =>
      updateAutomation(automationId, payload),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["automations", accountId] })
      qc.invalidateQueries({ queryKey: ["automation", vars.automationId] })
      toast.success("Automatizacion actualizada")
    },
    onError: () => toast.error("Error al actualizar la automatizacion"),
  })
}

export function useDeleteAutomation(accountId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (automationId: string) => deleteAutomation(automationId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["automations", accountId] })
      toast.success("Automatizacion eliminada")
    },
    onError: () => toast.error("Error al eliminar la automatizacion"),
  })
}

export function useToggleAutomation(accountId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (automationId: string) => toggleAutomation(automationId),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["automations", accountId] })
      qc.invalidateQueries({ queryKey: ["automation", data.id] })
      toast.success(data.activo ? "Automatizacion activada" : "Automatizacion desactivada")
    },
    onError: () => toast.error("Error al cambiar estado"),
  })
}

export function useAddCondition(accountId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ automationId, payload }: { automationId: string; payload: AutomationConditionCreate }) =>
      addCondition(automationId, payload),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["automation", vars.automationId] })
      qc.invalidateQueries({ queryKey: ["automations", accountId] })
    },
    onError: () => toast.error("Error al agregar condicion"),
  })
}

export function useDeleteCondition(accountId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (conditionId: string) => deleteCondition(conditionId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["automations", accountId] })
      // Also invalidate any open automation detail
      qc.invalidateQueries({ predicate: (q) => q.queryKey[0] === "automation" })
    },
    onError: () => toast.error("Error al eliminar condicion"),
  })
}

export function useAddAction(accountId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ automationId, payload }: { automationId: string; payload: AutomationActionCreate }) =>
      addAction(automationId, payload),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["automation", vars.automationId] })
      qc.invalidateQueries({ queryKey: ["automations", accountId] })
    },
    onError: () => toast.error("Error al agregar accion"),
  })
}

export function useDeleteAction(accountId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (actionId: string) => deleteAction(actionId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["automations", accountId] })
      qc.invalidateQueries({ predicate: (q) => q.queryKey[0] === "automation" })
    },
    onError: () => toast.error("Error al eliminar accion"),
  })
}

export function useAutomationLogs(automationId: string | undefined, page = 1, pageSize = 20) {
  return useQuery({
    queryKey: ["automationLogs", automationId, page, pageSize],
    queryFn: () => getAutomationLogs(automationId!, page, pageSize),
    enabled: !!automationId,
  })
}
