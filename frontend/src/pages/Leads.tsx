import { useState, useMemo } from "react"
import { Search, Download, Eye, Users } from "lucide-react"
import { useAccount } from "@/context/AccountContext"
import { useLeadsList } from "@/hooks/useLeads"
import { useFieldsList } from "@/hooks/useFields"
import { useDebounce } from "@/hooks/useDebounce"
import { TableSkeleton } from "@/components/ui/Loading"
import ErrorState from "@/components/ui/ErrorState"
import EmptyState from "@/components/ui/EmptyState"
import Pagination from "@/components/ui/Pagination"
import LeadDetailModal from "@/components/leads/LeadDetailModal"
import { formatDate, truncate } from "@/lib/utils"
import type { LeadResponse } from "@/types"

export default function Leads() {
  const { selectedAccount } = useAccount()
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [search, setSearch] = useState("")
  const [selectedLead, setSelectedLead] = useState<string | null>(null)
  const debouncedSearch = useDebounce(search, 300)

  const { data, isLoading, isError, refetch } = useLeadsList(selectedAccount?.id, page, pageSize)
  const { data: fieldsData } = useFieldsList(selectedAccount?.id)

  const fields = fieldsData?.items ?? []
  const columnNames = useMemo(() => fields.map((f) => f.nombre_campo), [fields])

  // Client-side filter by search term
  const filteredLeads = useMemo(() => {
    const leads = data?.items ?? []
    if (!debouncedSearch) return leads
    const q = debouncedSearch.toLowerCase()
    return leads.filter((lead) =>
      Object.values(lead.datos).some((v) => String(v).toLowerCase().includes(q))
    )
  }, [data?.items, debouncedSearch])

  const exportCsv = () => {
    const leads = filteredLeads
    if (leads.length === 0) return

    const allKeys = new Set<string>()
    leads.forEach((l) => Object.keys(l.datos).forEach((k) => allKeys.add(k)))
    const cols = ["id", "created_at", ...allKeys]

    const escapeCell = (val: string) => {
      if (val.includes(",") || val.includes('"') || val.includes("\n")) {
        return `"${val.replace(/"/g, '""')}"`
      }
      return val
    }

    const rows = leads.map((l) =>
      cols.map((col) => {
        if (col === "id") return escapeCell(l.id)
        if (col === "created_at") return escapeCell(l.created_at)
        const val = l.datos[col]
        return escapeCell(val != null ? String(val) : "")
      }).join(",")
    )

    const csv = [cols.join(","), ...rows].join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `leads-${selectedAccount?.nombre ?? "export"}-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (!selectedAccount) {
    return (
      <EmptyState
        icon={Users}
        title="Selecciona un cliente"
        description="Elige un cliente del selector en el header para ver sus leads."
      />
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Leads</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Leads recibidos de {selectedAccount.nombre}
          </p>
        </div>
        <button
          onClick={exportCsv}
          disabled={filteredLeads.length === 0}
          className="flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-foreground hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          <Download className="h-4 w-4" />
          Exportar CSV
        </button>
      </div>

      {/* Search */}
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
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-white shadow-sm">
        {isLoading ? (
          <div className="p-6"><TableSkeleton rows={5} cols={4} /></div>
        ) : isError ? (
          <ErrorState onRetry={() => refetch()} />
        ) : filteredLeads.length === 0 ? (
          <EmptyState
            icon={Users}
            title={search ? "Sin resultados" : "No hay leads"}
            description={search ? "Intenta con otro termino de busqueda." : "Los leads aparecen cuando se envian datos al webhook."}
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">ID</th>
                    <th className="px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">Fecha</th>
                    {columnNames.map((col) => (
                      <th key={col} className="px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                        {col}
                      </th>
                    ))}
                    {columnNames.length === 0 && (
                      <th className="px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Datos</th>
                    )}
                    <th className="px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">Base de datos</th>
                    <th className="px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredLeads.map((lead) => (
                    <LeadRow
                      key={lead.id}
                      lead={lead}
                      columns={columnNames}
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
                total={data?.total ?? 0}
                onPageChange={setPage}
                onPageSizeChange={(s) => { setPageSize(s); setPage(1) }}
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

function LeadRow({
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
      {columns.length > 0 ? (
        columns.map((col) => {
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
        })
      ) : (
        <td className="px-6 py-4">
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(lead.datos).slice(0, 3).map(([k, v]) => (
              <span key={k} className="inline-flex rounded bg-gray-100 px-2 py-0.5 text-xs font-mono">
                <span className="text-primary">{k}</span>
                <span className="text-gray-400 mx-1">:</span>
                <span>{truncate(String(v), 20)}</span>
              </span>
            ))}
          </div>
        </td>
      )}
      <td className="px-6 py-4 text-sm whitespace-nowrap">
        {lead.base_nombre ? (
          <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-blue-600/20">
            {lead.base_nombre}
          </span>
        ) : (
          <span className="text-gray-300">-</span>
        )}
      </td>
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
