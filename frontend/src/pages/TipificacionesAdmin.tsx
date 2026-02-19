import { useState } from "react"
import {
  Tags,
  Plus,
  Pencil,
  Trash2,
  ChevronDown,
  ChevronRight,
  Palette,
  Check,
  AlertCircle,
} from "lucide-react"
import { useAccount } from "@/context/AccountContext"
import {
  useTipificacionesList,
  useCreateTipificacion,
  useUpdateTipificacion,
  useDeleteTipificacion,
  useCreateSubtipificacion,
  useUpdateSubtipificacion,
  useDeleteSubtipificacion,
} from "@/hooks/useTipificaciones"
import { TableSkeleton } from "@/components/ui/Loading"
import ErrorState from "@/components/ui/ErrorState"
import EmptyState from "@/components/ui/EmptyState"
import Badge from "@/components/ui/Badge"
import Modal from "@/components/ui/Modal"
import ConfirmDialog from "@/components/ui/ConfirmDialog"
import { cn } from "@/lib/utils"
import type { TipificacionResponse, SubtipificacionResponse } from "@/types"

// Predefined colors for selection
const PREDEFINED_COLORS = [
  "#EF4444", // Red
  "#F97316", // Orange
  "#F59E0B", // Amber
  "#84CC16", // Lime
  "#22C55E", // Green
  "#10B981", // Emerald
  "#14B8A6", // Teal
  "#06B6D4", // Cyan
  "#0EA5E9", // Sky
  "#3B82F6", // Blue
  "#6366F1", // Indigo
  "#8B5CF6", // Violet
  "#A855F7", // Purple
  "#D946EF", // Fuchsia
  "#EC4899", // Pink
  "#F43F5E", // Rose
  "#6B7280", // Gray
  "#1F2937", // Dark Gray
]

