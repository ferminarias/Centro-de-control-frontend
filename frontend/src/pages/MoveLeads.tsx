import { useState, useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  ArrowRightLeft,
  Search,
  CheckSquare,
  Square,
  MinusSquare,
  ChevronDown,
  Users,
} from "lucide-react"
import { useAccount } from "@/context/AccountContext"
import { useLeadBasesList } from "@/hooks/useLeadBases"
import { useMoveLeads } from "@/hooks/useMoveLeads"
import { useDebounce } from "@/hooks/useDebounce"
import { getLeadsByBase } from "@/api/leadBases"
import { TableSkeleton, Spinner } from "@/components/ui/Loading"
import ErrorState from "@/components/ui/ErrorState"
import EmptyState from "@/components/ui/EmptyState"
import Modal from "@/components/ui/Modal"
import { formatDate, truncate, cn } from "@/lib/utils"
import type { LeadResponse } from "@/types"

export default function MoveLeads() {
  const { selectedAccount } = useAccount()
  const accountId = selectedAccount?.id ?? ""

  const [selectedBaseId, setSelectedBaseId] = useState("")
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [selectedLeadIds, setSelectedLeadIds] = useState<Set<string>>(new Set())
  const [showMoveModal, setShowMoveModal] = useState(false)
  const [targetBaseId, setTargetBaseId] = useState("")
  const debouncedSearch = useDebounce(search, 300)

  // Fetch all bases for this account
  const { data: basesData, isLoading: basesLoading } = useLeadBasesList(accountId)
  const bases = basesData?.items ?? []

  // Fetch leads for selected base
  const {
    data: leadsData,
    isLoading: leadsLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["baseLeads", accountId, selectedBaseId, page, 50],
    queryFn: () => getLeadsByBase(accountId, selectedBaseId, page, 50),
    enabled: !!accountId && !!selectedBaseId,
  })

  const moveMutation = useMoveLeads(accountId)

  // Filter leads by search
  const filteredLeads = useMemo(() => {
    const leads = leadsData?.items ?? []
    if (!debouncedSearch) return leads
    const q = debouncedSearch.toLowerCase()
    return leads.filter((lead) =>
      Object.values(lead.datos).some((v) => String(v).toLowerCase().includes(q))
    )
  }, [leadsData?.items, debouncedSearch])

  // Derive visible columns from lead datos
  const columns = useMemo(() => {
    const colSet = new Set<string>()
    for (const lead of filteredLeads) {
      for (const key of Object.keys(lead.datos)) colSet.add(key)
    }
    return Array.from(colSet).slice(0, 6) // show up to 6 columns
  }, [filteredLeads])

  // Selection helpers
  const allVisibleSelected =
    filteredLeads.length > 0 && filteredLeads.every((l) => selectedLeadIds.has(l.id))
  const someVisibleSelected =
    filteredLeads.some((l) => selectedLeadIds.has(l.id)) && !allVisibleSelected

  const toggleAll = () => {
    if (allVisibleSelected) {
      setSelectedLeadIds(new Set())
    } else {
      setSelectedLeadIds(new Set(filteredLeads.map((l) => l.id)))
    }
  }

  const toggleLead = (id: string) => {
    setSelectedLeadIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  // When changing base, reset selections
  const handleBaseChange = (baseId: string) => {
    setSelectedBaseId(baseId)
    setSelectedLeadIds(new Set())
    setSearch("")
    setPage(1)
  }

  // Move action
  const handleMove = () => {
    if (!targetBaseId || selectedLeadIds.size === 0) return
    moveMutation.mutate(
      { lead_ids: Array.from(selectedLeadIds), target_base_id: targetBaseId },
      {
        onSuccess: () => {
          setSelectedLeadIds(new Set())
          setShowMoveModal(false)
          setTargetBaseId("")
          refetch()
        },
      }
    )
  }

  const selectedBaseName = bases.find((b) => b.id === selectedBaseId)?.nombre ?? ""
  const availableTargetBases = bases.filter((b) => b.id !== selectedBaseId)

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Mover Leads</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Selecciona una base, elige leads y muevelos a otra base.
          </p>
        </div>
      </div>

      {/* Base selector */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-foreground mb-1.5">
          Base de origen
        </label>
        <div className="relative max-w-sm">
          <select
            value={selectedBaseId}
            onChange={(e) => handleBaseChange(e.target.value)}
            className="w-full appearance-none rounded-lg border border-border bg-white px-4 py-2.5 pr-10 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">Seleccionar base...</option>
            {bases.map((b) => (
              <option key={b.id} value={b.id}>
                {b.nombre} ({b.total_leads ?? b.leads_count ?? 0} leads)
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        </div>
      </div>

      {basesLoading && <Spinner />}

      {/* Leads table */}
      {selectedBaseId && (
        <>
          {/* Search + move action bar */}
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

            {selectedLeadIds.size > 0 && (
              <button
                onClick={() => {
                  setTargetBaseId("")
                  setShowMoveModal(true)
                }}
                className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary/90 transition-colors"
              >
                <ArrowRightLeft className="h-4 w-4" />
                Mover {selectedLeadIds.size} lead{selectedLeadIds.size !== 1 ? "s" : ""}
              </button>
            )}
          </div>

          <div className="rounded-xl border border-border bg-white shadow-sm">
            {leadsLoading ? (
              <div className="p-6">
                <TableSkeleton rows={5} cols={columns.length + 2} />
              </div>
            ) : isError ? (
              <ErrorState onRetry={() => refetch()} />
            ) : filteredLeads.length === 0 ? (
              <EmptyState
                icon={Users}
                title={search ? "Sin resultados" : "No hay leads en esta base"}
                description={
                  search
                    ? "Intenta con otro termino de busqueda."
                    : "Esta base no tiene leads asignados."
                }
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border text-left">
                      {/* Select all checkbox */}
                      <th className="px-4 py-3 w-12">
                        <button onClick={toggleAll} className="text-gray-500 hover:text-foreground">
                          {allVisibleSelected ? (
                            <CheckSquare className="h-5 w-5 text-primary" />
                          ) : someVisibleSelected ? (
                            <MinusSquare className="h-5 w-5 text-primary" />
                          ) : (
                            <Square className="h-5 w-5" />
                          )}
                        </button>
                      </th>
                      <th className="px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                        Fecha
                      </th>
                      {columns.map((col) => (
                        <th
                          key={col}
                          className="px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap"
                        >
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredLeads.map((lead) => (
                      <MoveLeadRow
                        key={lead.id}
                        lead={lead}
                        columns={columns}
                        selected={selectedLeadIds.has(lead.id)}
                        onToggle={() => toggleLead(lead.id)}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Simple pagination */}
          {(leadsData?.total ?? 0) > 50 && (
            <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
              <span>
                Pagina {page} de {Math.ceil((leadsData?.total ?? 0) / 50)}
                {" "}({leadsData?.total} leads en total)
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-gray-50 disabled:opacity-50"
                >
                  Anterior
                </button>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page * 50 >= (leadsData?.total ?? 0)}
                  className="rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-gray-50 disabled:opacity-50"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Move confirmation modal */}
      <Modal
        open={showMoveModal}
        onOpenChange={setShowMoveModal}
        title="Mover leads"
      >
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Vas a mover <strong>{selectedLeadIds.size}</strong> lead
            {selectedLeadIds.size !== 1 ? "s" : ""} desde{" "}
            <strong>{selectedBaseName}</strong>.
          </p>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Base de destino
            </label>
            <div className="relative">
              <select
                value={targetBaseId}
                onChange={(e) => setTargetBaseId(e.target.value)}
                className="w-full appearance-none rounded-lg border border-border bg-white px-4 py-2.5 pr-10 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Seleccionar base destino...</option>
                {availableTargetBases.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.nombre}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setShowMoveModal(false)}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleMove}
              disabled={!targetBaseId || moveMutation.isPending}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {moveMutation.isPending ? (
                <>
                  <Spinner /> Moviendo...
                </>
              ) : (
                <>
                  <ArrowRightLeft className="h-4 w-4" />
                  Mover
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

// ── Table row with checkbox ──

function MoveLeadRow({
  lead,
  columns,
  selected,
  onToggle,
}: {
  lead: LeadResponse
  columns: string[]
  selected: boolean
  onToggle: () => void
}) {
  return (
    <tr
      className={cn(
        "transition-colors cursor-pointer",
        selected ? "bg-primary/5" : "hover:bg-gray-50"
      )}
      onClick={onToggle}
    >
      <td className="px-4 py-4 w-12">
        <button onClick={(e) => e.stopPropagation()} className="text-gray-500">
          {selected ? (
            <CheckSquare className="h-5 w-5 text-primary" />
          ) : (
            <Square className="h-5 w-5" />
          )}
        </button>
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
    </tr>
  )
}
