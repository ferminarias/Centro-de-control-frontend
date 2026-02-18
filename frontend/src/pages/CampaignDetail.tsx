import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { ArrowLeft, Play, Pause, Square, Plus, Phone, ChevronDown, UserPlus, Users } from "lucide-react"
import { useAccount } from "@/context/AccountContext"
import * as api from "@/api/voip"
import {
  useCampaignControl, useCampaignStats, useCampaignLeads,
  useAgents, useAssignAgent, useAddLeadsBulk,
  useManualCall, useDispositionLead, useDispositions,
} from "@/hooks/useVoip"
import { useLeadBasesList } from "@/hooks/useLeadBases"
import { TableSkeleton, Spinner } from "@/components/ui/Loading"
import Badge from "@/components/ui/Badge"
import Modal from "@/components/ui/Modal"
import Pagination from "@/components/ui/Pagination"
import type { CampaignResponse, CampaignStatus, CampaignLeadStatus } from "@/types"

const statusVariant = (s: CampaignStatus) => {
  switch (s) { case "running": return "success" as const; case "paused": return "warning" as const; case "completed": return "info" as const; default: return "default" as const }
}
const statusLabel = (s: CampaignStatus) => {
  switch (s) { case "running": return "En curso"; case "paused": return "Pausada"; case "completed": return "Completada"; case "idle": return "Inactiva"; default: return s }
}
const leadStatusVariant = (s: CampaignLeadStatus) => {
  switch (s) { case "completed": return "success" as const; case "contacted": return "info" as const; case "dialing": return "warning" as const; case "failed": case "dnc": return "danger" as const; default: return "default" as const }
}

