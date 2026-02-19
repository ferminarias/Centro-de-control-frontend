import { useState } from "react";
import { Plus, X, Edit2, Trash2, GripVertical, Check } from "lucide-react";
import Modal from "@/components/ui/Modal";
import { cn } from "@/lib/utils";
import type { TagResponse, TagCreate, TagUpdate } from "@/types";

interface TagManagerProps {
  tags: TagResponse[];
  isLoading?: boolean;
  onCreate: (data: TagCreate) => void;
  onUpdate: (id: string, data: TagUpdate) => void;
  onDelete: (id: string) => void;
  isPendingCreate?: boolean;
  isPendingUpdate?: boolean;
  isPendingDelete?: boolean;
}

const PRESET_COLORS = [
  "#ef4444", // red
  "#f97316", // orange
  "#f59e0b", // amber
  "#84cc16", // lime
  "#22c55e", // green
  "#10b981", // emerald
  "#06b6d4", // cyan
  "#3b82f6", // blue
  "#6366f1", // indigo
  "#8b5cf6", // violet
  "#a855f7", // purple
  "#d946ef", // fuchsia
  "#ec4899", // pink
  "#f43f5e", // rose
  "#64748b", // slate
];

export default function TagManager({
  tags,
  isLoading,
  onCreate,
  onUpdate,
  onDelete,
  isPendingCreate,
  isPendingUpdate,
  isPendingDelete,
}: TagManagerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [editingTag, setEditingTag] = useState<TagResponse | null>(null);
  
  // Form state
  const [nombre, setNombre] = useState("");
  const [color, setColor] = useState(PRESET_COLORS[7]);
  const [descripcion, setDescripcion] = useState("");

  const resetForm = () => {
    setNombre("");
    setColor(PRESET_COLORS[7]);
    setDescripcion("");
    setEditingTag(null);
    setIsCreating(false);
  };

  const handleOpen = () => {
    setIsOpen(true);
    resetForm();
  };

  const handleCreate = () => {
    onCreate({
      nombre,
      color,
      descripcion: descripcion || undefined,
    });
    resetForm();
  };

  const handleUpdate = () => {
    if (!editingTag) return;
    onUpdate(editingTag.id, {
      nombre,
      color,
      descripcion: descripcion || undefined,
    });
    resetForm();
  };

  const startEditing = (tag: TagResponse) => {
    setEditingTag(tag);
    setNombre(tag.nombre);
    setColor(tag.color);
    setDescripcion(tag.descripcion || "");
    setIsCreating(false);
  };

  const startCreating = () => {
    resetForm();
    setIsCreating(true);
  };

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className="text-xs text-primary hover:underline flex items-center gap-1"
      >
        <Edit2 className="h-3 w-3" />
        Gestionar tags
      </button>

      <Modal open={isOpen} onOpenChange={setIsOpen} title="Gestionar Tags">
        <div className="space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Create/Edit Form */}
          {(isCreating || editingTag) && (
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
              <h4 className="font-medium text-sm">
                {editingTag ? "Editar tag" : "Nuevo tag"}
              </h4>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Nombre *
                </label>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej: VIP, En seguimiento, etc."
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Color
                </label>
                <div className="flex flex-wrap gap-2">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={cn(
                        "w-6 h-6 rounded-full transition-all",
                        color === c && "ring-2 ring-offset-2 ring-gray-400 scale-110"
                      )}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <input
                  type="text"
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Opcional"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={editingTag ? handleUpdate : handleCreate}
                  disabled={!nombre || (editingTag ? isPendingUpdate : isPendingCreate)}
                  className="flex-1 px-3 py-2 text-sm bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50"
                >
                  {editingTag ? (isPendingUpdate ? "Guardando..." : "Guardar") : (isPendingCreate ? "Creando..." : "Crear")}
                </button>
              </div>
            </div>
          )}

          {/* Tags List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-sm">Tags existentes</h4>
              {!isCreating && !editingTag && (
                <button
                  type="button"
                  onClick={startCreating}
                  className="flex items-center gap-1 text-xs text-primary hover:underline"
                >
                  <Plus className="h-3 w-3" />
                  Nuevo tag
                </button>
              )}
            </div>

            {isLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />
                ))}
              </div>
            ) : tags.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">
                No hay tags creados
              </p>
            ) : (
              <div className="space-y-2">
                {tags.map((tag) => (
                  <div
                    key={tag.id}
                    className="flex items-center gap-2 p-2 bg-white border rounded-lg group"
                  >
                    <div
                      className="w-4 h-4 rounded-full shrink-0"
                      style={{ backgroundColor: tag.color }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{tag.nombre}</p>
                      {tag.descripcion && (
                        <p className="text-xs text-gray-500 truncate">{tag.descripcion}</p>
                      )}
                    </div>
                    {tag.total_leads !== undefined && (
                      <span className="text-xs text-gray-400">
                        {tag.total_leads} leads
                      </span>
                    )}
                    {!tag.es_sistema && (
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => startEditing(tag)}
                          className="p-1 text-gray-400 hover:text-primary"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDelete(tag.id)}
                          disabled={isPendingDelete}
                          className="p-1 text-gray-400 hover:text-red-500"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Modal>
    </>
  );
}
