import { useState } from "react"
import { ShieldCheck, Plus, Pencil, Trash2, Check } from "lucide-react"
import { useAccount } from "@/context/AccountContext"
import { useRolesList, useCreateRole, useUpdateRole, useDeleteRole, usePermissions } from "@/hooks/useRoles"
import { TableSkeleton } from "@/components/ui/Loading"
import ErrorState from "@/components/ui/ErrorState"
import EmptyState from "@/components/ui/EmptyState"
import Badge from "@/components/ui/Badge"
import Modal from "@/components/ui/Modal"
import ConfirmDialog from "@/components/ui/ConfirmDialog"
import { formatDate, cn } from "@/lib/utils"
import type { RoleResponse } from "@/types"

const PERMISSION_LABELS: Record<string, string> = {
  read: "Leer",
  create: "Crear",
  update: "Editar",
  delete: "Eliminar",
}

const GROUP_LABELS: Record<string, string> = {
  users: "Usuarios",
  roles: "Roles",
  leads: "Leads",
  bases: "Bases",
  lotes: "Lotes",
  fields: "Campos",
  records: "Registros",
  settings: "Configuracion",
}

export default function RolesAdmin() {
  const { selectedAccount } = useAccount()
  const accountId = selectedAccount?.id ?? ""

  const { data: rolesData, isLoading, isError, refetch } = useRolesList(accountId)
  const { data: permsData } = usePermissions()
  const createMutation = useCreateRole(accountId)
  const updateMutation = useUpdateRole(accountId)
  const deleteMutation = useDeleteRole(accountId)

  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<RoleResponse | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<RoleResponse | null>(null)

  // Form state
  const [nombre, setNombre] = useState("")
  const [descripcion, setDescripcion] = useState("")
  const [selectedPerms, setSelectedPerms] = useState<Set<string>>(new Set())

  const roles = rolesData?.items ?? []
  const grouped = permsData?.grouped ?? {}

  const openCreate = () => {
    setEditing(null)
    setNombre("")
    setDescripcion("")
    setSelectedPerms(new Set())
    setShowForm(true)
  }

  const openEdit = (role: RoleResponse) => {
    setEditing(role)
    setNombre(role.nombre)
    setDescripcion(role.descripcion ?? "")
    setSelectedPerms(new Set(role.permisos))
    setShowForm(true)
  }

  const togglePerm = (perm: string) => {
    setSelectedPerms((prev) => {
      const next = new Set(prev)
      if (next.has(perm)) next.delete(perm)
      else next.add(perm)
      return next
    })
  }

  const toggleGroup = (groupPerms: string[]) => {
    const allSelected = groupPerms.every((p) => selectedPerms.has(p))
    setSelectedPerms((prev) => {
      const next = new Set(prev)
      for (const p of groupPerms) {
        if (allSelected) next.delete(p)
        else next.add(p)
      }
      return next
    })
  }

  const handleSubmit = () => {
    const trimmed = nombre.trim()
    if (!trimmed) return
    const permisos = Array.from(selectedPerms)

    if (editing) {
      updateMutation.mutate(
        { roleId: editing.id, payload: { nombre: trimmed, descripcion: descripcion.trim() || undefined, permisos } },
        { onSuccess: () => setShowForm(false) }
      )
    } else {
      createMutation.mutate(
        { nombre: trimmed, descripcion: descripcion.trim() || undefined, permisos },
        { onSuccess: () => setShowForm(false) }
      )
    }
  }

  const handleDelete = () => {
    if (!deleteTarget) return
    deleteMutation.mutate(deleteTarget.id, {
      onSuccess: () => setDeleteTarget(null),
    })
  }

  const isPending = createMutation.isPending || updateMutation.isPending

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Roles</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Administra los roles y permisos de esta cuenta.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Crear rol
        </button>
      </div>

      <div className="rounded-xl border border-border bg-white shadow-sm">
        {isLoading ? (
          <div className="p-6"><TableSkeleton rows={4} cols={5} /></div>
        ) : isError ? (
          <ErrorState onRetry={() => refetch()} />
        ) : roles.length === 0 ? (
          <EmptyState
            icon={ShieldCheck}
            title="No hay roles"
            description="Crea un rol para asignar permisos a los usuarios."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Nombre</th>
                  <th className="px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Descripcion</th>
                  <th className="px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Permisos</th>
                  <th className="px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Usuarios</th>
                  <th className="px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Creado</th>
                  <th className="px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {roles.map((role) => (
                  <tr key={role.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-foreground">{role.nombre}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground max-w-[200px] truncate">
                      {role.descripcion || "—"}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="info">{role.permisos.length} permisos</Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="default">{role.total_users ?? 0} usuarios</Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground whitespace-nowrap">
                      {formatDate(role.created_at)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEdit(role)}
                          className="inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium text-primary hover:bg-primary/10 transition-colors"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          Editar
                        </button>
                        <button
                          onClick={() => setDeleteTarget(role)}
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
      <Modal
        open={showForm}
        onOpenChange={setShowForm}
        title={editing ? "Editar rol" : "Crear rol"}
        wide
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Nombre</label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej: Administrador"
                className="w-full rounded-lg border border-border bg-white px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Descripcion</label>
              <input
                type="text"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Opcional"
                className="w-full rounded-lg border border-border bg-white px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          {/* Permissions grouped by resource */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Permisos</label>
            <div className="space-y-3 max-h-[40vh] overflow-y-auto rounded-lg border border-border p-4 bg-gray-50">
              {Object.entries(grouped).map(([group, perms]) => {
                const allSelected = perms.every((p) => selectedPerms.has(p))
                const someSelected = perms.some((p) => selectedPerms.has(p)) && !allSelected
                return (
                  <div key={group} className="rounded-lg bg-white border border-border p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <button
                        type="button"
                        onClick={() => toggleGroup(perms)}
                        className={cn(
                          "flex h-5 w-5 items-center justify-center rounded border transition-colors",
                          allSelected
                            ? "bg-primary border-primary text-white"
                            : someSelected
                              ? "bg-primary/20 border-primary"
                              : "border-gray-300 hover:border-primary"
                        )}
                      >
                        {(allSelected || someSelected) && <Check className="h-3.5 w-3.5" />}
                      </button>
                      <span className="text-sm font-semibold text-foreground capitalize">
                        {GROUP_LABELS[group] ?? group}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-3 ml-7">
                      {perms.map((perm) => {
                        const action = perm.split(":")[1]
                        const checked = selectedPerms.has(perm)
                        return (
                          <label
                            key={perm}
                            className="flex items-center gap-1.5 cursor-pointer"
                          >
                            <button
                              type="button"
                              onClick={() => togglePerm(perm)}
                              className={cn(
                                "flex h-4 w-4 items-center justify-center rounded border transition-colors",
                                checked
                                  ? "bg-primary border-primary text-white"
                                  : "border-gray-300 hover:border-primary"
                              )}
                            >
                              {checked && <Check className="h-3 w-3" />}
                            </button>
                            <span className="text-sm text-foreground">
                              {PERMISSION_LABELS[action] ?? action}
                            </span>
                          </label>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {selectedPerms.size} permiso{selectedPerms.size !== 1 ? "s" : ""} seleccionado{selectedPerms.size !== 1 ? "s" : ""}
            </p>
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
              disabled={!nombre.trim() || isPending}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {isPending ? "Guardando..." : editing ? "Guardar cambios" : "Crear rol"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete confirm */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Eliminar rol"
        description={
          (deleteTarget?.total_users ?? 0) > 0
            ? `El rol "${deleteTarget?.nombre}" tiene ${deleteTarget?.total_users} usuario(s) asignado(s). No se puede eliminar un rol con usuarios.`
            : `Se eliminara el rol "${deleteTarget?.nombre}". Esta accion no se puede deshacer.`
        }
        confirmLabel="Eliminar"
        variant="danger"
        onConfirm={handleDelete}
        loading={deleteMutation.isPending}
      />
    </div>
  )
}
