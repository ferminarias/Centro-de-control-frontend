import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Plus, Pencil, Trash2, Layers, Star } from "lucide-react"
import { useAccount } from "@/context/AccountContext"
import { useLeadBasesList, useCreateLeadBase, useUpdateLeadBase, useDeleteLeadBase } from "@/hooks/useLeadBases"
import { TableSkeleton } from "@/components/ui/Loading"
import ErrorState from "@/components/ui/ErrorState"
import EmptyState from "@/components/ui/EmptyState"
import Badge from "@/components/ui/Badge"
import Modal from "@/components/ui/Modal"
import ConfirmDialog from "@/components/ui/ConfirmDialog"
import { formatDate } from "@/lib/utils"
import type { LeadBaseResponse } from "@/types"

export default function Bases() {
  const { selectedAccount } = useAccount()
  const navigate = useNavigate()
  const accountId = selectedAccount?.id ?? ""
  const { data, isLoading, isError, refetch } = useLeadBasesList(selectedAccount?.id)
  const createMutation = useCreateLeadBase(accountId)
  const updateMutation = useUpdateLeadBase(accountId)
  const deleteMutation = useDeleteLeadBase(accountId)

  const [showCreate, setShowCreate] = useState(false)
  const [createName, setCreateName] = useState("")
  const [createDesc, setCreateDesc] = useState("")

  const [editingBase, setEditingBase] = useState<LeadBaseResponse | null>(null)
  const [editName, setEditName] = useState("")
  const [editDesc, setEditDesc] = useState("")

  const [deletingBase, setDeletingBase] = useState<LeadBaseResponse | null>(null)

  if (!selectedAccount) {
    return (
      <EmptyState
        icon={Layers}
        title="Selecciona un cliente"
        description="Elige un cliente del selector en el header para ver sus bases."
      />
    )
  }

  const bases = data?.items ?? []

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!createName.trim()) return
    await createMutation.mutateAsync({
      nombre: createName.trim(),
      descripcion: createDesc.trim() || undefined,
    })
    setCreateName("")
    setCreateDesc("")
    setShowCreate(false)
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingBase || !editName.trim()) return
    await updateMutation.mutateAsync({
      baseId: editingBase.id,
      payload: { nombre: editName.trim(), descripcion: editDesc.trim() || undefined },
    })
    setEditingBase(null)
  }

  const handleDelete = async () => {
    if (!deletingBase) return
    await deleteMutation.mutateAsync(deletingBase.id)
    setDeletingBase(null)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Bases</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Bases de datos de leads de {selectedAccount.nombre}
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Nueva base
        </button>
      </div>

      <div className="rounded-xl border border-border bg-white shadow-sm">
        {isLoading ? (
          <div className="p-6"><TableSkeleton rows={4} cols={4} /></div>
        ) : isError ? (
          <ErrorState onRetry={() => refetch()} />
        ) : bases.length === 0 ? (
          <EmptyState
            icon={Layers}
            title="No hay bases"
            description="Crea tu primera base de datos para organizar los leads."
            action={
              <button
                onClick={() => setShowCreate(true)}
                className="flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Nueva base
              </button>
            }
          />
        ) : (
          <>
            <div className="px-6 py-3 border-b border-border">
              <span className="text-sm text-muted-foreground">{bases.length} base{bases.length !== 1 ? "s" : ""}</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Nombre</th>
                    <th className="px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Descripcion</th>
                    <th className="px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Leads</th>
                    <th className="px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Fecha creacion</th>
                    <th className="px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {bases.map((base) => (
                    <tr
                      key={base.id}
                      className="hover:bg-gray-50 transition-colors cursor-pointer"
                      onDoubleClick={() => navigate(`/bases/${base.id}`)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{base.nombre}</span>
                          {base.es_default && (
                            <Badge variant="info" className="gap-1">
                              <Star className="h-3 w-3" />
                              Default
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground max-w-xs truncate">
                        {base.descripcion || <span className="text-gray-300">-</span>}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center justify-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                          {base.total_leads ?? base.leads_count ?? 0}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{formatDate(base.created_at)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              setEditingBase(base)
                              setEditName(base.nombre)
                              setEditDesc(base.descripcion || "")
                            }}
                            className="rounded-md p-1.5 text-gray-400 hover:text-foreground hover:bg-gray-100 transition-colors"
                            title="Editar"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          {!base.es_default && (
                            <button
                              onClick={() => setDeletingBase(base)}
                              className="rounded-md p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                              title="Eliminar"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Create Modal */}
      <Modal open={showCreate} onOpenChange={setShowCreate} title="Nueva base" description="Crea una nueva base de datos para organizar leads">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground">Nombre</label>
            <input
              type="text"
              value={createName}
              onChange={(e) => setCreateName(e.target.value)}
              placeholder="Nombre de la base"
              className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground">Descripcion</label>
            <textarea
              value={createDesc}
              onChange={(e) => setCreateDesc(e.target.value)}
              placeholder="Descripcion opcional"
              rows={2}
              className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShowCreate(false)} className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-gray-50 transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={createMutation.isPending || !createName.trim()} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50 transition-colors">
              {createMutation.isPending ? "Creando..." : "Crear base"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal open={!!editingBase} onOpenChange={(o) => !o && setEditingBase(null)} title="Editar base">
        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground">Nombre</label>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground">Descripcion</label>
            <textarea
              value={editDesc}
              onChange={(e) => setEditDesc(e.target.value)}
              placeholder="Descripcion opcional"
              rows={2}
              className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setEditingBase(null)} className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-gray-50 transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={updateMutation.isPending || !editName.trim()} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50 transition-colors">
              {updateMutation.isPending ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!deletingBase}
        onOpenChange={(o) => !o && setDeletingBase(null)}
        title="Eliminar base"
        description={`¿Estas seguro de eliminar la base "${deletingBase?.nombre}"? Los leads asociados quedaran sin base asignada.`}
        confirmLabel="Eliminar"
        variant="danger"
        onConfirm={handleDelete}
        loading={deleteMutation.isPending}
      />
    </div>
  )
}
