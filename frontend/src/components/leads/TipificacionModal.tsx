/**
 * Modal for assigning tipificacion to leads
 * Can be used for single or bulk lead tipification
 */
import { useState, useMemo } from "react"
import { Tags, AlertCircle, Check } from "lucide-react"
import { useAccount } from "@/context/AccountContext"
import { useTipificacionesList } from "@/hooks/useTipificaciones"
import { useUpdateLeadTipificacion, useBulkUpdateTipificacion } from "@/hooks/useTipificaciones"
import Modal from "@/components/ui/Modal"
import Badge from "@/components/ui/Badge"
import { cn } from "@/lib/utils"
import type { TipificacionResponse, SubtipificacionResponse } from "@/types"

interface TipificacionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  leadIds: string[]
  onSuccess?: () => void
}

export default function TipificacionModal({
  open,
  onOpenChange,
  leadIds,
  onSuccess,
}: TipificacionModalProps) {
  const { selectedAccount } = useAccount()
  const accountId = selectedAccount?.id ?? ""
  
  const { data, isLoading } = useTipificacionesList(accountId)
  const updateMutation = useUpdateLeadTipificacion(accountId)
  const bulkMutation = useBulkUpdateTipificacion(accountId)
  
  const [selectedTipId, setSelectedTipId] = useState<string>("")
  const [selectedSubId, setSelectedSubId] = useState<string>("")
  
  const tipificaciones = data?.items ?? []
  
  const selectedTip = useMemo(() => {
    return tipificaciones.find((t) => t.id === selectedTipId)
  }, [tipificaciones, selectedTipId])
  
  const availableSubs = useMemo(() => {
    if (!selectedTip || selectedTip.es_final) return []
    return selectedTip.subtipificaciones.filter((s) => s.activo)
  }, [selectedTip])
  
  const handleTipSelect = (tipId: string) => {
    setSelectedTipId(tipId)
    setSelectedSubId("") // Reset sub when tip changes
  }
  
  const handleSave = () => {
    if (!selectedTipId) return
    
    const tipificacionId = selectedTipId || null
    const subtipificacionId = selectedSubId || null
    
    if (leadIds.length === 1) {
      // Single lead update
      updateMutation.mutate(
        {
          leadId: leadIds[0],
          payload: { tipificacion_id: tipificacionId, subtipificacion_id: subtipificacionId },
        },
        {
          onSuccess: () => {
            onOpenChange(false)
            onSuccess?.()
          },
        }
      )
    } else {
      // Bulk update
      bulkMutation.mutate(
        { leadIds, tipificacionId, subtipificacionId },
        {
          onSuccess: () => {
            onOpenChange(false)
            onSuccess?.()
          },
        }
      )
    }
  }
  
  const isPending = updateMutation.isPending || bulkMutation.isPending
  const canSave = selectedTipId && (selectedTip?.es_final || selectedSubId || availableSubs.length === 0)
  
  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={
        <div className="flex items-center gap-2">
          <Tags className="h-5 w-5" />
          Tipificar {leadIds.length} {leadIds.length === 1 ? "Lead" : "Leads"}
        </div>
      }
    >
      <div className="space-y-4">
        {isLoading ? (
          <div className="py-8 text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto" />
            <p className="text-sm text-muted-foreground mt-2">Cargando tipificaciones...</p>
          </div>
        ) : tipificaciones.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border p-6 text-center">
            <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No hay tipificaciones configuradas</p>
            <p className="text-xs text-muted-foreground mt-1">
              Ve a Administración → Tipificaciones para crearlas
            </p>
          </div>
        ) : (
          <>
            {/* Tipificaciones */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Selecciona una tipificación
              </label>
              <div className="grid grid-cols-2 gap-2 max-h-[200px] overflow-y-auto">
                {tipificaciones
                  .filter((t) => t.activo)
                  .map((tip) => (
                    <button
                      key={tip.id}
                      onClick={() => handleTipSelect(tip.id)}
                      className={cn(
                        "flex items-center gap-2 p-3 rounded-lg border text-left transition-all",
                        selectedTipId === tip.id
                          ? "border-primary bg-primary/5 ring-1 ring-primary"
                          : "border-border hover:border-primary/50 hover:bg-gray-50"
                      )}
                    >
                      <div
                        className="w-4 h-4 rounded-full border border-gray-200 flex-shrink-0"
                        style={{ backgroundColor: tip.color }}
                      />
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">{tip.nombre}</p>
                        {tip.es_final && (
                          <Badge variant="info" className="text-[10px] px-1 py-0">
                            Final
                          </Badge>
                        )}
                      </div>
                      {selectedTipId === tip.id && (
                        <Check className="h-4 w-4 text-primary ml-auto flex-shrink-0" />
                      )}
                    </button>
                  ))}
              </div>
            </div>
            
            {/* Subtipificaciones */}
            {selectedTip && !selectedTip.es_final && availableSubs.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Selecciona una subtipificación (opcional)
                </label>
                <div className="grid grid-cols-2 gap-2 max-h-[150px] overflow-y-auto">
                  {availableSubs.map((sub) => (
                    <button
                      key={sub.id}
                      onClick={() => setSelectedSubId(selectedSubId === sub.id ? "" : sub.id)}
                      className={cn(
                        "flex items-center gap-2 p-2 rounded-lg border text-left transition-all",
                        selectedSubId === sub.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50 hover:bg-gray-50"
                      )}
                    >
                      <div
                        className="w-3 h-3 rounded-full border border-gray-200 flex-shrink-0"
                        style={{ backgroundColor: sub.color || selectedTip.color }}
                      />
                      <span className="text-sm truncate">{sub.nombre}</span>
                      {selectedSubId === sub.id && (
                        <Check className="h-3 w-3 text-primary ml-auto flex-shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {/* Info */}
            {selectedTip?.es_final && (
              <div className="flex items-start gap-2 rounded-lg bg-blue-50 p-3 text-sm text-blue-800">
                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <p>Esta es una categoría final y no permite subtipificaciones.</p>
              </div>
            )}
            
            {/* Preview */}
            {selectedTipId && (
              <div className="rounded-lg border border-border bg-gray-50 p-3">
                <p className="text-xs text-muted-foreground mb-1">Se asignará:</p>
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: selectedTip?.color }}
                  />
                  <span className="font-medium">{selectedTip?.nombre}</span>
                  {selectedSubId && selectedTip && (
                    <>
                      <span className="text-muted-foreground">→</span>
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{
                          backgroundColor:
                            selectedTip.subtipificaciones.find((s) => s.id === selectedSubId)
                              ?.color || selectedTip.color,
                        }}
                      />
                      <span>
                        {selectedTip.subtipificaciones.find((s) => s.id === selectedSubId)?.nombre}
                      </span>
                    </>
                  )}
                </div>
              </div>
            )}
          </>
        )}
        
        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={() => onOpenChange(false)}
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={!canSave || isPending}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {isPending
              ? "Guardando..."
              : `Guardar ${leadIds.length > 1 ? `(${leadIds.length})` : ""}`}
          </button>
        </div>
      </div>
    </Modal>
  )
}
