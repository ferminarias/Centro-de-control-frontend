import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  getLotes,
  importLote,
  deleteLote,
  associateLote,
  getLoteLeads,
} from "@/api/lotes"
import { toast } from "sonner"

export function useLotesList(accountId: string | undefined) {
  return useQuery({
    queryKey: ["lotes", accountId],
    queryFn: () => getLotes(accountId!),
    enabled: !!accountId,
  })
}

export function useImportLote(accountId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ file, nombre }: { file: File; nombre: string }) =>
      importLote(accountId, file, nombre),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["lotes", accountId] })
      toast.success(`Lote "${data.nombre}" importado con ${data.total_leads} leads`)
    },
    onError: () => toast.error("Error al importar el lote"),
  })
}

export function useDeleteLote(accountId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (loteId: string) => deleteLote(loteId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["lotes", accountId] })
      toast.success("Lote eliminado")
    },
    onError: () => toast.error("Error al eliminar el lote"),
  })
}

export function useAssociateLote(accountId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      loteId,
      leadBaseId,
    }: {
      loteId: string
      leadBaseId: string | null
    }) => associateLote(loteId, leadBaseId),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["lotes", accountId] })
      qc.invalidateQueries({ queryKey: ["leadBases", accountId] })
      qc.invalidateQueries({ queryKey: ["baseLeads"] })
      if (data.lead_base_id) {
        toast.success(`${data.moved} lead${data.moved !== 1 ? "s" : ""} asociado${data.moved !== 1 ? "s" : ""} a la base`)
      } else {
        toast.success(`Lote desasociado de la base`)
      }
    },
    onError: () => toast.error("Error al asociar el lote"),
  })
}

export function useLoteLeads(loteId: string | undefined, page = 1, pageSize = 20) {
  return useQuery({
    queryKey: ["loteLeads", loteId, page, pageSize],
    queryFn: () => getLoteLeads(loteId!, page, pageSize),
    enabled: !!loteId,
  })
}
