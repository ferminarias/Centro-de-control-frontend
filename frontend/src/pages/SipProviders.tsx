import { useState } from "react"
import { Plus, Pencil, Trash2, Server } from "lucide-react"
import { useAccount } from "@/context/AccountContext"
import { useSipProviders, useCreateSipProvider, useUpdateSipProvider, useDeleteSipProvider } from "@/hooks/useVoip"
import { TableSkeleton } from "@/components/ui/Loading"
import ErrorState from "@/components/ui/ErrorState"
import EmptyState from "@/components/ui/EmptyState"
import Badge from "@/components/ui/Badge"
import Modal from "@/components/ui/Modal"
import ConfirmDialog from "@/components/ui/ConfirmDialog"
import { formatDate } from "@/lib/utils"
import type { SipProviderResponse, SipProviderCreate } from "@/types"

export default function SipProviders() {
  const { selectedAccount } = useAccount()
  const accountId = selectedAccount?.id ?? ""

  const { data, isLoading, isError, refetch } = useSipProviders(accountId || undefined)
  const createMut = useCreateSipProvider(accountId)
  const updateMut = useUpdateSipProvider(accountId)
  const deleteMut = useDeleteSipProvider(accountId)

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<SipProviderResponse | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<SipProviderResponse | null>(null)

  const [form, setForm] = useState<SipProviderCreate & { activo?: boolean }>({ nombre: "", host: "", puerto: 5060, protocolo: "UDP" })

  const providers = data?.items ?? []

  const openCreate = () => {
    setEditing(null)
    setForm({ nombre: "", host: "", puerto: 5060, protocolo: "UDP" })
    setModalOpen(true)
  }

  const openEdit = (p: SipProviderResponse) => {
    setEditing(p)
    setForm({ nombre: p.nombre, host: p.host, puerto: p.puerto, protocolo: p.protocolo, activo: p.activo })
    setModalOpen(true)
  }

  const handleSubmit = () => {
    if (!form.nombre || !form.host) return
    if (editing) {
      updateMut.mutate({ id: editing.id, payload: form }, { onSuccess: () => setModalOpen(false) })
    } else {
      createMut.mutate(form, { onSuccess: () => setModalOpen(false) })
    }
  }

  const handleDelete = () => {
    if (!deleteTarget) return
    deleteMut.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) })
  }

  if (!selectedAccount) return null

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Proveedores SIP</h2>
          <p className="text-sm text-muted-foreground mt-1">Gestiona los proveedores de telefonia SIP.</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary/90 transition-colors">
          <Plus className="h-4 w-4" /> Nuevo proveedor
        </button>
      </div>

      <div className="rounded-xl border border-border bg-white shadow-sm">
        {isLoading ? (
          <div className="p-6"><TableSkeleton rows={4} cols={6} /></div>
        ) : isError ? (
          <ErrorState onRetry={() => refetch()} />
        ) : providers.length === 0 ? (
          <EmptyState icon={Server} title="Sin proveedores" description="Agrega tu primer proveedor SIP." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Nombre</th>
                  <th className="px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Host</th>
                  <th className="px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Puerto</th>
                  <th className="px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Protocolo</th>
                  <th className="px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Creado</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {providers.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-foreground">{p.nombre}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground font-mono">{p.host}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{p.puerto}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{p.protocolo}</td>
                    <td className="px-6 py-4">
                      <Badge variant={p.activo ? "success" : "danger"}>{p.activo ? "Activo" : "Inactivo"}</Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{formatDate(p.created_at)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEdit(p)} className="rounded-md p-1.5 text-gray-400 hover:text-foreground hover:bg-gray-100 transition-colors"><Pencil className="h-4 w-4" /></button>
                        <button onClick={() => setDeleteTarget(p)} className="rounded-md p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <Modal open={modalOpen} onOpenChange={setModalOpen} title={editing ? "Editar proveedor" : "Nuevo proveedor"}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Nombre</label>
            <input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} className="w-full rounded-lg border border-border bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" placeholder="Mi proveedor" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Host</label>
              <input value={form.host} onChange={(e) => setForm({ ...form, host: e.target.value })} className="w-full rounded-lg border border-border bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" placeholder="sip.provider.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Puerto</label>
              <input type="number" value={form.puerto ?? 5060} onChange={(e) => setForm({ ...form, puerto: Number(e.target.value) })} className="w-full rounded-lg border border-border bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Protocolo</label>
              <select value={form.protocolo ?? "UDP"} onChange={(e) => setForm({ ...form, protocolo: e.target.value })} className="w-full rounded-lg border border-border bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                <option value="UDP">UDP</option>
                <option value="TCP">TCP</option>
                <option value="TLS">TLS</option>
              </select>
            </div>
            {editing && (
              <div className="flex items-end">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={form.activo ?? true} onChange={(e) => setForm({ ...form, activo: e.target.checked })} className="rounded border-border" />
                  Activo
                </label>
              </div>
            )}
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setModalOpen(false)} className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-gray-50 transition-colors">Cancelar</button>
            <button onClick={handleSubmit} disabled={createMut.isPending || updateMut.isPending} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-colors disabled:opacity-50">
              {(createMut.isPending || updateMut.isPending) ? "Guardando..." : editing ? "Actualizar" : "Crear"}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)} title="Eliminar proveedor" description={`Se eliminara el proveedor "${deleteTarget?.nombre}". Esta accion no se puede deshacer.`} confirmLabel="Eliminar" variant="danger" onConfirm={handleDelete} loading={deleteMut.isPending} />
    </div>
  )
}
