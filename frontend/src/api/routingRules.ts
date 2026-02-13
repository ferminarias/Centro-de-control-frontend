import apiClient from "./client"
import type {
  RoutingRuleCreate,
  RoutingRuleListResponse,
  RoutingRuleResponse,
  RoutingRuleUpdate,
} from "@/types"

export const getRules = async (baseId: string) => {
  const { data } = await apiClient.get<RoutingRuleListResponse>(
    `/api/v1/admin/bases/${baseId}/rules`
  )
  return data
}

export const createRule = async (baseId: string, payload: RoutingRuleCreate) => {
  const { data } = await apiClient.post<RoutingRuleResponse>(
    `/api/v1/admin/bases/${baseId}/rules`,
    payload
  )
  return data
}

export const updateRule = async (ruleId: string, payload: RoutingRuleUpdate) => {
  const { data } = await apiClient.put<RoutingRuleResponse>(
    `/api/v1/admin/rules/${ruleId}`,
    payload
  )
  return data
}

export const deleteRule = async (ruleId: string) => {
  await apiClient.delete(`/api/v1/admin/rules/${ruleId}`)
}
