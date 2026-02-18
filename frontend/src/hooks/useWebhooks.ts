import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  getWebhooks,
  createWebhook,
  updateWebhook,
  deleteWebhook,
  testWebhook,
  getWebhookLogs,
  getWebhookEvents,
} from "@/api/webhooks"
import type { WebhookCreate, WebhookUpdate } from "@/types"
import { toast } from "sonner"

export function useWebhooksList(accountId: string | undefined) {
  return useQuery({
    queryKey: ["webhooks", accountId],
    queryFn: () => getWebhooks(accountId!),
    enabled: !!accountId,
  })
}

export function useWebhookEvents() {
  return useQuery({
    queryKey: ["webhookEvents"],
    queryFn: getWebhookEvents,
  })
}

export function useCreateWebhook(accountId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: WebhookCreate) => createWebhook(accountId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["webhooks", accountId] })
      toast.success("Webhook creado exitosamente")
    },
    onError: () => toast.error("Error al crear el webhook"),
  })
}

export function useUpdateWebhook(accountId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ webhookId, payload }: { webhookId: string; payload: WebhookUpdate }) =>
      updateWebhook(webhookId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["webhooks", accountId] })
      toast.success("Webhook actualizado")
    },
    onError: () => toast.error("Error al actualizar el webhook"),
  })
}

export function useDeleteWebhook(accountId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (webhookId: string) => deleteWebhook(webhookId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["webhooks", accountId] })
      toast.success("Webhook eliminado")
    },
    onError: () => toast.error("Error al eliminar el webhook"),
  })
}

export function useTestWebhook() {
  return useMutation({
    mutationFn: (webhookId: string) => testWebhook(webhookId),
    onSuccess: (data) => {
      if (data.error) {
        toast.error(`Test fallido: ${data.error}`)
      } else {
        toast.success(`Test exitoso — Status ${data.status_code} (${data.duration_ms}ms)`)
      }
    },
    onError: () => toast.error("Error al enviar el test"),
  })
}

export function useWebhookLogs(webhookId: string | undefined, page = 1, pageSize = 20) {
  return useQuery({
    queryKey: ["webhookLogs", webhookId, page, pageSize],
    queryFn: () => getWebhookLogs(webhookId!, page, pageSize),
    enabled: !!webhookId,
  })
}
