import apiClient from "./client"
import type { LeadListResponse, LeadResponse } from "@/types"

export const getLeads = async (accountId: string, page = 1, pageSize = 20) => {
  const { data } = await apiClient.get<LeadListResponse>(
    `/api/v1/admin/accounts/${accountId}/leads`,
    { params: { page, page_size: pageSize } }
  )
  return data
}

export const getLead = async (leadId: string) => {
  const { data } = await apiClient.get<LeadResponse>(`/api/v1/admin/leads/${leadId}`)
  return data
}
