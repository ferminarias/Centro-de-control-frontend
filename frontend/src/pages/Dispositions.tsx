import { useState } from "react"
import { Plus, Pencil, Trash2, ClipboardList } from "lucide-react"
import { useAccount } from "@/context/AccountContext"
import { useDispositions, useCreateDisposition, useUpdateDisposition, useDeleteDisposition } from "@/hooks/useVoip"
import { TableSkeleton } from "@/components/ui/Loading"
import ErrorState from "@/components/ui/ErrorState"
import EmptyState from "@/components/ui/EmptyState"
import Badge from "@/components/ui/Badge"
import Modal from "@/components/ui/Modal"
import ConfirmDialog from "@/components/ui/ConfirmDialog"
import { formatDate } from "@/lib/utils"
import type { DispositionResponse } from "@/types"

export default function Dispositions() {
  const { selectedAccount } = useAccount()
  const accountId = selectedAccount?.id ?? ""

  const { data, isLoading, isError, refetch } = useDispositions(accountId || undefined)
  const createMut = useCreateDisposition(accountId)
  const updateMut = useUpdateDisposition(accountId)
  const deleteMut = useDeleteDisposition(accountId)

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<DispositionResponse | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<DispositionResponse | null>(null)

  const [form, setForm] = useState({ nombre: "", categoria: "general", es_contacto: false, requiere_callback: false })

  const dispositions = data?.items ?? []

  const openCreate = () => {
    setEditing(null)
    setForm({ nombre: "", categoria: "general", es_contacto: false, requiere_callback: false })
    setModalOpen(true)
  }

  const openEdit = (d: DispositionResponse) => {
    setEditing(d)
    setForm({ nombre: d.nombre, categoria: d.categoria, es_contacto: d.es_contacto, requiere_callback: d.requiere_callback })
    setModalOpen(true)
  }

  const handleSubmit = () => {
    if (!form.nombre) return
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
          <h2 className="text-2xl font-bold text-foreground">Tipificaciones</h2>
          <p className="text-sm text-muted-foreground mt-1">Gestiona las tipificaciones de llamadas.</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary/90 transition-colors">
          <Plus className="h-4 w-4" /> Nueva tipificacion
        </button>
      </div>

      <div className="rounded-xl border border-border bg-white shadow-sm">
        {isLoading ? (
          <div className="p-6"><TableSkeleton rows={4} cols={6} /></div>
        ) : isError ? (
          <ErrorState onRetry={() => refetch()} />
        ) : dispositions.length === 0 ? (
          <EmptyState icon={ClipboardList} title="Sin tipificaciones" description="Agrega tu primera tipificacion de llamadas." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Nombre</th>
                  <th className="px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Categoria</th>
                  <th className="px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Es contacto</th>
                  <th className="px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Requiere callback</th>
                  <th className="px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Creado</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {dispositions.map((d) => (
                  <tr key={d.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-foreground">{d.nombre}</td>
                    <td className="px-6 py-4"><Badge>{d.categoria}</Badge></td>
                    <td className="px-6 py-4">
                      <Badge variant={d.es_contacto ? "success" : "default"}>{d.es_contacto ? "Si" : "No"}</Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={d.requiere_callback ? "warning" : "default"}>{d.requiere_callback ? "Si" : "No"}</Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{formatDate(d.created_at)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEdit(d)} className="rounded-md p-1.5 text-gray-400 hover:text-foreground hover:bg-gray-100 transition-colors"><Pencil className="h-4 w-4" /></button>
                        <button onClick={() => setDeleteTarget(d)} className="rounded-md p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={modalOpen} onOpenChange={setModalOpen} title={editing ? "Editar tipificacion" : "Nueva tipificacion"}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Nombre</label>
            <input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} className="w-full rounded-lg border border-border bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" placeholder="Venta exitosa" />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Categoria</label>
            <input value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })} className="w-full rounded-lg border border-border bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" placeholder="ventas" />
          </div>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.es_contacto} onChange={(e) => setForm({ ...form, es_contacto: e.target.checked })} className="rounded border-border" />
              Es contacto efectivo
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.requiere_callback} onChange={(e) => setForm({ ...form, requiere_callback: e.target.checked })} className="rounded border-border" />
              Requiere callback
            </label>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setModalOpen(false)} className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-gray-50 transition-colors">Cancelar</button>
            <button onClick={handleSubmit} disabled={createMut.isPending || updateMut.isPending} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-colors disabled:opacity-50">
              {(createMut.isPending || updateMut.isPending) ? "Guardando..." : editing ? "Actualizar" : "Crear"}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)} title="Eliminar tipificacion" description={`Se eliminara la tipificacion "${deleteTarget?.nombre}". Esta accion no se puede deshacer.`} confirmLabel="Eliminar" variant="danger" onConfirm={handleDelete} loading={deleteMut.isPending} />
    </div>
  )
}
