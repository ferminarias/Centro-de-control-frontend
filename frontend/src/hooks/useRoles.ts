import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getRoles, createRole, updateRole, deleteRole, getPermissions } from "@/api/roles"
import type { RoleCreate, RoleUpdate } from "@/types"
import { toast } from "sonner"

export function useRolesList(accountId: string | undefined) {
  return useQuery({
    queryKey: ["roles", accountId],
    queryFn: () => getRoles(accountId!),
    enabled: !!accountId,
  })
}

export function usePermissions() {
  return useQuery({
    queryKey: ["permissions"],
    queryFn: getPermissions,
  })
}

export function useCreateRole(accountId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: RoleCreate) => createRole(accountId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["roles", accountId] })
      toast.success("Rol creado exitosamente")
    },
    onError: () => toast.error("Error al crear el rol"),
  })
}

export function useUpdateRole(accountId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ roleId, payload }: { roleId: string; payload: RoleUpdate }) =>
      updateRole(roleId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["roles", accountId] })
      toast.success("Rol actualizado")
    },
    onError: () => toast.error("Error al actualizar el rol"),
  })
}

export function useDeleteRole(accountId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (roleId: string) => deleteRole(roleId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["roles", accountId] })
      toast.success("Rol eliminado")
    },
    onError: () => toast.error("Error al eliminar el rol. Verifica que no tenga usuarios asignados."),
  })
}
