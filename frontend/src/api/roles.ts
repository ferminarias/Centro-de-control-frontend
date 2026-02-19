import apiClient from "./client"
import type {
  RoleResponse,
  RoleListResponse,
  RoleCreate,
  RoleUpdate,
  PermissionsResponse,
} from "@/types"

// ─────────────────────────────────────────────────────────────────────────────
// Legacy Role API
// ─────────────────────────────────────────────────────────────────────────────

export const getRoles = async (accountId: string) => {
  const { data } = await apiClient.get<RoleListResponse>(
    `/api/v1/admin/accounts/${accountId}/roles`
  )
  return data
}

export const getRole = async (roleId: string) => {
  const { data } = await apiClient.get<RoleResponse>(
    `/api/v1/admin/roles/${roleId}`
  )
  return data
}

export const createRole = async (accountId: string, payload: RoleCreate) => {
  const { data } = await apiClient.post<RoleResponse>(
    `/api/v1/admin/accounts/${accountId}/roles`,
    payload
  )
  return data
}

export const updateRole = async (roleId: string, payload: RoleUpdate) => {
  const { data } = await apiClient.put<RoleResponse>(
    `/api/v1/admin/roles/${roleId}`,
    payload
  )
  return data
}

export const deleteRole = async (roleId: string) => {
  await apiClient.delete(`/api/v1/admin/roles/${roleId}`)
}

export const getPermissions = async () => {
  const { data } = await apiClient.get<PermissionsResponse>(
    `/api/v1/admin/permissions`
  )
  return data
}

// ─────────────────────────────────────────────────────────────────────────────
// NEW: Modular Permission API
// ─────────────────────────────────────────────────────────────────────────────

export interface ModulePermission {
  module_id: string
  codigo: string
  nombre: string
  acciones_permitidas: string[]
}

/**
 * Get role's module permissions
 */
export const getRoleModulePermissions = async (roleId: string): Promise<ModulePermission[]> => {
  const { data } = await apiClient.get<ModulePermission[]>(
    `/api/v1/roles/${roleId}/module-permissions`
  )
  return data
}

/**
 * Set role's permissions for a module
 */
export const setRoleModulePermissions = async (
  roleId: string,
  moduleId: string,
  accionesPermitidas: string[]
): Promise<ModulePermission> => {
  const { data } = await apiClient.put<ModulePermission>(
    `/api/v1/roles/${roleId}/module-permissions`,
    {
      module_id: moduleId,
      acciones_permitidas: accionesPermitidas,
    }
  )
  return data
}

/**
 * Delete role's permissions for a module
 */
export const deleteRoleModulePermissions = async (
  roleId: string,
  moduleId: string
): Promise<void> => {
  await apiClient.delete(`/api/v1/roles/${roleId}/module-permissions/${moduleId}`)
}
