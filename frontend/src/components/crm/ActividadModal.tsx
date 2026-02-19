import { useState } from "react";
import { Phone, Mail, Calendar, MessageSquare, FileText } from "lucide-react";
import Modal from "@/components/ui/Modal";
import { cn } from "@/lib/utils";
import type { ActividadCreate } from "@/types";

interface ActividadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leadId: string;
  onSubmit: (data: ActividadCreate) => void;
  isPending?: boolean;
}

const TIPOS_ACTIVIDAD = [
  { id: "llamada", label: "Llamada", icon: Phone, color: "bg-blue-100 text-blue-700" },
  { id: "email", label: "Email", icon: Mail, color: "bg-purple-100 text-purple-700" },
  { id: "reunion", label: "Reunión", icon: Calendar, color: "bg-green-100 text-green-700" },
  { id: "whatsapp", label: "WhatsApp", icon: MessageSquare, color: "bg-green-100 text-green-600" },
  { id: "nota", label: "Nota", icon: FileText, color: "bg-gray-100 text-gray-700" },
];

const RESULTADOS = [
  { id: "contestado", label: "Contestado" },
  { id: "no_contestado", label: "No contestado" },
  { id: "buzon_voz", label: "Buzón de voz" },
  { id: "reunion_agendada", label: "Reunión agendada" },
  { id: "interesado", label: "Interesado" },
  { id: "no_interesado", label: "No interesado" },
  { id: "seguimiento", label: "Requiere seguimiento" },
];

export default function ActividadModal({
  open,
  onOpenChange,
  leadId,
  onSubmit,
  isPending,
}: ActividadModalProps) {
  const [tipo, setTipo] = useState("llamada");
  const [direccion, setDireccion] = useState<"entrada" | "salida">("salida");
  const [asunto, setAsunto] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [resultado, setResultado] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      lead_id: leadId,
      tipo,
      direccion,
      asunto: asunto || undefined,
      descripcion: descripcion || undefined,
      resultado: resultado || undefined,
      fecha_inicio: new Date().toISOString(),
    });
    // Reset
    setAsunto("");
    setDescripcion("");
    setResultado("");
    onOpenChange(false);
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange} title="Registrar Actividad">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Tipo de actividad */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Tipo de actividad
          </label>
          <div className="grid grid-cols-3 gap-2">
            {TIPOS_ACTIVIDAD.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTipo(t.id)}
                className={cn(
                  "flex items-center gap-2 p-2 rounded-lg border text-sm transition-all",
                  tipo === t.id
                    ? "border-primary bg-primary/5 ring-1 ring-primary"
                    : "border-border hover:border-primary/50"
                )}
              >
                <t.icon className="h-4 w-4" />
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Dirección */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Dirección
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setDireccion("salida")}
              className={cn(
                "flex-1 py-2 px-4 rounded-lg border text-sm transition-all",
                direccion === "salida"
                  ? "border-primary bg-primary text-white"
                  : "border-border hover:border-primary/50"
              )}
            >
              Salida (Realicé yo)
            </button>
            <button
              type="button"
              onClick={() => setDireccion("entrada")}
              className={cn(
                "flex-1 py-2 px-4 rounded-lg border text-sm transition-all",
                direccion === "entrada"
                  ? "border-primary bg-primary text-white"
                  : "border-border hover:border-primary/50"
              )}
            >
              Entrada (Recibí)
            </button>
          </div>
        </div>

        {/* Asunto */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Asunto
          </label>
          <input
            type="text"
            value={asunto}
            onChange={(e) => setAsunto(e.target.value)}
            placeholder="Ej: Llamada de seguimiento"
            className="w-full rounded-lg border border-border bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* Descripción */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Descripción
          </label>
          <textarea
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder="Detalles de la actividad..."
            rows={3}
            className="w-full rounded-lg border border-border bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
          />
        </div>

        {/* Resultado */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Resultado
          </label>
          <div className="flex flex-wrap gap-2">
            {RESULTADOS.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setResultado(r.id)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-sm transition-all",
                  resultado === r.id
                    ? "bg-primary text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                )}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50"
          >
            {isPending ? "Guardando..." : "Guardar Actividad"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
