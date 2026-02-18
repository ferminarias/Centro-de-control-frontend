import apiClient from "./client"
import type {
  WebhookResponse,
  WebhookListResponse,
  WebhookCreate,
  WebhookUpdate,
  WebhookLogListResponse,
  WebhookTestResponse,
} from "@/types"

export const getWebhooks = async (accountId: string) => {
  const { data } = await apiClient.get<WebhookListResponse>(
    `/api/v1/admin/accounts/${accountId}/webhooks`
  )
  return data
}

export const getWebhook = async (webhookId: string) => {
  const { data } = await apiClient.get<WebhookResponse>(
    `/api/v1/admin/webhooks/${webhookId}`
  )
  return data
}

export const createWebhook = async (accountId: string, payload: WebhookCreate) => {
  const { data } = await apiClient.post<WebhookResponse>(
    `/api/v1/admin/accounts/${accountId}/webhooks`,
    payload
  )
  return data
}

export const updateWebhook = async (webhookId: string, payload: WebhookUpdate) => {
  const { data } = await apiClient.put<WebhookResponse>(
    `/api/v1/admin/webhooks/${webhookId}`,
    payload
  )
  return data
}

export const deleteWebhook = async (webhookId: string) => {
  await apiClient.delete(`/api/v1/admin/webhooks/${webhookId}`)
}

export const testWebhook = async (webhookId: string) => {
  const { data } = await apiClient.post<WebhookTestResponse>(
    `/api/v1/admin/webhooks/${webhookId}/test`
  )
  return data
}

export const getWebhookLogs = async (webhookId: string, page = 1, pageSize = 20) => {
  const { data } = await apiClient.get<WebhookLogListResponse>(
    `/api/v1/admin/webhooks/${webhookId}/logs`,
    { params: { page, page_size: pageSize } }
  )
  return data
}

export const getWebhookEvents = async (): Promise<string[]> => {
  const { data } = await apiClient.get(
    `/api/v1/admin/webhook-events`
  )
  // Handle both array response and { events: [...] } response
  if (Array.isArray(data)) return data
  if (data?.events && Array.isArray(data.events)) return data.events
  return []
}
