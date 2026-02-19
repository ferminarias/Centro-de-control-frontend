import { useState } from "react";
import { Lock, Eye } from "lucide-react";
import Modal from "@/components/ui/Modal";
import { cn } from "@/lib/utils";
import type { NotaCreate } from "@/types";

interface NotaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: NotaCreate) => void;
  isPending?: boolean;
}

export default function NotaModal({
  open,
  onOpenChange,
  onSubmit,
  isPending,
}: NotaModalProps) {
  const [contenido, setContenido] = useState("");
  const [tipo, setTipo] = useState<"general" | "llamada" | "reunion" | "email">("general");
  const [esPrivada, setEsPrivada] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contenido.trim()) return;
    
    onSubmit({
      contenido,
      tipo,
      es_privada: esPrivada,
    });
    // Reset
    setContenido("");
    setTipo("general");
    setEsPrivada(false);
    onOpenChange(false);
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange} title="Nueva Nota">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Tipo de nota */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Tipo de nota
          </label>
          <div className="flex gap-2">
            {[
              { id: "general", label: "General" },
              { id: "llamada", label: "Llamada" },
              { id: "reunion", label: "Reunión" },
              { id: "email", label: "Email" },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTipo(t.id as typeof tipo)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-sm transition-all border",
                  tipo === t.id
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border hover:border-primary/50"
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Contenido */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Contenido *
          </label>
          <textarea
            value={contenido}
            onChange={(e) => setContenido(e.target.value)}
            placeholder="Escribe tu nota aquí..."
            rows={5}
            required
            className="w-full rounded-lg border border-border bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
          />
        </div>

        {/* Privada/Pública */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Visibilidad
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setEsPrivada(false)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all border flex-1",
                !esPrivada
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-border hover:border-primary/50"
              )}
            >
              <Eye className="h-4 w-4" />
              Pública (todos la ven)
            </button>
            <button
              type="button"
              onClick={() => setEsPrivada(true)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all border flex-1",
                esPrivada
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-border hover:border-primary/50"
              )}
            >
              <Lock className="h-4 w-4" />
              Privada (solo admins)
            </button>
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
            disabled={isPending || !contenido.trim()}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50"
          >
            {isPending ? "Guardando..." : "Guardar Nota"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
