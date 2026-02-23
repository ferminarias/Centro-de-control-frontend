/**
 * Centro de Control — Dashboard de Tipificaciones Externas (Neotel)
 */
import { useState } from "react"
import { Radio, RefreshCw, Eye } from "lucide-react"
import { useAccount } from "@/context/AccountContext"
import {
  useCentroControlFeed,
  useTipificacionesExternas,
  useRetryMatch,
} from "@/hooks/useCentroControl"
import { TableSkeleton } from "@/components/ui/Loading"
import EmptyState from "@/components/ui/EmptyState"
import Badge from "@/components/ui/Badge"
import Pagination from "@/components/ui/Pagination"
import LeadDetailModal from "@/components/leads/LeadDetailModal"

type Tab = "feed" | "historial"
type MatchFilter = "all" | "matched" | "pending"

export default function CentroControlPage() {
  const { selectedAccount } = useAccount()
  const accountId = selectedAccount?.id ?? ""

  const [tab, setTab] = useState<Tab>("feed")
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const retryMatch = useRetryMatch(accountId)

  const openLead = (leadId: string | null) => {
    if (!leadId) return
    setSelectedLeadId(leadId)
    setModalOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Radio className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Centro de Control</h1>
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Tipificaciones externas recibidas desde Neotel
          </p>
        </div>

        <button
          onClick={() => retryMatch.mutate()}
          disabled={retryMatch.isPending}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          <RefreshCw className={`h-4 w-4 ${retryMatch.isPending ? "animate-spin" : ""}`} />
          Reintentar Match
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        <button
          onClick={() => setTab("feed")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            tab === "feed"
              ? "bg-white text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Feed en vivo
        </button>
        <button
          onClick={() => setTab("historial")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            tab === "historial"
              ? "bg-white text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Historial
        </button>
      </div>

      {/* Content */}
      {tab === "feed" ? (
        <FeedTab accountId={accountId} onOpenLead={openLead} />
      ) : (
        <HistorialTab accountId={accountId} onOpenLead={openLead} />
      )}

      <LeadDetailModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        leadId={selectedLeadId}
      />
    </div>
  )
}

// =============================================================================
// Feed en vivo (SSE)
// =============================================================================

function FeedTab({
  accountId,
  onOpenLead,
}: {
  accountId: string
  onOpenLead: (id: string | null) => void
}) {
  const { tipificaciones, isConnected, error } = useCentroControlFeed(accountId)

  return (
    <div className="bg-white rounded-xl border border-border overflow-hidden">
      {/* Connection status */}
      <div className="px-4 py-2 border-b border-border bg-gray-50/50 flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          {isConnected ? (
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-green-500" />
              Conectado — datos en tiempo real
            </span>
          ) : error ? (
            <span className="flex items-center gap-1.5 text-red-600">
              <span className="h-2 w-2 rounded-full bg-red-500" />
              {error}
            </span>
          ) : (
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-yellow-500" />
              Conectando...
            </span>
          )}
        </span>
        <span className="text-xs text-muted-foreground">
          {tipificaciones.length} registros
        </span>
      </div>

      {tipificaciones.length === 0 ? (
        <EmptyState
          icon={Radio}
          title="Sin tipificaciones"
          description="Las tipificaciones externas aparecerán aquí en tiempo real"
        />
      ) : (
        <TipificacionesTable items={tipificaciones} onOpenLead={onOpenLead} />
      )}
    </div>
  )
}

// =============================================================================
// Historial (paginado con React Query)
// =============================================================================

function HistorialTab({
  accountId,
  onOpenLead,
}: {
  accountId: string
  onOpenLead: (id: string | null) => void
}) {
  const [matchFilter, setMatchFilter] = useState<MatchFilter>("all")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)

  const matched =
    matchFilter === "matched" ? true : matchFilter === "pending" ? false : undefined

  const { data, isLoading } = useTipificacionesExternas(accountId, {
    matched,
    page,
    page_size: pageSize,
  })

  return (
    <div className="space-y-4">
      {/* Filtro */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        {([
          ["all", "Todas"],
          ["matched", "Matcheadas"],
          ["pending", "Pendientes"],
        ] as [MatchFilter, string][]).map(([value, label]) => (
          <button
            key={value}
            onClick={() => {
              setMatchFilter(value)
              setPage(1)
            }}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              matchFilter === value
                ? "bg-white text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-border overflow-hidden">
        {isLoading ? (
          <div className="p-6">
            <TableSkeleton rows={10} cols={5} />
          </div>
        ) : !data || data.items.length === 0 ? (
          <EmptyState
            icon={Radio}
            title="Sin resultados"
            description="No se encontraron tipificaciones con los filtros seleccionados"
          />
        ) : (
          <>
            <TipificacionesTable items={data.items} onOpenLead={onOpenLead} />
            <div className="px-4 pb-4">
              <Pagination
                page={page}
                pageSize={pageSize}
                total={data.total}
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
    </div>
  )
}

// =============================================================================
// Tabla reutilizable
// =============================================================================

function TipificacionesTable({
  items,
  onOpenLead,
}: {
  items: import("@/types/centroControl").TipificacionExterna[]
  onOpenLead: (id: string | null) => void
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-gray-50 border-b border-border">
            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
              Fecha/Hora
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
              Email
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
              ID Neotel
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
              ID Subresol.
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
              Estado
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
              Lead
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {items.map((tip) => (
            <tr key={tip.id} className="hover:bg-gray-50">
              <td className="px-4 py-3">
                <div className="text-sm">
                  {new Date(tip.created_at).toLocaleDateString("es-ES")}
                </div>
                <div className="text-xs text-muted-foreground">
                  {new Date(tip.created_at).toLocaleTimeString("es-ES")}
                </div>
              </td>
              <td className="px-4 py-3 text-sm">{tip.email}</td>
              <td className="px-4 py-3 text-sm font-mono">{tip.id_neotel}</td>
              <td className="px-4 py-3 text-sm font-mono">{tip.id_subresolucion}</td>
              <td className="px-4 py-3">
                <Badge variant={tip.matched ? "success" : "danger"}>
                  {tip.matched ? "Matcheado" : "Pendiente"}
                </Badge>
              </td>
              <td className="px-4 py-3">
                {tip.lead_id ? (
                  <button
                    onClick={() => onOpenLead(tip.lead_id)}
                    className="flex items-center gap-1 text-sm text-blue-600 hover:underline"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    {tip.lead_id.slice(0, 8)}...
                  </button>
                ) : (
                  <span className="text-sm text-muted-foreground">—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
