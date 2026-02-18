import { useState } from "react"
import { UserCog, Plus, Pencil, Trash2, ChevronDown } from "lucide-react"
import { useAccount } from "@/context/AccountContext"
import { useUsersList, useCreateUser, useUpdateUser, useDeleteUser } from "@/hooks/useUsers"
import { useRolesList } from "@/hooks/useRoles"
import { TableSkeleton } from "@/components/ui/Loading"
import ErrorState from "@/components/ui/ErrorState"
import EmptyState from "@/components/ui/EmptyState"
import Badge from "@/components/ui/Badge"
import Modal from "@/components/ui/Modal"
import ConfirmDialog from "@/components/ui/ConfirmDialog"
import Pagination from "@/components/ui/Pagination"
import { formatDate } from "@/lib/utils"
import type { UserResponse } from "@/types"

export default function UsersAdmin() {
  const { selectedAccount } = useAccount()
  const accountId = selectedAccount?.id ?? ""

  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const { data: usersData, isLoading, isError, refetch } = useUsersList(accountId, page, pageSize)
  const { data: rolesData } = useRolesList(accountId)
  const createMutation = useCreateUser(accountId)
  const updateMutation = useUpdateUser(accountId)
  const deleteMutation = useDeleteUser(accountId)

  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<UserResponse | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<UserResponse | null>(null)

  // Form state
  const [nombre, setNombre] = useState("")
  const [apellido, setApellido] = useState("")
  const [email, setEmail] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [roleId, setRoleId] = useState("")
  const [activo, setActivo] = useState(true)

  const users = usersData?.items ?? []
  const roles = rolesData?.items ?? []

  const resetForm = () => {
    setNombre("")
    setApellido("")
    setEmail("")
    setUsername("")
    setPassword("")
    setRoleId("")
    setActivo(true)
  }

  const openCreate = () => {
    setEditing(null)
    resetForm()
    setShowForm(true)
  }

  const openEdit = (user: UserResponse) => {
    setEditing(user)
    setNombre(user.nombre)
    setApellido(user.apellido)
    setEmail(user.email)
    setUsername(user.username)
    setPassword("")
    setRoleId(user.role_id ?? "")
    setActivo(user.activo)
    setShowForm(true)
  }

  const handleSubmit = () => {
    const trimNombre = nombre.trim()
    const trimApellido = apellido.trim()
    const trimEmail = email.trim()
    const trimUsername = username.trim()

    if (!trimNombre || !trimApellido || !trimEmail || !trimUsername) return

    if (editing) {
      const payload: Record<string, unknown> = {
        nombre: trimNombre,
        apellido: trimApellido,
        email: trimEmail,
        username: trimUsername,
        role_id: roleId || null,
        activo,
      }
      if (password) payload.password = password
      updateMutation.mutate(
        { userId: editing.id, payload },
        { onSuccess: () => setShowForm(false) }
      )
    } else {
      if (!password) return
      createMutation.mutate(
        {
          nombre: trimNombre,
          apellido: trimApellido,
          email: trimEmail,
          username: trimUsername,
          password,
          role_id: roleId || null,
          activo,
        },
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
          <h2 className="text-2xl font-bold text-foreground">Usuarios</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Administra los usuarios de esta cuenta.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Crear usuario
        </button>
      </div>

      <div className="rounded-xl border border-border bg-white shadow-sm">
        {isLoading ? (
          <div className="p-6"><TableSkeleton rows={5} cols={6} /></div>
        ) : isError ? (
          <ErrorState onRetry={() => refetch()} />
        ) : users.length === 0 ? (
          <EmptyState
            icon={UserCog}
            title="No hay usuarios"
            description="Crea un usuario para asignarle un rol y permisos."
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Nombre</th>
                    <th className="px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Username</th>
                    <th className="px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Rol</th>
                    <th className="px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Estado</th>
                    <th className="px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Creado</th>
                    <th className="px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-foreground">
                        {user.nombre} {user.apellido}
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{user.email}</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground font-mono">{user.username}</td>
                      <td className="px-6 py-4">
                        {user.role_nombre ? (
                          <Badge variant="info">{user.role_nombre}</Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">Sin rol</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={user.activo ? "success" : "danger"}>
                          {user.activo ? "Activo" : "Inactivo"}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground whitespace-nowrap">
                        {formatDate(user.created_at)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => openEdit(user)}
                            className="inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium text-primary hover:bg-primary/10 transition-colors"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            Editar
                          </button>
                          <button
                            onClick={() => setDeleteTarget(user)}
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
            <div className="px-6 pb-4">
              <Pagination
                page={page}
                pageSize={pageSize}
                total={usersData?.total ?? 0}
                onPageChange={setPage}
                onPageSizeChange={(s) => { setPageSize(s); setPage(1) }}
              />
            </div>
          </>
        )}
      </div>

      {/* Create / Edit modal */}
      <Modal
        open={showForm}
        onOpenChange={setShowForm}
        title={editing ? "Editar usuario" : "Crear usuario"}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Nombre</label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Juan"
                className="w-full rounded-lg border border-border bg-white px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Apellido</label>
              <input
                type="text"
                value={apellido}
                onChange={(e) => setApellido(e.target.value)}
                placeholder="Perez"
                className="w-full rounded-lg border border-border bg-white px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="juan@empresa.com"
              className="w-full rounded-lg border border-border bg-white px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="juanperez"
                className="w-full rounded-lg border border-border bg-white px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                {editing ? "Password (dejar vacio para no cambiar)" : "Password"}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={editing ? "••••••" : "Minimo 6 caracteres"}
                className="w-full rounded-lg border border-border bg-white px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Rol</label>
              <div className="relative">
                <select
                  value={roleId}
                  onChange={(e) => setRoleId(e.target.value)}
                  className="w-full appearance-none rounded-lg border border-border bg-white px-4 py-2.5 pr-10 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">Sin rol</option>
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>{r.nombre}</option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Estado</label>
              <button
                type="button"
                onClick={() => setActivo(!activo)}
                className={`w-full rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${
                  activo
                    ? "border-green-300 bg-green-50 text-green-700"
                    : "border-red-300 bg-red-50 text-red-700"
                }`}
              >
                {activo ? "Activo" : "Inactivo"}
              </button>
            </div>
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
              disabled={!nombre.trim() || !apellido.trim() || !email.trim() || !username.trim() || (!editing && !password) || isPending}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {isPending ? "Guardando..." : editing ? "Guardar cambios" : "Crear usuario"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete confirm */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Eliminar usuario"
        description={`Se eliminara al usuario "${deleteTarget?.nombre} ${deleteTarget?.apellido}" (${deleteTarget?.username}). Esta accion no se puede deshacer.`}
        confirmLabel="Eliminar"
        variant="danger"
        onConfirm={handleDelete}
        loading={deleteMutation.isPending}
      />
    </div>
  )
}
