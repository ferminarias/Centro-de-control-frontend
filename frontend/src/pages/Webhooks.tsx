import { useState } from "react"
import {
  Webhook,
  Plus,
  Pencil,
  Trash2,
  Play,
  History,
  Check,
  X,
  Plus as PlusIcon,
} from "lucide-react"
import { useAccount } from "@/context/AccountContext"
import {
  useWebhooksList,
  useWebhookEvents,
  useCreateWebhook,
  useUpdateWebhook,
  useDeleteWebhook,
  useTestWebhook,
  useWebhookLogs,
} from "@/hooks/useWebhooks"
import { TableSkeleton } from "@/components/ui/Loading"
import ErrorState from "@/components/ui/ErrorState"
import EmptyState from "@/components/ui/EmptyState"
import Badge from "@/components/ui/Badge"
import Modal from "@/components/ui/Modal"
import ConfirmDialog from "@/components/ui/ConfirmDialog"
import Pagination from "@/components/ui/Pagination"
import { formatDate, cn } from "@/lib/utils"
import type { WebhookResponse } from "@/types"

const EVENT_LABELS: Record<string, string> = {
  lead_created: "Lead creado",
  lead_updated: "Lead actualizado",
  lead_deleted: "Lead eliminado",
  lead_moved: "Lead movido",
  lote_imported: "Lote importado",
  lote_associated: "Lote asociado",
}

