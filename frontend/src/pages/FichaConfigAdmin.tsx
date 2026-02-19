/**
 * Página de Configuración de Ficha de Contacto
 * Permite al admin definir qué campos se muestran en la ficha del agente
 */
import { useState, useEffect, useMemo } from "react"
import {
  LayoutList,
  Plus,
  Trash2,
  GripVertical,
  Eye,
  EyeOff,
  Save,
  User,
  Phone,
} from "lucide-react"
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { useAccount } from "@/context/AccountContext"
import {
  useFichaConfig,
  useAvailableFields,
  useSaveFichaConfig,
  useDeleteFichaConfig,
} from "@/hooks/useFichaConfig"
import { useCampaniasList } from "@/hooks/useCampanias"
import { Spinner } from "@/components/ui/Loading"
import Badge from "@/components/ui/Badge"
import { cn } from "@/lib/utils"
import type { FichaCampoConfig } from "@/types/fichaConfig"

const SECCIONES: { value: FichaCampoConfig["seccion"]; label: string }[] = [
  { value: "header", label: "Header" },
  { value: "telefonos", label: "Teléfonos" },
  { value: "datos", label: "Datos" },
]

export default function FichaConfigAdmin() {
  const { selectedAccount } = useAccount()
  const accountId = selectedAccount?.id ?? ""

  // Campaign selector: null = global config
  const [selectedCampaniaId, setSelectedCampaniaId] = useState<string | undefined>(undefined)

  const { data: campanias } = useCampaniasList(accountId)
  const { data: config, isLoading: isLoadingConfig } = useFichaConfig(accountId, selectedCampaniaId)
  const { data: fieldsData, isLoading: isLoadingFields } = useAvailableFields(accountId)
  const saveMutation = useSaveFichaConfig(accountId)
  const deleteMutation = useDeleteFichaConfig(accountId)

  const [campos, setCampos] = useState<FichaCampoConfig[]>([])
  const [dirty, setDirty] = useState(false)

  // Sync from server when config changes
  useEffect(() => {
    if (config?.campos) {
      setCampos(config.campos)
      setDirty(false)
    } else {
      setCampos([])
      setDirty(false)
    }
  }, [config])

  const availableFields = fieldsData?.fields ?? []
  const usedKeys = useMemo(() => new Set(campos.map((c) => c.key)), [campos])
  const unusedFields = useMemo(
    () => availableFields.filter((f) => !usedKeys.has(f)),
    [availableFields, usedKeys]
  )

  // DnD
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    setCampos((prev) => {
      const oldIndex = prev.findIndex((c) => c.key === active.id)
      const newIndex = prev.findIndex((c) => c.key === over.id)
      const reordered = arrayMove(prev, oldIndex, newIndex)
      return reordered.map((c, i) => ({ ...c, orden: i }))
    })
    setDirty(true)
  }

  // Add a field
  const addField = (key: string) => {
    setCampos((prev) => [
      ...prev,
      { key, label: key, visible: true, orden: prev.length, seccion: "datos" },
    ])
    setDirty(true)
  }

  // Remove a field
  const removeField = (key: string) => {
    setCampos((prev) =>
      prev.filter((c) => c.key !== key).map((c, i) => ({ ...c, orden: i }))
    )
    setDirty(true)
  }

  // Update field property
  const updateField = (key: string, updates: Partial<FichaCampoConfig>) => {
    setCampos((prev) => prev.map((c) => (c.key === key ? { ...c, ...updates } : c)))
    setDirty(true)
  }

  // Save
  const handleSave = () => {
    saveMutation.mutate({
      campania_id: selectedCampaniaId,
      campos,
    })
    setDirty(false)
  }

  // Delete config
  const handleDelete = () => {
    deleteMutation.mutate(selectedCampaniaId)
  }

  // Preview grouping
  const previewCampos = campos.filter((c) => c.visible).sort((a, b) => a.orden - b.orden)
  const headerCampos = previewCampos.filter((c) => c.seccion === "header")
  const telefonosCampos = previewCampos.filter((c) => c.seccion === "telefonos")
  const datosCampos = previewCampos.filter((c) => c.seccion === "datos")

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <LayoutList className="h-6 w-6" />
            Configuración de Ficha
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Define qué campos ve el agente en la ficha de contacto
          </p>
        </div>
        <div className="flex items-center gap-2">
          {campos.length > 0 && (
            <button
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 text-sm"
            >
              Eliminar config
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={!dirty || saveMutation.isPending || campos.length === 0}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2",
              dirty && campos.length > 0
                ? "bg-primary text-white hover:bg-primary/90"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            )}
          >
            <Save className="h-4 w-4" />
            {saveMutation.isPending ? "Guardando..." : "Guardar configuración"}
          </button>
        </div>
      </div>

      {/* Campaign selector */}
      <div className="flex items-center gap-4 p-4 bg-white rounded-lg border">
        <label className="text-sm font-medium text-gray-700">Alcance:</label>
        <select
          value={selectedCampaniaId ?? ""}
          onChange={(e) => setSelectedCampaniaId(e.target.value || undefined)}
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
        >
          <option value="">Configuración global (cuenta)</option>
          {(campanias?.items ?? []).map((camp) => (
            <option key={camp.id} value={camp.id}>
              {camp.nombre}
            </option>
          ))}
        </select>
        <Badge variant={selectedCampaniaId ? "info" : "secondary"}>
          {selectedCampaniaId ? "Por campaña" : "Global"}
        </Badge>
      </div>

      {isLoadingConfig || isLoadingFields ? (
        <Spinner />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Config panel */}
          <div className="lg:col-span-2 space-y-4">
            {/* Available fields */}
            {unusedFields.length > 0 && (
              <div className="p-4 bg-white rounded-lg border">
                <h3 className="text-sm font-medium text-gray-700 mb-3">
                  Campos disponibles para agregar
                </h3>
                <div className="flex flex-wrap gap-2">
                  {unusedFields.map((field) => (
                    <button
                      key={field}
                      onClick={() => addField(field)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full border border-dashed border-gray-300 text-sm text-gray-600 hover:border-primary hover:text-primary hover:bg-primary/5 transition-colors"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      {field}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Configured fields (drag & drop) */}
            <div className="p-4 bg-white rounded-lg border">
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                Campos configurados ({campos.length})
              </h3>

              {campos.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-sm">
                  Agrega campos desde la lista de arriba para configurar la ficha
                </div>
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={campos.map((c) => c.key)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-2">
                      {campos.map((campo) => (
                        <SortableField
                          key={campo.key}
                          campo={campo}
                          onUpdate={(updates) => updateField(campo.key, updates)}
                          onRemove={() => removeField(campo.key)}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              )}
            </div>
          </div>

          {/* Right: Live preview */}
          <div className="space-y-4">
            <div className="p-4 bg-white rounded-lg border sticky top-4">
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                Vista previa
              </h3>
              <div className="border rounded-lg p-4 bg-gray-50 space-y-4">
                {/* Header section */}
                {headerCampos.length > 0 && (
                  <div className="flex items-center gap-3 pb-3 border-b border-gray-200">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      {headerCampos.map((c) => (
                        <p
                          key={c.key}
                          className={cn(
                            headerCampos.indexOf(c) === 0
                              ? "text-base font-semibold"
                              : "text-xs text-gray-500"
                          )}
                        >
                          {c.label}
                        </p>
                      ))}
                    </div>
                  </div>
                )}

                {/* Telefonos section */}
                {telefonosCampos.length > 0 && (
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-semibold uppercase text-gray-400">
                      Teléfonos
                    </p>
                    {telefonosCampos.map((c) => (
                      <div
                        key={c.key}
                        className="flex items-center gap-2 p-2 bg-white rounded border text-sm"
                      >
                        <Phone className="h-4 w-4 text-green-600" />
                        <span className="text-gray-600">{c.label}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Datos section */}
                {datosCampos.length > 0 && (
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-semibold uppercase text-gray-400">
                      Datos del contacto
                    </p>
                    <div className="bg-white rounded border p-2 space-y-1">
                      {datosCampos.map((c) => (
                        <div
                          key={c.key}
                          className="flex justify-between py-1 border-b border-gray-100 last:border-0 text-xs"
                        >
                          <span className="text-gray-500">{c.label}</span>
                          <span className="text-gray-400">valor</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {previewCampos.length === 0 && (
                  <p className="text-center text-xs text-gray-400 py-4">
                    Sin campos configurados.
                    <br />
                    Se mostrará el fallback (todos los campos).
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Sortable Field Row
// ─────────────────────────────────────────────────────────────────────────────

function SortableField({
  campo,
  onUpdate,
  onRemove,
}: {
  campo: FichaCampoConfig
  onUpdate: (updates: Partial<FichaCampoConfig>) => void
  onRemove: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: campo.key })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg border bg-white",
        isDragging && "shadow-lg",
        !campo.visible && "opacity-60"
      )}
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab text-gray-400 hover:text-gray-600"
      >
        <GripVertical className="h-4 w-4" />
      </button>

      {/* Key name */}
      <Badge variant="secondary" className="font-mono text-[10px]">
        {campo.key}
      </Badge>

      {/* Editable label */}
      <input
        type="text"
        value={campo.label}
        onChange={(e) => onUpdate({ label: e.target.value })}
        className="flex-1 text-sm border border-gray-200 rounded px-2 py-1 min-w-0"
        placeholder="Label..."
      />

      {/* Section selector */}
      <select
        value={campo.seccion}
        onChange={(e) =>
          onUpdate({ seccion: e.target.value as FichaCampoConfig["seccion"] })
        }
        className="text-sm border border-gray-200 rounded px-2 py-1"
      >
        {SECCIONES.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>

      {/* Visibility toggle */}
      <button
        onClick={() => onUpdate({ visible: !campo.visible })}
        className={cn(
          "p-1.5 rounded transition-colors",
          campo.visible
            ? "text-green-600 hover:bg-green-50"
            : "text-gray-400 hover:bg-gray-100"
        )}
        title={campo.visible ? "Visible" : "Oculto"}
      >
        {campo.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
      </button>

      {/* Remove */}
      <button
        onClick={onRemove}
        className="p-1.5 rounded text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  )
}
