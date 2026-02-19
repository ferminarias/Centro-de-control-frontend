import { useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Phone,
  Mail,
  Calendar,
  FileText,
  Bell,
  CheckCircle2,
  Circle,
  Clock,
  AlertCircle,
  MoreVertical,
  Trash2,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { TareaResponse } from "@/types";

interface TareaItemProps {
  tarea: TareaResponse;
  onToggleComplete: (id: string, completed: boolean) => void;
  onDelete: (id: string) => void;
  isPending?: boolean;
}

const TIPO_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  general: FileText,
  llamar: Phone,
  email: Mail,
  reunion: Calendar,
  recordatorio: Bell,
};

const PRIORIDAD_COLORS: Record<string, string> = {
  baja: "bg-gray-100 text-gray-700",
  media: "bg-yellow-100 text-yellow-700",
  alta: "bg-orange-100 text-orange-700",
  urgente: "bg-red-100 text-red-700",
};

const ESTADO_COLORS: Record<string, string> = {
  pendiente: "text-gray-500",
  en_progreso: "text-blue-500",
  completada: "text-green-500",
  cancelada: "text-gray-400",
  vencida: "text-red-500",
};

export default function TareaItem({
  tarea,
  onToggleComplete,
  onDelete,
  isPending,
}: TareaItemProps) {
  const [showMenu, setShowMenu] = useState(false);
  
  const Icon = TIPO_ICONS[tarea.tipo] || FileText;
  const isCompleted = tarea.estado === "completada";
  const isVencida = tarea.estado === "vencida" || (
    tarea.fecha_vencimiento && 
    new Date(tarea.fecha_vencimiento) < new Date() && 
    tarea.estado !== "completada"
  );

  const handleToggle = () => {
    onToggleComplete(tarea.id, !isCompleted);
  };

  return (
    <div
      className={cn(
        "group flex items-start gap-3 p-3 rounded-lg border transition-all",
        isCompleted
          ? "bg-gray-50 border-gray-200 opacity-70"
          : "bg-white border-gray-200 hover:border-primary/30 hover:shadow-sm",
        isVencida && !isCompleted && "border-red-200 bg-red-50/30"
      )}
    >
      {/* Checkbox */}
      <button
        type="button"
        onClick={handleToggle}
        disabled={isPending}
        className={cn(
          "mt-0.5 shrink-0 transition-colors",
          isCompleted ? "text-green-500" : "text-gray-400 hover:text-primary"
        )}
      >
        {isCompleted ? (
          <CheckCircle2 className="h-5 w-5" />
        ) : (
          <Circle className="h-5 w-5" />
        )}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <Icon className={cn("h-4 w-4", isCompleted ? "text-gray-400" : "text-gray-500")} />
              <span className={cn(
                "font-medium text-sm",
                isCompleted && "line-through text-gray-500"
              )}>
                {tarea.titulo}
              </span>
            </div>
            
            {tarea.descripcion && (
              <p className={cn(
                "text-sm mt-0.5 line-clamp-2",
                isCompleted ? "text-gray-400" : "text-gray-600"
              )}>
                {tarea.descripcion}
              </p>
            )}
            
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              {/* Prioridad badge */}
              <span className={cn(
                "text-xs px-2 py-0.5 rounded-full font-medium",
                PRIORIDAD_COLORS[tarea.prioridad]
              )}>
                {tarea.prioridad}
              </span>
              
              {/* Estado badge */}
              <span className={cn("text-xs flex items-center gap-1", ESTADO_COLORS[tarea.estado])}>
                {tarea.estado === "completada" && <Check className="h-3 w-3" />}
                {tarea.estado === "pendiente" && <Clock className="h-3 w-3" />}
                {tarea.estado === "vencida" && <AlertCircle className="h-3 w-3" />}
                {tarea.estado}
              </span>
              
              {/* Due date */}
              {tarea.fecha_vencimiento && (
                <span className={cn(
                  "text-xs flex items-center gap-1",
                  isVencida && !isCompleted ? "text-red-600 font-medium" : "text-gray-500"
                )}>
                  <Clock className="h-3 w-3" />
                  {format(new Date(tarea.fecha_vencimiento), "dd MMM HH:mm", { locale: es })}
                  {isVencida && !isCompleted && " (vencida)"}
                </span>
              )}
              
              {/* Lead name */}
              {tarea.lead_nombre && (
                <span className="text-xs text-gray-500">
                  • {tarea.lead_nombre}
                </span>
              )}
            </div>
          </div>

          {/* Actions menu */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowMenu(!showMenu)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreVertical className="h-4 w-4" />
            </button>
            
            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute right-0 top-full mt-1 w-36 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                  <button
                    type="button"
                    onClick={() => {
                      onDelete(tarea.id);
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                    Eliminar
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
