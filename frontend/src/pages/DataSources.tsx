import { useState } from "react"
import { Plus, Trash2, GitBranch, ArrowRight, Pencil } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { useAccount } from "@/context/AccountContext"
import { useLeadBasesList } from "@/hooks/useLeadBases"
import { useFieldsList } from "@/hooks/useFields"
import { useCreateRule, useUpdateRule, useDeleteRule } from "@/hooks/useRoutingRules"
import { getRules } from "@/api/routingRules"
import { TableSkeleton } from "@/components/ui/Loading"
import ErrorState from "@/components/ui/ErrorState"
import EmptyState from "@/components/ui/EmptyState"
import Badge from "@/components/ui/Badge"
import Modal from "@/components/ui/Modal"
import ConfirmDialog from "@/components/ui/ConfirmDialog"
import type { LeadBaseResponse, RoutingRuleResponse, RuleOperator } from "@/types"

const OPERATORS: { value: RuleOperator; label: string }[] = [
  { value: "equals", label: "es igual a" },
  { value: "not_equals", label: "no es igual a" },
  { value: "contains", label: "contiene" },
  { value: "greater_than", label: "es mayor que" },
  { value: "less_than", label: "es menor que" },
]

const operatorLabel = (op: RuleOperator) => OPERATORS.find((o) => o.value === op)?.label ?? op

