import apiClient from "./client"
import type {
  LoteResponse,
  LoteListResponse,
  LoteAssociateResponse,
  LeadListResponse,
} from "@/types"

export const downloadLoteTemplate = async (accountId: string) => {
  const response = await apiClient.get(
    `/api/v1/admin/accounts/${accountId}/lotes/template`,
    { responseType: "blob" }
  )
  const blob = new Blob([response.data], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = "plantilla_lote.xlsx"
  a.click()
  URL.revokeObjectURL(url)
}

export const importLote = async (accountId: string, file: File, nombre: string) => {
  const formData = new FormData()
  formData.append("file", file)
  formData.append("nombre", nombre)
  const { data } = await apiClient.post<LoteResponse>(
    `/api/v1/admin/accounts/${accountId}/lotes/import`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  )
  return data
}

export const getLotes = async (accountId: string) => {
  const { data } = await apiClient.get<LoteListResponse>(
    `/api/v1/admin/accounts/${accountId}/lotes`
  )
  return data
}

export const getLote = async (loteId: string) => {
  const { data } = await apiClient.get<LoteResponse>(
    `/api/v1/admin/lotes/${loteId}`
  )
  return data
}

export const deleteLote = async (loteId: string) => {
  await apiClient.delete(`/api/v1/admin/lotes/${loteId}`)
}

export const associateLote = async (
  loteId: string,
  leadBaseId: string | null
) => {
  const { data } = await apiClient.put<LoteAssociateResponse>(
    `/api/v1/admin/lotes/${loteId}/associate`,
    { lead_base_id: leadBaseId }
  )
  return data
}

export const getLoteLeads = async (
  loteId: string,
  page = 1,
  pageSize = 20
) => {
  const { data } = await apiClient.get<LeadListResponse>(
    `/api/v1/admin/lotes/${loteId}/leads`,
    { params: { page, page_size: pageSize } }
  )
  return data
}
