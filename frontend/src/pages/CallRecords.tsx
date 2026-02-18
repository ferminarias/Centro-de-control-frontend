import { useState } from "react"
import { PhoneCall, ChevronDown, Filter, Eye, X } from "lucide-react"
import { useAccount } from "@/context/AccountContext"
import { useCallRecords, useCallEvents, useCampaigns, useAgents, useDispositions } from "@/hooks/useVoip"
import { TableSkeleton } from "@/components/ui/Loading"
import ErrorState from "@/components/ui/ErrorState"
import EmptyState from "@/components/ui/EmptyState"
import Badge from "@/components/ui/Badge"
import Modal from "@/components/ui/Modal"
import Pagination from "@/components/ui/Pagination"
import { formatDate } from "@/lib/utils"

export default function CallRecords() {
  const { selectedAccount } = useAccount()
  const accountId = selectedAccount?.id ?? ""

  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<Record<string, string>>({})
  const [activeFilters, setActiveFilters] = useState<Record<string, string | number>>({})

  const params = { page, page_size: pageSize, ...activeFilters }
  const { data, isLoading, isError, refetch } = useCallRecords(accountId || undefined, params)

  const { data: campaignsData } = useCampaigns(accountId || undefined)
  const { data: agentsData } = useAgents(accountId || undefined)
  const { data: dispositionsData } = useDispositions(accountId || undefined)

  const [eventTarget, setEventTarget] = useState<string | null>(null)
  const { data: events, isLoading: eventsLoading } = useCallEvents(eventTarget ?? undefined)

  const records = data?.items ?? []
  const campaigns = campaignsData?.items ?? []
  const agents = agentsData?.items ?? []
  const dispositions = dispositionsData?.items ?? []

  const applyFilters = () => {
    const applied: Record<string, string> = {}
    for (const [k, v] of Object.entries(filters)) {
      if (v) applied[k] = v
    }
    setActiveFilters(applied)
    setPage(1)
  }

  const clearFilters = () => {
    setFilters({})
    setActiveFilters({})
    setPage(1)
  }

  const hasActiveFilters = Object.keys(activeFilters).length > 0

  const estadoVariant = (e: string) => {
    switch (e) {
      case "answered": return "success" as const
      case "no_answer": case "busy": return "warning" as const
      case "failed": return "danger" as const
      default: return "default" as const
    }
  }

  if (!selectedAccount) return null

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Registro de Llamadas (CDR)</h2>
          <p className="text-sm text-muted-foreground mt-1">Historial detallado de todas las llamadas.</p>
        </div>
        <button onClick={() => setShowFilters(!showFilters)} className={`flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${hasActiveFilters ? "border-primary text-primary bg-primary/5" : "border-border text-foreground hover:bg-gray-50"}`}>
          <Filter className="h-4 w-4" /> Filtros {hasActiveFilters && `(${Object.keys(activeFilters).length})`}
        </button>
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div className="rounded-xl border border-border bg-white shadow-sm p-4 mb-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Campana</label>
              <div className="relative">
                <select value={filters.campaign_id ?? ""} onChange={(e) => setFilters({ ...filters, campaign_id: e.target.value })} className="w-full appearance-none rounded-lg border border-border bg-white px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                  <option value="">Todas</option>
                  {campaigns.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Agente</label>
              <div className="relative">
                <select value={filters.agent_id ?? ""} onChange={(e) => setFilters({ ...filters, agent_id: e.target.value })} className="w-full appearance-none rounded-lg border border-border bg-white px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                  <option value="">Todos</option>
                  {agents.map((a) => <option key={a.id} value={a.id}>{a.nombre}</option>)}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Tipificacion</label>
              <div className="relative">
                <select value={filters.disposition_id ?? ""} onChange={(e) => setFilters({ ...filters, disposition_id: e.target.value })} className="w-full appearance-none rounded-lg border border-border bg-white px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                  <option value="">Todas</option>
                  {dispositions.map((d) => <option key={d.id} value={d.id}>{d.nombre}</option>)}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Desde</label>
              <input type="date" value={filters.fecha_desde ?? ""} onChange={(e) => setFilters({ ...filters, fecha_desde: e.target.value })} className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Hasta</label>
              <input type="date" value={filters.fecha_hasta ?? ""} onChange={(e) => setFilters({ ...filters, fecha_hasta: e.target.value })} className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            {hasActiveFilters && (
              <button onClick={clearFilters} className="flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-gray-50 transition-colors">
                <X className="h-3.5 w-3.5" /> Limpiar
              </button>
            )}
            <button onClick={applyFilters} className="rounded-lg bg-primary px-4 py-1.5 text-sm font-medium text-white hover:bg-primary/90 transition-colors">
              Aplicar filtros
            </button>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-border bg-white shadow-sm">
        {isLoading ? (
          <div className="p-6"><TableSkeleton rows={6} cols={8} /></div>
        ) : isError ? (
          <ErrorState onRetry={() => refetch()} />
        ) : records.length === 0 ? (
          <EmptyState icon={PhoneCall} title="Sin registros" description="No hay llamadas registradas con los filtros actuales." />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Telefono</th>
                    <th className="px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Direccion</th>
                    <th className="px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Estado</th>
                    <th className="px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Agente</th>
                    <th className="px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Duracion</th>
                    <th className="px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Conversacion</th>
                    <th className="px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Tipificacion</th>
                    <th className="px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Fecha</th>
                    <th className="px-6 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {records.map((r) => (
                    <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-mono text-foreground">{r.telefono}</td>
                      <td className="px-6 py-4"><Badge>{r.direccion}</Badge></td>
                      <td className="px-6 py-4"><Badge variant={estadoVariant(r.estado)}>{r.estado}</Badge></td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{r.agent_nombre ?? "-"}</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{r.duracion != null ? `${r.duracion}s` : "-"}</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{r.duracion_conversacion != null ? `${r.duracion_conversacion}s` : "-"}</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{r.disposition_nombre ?? "-"}</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground whitespace-nowrap">{formatDate(r.created_at)}</td>
                      <td className="px-6 py-4">
                        <button onClick={() => setEventTarget(r.id)} className="rounded-md p-1.5 text-gray-400 hover:text-primary hover:bg-primary/10 transition-colors" title="Ver eventos">
                          <Eye className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-6 pb-4">
              <Pagination page={page} pageSize={pageSize} total={data?.total ?? 0} onPageChange={setPage} onPageSizeChange={(s) => { setPageSize(s); setPage(1) }} />
            </div>
          </>
        )}
      </div>

      {/* Call events modal */}
      <Modal open={!!eventTarget} onOpenChange={(o) => !o && setEventTarget(null)} title="Eventos de la llamada">
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {eventsLoading ? (
            <div className="flex justify-center py-8"><span className="text-sm text-muted-foreground">Cargando...</span></div>
          ) : (events ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">Sin eventos registrados.</p>
          ) : (
            <div className="relative border-l-2 border-border ml-3 pl-4 space-y-4">
              {(events ?? []).map((ev) => (
                <div key={ev.id} className="relative">
                  <div className="absolute -left-[1.35rem] top-1 h-2.5 w-2.5 rounded-full bg-primary border-2 border-white" />
                  <p className="text-sm font-medium text-foreground">{ev.evento}</p>
                  {ev.detalle && <p className="text-xs text-muted-foreground mt-0.5">{ev.detalle}</p>}
                  <p className="text-xs text-gray-400 mt-0.5">{new Date(ev.created_at).toLocaleString()}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>
    </div>
  )
}
