import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Eye, Database } from "lucide-react"
import { getRecords } from "@/api/records"
import { TableSkeleton } from "@/components/ui/Loading"
import ErrorState from "@/components/ui/ErrorState"
import EmptyState from "@/components/ui/EmptyState"
import Pagination from "@/components/ui/Pagination"
import Badge from "@/components/ui/Badge"
import RecordDetailModal from "./RecordDetailModal"
import { formatDate, truncate } from "@/lib/utils"

interface Props {
  accountId: string
}

export default function RecordsTab({ accountId }: Props) {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [selectedRecord, setSelectedRecord] = useState<string | null>(null)

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["records", accountId, page, pageSize],
    queryFn: () => getRecords(accountId, page, pageSize),
  })

  if (isLoading) return <div className="p-6"><TableSkeleton rows={5} cols={4} /></div>
  if (isError) return <ErrorState onRetry={() => refetch()} />

  const records = data?.items ?? []

  if (records.length === 0) {
    return (
      <EmptyState
        icon={Database}
        title="No hay registros"
        description="Los registros aparecen cuando se envian datos al webhook."
      />
    )
  }

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Fecha</th>
              <th className="px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Preview datos</th>
              <th className="px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Desconocidos</th>
              <th className="px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {records.map((record) => {
              const entries = Object.entries(record.datos).slice(0, 3)
              const unknowns = record.metadata_?.unknown_fields ?? []
              return (
                <tr key={record.id} className="hover:bg-accent/30 transition-colors">
                  <td className="px-6 py-4">
                    <code className="text-xs text-muted-foreground font-mono">
                      {truncate(record.id, 12)}
                    </code>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {formatDate(record.created_at)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1.5">
                      {entries.map(([key, val]) => (
                        <span key={key} className="inline-flex rounded bg-muted px-2 py-0.5 text-xs font-mono">
                          <span className="text-primary">{key}</span>
                          <span className="text-muted-foreground mx-1">:</span>
                          <span className="text-foreground">{truncate(String(val), 20)}</span>
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {unknowns.length > 0 && (
                      <Badge variant="warning">{unknowns.length} desconocido{unknowns.length > 1 ? "s" : ""}</Badge>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => setSelectedRecord(record.id)}
                      className="inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium text-primary hover:bg-primary/10 transition-colors"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      Ver
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="px-6 pb-4">
        <Pagination
          page={page}
          pageSize={pageSize}
          total={data?.total ?? 0}
          onPageChange={setPage}
          onPageSizeChange={(size) => { setPageSize(size); setPage(1) }}
        />
      </div>

      <RecordDetailModal
        open={!!selectedRecord}
        onOpenChange={(open) => !open && setSelectedRecord(null)}
        recordId={selectedRecord}
      />
    </div>
  )
}
