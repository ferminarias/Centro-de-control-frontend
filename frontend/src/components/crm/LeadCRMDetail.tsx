import { useState } from "react";
import { Plus, Activity, CheckSquare, StickyNote, Tag } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import {
  Timeline,
  TareaItem,
  TagSelector,
  TagManager,
  ActividadModal,
  TareaModal,
  NotaModal,
} from "./";
import {
  useLeadTimeline,
  useTareas,
  useCreateTarea,
  useCompletarTarea,
  useDeleteTarea,
  useNotas,
  useCreateNota,
  useTags,
  useLeadTags,
  useAssignTagsToLead,
  useCreateTag,
  useUpdateTag,
  useDeleteTag,
  useCreateActividad,
} from "@/hooks";
import { useAuth } from "@/hooks/useAuth";
import type { LeadResponse } from "@/types";

interface LeadCRMDetailProps {
  lead: LeadResponse;
}

type TabType = "timeline" | "tareas" | "notas";

export default function LeadCRMDetail({ lead }: LeadCRMDetailProps) {
  const [activeTab, setActiveTab] = useState<TabType>("timeline");
  const [showActividadModal, setShowActividadModal] = useState(false);
  const [showTareaModal, setShowTareaModal] = useState(false);
  const [showNotaModal, setShowNotaModal] = useState(false);

  const { user, isLoading: isLoadingUser } = useAuth();
  const accountId = user?.cuenta_id;

  // Queries
  const { data: timelineItems, isLoading: isLoadingTimeline } = useLeadTimeline(
    lead.id,
    50
  );
  const { data: tareasData, isLoading: isLoadingTareas } = useTareas(
    accountId,
    { lead_id: lead.id }
  );
  const { data: notasData, isLoading: isLoadingNotas } = useNotas(lead.id);
  const { data: tagsData, isLoading: isLoadingTags } = useTags(accountId);
  const { data: leadTags, isLoading: isLoadingLeadTags } = useLeadTags(lead.id);

  // Mutations - only initialize when accountId is available
  const { mutate: createActividad, isPending: isCreatingActividad } =
    useCreateActividad(accountId || "");
  const { mutate: createTarea, isPending: isCreatingTarea } = useCreateTarea(accountId || "");
  const { mutate: completarTarea } = useCompletarTarea(accountId || "");
  const { mutate: deleteTarea } = useDeleteTarea(accountId || "");
  const { mutate: createNota, isPending: isCreatingNota } = useCreateNota(
    accountId || "",
    lead.id
  );
  const { mutate: assignTags } = useAssignTagsToLead(accountId || "", lead.id);
  const { mutate: createTag, isPending: isCreatingTag } = useCreateTag(accountId || "");
  const { mutate: updateTag, isPending: isUpdatingTag } = useUpdateTag(accountId || "");
  const { mutate: deleteTag, isPending: isDeletingTag } = useDeleteTag(accountId || "");

  const tareas = tareasData?.items || [];
  const notas = notasData?.items || [];
  const tags = tagsData?.items || [];
  const selectedTagIds = leadTags?.map((t) => t.id) || [];

  // Prepare timeline items
  const timelineData =
    timelineItems?.map((item: any) => ({
      tipo: item.tipo,
      fecha: item.fecha,
      data: item,
    })) || [];

  const handleTagsChange = (newTagIds: string[]) => {
    assignTags(newTagIds);
  };

  const tabs = [
    { id: "timeline" as const, label: "Timeline", icon: Activity, count: timelineData.length },
    { id: "tareas" as const, label: "Tareas", icon: CheckSquare, count: tareas.length },
    { id: "notas" as const, label: "Notas", icon: StickyNote, count: notas.length },
  ];

  if (isLoadingUser || !accountId) {
    return <div className="text-sm text-gray-500">Cargando...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Header con Tags */}
      <div className="bg-white rounded-lg border p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Tag className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium">Tags</span>
            </div>
            <TagSelector
              selectedTags={selectedTagIds}
              onChange={handleTagsChange}
              availableTags={tags}
              isLoading={isLoadingTags || isLoadingLeadTags}
            />
          </div>
          <TagManager
            tags={tags}
            onCreate={createTag}
            onUpdate={updateTag}
            onDelete={deleteTag}
            isPendingCreate={isCreatingTag}
            isPendingUpdate={isUpdatingTag}
            isPendingDelete={isDeletingTag}
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg border">
        <div className="flex border-b">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors",
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              )}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
              {tab.count > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-xs bg-gray-100 rounded-full">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="p-4">
          {/* Timeline Tab */}
          {activeTab === "timeline" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-medium">Historial de actividad</h3>
                <button
                  onClick={() => setShowActividadModal(true)}
                  className="flex items-center gap-1 text-sm text-primary hover:underline"
                >
                  <Plus className="h-4 w-4" />
                  Registrar actividad
                </button>
              </div>
              <Timeline items={timelineData} isLoading={isLoadingTimeline} />
            </div>
          )}

          {/* Tareas Tab */}
          {activeTab === "tareas" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-medium">Tareas</h3>
                <button
                  onClick={() => setShowTareaModal(true)}
                  className="flex items-center gap-1 text-sm text-primary hover:underline"
                >
                  <Plus className="h-4 w-4" />
                  Nueva tarea
                </button>
              </div>
              <div className="space-y-2">
                {isLoadingTareas ? (
                  <div className="space-y-2">
                    {[1, 2].map((i) => (
                      <div
                        key={i}
                        className="h-20 bg-gray-100 rounded animate-pulse"
                      />
                    ))}
                  </div>
                ) : tareas.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-8">
                    No hay tareas para este lead
                  </p>
                ) : (
                  tareas.map((tarea) => (
                    <TareaItem
                      key={tarea.id}
                      tarea={tarea}
                      onToggleComplete={(id) =>
                        completarTarea(id)
                      }
                      onDelete={deleteTarea}
                    />
                  ))
                )}
              </div>
            </div>
          )}

          {/* Notas Tab */}
          {activeTab === "notas" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-medium">Notas</h3>
                <button
                  onClick={() => setShowNotaModal(true)}
                  className="flex items-center gap-1 text-sm text-primary hover:underline"
                >
                  <Plus className="h-4 w-4" />
                  Agregar nota
                </button>
              </div>
              <div className="space-y-3">
                {isLoadingNotas ? (
                  <div className="space-y-2">
                    {[1, 2].map((i) => (
                      <div
                        key={i}
                        className="h-24 bg-gray-100 rounded animate-pulse"
                      />
                    ))}
                  </div>
                ) : notas.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-8">
                    No hay notas para este lead
                  </p>
                ) : (
                  notas.map((nota) => (
                    <div
                      key={nota.id}
                      className={cn(
                        "p-3 rounded-lg border",
                        nota.es_privada
                          ? "bg-red-50 border-red-100"
                          : "bg-gray-50 border-gray-200"
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm whitespace-pre-wrap">
                          {nota.contenido}
                        </p>
                        {nota.es_privada && (
                          <span className="text-xs px-1.5 py-0.5 bg-red-100 text-red-700 rounded shrink-0">
                            Privada
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                        <span>{nota.user_nombre || "Usuario"}</span>
                        <span>•</span>
                        <span>
                          {format(
                            new Date(nota.created_at),
                            "dd MMM yyyy HH:mm",
                            { locale: es }
                          )}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <ActividadModal
        open={showActividadModal}
        onOpenChange={setShowActividadModal}
        leadId={lead.id}
        onSubmit={createActividad}
        isPending={isCreatingActividad}
      />
      <TareaModal
        open={showTareaModal}
        onOpenChange={setShowTareaModal}
        leadId={lead.id}
        onSubmit={createTarea}
        isPending={isCreatingTarea}
      />
      <NotaModal
        open={showNotaModal}
        onOpenChange={setShowNotaModal}
        onSubmit={createNota}
        isPending={isCreatingNota}
      />
    </div>
  );
}
