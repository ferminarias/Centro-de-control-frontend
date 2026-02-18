import { useState } from "react"
import { Plus, Pencil, Trash2, Megaphone, Play, Pause, Square, ChevronDown, Eye } from "lucide-react"
import { useAccount } from "@/context/AccountContext"
import { useCampaigns, useCreateCampaign, useUpdateCampaign, useDeleteCampaign, useCampaignControl, useSipTrunks } from "@/hooks/useVoip"
import { TableSkeleton } from "@/components/ui/Loading"
import ErrorState from "@/components/ui/ErrorState"
import EmptyState from "@/components/ui/EmptyState"
import Badge from "@/components/ui/Badge"
import Modal from "@/components/ui/Modal"
import ConfirmDialog from "@/components/ui/ConfirmDialog"
import { formatDate } from "@/lib/utils"
import type { CampaignResponse, CampaignStatus, CampaignMode } from "@/types"
import { useNavigate } from "react-router-dom"

const statusVariant = (s: CampaignStatus): "default" | "success" | "danger" | "warning" | "info" => {
  switch (s) {
    case "running": return "success"
    case "paused": return "warning"
    case "completed": return "info"
    case "idle": return "default"
    default: return "default"
  }
}

const statusLabel = (s: CampaignStatus) => {
  switch (s) {
    case "running": return "En curso"
    case "paused": return "Pausada"
    case "completed": return "Completada"
    case "idle": return "Inactiva"
    default: return s
  }
}

const modeLabel = (m: CampaignMode) => {
  switch (m) {
    case "manual": return "Manual"
    case "progressive": return "Progresivo"
    case "predictive": return "Predictivo"
    default: return m
  }
}

