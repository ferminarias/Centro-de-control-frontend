/**
 * Página de Gestión de Contactos (Contact Center)
 * Pantalla principal para agentes donde reciben fichas y las gestionan
 */
import { useState, useEffect } from "react"

import { 
  Phone, PhoneOff, Clock, User, FileText, Tag, 
  ChevronRight, Save, SkipForward, History
} from "lucide-react"
import { useAccount } from "@/context/AccountContext"
import { 
  useEntrarCampania, 
  useSolicitarFicha, 
  useGestionarFicha,
  useSaltarFicha,
  useTipificacionesList 
} from "@/hooks"
import { useCampaniasList } from "@/hooks/useCampanias"
import Modal from "@/components/ui/Modal"
import Badge from "@/components/ui/Badge"
import { cn } from "@/lib/utils"
import type { Ficha } from "@/types/campania"
import type { FichaCampoConfig } from "@/types/fichaConfig"

interface Props {
  campaniaId?: string
}

export default function GestionContactos({ campaniaId: initialCampaniaId }: Props) {
  const { selectedAccount } = useAccount()
  const [selectedCampaniaId, setSelectedCampaniaId] = useState<string | null>(
    initialCampaniaId || null
  )
  const [hasEntered, setHasEntered] = useState(false)
  const [ficha, setFicha] = useState<Ficha | null>(null)
  const [isLoadingFicha, setIsLoadingFicha] = useState(false)
  
  // Form de gestión
  const [tipificacionId, setTipificacionId] = useState("")
  const [subtipificacionId, setSubtipificacionId] = useState("")
  const [notas, setNotas] = useState("")
  const [showSkipModal, setShowSkipModal] = useState(false)
  const [motivoSalto, setMotivoSalto] = useState("")
  
  const { data: campanias } = useCampaniasList(selectedAccount?.id)
  const entrarMutation = useEntrarCampania()
  const solicitarMutation = useSolicitarFicha(selectedCampaniaId || "")
  const gestionarMutation = useGestionarFicha(selectedCampaniaId || "")
  const saltarMutation = useSaltarFicha(selectedCampaniaId || "")
  const { data: tipificacionesData } = useTipificacionesList(selectedAccount?.id, false)
  
  const tipificaciones = tipificacionesData?.items || []
  const tipificacionSeleccionada = tipificaciones.find(t => t.id === tipificacionId)
  
  // Entrar a la campaña
  const handleEntrar = async () => {
    if (!selectedCampaniaId) return
    try {
      await entrarMutation.mutateAsync(selectedCampaniaId)
      setHasEntered(true)
      solicitarFicha()
    } catch (error) {
      // Error ya manejado en el hook
    }
  }
  
  // Solicitar ficha
  const solicitarFicha = async () => {
    setIsLoadingFicha(true)
    try {
      const result = await solicitarMutation.mutateAsync()
      if (result.ficha) {
        setFicha(result.ficha)
        // Reset form
        setTipificacionId("")
        setSubtipificacionId("")
        setNotas("")
      } else {
        setFicha(null)
      }
    } finally {
      setIsLoadingFicha(false)
    }
  }
  
  // Guardar gestión
  const handleGuardar = async () => {
    if (!ficha || !tipificacionId) return
    
    await gestionarMutation.mutateAsync({
      colaId: ficha.cola_id,
      payload: {
        tipificacion_id: tipificacionId,
        subtipificacion_id: subtipificacionId || undefined,
        notas: notas || undefined,
        resultado_llamada: "contestado",
      }
    })
    
    // Solicitar siguiente ficha
    solicitarFicha()
  }
  
  // Saltar ficha
  const handleSaltar = async () => {
    if (!ficha || !motivoSalto) return
    
    await saltarMutation.mutateAsync({
      colaId: ficha.cola_id,
      motivo: motivoSalto
    })
    
    setShowSkipModal(false)
    setMotivoSalto("")
    solicitarFicha()
  }
  
  // Si no ha seleccionado campaña, mostrar selector
  if (!hasEntered) {
    return (
      <SelectorCampania
        campanias={campanias?.items || []}
        selectedId={selectedCampaniaId}
        onSelect={setSelectedCampaniaId}
        onEntrar={handleEntrar}
        isLoading={entrarMutation.isPending}
      />
    )
  }
  
  // Si no hay ficha, mostrar pantalla de espera
  if (!ficha && !isLoadingFicha) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh]">
        <div className="text-center space-y-4">
          <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto">
            <PhoneOff className="h-8 w-8 text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold">No hay fichas disponibles</h2>
          <p className="text-gray-500 max-w-md">
            En este momento no hay leads pendientes para gestionar. 
            Puedes esperar o solicitar nuevamente.
          </p>
          <button
            onClick={solicitarFicha}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
          >
            Buscar ficha
          </button>
        </div>
      </div>
    )
  }
  
  // Pantalla de gestión de ficha
  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      {/* Header de la ficha */}
      <div className="bg-white border-b px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <Badge variant="info">Ficha #{ficha?.lead_id.slice(0, 8)}</Badge>
          <span className="text-sm text-gray-500">
            Campaña: {ficha?.campania_nombre}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <Clock className="h-4 w-4" />
            <Timer />
          </div>
        </div>
      </div>
      
      {/* Contenido principal */}
      <div className="flex-1 overflow-hidden flex">
        {/* Panel izquierdo: Datos del contacto */}
        <div className="w-1/2 border-r overflow-y-auto p-4">
          <DatosContacto lead={ficha?.lead} fichaConfig={ficha?.ficha_config?.campos} />
        </div>
        
        {/* Panel derecho: Gestión */}
        <div className="w-1/2 flex flex-col">
          {/* Área de tipificación */}
          <div className="flex-1 p-4 space-y-4 overflow-y-auto">
            <div className="border rounded-lg p-4 space-y-4">
              <h3 className="font-medium flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Tipificación *
              </h3>
              
              {/* Selector de tipificación */}
              <div className="space-y-2">
                <label className="text-sm text-gray-600">Categoría</label>
                <select
                  value={tipificacionId}
                  onChange={(e) => {
                    setTipificacionId(e.target.value)
                    setSubtipificacionId("")
                  }}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2"
                >
                  <option value="">Seleccionar...</option>
                  {tipificaciones.map((tip) => (
                    <option key={tip.id} value={tip.id}>
                      {tip.nombre}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Selector de subtipificación */}
              {tipificacionSeleccionada && tipificacionSeleccionada.subtipificaciones.length > 0 && (
                <div className="space-y-2">
                  <label className="text-sm text-gray-600">Subcategoría</label>
                  <select
                    value={subtipificacionId}
                    onChange={(e) => setSubtipificacionId(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2"
                  >
                    <option value="">Seleccionar...</option>
                    {tipificacionSeleccionada.subtipificaciones.map((sub) => (
                      <option key={sub.id} value={sub.id}>
                        {sub.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            
            {/* Notas */}
            <div className="border rounded-lg p-4 space-y-2">
              <h3 className="font-medium flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Notas de la gestión
              </h3>
              <textarea
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                placeholder="Ingresa las notas de tu conversación..."
                rows={5}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 resize-none"
              />
            </div>
          </div>
          
          {/* Barra de acciones */}
          <div className="border-t p-4 space-y-3 shrink-0">
            <button
              onClick={handleGuardar}
              disabled={!tipificacionId || gestionarMutation.isPending}
              className={cn(
                "w-full py-3 rounded-lg font-medium flex items-center justify-center gap-2",
                tipificacionId
                  ? "bg-green-600 text-white hover:bg-green-700"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              )}
            >
              <Save className="h-5 w-5" />
              {gestionarMutation.isPending ? "Guardando..." : "Guardar y siguiente"}
            </button>
            
            <div className="flex gap-2">
              <button
                onClick={() => setShowSkipModal(true)}
                className="flex-1 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2"
              >
                <SkipForward className="h-4 w-4" />
                Saltar ficha
              </button>
              <button
                className="flex-1 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2"
              >
                <History className="h-4 w-4" />
                Ver historial
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Modal para saltar ficha */}
      <Modal
        open={showSkipModal}
        onOpenChange={setShowSkipModal}
        title="Saltar ficha"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Debes indicar el motivo para saltar esta ficha. El lead volverá a la cola.
          </p>
          <textarea
            value={motivoSalto}
            onChange={(e) => setMotivoSalto(e.target.value)}
            placeholder="Motivo..."
            className="w-full rounded-lg border border-gray-200 px-3 py-2"
            rows={3}
          />
          <div className="flex gap-2">
            <button
              onClick={() => setShowSkipModal(false)}
              className="flex-1 py-2 border rounded-lg"
            >
              Cancelar
            </button>
            <button
              onClick={handleSaltar}
              disabled={!motivoSalto || saltarMutation.isPending}
              className="flex-1 py-2 bg-primary text-white rounded-lg disabled:opacity-50"
            >
              Confirmar
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-componentes
// ─────────────────────────────────────────────────────────────────────────────

function SelectorCampania({ 
  campanias, 
  selectedId, 
  onSelect, 
  onEntrar,
  isLoading 
}: {
  campanias: any[]
  selectedId: string | null
  onSelect: (id: string) => void
  onEntrar: () => void
  isLoading: boolean
}) {
  // Mostrar campañas activas o pausadas (no borradores ni finalizadas)
  const disponibles = campanias.filter(c => c.estado === "activa" || c.estado === "pausada")
  
  return (
    <div className="flex flex-col items-center justify-center h-[70vh]">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Gestión de Contactos</h1>
          <p className="text-gray-500">Selecciona la campaña a la que deseas entrar</p>
        </div>
        
        <div className="space-y-2">
          {disponibles.length === 0 ? (
            <div className="text-center p-8 border rounded-lg bg-gray-50">
              <p className="text-gray-500">No hay campañas disponibles</p>
              <p className="text-sm text-gray-400 mt-1">
                Las campañas deben estar activas o pausadas para poder entrar
              </p>
            </div>
          ) : (
            disponibles.map((camp) => (
              <button
                key={camp.id}
                onClick={() => onSelect(camp.id)}
                className={cn(
                  "w-full p-4 border rounded-lg text-left transition-colors",
                  selectedId === camp.id
                    ? "border-primary bg-primary/5"
                    : "border-gray-200 hover:border-gray-300"
                )}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{camp.nombre}</h3>
                    <p className="text-sm text-gray-500">
                      {camp.tipo_discador === "sin_discador" && "Discador Manual"}
                      {camp.tipo_discador === "preview" && "Preview"}
                      {camp.tipo_discador === "progresivo" && "Progresivo"}
                      {camp.tipo_discador === "predictivo" && "Predictivo"}
                      {" • "}
                      {camp.leads_en_cola} leads en cola
                    </p>
                  </div>
                  {selectedId === camp.id && (
                    <ChevronRight className="h-5 w-5 text-primary" />
                  )}
                </div>
              </button>
            ))
          )}
        </div>
        
        <button
          onClick={onEntrar}
          disabled={!selectedId || isLoading}
          className="w-full py-3 bg-primary text-white rounded-lg font-medium disabled:opacity-50"
        >
          {isLoading ? "Entrando..." : "Entrar a la campaña"}
        </button>
      </div>
    </div>
  )
}

function DatosContacto({ lead, fichaConfig }: { lead?: Ficha["lead"]; fichaConfig?: FichaCampoConfig[] }) {
  if (!lead) return null

  const datos = lead.datos || {}

  // If we have a config, render config-driven layout
  if (fichaConfig && fichaConfig.length > 0) {
    const visible = fichaConfig
      .filter((c) => c.visible)
      .sort((a, b) => a.orden - b.orden)

    const headerCampos = visible.filter((c) => c.seccion === "header")
    const telefonosCampos = visible.filter((c) => c.seccion === "telefonos")
    const datosCampos = visible.filter((c) => c.seccion === "datos")

    return (
      <div className="space-y-6">
        {/* Header section */}
        {headerCampos.length > 0 && (
          <div className="flex items-center gap-3 pb-4 border-b">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div>
              {headerCampos.map((campo, i) => (
                i === 0 ? (
                  <h2 key={campo.key} className="text-xl font-semibold">
                    {datos[campo.key] ?? "—"}
                  </h2>
                ) : (
                  <p key={campo.key} className="text-sm text-gray-500">
                    {datos[campo.key] ?? "—"}
                  </p>
                )
              ))}
            </div>
          </div>
        )}

        {/* Telefonos section */}
        {telefonosCampos.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-medium text-sm text-gray-600 uppercase">Teléfonos</h3>
            <div className="space-y-2">
              {telefonosCampos.map((campo) => {
                const val = datos[campo.key]
                if (!val) return null
                return (
                  <a
                    key={campo.key}
                    href={`tel:${val}`}
                    className="flex items-center gap-2 p-3 border rounded-lg hover:bg-gray-50"
                  >
                    <Phone className="h-5 w-5 text-green-600" />
                    <span className="flex-1">{val}</span>
                    <Badge variant="success">{campo.label}</Badge>
                  </a>
                )
              })}
            </div>
          </div>
        )}

        {/* Datos section */}
        {datosCampos.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-medium text-sm text-gray-600 uppercase">Datos del contacto</h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              {datosCampos.map((campo) => (
                <div key={campo.key} className="flex justify-between py-1 border-b border-gray-100 last:border-0">
                  <span className="text-sm text-gray-600">{campo.label}</span>
                  <span className="text-sm font-medium">{datos[campo.key] != null ? String(datos[campo.key]) : "—"}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Última gestión */}
        {lead.tipificacion && (
          <div className="space-y-2">
            <h3 className="font-medium text-sm text-gray-600 uppercase">Última gestión</h3>
            <div className="p-3 bg-blue-50 rounded-lg">
              <span
                className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
                style={{
                  backgroundColor: lead.tipificacion.color + "20",
                  color: lead.tipificacion.color
                }}
              >
                {lead.tipificacion.nombre}
              </span>
              {lead.subtipificacion && (
                <span className="text-sm text-gray-600 ml-2">
                  {lead.subtipificacion.nombre}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    )
  }

  // Fallback: no config → show everything (original behavior)
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 pb-4 border-b">
        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
          <User className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">
            {datos.nombre || datos.Nombre || "Sin nombre"}
          </h2>
          <p className="text-sm text-gray-500">
            {datos.email || datos.Email || "Sin email"}
          </p>
        </div>
      </div>

      {/* Teléfonos */}
      <div className="space-y-2">
        <h3 className="font-medium text-sm text-gray-600 uppercase">Teléfonos</h3>
        <div className="space-y-2">
          {datos.telefono && (
            <a
              href={`tel:${datos.telefono}`}
              className="flex items-center gap-2 p-3 border rounded-lg hover:bg-gray-50"
            >
              <Phone className="h-5 w-5 text-green-600" />
              <span className="flex-1">{datos.telefono}</span>
              <Badge variant="success">Llamar</Badge>
            </a>
          )}
          {datos.movil && datos.movil !== datos.telefono && (
            <a
              href={`tel:${datos.movil}`}
              className="flex items-center gap-2 p-3 border rounded-lg hover:bg-gray-50"
            >
              <Phone className="h-5 w-5 text-blue-600" />
              <span className="flex-1">{datos.movil}</span>
              <Badge>Móvil</Badge>
            </a>
          )}
        </div>
      </div>

      {/* Datos del lead */}
      <div className="space-y-2">
        <h3 className="font-medium text-sm text-gray-600 uppercase">Datos del contacto</h3>
        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
          {Object.entries(datos)
            .filter(([key]) => !["nombre", "Nombre", "email", "Email", "telefono", "Telefono", "movil", "Movil"].includes(key))
            .map(([key, value]) => (
              <div key={key} className="flex justify-between py-1 border-b border-gray-100 last:border-0">
                <span className="text-sm text-gray-600">{key}</span>
                <span className="text-sm font-medium">{String(value)}</span>
              </div>
            ))}
        </div>
      </div>

      {/* Historial (si existe) */}
      {lead.tipificacion && (
        <div className="space-y-2">
          <h3 className="font-medium text-sm text-gray-600 uppercase">Última gestión</h3>
          <div className="p-3 bg-blue-50 rounded-lg">
            <span
              className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
              style={{
                backgroundColor: lead.tipificacion.color + "20",
                color: lead.tipificacion.color
              }}
            >
              {lead.tipificacion.nombre}
            </span>
            {lead.subtipificacion && (
              <span className="text-sm text-gray-600 ml-2">
                {lead.subtipificacion.nombre}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function Timer() {
  const [seconds, setSeconds] = useState(0)
  
  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds(s => s + 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [])
  
  const mins = Math.floor(seconds / 60).toString().padStart(2, "0")
  const secs = (seconds % 60).toString().padStart(2, "0")
  
  return <span>{mins}:{secs}</span>
}
