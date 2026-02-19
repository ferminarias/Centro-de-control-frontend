/**
 * Métricas de Agentes - Productividad y tiempos
 */
import { useState } from "react"
import { 
  Users, ChevronLeft, Clock, Target, 
  Phone, TrendingUp, Calendar
} from "lucide-react"
import { useAccount } from "@/context/AccountContext"
import { useMetricasAgentes } from "@/hooks/useReportes"
import { useCampaniasList } from "@/hooks/useCampanias"
import { TableSkeleton } from "@/components/ui/Loading"
import EmptyState from "@/components/ui/EmptyState"
import { cn } from "@/lib/utils"
import { Link } from "react-router-dom"
import { exportMetricasAgentesToExcel } from "@/lib/export"
import { toast } from "sonner"
import { FileSpreadsheet } from "lucide-react"

export default function MetricasAgentesPage() {
  const { selectedAccount } = useAccount()
  const accountId = selectedAccount?.id ?? ""
  
  // Filters
  const [campaniaId, setCampaniaId] = useState("")
  const [fechaDesde, setFechaDesde] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() - 7)
    return d.toISOString().split("T")[0]
  })
  const [fechaHasta, setFechaHasta] = useState(() => {
    return new Date().toISOString().split("T")[0]
  })
  
  // Data
  const { data: metricas, isLoading } = useMetricasAgentes(accountId, {
    campania_id: campaniaId || undefined,
    fecha_desde: fechaDesde,
    fecha_hasta: fechaHasta,
  })
  const { data: campaniasData } = useCampaniasList(accountId)
  const campanias = campaniasData?.items || []
  
  const agentes = metricas?.agentes || []
  
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
            <h1 className="text-2xl font-bold text-foreground">Métricas de Agentes</h1>
            <p className="text-sm text-muted-foreground">
              Productividad, tiempos y eficiencia por agente
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            if (!agentes.length) {
              toast.error("No hay datos para exportar")
              return
            }
            const fecha = new Date().toISOString().split("T")[0]
            const fileName = `metricas-agentes-${fecha}`
            exportMetricasAgentesToExcel(agentes, fileName)
            toast.success("Excel descargado correctamente")
          }}
          disabled={!agentes.length || isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FileSpreadsheet className="h-4 w-4" />
          Exportar Excel
        </button>
      </div>
      
      {/* Filters */}
      <div className="bg-white rounded-xl border border-border p-4">
        <div className="grid grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">
              Campaña
            </label>
            <select
              value={campaniaId}
              onChange={(e) => setCampaniaId(e.target.value)}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm"
            >
              <option value="">Todas las campañas</option>
              {campanias.map(c => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
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
          
          <div className="flex items-end">
            <div className="text-sm text-muted-foreground">
              <Calendar className="h-4 w-4 inline mr-1" />
              Período: {metricas?.periodo.desde 
                ? new Date(metricas.periodo.desde).toLocaleDateString("es-ES")
                : "-"
              } al {" "}
              {metricas?.periodo.hasta
                ? new Date(metricas.periodo.hasta).toLocaleDateString("es-ES")
                : "-"
              }
            </div>
          </div>
        </div>
      </div>
      
      {/* Results */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="bg-white rounded-xl border border-border p-6">
            <TableSkeleton rows={5} cols={6} />
          </div>
        ) : agentes.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No hay datos"
            description="No se encontraron métricas para el período seleccionado"
          />
        ) : (
          agentes.map((agente, idx) => (
            <AgenteCard 
              key={agente.agente_id} 
              agente={agente} 
              rank={idx + 1}
            />
          ))
        )}
      </div>
    </div>
  )
}

function AgenteCard({ 
  agente, 
  rank 
}: { 
  agente: {
    agente_id: string
    nombre: string
    email: string
    tiempo: {
      conectado_horas: number
      pausado_minutos: number
    }
    productividad: {
      fichas_gestionadas: number
      fichas_por_hora: number
    }
    tipificaciones: { nombre: string; cantidad: number }[]
  }
  rank: number
}) {
  return (
    <div className="bg-white rounded-xl border border-border p-6">
      <div className="flex items-start justify-between">
        {/* Info */}
        <div className="flex items-center gap-4">
          <div className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold",
            rank === 1 && "bg-yellow-100 text-yellow-700",
            rank === 2 && "bg-gray-100 text-gray-700",
            rank === 3 && "bg-orange-100 text-orange-700",
            rank > 3 && "bg-blue-50 text-blue-700"
          )}>
            {rank}
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{agente.nombre}</h3>
            <p className="text-sm text-muted-foreground">{agente.email}</p>
          </div>
        </div>
        
        {/* Stats */}
        <div className="flex items-center gap-8">
          {/* Tiempo */}
          <div className="text-center">
            <div className="flex items-center gap-1 text-muted-foreground text-xs mb-1">
              <Clock className="h-3 w-3" />
              Conectado
            </div>
            <p className="text-xl font-bold">{agente.tiempo.conectado_horas.toFixed(1)}h</p>
            <p className="text-xs text-muted-foreground">
              {agente.tiempo.pausado_minutos.toFixed(0)}min pausado
            </p>
          </div>
          
          {/* Gestiones */}
          <div className="text-center">
            <div className="flex items-center gap-1 text-muted-foreground text-xs mb-1">
              <Target className="h-3 w-3" />
              Gestiones
            </div>
            <p className="text-xl font-bold">{agente.productividad.fichas_gestionadas}</p>
            <p className="text-xs text-muted-foreground">
              {agente.productividad.fichas_por_hora}/hora
            </p>
          </div>
        </div>
      </div>
      
      {/* Tipificaciones */}
      {agente.tipificaciones.length > 0 && (
        <div className="mt-4 pt-4 border-t border-border">
          <p className="text-xs font-medium text-muted-foreground mb-2">Distribución de tipificaciones</p>
          <div className="flex flex-wrap gap-2">
            {agente.tipificaciones.map(t => (
              <span
                key={t.nombre}
                className="px-2 py-1 bg-gray-100 rounded text-xs"
              >
                {t.nombre}: {t.cantidad}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
