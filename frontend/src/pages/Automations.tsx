import { useState } from "react"
import {
  Zap,
  Plus,
  Pencil,
  Trash2,
  Power,
  History,
  ChevronDown,
  ChevronRight,
  Filter,
  Play as ActionIcon,
  X,
} from "lucide-react"
import { useAccount } from "@/context/AccountContext"
import { useLeadBasesList } from "@/hooks/useLeadBases"
import { useFieldsList } from "@/hooks/useFields"
import {
  useAutomationsList,
  useAutomationDetail,
  useAutomationMeta,
  useCreateAutomation,
  useUpdateAutomation,
  useDeleteAutomation,
  useToggleAutomation,
  useAddCondition,
  useDeleteCondition,
  useAddAction,
  useDeleteAction,
  useAutomationLogs,
} from "@/hooks/useAutomations"
import { TableSkeleton } from "@/components/ui/Loading"
import ErrorState from "@/components/ui/ErrorState"
import EmptyState from "@/components/ui/EmptyState"
import Badge from "@/components/ui/Badge"
import Modal from "@/components/ui/Modal"
import ConfirmDialog from "@/components/ui/ConfirmDialog"
import Pagination from "@/components/ui/Pagination"
import { formatDate, cn } from "@/lib/utils"
import type { AutomationResponse } from "@/types"

const TRIGGER_LABELS: Record<string, string> = {
  lead_created: "Lead creado",
  lead_updated: "Lead actualizado",
  lead_moved: "Lead movido",
  field_changed: "Campo modificado",
  lote_imported: "Lote importado",
}

const ACTION_LABELS: Record<string, string> = {
  webhook: "Enviar webhook",
  move_to_base: "Mover a base",
  update_field: "Actualizar campo",
  send_notification: "Enviar notificacion",
}

const OPERATOR_LABELS: Record<string, string> = {
  equals: "es igual a",
  not_equals: "no es igual a",
  contains: "contiene",
  not_contains: "no contiene",
  greater_than: "mayor que",
  less_than: "menor que",
  is_empty: "esta vacio",
  is_not_empty: "no esta vacio",
}

