import { useState, useMemo } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
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
  horizontalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
  ArrowLeft,
  Download,
  Search,
  Eye,
  Columns3,
  GripVertical,
  Users,
  X,
} from "lucide-react"
import { useAccount } from "@/context/AccountContext"
import { useFieldsList } from "@/hooks/useFields"
import { useBaseViewConfig } from "@/hooks/useBaseViewConfig"
import { useDebounce } from "@/hooks/useDebounce"
import { getLeadBase, getLeadsByBase } from "@/api/leadBases"
import { TableSkeleton, Spinner } from "@/components/ui/Loading"
import ErrorState from "@/components/ui/ErrorState"
import EmptyState from "@/components/ui/EmptyState"
import Pagination from "@/components/ui/Pagination"
import Badge from "@/components/ui/Badge"
import LeadDetailModal from "@/components/leads/LeadDetailModal"
import { formatDate, truncate, cn } from "@/lib/utils"
import type { LeadResponse } from "@/types"

export default function BaseDetail() {
  const { baseId } = useParams<{ baseId: string }>()
  const navigate = useNavigate()
  const { selectedAccount } = useAccount()
  const accountId = selectedAccount?.id ?? ""

  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [search, setSearch] = useState("")
  const [selectedLead, setSelectedLead] = useState<string | null>(null)
  const [showColumnPicker, setShowColumnPicker] = useState(false)
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({})
  const debouncedSearch = useDebounce(search, 300)

  // Fetch base info
  const { data: base, isLoading: baseLoading } = useQuery({
    queryKey: ["leadBase", baseId],
    queryFn: () => getLeadBase(baseId!),
    enabled: !!baseId,
  })

  // Fetch leads for this base
  const { data: leadsData, isLoading: leadsLoading, isError, refetch } = useQuery({
    queryKey: ["baseLeads", accountId, baseId, page, pageSize],
    queryFn: () => getLeadsByBase(accountId, baseId!, page, pageSize),
    enabled: !!accountId && !!baseId,
  })

  // Fetch fields for column names
  const { data: fieldsData } = useFieldsList(selectedAccount?.id)
  const allFieldNames = useMemo(
    () => (fieldsData?.items ?? []).map((f) => f.nombre_campo),
    [fieldsData]
  )

  // Column view config (persisted in localStorage per base)
  const { visibleColumns, allColumns, setColumns, toggleColumn } = useBaseViewConfig(
    baseId ?? "",
    allFieldNames
  )

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      const oldIndex = visibleColumns.indexOf(String(active.id))
      const newIndex = visibleColumns.indexOf(String(over.id))
      setColumns(arrayMove(visibleColumns, oldIndex, newIndex))
    }
  }

  // Filtering
  const filteredLeads = useMemo(() => {
    let leads = leadsData?.items ?? []

    // Global search
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase()
      leads = leads.filter((lead) =>
        Object.values(lead.datos).some((v) => String(v).toLowerCase().includes(q))
      )
    }

    // Per-column filters
    for (const [col, filterVal] of Object.entries(columnFilters)) {
      if (!filterVal) continue
      const q = filterVal.toLowerCase()
      leads = leads.filter((lead) => {
        const val = lead.datos[col]
        return val != null && String(val).toLowerCase().includes(q)
      })
    }

    return leads
  }, [leadsData?.items, debouncedSearch, columnFilters])

  // Export CSV with configured columns only
  const exportCsv = () => {
    if (filteredLeads.length === 0) return

    const cols = ["id", "created_at", ...visibleColumns]

    const escapeCell = (val: string) => {
      if (val.includes(",") || val.includes('"') || val.includes("\n")) {
        return `"${val.replace(/"/g, '""')}"`
      }
      return val
    }

    const rows = filteredLeads.map((l) =>
      cols
        .map((col) => {
          if (col === "id") return escapeCell(l.id)
          if (col === "created_at") return escapeCell(l.created_at)
          const val = l.datos[col]
          return escapeCell(val != null ? String(val) : "")
        })
        .join(",")
    )

    const csv = [cols.join(","), ...rows].join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${base?.nombre ?? "base"}-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (baseLoading) return <Spinner />

  if (!selectedAccount || !base) {
    return <ErrorState message="No se encontro la base" onRetry={() => navigate("/bases")} />
  }

  const hasActiveFilters = Object.values(columnFilters).some((v) => v)

  return (
    <div>
      {/* Header */}
      <button
        onClick={() => navigate("/bases")}
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a bases
      </button>

      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-foreground">{base.nombre}</h2>
            {base.es_default && <Badge variant="info">Default</Badge>}
          </div>
          {base.descripcion && (
            <p className="text-sm text-muted-foreground mt-1">{base.descripcion}</p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Column picker toggle */}
          <button
            onClick={() => setShowColumnPicker(!showColumnPicker)}
            className={cn(
              "flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors",
              showColumnPicker
                ? "border-primary bg-primary/5 text-primary"
                : "border-border text-foreground hover:bg-gray-50"
            )}
          >
            <Columns3 className="h-4 w-4" />
            Columnas
          </button>

          {/* Export */}
          <button
            onClick={exportCsv}
            disabled={filteredLeads.length === 0}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            Descargar reporte
          </button>
        </div>
      </div>

      {/* Column picker panel */}
      {showColumnPicker && (
        <div className="mb-4 rounded-xl border border-border bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-foreground">
              Configurar columnas
            </p>
            <p className="text-xs text-muted-foreground">
              Arrastra para reordenar. La vista se guarda automaticamente.
            </p>
          </div>

          {/* Visible columns - draggable */}
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={visibleColumns} strategy={horizontalListSortingStrategy}>
              <div className="flex flex-wrap gap-2 mb-3 min-h-[40px] rounded-lg border border-dashed border-border p-2 bg-gray-50">
                {visibleColumns.map((col) => (
                  <DraggableChip
                    key={col}
                    id={col}
                    onRemove={() => toggleColumn(col)}
                    canRemove={visibleColumns.length > 1}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          {/* Hidden columns - clickable to add */}
          {allColumns.filter((c) => !visibleColumns.includes(c)).length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground mb-2">Columnas ocultas (click para agregar):</p>
              <div className="flex flex-wrap gap-2">
                {allColumns
                  .filter((c) => !visibleColumns.includes(c))
                  .map((col) => (
                    <button
                      key={col}
                      onClick={() => toggleColumn(col)}
                      className="inline-flex items-center rounded-lg border border-dashed border-gray-300 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                    >
                      + {col}
                    </button>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Search + filter controls */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar en todos los campos..."
            className="w-full rounded-lg border border-border bg-white pl-10 pr-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        {hasActiveFilters && (
          <button
            onClick={() => setColumnFilters({})}
            className="flex items-center gap-1 rounded-lg border border-border px-3 py-2.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-gray-50 transition-colors"
          >
            <X className="h-3.5 w-3.5" />
            Limpiar filtros
          </button>
        )}
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-white shadow-sm">
        {leadsLoading ? (
          <div className="p-6"><TableSkeleton rows={5} cols={visibleColumns.length + 2} /></div>
        ) : isError ? (
          <ErrorState onRetry={() => refetch()} />
        ) : filteredLeads.length === 0 ? (
          <EmptyState
            icon={Users}
            title={search || hasActiveFilters ? "Sin resultados" : "No hay leads en esta base"}
            description={
              search || hasActiveFilters
                ? "Intenta con otros filtros."
                : "Los leads se asignan automaticamente segun las reglas de ruteo."
            }
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                      ID
                    </th>
                    <th className="px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                      Fecha
                    </th>
                    {visibleColumns.map((col) => (
                      <th
                        key={col}
                        className="px-6 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap"
                      >
                        <div className="space-y-1">
                          <span>{col}</span>
                          <input
                            type="text"
                            value={columnFilters[col] ?? ""}
                            onChange={(e) =>
                              setColumnFilters((prev) => ({ ...prev, [col]: e.target.value }))
                            }
                            placeholder="Filtrar..."
                            className="block w-full rounded border border-border bg-gray-50 px-2 py-1 text-xs font-normal normal-case text-foreground placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-ring"
                          />
                        </div>
                      </th>
                    ))}
                    <th className="px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredLeads.map((lead) => (
                    <BaseLeadRow
                      key={lead.id}
                      lead={lead}
                      columns={visibleColumns}
                      onView={() => setSelectedLead(lead.id)}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            <div className="px-6 pb-4">
              <Pagination
                page={page}
                pageSize={pageSize}
                total={leadsData?.total ?? 0}
                onPageChange={setPage}
                onPageSizeChange={(s) => {
                  setPageSize(s)
                  setPage(1)
                }}
              />
            </div>
          </>
        )}
      </div>

      <LeadDetailModal
        open={!!selectedLead}
        onOpenChange={(o) => !o && setSelectedLead(null)}
        leadId={selectedLead}
      />
    </div>
  )
}

// ── Draggable column chip ──

function DraggableChip({
  id,
  onRemove,
  canRemove,
}: {
  id: string
  onRemove: () => void
  canRemove: boolean
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="inline-flex items-center gap-1 rounded-lg bg-white border border-border px-2.5 py-1.5 text-xs font-medium text-foreground shadow-sm select-none"
    >
      <span {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
        <GripVertical className="h-3 w-3 text-gray-400" />
      </span>
      <span>{id}</span>
      {canRemove && (
        <button
          onClick={onRemove}
          className="ml-0.5 rounded p-0.5 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </div>
  )
}

// ── Table row ──

function BaseLeadRow({
  lead,
  columns,
  onView,
}: {
  lead: LeadResponse
  columns: string[]
  onView: () => void
}) {
  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-6 py-4 text-sm font-mono font-medium text-foreground whitespace-nowrap">
        {lead.id_lead}
      </td>
      <td className="px-6 py-4 text-sm text-muted-foreground whitespace-nowrap">
        {formatDate(lead.created_at)}
      </td>
      {columns.map((col) => {
        const val = lead.datos[col]
        return (
          <td key={col} className="px-6 py-4 text-sm max-w-[200px]">
            {val != null ? (
              <span className="truncate block">{truncate(String(val), 40)}</span>
            ) : (
              <span className="text-gray-300">-</span>
            )}
          </td>
        )
      })}
      <td className="px-6 py-4">
        <button
          onClick={onView}
          className="inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium text-primary hover:bg-primary/10 transition-colors"
        >
          <Eye className="h-3.5 w-3.5" />
          Ver
        </button>
      </td>
    </tr>
  )
}