export default function DataSources() {
  const { selectedAccount } = useAccount()
  const accountId = selectedAccount?.id ?? ""
  const { data: basesData, isLoading: basesLoading } = useLeadBasesList(selectedAccount?.id)
  const { data: fieldsData } = useFieldsList(selectedAccount?.id)

  const [showCreate, setShowCreate] = useState(false)
  const [editingRule, setEditingRule] = useState<{ rule: RoutingRuleResponse; baseId: string } | null>(null)
  if (!selectedAccount) {
    return (
      <EmptyState
        icon={GitBranch}
        title="Selecciona un cliente"
        description="Elige un cliente del selector en el header para gestionar las reglas de ruteo."
      />
    )
  }

  const bases = (basesData?.items ?? []).filter((b) => !b.es_default)
  const allBases = basesData?.items ?? []
  const fields = fieldsData?.items ?? []

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">DataSources</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Reglas de ruteo de leads de {selectedAccount.nombre}
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          disabled={bases.length === 0}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary/90 transition-colors disabled:opacity-50"
          title={bases.length === 0 ? "Crea una base no-default primero" : ""}
        >
          <Plus className="h-4 w-4" />
          Nueva regla
        </button>
      </div>

      {bases.length === 0 && !basesLoading ? (
        <EmptyState
          icon={GitBranch}
          title="No hay bases para rutear"
          description='Crea al menos una base no-default en "Bases" para crear reglas de ruteo. Los leads sin match van a la base default.'
        />
      ) : (
        <div className="space-y-6">
          {bases.map((base) => (
            <BaseRulesSection
              key={base.id}
              base={base}
              accountId={accountId}
              onEditRule={(rule) => setEditingRule({ rule, baseId: base.id })}
            />
          ))}

          {/* Default base note */}
          {allBases.filter((b) => b.es_default).map((defBase) => (
            <div key={defBase.id} className="rounded-xl border border-dashed border-border bg-gray-50 p-6">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="info">Default</Badge>
                <span className="text-sm font-medium">{defBase.nombre}</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Los leads que no cumplan ninguna regla de las bases anteriores seran asignados automaticamente a esta base.
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Create Rule Modal */}
      {showCreate && (
        <CreateRuleModal
          open={showCreate}
          onOpenChange={setShowCreate}
          accountId={accountId}
          bases={bases}
          fieldNames={fields.map((f) => f.nombre_campo)}
        />
      )}

      {/* Edit Rule Modal */}
      {editingRule && (
        <EditRuleModal
          open={!!editingRule}
          onOpenChange={(o) => !o && setEditingRule(null)}
          accountId={accountId}
          rule={editingRule.rule}
          baseId={editingRule.baseId}
          bases={bases}
          fieldNames={fields.map((f) => f.nombre_campo)}
        />
      )}

    </div>
  )
}

function BaseRulesSection({
  base,
  accountId,
  onEditRule,
}: {
  base: LeadBaseResponse
  accountId: string
  onEditRule: (rule: RoutingRuleResponse) => void
}) {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["rules", base.id],
    queryFn: () => getRules(base.id),
  })

  const rules = data?.items ?? []

  return (
    <div className="rounded-xl border border-border bg-white shadow-sm">
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <GitBranch className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">{base.nombre}</p>
            {base.descripcion && (
              <p className="text-xs text-muted-foreground">{base.descripcion}</p>
            )}
          </div>
        </div>
        <Badge variant="default">{rules.length} regla{rules.length !== 1 ? "s" : ""}</Badge>
      </div>

      {isLoading ? (
        <div className="p-6"><TableSkeleton rows={2} cols={4} /></div>
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : rules.length === 0 ? (
        <p className="px-6 py-8 text-sm text-muted-foreground text-center">
          Sin reglas. Los leads no seran ruteados a esta base.
        </p>
      ) : (
        <div className="divide-y divide-border">
          {rules
            .sort((a, b) => a.prioridad - b.prioridad)
            .map((rule) => (
              <div key={rule.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors">
                {/* Visual rule representation */}
                <div className="flex-1 flex items-center gap-2 flex-wrap">
                  <span className="text-sm text-muted-foreground">Si</span>
                  <Badge variant="info">{rule.campo}</Badge>
                  <span className="text-sm font-medium text-foreground">{operatorLabel(rule.operador)}</span>
                  <Badge variant="default" className="font-mono">{rule.valor}</Badge>
                  <ArrowRight className="h-4 w-4 text-gray-400 mx-1" />
                  <Badge variant="success">{base.nombre}</Badge>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] text-muted-foreground font-mono">P:{rule.prioridad}</span>
                  <button
                    onClick={() => onEditRule(rule)}
                    className="rounded-md p-1.5 text-gray-400 hover:text-foreground hover:bg-gray-100 transition-colors"
                    title="Editar"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <DeleteRuleButton ruleId={rule.id} baseId={base.id} accountId={accountId} />
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  )
}

function DeleteRuleButton({
  ruleId,
  baseId,
  accountId,
}: {
  ruleId: string
  baseId: string
  accountId: string
}) {
  const deleteMutation = useDeleteRule(baseId, accountId)
  const [confirm, setConfirm] = useState(false)

  return (
    <>
      <button
        onClick={() => setConfirm(true)}
        className="rounded-md p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
        title="Eliminar"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
      <ConfirmDialog
        open={confirm}
        onOpenChange={setConfirm}
        title="Eliminar regla"
        description="¿Estas seguro de eliminar esta regla de ruteo?"
        confirmLabel="Eliminar"
        variant="danger"
        onConfirm={async () => {
          await deleteMutation.mutateAsync(ruleId)
          setConfirm(false)
        }}
        loading={deleteMutation.isPending}
      />
    </>
  )
}

function CreateRuleModal({
  open,
  onOpenChange,
  accountId,
  bases,
  fieldNames,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  accountId: string
  bases: LeadBaseResponse[]
  fieldNames: string[]
}) {
  const [selectedBase, setSelectedBase] = useState(bases[0]?.id ?? "")
  const [campo, setCampo] = useState(fieldNames[0] ?? "")
  const [operador, setOperador] = useState<RuleOperator>("equals")
  const [valor, setValor] = useState("")
  const [prioridad, setPrioridad] = useState(0)

  const createMutation = useCreateRule(selectedBase, accountId)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!campo || !valor.trim() || !selectedBase) return
    await createMutation.mutateAsync({
      campo,
      operador,
      valor: valor.trim(),
      prioridad,
    })
    onOpenChange(false)
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange} title="Nueva regla de ruteo" wide>
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Visual builder */}
        <div className="rounded-lg border border-border bg-gray-50 p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">Condicion</p>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-sm font-medium text-foreground">Si</span>

            {/* Field selector */}
            {fieldNames.length > 0 ? (
              <select
                value={campo}
                onChange={(e) => setCampo(e.target.value)}
                className="rounded-lg border border-border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {fieldNames.map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={campo}
                onChange={(e) => setCampo(e.target.value)}
                placeholder="nombre_campo"
                className="rounded-lg border border-border bg-white px-3 py-2 text-sm w-40 focus:outline-none focus:ring-2 focus:ring-ring"
                required
              />
            )}

            {/* Operator */}
            <select
              value={operador}
              onChange={(e) => setOperador(e.target.value as RuleOperator)}
              className="rounded-lg border border-border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {OPERATORS.map((op) => (
                <option key={op.value} value={op.value}>{op.label}</option>
              ))}
            </select>

            {/* Value */}
            <input
              type="text"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              placeholder="valor"
              className="rounded-lg border border-border bg-white px-3 py-2 text-sm w-40 focus:outline-none focus:ring-2 focus:ring-ring"
              required
            />
          </div>

          <div className="flex items-center gap-3 mt-4">
            <ArrowRight className="h-4 w-4 text-gray-400" />
            <span className="text-sm font-medium text-foreground">ira a</span>
            <select
              value={selectedBase}
              onChange={(e) => setSelectedBase(e.target.value)}
              className="rounded-lg border border-border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {bases.map((b) => (
                <option key={b.id} value={b.id}>{b.nombre}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Priority */}
        <div>
          <label className="text-sm font-medium text-foreground">Prioridad</label>
          <p className="text-xs text-muted-foreground mb-1">Menor numero = mayor prioridad</p>
          <input
            type="number"
            value={prioridad}
            onChange={(e) => setPrioridad(Number(e.target.value))}
            min={0}
            className="w-24 rounded-lg border border-border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={() => onOpenChange(false)} className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-gray-50 transition-colors">
            Cancelar
          </button>
          <button
            type="submit"
            disabled={createMutation.isPending || !campo || !valor.trim() || !selectedBase}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {createMutation.isPending ? "Creando..." : "Crear regla"}
          </button>
        </div>
      </form>
    </Modal>
  )
}