export default function TipificacionesAdmin() {
  const { selectedAccount } = useAccount()
  const accountId = selectedAccount?.id ?? ""

  const { data, isLoading, isError, refetch } = useTipificacionesList(accountId, true)
  const createMutation = useCreateTipificacion(accountId)
  const updateMutation = useUpdateTipificacion(accountId)
  const deleteMutation = useDeleteTipificacion(accountId)
  const createSubMutation = useCreateSubtipificacion(accountId, "")
  const updateSubMutation = useUpdateSubtipificacion(accountId)
  const deleteSubMutation = useDeleteSubtipificacion(accountId)

  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())

  // Modal states
  const [showTipModal, setShowTipModal] = useState(false)
  const [showSubModal, setShowSubModal] = useState(false)
  const [editingTip, setEditingTip] = useState<TipificacionResponse | null>(null)
  const [editingSub, setEditingSub] = useState<SubtipificacionResponse | null>(null)
  const [parentTipId, setParentTipId] = useState<string>("")
  const [deleteTarget, setDeleteTarget] = useState<{ type: "tip" | "sub"; item: any } | null>(null)

  // Form states
  const [nombre, setNombre] = useState("")
  const [descripcion, setDescripcion] = useState("")
  const [color, setColor] = useState("#6B7280")
  const [orden, setOrden] = useState(0)
  const [activo, setActivo] = useState(true)
  const [esFinal, setEsFinal] = useState(false)

  const tipificaciones = data?.items ?? []

  const resetForm = () => {
    setNombre("")
    setDescripcion("")
    setColor("#6B7280")
    setOrden(0)
    setActivo(true)
    setEsFinal(false)
  }

  const openCreateTip = () => {
    setEditingTip(null)
    resetForm()
    setShowTipModal(true)
  }

  const openEditTip = (tip: TipificacionResponse) => {
    setEditingTip(tip)
    setNombre(tip.nombre)
    setDescripcion(tip.descripcion || "")
    setColor(tip.color)
    setOrden(tip.orden)
    setActivo(tip.activo)
    setEsFinal(tip.es_final)
    setShowTipModal(true)
  }

  const openCreateSub = (tipificacionId: string) => {
    setEditingSub(null)
    setParentTipId(tipificacionId)
    resetForm()
    setShowSubModal(true)
  }

  const openEditSub = (sub: SubtipificacionResponse) => {
    setEditingSub(sub)
    setParentTipId(sub.tipificacion_id)
    setNombre(sub.nombre)
    setDescripcion(sub.descripcion || "")
    setColor(sub.color || "#6B7280")
    setOrden(sub.orden)
    setActivo(sub.activo)
    setShowSubModal(true)
  }

  const toggleExpand = (id: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const handleSaveTip = () => {
    const trimmed = nombre.trim()
    if (!trimmed) return

    const payload = {
      nombre: trimmed,
      descripcion: descripcion.trim() || undefined,
      color,
      orden,
      activo,
      es_final: esFinal,
    }

    if (editingTip) {
      updateMutation.mutate(
        { id: editingTip.id, payload },
        { onSuccess: () => setShowTipModal(false) }
      )
    } else {
      createMutation.mutate(payload, { onSuccess: () => setShowTipModal(false) })
    }
  }

  const handleSaveSub = () => {
    const trimmed = nombre.trim()
    if (!trimmed || !parentTipId) return

    const payload = {
      nombre: trimmed,
      descripcion: descripcion.trim() || undefined,
      color: color || undefined,
      orden,
      activo,
    }

    if (editingSub) {
      updateSubMutation.mutate(
        { id: editingSub.id, payload },
        { onSuccess: () => setShowSubModal(false) }
      )
    } else {
      createSubMutation.mutate(payload, { onSuccess: () => setShowSubModal(false) })
    }
  }

  const handleDelete = () => {
    if (!deleteTarget) return

    if (deleteTarget.type === "tip") {
      deleteMutation.mutate(deleteTarget.item.id, {
        onSuccess: () => setDeleteTarget(null),
      })
    } else {
      deleteSubMutation.mutate(deleteTarget.item.id, {
        onSuccess: () => setDeleteTarget(null),
      })
    }
  }

  const isPending =
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending ||
    createSubMutation.isPending ||
    updateSubMutation.isPending ||
    deleteSubMutation.isPending

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Tipificaciones</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Administra las categorías y subcategorías para clasificar leads.
          </p>
        </div>
        <button
          onClick={openCreateTip}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Nueva Tipificación
        </button>
      </div>

      {/* Content */}
      <div className="rounded-xl border border-border bg-white shadow-sm">
        {isLoading ? (
          <div className="p-6">
            <TableSkeleton rows={4} cols={5} />
          </div>
        ) : isError ? (
          <ErrorState onRetry={() => refetch()} />
        ) : tipificaciones.length === 0 ? (
          <EmptyState
            icon={Tags}
            title="No hay tipificaciones"
            description="Crea tipificaciones para clasificar tus leads."
          />
        ) : (
          <div className="divide-y divide-border">
            {tipificaciones.map((tip) => {
              const isExpanded = expandedItems.has(tip.id)
              const activeSubs = tip.subtipificaciones.filter((s) => s.activo)

              return (
                <div key={tip.id} className={cn("transition-colors", !tip.activo && "bg-gray-50/50")}>
                  {/* Parent Row */}
                  <div className="flex items-center justify-between p-4 hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => toggleExpand(tip.id)}
                        className="p-1 hover:bg-gray-200 rounded transition-colors"
                      >
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4 text-gray-500" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-gray-500" />
                        )}
                      </button>

                      {/* Color indicator */}
                      <div
                        className="w-4 h-4 rounded-full border border-gray-200"
                        style={{ backgroundColor: tip.color }}
                        title={`Color: ${tip.color}`}
                      />

                      <div>
                        <div className="flex items-center gap-2">
                          <span className={cn("font-medium", !tip.activo && "text-gray-400 line-through")}>
                            {tip.nombre}
                          </span>
                          {!tip.activo && <Badge variant="secondary">Inactiva</Badge>}
                          {tip.es_final && (
                            <Badge variant="info" className="text-xs">
                              Final
                            </Badge>
                          )}
                        </div>
                        {tip.descripcion && (
                          <p className="text-xs text-muted-foreground">{tip.descripcion}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-sm text-muted-foreground">
                        <span className="font-medium">{tip.total_leads}</span> leads
                        {!tip.es_final && (
                          <>
                            {" "}
                            · <span className="font-medium">{activeSubs.length}</span> sub
                          </>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        {!tip.es_final && (
                          <button
                            onClick={() => openCreateSub(tip.id)}
                            className="inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium text-primary hover:bg-primary/10 transition-colors"
                            title="Agregar subtipificación"
                          >
                            <Plus className="h-3.5 w-3.5" />
                            Sub
                          </button>
                        )}
                        <button
                          onClick={() => openEditTip(tip)}
                          className="inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium text-primary hover:bg-primary/10 transition-colors"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          Editar
                        </button>
                        <button
                          onClick={() => setDeleteTarget({ type: "tip", item: tip })}
                          className="inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Subtipificaciones */}
                  {isExpanded && !tip.es_final && (
                    <div className="border-t border-border bg-gray-50/30">
                      {activeSubs.length === 0 ? (
                        <div className="px-12 py-3 text-sm text-muted-foreground italic">
                          No hay subtipificaciones
                        </div>
                      ) : (
                        activeSubs.map((sub) => (
                          <div
                            key={sub.id}
                            className="flex items-center justify-between px-12 py-3 border-b border-border/50 last:border-0 hover:bg-gray-50"
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className="w-3 h-3 rounded-full border border-gray-200"
                                style={{ backgroundColor: sub.color || tip.color }}
                              />
                              <span className={cn(!sub.activo && "text-gray-400 line-through")}>
                                {sub.nombre}
                              </span>
                              {sub.descripcion && (
                                <span className="text-xs text-muted-foreground">({sub.descripcion})</span>
                              )}
                            </div>

                            <div className="flex items-center gap-4">
                              <span className="text-sm text-muted-foreground">Orden: {sub.orden}</span>
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => openEditSub(sub)}
                                  className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-primary hover:bg-primary/10 transition-colors"
                                >
                                  <Pencil className="h-3 w-3" />
                                </button>
                                <button
                                  onClick={() => setDeleteTarget({ type: "sub", item: sub })}
                                  className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Tipificacion Modal */}
      <Modal
        open={showTipModal}
        onOpenChange={setShowTipModal}
        title={editingTip ? "Editar Tipificación" : "Nueva Tipificación"}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Nombre <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Interesado"
              className="w-full rounded-lg border border-border bg-white px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Descripción</label>
            <input
              type="text"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Descripción opcional"
              className="w-full rounded-lg border border-border bg-white px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              <Palette className="h-4 w-4 inline mr-1" />
              Color
            </label>
            <div className="grid grid-cols-9 gap-2">
              {PREDEFINED_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={cn(
                    "w-8 h-8 rounded-lg border-2 transition-all",
                    color === c ? "border-gray-900 scale-110" : "border-transparent hover:scale-105"
                  )}
                  style={{ backgroundColor: c }}
                  title={c}
                >
                  {color === c && <Check className="h-4 w-4 text-white mx-auto" />}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Orden</label>
              <input
                type="number"
                value={orden}
                onChange={(e) => setOrden(parseInt(e.target.value) || 0)}
                min={0}
                className="w-full rounded-lg border border-border bg-white px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={activo}
                  onChange={(e) => setActivo(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span className="text-sm text-foreground">Activo</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={esFinal}
                  onChange={(e) => setEsFinal(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span className="text-sm text-foreground">Categoría final</span>
              </label>
            </div>
          </div>

          {esFinal && (
            <div className="flex items-start gap-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <p>
                Una categoría final no permite subtipificaciones. Útil para estados terminales como "No
                interesado".
              </p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setShowTipModal(false)}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSaveTip}
              disabled={!nombre.trim() || isPending}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {isPending ? "Guardando..." : editingTip ? "Guardar cambios" : "Crear"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Subtipificacion Modal */}
      <Modal
        open={showSubModal}
        onOpenChange={setShowSubModal}
        title={editingSub ? "Editar Subtipificación" : "Nueva Subtipificación"}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Nombre <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Quiere demo"
              className="w-full rounded-lg border border-border bg-white px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Descripción</label>
            <input
              type="text"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Descripción opcional"
              className="w-full rounded-lg border border-border bg-white px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              <Palette className="h-4 w-4 inline mr-1" />
              Color (opcional, hereda del padre)
            </label>
            <div className="grid grid-cols-9 gap-2">
              {PREDEFINED_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={cn(
                    "w-8 h-8 rounded-lg border-2 transition-all",
                    color === c ? "border-gray-900 scale-110" : "border-transparent hover:scale-105"
                  )}
                  style={{ backgroundColor: c }}
                  title={c}
                >
                  {color === c && <Check className="h-4 w-4 text-white mx-auto" />}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Orden</label>
              <input
                type="number"
                value={orden}
                onChange={(e) => setOrden(parseInt(e.target.value) || 0)}
                min={0}
                className="w-full rounded-lg border border-border bg-white px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div className="flex items-center">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={activo}
                  onChange={(e) => setActivo(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span className="text-sm text-foreground">Activo</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setShowSubModal(false)}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSaveSub}
              disabled={!nombre.trim() || isPending}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {isPending ? "Guardando..." : editingSub ? "Guardar cambios" : "Crear"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title={deleteTarget?.type === "tip" ? "Eliminar tipificación" : "Eliminar subtipificación"}
        description={
          deleteTarget?.type === "tip"
            ? deleteTarget.item.total_leads > 0
              ? `No se puede eliminar: ${deleteTarget.item.total_leads} lead(s) están usando esta tipificación.`
              : `Se eliminará "${deleteTarget.item.nombre}" y todas sus subtipificaciones. Esta acción no se puede deshacer.`
            : `Se eliminará "${deleteTarget?.item.nombre}". Esta acción no se puede deshacer.`
        }
        confirmLabel="Eliminar"
        variant="danger"
        onConfirm={handleDelete}
        loading={isPending}
      />
    </div>
  )
}
