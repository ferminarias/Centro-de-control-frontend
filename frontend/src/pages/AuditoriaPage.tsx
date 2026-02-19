/**
 * Auditoría / Logs de Sistema
 * Visualiza el historial de cambios en entidades
 */
import { useState } from "react"
import {
  History, Filter, User, Database,
  Tag, CheckSquare, StickyNote, ChevronLeft, X,
  Clock, ArrowRightLeft
} from "lucide-react"
import { useAccount } from "@/context/AccountContext"
import { useAuditLogs } from "@/hooks/useCrmExtras"
import { useUsersList } from "@/hooks/useUsers"
import { TableSkeleton } from "@/components/ui/Loading"
import EmptyState from "@/components/ui/EmptyState"
import Badge from "@/components/ui/Badge"
import { Link } from "react-router-dom"

const ENTIDADES = [
  { id: "lead", label: "Leads", icon: User },
  { id: "actividad", label: "Actividades", icon: Clock },
  { id: "tarea", label: "Tareas", icon: CheckSquare },
  { id: "nota", label: "Notas", icon: StickyNote },
  { id: "tag", label: "Tags", icon: Tag },
]

const ACCIONES: Record<string, { label: string; color: string }> = {
  create: { label: "Creación", color: "green" },
  update: { label: "Actualización", color: "blue" },
  delete: { label: "Eliminación", color: "red" },
  view: { label: "Visualización", color: "gray" },
  login: { label: "Login", color: "purple" },
  logout: { label: "Logout", color: "orange" },
}

export default function AuditoriaPage() {
  const { selectedAccount } = useAccount()
  const accountId = selectedAccount?.id ?? ""
  
  // Filters
  const [showFilters, setShowFilters] = useState(false)
  const [entidadTipo, setEntidadTipo] = useState("")
  const [entidadId, setEntidadId] = useState("")
  const [userId, setUserId] = useState("")
  const [accion, setAccion] = useState("")
  const [fechaDesde, setFechaDesde] = useState("")
  const [fechaHasta, setFechaHasta] = useState("")
  
  // Data
  const { data: logsData, isLoading } = useAuditLogs(accountId, {
    entidad_tipo: entidadTipo || undefined,
    entidad_id: entidadId || undefined,
    user_id: userId || undefined,
    accion: accion || undefined,
    desde: fechaDesde || undefined,
    hasta: fechaHasta || undefined,
  })
  const { data: usersData } = useUsersList(accountId)
  
  const logs = logsData?.items || []
  const users = usersData?.items || []
  
  const clearFilters = () => {
    setEntidadTipo("")
    setEntidadId("")
    setUserId("")
    setAccion("")
    setFechaDesde("")
    setFechaHasta("")
  }
  
  const hasFilters = entidadTipo || entidadId || userId || accion || fechaDesde || fechaHasta
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Auditoría / Logs</h1>
            <p className="text-sm text-muted-foreground">
              Historial de cambios en el sistema
            </p>
          </div>
        </div>
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
          <div className="grid grid-cols-6 gap-4 pt-4 border-t border-border">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Tipo de Entidad
              </label>
              <select
                value={entidadTipo}
                onChange={(e) => setEntidadTipo(e.target.value)}
                className="w-full rounded-lg border border-border px-3 py-2 text-sm"
              >
                <option value="">Todas</option>
                {ENTIDADES.map(e => (
                  <option key={e.id} value={e.id}>{e.label}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                ID de Entidad
              </label>
              <input
                type="text"
                value={entidadId}
                onChange={(e) => setEntidadId(e.target.value)}
                placeholder="UUID"
                className="w-full rounded-lg border border-border px-3 py-2 text-sm"
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Usuario
              </label>
              <select
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="w-full rounded-lg border border-border px-3 py-2 text-sm"
              >
                <option value="">Todos</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.nombre}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Acción
              </label>
              <select
                value={accion}
                onChange={(e) => setAccion(e.target.value)}
                className="w-full rounded-lg border border-border px-3 py-2 text-sm"
              >
                <option value="">Todas</option>
                {Object.entries(ACCIONES).map(([key, { label }]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Desde
              </label>
              <input
                type="date"
                value={fechaDesde}
                onChange={(e) => setFechaDesde(e.target.value)}
                className="w-full rounded-lg border border-border px-3 py-2 text-sm"
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Hasta
              </label>
              <input
                type="date"
                value={fechaHasta}
                onChange={(e) => setFechaHasta(e.target.value)}
                className="w-full rounded-lg border border-border px-3 py-2 text-sm"
              />
            </div>
          </div>
        )}
      </div>
      
      {/* Results */}
      <div className="bg-white rounded-xl border border-border overflow-hidden">
        {isLoading ? (
          <div className="p-6">
            <TableSkeleton rows={10} cols={6} />
          </div>
        ) : logs.length === 0 ? (
          <EmptyState
            icon={History}
            title="No hay logs"
            description={hasFilters 
              ? "Prueba ajustando los filtros para ver más resultados" 
              : "No se han registrado acciones aún"
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-border">
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Fecha/Hora</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Usuario</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Acción</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Entidad</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Detalles</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {logs.map((log) => {
                  const accionInfo = ACCIONES[log.accion] || { label: log.accion, color: "gray" }
                  const EntidadIcon = ENTIDADES.find(e => e.id === log.entidad_tipo)?.icon || Database
                  
                  return (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="text-sm">
                          {new Date(log.created_at).toLocaleDateString("es-ES")}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(log.created_at).toLocaleTimeString("es-ES")}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="h-3 w-3 text-primary" />
                          </div>
                          <span className="text-sm">{log.user_nombre || "Sistema"}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={accionInfo.color as any}>
                          {accionInfo.label}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <EntidadIcon className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <span className="text-sm capitalize">{log.entidad_tipo}</span>
                            <span className="text-xs text-muted-foreground block font-mono">
                              {log.entidad_id.slice(0, 8)}...
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {log.campo ? (
                          <div className="text-xs space-y-1">
                            <div className="flex items-center gap-1">
                              <span className="text-muted-foreground">{log.campo}:</span>
                              {log.valor_anterior !== undefined && (
                                <span className="text-red-600 line-through">{String(log.valor_anterior).slice(0, 20)}</span>
                              )}
                              <ArrowRightLeft className="h-3 w-3 text-gray-400" />
                              {log.valor_nuevo !== undefined && (
                                <span className="text-green-600">{String(log.valor_nuevo).slice(0, 20)}</span>
                              )}
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-muted-foreground font-mono">
                          {log.ip_address || "-"}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Info */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <History className="h-5 w-5 text-amber-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-amber-900">Sobre la Auditoría</h3>
            <p className="text-sm text-amber-800 mt-1">
              El sistema registra automáticamente todas las acciones importantes como creación, 
              actualización y eliminación de registros. Los logs se mantienen por 90 días.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