function EditRuleModal({
  open,
  onOpenChange,
  accountId,
  rule,
  baseId,
  bases,
  fieldNames,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  accountId: string
  rule: RoutingRuleResponse
  baseId: string
  bases: LeadBaseResponse[]
  fieldNames: string[]
}) {
  const [campo, setCampo] = useState(rule.campo)
  const [operador, setOperador] = useState<RuleOperator>(rule.operador)
  const [valor, setValor] = useState(rule.valor)
  const [prioridad, setPrioridad] = useState(rule.prioridad)

  const updateMutation = useUpdateRule(baseId, accountId)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await updateMutation.mutateAsync({
      ruleId: rule.id,
      payload: { campo, operador, valor: valor.trim(), prioridad },
    })
    onOpenChange(false)
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange} title="Editar regla de ruteo" wide>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="rounded-lg border border-border bg-gray-50 p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">Condicion</p>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-sm font-medium text-foreground">Si</span>

            {fieldNames.length > 0 ? (
              <select value={campo} onChange={(e) => setCampo(e.target.value)} className="rounded-lg border border-border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                {fieldNames.map((f) => <option key={f} value={f}>{f}</option>)}
                {!fieldNames.includes(campo) && <option value={campo}>{campo}</option>}
              </select>
            ) : (
              <input type="text" value={campo} onChange={(e) => setCampo(e.target.value)} className="rounded-lg border border-border bg-white px-3 py-2 text-sm w-40 focus:outline-none focus:ring-2 focus:ring-ring" required />
            )}

            <select value={operador} onChange={(e) => setOperador(e.target.value as RuleOperator)} className="rounded-lg border border-border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
              {OPERATORS.map((op) => <option key={op.value} value={op.value}>{op.label}</option>)}
            </select>

            <input type="text" value={valor} onChange={(e) => setValor(e.target.value)} placeholder="valor" className="rounded-lg border border-border bg-white px-3 py-2 text-sm w-40 focus:outline-none focus:ring-2 focus:ring-ring" required />
          </div>

          <div className="flex items-center gap-3 mt-4">
            <ArrowRight className="h-4 w-4 text-gray-400" />
            <span className="text-sm font-medium text-foreground">ira a</span>
            <span className="text-sm font-medium text-primary">
              {bases.find((b) => b.id === baseId)?.nombre ?? "Base"}
            </span>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-foreground">Prioridad</label>
          <input type="number" value={prioridad} onChange={(e) => setPrioridad(Number(e.target.value))} min={0} className="mt-1 w-24 rounded-lg border border-border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={() => onOpenChange(false)} className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-gray-50 transition-colors">
            Cancelar
          </button>
          <button type="submit" disabled={updateMutation.isPending} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50 transition-colors">
            {updateMutation.isPending ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </form>
    </Modal>
  )
}