export default function CampaignDetail() {
  const { campaignId } = useParams<{ campaignId: string }>()
  const navigate = useNavigate()
  const { selectedAccount } = useAccount()
  const accountId = selectedAccount?.id ?? ""

  const { data: campaign, isLoading } = useQuery({
    queryKey: ["campaign", campaignId],
    queryFn: () => api.getCampaign(campaignId!),
    enabled: !!campaignId,
  })

  const { data: stats } = useCampaignStats(campaignId)
  const controlMut = useCampaignControl(accountId)

  // Leads
  const [leadsPage, setLeadsPage] = useState(1)
  const [leadsPageSize, setLeadsPageSize] = useState(20)
  const { data: leadsData, isLoading: leadsLoading } = useCampaignLeads(campaignId, leadsPage, leadsPageSize)

  // Agents
  const { data: allAgentsData } = useAgents(accountId || undefined)
  const assignMut = useAssignAgent(accountId)
  const [assignModalOpen, setAssignModalOpen] = useState(false)
  const [selectedAgentId, setSelectedAgentId] = useState("")

  // Load leads bulk
  const [bulkModalOpen, setBulkModalOpen] = useState(false)
  const { data: basesData } = useLeadBasesList(accountId)
  const addLeadsMut = useAddLeadsBulk(accountId)
  const [bulkForm, setBulkForm] = useState({ source_type: "lead_base", source_id: "", telefono_field: "telefono" })

  // Manual call
  const [callModalOpen, setCallModalOpen] = useState(false)
  const [callForm, setCallForm] = useState({ telefono: "", agent_id: "" })
  const manualCallMut = useManualCall()

  // Disposition
  const { data: dispositionsData } = useDispositions(accountId || undefined)
  const dispositionMut = useDispositionLead(campaignId)
  const [dispModalOpen, setDispModalOpen] = useState(false)
  const [dispLeadId, setDispLeadId] = useState("")
  const [dispId, setDispId] = useState("")

  const allAgents = allAgentsData?.items ?? []
  const leads = leadsData?.items ?? []
  const bases = basesData?.items ?? []
  const dispositions = dispositionsData?.items ?? []

  const handleControl = (action: "start" | "pause" | "stop") => {
    if (!campaignId) return
    controlMut.mutate({ id: campaignId, action })
  }

  const handleAssign = () => {
    if (!campaignId || !selectedAgentId) return
    assignMut.mutate({ campaignId, agentId: selectedAgentId }, {
      onSuccess: () => { setAssignModalOpen(false); setSelectedAgentId("") },
    })
  }

  const handleBulkAdd = () => {
    if (!campaignId || !bulkForm.source_id) return
    addLeadsMut.mutate({ campaignId, payload: bulkForm }, {
      onSuccess: () => { setBulkModalOpen(false); setBulkForm({ source_type: "lead_base", source_id: "", telefono_field: "telefono" }) },
    })
  }

  const handleManualCall = () => {
    if (!campaignId || !callForm.telefono || !callForm.agent_id) return
    manualCallMut.mutate({ campaignId, payload: callForm }, {
      onSuccess: () => { setCallModalOpen(false); setCallForm({ telefono: "", agent_id: "" }) },
    })
  }

  const handleDisposition = () => {
    if (!dispLeadId || !dispId) return
    dispositionMut.mutate({ campaignLeadId: dispLeadId, dispositionId: dispId }, {
      onSuccess: () => { setDispModalOpen(false); setDispLeadId(""); setDispId("") },
    })
  }

  if (isLoading) return <div className="p-8"><Spinner /></div>
  if (!campaign) return null

  const c = campaign as CampaignResponse

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate("/callcenter/campaigns")} className="rounded-lg border border-border p-2 hover:bg-gray-50 transition-colors">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-foreground">{c.nombre}</h2>
          {c.descripcion && <p className="text-sm text-muted-foreground mt-0.5">{c.descripcion}</p>}
        </div>
        <Badge variant={statusVariant(c.estado)}>{statusLabel(c.estado)}</Badge>
        <div className="flex gap-1">
          {c.estado !== "running" && c.estado !== "completed" && (
            <button onClick={() => handleControl("start")} className="rounded-lg bg-green-600 p-2 text-white hover:bg-green-700 transition-colors"><Play className="h-4 w-4" /></button>
          )}
          {c.estado === "running" && (
            <button onClick={() => handleControl("pause")} className="rounded-lg bg-yellow-500 p-2 text-white hover:bg-yellow-600 transition-colors"><Pause className="h-4 w-4" /></button>
          )}
          {(c.estado === "running" || c.estado === "paused") && (
            <button onClick={() => handleControl("stop")} className="rounded-lg bg-red-600 p-2 text-white hover:bg-red-700 transition-colors"><Square className="h-4 w-4" /></button>
          )}
        </div>
      </div>

      {/* Stats cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard label="Total leads" value={stats.total_leads} />
          <StatCard label="Contactados" value={stats.contacted} variant="success" />
          <StatCard label="Pendientes" value={stats.pending} variant="warning" />
          <StatCard label="Completados" value={stats.completed} variant="info" />
          <StatCard label="Fallidos" value={stats.failed} variant="danger" />
          <StatCard label="ASR" value={`${(stats.asr * 100).toFixed(1)}%`} />
          <StatCard label="AHT" value={`${stats.aht.toFixed(0)}s`} />
          <StatCard label="Tasa contacto" value={`${(stats.contact_rate * 100).toFixed(1)}%`} />
        </div>
      )}

      {/* Action bar */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => setAssignModalOpen(true)} className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium hover:bg-gray-50 transition-colors">
          <UserPlus className="h-4 w-4" /> Asignar agente
        </button>
        <button onClick={() => setBulkModalOpen(true)} className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium hover:bg-gray-50 transition-colors">
          <Plus className="h-4 w-4" /> Cargar leads
        </button>
        <button onClick={() => { setCallForm({ telefono: "", agent_id: allAgents[0]?.id ?? "" }); setCallModalOpen(true) }} className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium hover:bg-gray-50 transition-colors">
          <Phone className="h-4 w-4" /> Llamada manual
        </button>
      </div>

      {/* Leads table */}
      <div className="rounded-xl border border-border bg-white shadow-sm">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Users className="h-4 w-4" /> Leads de la campana ({leadsData?.total ?? 0})
          </h3>
        </div>
        {leadsLoading ? (
          <div className="p-6"><TableSkeleton rows={5} cols={7} /></div>
        ) : leads.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">No hay leads cargados en esta campana.</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Telefono</th>
                    <th className="px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Estado</th>
                    <th className="px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Intentos</th>
                    <th className="px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Tipificacion</th>
                    <th className="px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Ultimo intento</th>
                    <th className="px-6 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {leads.map((l) => (
                    <tr key={l.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-mono text-foreground">{l.id_lead}</td>
                      <td className="px-6 py-4 text-sm font-mono text-muted-foreground">{l.telefono}</td>
                      <td className="px-6 py-4"><Badge variant={leadStatusVariant(l.estado)}>{l.estado}</Badge></td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{l.intentos}</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{l.disposition_nombre ?? "-"}</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{l.ultimo_intento ? new Date(l.ultimo_intento).toLocaleString() : "-"}</td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => { setDispLeadId(l.id); setDispId(""); setDispModalOpen(true) }}
                          className="text-xs text-primary hover:underline"
                        >
                          Tipificar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-6 pb-4">
              <Pagination page={leadsPage} pageSize={leadsPageSize} total={leadsData?.total ?? 0} onPageChange={setLeadsPage} onPageSizeChange={(s) => { setLeadsPageSize(s); setLeadsPage(1) }} />
            </div>
          </>
        )}
      </div>

      {/* Assign agent modal */}
      <Modal open={assignModalOpen} onOpenChange={setAssignModalOpen} title="Asignar agente">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Agente</label>
            <div className="relative">
              <select value={selectedAgentId} onChange={(e) => setSelectedAgentId(e.target.value)} className="w-full appearance-none rounded-lg border border-border bg-white px-4 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                <option value="">Seleccionar agente...</option>
                {allAgents.filter((a) => a.activo).map((a) => <option key={a.id} value={a.id}>{a.nombre} ({a.extension})</option>)}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <button onClick={() => setAssignModalOpen(false)} className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-gray-50 transition-colors">Cancelar</button>
            <button onClick={handleAssign} disabled={!selectedAgentId || assignMut.isPending} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-colors disabled:opacity-50">
              {assignMut.isPending ? "Asignando..." : "Asignar"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Bulk add leads modal */}
      <Modal open={bulkModalOpen} onOpenChange={setBulkModalOpen} title="Cargar leads desde base">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Base de leads</label>
            <div className="relative">
              <select value={bulkForm.source_id} onChange={(e) => setBulkForm({ ...bulkForm, source_id: e.target.value })} className="w-full appearance-none rounded-lg border border-border bg-white px-4 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                <option value="">Seleccionar base...</option>
                {bases.map((b) => <option key={b.id} value={b.id}>{b.nombre} ({b.total_leads ?? 0} leads)</option>)}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Campo de telefono</label>
            <input value={bulkForm.telefono_field} onChange={(e) => setBulkForm({ ...bulkForm, telefono_field: e.target.value })} className="w-full rounded-lg border border-border bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" placeholder="telefono" />
          </div>
          <div className="flex justify-end gap-3">
            <button onClick={() => setBulkModalOpen(false)} className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-gray-50 transition-colors">Cancelar</button>
            <button onClick={handleBulkAdd} disabled={!bulkForm.source_id || addLeadsMut.isPending} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-colors disabled:opacity-50">
              {addLeadsMut.isPending ? "Cargando..." : "Cargar leads"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Manual call modal */}
      <Modal open={callModalOpen} onOpenChange={setCallModalOpen} title="Llamada manual">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Telefono</label>
            <input value={callForm.telefono} onChange={(e) => setCallForm({ ...callForm, telefono: e.target.value })} className="w-full rounded-lg border border-border bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" placeholder="+5491155551234" />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Agente</label>
            <div className="relative">
              <select value={callForm.agent_id} onChange={(e) => setCallForm({ ...callForm, agent_id: e.target.value })} className="w-full appearance-none rounded-lg border border-border bg-white px-4 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                {allAgents.filter((a) => a.activo).map((a) => <option key={a.id} value={a.id}>{a.nombre} ({a.extension})</option>)}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <button onClick={() => setCallModalOpen(false)} className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-gray-50 transition-colors">Cancelar</button>
            <button onClick={handleManualCall} disabled={!callForm.telefono || !callForm.agent_id || manualCallMut.isPending} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-colors disabled:opacity-50">
              {manualCallMut.isPending ? "Llamando..." : "Llamar"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Disposition modal */}
      <Modal open={dispModalOpen} onOpenChange={setDispModalOpen} title="Tipificar lead">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Tipificacion</label>
            <div className="relative">
              <select value={dispId} onChange={(e) => setDispId(e.target.value)} className="w-full appearance-none rounded-lg border border-border bg-white px-4 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                <option value="">Seleccionar...</option>
                {dispositions.map((d) => <option key={d.id} value={d.id}>{d.nombre} ({d.categoria})</option>)}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <button onClick={() => setDispModalOpen(false)} className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-gray-50 transition-colors">Cancelar</button>
            <button onClick={handleDisposition} disabled={!dispId || dispositionMut.isPending} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-colors disabled:opacity-50">
              {dispositionMut.isPending ? "Guardando..." : "Tipificar"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

function StatCard({ label, value, variant }: { label: string; value: string | number; variant?: "success" | "danger" | "warning" | "info" }) {
  const colors = {
    success: "text-green-600",
    danger: "text-red-600",
    warning: "text-yellow-600",
    info: "text-blue-600",
  }
  return (
    <div className="rounded-xl border border-border bg-white p-4 shadow-sm">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className={`text-2xl font-bold ${variant ? colors[variant] : "text-foreground"}`}>{value}</p>
    </div>
  )
}
