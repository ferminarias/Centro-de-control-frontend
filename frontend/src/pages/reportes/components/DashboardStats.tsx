import { Activity, Users, Database, CheckCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface DashboardStatsProps {
  stats: {
    campanas_activas: number
    agentes_conectados: number
    leads_gestionados_hoy: number
    leads_pendientes: number
  } | undefined
}

const STAT_ITEMS = [
  {
    key: "campanas_activas",
    label: "Campañas Activas",
    icon: Activity,
    color: "blue",
  },
  {
    key: "agentes_conectados",
    label: "Agentes Conectados",
    icon: Users,
    color: "green",
  },
  {
    key: "leads_gestionados_hoy",
    label: "Gestionados Hoy",
    icon: CheckCircle,
    color: "purple",
  },
  {
    key: "leads_pendientes",
    label: "Leads Pendientes",
    icon: Database,
    color: "orange",
  },
]

export default function DashboardStats({ stats }: DashboardStatsProps) {
  if (!stats) return null

  return (
    <div className="grid grid-cols-4 gap-4">
      {STAT_ITEMS.map((item) => {
        const Icon = item.icon
        const value = stats[item.key as keyof typeof stats] || 0
        
        return (
          <div
            key={item.key}
            className={cn(
              "bg-white rounded-xl border border-border p-5",
              "hover:shadow-sm transition-shadow"
            )}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{item.label}</p>
                <p className="text-3xl font-bold text-foreground mt-1">
                  {value.toLocaleString()}
                </p>
              </div>
              <div className={cn(
                "p-3 rounded-lg",
                item.color === "blue" && "bg-blue-50 text-blue-600",
                item.color === "green" && "bg-green-50 text-green-600",
                item.color === "purple" && "bg-purple-50 text-purple-600",
                item.color === "orange" && "bg-orange-50 text-orange-600",
              )}>
                <Icon className="h-6 w-6" />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
