import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getAccounts, createAccount, updateAccount, deleteAccount, toggleAutoCreate } from "@/api/accounts"
import type { AccountCreate, AccountUpdate } from "@/types"
import { toast } from "sonner"

export function useAccountsList() {
  return useQuery({
    queryKey: ["accounts"],
    queryFn: () => getAccounts(),
  })
}

export function useCreateAccount() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: AccountCreate) => createAccount(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["accounts"] })
      toast.success("Cuenta creada exitosamente")
    },
    onError: () => toast.error("Error al crear la cuenta"),
  })
}

export function useUpdateAccount() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: AccountUpdate }) =>
      updateAccount(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["accounts"] })
      toast.success("Cuenta actualizada")
    },
    onError: () => toast.error("Error al actualizar la cuenta"),
  })
}

export function useDeleteAccount() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteAccount(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["accounts"] })
      toast.success("Cuenta desactivada")
    },
    onError: () => toast.error("Error al desactivar la cuenta"),
  })
}

export function useToggleAutoCreate() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => toggleAutoCreate(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["accounts"] })
      toast.success("Auto-crear campos actualizado")
    },
    onError: () => toast.error("Error al cambiar auto-crear campos"),
  })
}
