import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface PaginationProps {
  page: number
  pageSize: number
  total: number
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
}

export default function Pagination({ page, pageSize, total, onPageChange, onPageSizeChange }: PaginationProps) {
  const totalPages = Math.ceil(total / pageSize)

  return (
    <div className="flex items-center justify-between pt-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>Mostrar</span>
        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          className="rounded-md border border-border bg-card px-2 py-1 text-sm text-foreground"
        >
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
        </select>
        <span>de {total} resultados</span>
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className={cn(
            "rounded-md p-2 transition-colors",
            page <= 1
              ? "text-muted-foreground/50 cursor-not-allowed"
              : "text-foreground hover:bg-accent"
          )}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="px-3 text-sm">
          {page} / {totalPages || 1}
        </span>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className={cn(
            "rounded-md p-2 transition-colors",
            page >= totalPages
              ? "text-muted-foreground/50 cursor-not-allowed"
              : "text-foreground hover:bg-accent"
          )}
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
