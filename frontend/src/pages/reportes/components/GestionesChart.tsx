import { useMemo } from "react"

interface GestionesChartProps {
  data: { hora: string; cantidad: number }[]
}

export default function GestionesChart({ data }: GestionesChartProps) {
  const chartData = useMemo(() => {
    // Fill missing hours with 0
    const filled = []
    for (let i = 0; i < 24; i++) {
      const hourStr = `${i.toString().padStart(2, "0")}:00`
      const found = data.find(d => {
        if (!d.hora) return false
        const h = new Date(d.hora).getHours()
        return h === i
      })
      filled.push({
        hour: hourStr,
        value: found?.cantidad || 0,
      })
    }
    return filled
  }, [data])

  const maxValue = useMemo(() => {
    return Math.max(...chartData.map(d => d.value), 1)
  }, [chartData])

  if (chartData.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-muted-foreground">
        No hay datos disponibles
      </div>
    )
  }

  return (
    <div className="h-64">
      {/* Simple bar chart */}
      <div className="h-full flex items-end gap-1">
        {chartData.map((item, idx) => {
          const height = (item.value / maxValue) * 100
          const isEven = idx % 2 === 0
          
          return (
            <div
              key={item.hour}
              className="flex-1 flex flex-col items-center gap-1 group"
            >
              <div className="relative w-full">
                <div
                  className={cn(
                    "w-full rounded-t transition-all",
                    height > 0 ? "bg-primary/80 group-hover:bg-primary" : "bg-gray-100"
                  )}
                  style={{ height: `${Math.max(height, 2)}%` }}
                />
                {/* Tooltip */}
                {height > 0 && (
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                    {item.value} gestiones
                  </div>
                )}
              </div>
              {isEven && (
                <span className="text-[10px] text-muted-foreground">
                  {item.hour}
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Simple cn helper since we're in a component file
function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ")
}
