import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import * as api from "@/api/voip"
import type { SipProviderCreate, SipProviderUpdate, SipTrunkCreate, SipTrunkUpdate, PbxNodeCreate, PbxNodeUpdate, AgentCreate, AgentUpdate, DispositionCreate, DispositionUpdate, CampaignCreate, CampaignUpdate, DncCreate } from "@/types"
import { toast } from "sonner"

// ── SIP Providers ──
export const useSipProviders = (accountId: string | undefined) =>
  useQuery({ queryKey: ["sipProviders", accountId], queryFn: () => api.getSipProviders(accountId!), enabled: !!accountId })

export const useCreateSipProvider = (accountId: string) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (p: SipProviderCreate) => api.createSipProvider(accountId, p),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["sipProviders", accountId] }); toast.success("Proveedor creado") },
    onError: () => toast.error("Error al crear proveedor"),
  })
}
export const useUpdateSipProvider = (accountId: string) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: SipProviderUpdate }) => api.updateSipProvider(id, payload),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["sipProviders", accountId] }); toast.success("Proveedor actualizado") },
    onError: () => toast.error("Error al actualizar"),
  })
}
export const useDeleteSipProvider = (accountId: string) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.deleteSipProvider(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["sipProviders", accountId] }); toast.success("Proveedor eliminado") },
    onError: () => toast.error("Error al eliminar"),
  })
}

// ── SIP Trunks ──
export const useSipTrunks = (accountId: string | undefined) =>
  useQuery({ queryKey: ["sipTrunks", accountId], queryFn: () => api.getSipTrunks(accountId!), enabled: !!accountId })

export const useCreateSipTrunk = (accountId: string) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ providerId, payload }: { providerId: string; payload: SipTrunkCreate }) => api.createSipTrunk(providerId, payload),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["sipTrunks", accountId] }); toast.success("Troncal creada") },
    onError: () => toast.error("Error al crear troncal"),
  })
}
export const useUpdateSipTrunk = (accountId: string) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: SipTrunkUpdate }) => api.updateSipTrunk(id, payload),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["sipTrunks", accountId] }); toast.success("Troncal actualizada") },
    onError: () => toast.error("Error al actualizar"),
  })
}
export const useDeleteSipTrunk = (accountId: string) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.deleteSipTrunk(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["sipTrunks", accountId] }); toast.success("Troncal eliminada") },
    onError: () => toast.error("Error al eliminar"),
  })
}

// ── PBX Nodes ──
export const usePbxNodes = (accountId: string | undefined) =>
  useQuery({ queryKey: ["pbxNodes", accountId], queryFn: () => api.getPbxNodes(accountId!), enabled: !!accountId })

export const useCreatePbxNode = (accountId: string) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (p: PbxNodeCreate) => api.createPbxNode(accountId, p),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["pbxNodes", accountId] }); toast.success("Nodo PBX creado") },
    onError: () => toast.error("Error al crear nodo"),
  })
}
export const useUpdatePbxNode = (accountId: string) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: PbxNodeUpdate }) => api.updatePbxNode(id, payload),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["pbxNodes", accountId] }); toast.success("Nodo actualizado") },
    onError: () => toast.error("Error al actualizar"),
  })
}
export const useDeletePbxNode = (accountId: string) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.deletePbxNode(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["pbxNodes", accountId] }); toast.success("Nodo eliminado") },
    onError: () => toast.error("Error al eliminar"),
  })
}
export const useHealthCheckPbxNode = () =>
  useMutation({
    mutationFn: (id: string) => api.healthCheckPbxNode(id),
    onSuccess: (d) => toast.success(`Health: ${d.status}`),
    onError: () => toast.error("Health check fallo"),
  })

// ── Agents ──
export const useAgents = (accountId: string | undefined) =>
  useQuery({ queryKey: ["agents", accountId], queryFn: () => api.getAgents(accountId!), enabled: !!accountId })

export const useCreateAgent = (accountId: string) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (p: AgentCreate) => api.createAgent(accountId, p),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["agents", accountId] }); toast.success("Agente creado") },
    onError: () => toast.error("Error al crear agente"),
  })
}
export const useUpdateAgent = (accountId: string) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: AgentUpdate }) => api.updateAgent(id, payload),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["agents", accountId] }); toast.success("Agente actualizado") },
    onError: () => toast.error("Error al actualizar"),
  })
}
export const useDeleteAgent = (accountId: string) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.deleteAgent(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["agents", accountId] }); toast.success("Agente eliminado") },
    onError: () => toast.error("Error al eliminar"),
  })
}
export const useUpdateAgentStatus = (accountId: string) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, estado }: { id: string; estado: string }) => api.updateAgentStatus(id, estado),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["agents", accountId] }),
    onError: () => toast.error("Error al cambiar estado"),
  })
}

// ── Dispositions ──
export const useDispositions = (accountId: string | undefined) =>
  useQuery({ queryKey: ["dispositions", accountId], queryFn: () => api.getDispositions(accountId!), enabled: !!accountId })