export default function Webhooks() {
  const { selectedAccount } = useAccount()
  const accountId = selectedAccount?.id ?? ""

  const { data: webhooksData, isLoading, isError, refetch } = useWebhooksList(accountId)
  const { data: availableEvents } = useWebhookEvents()
  const createMutation = useCreateWebhook(accountId)
  const updateMutation = useUpdateWebhook(accountId)
  const deleteMutation = useDeleteWebhook(accountId)
  const testMutation = useTestWebhook()

  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<WebhookResponse | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<WebhookResponse | null>(null)
  const [logsTarget, setLogsTarget] = useState<WebhookResponse | null>(null)

  // Form state
  const [nombre, setNombre] = useState("")
  const [url, setUrl] = useState("")
  const [secret, setSecret] = useState("")
  const [selectedEvents, setSelectedEvents] = useState<Set<string>>(new Set())
  const [headers, setHeaders] = useState<{ key: string; value: string }[]>([])

  const webhooks = webhooksData?.items ?? []
  const events = Array.isArray(availableEvents) ? availableEvents : []

  const resetForm = () => {
    setNombre("")
    setUrl("")
    setSecret("")
    setSelectedEvents(new Set())
    setHeaders([])
  }

  const openCreate = () => {
    setEditing(null)
    resetForm()
    setShowForm(true)
  }

  const openEdit = (wh: WebhookResponse) => {
    setEditing(wh)
    setNombre(wh.nombre)
    setUrl(wh.url)
    setSecret(wh.secret ?? "")
    setSelectedEvents(new Set(wh.eventos))
    const h = wh.headers_custom
      ? Object.entries(wh.headers_custom).map(([key, value]) => ({ key, value }))
      : []
    setHeaders(h)
    setShowForm(true)
  }

  const toggleEvent = (evt: string) => {
    setSelectedEvents((prev) => {
      const next = new Set(prev)
      if (next.has(evt)) next.delete(evt)
      else next.add(evt)
      return next
    })
  }

  const handleSubmit = () => {
    const trimNombre = nombre.trim()
    const trimUrl = url.trim()
    if (!trimNombre || !trimUrl || selectedEvents.size === 0) return

    const headersObj: Record<string, string> = {}
    for (const h of headers) {
      if (h.key.trim()) headersObj[h.key.trim()] = h.value
    }

    if (editing) {
      updateMutation.mutate(
        {
          webhookId: editing.id,
          payload: {
            nombre: trimNombre,
            url: trimUrl,
            eventos: Array.from(selectedEvents),
            headers_custom: Object.keys(headersObj).length > 0 ? headersObj : undefined,
            secret: secret.trim() || undefined,
          },
        },
        { onSuccess: () => setShowForm(false) }
      )
    } else {
      createMutation.mutate(
        {
          nombre: trimNombre,
          url: trimUrl,
          eventos: Array.from(selectedEvents),
          headers_custom: Object.keys(headersObj).length > 0 ? headersObj : undefined,
          secret: secret.trim() || undefined,
        },
        { onSuccess: () => setShowForm(false) }
      )
    }
  }

  const handleToggleActive = (wh: WebhookResponse) => {
    updateMutation.mutate({
      webhookId: wh.id,
      payload: { activo: !wh.activo },
    })
  }

  const isPending = createMutation.isPending || updateMutation.isPending

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Webhooks</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Configura notificaciones HTTP a servicios externos cuando ocurren eventos.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Crear webhook
        </button>
      </div>

      <div className="rounded-xl border border-border bg-white shadow-sm">
        {isLoading ? (
          <div className="p-6"><TableSkeleton rows={4} cols={5} /></div>
        ) : isError ? (
          <ErrorState onRetry={() => refetch()} />
        ) : webhooks.length === 0 ? (
          <EmptyState
            icon={Webhook}
            title="No hay webhooks"
            description="Crea un webhook para recibir notificaciones cuando ocurren eventos en el sistema."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Nombre</th>
                  <th className="px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">URL</th>
                  <th className="px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Eventos</th>
                  <th className="px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {webhooks.map((wh) => (
                  <tr key={wh.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-foreground">{wh.nombre}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground font-mono text-xs max-w-[250px] truncate">
                      {wh.url}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {wh.eventos.slice(0, 3).map((evt) => (
                          <Badge key={evt} variant="info" className="text-[10px]">
                            {EVENT_LABELS[evt] ?? evt}
                          </Badge>
                        ))}
                        {wh.eventos.length > 3 && (
                          <Badge variant="default" className="text-[10px]">+{wh.eventos.length - 3}</Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleActive(wh)}
                        className="cursor-pointer"
                      >
                        <Badge variant={wh.activo ? "success" : "danger"}>
                          {wh.activo ? "Activo" : "Inactivo"}
                        </Badge>
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => testMutation.mutate(wh.id)}
                          disabled={testMutation.isPending}
                          className="inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium text-green-600 hover:bg-green-50 transition-colors"
                          title="Enviar test"
                        >
                          <Play className="h-3.5 w-3.5" />
                          Test
                        </button>
                        <button
                          onClick={() => setLogsTarget(wh)}
                          className="inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                          title="Ver historial"
                        >
                          <History className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => openEdit(wh)}
                          className="inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium text-primary hover:bg-primary/10 transition-colors"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(wh)}
                          className="inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit modal */}
      <Modal open={showForm} onOpenChange={setShowForm} title={editing ? "Editar webhook" : "Crear webhook"} wide>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Nombre</label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Notificar CRM externo"
                className="w-full rounded-lg border border-border bg-white px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Secret (HMAC)</label>
              <input
                type="text"
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
                placeholder="Opcional — para firma de seguridad"
                className="w-full rounded-lg border border-border bg-white px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">URL destino</label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://api.ejemplo.com/webhook"
              className="w-full rounded-lg border border-border bg-white px-4 py-2.5 text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* Events */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Eventos</label>
            <div className="flex flex-wrap gap-2">
              {events.map((evt) => {
                const selected = selectedEvents.has(evt)
                return (
                  <button
                    key={evt}
                    type="button"
                    onClick={() => toggleEvent(evt)}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
                      selected
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:border-primary hover:text-primary"
                    )}
                  >
                    {selected && <Check className="h-3 w-3" />}
                    {EVENT_LABELS[evt] ?? evt}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Custom headers */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-foreground">Headers personalizados</label>
              <button
                type="button"
                onClick={() => setHeaders([...headers, { key: "", value: "" }])}
                className="text-xs text-primary hover:text-primary/80 font-medium"
              >
                + Agregar header
              </button>
            </div>
            {headers.length === 0 ? (
              <p className="text-xs text-muted-foreground">Sin headers adicionales.</p>
            ) : (
              <div className="space-y-2">
                {headers.map((h, i) => (
                  <div key={i} className="flex gap-2">
                    <input
                      type="text"
                      value={h.key}
                      onChange={(e) => {
                        const next = [...headers]
                        next[i] = { ...next[i], key: e.target.value }
                        setHeaders(next)
                      }}
                      placeholder="Header-Name"
                      className="flex-1 rounded-lg border border-border bg-white px-3 py-2 text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                    <input
                      type="text"
                      value={h.value}
                      onChange={(e) => {
                        const next = [...headers]
                        next[i] = { ...next[i], value: e.target.value }
                        setHeaders(next)
                      }}
                      placeholder="Value"
                      className="flex-1 rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                    <button
                      type="button"
                      onClick={() => setHeaders(headers.filter((_, j) => j !== i))}
                      className="rounded-lg p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setShowForm(false)}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={!nombre.trim() || !url.trim() || selectedEvents.size === 0 || isPending}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {isPending ? "Guardando..." : editing ? "Guardar cambios" : "Crear webhook"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete confirm */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Eliminar webhook"
        description={`Se eliminara el webhook "${deleteTarget?.nombre}" y todo su historial de entregas. Esta accion no se puede deshacer.`}
        confirmLabel="Eliminar"
        variant="danger"
        onConfirm={() => {
          if (deleteTarget) deleteMutation.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) })
        }}
        loading={deleteMutation.isPending}
      />

      {/* Logs modal */}
      {logsTarget && (
        <WebhookLogsModal webhook={logsTarget} onClose={() => setLogsTarget(null)} />
      )}
    </div>
  )
}

// ── Webhook Logs Modal ──

function WebhookLogsModal({ webhook, onClose }: { webhook: WebhookResponse; onClose: () => void }) {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const { data, isLoading, isError, refetch } = useWebhookLogs(webhook.id, page, pageSize)
  const logs = data?.items ?? []

  return (
    <Modal open onOpenChange={(o) => !o && onClose()} title={`Historial: ${webhook.nombre}`} wide>
      <div className="max-h-[60vh] overflow-auto">
        {isLoading ? (
          <TableSkeleton rows={5} cols={5} />
        ) : isError ? (
          <ErrorState onRetry={() => refetch()} />
        ) : logs.length === 0 ? (
          <EmptyState icon={History} title="Sin registros" description="No hay entregas registradas para este webhook." />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="px-4 py-2 text-xs font-medium text-muted-foreground uppercase">Fecha</th>
                    <th className="px-4 py-2 text-xs font-medium text-muted-foreground uppercase">Evento</th>
                    <th className="px-4 py-2 text-xs font-medium text-muted-foreground uppercase">Status</th>
                    <th className="px-4 py-2 text-xs font-medium text-muted-foreground uppercase">Latencia</th>
                    <th className="px-4 py-2 text-xs font-medium text-muted-foreground uppercase">Error</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">
                        {formatDate(log.created_at)}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="info" className="text-[10px]">
                          {EVENT_LABELS[log.evento] ?? log.evento}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        {log.status_code ? (
                          <Badge variant={log.status_code < 400 ? "success" : "danger"}>
                            {log.status_code}
                          </Badge>
                        ) : (
                          <Badge variant="danger">Error</Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {log.duration_ms != null ? `${log.duration_ms}ms` : "—"}
                      </td>
                      <td className="px-4 py-3 text-sm text-red-600 max-w-[200px] truncate">
                        {log.error ?? "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-2 pb-2">
              <Pagination
                page={page}
                pageSize={pageSize}
                total={data?.total ?? 0}
                onPageChange={setPage}
                onPageSizeChange={(s) => { setPageSize(s); setPage(1) }}
              />
            </div>
          </>
        )}
      </div>
    </Modal>
  )
}
