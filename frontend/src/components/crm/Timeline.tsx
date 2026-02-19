import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Phone,
  Mail,
  Calendar,
  MessageSquare,
  FileText,
  RefreshCw,
  CheckCircle2,
  User,
  Tag,
  ArrowUpRight,
  ArrowDownLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ActividadResponse, NotaResponse, TareaResponse } from "@/types";

interface TimelineItem {
  tipo: "actividad" | "nota" | "tarea" | "estado";
  fecha: string;
  data: ActividadResponse | NotaResponse | TareaResponse | any;
}

interface TimelineProps {
  items: TimelineItem[];
  isLoading?: boolean;
}

const TIPO_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  llamada: Phone,
  email: Mail,
  reunion: Calendar,
  whatsapp: MessageSquare,
  sms: MessageSquare,
  nota: FileText,
  cambio_estado: RefreshCw,
  system: User,
  general: FileText,
  tarea: CheckCircle2,
};

const TIPO_COLORS: Record<string, string> = {
  llamada: "bg-blue-500",
  email: "bg-purple-500",
  reunion: "bg-green-500",
  whatsapp: "bg-green-600",
  sms: "bg-yellow-500",
  nota: "bg-gray-500",
  cambio_estado: "bg-orange-500",
  system: "bg-slate-500",
  general: "bg-gray-400",
  tarea: "bg-primary",
};

function formatRelativeDate(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return `Hoy, ${format(date, "HH:mm", { locale: es })}`;
  if (diffDays === 1) return `Ayer, ${format(date, "HH:mm", { locale: es })}`;
  return format(date, "dd MMM yyyy, HH:mm", { locale: es });
}

export default function Timeline({ items, isLoading }: TimelineProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-4 animate-pulse">
            <div className="w-10 h-10 rounded-full bg-gray-200" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-1/3" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
        <p>No hay actividad registrada aún</p>
        <p className="text-sm">Las interacciones con el lead aparecerán aquí</p>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {items.map((item, index) => {
        const Icon = TIPO_ICONS[item.tipo] || FileText;
        const colorClass = TIPO_COLORS[item.tipo] || "bg-gray-400";
        
        return (
          <div key={index} className="relative flex gap-4 pb-6 last:pb-0">
            {/* Timeline line */}
            {index < items.length - 1 && (
              <div className="absolute left-5 top-10 bottom-0 w-px bg-gray-200" />
            )}
            
            {/* Icon */}
            <div className={cn(
              "relative z-10 w-10 h-10 rounded-full flex items-center justify-center shrink-0",
              colorClass
            )}>
              <Icon className="h-5 w-5 text-white" />
            </div>
            
            {/* Content */}
            <div className="flex-1 min-w-0 pt-1">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <TimelineContent item={item} />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {formatRelativeDate(item.fecha)}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function TimelineContent({ item }: { item: TimelineItem }) {
  const data = item.data;
  
  if (item.tipo === "actividad") {
    const actividad = data as ActividadResponse;
    return (
      <div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-sm">
            {actividad.tipo === "llamada" && "Llamada"}
            {actividad.tipo === "email" && "Email"}
            {actividad.tipo === "reunion" && "Reunión"}
            {actividad.tipo === "whatsapp" && "WhatsApp"}
            {actividad.tipo === "nota" && "Nota de actividad"}
          </span>
          {actividad.direccion && (
            <span className={cn(
              "text-xs px-1.5 py-0.5 rounded",
              actividad.direccion === "salida" 
                ? "bg-blue-50 text-blue-600" 
                : "bg-green-50 text-green-600"
            )}>
              {actividad.direccion === "salida" ? (
                <span className="flex items-center gap-1">
                  <ArrowUpRight className="h-3 w-3" /> Salida
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <ArrowDownLeft className="h-3 w-3" /> Entrada
                </span>
              )}
            </span>
          )}
          {actividad.resultado && (
            <span className="text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-700">
              {actividad.resultado}
            </span>
          )}
        </div>
        {actividad.asunto && (
          <p className="text-sm font-medium mt-0.5">{actividad.asunto}</p>
        )}
        {actividad.descripcion && (
          <p className="text-sm text-gray-600 mt-1 line-clamp-3">{actividad.descripcion}</p>
        )}
        {actividad.user_nombre && (
          <p className="text-xs text-gray-400 mt-1">Por: {actividad.user_nombre}</p>
        )}
      </div>
    );
  }
  
  if (item.tipo === "nota") {
    const nota = data as NotaResponse;
    return (
      <div>
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm">Nota</span>
          {nota.es_privada && (
            <span className="text-xs px-1.5 py-0.5 rounded bg-red-50 text-red-600 flex items-center gap-1">
              <Tag className="h-3 w-3" /> Privada
            </span>
          )}
        </div>
        <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">{nota.contenido}</p>
        {nota.user_nombre && (
          <p className="text-xs text-gray-400 mt-1">Por: {nota.user_nombre}</p>
        )}
      </div>
    );
  }
  
  if (item.tipo === "tarea") {
    const tarea = data as TareaResponse;
    return (
      <div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-sm">Tarea completada</span>
          <span className={cn(
            "text-xs px-1.5 py-0.5 rounded",
            tarea.prioridad === "urgente" && "bg-red-100 text-red-700",
            tarea.prioridad === "alta" && "bg-orange-100 text-orange-700",
            tarea.prioridad === "media" && "bg-yellow-100 text-yellow-700",
            tarea.prioridad === "baja" && "bg-gray-100 text-gray-700",
          )}>
            {tarea.prioridad}
          </span>
        </div>
        <p className="text-sm mt-0.5">{tarea.titulo}</p>
        {tarea.descripcion && (
          <p className="text-sm text-gray-600 mt-1 line-clamp-2">{tarea.descripcion}</p>
        )}
      </div>
    );
  }
  
  return null;
}
