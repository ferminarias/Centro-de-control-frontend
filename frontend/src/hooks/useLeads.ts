import { useQuery } from "@tanstack/react-query"
import { getLeads, getLead } from "@/api/leads"

export function useLeadsList(accountId: string | undefined, page = 1, pageSize = 20) {
  return useQuery({
    queryKey: ["leads", accountId, page, pageSize],
    queryFn: () => getLeads(accountId!, page, pageSize),
    enabled: !!accountId,
  })
}

export function useLeadDetail(leadId: string | null) {
  return useQuery({
    queryKey: ["lead", leadId],
    queryFn: () => getLead(leadId!),
    enabled: !!leadId,
  })
}
