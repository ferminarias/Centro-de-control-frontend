import { useState } from "react"
import { Plus, Pencil, Trash2, Headphones, ChevronDown } from "lucide-react"
import { useAccount } from "@/context/AccountContext"
import { useAgents, useCreateAgent, useUpdateAgent, useDeleteAgent, useUpdateAgentStatus } from "@/hooks/useVoip"
import { TableSkeleton } from "@/components/ui/Loading"
import ErrorState from "@/components/ui/ErrorState"
import EmptyState from "@/components/ui/EmptyState"
import Badge from "@/components/ui/Badge"
import Modal from "@/components/ui/Modal"
import ConfirmDialog from "@/components/ui/ConfirmDialog"
import { formatDate } from "@/lib/utils"
import type { AgentResponse, AgentStatus } from "@/types"

const STATUS_OPTIONS: { value: AgentStatus; label: string }[] = [
  { value: "offline", label: "Offline" },
  { value: "available", label: "Disponible" },
  { value: "on_call", label: "En llamada" },
  { value: "wrap_up", label: "Wrap-up" },
  { value: "paused", label: "Pausado" },
]

const statusVariant = (s: AgentStatus): "default" | "success" | "danger" | "warning" | "info" => {
  switch (s) {
    case "available": return "success"
    case "on_call": return "info"
    case "wrap_up": return "warning"
    case "paused": return "warning"
    case "offline": return "danger"
    default: return "default"
  }
}

export default function VoipAgents() {
  const { selectedAccount } = useAccount()
  const accountId = selectedAccount?.id ?? ""

  const { data, isLoading, isError, refetch } = useAgents(accountId || undefined)
  const createMut = useCreateAgent(accountId)
  const updateMut = useUpdateAgent(accountId)
  const deleteMut = useDeleteAgent(accountId)
  const statusMut = useUpdateAgentStatus(accountId)

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<AgentResponse | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<AgentResponse | null>(null)

  const [form, setForm] = useState({ nombre: "", extension: "", activo: true })

  const agents = data?.items ?? []

  const openCreate = () => {
    setEditing(null)
    setForm({ nombre: "", extension: "", activo: true })
    setModalOpen(true)
  }

  const openEdit = (a: AgentResponse) => {
    setEditing(a)
    setForm({ nombre: a.nombre, extension: a.extension, activo: a.activo })
    setModalOpen(true)
  }

  const handleSubmit = () => {
    if (!form.nombre || !form.extension) return
    if (editing) {
      updateMut.mutate({ id: editing.id, payload: form }, { onSuccess: () => setModalOpen(false) })
    } else {
      createMut.mutate({ nombre: form.nombre, extension: form.extension }, { onSuccess: () => setModalOpen(false) })
    }
  }

  const handleDelete = () => {
    if (!deleteTarget) return
    deleteMut.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) })
  }

  const handleStatusChange = (agentId: string, estado: string) => {
    statusMut.mutate({ id: agentId, estado })
  }

  if (!selectedAccount) return null

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Agentes</h2>
          <p className="text-sm text-muted-foreground mt-1">Gestiona los agentes del call center.</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary/90 transition-colors">
          <Plus className="h-4 w-4" /> Nuevo agente
        </button>
      </div>

      <div className="rounded-xl border border-border bg-white shadow-sm">
        {isLoading ? (
          <div className="p-6"><TableSkeleton rows={4} cols={6} /></div>
        ) : isError ? (
          <ErrorState onRetry={() => refetch()} />
        ) : agents.length === 0 ? (
          <EmptyState icon={Headphones} title="Sin agentes" description="Agrega tu primer agente de call center." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Nombre</th>
                  <th className="px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Extension</th>
                  <th className="px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Activo</th>
                  <th className="px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Creado</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {agents.map((a) => (
                  <tr key={a.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-foreground">{a.nombre}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground font-mono">{a.extension}</td>
                    <td className="px-6 py-4">
                      <div className="relative inline-block">
                        <select
                          value={a.estado}
                          onChange={(e) => handleStatusChange(a.id, e.target.value)}
                          className="appearance-none rounded-full bg-transparent pr-6 pl-1 py-0.5 text-xs font-medium cursor-pointer focus:outline-none"
                        >
                          {STATUS_OPTIONS.map((s) => (
                            <option key={s.value} value={s.value}>{s.label}</option>
                          ))}
                        </select>
                        <Badge variant={statusVariant(a.estado)} className="pointer-events-none absolute inset-0">
                          {STATUS_OPTIONS.find((s) => s.value === a.estado)?.label ?? a.estado}
                        </Badge>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={a.activo ? "success" : "danger"}>{a.activo ? "Activo" : "Inactivo"}</Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{formatDate(a.created_at)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEdit(a)} className="rounded-md p-1.5 text-gray-400 hover:text-foreground hover:bg-gray-100 transition-colors"><Pencil className="h-4 w-4" /></button>
                        <button onClick={() => setDeleteTarget(a)} className="rounded-md p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={modalOpen} onOpenChange={setModalOpen} title={editing ? "Editar agente" : "Nuevo agente"}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Nombre</label>
            <input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} className="w-full rounded-lg border border-border bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" placeholder="Juan Perez" />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Extension</label>
            <input value={form.extension} onChange={(e) => setForm({ ...form, extension: e.target.value })} className="w-full rounded-lg border border-border bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" placeholder="1001" />
          </div>
          {editing && (
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.activo} onChange={(e) => setForm({ ...form, activo: e.target.checked })} className="rounded border-border" />
              Activo
            </label>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setModalOpen(false)} className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-gray-50 transition-colors">Cancelar</button>
            <button onClick={handleSubmit} disabled={createMut.isPending || updateMut.isPending} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-colors disabled:opacity-50">
              {(createMut.isPending || updateMut.isPending) ? "Guardando..." : editing ? "Actualizar" : "Crear"}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)} title="Eliminar agente" description={`Se eliminara el agente "${deleteTarget?.nombre}". Esta accion no se puede deshacer.`} confirmLabel="Eliminar" variant="danger" onConfirm={handleDelete} loading={deleteMut.isPending} />
    </div>
  )
}
