/**
 * Monitor en Tiempo Real - Supervisión de operación
 */
import { useAccount } from "@/context/AccountContext"
import { useMonitor } from "@/hooks/useReportes"
import { 
  Monitor, ChevronLeft, Activity, Users, 
  Phone, Clock, Pause, CheckCircle
} from "lucide-react"
import { Link } from "react-router-dom"
import { TableSkeleton } from "@/components/ui/Loading"
import EmptyState from "@/components/ui/EmptyState"
import Badge from "@/components/ui/Badge"
import { cn } from "@/lib/utils"

const ESTADO_AGENTE: Record<string, { label: string; color: string; icon: any }> = {
  offline: { label: "Desconectado", color: "gray", icon: Activity },
  disponible: { label: "Disponible", color: "green", icon: CheckCircle },
  pausado: { label: "Pausado", color: "yellow", icon: Pause },
  gestionando: { label: "Gestionando", color: "blue", icon: Users },
  en_llamada: { label: "En Llamada", color: "purple", icon: Phone },
}

export default function MonitorPage() {
  const { selectedAccount } = useAccount()
  const accountId = selectedAccount?.id ?? ""
  
  const { data: monitor, isLoading } = useMonitor(accountId)
  
  const campanas = monitor?.campanas || []
  const lastUpdate = monitor?.timestamp 
    ? new Date(monitor.timestamp).toLocaleTimeString("es-ES")
    : "-"
  
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
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-foreground">Monitor en Vivo</h1>
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Actualizado: {lastUpdate} · Auto-refresh cada 10 seg
            </p>
          </div>
        </div>
        
        {/* Resumen */}
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-2xl font-bold">{monitor?.campanas_activas || 0}</p>
            <p className="text-xs text-muted-foreground">Campañas activas</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">
              {campanas.reduce((acc, c) => acc + c.agentes_conectados, 0)}
            </p>
            <p className="text-xs text-muted-foreground">Agentes conectados</p>
          </div>
        </div>
      </div>
      
      {/* Campañas */}
      {isLoading ? (
        <div className="bg-white rounded-xl border border-border p-6">
          <TableSkeleton rows={3} cols={4} />
        </div>
      ) : campanas.length === 0 ? (
        <EmptyState
          icon={Monitor}
          title="No hay campañas activas"
          description="No hay campañas en estado activo para monitorear"
        />
      ) : (
        <div className="space-y-6">
          {campanas.map((campana) => (
            <div 
              key={campana.campania_id}
              className="bg-white rounded-xl border border-border overflow-hidden"
            >
              {/* Campaña Header */}
              <div className="px-6 py-4 border-b border-border bg-gray-50/50">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-foreground">{campana.nombre}</h3>
                    <p className="text-sm text-muted-foreground">
                      {campana.tipo_discador} · {campana.agentes_conectados} agentes · {campana.cola_pendientes} en cola
                    </p>
                  </div>
                  <Badge variant={campana.cola_pendientes > 10 ? "warning" : "default"}>
                    {campana.cola_pendientes} pendientes
                  </Badge>
                </div>
              </div>
              
              {/* Agentes */}
              <div className="divide-y divide-border">
                {campana.agentes.length === 0 ? (
                  <div className="px-6 py-4 text-sm text-muted-foreground">
                    No hay agentes conectados
                  </div>
                ) : (
                  campana.agentes.map((agente) => {
                    const estado = ESTADO_AGENTE[agente.estado] || ESTADO_AGENTE.offline
                    const EstadoIcon = estado.icon
                    
                    return (
                      <div 
                        key={agente.agente_id}
                        className="px-6 py-3 flex items-center justify-between hover:bg-gray-50"
                      >
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-2 h-2 rounded-full",
                            estado.color === "green" && "bg-green-500",
                            estado.color === "yellow" && "bg-yellow-500",
                            estado.color === "blue" && "bg-blue-500",
                            estado.color === "purple" && "bg-purple-500",
                            estado.color === "gray" && "bg-gray-400",
                          )} />
                          <span className="font-medium text-sm">{agente.nombre}</span>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm">
                          <Badge variant={estado.color as any} className="text-xs">
                            <EstadoIcon className="h-3 w-3 mr-1" />
                            {estado.label}
                          </Badge>
                          
                          <span className="text-muted-foreground text-xs">
                            <Clock className="h-3 w-3 inline mr-1" />
                            {agente.tiempo_en_estado}min
                          </span>
                          
                          {agente.ficha_actual && (
                            <span className="text-xs text-blue-600">
                              Ficha: {agente.ficha_actual.slice(0, 8)}...
                            </span>
                          )}
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
