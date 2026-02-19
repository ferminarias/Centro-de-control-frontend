import { useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  CheckSquare,
  Clock,
  AlertCircle,
  Calendar,
  Plus,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTareas, useTareasStats, useCreateTarea } from "@/hooks";
import { useAuth } from "@/hooks/useAuth";
import { TareaModal } from "./";
import type { TareaResponse } from "@/types";

interface TareasWidgetProps {
  className?: string;
}

export default function TareasWidget({ className }: TareasWidgetProps) {
  const [showModal, setShowModal] = useState(false);
  const { user, isLoading: isLoadingUser } = useAuth();
  const accountId = user?.cuenta_id;
  
  const { data: stats, isLoading: isLoadingStats } = useTareasStats(accountId);
  const { data: tareasData, isLoading: isLoadingTareas } = useTareas(
    accountId,
    {
      estado: "pendiente",
      page_size: 5,
    }
  );
  const { mutate: createTarea, isPending: isCreating } = useCreateTarea(accountId || "");

  const tareas = tareasData?.items || [];

  const statCards = [
    {
      label: "Pendientes",
      value: stats?.pendientes || 0,
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
    },
    {
      label: "Vencidas",
      value: stats?.vencidas || 0,
      icon: AlertCircle,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
    {
      label: "Hoy",
      value: stats?.completadas_hoy || 0,
      icon: CheckSquare,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
  ];

  if (isLoadingUser || !accountId) {
    return <div className="text-sm text-gray-500">Cargando...</div>;
  }

  return (
    <div className={cn("bg-white rounded-lg border", className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <div className="flex items-center gap-2">
          <CheckSquare className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Mis Tareas</h3>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1 text-sm text-primary hover:underline"
        >
          <Plus className="h-4 w-4" />
          Nueva
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 p-4 border-b">
        {isLoadingStats ? (
          <>
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
            ))}
          </>
        ) : (
          statCards.map((stat) => (
            <div
              key={stat.label}
              className={cn(
                "flex flex-col items-center justify-center p-3 rounded-lg",
                stat.bgColor
              )}
            >
              <stat.icon className={cn("h-5 w-5 mb-1", stat.color)} />
              <span className="text-2xl font-bold">{stat.value}</span>
              <span className="text-xs text-gray-600">{stat.label}</span>
            </div>
          ))
        )}
      </div>

      {/* Lista de tareas pendientes */}
      <div className="p-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">
          Próximas tareas
        </h4>
        
        {isLoadingTareas ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />
            ))}
          </div>
        ) : tareas.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">
            No tienes tareas pendientes
          </p>
        ) : (
          <div className="space-y-2">
            {tareas.map((tarea) => (
              <TareaRow key={tarea.id} tarea={tarea} />
            ))}
          </div>
        )}
        
        {/* Ver todas */}
        <button className="w-full mt-3 flex items-center justify-center gap-1 text-sm text-primary hover:underline py-2">
          Ver todas
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      <TareaModal
        open={showModal}
        onOpenChange={setShowModal}
        onSubmit={createTarea}
        isPending={isCreating}
      />
    </div>
  );
}

function TareaRow({ tarea }: { tarea: TareaResponse }) {
  const isVencida =
    tarea.fecha_vencimiento &&
    new Date(tarea.fecha_vencimiento) < new Date() &&
    tarea.estado !== "completada";

  return (
    <div
      className={cn(
        "flex items-center gap-3 p-2 rounded-lg border transition-colors",
        isVencida ? "border-red-200 bg-red-50/30" : "border-gray-100 hover:bg-gray-50"
      )}
    >
      <div
        className={cn(
          "w-2 h-2 rounded-full shrink-0",
          tarea.prioridad === "urgente" && "bg-red-500",
          tarea.prioridad === "alta" && "bg-orange-500",
          tarea.prioridad === "media" && "bg-yellow-500",
          tarea.prioridad === "baja" && "bg-gray-400"
        )}
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{tarea.titulo}</p>
        {tarea.fecha_vencimiento && (
          <p
            className={cn(
              "text-xs flex items-center gap-1",
              isVencida ? "text-red-600" : "text-gray-500"
            )}
          >
            <Calendar className="h-3 w-3" />
            {format(new Date(tarea.fecha_vencimiento), "dd MMM", { locale: es })}
            {isVencida && " (vencida)"}
          </p>
        )}
      </div>
      {tarea.lead_nombre && (
        <span className="text-xs text-gray-400 truncate max-w-[100px]">
          {tarea.lead_nombre}
        </span>
      )}
    </div>
  );
}
