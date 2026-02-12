import apiClient from "./client"
import type {
  AccountCreate,
  AccountListResponse,
  AccountResponse,
  AccountUpdate,
} from "@/types"

export async function getAccounts(page = 1, pageSize = 20) {
  const { data } = await apiClient.get<AccountListResponse>(
    "/api/v1/admin/accounts",
    { params: { page, page_size: pageSize } }
  )
  return data
}

export async function getAccount(id: string) {
  const { data } = await apiClient.get<AccountResponse>(
    `/api/v1/admin/accounts/${id}`
  )
  return data
}

export async function createAccount(payload: AccountCreate) {
  const { data } = await apiClient.post<AccountResponse>(
    "/api/v1/admin/accounts",
    payload
  )
  return data
}

export async function updateAccount(id: string, payload: AccountUpdate) {
  const { data } = await apiClient.put<AccountResponse>(
    `/api/v1/admin/accounts/${id}`,
    payload
  )
  return data
}

export async function deleteAccount(id: string) {
  await apiClient.delete(`/api/v1/admin/accounts/${id}`)
}

export async function toggleAutoCreate(id: string) {
  const { data } = await apiClient.patch<AccountResponse>(
    `/api/v1/admin/accounts/${id}/toggle-auto-create`
  )
  return data
}