export default function Campaigns() {
  const { selectedAccount } = useAccount()
  const accountId = selectedAccount?.id ?? ""
  const navigate = useNavigate()

  const { data, isLoading, isError, refetch } = useCampaigns(accountId || undefined)
  const { data: trunksData } = useSipTrunks(accountId || undefined)
  const createMut = useCreateCampaign(accountId)
  const updateMut = useUpdateCampaign(accountId)
  const deleteMut = useDeleteCampaign(accountId)
  const controlMut = useCampaignControl(accountId)

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<CampaignResponse | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<CampaignResponse | null>(null)

  const [form, setForm] = useState({ nombre: "", descripcion: "", modo: "progressive" as CampaignMode, trunk_id: "", caller_id: "", max_concurrent: 5 })

  const campaigns = data?.items ?? []
  const trunks = trunksData?.items ?? []

  const openCreate = () => {
    setEditing(null)
    setForm({ nombre: "", descripcion: "", modo: "progressive", trunk_id: trunks[0]?.id ?? "", caller_id: "", max_concurrent: 5 })
    setModalOpen(true)
  }

  const openEdit = (c: CampaignResponse) => {
    setEditing(c)
    setForm({
      nombre: c.nombre,
      descripcion: c.descripcion ?? "",
      modo: c.modo,
      trunk_id: c.trunk_id ?? "",
      caller_id: c.caller_id ?? "",
      max_concurrent: c.max_concurrent,
    })
    setModalOpen(true)
  }

  const handleSubmit = () => {
    if (!form.nombre) return
    const payload = {
      nombre: form.nombre,
      descripcion: form.descripcion || undefined,
      modo: form.modo,
      trunk_id: form.trunk_id || undefined,
      caller_id: form.caller_id || undefined,
      max_concurrent: form.max_concurrent,
    }
    if (editing) {
      updateMut.mutate({ id: editing.id, payload }, { onSuccess: () => setModalOpen(false) })
    } else {
      createMut.mutate(payload as never, { onSuccess: () => setModalOpen(false) })
    }
  }

  const handleDelete = () => {
    if (!deleteTarget) return
    deleteMut.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) })
  }

  const handleControl = (id: string, action: "start" | "pause" | "stop") => {
    controlMut.mutate({ id, action })
  }

  if (!selectedAccount) return null

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Campanas</h2>
          <p className="text-sm text-muted-foreground mt-1">Gestiona las campanas de llamadas.</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary/90 transition-colors">
          <Plus className="h-4 w-4" /> Nueva campana
        </button>
      </div>

      <div className="rounded-xl border border-border bg-white shadow-sm">
        {isLoading ? (
          <div className="p-6"><TableSkeleton rows={4} cols={7} /></div>
        ) : isError ? (
          <ErrorState onRetry={() => refetch()} />
        ) : campaigns.length === 0 ? (
          <EmptyState icon={Megaphone} title="Sin campanas" description="Crea tu primera campana de llamadas." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Nombre</th>
                  <th className="px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Modo</th>
                  <th className="px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Leads</th>
                  <th className="px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Max conc.</th>
                  <th className="px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Creado</th>
                  <th className="px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Control</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {campaigns.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-foreground">{c.nombre}</p>
                        {c.descripcion && <p className="text-xs text-muted-foreground mt-0.5">{c.descripcion}</p>}
                      </div>
                    </td>
                    <td className="px-6 py-4"><Badge variant="info">{modeLabel(c.modo)}</Badge></td>
                    <td className="px-6 py-4"><Badge variant={statusVariant(c.estado)}>{statusLabel(c.estado)}</Badge></td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{c.total_leads}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{c.max_concurrent}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{formatDate(c.created_at)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        {c.estado !== "running" && c.estado !== "completed" && (
                          <button onClick={() => handleControl(c.id, "start")} disabled={controlMut.isPending} className="rounded-md p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 transition-colors" title="Iniciar">
                            <Play className="h-4 w-4" />
                          </button>
                        )}
                        {c.estado === "running" && (
                          <button onClick={() => handleControl(c.id, "pause")} disabled={controlMut.isPending} className="rounded-md p-1.5 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 transition-colors" title="Pausar">
                            <Pause className="h-4 w-4" />
                          </button>
                        )}
                        {(c.estado === "running" || c.estado === "paused") && (
                          <button onClick={() => handleControl(c.id, "stop")} disabled={controlMut.isPending} className="rounded-md p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors" title="Detener">
                            <Square className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <button onClick={() => navigate(`/callcenter/campaigns/${c.id}`)} className="rounded-md p-1.5 text-gray-400 hover:text-primary hover:bg-primary/10 transition-colors" title="Ver detalle">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button onClick={() => openEdit(c)} className="rounded-md p-1.5 text-gray-400 hover:text-foreground hover:bg-gray-100 transition-colors"><Pencil className="h-4 w-4" /></button>
                        <button onClick={() => setDeleteTarget(c)} className="rounded-md p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={modalOpen} onOpenChange={setModalOpen} title={editing ? "Editar campana" : "Nueva campana"}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Nombre</label>
            <input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} className="w-full rounded-lg border border-border bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" placeholder="Campana enero 2025" />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Descripcion</label>
            <textarea value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} rows={2} className="w-full rounded-lg border border-border bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none" placeholder="Descripcion opcional..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Modo</label>
              <div className="relative">
                <select value={form.modo} onChange={(e) => setForm({ ...form, modo: e.target.value as CampaignMode })} className="w-full appearance-none rounded-lg border border-border bg-white px-4 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                  <option value="manual">Manual</option>
                  <option value="progressive">Progresivo</option>
                  <option value="predictive">Predictivo</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Max concurrencia</label>
              <input type="number" value={form.max_concurrent} onChange={(e) => setForm({ ...form, max_concurrent: Number(e.target.value) })} min={1} className="w-full rounded-lg border border-border bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Troncal</label>
              <div className="relative">
                <select value={form.trunk_id} onChange={(e) => setForm({ ...form, trunk_id: e.target.value })} className="w-full appearance-none rounded-lg border border-border bg-white px-4 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                  <option value="">Sin asignar</option>
                  {trunks.map((t) => <option key={t.id} value={t.id}>{t.nombre}</option>)}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Caller ID</label>
              <input value={form.caller_id} onChange={(e) => setForm({ ...form, caller_id: e.target.value })} className="w-full rounded-lg border border-border bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" placeholder="+5491155551234" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setModalOpen(false)} className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-gray-50 transition-colors">Cancelar</button>
            <button onClick={handleSubmit} disabled={createMut.isPending || updateMut.isPending} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-colors disabled:opacity-50">
              {(createMut.isPending || updateMut.isPending) ? "Guardando..." : editing ? "Actualizar" : "Crear"}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)} title="Eliminar campana" description={`Se eliminara la campana "${deleteTarget?.nombre}" y todos sus leads asociados. Esta accion no se puede deshacer.`} confirmLabel="Eliminar" variant="danger" onConfirm={handleDelete} loading={deleteMut.isPending} />
    </div>
  )
}
