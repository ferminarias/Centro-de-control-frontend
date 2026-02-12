import { useQuery } from "@tanstack/react-query"
import { Link } from "react-router-dom"
import { Users, Database, Zap, ArrowRight } from "lucide-react"
import { getAccounts } from "@/api/accounts"
import { CardSkeleton } from "@/components/ui/Loading"
import ErrorState from "@/components/ui/ErrorState"
import Badge from "@/components/ui/Badge"
import { formatDate } from "@/lib/utils"

export default function Dashboard() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["accounts", "all"],
    queryFn: () => getAccounts(1, 100),
  })

  if (isLoading) {
    return (
      <div>
        <h2 className="text-2xl font-bold mb-6">Dashboard</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div>
        <h2 className="text-2xl font-bold mb-6">Dashboard</h2>
        <ErrorState onRetry={() => refetch()} />
      </div>
    )
  }

  const accounts = data?.items ?? []
  const activeAccounts = accounts.filter((a) => a.activo)
  const autoCreateOn = accounts.filter((a) => a.auto_crear_campos)
  const autoCreateOff = accounts.filter((a) => !a.auto_crear_campos)
  const recentAccounts = [...accounts]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5)

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Dashboard</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={Users}
          label="Cuentas activas"
          value={activeAccounts.length}
          color="text-primary"
        />
        <StatCard
          icon={Database}
          label="Total registros"
          value="-"
          sublabel="Ver por cuenta"
          color="text-cyan-400"
        />
        <StatCard
          icon={Zap}
          label="Auto-crear ON"
          value={autoCreateOn.length}
          color="text-green-400"
        />
        <StatCard
          icon={Zap}
          label="Auto-crear OFF"
          value={autoCreateOff.length}
          color="text-red-400"
        />
      </div>

      <div className="rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h3 className="text-lg font-semibold">Ultimas cuentas creadas</h3>
          <Link
            to="/accounts"
            className="text-sm text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"
          >
            Ver todas <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        {recentAccounts.length === 0 ? (
          <p className="p-6 text-sm text-muted-foreground">No hay cuentas creadas aun.</p>
        ) : (
          <div className="divide-y divide-border">
            {recentAccounts.map((account) => (
              <Link
                key={account.id}
                to={`/accounts/${account.id}`}
                className="flex items-center justify-between p-4 px-6 hover:bg-accent/50 transition-colors"
              >
                <div>
                  <p className="font-medium">{account.nombre}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(account.created_at)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={account.activo ? "success" : "danger"}>
                    {account.activo ? "Activo" : "Inactivo"}
                  </Badge>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
  sublabel,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: number | string
  sublabel?: string
  color: string
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="flex items-center gap-3 mb-3">
        <div className={`rounded-lg bg-muted p-2 ${color}`}>
          <Icon className="h-5 w-5" />
        </div>
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
      <p className="text-3xl font-bold">{value}</p>
      {sublabel && <p className="text-xs text-muted-foreground mt-1">{sublabel}</p>}
    </div>
  )
}
