import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { ArrowLeft, Pencil, Trash2 } from "lucide-react"
import * as Tabs from "@radix-ui/react-tabs"
import { toast } from "sonner"
import { getAccount, updateAccount, deleteAccount, toggleAutoCreate } from "@/api/accounts"
import { Spinner } from "@/components/ui/Loading"
import ErrorState from "@/components/ui/ErrorState"
import Badge from "@/components/ui/Badge"
import CopyButton from "@/components/ui/CopyButton"
import ConfirmDialog from "@/components/ui/ConfirmDialog"
import Modal from "@/components/ui/Modal"
import FieldsTab from "@/components/fields/FieldsTab"
import RecordsTab from "@/components/records/RecordsTab"
import WebhookTestTab from "@/components/records/WebhookTestTab"
import { WEBHOOK_BASE_URL } from "@/lib/utils"

export default function AccountDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [showDelete, setShowDelete] = useState(false)
  const [showToggle, setShowToggle] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [editName, setEditName] = useState("")

  const { data: account, isLoading, isError, refetch } = useQuery({
    queryKey: ["account", id],
    queryFn: () => getAccount(id!),
    enabled: !!id,
  })

  const deleteMutation = useMutation({
    mutationFn: () => deleteAccount(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] })
      toast.success("Cuenta eliminada")
      navigate("/accounts")
    },
    onError: () => toast.error("Error al eliminar la cuenta"),
  })

  const toggleMutation = useMutation({
    mutationFn: () => toggleAutoCreate(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["account", id] })
      queryClient.invalidateQueries({ queryKey: ["accounts"] })
      toast.success("Auto-crear campos actualizado")
      setShowToggle(false)
    },
    onError: () => toast.error("Error al cambiar auto-crear campos"),
  })

  const updateMutation = useMutation({
    mutationFn: (nombre: string) => updateAccount(id!, { nombre }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["account", id] })
      queryClient.invalidateQueries({ queryKey: ["accounts"] })
      toast.success("Nombre actualizado")
      setShowEdit(false)
    },
    onError: () => toast.error("Error al actualizar el nombre"),
  })

  if (isLoading) return <Spinner />
  if (isError || !account) return <ErrorState onRetry={() => refetch()} />

  const webhookUrl = `${WEBHOOK_BASE_URL}/api/v1/ingest/${account.api_key}`

  return (
    <div>
      {/* Back button */}
      <button
        onClick={() => navigate("/accounts")}
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a cuentas
      </button>

      {/* Header */}
      <div className="rounded-xl border border-border bg-card p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold">{account.nombre}</h2>
            <button
              onClick={() => { setEditName(account.nombre); setShowEdit(true) }}
              className="rounded-md p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              title="Editar nombre"
            >
              <Pencil className="h-4 w-4" />
            </button>
            <Badge variant={account.activo ? "success" : "danger"}>
              {account.activo ? "Activo" : "Inactivo"}
            </Badge>
          </div>
          <button
            onClick={() => setShowDelete(true)}
            className="flex items-center gap-1.5 rounded-lg border border-destructive/30 px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            Eliminar
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">API Key</label>
            <div className="flex items-center gap-2 mt-1 rounded-lg bg-muted p-3 font-mono text-sm">
              <span className="flex-1 break-all">{account.api_key}</span>
              <CopyButton text={account.api_key} />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">URL Webhook</label>
            <div className="flex items-center gap-2 mt-1 rounded-lg bg-muted p-3 font-mono text-xs">
              <span className="flex-1 break-all">{webhookUrl}</span>
              <CopyButton text={webhookUrl} />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border">
          <span className="text-sm text-muted-foreground">Auto-crear campos:</span>
          <button
            onClick={() => setShowToggle(true)}
            className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
              account.auto_crear_campos ? "bg-green-500" : "bg-muted"
            }`}
            role="switch"
            aria-checked={account.auto_crear_campos}
          >
            <span
              className={`pointer-events-none block h-6 w-6 rounded-full bg-white shadow-lg transition-transform ${
                account.auto_crear_campos ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
          <Badge variant={account.auto_crear_campos ? "success" : "danger"}>
            {account.auto_crear_campos ? "ON" : "OFF"}
          </Badge>
        </div>
      </div>

      {/* Tabs */}
      <Tabs.Root defaultValue="fields">
        <Tabs.List className="flex border-b border-border mb-0">
          <Tabs.Trigger
            value="fields"
            className="px-4 py-3 text-sm font-medium text-muted-foreground data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary transition-colors -mb-px"
          >
            Campos
          </Tabs.Trigger>
          <Tabs.Trigger
            value="records"
            className="px-4 py-3 text-sm font-medium text-muted-foreground data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary transition-colors -mb-px"
          >
            Registros
          </Tabs.Trigger>
          <Tabs.Trigger
            value="test"
            className="px-4 py-3 text-sm font-medium text-muted-foreground data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary transition-colors -mb-px"
          >
            Test Webhook
          </Tabs.Trigger>
        </Tabs.List>

        <div className="rounded-b-xl border border-t-0 border-border bg-card">
          <Tabs.Content value="fields">
            <FieldsTab accountId={id!} />
          </Tabs.Content>
          <Tabs.Content value="records">
            <RecordsTab accountId={id!} />
          </Tabs.Content>
          <Tabs.Content value="test">
            <WebhookTestTab apiKey={account.api_key} />
          </Tabs.Content>
        </div>
      </Tabs.Root>

      {/* Delete confirmation */}
      <ConfirmDialog
        open={showDelete}
        onOpenChange={setShowDelete}
        title="Eliminar cuenta"
        description={`¿Estas seguro de eliminar la cuenta "${account.nombre}"? Esta accion desactivara la cuenta.`}
        confirmLabel="Eliminar"
        variant="danger"
        onConfirm={() => deleteMutation.mutate()}
        loading={deleteMutation.isPending}
      />

      {/* Toggle confirmation */}
      <ConfirmDialog
        open={showToggle}
        onOpenChange={setShowToggle}
        title="Cambiar auto-crear campos"
        description={`¿Cambiar auto-crear campos a ${account.auto_crear_campos ? "OFF" : "ON"}? ${
          account.auto_crear_campos
            ? "Los campos nuevos ya no se crearan automaticamente."
            : "Se crearan campos automaticamente al recibir datos nuevos."
        }`}
        confirmLabel="Confirmar"
        onConfirm={() => toggleMutation.mutate()}
        loading={toggleMutation.isPending}
      />

      {/* Edit name modal */}
      <Modal open={showEdit} onOpenChange={setShowEdit} title="Editar nombre">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            if (editName.trim()) updateMutation.mutate(editName.trim())
          }}
          className="space-y-4"
        >
          <div>
            <label className="text-sm font-medium text-foreground">Nombre</label>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-muted px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              required
            />
          </div>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowEdit(false)}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-accent transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={updateMutation.isPending || !editName.trim()}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {updateMutation.isPending ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
