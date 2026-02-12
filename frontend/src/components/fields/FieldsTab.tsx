import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Plus, Pencil, Trash2, Check, X, List } from "lucide-react"
import { getFields, deleteField } from "@/api/fields"
import { TableSkeleton } from "@/components/ui/Loading"
import ErrorState from "@/components/ui/ErrorState"
import EmptyState from "@/components/ui/EmptyState"
import ConfirmDialog from "@/components/ui/ConfirmDialog"
import FieldFormModal from "./FieldFormModal"
import { formatDate, TIPO_DATO_COLORS } from "@/lib/utils"
import type { FieldResponse } from "@/types"
import { toast } from "sonner"

interface Props {
  accountId: string
}

export default function FieldsTab({ accountId }: Props) {
  const [showForm, setShowForm] = useState(false)
  const [editingField, setEditingField] = useState<FieldResponse | null>(null)
  const [deletingField, setDeletingField] = useState<FieldResponse | null>(null)
  const queryClient = useQueryClient()

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["fields", accountId],
    queryFn: () => getFields(accountId),
  })

  const deleteMutation = useMutation({
    mutationFn: deleteField,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fields", accountId] })
      toast.success("Campo eliminado")
      setDeletingField(null)
    },
    onError: () => toast.error("Error al eliminar el campo"),
  })

  if (isLoading) return <div className="p-6"><TableSkeleton rows={4} cols={5} /></div>
  if (isError) return <ErrorState onRetry={() => refetch()} />

  const fields = data?.items ?? []

  return (
    <div>
      <div className="flex items-center justify-between p-4 border-b border-border">
        <span className="text-sm text-muted-foreground">{fields.length} campos</span>
        <button
          onClick={() => { setEditingField(null); setShowForm(true) }}
          className="flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Nuevo campo
        </button>
      </div>

      {fields.length === 0 ? (
        <EmptyState
          icon={List}
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
                <tr key={field.id} className="hover:bg-accent/30 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium font-mono">{field.nombre_campo}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${TIPO_DATO_COLORS[field.tipo_dato] || ""}`}>
                      {field.tipo_dato}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {field.descripcion || "-"}
                  </td>
                  <td className="px-6 py-4">
                    {field.es_requerido ? (
                      <Check className="h-4 w-4 text-green-400" />
                    ) : (
                      <X className="h-4 w-4 text-muted-foreground" />
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {formatDate(field.created_at)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => { setEditingField(field); setShowForm(true) }}
                        className="rounded-md p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                        title="Editar"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setDeletingField(field)}
                        className="rounded-md p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
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
      )}

      <FieldFormModal
        open={showForm}
        onOpenChange={setShowForm}
        accountId={accountId}
        field={editingField}
      />

      <ConfirmDialog
        open={!!deletingField}
        onOpenChange={(open) => !open && setDeletingField(null)}
        title="Eliminar campo"
        description={`¿Estas seguro de eliminar el campo "${deletingField?.nombre_campo}"? Esta accion no se puede deshacer.`}
        confirmLabel="Eliminar"
        variant="danger"
        onConfirm={() => deletingField && deleteMutation.mutate(deletingField.id)}
        loading={deleteMutation.isPending}
      />
    </div>
  )
}
