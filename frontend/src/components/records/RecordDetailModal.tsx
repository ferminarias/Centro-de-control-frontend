import { useQuery } from "@tanstack/react-query"
import Modal from "@/components/ui/Modal"
import CopyButton from "@/components/ui/CopyButton"
import Badge from "@/components/ui/Badge"
import { Spinner } from "@/components/ui/Loading"
import { getRecord } from "@/api/records"

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  recordId: string | null
}

export default function RecordDetailModal({ open, onOpenChange, recordId }: Props) {
  const { data: record, isLoading } = useQuery({
    queryKey: ["record", recordId],
    queryFn: () => getRecord(recordId!),
    enabled: !!recordId && open,
  })

  return (
    <Modal open={open} onOpenChange={onOpenChange} title="Detalle del registro">
      {isLoading || !record ? (
        <Spinner />
      ) : (
        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-muted-foreground">Datos</label>
              <CopyButton text={JSON.stringify(record.datos, null, 2)} />
            </div>
            <pre className="rounded-lg bg-muted p-4 text-xs font-mono overflow-x-auto whitespace-pre-wrap">
              {JSON.stringify(record.datos, null, 2)}
            </pre>
          </div>

          {record.metadata_ && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">Metadata</label>
              <div className="mt-1 space-y-2">
                {record.metadata_.source_ip && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Source IP:</span>
                    <code className="text-xs font-mono">{record.metadata_.source_ip}</code>
                  </div>
                )}
                {record.metadata_.unknown_fields && record.metadata_.unknown_fields.length > 0 && (
                  <div>
                    <span className="text-xs text-muted-foreground">Campos desconocidos:</span>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {record.metadata_.unknown_fields.map((f) => (
                        <Badge key={f} variant="warning">{f}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </Modal>
  )
}
