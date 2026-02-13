import apiClient from "./client"

interface MoveLeadsPayload {
  lead_ids: string[]
  target_base_id: string
}

interface MoveLeadsResponse {
  moved: number
}

export const moveLeads = async (payload: MoveLeadsPayload) => {
  const { data } = await apiClient.post<MoveLeadsResponse>(
    "/api/v1/admin/bases/move-leads",
    payload
  )
  return data
}
