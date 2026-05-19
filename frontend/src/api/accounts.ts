import apiClient from "./client"
import type { AccountCreate, AccountListResponse, AccountResponse, AccountUpdate } from "@/types"

export const getAccounts = async (page = 1, pageSize = 100) => {
  const { data } = await apiClient.get<AccountListResponse>("/api/v1/admin/accounts", {
    params: { page, page_size: pageSize },
  })
  return data
}

export const getAccount = async (id: string) => {
  const { data } = await apiClient.get<AccountResponse>(`/api/v1/admin/accounts/${id}`)
  return data
}

export const createAccount = async (payload: AccountCreate) => {
  const { data } = await apiClient.post<AccountResponse>("/api/v1/admin/accounts", payload)
  return data
}

export const updateAccount = async (id: string, payload: AccountUpdate) => {
  const { data } = await apiClient.put<AccountResponse>(`/api/v1/admin/accounts/${id}`, payload)
  return data
}

export const deleteAccount = async (id: string) => {
  await apiClient.delete(`/api/v1/admin/accounts/${id}`)
}

export const toggleAutoCreate = async (id: string) => {
  const { data } = await apiClient.patch<AccountResponse>(
    `/api/v1/admin/accounts/${id}/toggle-auto-create`
  )
  return data
}

export const regenerateApiKey = async (id: string) => {
  const { data } = await apiClient.post<AccountResponse>(
    `/api/v1/admin/accounts/${id}/regenerate-key`
  )
  return data
}

export const regenerateWebhookSecret = async (id: string) => {
  const { data } = await apiClient.post<AccountResponse>(
    `/api/v1/admin/accounts/${id}/regenerate-webhook-secret`
  )
  return data
}
