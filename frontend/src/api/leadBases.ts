import apiClient from "./client"
import type {
  LeadBaseCreate,
  LeadBaseListResponse,
  LeadBaseResponse,
  LeadBaseUpdate,
  LeadListResponse,
} from "@/types"

export const getLeadBases = async (accountId: string) => {
  const { data } = await apiClient.get<LeadBaseListResponse>(
    `/api/v1/admin/accounts/${accountId}/bases`
  )
  return data
}

export const getLeadBase = async (baseId: string) => {
  const { data } = await apiClient.get<LeadBaseResponse>(`/api/v1/admin/bases/${baseId}`)
  return data
}

export const createLeadBase = async (accountId: string, payload: LeadBaseCreate) => {
  const { data } = await apiClient.post<LeadBaseResponse>(
    `/api/v1/admin/accounts/${accountId}/bases`,
    payload
  )
  return data
}

export const updateLeadBase = async (baseId: string, payload: LeadBaseUpdate) => {
  const { data } = await apiClient.put<LeadBaseResponse>(
    `/api/v1/admin/bases/${baseId}`,
    payload
  )
  return data
}

export const deleteLeadBase = async (baseId: string) => {
  await apiClient.delete(`/api/v1/admin/bases/${baseId}`)
}

export const getLeadsByBase = async (accountId: string, baseId: string, page = 1, pageSize = 20) => {
  const { data } = await apiClient.get<LeadListResponse>(
    `/api/v1/admin/accounts/${accountId}/bases/${baseId}/leads`,
    { params: { page, page_size: pageSize } }
  )
  return data
}
