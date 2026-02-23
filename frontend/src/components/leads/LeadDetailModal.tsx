import Modal from "@/components/ui/Modal"
import CopyButton from "@/components/ui/CopyButton"
import { Spinner } from "@/components/ui/Loading"
import Badge from "@/components/ui/Badge"
import { useLeadDetail } from "@/hooks/useLeads"
import { useLeadTipificacionesExternas } from "@/hooks/useCentroControl"
import { LeadCRMDetail } from "@/components/crm"
import { formatDate } from "@/lib/utils"
import { Phone, Mail, Building, MapPin, Tag, Radio } from "lucide-react"
import type { LeadResponse } from "@/types"

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
        <div className="space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Header con info principal */}
          <LeadHeader lead={lead} />
          
          {/* CRM Detail - Timeline, Tareas, Notas, Tags */}
          <LeadCRMDetail lead={lead} />

          {/* Tipificaciones Externas */}
          <LeadTipificacionesExternas leadId={lead.id} />

          {/* Datos completos (collapsible) */}
          <LeadDataSection lead={lead} />
        </div>
      )}
    </Modal>
  )
}

function LeadHeader({ lead }: { lead: LeadResponse }) {
  const datos = lead.datos || {}
  
  // Extraer campos comunes
  const getString = (value: unknown): string | undefined => {
    if (typeof value === 'string') return value
    return undefined
  }
  
  const nombre = getString(datos.nombre) || getString(datos.name) || getString(datos.full_name) || getString(datos.Nombre) || "Sin nombre"
  const email = getString(datos.email) || getString(datos.Email) || getString(datos.correo) || getString(datos.Correo)
  const telefono = getString(datos.telefono) || getString(datos.Telefono) || getString(datos.phone) || getString(datos.Phone) || getString(datos.celular) || getString(datos.Celular)
  const empresa = getString(datos.empresa) || getString(datos.Empresa) || getString(datos.company) || getString(datos.Company)
  const ciudad = getString(datos.ciudad) || getString(datos.Ciudad) || getString(datos.city) || getString(datos.City)
  
  return (
    <div className="border-b pb-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">{nombre}</h2>
          <p className="text-sm text-muted-foreground">
            ID: <span className="font-mono text-xs">{lead.id.slice(0, 8)}...</span>
            {lead.created_at && (
              <span className="ml-2">
                • Creado: {formatDate(lead.created_at)}
              </span>
            )}
          </p>
        </div>
        
        {/* Score/Temperatura si existe */}
        {(lead.score !== undefined || lead.temperatura) && (
          <div className="flex items-center gap-2">
            {lead.score !== undefined && (
              <span className={`
                px-2 py-1 rounded-full text-xs font-medium
                ${lead.score >= 70 ? 'bg-green-100 text-green-700' : 
                  lead.score >= 40 ? 'bg-yellow-100 text-yellow-700' : 
                  'bg-red-100 text-red-700'}
              `}>
                Score: {lead.score}
              </span>
            )}
            {lead.temperatura && (
              <span className={`
                px-2 py-1 rounded-full text-xs font-medium
                ${lead.temperatura === 'caliente' ? 'bg-red-100 text-red-700' : 
                  lead.temperatura === 'templado' ? 'bg-yellow-100 text-yellow-700' : 
                  'bg-blue-100 text-blue-700'}
              `}>
                {lead.temperatura}
              </span>
            )}
          </div>
        )}
      </div>
      
      {/* Contact info */}
      <div className="flex flex-wrap gap-4 mt-3 text-sm">
        {telefono && (
          <a 
            href={`tel:${telefono}`}
            className="flex items-center gap-1.5 text-blue-600 hover:underline"
          >
            <Phone className="h-4 w-4" />
            {telefono}
          </a>
        )}
        {email && (
          <a 
            href={`mailto:${email}`}
            className="flex items-center gap-1.5 text-blue-600 hover:underline"
          >
            <Mail className="h-4 w-4" />
            {email}
          </a>
        )}
        {empresa && (
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <Building className="h-4 w-4" />
            {empresa}
          </span>
        )}
        {ciudad && (
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <MapPin className="h-4 w-4" />
            {ciudad}
          </span>
        )}
      </div>
      
      {/* Tipificación */}
      {(lead.tipificacion || lead.subtipificacion) && (
        <div className="flex items-center gap-2 mt-3">
          <Tag className="h-4 w-4 text-muted-foreground" />
          {lead.tipificacion && (
            <span
              className="px-2 py-0.5 rounded text-xs font-medium"
              style={{
                backgroundColor: lead.tipificacion.color + '20',
                color: lead.tipificacion.color
              }}
            >
              {lead.tipificacion.nombre}
            </span>
          )}
          {lead.subtipificacion && (
            <span
              className="px-2 py-0.5 rounded text-xs"
              style={{
                backgroundColor: lead.subtipificacion.color + '20',
                color: lead.subtipificacion.color
              }}
            >
              {lead.subtipificacion.nombre}
            </span>
          )}
        </div>
      )}

      {/* Última tipificación externa */}
      {getString(datos.ultima_tipificacion) && (
        <div className="flex items-center gap-2 mt-2">
          <Radio className="h-4 w-4 text-purple-500" />
          <Badge variant="info">
            Tip. externa: {getString(datos.ultima_tipificacion)}
          </Badge>
        </div>
      )}
    </div>
  )
}

function LeadDataSection({ lead }: { lead: LeadResponse }) {
  const datos = lead.datos || {}
  
  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="bg-gray-50 px-4 py-2 border-b flex items-center justify-between">
        <label className="text-sm font-medium text-muted-foreground">Datos completos</label>
        <CopyButton text={JSON.stringify(lead.datos, null, 2)} />
      </div>
      <div className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          {Object.entries(datos).map(([key, value]) => (
            <div key={key} className="flex items-start gap-2">
              <span className="text-xs font-medium text-primary min-w-[100px] shrink-0">{key}</span>
              <span className="text-foreground break-all">{String(value)}</span>
            </div>
          ))}
        </div>
      </div>
      
      {lead.record_id && (
        <div className="px-4 py-2 bg-gray-50 border-t text-xs">
          <span className="text-muted-foreground">Record ID: </span>
          <code className="font-mono">{lead.record_id}</code>
        </div>
      )}
    </div>
  )
}

function LeadTipificacionesExternas({ leadId }: { leadId: string }) {
  const { data: tipificaciones, isLoading } = useLeadTipificacionesExternas(leadId)

  if (isLoading) return null
  if (!tipificaciones || tipificaciones.length === 0) return null

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="bg-gray-50 px-4 py-2 border-b flex items-center gap-2">
        <Radio className="h-4 w-4 text-purple-500" />
        <label className="text-sm font-medium text-muted-foreground">
          Tipificaciones Externas ({tipificaciones.length})
        </label>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Fecha</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">ID Neotel</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">ID Subresol.</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {tipificaciones.map((tip) => (
              <tr key={tip.id} className="hover:bg-gray-50">
                <td className="px-4 py-2 text-xs text-muted-foreground">
                  {new Date(tip.created_at).toLocaleString("es-ES")}
                </td>
                <td className="px-4 py-2 font-mono text-xs">{tip.id_neotel}</td>
                <td className="px-4 py-2 font-mono text-xs">{tip.id_subresolucion}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
