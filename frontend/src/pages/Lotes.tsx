import { useState, useMemo, useRef } from "react"
import {
  Package,
  Download,
  Upload,
  Trash2,
  Link,
  Unlink,
  Eye,
  ChevronDown,
  Users,
} from "lucide-react"
import { useAccount } from "@/context/AccountContext"
import { useLeadBasesList } from "@/hooks/useLeadBases"
import {
  useLotesList,
  useImportLote,
  useDeleteLote,
  useAssociateLote,
  useLoteLeads,
} from "@/hooks/useLotes"
import { downloadLoteTemplate } from "@/api/lotes"
import { TableSkeleton } from "@/components/ui/Loading"
import ErrorState from "@/components/ui/ErrorState"
import EmptyState from "@/components/ui/EmptyState"
import Badge from "@/components/ui/Badge"
import Modal from "@/components/ui/Modal"
import ConfirmDialog from "@/components/ui/ConfirmDialog"
import Pagination from "@/components/ui/Pagination"
import { formatDate, truncate, cn } from "@/lib/utils"
import type { LoteResponse } from "@/types"

export default function Lotes() {
  const { selectedAccount } = useAccount()
  const accountId = selectedAccount?.id ?? ""

  const { data: lotesData, isLoading, isError, refetch } = useLotesList(accountId)
  const { data: basesData } = useLeadBasesList(accountId)
  const bases = basesData?.items ?? []

  const importMutation = useImportLote(accountId)
  const deleteMutation = useDeleteLote(accountId)
  const associateMutation = useAssociateLote(accountId)

  const [showImport, setShowImport] = useState(false)
  const [importName, setImportName] = useState("")
  const [importFile, setImportFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [deleteTarget, setDeleteTarget] = useState<LoteResponse | null>(null)
  const [associateTarget, setAssociateTarget] = useState<LoteResponse | null>(null)
  const [selectedBaseId, setSelectedBaseId] = useState("")

  const [viewLeadsLote, setViewLeadsLote] = useState<LoteResponse | null>(null)

  const [downloading, setDownloading] = useState(false)

  const lotes = lotesData?.items ?? []

  const handleDownloadTemplate = async () => {
    setDownloading(true)
    try {
      await downloadLoteTemplate(accountId)
    } catch {
      // error handled silently
    } finally {
      setDownloading(false)
    }
  }

  const handleImport = () => {
    if (!importFile || !importName.trim()) return
    importMutation.mutate(
      { file: importFile, nombre: importName.trim() },
      {
        onSuccess: () => {
          setShowImport(false)
          setImportName("")
          setImportFile(null)
        },
      }
    )
  }

  const handleDelete = () => {
    if (!deleteTarget) return
    deleteMutation.mutate(deleteTarget.id, {
      onSuccess: () => setDeleteTarget(null),
    })
  }

  const handleAssociate = () => {
    if (!associateTarget) return
    associateMutation.mutate(
      { loteId: associateTarget.id, leadBaseId: selectedBaseId || null },
      {
        onSuccess: () => {
          setAssociateTarget(null)
          setSelectedBaseId("")
        },
      }
    )
  }

  const getBaseName = (baseId: string | null) => {
    if (!baseId) return null
    return bases.find((b) => b.id === baseId)?.nombre ?? "—"
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Lotes</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Importa leads masivamente mediante archivos Excel y asocialos a bases de datos.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadTemplate}
            disabled={downloading}
            className="flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-foreground hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            {downloading ? "Descargando..." : "Descargar plantilla"}
          </button>
          <button
            onClick={() => setShowImport(true)}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary/90 transition-colors"
          >
            <Upload className="h-4 w-4" />
            Importar lote
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-white shadow-sm">
        {isLoading ? (
          <div className="p-6">
            <TableSkeleton rows={4} cols={5} />
          </div>
        ) : isError ? (
          <ErrorState onRetry={() => refetch()} />
        ) : lotes.length === 0 ? (
          <EmptyState
            icon={Package}
            title="No hay lotes"
            description="Descarga la plantilla Excel, completala con leads y subi el archivo para crear un lote."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Leads
                  </th>
                  <th className="px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Base asociada
                  </th>
                  <th className="px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Creado
                  </th>
                  <th className="px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {lotes.map((lote) => (
                  <tr key={lote.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-foreground">
                      {lote.nombre}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="default">{lote.total_leads} leads</Badge>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {lote.lead_base_id ? (
                        <Badge variant="info">{getBaseName(lote.lead_base_id)}</Badge>
                      ) : (
                        <span className="text-muted-foreground">Sin asociar</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground whitespace-nowrap">
                      {formatDate(lote.created_at)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setViewLeadsLote(lote)}
                          className="inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium text-primary hover:bg-primary/10 transition-colors"
                          title="Ver leads"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          Ver
                        </button>
                        <button
                          onClick={() => {
                            setAssociateTarget(lote)
                            setSelectedBaseId(lote.lead_base_id ?? "")
                          }}
                          className={cn(
                            "inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors",
                            lote.lead_base_id
                              ? "text-orange-600 hover:bg-orange-50"
                              : "text-green-600 hover:bg-green-50"
                          )}
                          title={lote.lead_base_id ? "Cambiar/desasociar base" : "Asociar a base"}
                        >
                          {lote.lead_base_id ? (
                            <>
                              <Unlink className="h-3.5 w-3.5" />
                              Base
                            </>
                          ) : (
                            <>
                              <Link className="h-3.5 w-3.5" />
                              Asociar
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => setDeleteTarget(lote)}
                          className="inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
                          title="Eliminar lote"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Import modal */}
      <Modal open={showImport} onOpenChange={setShowImport} title="Importar lote">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Nombre del lote
            </label>
            <input
              type="text"
              value={importName}
              onChange={(e) => setImportName(e.target.value)}
              placeholder="Ej: Campaña Enero 2026"
              className="w-full rounded-lg border border-border bg-white px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Archivo Excel (.xlsx)
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={(e) => setImportFile(e.target.files?.[0] ?? null)}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 w-full rounded-lg border border-dashed border-border px-4 py-6 text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors"
            >
              <Upload className="h-5 w-5" />
              {importFile ? (
                <span className="text-foreground font-medium">{importFile.name}</span>
              ) : (
                "Click para seleccionar archivo..."
              )}
            </button>
            {importFile && (
              <button
                onClick={() => {
                  setImportFile(null)
                  if (fileInputRef.current) fileInputRef.current.value = ""
                }}
                className="mt-1 text-xs text-red-500 hover:text-red-700"
              >
                Quitar archivo
              </button>
            )}
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => {
                setShowImport(false)
                setImportName("")
                setImportFile(null)
              }}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleImport}
              disabled={!importFile || !importName.trim() || importMutation.isPending}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {importMutation.isPending ? "Importando..." : "Importar"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Associate modal */}
      <Modal
        open={!!associateTarget}
        onOpenChange={(o) => !o && setAssociateTarget(null)}
        title={associateTarget?.lead_base_id ? "Cambiar base del lote" : "Asociar lote a base"}
        description={`Lote: ${associateTarget?.nombre ?? ""} (${associateTarget?.total_leads ?? 0} leads)`}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Base de datos
            </label>
            <div className="relative">
              <select
                value={selectedBaseId}
                onChange={(e) => setSelectedBaseId(e.target.value)}
                className="w-full appearance-none rounded-lg border border-border bg-white px-4 py-2.5 pr-10 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Sin base (desasociar)</option>
                {bases.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.nombre}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
          </div>
          {associateTarget?.lead_base_id && !selectedBaseId && (
            <p className="text-sm text-orange-600 bg-orange-50 rounded-lg p-3">
              Al desasociar, los leads del lote se removeran de la base actual.
            </p>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setAssociateTarget(null)}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleAssociate}
              disabled={associateMutation.isPending}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {associateMutation.isPending ? "Procesando..." : selectedBaseId ? "Asociar" : "Desasociar"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete confirm */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Eliminar lote"
        description={`Se eliminara el lote "${deleteTarget?.nombre}" y todos sus leads asociados (${deleteTarget?.total_leads ?? 0}). Esta accion no se puede deshacer.`}
        confirmLabel="Eliminar"
        variant="danger"
        onConfirm={handleDelete}
        loading={deleteMutation.isPending}
      />

      {/* View leads modal */}
      {viewLeadsLote && (
        <LoteLeadsModal
          lote={viewLeadsLote}
          onClose={() => setViewLeadsLote(null)}
        />
      )}
    </div>
  )
}

// ── Leads of a Lote modal ──

function LoteLeadsModal({
  lote,
  onClose,
}: {
  lote: LoteResponse
  onClose: () => void
}) {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const { data, isLoading, isError, refetch } = useLoteLeads(lote.id, page, pageSize)
  const leads = data?.items ?? []

  const columns = useMemo(() => {
    const colSet = new Set<string>()
    for (const lead of leads) {
      for (const key of Object.keys(lead.datos)) colSet.add(key)
    }
    return Array.from(colSet).slice(0, 6)
  }, [leads])

  return (
    <Modal
      open
      onOpenChange={(o) => !o && onClose()}
      title={`Leads del lote: ${lote.nombre}`}
      description={`${lote.total_leads} leads en total`}
      wide
    >
      <div className="max-h-[60vh] overflow-auto">
        {isLoading ? (
          <TableSkeleton rows={5} cols={4} />
        ) : isError ? (
          <ErrorState onRetry={() => refetch()} />
        ) : leads.length === 0 ? (
          <EmptyState
            icon={Users}
            title="Sin leads"
            description="Este lote no tiene leads."
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                      ID
                    </th>
                    <th className="px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                      Fecha
                    </th>
                    {columns.map((col) => (
                      <th
                        key={col}
                        className="px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap"
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {leads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-sm font-mono font-medium text-foreground whitespace-nowrap">
                        {lead.id_lead}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">
                        {formatDate(lead.created_at)}
                      </td>
                      {columns.map((col) => {
                        const val = lead.datos[col]
                        return (
                          <td key={col} className="px-4 py-3 text-sm max-w-[180px]">
                            {val != null ? (
                              <span className="truncate block">
                                {truncate(String(val), 35)}
                              </span>
                            ) : (
                              <span className="text-gray-300">-</span>
                            )}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-2 pb-2">
              <Pagination
                page={page}
                pageSize={pageSize}
                total={data?.total ?? 0}
                onPageChange={setPage}
                onPageSizeChange={(s) => {
                  setPageSize(s)
                  setPage(1)
                }}
              />
            </div>
          </>
        )}
      </div>
    </Modal>
  )
}