export default function Automations() {
  const { selectedAccount } = useAccount()
  const accountId = selectedAccount?.id ?? ""

  const { data: automationsData, isLoading, isError, refetch } = useAutomationsList(accountId)
  const { data: meta } = useAutomationMeta()
  const createMutation = useCreateAutomation(accountId)
  const updateMutation = useUpdateAutomation(accountId)
  const deleteMutation = useDeleteAutomation(accountId)
  const toggleMutation = useToggleAutomation(accountId)

  const [showCreate, setShowCreate] = useState(false)
  const [editTarget, setEditTarget] = useState<AutomationResponse | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<AutomationResponse | null>(null)
  const [detailTarget, setDetailTarget] = useState<AutomationResponse | null>(null)
  const [logsTarget, setLogsTarget] = useState<AutomationResponse | null>(null)

  // Create form
  const [nombre, setNombre] = useState("")
  const [descripcion, setDescripcion] = useState("")
  const [triggerTipo, setTriggerTipo] = useState("")
  const [conditions, setConditions] = useState<{ campo: string; operador: string; valor: string }[]>([])
  const [actions, setActions] = useState<{ tipo: string; config: Record<string, string> }[]>([])

  const automations = automationsData?.items ?? []

  const resetForm = () => {
    setNombre("")
    setDescripcion("")
    setTriggerTipo("")
    setConditions([])
    setActions([])
  }

  const openCreate = () => {
    resetForm()
    setEditTarget(null)
    setShowCreate(true)
  }

  const openEdit = (a: AutomationResponse) => {
    setEditTarget(a)
    setNombre(a.nombre)
    setDescripcion(a.descripcion ?? "")
    setTriggerTipo(a.trigger_tipo)
    setConditions(a.conditions.map((c) => ({ campo: c.campo, operador: c.operador, valor: c.valor })))
    setActions(a.actions.map((ac) => ({
      tipo: ac.tipo,
      config: Object.fromEntries(Object.entries(ac.config).map(([k, v]) => [k, String(v)])),
    })))
    setShowCreate(true)
  }

  const handleSubmit = () => {
    const trimNombre = nombre.trim()
    if (!trimNombre || !triggerTipo) return

    const payload = {
      nombre: trimNombre,
      descripcion: descripcion.trim() || undefined,
      trigger_tipo: triggerTipo,
      conditions: conditions.map((c, i) => ({ ...c, orden: i })),
      actions: actions.map((a, i) => ({ tipo: a.tipo, config: a.config, orden: i })),
    }

    if (editTarget) {
      updateMutation.mutate(
        { automationId: editTarget.id, payload: { nombre: trimNombre, descripcion: descripcion.trim() || undefined, trigger_tipo: triggerTipo } },
        { onSuccess: () => setShowCreate(false) }
      )
    } else {
      createMutation.mutate(payload, { onSuccess: () => setShowCreate(false) })
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Automatizaciones</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Configura flujos automaticos: trigger, condiciones y acciones.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Crear automatizacion
        </button>
      </div>

      <div className="rounded-xl border border-border bg-white shadow-sm">
        {isLoading ? (
          <div className="p-6"><TableSkeleton rows={4} cols={5} /></div>
        ) : isError ? (
          <ErrorState onRetry={() => refetch()} />
        ) : automations.length === 0 ? (
          <EmptyState
            icon={Zap}
            title="No hay automatizaciones"
            description="Crea una automatizacion para ejecutar acciones cuando ocurren eventos."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Nombre</th>
                  <th className="px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Trigger</th>
                  <th className="px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Condiciones</th>
                  <th className="px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Acciones</th>
                  <th className="px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {automations.map((a) => (
                  <tr key={a.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-foreground">{a.nombre}</p>
                        {a.descripcion && (
                          <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-[200px]">{a.descripcion}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="info">{TRIGGER_LABELS[a.trigger_tipo] ?? a.trigger_tipo}</Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="default">{a.conditions.length} filtro{a.conditions.length !== 1 ? "s" : ""}</Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="default">{a.actions.length} accion{a.actions.length !== 1 ? "es" : ""}</Badge>
                    </td>
                    <td className="px-6 py-4">
                      <button onClick={() => toggleMutation.mutate(a.id)}>
                        <Badge variant={a.activo ? "success" : "danger"}>
                          {a.activo ? "Activa" : "Inactiva"}
                        </Badge>
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setDetailTarget(a)}
                          className="inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium text-primary hover:bg-primary/10 transition-colors"
                          title="Ver detalle"
                        >
                          <ChevronRight className="h-3.5 w-3.5" />
                          Ver
                        </button>
                        <button
                          onClick={() => setLogsTarget(a)}
                          className="inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                          title="Historial"
                        >
                          <History className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => openEdit(a)}
                          className="inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium text-primary hover:bg-primary/10 transition-colors"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(a)}
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
      <Modal open={showCreate} onOpenChange={setShowCreate} title={editTarget ? "Editar automatizacion" : "Crear automatizacion"} wide>
        <div className="space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Nombre</label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Leads Gmail → Base VIP"
                className="w-full rounded-lg border border-border bg-white px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Trigger</label>
              <div className="relative">
                <select
                  value={triggerTipo}
                  onChange={(e) => setTriggerTipo(e.target.value)}
                  className="w-full appearance-none rounded-lg border border-border bg-white px-4 py-2.5 pr-10 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">Seleccionar evento...</option>
                  {(meta?.trigger_types ?? []).map((t) => (
                    <option key={t} value={t}>{TRIGGER_LABELS[t] ?? t}</option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
            </div>
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

          {/* Conditions builder (only for create, edit uses detail panel) */}
          {!editTarget && (
            <ConditionsBuilder
              conditions={conditions}
              setConditions={setConditions}
              operators={meta?.condition_operators ?? []}
            />
          )}

          {/* Actions builder (only for create) */}
          {!editTarget && (
            <ActionsBuilder
              actions={actions}
              setActions={setActions}
              actionTypes={meta?.action_types ?? []}
            />
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setShowCreate(false)}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={!nombre.trim() || !triggerTipo || isPending}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {isPending ? "Guardando..." : editTarget ? "Guardar cambios" : "Crear"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete confirm */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Eliminar automatizacion"
        description={`Se eliminara "${deleteTarget?.nombre}" con todas sus condiciones, acciones y logs.`}
        confirmLabel="Eliminar"
        variant="danger"
        onConfirm={() => {
          if (deleteTarget) deleteMutation.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) })
        }}
        loading={deleteMutation.isPending}
      />

      {/* Detail panel */}
      {detailTarget && (
        <AutomationDetailModal
          automationId={detailTarget.id}
          accountId={accountId}
          onClose={() => setDetailTarget(null)}
        />
      )}

      {/* Logs modal */}
      {logsTarget && (
        <AutomationLogsModal automation={logsTarget} onClose={() => setLogsTarget(null)} />
      )}
    </div>
  )
}

// ── Conditions inline builder ──

function ConditionsBuilder({
  conditions,
  setConditions,
  operators,
}: {
  conditions: { campo: string; operador: string; valor: string }[]
  setConditions: (c: { campo: string; operador: string; valor: string }[]) => void
  operators: string[]
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-medium text-foreground flex items-center gap-1.5">
          <Filter className="h-4 w-4" />
          Condiciones (AND)
        </label>
        <button
          type="button"
          onClick={() => setConditions([...conditions, { campo: "", operador: "equals", valor: "" }])}
          className="text-xs text-primary hover:text-primary/80 font-medium"
        >
          + Agregar condicion
        </button>
      </div>
      {conditions.length === 0 ? (
        <p className="text-xs text-muted-foreground bg-gray-50 rounded-lg p-3">Sin condiciones — se ejecutara para todos los leads.</p>
      ) : (
        <div className="space-y-2">
          {conditions.map((c, i) => (
            <div key={i} className="flex gap-2 items-center">
              <input
                type="text"
                value={c.campo}
                onChange={(e) => {
                  const next = [...conditions]
                  next[i] = { ...next[i], campo: e.target.value }
                  setConditions(next)
                }}
                placeholder="campo"
                className="flex-1 rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <div className="relative">
                <select
                  value={c.operador}
                  onChange={(e) => {
                    const next = [...conditions]
                    next[i] = { ...next[i], operador: e.target.value }
                    setConditions(next)
                  }}
                  className="appearance-none rounded-lg border border-border bg-white px-3 py-2 pr-8 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {operators.map((op) => (
                    <option key={op} value={op}>{OPERATOR_LABELS[op] ?? op}</option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
              </div>
              <input
                type="text"
                value={c.valor}
                onChange={(e) => {
                  const next = [...conditions]
                  next[i] = { ...next[i], valor: e.target.value }
                  setConditions(next)
                }}
                placeholder="valor"
                className="flex-1 rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <button
                type="button"
                onClick={() => setConditions(conditions.filter((_, j) => j !== i))}
                className="rounded-lg p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Actions inline builder ──

function ActionsBuilder({
  actions,
  setActions,
  actionTypes,
}: {
  actions: { tipo: string; config: Record<string, string> }[]
  setActions: (a: { tipo: string; config: Record<string, string> }[]) => void
  actionTypes: string[]
}) {
  const addAction = () => {
    setActions([...actions, { tipo: "webhook", config: {} }])
  }

  const updateAction = (i: number, field: string, val: string) => {
    const next = [...actions]
    if (field === "tipo") {
      next[i] = { tipo: val, config: {} }
    } else {
      next[i] = { ...next[i], config: { ...next[i].config, [field]: val } }
    }
    setActions(next)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-medium text-foreground flex items-center gap-1.5">
          <ActionIcon className="h-4 w-4" />
          Acciones (en orden)
        </label>
        <button type="button" onClick={addAction} className="text-xs text-primary hover:text-primary/80 font-medium">
          + Agregar accion
        </button>
      </div>
      {actions.length === 0 ? (
        <p className="text-xs text-muted-foreground bg-gray-50 rounded-lg p-3">Sin acciones configuradas.</p>
      ) : (
        <div className="space-y-3">
          {actions.map((a, i) => (
            <div key={i} className="rounded-lg border border-border p-3 bg-gray-50">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="default" className="text-[10px]">#{i + 1}</Badge>
                <div className="relative flex-1">
                  <select
                    value={a.tipo}
                    onChange={(e) => updateAction(i, "tipo", e.target.value)}
                    className="w-full appearance-none rounded-lg border border-border bg-white px-3 py-2 pr-8 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    {actionTypes.map((t) => (
                      <option key={t} value={t}>{ACTION_LABELS[t] ?? t}</option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                </div>
                <button
                  type="button"
                  onClick={() => setActions(actions.filter((_, j) => j !== i))}
                  className="rounded-lg p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              {/* Config fields based on type */}
              <ActionConfigFields tipo={a.tipo} config={a.config} onChange={(field, val) => updateAction(i, field, val)} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function ActionConfigFields({
  tipo,
  config,
  onChange,
}: {
  tipo: string
  config: Record<string, string>
  onChange: (field: string, val: string) => void
}) {
  switch (tipo) {
    case "webhook":
      return (
        <div className="space-y-2">
          <input
            type="url"
            value={config.url ?? ""}
            onChange={(e) => onChange("url", e.target.value)}
            placeholder="https://api.ejemplo.com/hook"
            className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      )
    case "move_to_base":
      return (
        <input
          type="text"
          value={config.base_id ?? ""}
          onChange={(e) => onChange("base_id", e.target.value)}
          placeholder="ID de la base destino"
          className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      )
    case "update_field":
      return (
        <div className="grid grid-cols-2 gap-2">
          <input
            type="text"
            value={config.campo ?? ""}
            onChange={(e) => onChange("campo", e.target.value)}
            placeholder="Nombre del campo"
            className="rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <input
            type="text"
            value={config.valor ?? ""}
            onChange={(e) => onChange("valor", e.target.value)}
            placeholder="Nuevo valor"
            className="rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      )
    case "send_notification":
      return (
        <input
          type="text"
          value={config.message ?? ""}
          onChange={(e) => onChange("message", e.target.value)}
          placeholder="Mensaje de notificacion"
          className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      )
    default:
      return <p className="text-xs text-muted-foreground">Tipo no reconocido.</p>
  }
}

// ── Detail modal (for managing conditions/actions on existing automation) ──

function AutomationDetailModal({
  automationId,
  accountId,
  onClose,
}: {
  automationId: string
  accountId: string
  onClose: () => void
}) {
  const { data: automation, isLoading } = useAutomationDetail(automationId)
  const { data: meta } = useAutomationMeta()
  const addConditionMut = useAddCondition(accountId)
  const deleteConditionMut = useDeleteCondition(accountId)
  const addActionMut = useAddAction(accountId)
  const deleteActionMut = useDeleteAction(accountId)

  // New condition form
  const [newCampo, setNewCampo] = useState("")
  const [newOperador, setNewOperador] = useState("equals")
  const [newValor, setNewValor] = useState("")

  // New action form
  const [newActionTipo, setNewActionTipo] = useState("webhook")
  const [newActionConfig, setNewActionConfig] = useState<Record<string, string>>({})

  const handleAddCondition = () => {
    if (!newCampo.trim()) return
    addConditionMut.mutate(
      { automationId, payload: { campo: newCampo.trim(), operador: newOperador, valor: newValor, orden: (automation?.conditions.length ?? 0) } },
      { onSuccess: () => { setNewCampo(""); setNewValor("") } }
    )
  }

  const handleAddAction = () => {
    addActionMut.mutate(
      { automationId, payload: { tipo: newActionTipo, config: newActionConfig, orden: (automation?.actions.length ?? 0) } },
      { onSuccess: () => setNewActionConfig({}) }
    )
  }

  if (isLoading || !automation) {
    return (
      <Modal open onOpenChange={(o) => !o && onClose()} title="Detalle" wide>
        <TableSkeleton rows={3} cols={3} />
      </Modal>
    )
  }

  return (
    <Modal open onOpenChange={(o) => !o && onClose()} title={automation.nombre} description={`Trigger: ${TRIGGER_LABELS[automation.trigger_tipo] ?? automation.trigger_tipo}`} wide>
      <div className="space-y-5 max-h-[65vh] overflow-y-auto">
        {/* Conditions */}
        <div>
          <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-1.5">
            <Filter className="h-4 w-4" /> Condiciones
          </h4>
          {automation.conditions.length === 0 ? (
            <p className="text-xs text-muted-foreground mb-2">Sin condiciones — aplica a todos.</p>
          ) : (
            <div className="space-y-1.5 mb-3">
              {automation.conditions.map((c) => (
                <div key={c.id} className="flex items-center justify-between rounded-lg border border-border bg-gray-50 px-3 py-2">
                  <span className="text-sm">
                    <span className="font-medium">{c.campo}</span>{" "}
                    <span className="text-muted-foreground">{OPERATOR_LABELS[c.operador] ?? c.operador}</span>{" "}
                    <span className="font-medium text-primary">"{c.valor}"</span>
                  </span>
                  <button
                    onClick={() => deleteConditionMut.mutate(c.id)}
                    className="text-gray-400 hover:text-red-500 p-1"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
          {/* Add condition inline */}
          <div className="flex gap-2 items-center">
            <input
              type="text"
              value={newCampo}
              onChange={(e) => setNewCampo(e.target.value)}
              placeholder="campo"
              className="flex-1 rounded-lg border border-border bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <select
              value={newOperador}
              onChange={(e) => setNewOperador(e.target.value)}
              className="rounded-lg border border-border bg-white px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {(meta?.condition_operators ?? []).map((op) => (
                <option key={op} value={op}>{OPERATOR_LABELS[op] ?? op}</option>
              ))}
            </select>
            <input
              type="text"
              value={newValor}
              onChange={(e) => setNewValor(e.target.value)}
              placeholder="valor"
              className="flex-1 rounded-lg border border-border bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <button
              onClick={handleAddCondition}
              disabled={!newCampo.trim() || addConditionMut.isPending}
              className="rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50"
            >
              +
            </button>
          </div>
        </div>

        {/* Actions */}
        <div>
          <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-1.5">
            <ActionIcon className="h-4 w-4" /> Acciones
          </h4>
          {automation.actions.length === 0 ? (
            <p className="text-xs text-muted-foreground mb-2">Sin acciones configuradas.</p>
          ) : (
            <div className="space-y-1.5 mb-3">
              {automation.actions.map((a, i) => (
                <div key={a.id} className="flex items-center justify-between rounded-lg border border-border bg-gray-50 px-3 py-2">
                  <span className="text-sm">
                    <Badge variant="default" className="text-[10px] mr-2">#{i + 1}</Badge>
                    <span className="font-medium">{ACTION_LABELS[a.tipo] ?? a.tipo}</span>
                    {a.config && Object.keys(a.config).length > 0 && (
                      <span className="text-muted-foreground ml-1">
                        ({Object.entries(a.config).map(([k, v]) => `${k}: ${v}`).join(", ")})
                      </span>
                    )}
                  </span>
                  <button
                    onClick={() => deleteActionMut.mutate(a.id)}
                    className="text-gray-400 hover:text-red-500 p-1"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
          {/* Add action inline */}
          <div className="rounded-lg border border-dashed border-border p-3 space-y-2">
            <div className="flex gap-2 items-center">
              <select
                value={newActionTipo}
                onChange={(e) => { setNewActionTipo(e.target.value); setNewActionConfig({}) }}
                className="rounded-lg border border-border bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {(meta?.action_types ?? []).map((t) => (
                  <option key={t} value={t}>{ACTION_LABELS[t] ?? t}</option>
                ))}
              </select>
              <button
                onClick={handleAddAction}
                disabled={addActionMut.isPending}
                className="rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50"
              >
                Agregar
              </button>
            </div>
            <ActionConfigFields
              tipo={newActionTipo}
              config={newActionConfig}
              onChange={(field, val) => setNewActionConfig((prev) => ({ ...prev, [field]: val }))}
            />
          </div>
        </div>
      </div>
    </Modal>
  )
}

// ── Automation Logs Modal ──

function AutomationLogsModal({ automation, onClose }: { automation: AutomationResponse; onClose: () => void }) {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const { data, isLoading, isError, refetch } = useAutomationLogs(automation.id, page, pageSize)
  const logs = data?.items ?? []

  return (
    <Modal open onOpenChange={(o) => !o && onClose()} title={`Historial: ${automation.nombre}`} wide>
      <div className="max-h-[60vh] overflow-auto">
        {isLoading ? (
          <TableSkeleton rows={5} cols={5} />
        ) : isError ? (
          <ErrorState onRetry={() => refetch()} />
        ) : logs.length === 0 ? (
          <EmptyState icon={History} title="Sin ejecuciones" description="No hay ejecuciones registradas para esta automatizacion." />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="px-4 py-2 text-xs font-medium text-muted-foreground uppercase">Fecha</th>
                    <th className="px-4 py-2 text-xs font-medium text-muted-foreground uppercase">Evento</th>
                    <th className="px-4 py-2 text-xs font-medium text-muted-foreground uppercase">Condiciones</th>
                    <th className="px-4 py-2 text-xs font-medium text-muted-foreground uppercase">Resultado</th>
                    <th className="px-4 py-2 text-xs font-medium text-muted-foreground uppercase">Error</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">
                        {formatDate(log.created_at)}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="info" className="text-[10px]">
                          {TRIGGER_LABELS[log.trigger_evento] ?? log.trigger_evento}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={log.conditions_passed ? "success" : "danger"}>
                          {log.conditions_passed ? "Paso" : "No paso"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {log.actions_result ? `${log.actions_result.length} accion(es)` : "—"}
                      </td>
                      <td className="px-4 py-3 text-sm text-red-600 max-w-[200px] truncate">
                        {log.error ?? "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-2 pb-2">
              <Pagination
                page={page}
                pageSize={pageSize}
                total={data?.total ?? 0}
                onPageChange={setPage}
                onPageSizeChange={(s) => { setPageSize(s); setPage(1) }}
              />
            </div>
          </>
        )}
      </div>
    </Modal>
  )
}
