import { useState } from "react"
import { Plus, Pencil, Trash2, Check, X, Database } from "lucide-react"
import { useAccount } from "@/context/AccountContext"
import { useFieldsList, useDeleteField } from "@/hooks/useFields"
import { TableSkeleton } from "@/components/ui/Loading"
import ErrorState from "@/components/ui/ErrorState"
import EmptyState from "@/components/ui/EmptyState"
import Badge from "@/components/ui/Badge"
import ConfirmDialog from "@/components/ui/ConfirmDialog"
import FieldFormModal from "@/components/fields/FieldFormModal"
import { formatDate, TIPO_DATO_COLORS } from "@/lib/utils"
import type { FieldResponse } from "@/types"

export default function Fields() {
  const { selectedAccount } = useAccount()
  const { data, isLoading, isError, refetch } = useFieldsList(selectedAccount?.id)
  const deleteMutation = useDeleteField(selectedAccount?.id ?? "")

  const [showForm, setShowForm] = useState(false)
  const [editingField, setEditingField] = useState<FieldResponse | null>(null)
  const [deletingField, setDeletingField] = useState<FieldResponse | null>(null)

  if (!selectedAccount) {
    return (
      <EmptyState
        icon={Database}
        title="Selecciona un cliente"
        description="Elige un cliente del selector en el header para ver sus campos."
      />
    )
  }

  const fields = data?.items ?? []

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Datos</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Campos personalizados de {selectedAccount.nombre}
          </p>
        </div>
        <button
          onClick={() => { setEditingField(null); setShowForm(true) }}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Nuevo campo
        </button>
      </div>

      <div className="rounded-xl border border-border bg-white shadow-sm">
        {isLoading ? (
          <div className="p-6"><TableSkeleton rows={4} cols={5} /></div>
        ) : isError ? (
          <ErrorState onRetry={() => refetch()} />
        ) : fields.length === 0 ? (
          <EmptyState
            icon={Database}
            title="No hay campos"
            description="Define campos para validar los datos de ingesta."
            action={
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Nuevo campo
              </button>
            }
          />
        ) : (
          <>
            <div className="px-6 py-3 border-b border-border">
              <span className="text-sm text-muted-foreground">{fields.length} campo{fields.length !== 1 ? "s" : ""}</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Nombre</th>
                    <th className="px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Tipo</th>
                    <th className="px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Descripcion</th>
                    <th className="px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Requerido</th>
                    <th className="px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Creado</th>
                    <th className="px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {fields.map((field) => (
                    <tr key={field.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium font-mono">{field.nombre_campo}</td>
                      <td className="px-6 py-4">
                        <Badge className={TIPO_DATO_COLORS[field.tipo_dato]}>{field.tipo_dato}</Badge>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground max-w-xs truncate">
                        {field.descripcion || <span className="text-gray-300">-</span>}
                      </td>
                      <td className="px-6 py-4">
                        {field.es_requerido ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <X className="h-4 w-4 text-gray-300" />
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{formatDate(field.created_at)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => { setEditingField(field); setShowForm(true) }}
                            className="rounded-md p-1.5 text-gray-400 hover:text-foreground hover:bg-gray-100 transition-colors"
                            title="Editar"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setDeletingField(field)}
                            className="rounded-md p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
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

      <FieldFormModal
        open={showForm}
        onOpenChange={setShowForm}
        accountId={selectedAccount.id}
        field={editingField}
      />

      <ConfirmDialog
        open={!!deletingField}
        onOpenChange={(o) => !o && setDeletingField(null)}
        title="Eliminar campo"
        description={`¿Estas seguro de eliminar el campo "${deletingField?.nombre_campo}"? Esta accion no se puede deshacer.`}
        confirmLabel="Eliminar"
        variant="danger"
        onConfirm={() => {
          if (deletingField) {
            deleteMutation.mutate(deletingField.id, { onSuccess: () => setDeletingField(null) })
          }
        }}
        loading={deleteMutation.isPending}
      />
    </div>
  )
}
