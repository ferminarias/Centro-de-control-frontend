/**
 * Hooks para el Módulo Centro de Control — Tipificaciones Externas (Neotel)
 */
import { useState, useEffect, useRef, useCallback } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { fetchEventSource } from "@microsoft/fetch-event-source"
import { apiClient } from "@/api/client"
import { useToast } from "@/hooks/useToast"
import type {
  TipificacionExterna,
  TipificacionExternaListResponse,
  RetryMatchResponse,
} from "@/types/centroControl"

// =============================================================================
// SSE Feed en Vivo
// =============================================================================

export function useCentroControlFeed(accountId: string | undefined) {
  const [tipificaciones, setTipificaciones] = useState<TipificacionExterna[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const controllerRef = useRef<AbortController | null>(null)

  const connect = useCallback(() => {
    if (!accountId) return

    controllerRef.current?.abort()
    const ctrl = new AbortController()
    controllerRef.current = ctrl

    const baseURL = apiClient.defaults.baseURL || ""
    const token = localStorage.getItem("token")
    const url = `${baseURL}/api/v1/admin/accounts/${accountId}/centro-control/feed`

    fetchEventSource(url, {
      signal: ctrl.signal,
      headers: {
        Authorization: `Bearer ${token}`,
      },
      onopen: async (response) => {
        if (response.ok) {
          setIsConnected(true)
          setError(null)
        } else {
          throw new Error(`SSE error: ${response.status}`)
        }
      },
      onmessage: (evt) => {
        if (evt.event === "init") {
          const items: TipificacionExterna[] = JSON.parse(evt.data)
          setTipificaciones(items)
        } else if (evt.event === "nueva_tipificacion") {
          const item: TipificacionExterna = JSON.parse(evt.data)
          setTipificaciones((prev) => [item, ...prev])
        }
      },
      onerror: (err) => {
        setIsConnected(false)
        setError(err instanceof Error ? err.message : "Error de conexión SSE")
        // Return to let fetchEventSource handle retry
      },
      onclose: () => {
        setIsConnected(false)
      },
    })
  }, [accountId])

  useEffect(() => {
    connect()
    return () => {
      controllerRef.current?.abort()
    }
  }, [connect])

  return { tipificaciones, isConnected, error }
}

// =============================================================================
// Lista paginada de tipificaciones externas
// =============================================================================

interface TipificacionesFilters {
  matched?: boolean
  page?: number
  page_size?: number
}

export function useTipificacionesExternas(
  accountId: string | undefined,
  filters: TipificacionesFilters = {}
) {
  const params = new URLSearchParams()
  if (filters.matched !== undefined) params.append("matched", String(filters.matched))
  if (filters.page) params.append("page", String(filters.page))
  if (filters.page_size) params.append("page_size", String(filters.page_size))

  return useQuery({
    queryKey: ["centro-control", "tipificaciones", accountId, filters],
    queryFn: async () => {
      const { data } = await apiClient.get<TipificacionExternaListResponse>(
        `/api/v1/admin/accounts/${accountId}/centro-control/tipificaciones?${params.toString()}`
      )
      return data
    },
    enabled: !!accountId,
  })
}

// =============================================================================
// Solo pendientes (matched=false)
// =============================================================================

export function usePendientes(
  accountId: string | undefined,
  filters: { page?: number; page_size?: number } = {}
) {
  return useTipificacionesExternas(accountId, {
    matched: false,
    ...filters,
  })
}

// =============================================================================
// Retry Match (POST mutation)
// =============================================================================

export function useRetryMatch(accountId: string | undefined) {
  const queryClient = useQueryClient()
  const { success, error } = useToast()

  return useMutation({
    mutationFn: async () => {
      const { data } = await apiClient.post<RetryMatchResponse>(
        `/api/v1/admin/accounts/${accountId}/centro-control/retry-match`
      )
      return data
    },
    onSuccess: (data) => {
      success(
        `Match completado: ${data.matched} matcheados, ${data.still_pending} pendientes`
      )
      queryClient.invalidateQueries({ queryKey: ["centro-control", "tipificaciones", accountId] })
    },
    onError: () => {
      error("Error al reintentar match")
    },
  })
}

// =============================================================================
// Historial de tipificaciones externas de un lead
// =============================================================================

export function useLeadTipificacionesExternas(leadId: string | null | undefined) {
  return useQuery({
    queryKey: ["centro-control", "lead-tipificaciones", leadId],
    queryFn: async () => {
      const { data } = await apiClient.get<TipificacionExterna[]>(
        `/api/v1/admin/leads/${leadId}/tipificaciones-externas`
      )
      return data
    },
    enabled: !!leadId,
  })
}
