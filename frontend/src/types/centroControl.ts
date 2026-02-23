export interface TipificacionExterna {
  id: string
  cuenta_id: string
  lead_id: string | null
  email: string
  id_neotel: string
  id_subresolucion: string
  matched: boolean
  created_at: string
}

export interface TipificacionExternaListResponse {
  items: TipificacionExterna[]
  total: number
  page: number
  page_size: number
}

export interface RetryMatchResponse {
  total_pendientes: number
  matched: number
  still_pending: number
}
