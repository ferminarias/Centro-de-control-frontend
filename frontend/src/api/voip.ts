import apiClient from "./client"
import type {
  SipProviderResponse, SipProviderListResponse, SipProviderCreate, SipProviderUpdate,
  SipTrunkResponse, SipTrunkListResponse, SipTrunkCreate, SipTrunkUpdate,
  PbxNodeResponse, PbxNodeListResponse, PbxNodeCreate, PbxNodeUpdate,
  AgentResponse, AgentListResponse, AgentCreate, AgentUpdate,
  DispositionResponse, DispositionListResponse, DispositionCreate, DispositionUpdate,
  CampaignResponse, CampaignListResponse, CampaignCreate, CampaignUpdate,
  CampaignLeadListResponse, CampaignStatsResponse,
  CallRecordListResponse, CallEventResponse,
  DncListResponse, DncCreate, DncEntryResponse,
  ManualCallResponse,
} from "@/types"

// ── SIP Providers ──
export const getSipProviders = async (accountId: string) => {
  const { data } = await apiClient.get<SipProviderListResponse>(`/api/v1/admin/accounts/${accountId}/sip-providers`)
  return data
}
export const createSipProvider = async (accountId: string, payload: SipProviderCreate) => {
  const { data } = await apiClient.post<SipProviderResponse>(`/api/v1/admin/accounts/${accountId}/sip-providers`, payload)
  return data
}
export const updateSipProvider = async (providerId: string, payload: SipProviderUpdate) => {
  const { data } = await apiClient.put<SipProviderResponse>(`/api/v1/admin/sip-providers/${providerId}`, payload)
  return data
}
export const deleteSipProvider = async (providerId: string) => {
  await apiClient.delete(`/api/v1/admin/sip-providers/${providerId}`)
}

// ── SIP Trunks ──
export const getSipTrunks = async (accountId: string) => {
  const { data } = await apiClient.get<SipTrunkListResponse>(`/api/v1/admin/accounts/${accountId}/sip-trunks`)
  return data
}
export const createSipTrunk = async (providerId: string, payload: SipTrunkCreate) => {
  const { data } = await apiClient.post<SipTrunkResponse>(`/api/v1/admin/sip-providers/${providerId}/trunks`, payload)
  return data
}
export const updateSipTrunk = async (trunkId: string, payload: SipTrunkUpdate) => {
  const { data } = await apiClient.put<SipTrunkResponse>(`/api/v1/admin/sip-trunks/${trunkId}`, payload)
  return data
}
export const deleteSipTrunk = async (trunkId: string) => {
  await apiClient.delete(`/api/v1/admin/sip-trunks/${trunkId}`)
}

// ── PBX Nodes ──
export const getPbxNodes = async (accountId: string) => {
  const { data } = await apiClient.get<PbxNodeListResponse>(`/api/v1/admin/accounts/${accountId}/pbx-nodes`)
  return data
}
export const createPbxNode = async (accountId: string, payload: PbxNodeCreate) => {
  const { data } = await apiClient.post<PbxNodeResponse>(`/api/v1/admin/accounts/${accountId}/pbx-nodes`, payload)
  return data
}
export const updatePbxNode = async (nodeId: string, payload: PbxNodeUpdate) => {
  const { data } = await apiClient.put<PbxNodeResponse>(`/api/v1/admin/pbx-nodes/${nodeId}`, payload)
  return data
}
export const deletePbxNode = async (nodeId: string) => {
  await apiClient.delete(`/api/v1/admin/pbx-nodes/${nodeId}`)
}
export const healthCheckPbxNode = async (nodeId: string) => {
  const { data } = await apiClient.post<{ status: string; detail: string }>(`/api/v1/admin/pbx-nodes/${nodeId}/health-check`)
  return data
}

// ── Agents ──
export const getAgents = async (accountId: string) => {
  const { data } = await apiClient.get<AgentListResponse>(`/api/v1/admin/accounts/${accountId}/agents`)
  return data
}
export const createAgent = async (accountId: string, payload: AgentCreate) => {
  const { data } = await apiClient.post<AgentResponse>(`/api/v1/admin/accounts/${accountId}/agents`, payload)
  return data
}
export const updateAgent = async (agentId: string, payload: AgentUpdate) => {
  const { data } = await apiClient.put<AgentResponse>(`/api/v1/admin/agents/${agentId}`, payload)
  return data
}
export const deleteAgent = async (agentId: string) => {
  await apiClient.delete(`/api/v1/admin/agents/${agentId}`)
}
export const updateAgentStatus = async (agentId: string, estado: string) => {
  const { data } = await apiClient.put<AgentResponse>(`/api/v1/admin/agents/${agentId}/status`, { estado })
  return data
}

