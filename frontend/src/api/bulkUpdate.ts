import apiClient from "./client"
import type { BulkUpdateResponse } from "@/types"

export const downloadUpdateTemplate = async (accountId: string) => {
  const response = await apiClient.get(
    `/api/v1/admin/accounts/${accountId}/leads/update-template`,
    { responseType: "blob" }
  )
  const blob = new Blob([response.data], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = "plantilla_actualizacion.xlsx"
  a.click()
  URL.revokeObjectURL(url)
}

export const bulkUpdateLeads = async (accountId: string, file: File) => {
  const formData = new FormData()
  formData.append("file", file)
  const { data } = await apiClient.post<BulkUpdateResponse>(
    `/api/v1/admin/accounts/${accountId}/leads/bulk-update`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  )
  return data
}
