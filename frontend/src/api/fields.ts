import apiClient from "./client"
import type {
  FieldCreate,
  FieldListResponse,
  FieldResponse,
  FieldUpdate,
} from "@/types"

export async function getFields(accountId: string, page = 1, pageSize = 50) {
  const { data } = await apiClient.get<FieldListResponse>(
    `/api/v1/admin/accounts/${accountId}/fields`,
    { params: { page, page_size: pageSize } }
  )
  return data
}

export async function createField(accountId: string, payload: FieldCreate) {
  const { data } = await apiClient.post<FieldResponse>(
    `/api/v1/admin/accounts/${accountId}/fields`,
    payload
  )
  return data
}

export async function updateField(fieldId: string, payload: FieldUpdate) {
  const { data } = await apiClient.put<FieldResponse>(
    `/api/v1/admin/fields/${fieldId}`,
    payload
  )
  return data
}

export async function deleteField(fieldId: string) {
  await apiClient.delete(`/api/v1/admin/fields/${fieldId}`)
}
