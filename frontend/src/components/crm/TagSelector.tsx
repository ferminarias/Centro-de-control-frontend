import { useState } from "react";
import { Plus, X, Tag } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TagResponse } from "@/types";

interface TagSelectorProps {
  selectedTags: string[];
  onChange: (tags: string[]) => void;
  availableTags: TagResponse[];
  isLoading?: boolean;
}

export default function TagSelector({
  selectedTags,
  onChange,
  availableTags,
  isLoading,
}: TagSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleTag = (tagId: string) => {
    if (selectedTags.includes(tagId)) {
      onChange(selectedTags.filter((id) => id !== tagId));
    } else {
      onChange([...selectedTags, tagId]);
    }
  };

  const removeTag = (tagId: string) => {
    onChange(selectedTags.filter((id) => id !== tagId));
  };

  const selectedTagObjects = availableTags.filter((t) => selectedTags.includes(t.id));

  if (isLoading) {
    return (
      <div className="flex gap-2 animate-pulse">
        <div className="h-7 w-20 bg-gray-200 rounded-full" />
        <div className="h-7 w-16 bg-gray-200 rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Selected tags */}
      <div className="flex flex-wrap gap-1.5">
        {selectedTagObjects.map((tag) => (
          <span
            key={tag.id}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium"
            style={{ backgroundColor: tag.color + "20", color: tag.color }}
          >
            {tag.nombre}
            <button
              type="button"
              onClick={() => removeTag(tag.id)}
              className="hover:opacity-70"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        
        {/* Add tag button */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors",
            isOpen
              ? "border-primary bg-primary/5 text-primary"
              : "border-gray-300 text-gray-600 hover:border-primary/50"
          )}
        >
          <Plus className="h-3 w-3" />
          {selectedTagObjects.length === 0 ? "Agregar tag" : "Agregar más"}
        </button>
      </div>

      {/* Available tags dropdown */}
      {isOpen && (
        <div className="p-2 bg-gray-50 rounded-lg border border-gray-200">
          <div className="text-xs text-gray-500 mb-2 flex items-center gap-1">
            <Tag className="h-3 w-3" /> Tags disponibles:
          </div>
          <div className="flex flex-wrap gap-1.5">
            {availableTags
              .filter((tag) => !selectedTags.includes(tag.id))
              .map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => toggleTag(tag.id)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-all hover:opacity-80"
                  style={{ backgroundColor: tag.color + "20", color: tag.color }}
                >
                  <Plus className="h-3 w-3" />
                  {tag.nombre}
                </button>
              ))}
          </div>
          {availableTags.filter((tag) => !selectedTags.includes(tag.id)).length === 0 && (
            <p className="text-xs text-gray-400 italic">No hay más tags disponibles</p>
          )}
        </div>
      )}
    </div>
  );
}
