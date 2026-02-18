import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getUsers, createUser, updateUser, deleteUser } from "@/api/users"
import type { UserCreate, UserUpdate } from "@/types"
import { toast } from "sonner"

export function useUsersList(accountId: string | undefined, page = 1, pageSize = 20) {
  return useQuery({
    queryKey: ["users", accountId, page, pageSize],
    queryFn: () => getUsers(accountId!, page, pageSize),
    enabled: !!accountId,
  })
}

export function useCreateUser(accountId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: UserCreate) => createUser(accountId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["users", accountId] })
      toast.success("Usuario creado exitosamente")
    },
    onError: () => toast.error("Error al crear el usuario"),
  })
}

export function useUpdateUser(accountId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ userId, payload }: { userId: string; payload: UserUpdate }) =>
      updateUser(userId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["users", accountId] })
      toast.success("Usuario actualizado")
    },
    onError: () => toast.error("Error al actualizar el usuario"),
  })
}

export function useDeleteUser(accountId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (userId: string) => deleteUser(userId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["users", accountId] })
      toast.success("Usuario eliminado")
    },
    onError: () => toast.error("Error al eliminar el usuario"),
  })
}
