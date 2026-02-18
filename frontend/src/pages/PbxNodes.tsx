import { useState } from "react"
import { Plus, Pencil, Trash2, Server, HeartPulse } from "lucide-react"
import { useAccount } from "@/context/AccountContext"
import { usePbxNodes, useCreatePbxNode, useUpdatePbxNode, useDeletePbxNode, useHealthCheckPbxNode } from "@/hooks/useVoip"
import { TableSkeleton, Spinner } from "@/components/ui/Loading"
import ErrorState from "@/components/ui/ErrorState"
import EmptyState from "@/components/ui/EmptyState"
import Badge from "@/components/ui/Badge"
import Modal from "@/components/ui/Modal"
import ConfirmDialog from "@/components/ui/ConfirmDialog"
import { formatDate } from "@/lib/utils"
import type { PbxNodeResponse } from "@/types"

export default function PbxNodes() {
  const { selectedAccount } = useAccount()
  const accountId = selectedAccount?.id ?? ""

  const { data, isLoading, isError, refetch } = usePbxNodes(accountId || undefined)
  const createMut = useCreatePbxNode(accountId)
  const updateMut = useUpdatePbxNode(accountId)
  const deleteMut = useDeletePbxNode(accountId)
  const healthMut = useHealthCheckPbxNode()

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<PbxNodeResponse | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<PbxNodeResponse | null>(null)

  const [form, setForm] = useState({ nombre: "", host: "", ami_port: 5038, ami_user: "", ami_password: "", activo: true })

  const nodes = data?.items ?? []

  const openCreate = () => {
    setEditing(null)
    setForm({ nombre: "", host: "", ami_port: 5038, ami_user: "", ami_password: "", activo: true })
    setModalOpen(true)
  }

  const openEdit = (n: PbxNodeResponse) => {
    setEditing(n)
    setForm({ nombre: n.nombre, host: n.host, ami_port: n.ami_port, ami_user: n.ami_user, ami_password: "", activo: n.activo })
    setModalOpen(true)
  }

  const handleSubmit = () => {
    if (!form.nombre || !form.host || !form.ami_user) return
    if (editing) {
      const payload: Record<string, unknown> = { ...form }
      if (!payload.ami_password) delete payload.ami_password
      updateMut.mutate({ id: editing.id, payload: payload as never }, { onSuccess: () => setModalOpen(false) })
    } else {
      if (!form.ami_password) return
      createMut.mutate(form as never, { onSuccess: () => setModalOpen(false) })
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
          <h2 className="text-2xl font-bold text-foreground">Nodos PBX</h2>
          <p className="text-sm text-muted-foreground mt-1">Administra los nodos Asterisk/PBX de la cuenta.</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary/90 transition-colors">
          <Plus className="h-4 w-4" /> Nuevo nodo
        </button>
      </div>

      <div className="rounded-xl border border-border bg-white shadow-sm">
        {isLoading ? (
          <div className="p-6"><TableSkeleton rows={4} cols={7} /></div>
        ) : isError ? (
          <ErrorState onRetry={() => refetch()} />
        ) : nodes.length === 0 ? (
          <EmptyState icon={Server} title="Sin nodos PBX" description="Agrega tu primer nodo Asterisk." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Nombre</th>
                  <th className="px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Host</th>
                  <th className="px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">AMI Port</th>
                  <th className="px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">AMI User</th>
                  <th className="px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Creado</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {nodes.map((n) => (
                  <tr key={n.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-foreground">{n.nombre}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground font-mono">{n.host}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{n.ami_port}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{n.ami_user}</td>
                    <td className="px-6 py-4">
                      <Badge variant={n.activo ? "success" : "danger"}>{n.activo ? "Activo" : "Inactivo"}</Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{formatDate(n.created_at)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => healthMut.mutate(n.id)}
                          disabled={healthMut.isPending}
                          className="rounded-md p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 transition-colors"
                          title="Health check"
                        >
                          {healthMut.isPending ? <Spinner /> : <HeartPulse className="h-4 w-4" />}
                        </button>
                        <button onClick={() => openEdit(n)} className="rounded-md p-1.5 text-gray-400 hover:text-foreground hover:bg-gray-100 transition-colors"><Pencil className="h-4 w-4" /></button>
                        <button onClick={() => setDeleteTarget(n)} className="rounded-md p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={modalOpen} onOpenChange={setModalOpen} title={editing ? "Editar nodo PBX" : "Nuevo nodo PBX"}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Nombre</label>
            <input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} className="w-full rounded-lg border border-border bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" placeholder="PBX Principal" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Host</label>
              <input value={form.host} onChange={(e) => setForm({ ...form, host: e.target.value })} className="w-full rounded-lg border border-border bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" placeholder="192.168.1.100" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">AMI Port</label>
              <input type="number" value={form.ami_port} onChange={(e) => setForm({ ...form, ami_port: Number(e.target.value) })} className="w-full rounded-lg border border-border bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">AMI User</label>
              <input value={form.ami_user} onChange={(e) => setForm({ ...form, ami_user: e.target.value })} className="w-full rounded-lg border border-border bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">AMI Password</label>
              <input type="password" value={form.ami_password} onChange={(e) => setForm({ ...form, ami_password: e.target.value })} placeholder={editing ? "(sin cambios)" : ""} className="w-full rounded-lg border border-border bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
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

      <ConfirmDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)} title="Eliminar nodo PBX" description={`Se eliminara el nodo "${deleteTarget?.nombre}". Esta accion no se puede deshacer.`} confirmLabel="Eliminar" variant="danger" onConfirm={handleDelete} loading={deleteMut.isPending} />
    </div>
  )
}
