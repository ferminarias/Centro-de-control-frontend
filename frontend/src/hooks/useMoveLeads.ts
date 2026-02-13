import { useMutation, useQueryClient } from "@tanstack/react-query"
import { moveLeads } from "@/api/moveLeads"
import { toast } from "sonner"

export function useMoveLeads(accountId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: moveLeads,
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["baseLeads"] })
      qc.invalidateQueries({ queryKey: ["leadBases", accountId] })
      qc.invalidateQueries({ queryKey: ["leads"] })
      toast.success(`${data.moved} lead${data.moved !== 1 ? "s" : ""} movido${data.moved !== 1 ? "s" : ""} exitosamente`)
    },
    onError: () => toast.error("Error al mover los leads"),
  })
}
