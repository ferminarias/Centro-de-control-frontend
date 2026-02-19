import { Trophy } from "lucide-react"

interface TopCampanasProps {
  data: { nombre: string; gestiones: number }[]
}

export default function TopCampanas({ data }: TopCampanasProps) {
  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-muted-foreground">
        No hay campañas activas hoy
      </div>
    )
  }

  const maxGestiones = Math.max(...data.map(d => d.gestiones), 1)

  return (
    <div className="space-y-3">
      {data.map((campana, idx) => {
        const percentage = (campana.gestiones / maxGestiones) * 100
        
        return (
          <div key={campana.nombre} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                {idx === 0 && <Trophy className="h-4 w-4 text-yellow-500" />}
                <span className="font-medium text-foreground truncate max-w-[180px]">
                  {campana.nombre}
                </span>
              </div>
              <span className="text-muted-foreground">
                {campana.gestiones}
              </span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all"
                style={{ 
                  width: `${percentage}%`,
                  opacity: 1 - (idx * 0.15)
                }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
