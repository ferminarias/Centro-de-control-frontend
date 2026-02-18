import apiClient from "./client"
import type {
  AutomationResponse,
  AutomationListResponse,
  AutomationCreate,
  AutomationUpdate,
  AutomationConditionCreate,
  AutomationConditionResponse,
  AutomationActionCreate,
  AutomationActionResponse,
  AutomationLogListResponse,
  AutomationMeta,
} from "@/types"

export const getAutomations = async (accountId: string) => {
  const { data } = await apiClient.get<AutomationListResponse>(
    `/api/v1/admin/accounts/${accountId}/automations`
  )
  return data
}

export const getAutomation = async (automationId: string) => {
  const { data } = await apiClient.get<AutomationResponse>(
    `/api/v1/admin/automations/${automationId}`
  )
  return data
}

export const createAutomation = async (accountId: string, payload: AutomationCreate) => {
  const { data } = await apiClient.post<AutomationResponse>(
    `/api/v1/admin/accounts/${accountId}/automations`,
    payload
  )
  return data
}

export const updateAutomation = async (automationId: string, payload: AutomationUpdate) => {
  const { data } = await apiClient.put<AutomationResponse>(
    `/api/v1/admin/automations/${automationId}`,
    payload
  )
  return data
}

export const deleteAutomation = async (automationId: string) => {
  await apiClient.delete(`/api/v1/admin/automations/${automationId}`)
}

export const toggleAutomation = async (automationId: string) => {
  const { data } = await apiClient.patch<AutomationResponse>(
    `/api/v1/admin/automations/${automationId}/toggle`
  )
  return data
}

export const addCondition = async (automationId: string, payload: AutomationConditionCreate) => {
  const { data } = await apiClient.post<AutomationConditionResponse>(
    `/api/v1/admin/automations/${automationId}/conditions`,
    payload
  )
  return data
}

export const deleteCondition = async (conditionId: string) => {
  await apiClient.delete(`/api/v1/admin/automation-conditions/${conditionId}`)
}

export const addAction = async (automationId: string, payload: AutomationActionCreate) => {
  const { data } = await apiClient.post<AutomationActionResponse>(
    `/api/v1/admin/automations/${automationId}/actions`,
    payload
  )
  return data
}

export const deleteAction = async (actionId: string) => {
  await apiClient.delete(`/api/v1/admin/automation-actions/${actionId}`)
}

export const getAutomationLogs = async (automationId: string, page = 1, pageSize = 20) => {
  const { data } = await apiClient.get<AutomationLogListResponse>(
    `/api/v1/admin/automations/${automationId}/logs`,
    { params: { page, page_size: pageSize } }
  )
  return data
}

export const getAutomationMeta = async () => {
  const { data } = await apiClient.get<AutomationMeta>(
    `/api/v1/admin/automation-meta`
  )
  return data
}
