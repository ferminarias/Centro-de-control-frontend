import { useState, useEffect } from "react"
import Modal from "@/components/ui/Modal"
import { useCreateField, useUpdateField } from "@/hooks/useFields"
import type { FieldResponse, TipoDato } from "@/types"

const TIPO_OPTIONS: TipoDato[] = ["string", "number", "boolean", "datetime", "email", "phone"]

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  accountId: string
  field?: FieldResponse | null
}

export default function FieldFormModal({ open, onOpenChange, accountId, field }: Props) {
  const [nombre, setNombre] = useState("")
  const [tipoDato, setTipoDato] = useState<TipoDato>("string")
  const [descripcion, setDescripcion] = useState("")
  const [esRequerido, setEsRequerido] = useState(false)
  const isEdit = !!field

  const createMutation = useCreateField(accountId)
  const updateMutation = useUpdateField(accountId)
  const isPending = createMutation.isPending || updateMutation.isPending

  useEffect(() => {
    if (field) {
      setNombre(field.nombre_campo)
      setTipoDato(field.tipo_dato)
      setDescripcion(field.descripcion || "")
      setEsRequerido(field.es_requerido)
    } else {
      setNombre("")
      setTipoDato("string")
      setDescripcion("")
      setEsRequerido(false)
    }
  }, [field, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isEdit) {
      await updateMutation.mutateAsync({
        fieldId: field!.id,
        payload: { tipo_dato: tipoDato, descripcion: descripcion || undefined, es_requerido: esRequerido },
      })
    } else {
      await createMutation.mutateAsync({
        nombre_campo: nombre.trim(),
        tipo_dato: tipoDato,
        descripcion: descripcion || undefined,
        es_requerido: esRequerido,
      })
    }
    onOpenChange(false)
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange} title={isEdit ? "Editar campo" : "Nuevo campo"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium text-foreground">Nombre del campo</label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            disabled={isEdit}
            placeholder="nombre_campo"
            className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 disabled:bg-gray-50"
            required
          />
          {isEdit && <p className="text-xs text-muted-foreground mt-1">El nombre no es editable</p>}
        </div>

        <div>
          <label className="text-sm font-medium text-foreground">Tipo de dato</label>
          <select
            value={tipoDato}
            onChange={(e) => setTipoDato(e.target.value as TipoDato)}
            className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {TIPO_OPTIONS.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium text-foreground">Descripcion</label>
          <textarea
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder="Descripcion opcional del campo"
            rows={2}
            className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
          />
        </div>

        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-foreground">Es requerido</label>
          <button
            type="button"
            role="switch"
            aria-checked={esRequerido}
            onClick={() => setEsRequerido(!esRequerido)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
              esRequerido ? "bg-primary" : "bg-gray-300"
            }`}
          >
            <span className={`pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg transition-transform ${esRequerido ? "translate-x-5" : "translate-x-0"}`} />
          </button>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={() => onOpenChange(false)} className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-gray-50 transition-colors">
            Cancelar
          </button>
          <button type="submit" disabled={isPending || (!isEdit && !nombre.trim())} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50 transition-colors">
            {isPending ? "Guardando..." : isEdit ? "Actualizar" : "Crear campo"}
          </button>
        </div>
      </form>
    </Modal>
  )
}
