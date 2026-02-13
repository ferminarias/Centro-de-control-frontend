import Modal from "@/components/ui/Modal"
import CopyButton from "@/components/ui/CopyButton"
import { Spinner } from "@/components/ui/Loading"
import { useLeadDetail } from "@/hooks/useLeads"
import { formatDate } from "@/lib/utils"

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  leadId: string | null
}

export default function LeadDetailModal({ open, onOpenChange, leadId }: Props) {
  const { data: lead, isLoading } = useLeadDetail(open ? leadId : null)

  return (
    <Modal open={open} onOpenChange={onOpenChange} title="Detalle del lead" wide>
      {isLoading || !lead ? (
        <Spinner />
      ) : (
        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">ID</span>
              <p className="font-mono text-xs mt-0.5">{lead.id}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Fecha</span>
              <p className="mt-0.5">{formatDate(lead.created_at)}</p>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-muted-foreground">Datos del lead</label>
              <CopyButton text={JSON.stringify(lead.datos, null, 2)} />
            </div>
            <div className="rounded-lg border border-border bg-gray-50 p-4 space-y-2">
              {Object.entries(lead.datos).map(([key, value]) => (
                <div key={key} className="flex items-start gap-3">
                  <span className="text-xs font-mono font-medium text-primary min-w-[120px]">{key}</span>
                  <span className="text-sm text-foreground break-all">{String(value)}</span>
                </div>
              ))}
            </div>
          </div>

          {lead.record_id && (
            <div className="text-sm">
              <span className="text-muted-foreground">Record ID: </span>
              <code className="font-mono text-xs">{lead.record_id}</code>
            </div>
          )}
        </div>
      )}
    </Modal>
  )
}
