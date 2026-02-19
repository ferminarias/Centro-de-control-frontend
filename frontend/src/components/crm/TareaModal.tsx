import { useState } from "react";
import { Phone, Mail, Calendar, FileText, Bell } from "lucide-react";
import Modal from "@/components/ui/Modal";
import { cn } from "@/lib/utils";
import type { TareaCreate } from "@/types";

interface TareaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leadId?: string;
  onSubmit: (data: TareaCreate) => void;
  isPending?: boolean;
}

const TIPOS_TAREA = [
  { id: "general", label: "General", icon: FileText },
  { id: "llamar", label: "Llamar", icon: Phone },
  { id: "email", label: "Enviar email", icon: Mail },
  { id: "reunion", label: "Reunión", icon: Calendar },
  { id: "recordatorio", label: "Recordatorio", icon: Bell },
];

const PRIORIDADES = [
  { id: "baja", label: "Baja", color: "bg-gray-100 text-gray-700" },
  { id: "media", label: "Media", color: "bg-yellow-100 text-yellow-700" },
  { id: "alta", label: "Alta", color: "bg-orange-100 text-orange-700" },
  { id: "urgente", label: "Urgente", color: "bg-red-100 text-red-700" },
];

export default function TareaModal({
  open,
  onOpenChange,
  leadId,
  onSubmit,
  isPending,
}: TareaModalProps) {
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [tipo, setTipo] = useState("general");
  const [prioridad, setPrioridad] = useState<"baja" | "media" | "alta" | "urgente">("media");
  const [fechaVencimiento, setFechaVencimiento] = useState("");
  const [esRecurrente, setEsRecurrente] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      lead_id: leadId,
      titulo,
      descripcion: descripcion || undefined,
      tipo,
      prioridad,
      fecha_vencimiento: fechaVencimiento || undefined,
      es_recurrente: esRecurrente,
    });
    // Reset
    setTitulo("");
    setDescripcion("");
    setTipo("general");
    setPrioridad("media");
    setFechaVencimiento("");
    setEsRecurrente(false);
    onOpenChange(false);
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange} title="Nueva Tarea">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Título */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Título *
          </label>
          <input
            type="text"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder="Ej: Llamar a cliente para seguimiento"
            required
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
            placeholder="Detalles de la tarea..."
            rows={2}
            className="w-full rounded-lg border border-border bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
          />
        </div>

        {/* Tipo */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Tipo
          </label>
          <div className="flex flex-wrap gap-2">
            {TIPOS_TAREA.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTipo(t.id)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all border",
                  tipo === t.id
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border hover:border-primary/50"
                )}
              >
                <t.icon className="h-4 w-4" />
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Prioridad */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Prioridad
          </label>
          <div className="flex flex-wrap gap-2">
            {PRIORIDADES.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPrioridad(p.id as typeof prioridad)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-sm font-medium transition-all",
                  prioridad === p.id ? p.color : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Fecha de vencimiento */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Fecha de vencimiento
          </label>
          <input
            type="datetime-local"
            value={fechaVencimiento}
            onChange={(e) => setFechaVencimiento(e.target.value)}
            className="w-full rounded-lg border border-border bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* Recurrente */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="esRecurrente"
            checked={esRecurrente}
            onChange={(e) => setEsRecurrente(e.target.checked)}
            className="rounded border-gray-300 text-primary focus:ring-primary"
          />
          <label htmlFor="esRecurrente" className="text-sm text-foreground">
            Es tarea recurrente
          </label>
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
            disabled={isPending || !titulo}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50"
          >
            {isPending ? "Creando..." : "Crear Tarea"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
