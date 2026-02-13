import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getFields, createField, updateField, deleteField } from "@/api/fields"
import type { FieldCreate, FieldUpdate } from "@/types"
import { toast } from "sonner"

export function useFieldsList(accountId: string | undefined) {
  return useQuery({
    queryKey: ["fields", accountId],
    queryFn: () => getFields(accountId!),
    enabled: !!accountId,
  })
}

export function useCreateField(accountId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: FieldCreate) => createField(accountId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["fields", accountId] })
      toast.success("Campo creado exitosamente")
    },
    onError: () => toast.error("Error al crear el campo"),
  })
}

export function useUpdateField(accountId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ fieldId, payload }: { fieldId: string; payload: FieldUpdate }) =>
      updateField(fieldId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["fields", accountId] })
      toast.success("Campo actualizado")
    },
    onError: () => toast.error("Error al actualizar el campo"),
  })
}

export function useDeleteField(accountId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (fieldId: string) => deleteField(fieldId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["fields", accountId] })
      toast.success("Campo eliminado")
    },
    onError: () => toast.error("Error al eliminar el campo"),
  })
}