// ── Dispositions ──
export const getDispositions = async (accountId: string) => {
  const { data } = await apiClient.get<DispositionListResponse>(`/api/v1/admin/accounts/${accountId}/dispositions`)
  return data
}
export const createDisposition = async (accountId: string, payload: DispositionCreate) => {
  const { data } = await apiClient.post<DispositionResponse>(`/api/v1/admin/accounts/${accountId}/dispositions`, payload)
  return data
}
export const updateDisposition = async (dispId: string, payload: DispositionUpdate) => {
  const { data } = await apiClient.put<DispositionResponse>(`/api/v1/admin/dispositions/${dispId}`, payload)
  return data
}
export const deleteDisposition = async (dispId: string) => {
  await apiClient.delete(`/api/v1/admin/dispositions/${dispId}`)
}

// ── Campaigns ──
export const getCampaigns = async (accountId: string) => {
  const { data } = await apiClient.get<CampaignListResponse>(`/api/v1/admin/accounts/${accountId}/campaigns`)
  return data
}
export const getCampaign = async (campaignId: string) => {
  const { data } = await apiClient.get<CampaignResponse>(`/api/v1/admin/campaigns/${campaignId}`)
  return data
}
export const createCampaign = async (accountId: string, payload: CampaignCreate) => {
  const { data } = await apiClient.post<CampaignResponse>(`/api/v1/admin/accounts/${accountId}/campaigns`, payload)
  return data
}
export const updateCampaign = async (campaignId: string, payload: CampaignUpdate) => {
  const { data } = await apiClient.put<CampaignResponse>(`/api/v1/admin/campaigns/${campaignId}`, payload)
  return data
}
export const deleteCampaign = async (campaignId: string) => {
  await apiClient.delete(`/api/v1/admin/campaigns/${campaignId}`)
}
export const startCampaign = async (campaignId: string) => {
  const { data } = await apiClient.post<CampaignResponse>(`/api/v1/admin/campaigns/${campaignId}/start`)
  return data
}
export const pauseCampaign = async (campaignId: string) => {
  const { data } = await apiClient.post<CampaignResponse>(`/api/v1/admin/campaigns/${campaignId}/pause`)
  return data
}
export const stopCampaign = async (campaignId: string) => {
  const { data } = await apiClient.post<CampaignResponse>(`/api/v1/admin/campaigns/${campaignId}/stop`)
  return data
}

// Campaign agents
export const assignCampaignAgent = async (campaignId: string, agentId: string) => {
  await apiClient.post(`/api/v1/admin/campaigns/${campaignId}/agents/${agentId}`)
}
export const removeCampaignAgent = async (campaignId: string, agentId: string) => {
  await apiClient.delete(`/api/v1/admin/campaigns/${campaignId}/agents/${agentId}`)
}

// Campaign leads
export const getCampaignLeads = async (campaignId: string, page = 1, pageSize = 20) => {
  const { data } = await apiClient.get<CampaignLeadListResponse>(
    `/api/v1/admin/campaigns/${campaignId}/leads`,
    { params: { page, page_size: pageSize } }
  )
  return data
}
export const addCampaignLeadsBulk = async (campaignId: string, payload: { source_type: string; source_id: string; telefono_field: string }) => {
  const { data } = await apiClient.post(`/api/v1/admin/campaigns/${campaignId}/leads/bulk`, payload)
  return data
}

// Manual call
export const manualCall = async (campaignId: string, payload: { telefono: string; agent_id: string }) => {
  const { data } = await apiClient.post<ManualCallResponse>(`/api/v1/admin/campaigns/${campaignId}/manual-call`, payload)
  return data
}

// Campaign stats
export const getCampaignStats = async (campaignId: string) => {
  const { data } = await apiClient.get<CampaignStatsResponse>(`/api/v1/admin/campaigns/${campaignId}/stats`)
  return data
}

// ── Call Records (CDR) ──
export const getCallRecords = async (
  accountId: string,
  params: { page?: number; page_size?: number; campaign_id?: string; agent_id?: string; disposition_id?: string; fecha_desde?: string; fecha_hasta?: string }
) => {
  const { data } = await apiClient.get<CallRecordListResponse>(
    `/api/v1/admin/accounts/${accountId}/call-records`,
    { params }
  )
  return data
}
export const getCallEvents = async (callRecordId: string) => {
  const { data } = await apiClient.get<CallEventResponse[]>(`/api/v1/admin/call-records/${callRecordId}/events`)
  return Array.isArray(data) ? data : []
}

// ── DNC ──
export const getDncList = async (accountId: string, page = 1, pageSize = 20) => {
  const { data } = await apiClient.get<DncListResponse>(
    `/api/v1/admin/accounts/${accountId}/dnc`,
    { params: { page, page_size: pageSize } }
  )
  return data
}
export const addDncEntry = async (accountId: string, payload: DncCreate) => {
  const { data } = await apiClient.post<DncEntryResponse>(`/api/v1/admin/accounts/${accountId}/dnc`, payload)
  return data
}
export const deleteDncEntry = async (dncId: string) => {
  await apiClient.delete(`/api/v1/admin/dnc/${dncId}`)
}

// Campaign lead disposition
export const dispositionCampaignLead = async (campaignLeadId: string, dispositionId: string) => {
  await apiClient.post(`/api/v1/admin/campaign-leads/${campaignLeadId}/disposition`, { disposition_id: dispositionId })
}
