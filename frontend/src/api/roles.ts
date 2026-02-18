import apiClient from "./client"
import type {
  RoleResponse,
  RoleListResponse,
  RoleCreate,
  RoleUpdate,
  PermissionsResponse,
} from "@/types"

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
