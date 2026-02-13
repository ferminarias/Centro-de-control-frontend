import { useState } from "react"
import { Plus, Pencil, Trash2 } from "lucide-react"
import Modal from "@/components/ui/Modal"
import Badge from "@/components/ui/Badge"
import CopyButton from "@/components/ui/CopyButton"
import ConfirmDialog from "@/components/ui/ConfirmDialog"
import { Spinner } from "@/components/ui/Loading"
import { useAccountsList, useCreateAccount, useUpdateAccount, useDeleteAccount, useToggleAutoCreate } from "@/hooks/useAccounts"
import { useAccount } from "@/context/AccountContext"
import { formatDateShort } from "@/lib/utils"
import type { AccountResponse } from "@/types"

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function AdminPanel({ open, onOpenChange }: Props) {
  const { data, isLoading } = useAccountsList()
  const createMutation = useCreateAccount()
  const updateMutation = useUpdateAccount()
  const deleteMutation = useDeleteAccount()
  const toggleMutation = useToggleAutoCreate()
  const { selectedAccount, setSelectedAccount } = useAccount()

  const [showCreate, setShowCreate] = useState(false)
  const [createName, setCreateName] = useState("")
  const [createAuto, setCreateAuto] = useState(true)
  const [createdAccount, setCreatedAccount] = useState<AccountResponse | null>(null)

  const [editingAccount, setEditingAccount] = useState<AccountResponse | null>(null)
  const [editName, setEditName] = useState("")

  const [deletingAccount, setDeletingAccount] = useState<AccountResponse | null>(null)
  const [togglingAccount, setTogglingAccount] = useState<AccountResponse | null>(null)

  const accounts = data?.items ?? []

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!createName.trim()) return
    const result = await createMutation.mutateAsync({
      nombre: createName.trim(),
      auto_crear_campos: createAuto,
    })
    setCreatedAccount(result)
    setCreateName("")
    setCreateAuto(true)
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingAccount || !editName.trim()) return
    await updateMutation.mutateAsync({ id: editingAccount.id, payload: { nombre: editName.trim() } })
    if (selectedAccount?.id === editingAccount.id) {
      setSelectedAccount({ ...selectedAccount, nombre: editName.trim() })
    }
    setEditingAccount(null)
  }

  const handleDelete = async () => {
    if (!deletingAccount) return
    await deleteMutation.mutateAsync(deletingAccount.id)
    if (selectedAccount?.id === deletingAccount.id) setSelectedAccount(null)
    setDeletingAccount(null)
  }

  const handleToggle = async () => {
    if (!togglingAccount) return
    const updated = await toggleMutation.mutateAsync(togglingAccount.id)
    if (selectedAccount?.id === togglingAccount.id) setSelectedAccount(updated)
    setTogglingAccount(null)
  }

  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000"

  return (
    <>
      <Modal open={open} onOpenChange={onOpenChange} title="Administrador" description="Gestionar cuentas del sistema" wide>
        <div className="space-y-4 max-h-[65vh] overflow-y-auto">
          {/* Create button */}
          <div className="flex justify-end">
            <button
              onClick={() => { setShowCreate(true); setCreatedAccount(null) }}
              className="flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Nueva cuenta
            </button>
          </div>

          {isLoading ? (
            <Spinner />
          ) : accounts.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-8">
              No hay cuentas creadas. Crea la primera.
            </p>
          ) : (
            <div className="space-y-2">
              {accounts.map((account) => (
                <div
                  key={account.id}
                  className="flex items-center gap-4 rounded-lg border border-border p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-sm font-semibold text-primary">
                      {account.nombre.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm truncate">{account.nombre}</p>
                      <Badge variant={account.activo ? "success" : "danger"}>
                        {account.activo ? "Activo" : "Inactivo"}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Creada: {formatDateShort(account.created_at)}
                    </p>
                  </div>

                  {/* Auto-create toggle */}
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-muted-foreground">Auto-crear</span>
                    <button
                      onClick={() => setTogglingAccount(account)}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                        account.auto_crear_campos ? "bg-green-500" : "bg-gray-300"
                      }`}
                      role="switch"
                      aria-checked={account.auto_crear_campos}
                    >
                      <span
                        className={`pointer-events-none block h-4 w-4 rounded-full bg-white shadow transition-transform ${
                          account.auto_crear_campos ? "translate-x-4" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => { setEditingAccount(account); setEditName(account.nombre) }}
                      className="rounded-md p-1.5 text-gray-400 hover:text-foreground hover:bg-gray-100 transition-colors"
                      title="Editar"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    {account.activo && (
                      <button
                        onClick={() => setDeletingAccount(account)}
                        className="rounded-md p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Desactivar"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>

      {/* Create Account Modal */}
      <Modal
        open={showCreate}
        onOpenChange={(o) => { setShowCreate(o); if (!o) setCreatedAccount(null) }}
        title={createdAccount ? "Cuenta creada" : "Nueva cuenta"}
      >
        {createdAccount ? (
          <div className="space-y-4">
            <div className="rounded-lg bg-green-50 border border-green-200 p-4">
              <p className="text-sm font-medium text-green-700 mb-1">Cuenta creada exitosamente</p>
              <p className="text-foreground font-semibold">{createdAccount.nombre}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">API Key</label>
              <div className="flex items-center gap-2 mt-1 rounded-lg bg-gray-50 border border-border p-3 font-mono text-sm">
                <span className="flex-1 break-all">{createdAccount.api_key}</span>
                <CopyButton text={createdAccount.api_key} />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">URL Webhook</label>
              <div className="flex items-center gap-2 mt-1 rounded-lg bg-gray-50 border border-border p-3 font-mono text-xs">
                <span className="flex-1 break-all">
                  {apiUrl}/api/v1/ingest/{createdAccount.api_key}
                </span>
                <CopyButton text={`${apiUrl}/api/v1/ingest/${createdAccount.api_key}`} />
              </div>
            </div>
            <button
              onClick={() => { setShowCreate(false); setCreatedAccount(null) }}
              className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary/90 transition-colors"
            >
              Cerrar
            </button>
          </div>
        ) : (
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground">Nombre</label>
              <input
                type="text"
                value={createName}
                onChange={(e) => setCreateName(e.target.value)}
                placeholder="Nombre de la cuenta"
                className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                required
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-foreground">Auto-crear campos</label>
                <p className="text-xs text-muted-foreground">Crear campos automaticamente al recibir datos</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={createAuto}
                onClick={() => setCreateAuto(!createAuto)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                  createAuto ? "bg-primary" : "bg-gray-300"
                }`}
              >
                <span className={`pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg transition-transform ${createAuto ? "translate-x-5" : "translate-x-0"}`} />
              </button>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setShowCreate(false)} className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-gray-50 transition-colors">
                Cancelar
              </button>
              <button type="submit" disabled={createMutation.isPending || !createName.trim()} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50 transition-colors">
                {createMutation.isPending ? "Creando..." : "Crear cuenta"}
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Edit name modal */}
      <Modal open={!!editingAccount} onOpenChange={(o) => !o && setEditingAccount(null)} title="Editar cuenta">
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
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setEditingAccount(null)} className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-gray-50 transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={updateMutation.isPending || !editName.trim()} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50 transition-colors">
              {updateMutation.isPending ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete confirmation */}
      <ConfirmDialog
        open={!!deletingAccount}
        onOpenChange={(o) => !o && setDeletingAccount(null)}
        title="Desactivar cuenta"
        description={`¿Estas seguro de desactivar la cuenta "${deletingAccount?.nombre}"? La cuenta dejara de recibir datos.`}
        confirmLabel="Desactivar"
        variant="danger"
        onConfirm={handleDelete}
        loading={deleteMutation.isPending}
      />

      {/* Toggle auto-create confirmation */}
      <ConfirmDialog
        open={!!togglingAccount}
        onOpenChange={(o) => !o && setTogglingAccount(null)}
        title="Cambiar auto-crear campos"
        description={`¿Cambiar auto-crear campos a ${togglingAccount?.auto_crear_campos ? "OFF" : "ON"} para "${togglingAccount?.nombre}"?`}
        confirmLabel="Confirmar"
        onConfirm={handleToggle}
        loading={toggleMutation.isPending}
      />
    </>
  )
}