export const useCreateDisposition = (accountId: string) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (p: DispositionCreate) => api.createDisposition(accountId, p),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["dispositions", accountId] }); toast.success("Tipificacion creada") },
    onError: () => toast.error("Error al crear"),
  })
}
export const useUpdateDisposition = (accountId: string) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: DispositionUpdate }) => api.updateDisposition(id, payload),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["dispositions", accountId] }); toast.success("Tipificacion actualizada") },
    onError: () => toast.error("Error al actualizar"),
  })
}
export const useDeleteDisposition = (accountId: string) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.deleteDisposition(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["dispositions", accountId] }); toast.success("Tipificacion eliminada") },
    onError: () => toast.error("Error al eliminar"),
  })
}

// ── Campaigns ──
export const useCampaigns = (accountId: string | undefined) =>
  useQuery({ queryKey: ["campaigns", accountId], queryFn: () => api.getCampaigns(accountId!), enabled: !!accountId })

export const useCreateCampaign = (accountId: string) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (p: CampaignCreate) => api.createCampaign(accountId, p),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["campaigns", accountId] }); toast.success("Campana creada") },
    onError: () => toast.error("Error al crear campana"),
  })
}
export const useUpdateCampaign = (accountId: string) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: CampaignUpdate }) => api.updateCampaign(id, payload),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["campaigns", accountId] }); toast.success("Campana actualizada") },
    onError: () => toast.error("Error al actualizar"),
  })
}
export const useDeleteCampaign = (accountId: string) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.deleteCampaign(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["campaigns", accountId] }); toast.success("Campana eliminada") },
    onError: () => toast.error("Error al eliminar"),
  })
}
export const useCampaignControl = (accountId: string) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, action }: { id: string; action: "start" | "pause" | "stop" }) => {
      if (action === "start") return api.startCampaign(id)
      if (action === "pause") return api.pauseCampaign(id)
      return api.stopCampaign(id)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["campaigns", accountId] }),
    onError: () => toast.error("Error al controlar campana"),
  })
}

// Campaign sub-resources
export const useCampaignLeads = (campaignId: string | undefined, page = 1, pageSize = 20) =>
  useQuery({ queryKey: ["campaignLeads", campaignId, page, pageSize], queryFn: () => api.getCampaignLeads(campaignId!, page, pageSize), enabled: !!campaignId })

export const useCampaignStats = (campaignId: string | undefined) =>
  useQuery({ queryKey: ["campaignStats", campaignId], queryFn: () => api.getCampaignStats(campaignId!), enabled: !!campaignId, refetchInterval: 10000 })

export const useAssignAgent = (accountId: string) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ campaignId, agentId }: { campaignId: string; agentId: string }) => api.assignCampaignAgent(campaignId, agentId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["campaigns", accountId] }); toast.success("Agente asignado") },
    onError: () => toast.error("Error al asignar agente"),
  })
}
export const useRemoveAgent = (accountId: string) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ campaignId, agentId }: { campaignId: string; agentId: string }) => api.removeCampaignAgent(campaignId, agentId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["campaigns", accountId] }); toast.success("Agente removido") },
    onError: () => toast.error("Error al remover agente"),
  })
}
export const useAddLeadsBulk = (accountId: string) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ campaignId, payload }: { campaignId: string; payload: { source_type: string; source_id: string; telefono_field: string } }) =>
      api.addCampaignLeadsBulk(campaignId, payload),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["campaigns", accountId] }); toast.success("Leads cargados") },
    onError: () => toast.error("Error al cargar leads"),
  })
}
export const useManualCall = () =>
  useMutation({
    mutationFn: ({ campaignId, payload }: { campaignId: string; payload: { telefono: string; agent_id: string } }) =>
      api.manualCall(campaignId, payload),
    onSuccess: () => toast.success("Llamada iniciada"),
    onError: () => toast.error("Error al iniciar llamada"),
  })
export const useDispositionLead = (campaignId: string | undefined) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ campaignLeadId, dispositionId }: { campaignLeadId: string; dispositionId: string }) =>
      api.dispositionCampaignLead(campaignLeadId, dispositionId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["campaignLeads", campaignId] }); toast.success("Lead tipificado") },
    onError: () => toast.error("Error al tipificar"),
  })
}

// ── CDR ──
export const useCallRecords = (accountId: string | undefined, params: Record<string, string | number | undefined>) =>
  useQuery({
    queryKey: ["callRecords", accountId, params],
    queryFn: () => api.getCallRecords(accountId!, params as never),
    enabled: !!accountId,
  })
export const useCallEvents = (callRecordId: string | undefined) =>
  useQuery({ queryKey: ["callEvents", callRecordId], queryFn: () => api.getCallEvents(callRecordId!), enabled: !!callRecordId })

// ── DNC ──
export const useDncList = (accountId: string | undefined, page = 1, pageSize = 20) =>
  useQuery({ queryKey: ["dnc", accountId, page, pageSize], queryFn: () => api.getDncList(accountId!, page, pageSize), enabled: !!accountId })

export const useAddDnc = (accountId: string) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (p: DncCreate) => api.addDncEntry(accountId, p),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["dnc", accountId] }); toast.success("Numero agregado a DNC") },
    onError: () => toast.error("Error al agregar a DNC"),
  })
}
export const useDeleteDnc = (accountId: string) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.deleteDncEntry(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["dnc", accountId] }); toast.success("Numero removido de DNC") },
    onError: () => toast.error("Error al remover"),
  })
}
