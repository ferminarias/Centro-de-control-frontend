import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getLeadBases, createLeadBase, updateLeadBase, deleteLeadBase } from "@/api/leadBases"
import type { LeadBaseCreate, LeadBaseUpdate } from "@/types"
import { toast } from "sonner"

export function useLeadBasesList(accountId: string | undefined) {
  return useQuery({
    queryKey: ["leadBases", accountId],
    queryFn: () => getLeadBases(accountId!),
    enabled: !!accountId,
  })
}

export function useCreateLeadBase(accountId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: LeadBaseCreate) => createLeadBase(accountId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["leadBases", accountId] })
      toast.success("Base creada exitosamente")
    },
    onError: () => toast.error("Error al crear la base"),
  })
}

export function useUpdateLeadBase(accountId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ baseId, payload }: { baseId: string; payload: LeadBaseUpdate }) =>
      updateLeadBase(baseId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["leadBases", accountId] })
      toast.success("Base actualizada")
    },
    onError: () => toast.error("Error al actualizar la base"),
  })
}

export function useDeleteLeadBase(accountId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (baseId: string) => deleteLeadBase(baseId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["leadBases", accountId] })
      toast.success("Base eliminada")
    },
    onError: () => toast.error("Error al eliminar la base"),
  })
}
