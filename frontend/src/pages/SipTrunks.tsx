import { useState } from "react"
import { Plus, Pencil, Trash2, Cable, ChevronDown } from "lucide-react"
import { useAccount } from "@/context/AccountContext"
import { useSipProviders, useSipTrunks, useCreateSipTrunk, useUpdateSipTrunk, useDeleteSipTrunk } from "@/hooks/useVoip"
import { TableSkeleton } from "@/components/ui/Loading"
import ErrorState from "@/components/ui/ErrorState"
import EmptyState from "@/components/ui/EmptyState"
import Badge from "@/components/ui/Badge"
import Modal from "@/components/ui/Modal"
import ConfirmDialog from "@/components/ui/ConfirmDialog"
import { formatDate } from "@/lib/utils"
import type { SipTrunkResponse } from "@/types"

export default function SipTrunks() {
  const { selectedAccount } = useAccount()
  const accountId = selectedAccount?.id ?? ""

  const { data, isLoading, isError, refetch } = useSipTrunks(accountId || undefined)
  const { data: providersData } = useSipProviders(accountId || undefined)
  const createMut = useCreateSipTrunk(accountId)
  const updateMut = useUpdateSipTrunk(accountId)
  const deleteMut = useDeleteSipTrunk(accountId)

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<SipTrunkResponse | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<SipTrunkResponse | null>(null)

  const [providerId, setProviderId] = useState("")
  const [form, setForm] = useState({ nombre: "", username: "", password: "", auth_type: "password", max_channels: 10, activo: true })

  const trunks = data?.items ?? []
  const providers = providersData?.items ?? []

  const openCreate = () => {
    setEditing(null)
    setProviderId(providers[0]?.id ?? "")
    setForm({ nombre: "", username: "", password: "", auth_type: "password", max_channels: 10, activo: true })
    setModalOpen(true)
  }

  const openEdit = (t: SipTrunkResponse) => {
    setEditing(t)
    setProviderId(t.provider_id)
    setForm({ nombre: t.nombre, username: t.username, password: "", auth_type: t.auth_type, max_channels: t.max_channels, activo: t.activo })
    setModalOpen(true)
  }

  const handleSubmit = () => {
    if (!form.nombre || !form.username) return
    if (editing) {
      const payload: Record<string, unknown> = { ...form }
      if (!payload.password) delete payload.password
      updateMut.mutate({ id: editing.id, payload: payload as never }, { onSuccess: () => setModalOpen(false) })
    } else {
      if (!providerId) return
      const payload: Record<string, unknown> = { ...form }
      if (!payload.password) delete payload.password
      createMut.mutate({ providerId, payload: payload as never }, { onSuccess: () => setModalOpen(false) })
    }
  }

  const handleDelete = () => {
    if (!deleteTarget) return
    deleteMut.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) })
  }

  const getProviderName = (pid: string) => providers.find((p) => p.id === pid)?.nombre ?? pid.slice(0, 8)

  if (!selectedAccount) return null

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Troncales SIP</h2>
          <p className="text-sm text-muted-foreground mt-1">Gestiona las troncales asociadas a proveedores SIP.</p>
        </div>
        <button onClick={openCreate} disabled={providers.length === 0} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary/90 transition-colors disabled:opacity-50">
          <Plus className="h-4 w-4" /> Nueva troncal
        </button>
      </div>

      <div className="rounded-xl border border-border bg-white shadow-sm">
        {isLoading ? (
          <div className="p-6"><TableSkeleton rows={4} cols={7} /></div>
        ) : isError ? (
          <ErrorState onRetry={() => refetch()} />
        ) : trunks.length === 0 ? (
          <EmptyState icon={Cable} title="Sin troncales" description="Crea una troncal asociada a un proveedor SIP." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Nombre</th>
                  <th className="px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Proveedor</th>
                  <th className="px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Usuario</th>
                  <th className="px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Auth</th>
                  <th className="px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Canales</th>
                  <th className="px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Creado</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {trunks.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-foreground">{t.nombre}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{getProviderName(t.provider_id)}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground font-mono">{t.username}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{t.auth_type}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{t.max_channels}</td>
                    <td className="px-6 py-4">
                      <Badge variant={t.activo ? "success" : "danger"}>{t.activo ? "Activo" : "Inactivo"}</Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{formatDate(t.created_at)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEdit(t)} className="rounded-md p-1.5 text-gray-400 hover:text-foreground hover:bg-gray-100 transition-colors"><Pencil className="h-4 w-4" /></button>
                        <button onClick={() => setDeleteTarget(t)} className="rounded-md p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={modalOpen} onOpenChange={setModalOpen} title={editing ? "Editar troncal" : "Nueva troncal"}>
        <div className="space-y-4">
          {!editing && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Proveedor</label>
              <div className="relative">
                <select value={providerId} onChange={(e) => setProviderId(e.target.value)} className="w-full appearance-none rounded-lg border border-border bg-white px-4 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                  {providers.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Nombre</label>
            <input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} className="w-full rounded-lg border border-border bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" placeholder="Troncal principal" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Usuario SIP</label>
              <input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} className="w-full rounded-lg border border-border bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Password</label>
              <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder={editing ? "(sin cambios)" : ""} className="w-full rounded-lg border border-border bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Tipo auth</label>
              <select value={form.auth_type} onChange={(e) => setForm({ ...form, auth_type: e.target.value })} className="w-full rounded-lg border border-border bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                <option value="password">Password</option>
                <option value="ip">IP</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Max canales</label>
              <input type="number" value={form.max_channels} onChange={(e) => setForm({ ...form, max_channels: Number(e.target.value) })} className="w-full rounded-lg border border-border bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
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

      <ConfirmDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)} title="Eliminar troncal" description={`Se eliminara la troncal "${deleteTarget?.nombre}". Esta accion no se puede deshacer.`} confirmLabel="Eliminar" variant="danger" onConfirm={handleDelete} loading={deleteMut.isPending} />
    </div>
  )
}
