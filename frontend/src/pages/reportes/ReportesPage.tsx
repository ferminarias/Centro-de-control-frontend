/**
 * Módulo de Reportes y Monitores - Contact Center
 * Dashboard principal con navegación a sub-módulos
 */
import {
  Users, Database,
  Monitor, FileSpreadsheet, ChevronRight,
  Target, AlertCircle
} from "lucide-react"
import { useAccount } from "@/context/AccountContext"
import { useDashboardStats } from "@/hooks/useReportes"
import { cn } from "@/lib/utils"
import { Link } from "react-router-dom"

// Sub-components
import DashboardStats from "./components/DashboardStats"
import GestionesChart from "./components/GestionesChart"
import TopCampanas from "./components/TopCampanas"

const MENU_ITEMS = [
  {
    id: "bases",
    title: "Reporte de Bases",
    description: "Consulta gestión de bases y exporta a Excel",
    icon: Database,
    path: "/reportes/bases",
    color: "blue",
  },
  {
    id: "agentes",
    title: "Métricas de Agentes",
    description: "Productividad, tiempo conectado y eficiencia",
    icon: Users,
    path: "/reportes/agentes",
    color: "green",
  },
  {
    id: "campanas",
    title: "Detalle de Campañas",
    description: "Métricas específicas por campaña",
    icon: Target,
    path: "/reportes/campanas",
    color: "purple",
  },
  {
    id: "monitor",
    title: "Monitor en Vivo",
    description: "Supervisión en tiempo real de la operación",
    icon: Monitor,
    path: "/reportes/monitor",
    color: "red",
  },
]

export default function ReportesPage() {
  const { selectedAccount } = useAccount()
  const accountId = selectedAccount?.id ?? ""
  
  const { data: stats, isLoading } = useDashboardStats(accountId)
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Reportes y Monitores</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Visualiza métricas, productividad y estado de tus campañas
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {new Date().toLocaleDateString("es-ES", { 
              weekday: "long", 
              year: "numeric", 
              month: "long", 
              day: "numeric" 
            })}
          </span>
        </div>
      </div>
      
      {/* Stats Cards */}
      {isLoading ? (
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-gray-100 animate-pulse rounded-xl" />
          ))}
        </div>
      ) : (
        <DashboardStats stats={stats?.resumen} />
      )}
      
      {/* Charts Row */}
      <div className="grid grid-cols-3 gap-6">
        {/* Gestiones por hora */}
        <div className="col-span-2 bg-white rounded-xl border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">Gestiones por Hora</h3>
            <span className="text-xs text-muted-foreground">Últimas 24 horas</span>
          </div>
          {isLoading ? (
            <div className="h-64 bg-gray-100 animate-pulse rounded" />
          ) : (
            <GestionesChart data={stats?.gestiones_por_hora || []} />
          )}
        </div>
        
        {/* Top campañas */}
        <div className="bg-white rounded-xl border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">Top Campañas</h3>
            <span className="text-xs text-muted-foreground">Hoy</span>
          </div>
          {isLoading ? (
            <div className="h-64 bg-gray-100 animate-pulse rounded" />
          ) : (
            <TopCampanas data={stats?.top_campanas || []} />
          )}
        </div>
      </div>
      
      {/* Navigation Menu */}
      <div className="grid grid-cols-2 gap-4">
        {MENU_ITEMS.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.id}
              to={item.path}
              className={cn(
                "flex items-center gap-4 p-5 rounded-xl border border-border bg-white",
                "hover:border-primary/50 hover:shadow-sm transition-all group"
              )}
            >
              <div className={cn(
                "p-3 rounded-lg",
                item.color === "blue" && "bg-blue-50 text-blue-600",
                item.color === "green" && "bg-green-50 text-green-600",
                item.color === "purple" && "bg-purple-50 text-purple-600",
                item.color === "red" && "bg-red-50 text-red-600",
              )}>
                <Icon className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">
                  {item.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {item.description}
                </p>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-primary transition-colors" />
            </Link>
          )
        })}
      </div>
      
      {/* Quick Links */}
      <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl p-6 border border-primary/20">
        <div className="flex items-center gap-3 mb-3">
          <AlertCircle className="h-5 w-5 text-primary" />
          <h3 className="font-medium text-foreground">¿Necesitas datos específicos?</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Exporta reportes detallados a Excel con todos los campos del CRM, tipificaciones y gestiones.
        </p>
        <div className="flex items-center gap-3">
          <Link
            to="/reportes/bases"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-lg text-sm font-medium text-primary hover:bg-primary hover:text-white transition-colors"
          >
            <FileSpreadsheet className="h-4 w-4" />
            Exportar Bases
          </Link>
          <Link
            to="/reportes/agentes"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-lg text-sm font-medium text-primary hover:bg-primary hover:text-white transition-colors"
          >
            <Users className="h-4 w-4" />
            Ver Agentes
          </Link>
        </div>
      </div>
    </div>
  )
}
