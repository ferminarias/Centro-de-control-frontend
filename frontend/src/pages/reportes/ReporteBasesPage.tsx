/**
 * Reporte de Bases - Consulta y exportación a Excel
 */
import { useState } from "react"
import {
  Database, Filter,
  FileSpreadsheet, ChevronLeft, X
} from "lucide-react"
import { useAccount } from "@/context/AccountContext"
import { useReporteBases } from "@/hooks/useReportes"
import { useLeadBasesList } from "@/hooks/useLeadBases"
import { useTipificacionesList } from "@/hooks/useTipificaciones"
import { useUsersList } from "@/hooks/useUsers"
import { TableSkeleton } from "@/components/ui/Loading"
import EmptyState from "@/components/ui/EmptyState"
import Badge from "@/components/ui/Badge"
import { Link } from "react-router-dom"
import { exportReporteBasesToExcel } from "@/lib/export"
import { toast } from "sonner"

const ESTADO_COLORS: Record<string, string> = {
  pendiente: "default",
  asignado: "info",
  gestionando: "warning",
  completado: "success",
  rechazado: "danger",
  pausado: "secondary",
}

export default function ReporteBasesPage() {
  const { selectedAccount } = useAccount()
  const accountId = selectedAccount?.id ?? ""
  
  // Filters
  const [filters, setFilters] = useState({
    base_id: "",
    fecha_desde: "",
    fecha_hasta: "",
    tipificacion_id: "",
    agente_id: "",
  })
  const [showFilters, setShowFilters] = useState(false)
  const [page, setPage] = useState(0)
  const limit = 50
  
  // Data
  const { data: reporte, isLoading } = useReporteBases(
    accountId, 
    filters,
    limit,
    page * limit
  )
  const { data: basesData } = useLeadBasesList(accountId)
  const { data: tipificacionesData } = useTipificacionesList(accountId, true)
  const { data: usersData } = useUsersList(accountId)
  
  const bases = basesData?.items || []
  const tipificaciones = tipificacionesData?.items || []
  const users = usersData?.items || []
  
  const handleExportExcel = () => {
    if (!reporte?.items.length) {
      toast.error("No hay datos para exportar")
      return
    }
    
    // Generar nombre de archivo con fecha
    const fecha = new Date().toISOString().split("T")[0]
    const baseNombre = filters.base_id 
      ? bases.find(b => b.id === filters.base_id)?.nombre 
      : "todas-las-bases"
    const fileName = `reporte-bases-${baseNombre}-${fecha}`
    
    exportReporteBasesToExcel(reporte.items, fileName)
    toast.success("Excel descargado correctamente")
  }
  
  const clearFilters = () => {
    setFilters({
      base_id: "",
      fecha_desde: "",
      fecha_hasta: "",
      tipificacion_id: "",
      agente_id: "",
    })
    setPage(0)
  }
  
  const hasFilters = Object.values(filters).some(v => v !== "")
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/reportes"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Reporte de Bases</h1>
            <p className="text-sm text-muted-foreground">
              Consulta la gestión de tus bases de datos
            </p>
          </div>
        </div>
        <button
          onClick={handleExportExcel}
          disabled={!reporte?.items.length || isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FileSpreadsheet className="h-4 w-4" />
          Exportar Excel
          {reporte?.items.length ? ` (${reporte.total})` : ""}
        </button>
      </div>
      
      {/* Filters */}
      <div className="bg-white rounded-xl border border-border p-4">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary"
          >
            <Filter className="h-4 w-4" />
            Filtros
            {hasFilters && (
              <span className="px-2 py-0.5 bg-primary text-white text-xs rounded-full">
                Activos
              </span>
            )}
          </button>
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1"
            >
              <X className="h-3 w-3" />
              Limpiar
            </button>
          )}
        </div>
        
        {showFilters && (
          <div className="grid grid-cols-5 gap-4 pt-4 border-t border-border">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Base de datos
              </label>
              <select
                value={filters.base_id}
                onChange={(e) => setFilters(f => ({ ...f, base_id: e.target.value }))}
                className="w-full rounded-lg border border-border px-3 py-2 text-sm"
              >
                <option value="">Todas las bases</option>
                {bases.map(b => (
                  <option key={b.id} value={b.id}>{b.nombre}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Desde
              </label>
              <input
                type="date"
                value={filters.fecha_desde}
                onChange={(e) => setFilters(f => ({ ...f, fecha_desde: e.target.value }))}
                className="w-full rounded-lg border border-border px-3 py-2 text-sm"
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Hasta
              </label>
              <input
                type="date"
                value={filters.fecha_hasta}
                onChange={(e) => setFilters(f => ({ ...f, fecha_hasta: e.target.value }))}
                className="w-full rounded-lg border border-border px-3 py-2 text-sm"
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Tipificación
              </label>
              <select
                value={filters.tipificacion_id}
                onChange={(e) => setFilters(f => ({ ...f, tipificacion_id: e.target.value }))}
                className="w-full rounded-lg border border-border px-3 py-2 text-sm"
              >
                <option value="">Todas</option>
                {tipificaciones.map(t => (
                  <option key={t.id} value={t.id}>{t.nombre}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Agente
              </label>
              <select
                value={filters.agente_id}
                onChange={(e) => setFilters(f => ({ ...f, agente_id: e.target.value }))}
                className="w-full rounded-lg border border-border px-3 py-2 text-sm"
              >
                <option value="">Todos</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.nombre}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>
      
      {/* Results */}
      <div className="bg-white rounded-xl border border-border overflow-hidden">
        {isLoading ? (
          <div className="p-6">
            <TableSkeleton rows={10} cols={8} />
          </div>
        ) : reporte?.items.length === 0 ? (
          <EmptyState
            icon={Database}
            title="No hay resultados"
            description={hasFilters 
              ? "Prueba ajustando los filtros para ver más resultados" 
              : "No hay gestiones registradas aún"
            }
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-border">
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Lead</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Base</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Campaña</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Estado</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Agente</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Tipificación</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Intentos</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Fecha</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {reporte?.items.map((item) => (
                    <tr key={item.cola_id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-sm">{item.lead_nombre}</p>
                          <p className="text-xs text-muted-foreground">{item.lead_telefono}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">{item.base_nombre}</td>
                      <td className="px-4 py-3 text-sm">{item.campania_nombre}</td>
                      <td className="px-4 py-3">
                        <Badge variant={(ESTADO_COLORS[item.estado] || "default") as "default" | "success" | "danger" | "warning" | "info" | "secondary"}>
                          {item.estado}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {item.agente_nombre || "-"}
                      </td>
                      <td className="px-4 py-3">
                        {item.tipificacion ? (
                          <div>
                            <span className="text-sm">{item.tipificacion}</span>
                            {item.subtipificacion && (
                              <span className="text-xs text-muted-foreground block">
                                {item.subtipificacion}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-center">
                        {item.intentos}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {item.completed_at 
                          ? new Date(item.completed_at).toLocaleDateString("es-ES")
                          : "-"
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-border">
              <p className="text-sm text-muted-foreground">
                Mostrando {page * limit + 1} - {Math.min((page + 1) * limit, reporte?.total || 0)} de {reporte?.total || 0} resultados
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="px-3 py-1 text-sm border rounded-lg disabled:opacity-50 hover:bg-gray-50"
                >
                  Anterior
                </button>
                <button
                  onClick={() => setPage(p => p + 1)}
                  disabled={!reporte || (page + 1) * limit >= reporte.total}
                  className="px-3 py-1 text-sm border rounded-lg disabled:opacity-50 hover:bg-gray-50"
                >
                  Siguiente
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
