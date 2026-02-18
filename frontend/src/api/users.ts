import apiClient from "./client"
import type {
  UserResponse,
  UserListResponse,
  UserCreate,
  UserUpdate,
} from "@/types"

export const getUsers = async (accountId: string, page = 1, pageSize = 20) => {
  const { data } = await apiClient.get<UserListResponse>(
    `/api/v1/admin/accounts/${accountId}/users`,
    { params: { page, page_size: pageSize } }
  )
  return data
}

export const getUser = async (userId: string) => {
  const { data } = await apiClient.get<UserResponse>(
    `/api/v1/admin/users/${userId}`
  )
  return data
}

export const createUser = async (accountId: string, payload: UserCreate) => {
  const { data } = await apiClient.post<UserResponse>(
    `/api/v1/admin/accounts/${accountId}/users`,
    payload
  )
  return data
}

export const updateUser = async (userId: string, payload: UserUpdate) => {
  const { data } = await apiClient.put<UserResponse>(
    `/api/v1/admin/users/${userId}`,
    payload
  )
  return data
}

export const deleteUser = async (userId: string) => {
  await apiClient.delete(`/api/v1/admin/users/${userId}`)
}
