import { AlertTriangle } from "lucide-react"

interface ErrorStateProps {
  message?: string
  onRetry?: () => void
}

export default function ErrorState({ message = "Ocurrio un error al cargar los datos", onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="rounded-full bg-destructive/10 p-4 mb-4">
        <AlertTriangle className="h-8 w-8 text-destructive" />
      </div>
      <h3 className="text-lg font-medium text-foreground mb-1">Error</h3>
      <p className="text-sm text-muted-foreground mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-colors"
        >
          Reintentar
        </button>
      )}
    </div>
  )
}
