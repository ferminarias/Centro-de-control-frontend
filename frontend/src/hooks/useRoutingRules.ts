import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getRules, createRule, updateRule, deleteRule } from "@/api/routingRules"
import type { RoutingRuleCreate, RoutingRuleUpdate } from "@/types"
import { toast } from "sonner"

export function useRulesList(baseId: string | undefined) {
  return useQuery({
    queryKey: ["rules", baseId],
    queryFn: () => getRules(baseId!),
    enabled: !!baseId,
  })
}

export function useCreateRule(baseId: string, accountId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: RoutingRuleCreate) => createRule(baseId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["rules", baseId] })
      qc.invalidateQueries({ queryKey: ["allRules", accountId] })
      toast.success("Regla creada exitosamente")
    },
    onError: () => toast.error("Error al crear la regla"),
  })
}

export function useUpdateRule(baseId: string, accountId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ ruleId, payload }: { ruleId: string; payload: RoutingRuleUpdate }) =>
      updateRule(ruleId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["rules", baseId] })
      qc.invalidateQueries({ queryKey: ["allRules", accountId] })
      toast.success("Regla actualizada")
    },
    onError: () => toast.error("Error al actualizar la regla"),
  })
}

export function useDeleteRule(baseId: string, accountId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (ruleId: string) => deleteRule(ruleId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["rules", baseId] })
      qc.invalidateQueries({ queryKey: ["allRules", accountId] })
      toast.success("Regla eliminada")
    },
    onError: () => toast.error("Error al eliminar la regla"),
  })
}
