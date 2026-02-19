/**
 * Administración de Campañas de Contact Center
 * Para crear, configurar y gestionar campañas
 */
import { useState } from "react"
import { 
  Megaphone, Plus, Database, 
  Play, Pause, Trash2, Eye
} from "lucide-react"
import { useAccount } from "@/context/AccountContext"
import {
  useCampaniasList,
  useCreateCampania,
  useDeleteCampania,
  useCambiarEstadoCampania,
} from "@/hooks/useCampanias"
import { useLeadBasesList } from "@/hooks/useLeadBases"
import Modal from "@/components/ui/Modal"
import Badge from "@/components/ui/Badge"
import { TableSkeleton } from "@/components/ui/Loading"
import EmptyState from "@/components/ui/EmptyState"
import { cn } from "@/lib/utils"
import type { CampaniaCreate, TipoDiscador, EstadoCampania } from "@/types/campania"

export default function CampaniasAdmin() {
  const { selectedAccount } = useAccount()
  const accountId = selectedAccount?.id ?? ""
  
  const { data, isLoading, refetch } = useCampaniasList(accountId)
  const deleteMutation = useDeleteCampania(accountId)
  const cambiarEstadoMutation = useCambiarEstadoCampania(accountId)
  
  const [showCreateModal, setShowCreateModal] = useState(false)
  
  const campanias = data?.items || []
  
  const handleDelete = async (id: string) => {
    if (confirm("¿Eliminar esta campaña? Se perderán todos los datos de la cola.")) {
      await deleteMutation.mutateAsync(id)
    }
  }
  
  const handleChangeEstado = async (campaniaId: string, nuevoEstado: EstadoCampania) => {
    await cambiarEstadoMutation.mutateAsync({
      campaniaId,
      estado: nuevoEstado
    })
  }
  
  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Campañas</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Gestiona campañas de contact center y sus colas de leads
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Nueva Campaña
        </button>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard 
          title="Activas" 
          value={campanias.filter(c => c.estado === "activa").length}
          icon={Play}
          color="green"
        />
        <StatCard 
          title="Pausadas" 
          value={campanias.filter(c => c.estado === "pausada").length}
          icon={Pause}
          color="yellow"
        />
        <StatCard 
          title="Leads en Cola" 
          value={campanias.reduce((acc, c) => acc + (c.leads_en_cola || 0), 0)}
          icon={Database}
          color="blue"
        />
        <StatCard 
          title="Total Campañas" 
          value={campanias.length}
          icon={Megaphone}
          color="gray"
        />
      </div>
      
      {/* Table */}
      <div className="rounded-xl border border-border bg-white shadow-sm">
        {isLoading ? (
          <div className="p-6">
            <TableSkeleton rows={4} cols={6} />
          </div>
        ) : campanias.length === 0 ? (
          <EmptyState
            icon={Megaphone}
            title="No hay campañas"
            description="Crea tu primera campaña para empezar a gestionar leads."
          />
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="px-6 py-3 text-xs font-medium text-muted-foreground uppercase">Nombre</th>
                <th className="px-6 py-3 text-xs font-medium text-muted-foreground uppercase">Discador</th>
                <th className="px-6 py-3 text-xs font-medium text-muted-foreground uppercase">Estado</th>
                <th className="px-6 py-3 text-xs font-medium text-muted-foreground uppercase">Leads</th>
                <th className="px-6 py-3 text-xs font-medium text-muted-foreground uppercase">Agentes</th>
                <th className="px-6 py-3 text-xs font-medium text-muted-foreground uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {campanias.map((camp) => (
                <tr key={camp.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium">{camp.nombre}</p>
                      <p className="text-xs text-gray-500 truncate max-w-[200px]">
                        {camp.descripcion || "Sin descripción"}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={getDiscadorColor(camp.tipo_discador)}>
                      {formatDiscador(camp.tipo_discador)}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <EstadoBadge estado={camp.estado} />
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-medium">{camp.leads_en_cola}</span>
                    <span className="text-xs text-gray-500 ml-1">en cola</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-medium">{camp.total_agentes}</span>
                    <span className="text-xs text-gray-500 ml-1">agentes</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      {/* Botón Activar (para borrador o pausada) */}
                      {(camp.estado === "borrador" || camp.estado === "pausada") && (
                        <button
                          onClick={() => handleChangeEstado(camp.id, "activa")}
                          disabled={cambiarEstadoMutation.isPending}
                          className="p-1.5 text-green-600 hover:bg-green-50 rounded disabled:opacity-50"
                          title="Activar campaña"
                        >
                          <Play className="h-4 w-4" />
                        </button>
                      )}
                      {/* Botón Pausar (solo para activa) */}
                      {camp.estado === "activa" && (
                        <button
                          onClick={() => handleChangeEstado(camp.id, "pausada")}
                          disabled={cambiarEstadoMutation.isPending}
                          className="p-1.5 text-yellow-600 hover:bg-yellow-50 rounded disabled:opacity-50"
                          title="Pausar campaña"
                        >
                          <Pause className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                        title="Ver detalle"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(camp.id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                        title="Eliminar"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      
      {/* Create Modal */}
      <CreateCampaniaModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        accountId={accountId}
        onSuccess={() => {
          setShowCreateModal(false)
          refetch()
        }}
      />
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-componentes
// ─────────────────────────────────────────────────────────────────────────────

function StatCard({ title, value, icon: Icon, color }: {
  title: string
  value: number
  icon: any
  color: string
}) {
  const colors: Record<string, string> = {
    green: "bg-green-50 text-green-700",
    yellow: "bg-yellow-50 text-yellow-700",
    blue: "bg-blue-50 text-blue-700",
    gray: "bg-gray-50 text-gray-700",
  }
  
  return (
    <div className="bg-white rounded-lg border p-4 flex items-center gap-3">
      <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center", colors[color])}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-xs text-gray-500">{title}</p>
      </div>
    </div>
  )
}

function EstadoBadge({ estado }: { estado: string }) {
  const variants: Record<string, any> = {
    activa: "success",
    pausada: "warning",
    borrador: "default",
    finalizada: "secondary",
  }
  
  return (
    <Badge variant={variants[estado] || "default"}>
      {estado.charAt(0).toUpperCase() + estado.slice(1)}
    </Badge>
  )
}

function getDiscadorColor(tipo: string): any {
  const colors: Record<string, any> = {
    sin_discador: "default",
    preview: "info",
    progresivo: "warning",
    predictivo: "success",
  }
  return colors[tipo] || "default"
}

function formatDiscador(tipo: string): string {
  const labels: Record<string, string> = {
    sin_discador: "Manual",
    preview: "Preview",
    progresivo: "Progresivo",
    predictivo: "Predictivo",
  }
  return labels[tipo] || tipo
}

// ─────────────────────────────────────────────────────────────────────────────
// Create Modal
// ─────────────────────────────────────────────────────────────────────────────

function CreateCampaniaModal({ 
  open, 
  onOpenChange, 
  accountId,
  onSuccess 
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  accountId: string
  onSuccess: () => void
}) {
  const createMutation = useCreateCampania(accountId)
  const { data: basesData } = useLeadBasesList(accountId)
  
  const [formData, setFormData] = useState<CampaniaCreate>({
    nombre: "",
    descripcion: "",
    tipo_discador: "sin_discador",
    permite_llamada_manual: true,
    grabar_llamadas: false,
    prioridad: 5,
    base_ids: [],
    agente_ids: [],
  })
  
  const handleSubmit = async () => {
    if (!formData.nombre) return
    
    await createMutation.mutateAsync(formData)
    onSuccess()
  }
  
  const bases = basesData?.items || []
  
  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Nueva Campaña"
      wide
    >
      <div className="space-y-4">
        {/* Información básica */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nombre *</label>
            <input
              type="text"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              className="w-full rounded-lg border px-3 py-2"
              placeholder="Ej: Campaña Ventas Q1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Tipo de Discador</label>
            <select
              value={formData.tipo_discador}
              onChange={(e) => setFormData({ ...formData, tipo_discador: e.target.value as TipoDiscador })}
              className="w-full rounded-lg border px-3 py-2"
            >
              <option value="sin_discador">Manual (sin discador)</option>
              <option value="preview">Preview</option>
              <option value="progresivo">Progresivo</option>
              <option value="predictivo">Predictivo</option>
            </select>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Descripción</label>
          <textarea
            value={formData.descripcion}
            onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
            className="w-full rounded-lg border px-3 py-2"
            rows={2}
            placeholder="Descripción de la campaña..."
          />
        </div>
        
        {/* Opciones */}
        <div className="flex gap-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.permite_llamada_manual}
              onChange={(e) => setFormData({ ...formData, permite_llamada_manual: e.target.checked })}
              className="rounded"
            />
            <span className="text-sm">Permitir llamadas manuales</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.grabar_llamadas}
              onChange={(e) => setFormData({ ...formData, grabar_llamadas: e.target.checked })}
              className="rounded"
            />
            <span className="text-sm">Grabar llamadas</span>
          </label>
        </div>
        
        {/* Bases de datos */}
        <div>
          <label className="block text-sm font-medium mb-2">Bases de datos</label>
          <div className="border rounded-lg p-3 max-h-40 overflow-y-auto space-y-2">
            {bases.length === 0 ? (
              <p className="text-sm text-gray-500">No hay bases disponibles</p>
            ) : (
              bases.map((base: any) => (
                <label key={base.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.base_ids?.includes(base.id)}
                    onChange={(e) => {
                      const newIds = e.target.checked
                        ? [...(formData.base_ids || []), base.id]
                        : (formData.base_ids || []).filter((id: string) => id !== base.id)
                      setFormData({ ...formData, base_ids: newIds })
                    }}
                    className="rounded"
                  />
                  <span className="text-sm">{base.nombre}</span>
                </label>
              ))
            )}
          </div>
        </div>
        
        {/* Acciones */}
        <div className="flex gap-2 pt-4">
          <button
            onClick={() => onOpenChange(false)}
            className="flex-1 py-2 border rounded-lg"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={!formData.nombre || createMutation.isPending}
            className="flex-1 py-2 bg-primary text-white rounded-lg disabled:opacity-50"
          >
            {createMutation.isPending ? "Creando..." : "Crear Campaña"}
          </button>
        </div>
      </div>
    </Modal>
  )
}
