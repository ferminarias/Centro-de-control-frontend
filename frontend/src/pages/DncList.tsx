import { useState } from "react"
import { Plus, Trash2, PhoneOff } from "lucide-react"
import { useAccount } from "@/context/AccountContext"
import { useDncList, useAddDnc, useDeleteDnc } from "@/hooks/useVoip"
import { TableSkeleton } from "@/components/ui/Loading"
import ErrorState from "@/components/ui/ErrorState"
import EmptyState from "@/components/ui/EmptyState"
import Modal from "@/components/ui/Modal"
import ConfirmDialog from "@/components/ui/ConfirmDialog"
import Pagination from "@/components/ui/Pagination"
import { formatDate } from "@/lib/utils"
import type { DncEntryResponse } from "@/types"

export default function DncList() {
  const { selectedAccount } = useAccount()
  const accountId = selectedAccount?.id ?? ""

  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)

  const { data, isLoading, isError, refetch } = useDncList(accountId || undefined, page, pageSize)
  const addMut = useAddDnc(accountId)
  const deleteMut = useDeleteDnc(accountId)

  const [modalOpen, setModalOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<DncEntryResponse | null>(null)
  const [form, setForm] = useState({ telefono: "", motivo: "" })

  const entries = data?.items ?? []

  const handleAdd = () => {
    if (!form.telefono) return
    addMut.mutate({ telefono: form.telefono, motivo: form.motivo || undefined }, {
      onSuccess: () => { setModalOpen(false); setForm({ telefono: "", motivo: "" }) },
    })
  }

  const handleDelete = () => {
    if (!deleteTarget) return
    deleteMut.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) })
  }

  if (!selectedAccount) return null

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Lista DNC (No Llamar)</h2>
          <p className="text-sm text-muted-foreground mt-1">Numeros excluidos de campanas de llamadas.</p>
        </div>
        <button onClick={() => { setForm({ telefono: "", motivo: "" }); setModalOpen(true) }} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary/90 transition-colors">
          <Plus className="h-4 w-4" /> Agregar numero
        </button>
      </div>

      <div className="rounded-xl border border-border bg-white shadow-sm">
        {isLoading ? (
          <div className="p-6"><TableSkeleton rows={5} cols={4} /></div>
        ) : isError ? (
          <ErrorState onRetry={() => refetch()} />
        ) : entries.length === 0 ? (
          <EmptyState icon={PhoneOff} title="Lista DNC vacia" description="No hay numeros en la lista de exclusion." />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Telefono</th>
                    <th className="px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Motivo</th>
                    <th className="px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Agregado</th>
                    <th className="px-6 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {entries.map((e) => (
                    <tr key={e.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-mono font-medium text-foreground">{e.telefono}</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{e.motivo ?? "-"}</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{formatDate(e.created_at)}</td>
                      <td className="px-6 py-4">
                        <button onClick={() => setDeleteTarget(e)} className="rounded-md p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-6 pb-4">
              <Pagination page={page} pageSize={pageSize} total={data?.total ?? 0} onPageChange={setPage} onPageSizeChange={(s) => { setPageSize(s); setPage(1) }} />
            </div>
          </>
        )}
      </div>

      <Modal open={modalOpen} onOpenChange={setModalOpen} title="Agregar numero a DNC">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Telefono</label>
            <input value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} className="w-full rounded-lg border border-border bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" placeholder="+5491155551234" />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Motivo (opcional)</label>
            <input value={form.motivo} onChange={(e) => setForm({ ...form, motivo: e.target.value })} className="w-full rounded-lg border border-border bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" placeholder="Solicitud del cliente" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setModalOpen(false)} className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-gray-50 transition-colors">Cancelar</button>
            <button onClick={handleAdd} disabled={!form.telefono || addMut.isPending} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-colors disabled:opacity-50">
              {addMut.isPending ? "Agregando..." : "Agregar"}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)} title="Remover de DNC" description={`Se removera el numero "${deleteTarget?.telefono}" de la lista DNC. Podra ser contactado nuevamente.`} confirmLabel="Remover" variant="danger" onConfirm={handleDelete} loading={deleteMut.isPending} />
    </div>
  )
}
