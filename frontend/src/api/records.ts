import apiClient from "./client"
import type { IngestResponse, RecordListResponse, RecordResponse } from "@/types"

export async function getRecords(accountId: string, page = 1, pageSize = 20) {
  const { data } = await apiClient.get<RecordListResponse>(
    `/api/v1/admin/accounts/${accountId}/records`,
    { params: { page, page_size: pageSize } }
  )
  return data
}

export async function getRecord(recordId: string) {
  const { data } = await apiClient.get<RecordResponse>(
    `/api/v1/admin/records/${recordId}`
  )
  return data
}

export async function sendTestWebhook(apiKey: string, payload: unknown) {
  const { data } = await apiClient.post<IngestResponse>(
    `/api/v1/ingest/${apiKey}`,
    payload
  )
  return data
}
