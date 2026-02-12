import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Link } from "react-router-dom"
import { Plus, Eye, Users } from "lucide-react"
import { getAccounts } from "@/api/accounts"
import { TableSkeleton } from "@/components/ui/Loading"
import ErrorState from "@/components/ui/ErrorState"
import EmptyState from "@/components/ui/EmptyState"
import Pagination from "@/components/ui/Pagination"
import Badge from "@/components/ui/Badge"
import CopyButton from "@/components/ui/CopyButton"
import CreateAccountModal from "@/components/accounts/CreateAccountModal"
import { formatDate, truncate } from "@/lib/utils"

export default function Accounts() {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [showCreate, setShowCreate] = useState(false)

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["accounts", page, pageSize],
    queryFn: () => getAccounts(page, pageSize),
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Cuentas</h2>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Nueva cuenta
        </button>
      </div>

      <div className="rounded-xl border border-border bg-card">
        {isLoading ? (
          <div className="p-6">
            <TableSkeleton rows={5} cols={6} />
          </div>
        ) : isError ? (
          <ErrorState onRetry={() => refetch()} />
        ) : !data || data.items.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No hay cuentas"
            description="Crea tu primera cuenta para comenzar a recibir datos."
            action={
              <button
                onClick={() => setShowCreate(true)}
                className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Nueva cuenta
              </button>
            }
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Nombre</th>
                    <th className="px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">API Key</th>
                    <th className="px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Estado</th>
                    <th className="px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Auto-crear</th>
                    <th className="px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Fecha creacion</th>
                    <th className="px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {data.items.map((account) => (
                    <tr key={account.id} className="hover:bg-accent/30 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium">{account.nombre}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <code className="text-xs text-muted-foreground font-mono">
                            {truncate(account.api_key, 16)}
                          </code>
                          <CopyButton text={account.api_key} />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={account.activo ? "success" : "danger"}>
                          {account.activo ? "Activo" : "Inactivo"}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={account.auto_crear_campos ? "success" : "danger"}>
                          {account.auto_crear_campos ? "ON" : "OFF"}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {formatDate(account.created_at)}
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          to={`/accounts/${account.id}`}
                          className="inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium text-primary hover:bg-primary/10 transition-colors"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          Ver
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-6 pb-4">
              <Pagination
                page={page}
                pageSize={pageSize}
                total={data.total}
                onPageChange={setPage}
                onPageSizeChange={(size) => { setPageSize(size); setPage(1) }}
              />
            </div>
          </>
        )}
      </div>

      <CreateAccountModal open={showCreate} onOpenChange={setShowCreate} />
    </div>
  )
}
