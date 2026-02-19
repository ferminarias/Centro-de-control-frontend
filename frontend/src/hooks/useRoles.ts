import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { 
  getRoles, 
  createRole, 
  updateRole, 
  deleteRole, 
  getPermissions,
  getRoleModulePermissions,
  setRoleModulePermissions,
  deleteRoleModulePermissions,
} from "@/api/roles"
import { getModules, syncModules } from "@/api/modules"
import type { RoleCreate, RoleUpdate } from "@/types"
import { toast } from "sonner"
import { getModulesForSync } from "@/modules/registry"

// Legacy hooks for backward compatibility
export function useRolesList(accountId: string | undefined) {
  return useQuery({
    queryKey: ["roles", accountId],
    queryFn: () => getRoles(accountId!),
    enabled: !!accountId,
  })
}

export function useLegacyPermissions() {
  return useQuery({
    queryKey: ["permissions", "legacy"],
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

// ─────────────────────────────────────────────────────────────────────────────
// NEW: Modular Permission Hooks
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fetch modules from backend
 */
export function useModules(accountId: string | undefined) {
  return useQuery({
    queryKey: ["modules", accountId],
    queryFn: () => getModules(accountId!, true),
    enabled: !!accountId,
  })
}

/**
 * Sync frontend modules registry with backend
 */
export function useSyncModules(accountId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => syncModules(accountId, { modules: getModulesForSync() }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["modules", accountId] })
      toast.success("Módulos sincronizados")
    },
    onError: () => toast.error("Error al sincronizar módulos"),
  })
}

/**
 * Fetch role's module permissions
 */
export function useRoleModulePermissions(roleId: string | undefined) {
  return useQuery({
    queryKey: ["role-module-permissions", roleId],
    queryFn: () => getRoleModulePermissions(roleId!),
    enabled: !!roleId,
  })
}

/**
 * Set role's permissions for a module
 */
export function useSetRoleModulePermissions(accountId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ 
      roleId, 
      moduleId, 
      accionesPermitidas 
    }: { 
      roleId: string; 
      moduleId: string; 
      accionesPermitidas: string[] 
    }) => setRoleModulePermissions(roleId, moduleId, accionesPermitidas),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ["role-module-permissions", variables.roleId] })
    },
  })
}

/**
 * Delete role's permissions for a module
 */
export function useDeleteRoleModulePermissions(accountId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ roleId, moduleId }: { roleId: string; moduleId: string }) => 
      deleteRoleModulePermissions(roleId, moduleId),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ["role-module-permissions", variables.roleId] })
    },
  })
}
