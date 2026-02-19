# CRM Components

Módulo de componentes para la gestión completa del CRM.

## Componentes

### LeadCRMDetail
Componente principal que integra todo el CRM en la vista de detalle de un lead.

```tsx
import { LeadCRMDetail } from "@/components/crm";

<LeadCRMDetail lead={leadData} />
```

### Modales

#### ActividadModal
Modal para registrar actividades (llamadas, emails, reuniones, WhatsApp, etc.)

```tsx
import { ActividadModal } from "@/components/crm";

<ActividadModal
  open={isOpen}
  onOpenChange={setIsOpen}
  leadId={leadId}
  onSubmit={createActividad}
  isPending={isCreating}
/>
```

#### TareaModal
Modal para crear nuevas tareas con prioridad, vencimiento y tipo.

```tsx
import { TareaModal } from "@/components/crm";

<TareaModal
  open={isOpen}
  onOpenChange={setIsOpen}
  leadId={leadId}
  onSubmit={createTarea}
  isPending={isCreating}
/>
```

#### NotaModal
Modal para agregar notas al lead (públicas o privadas).

```tsx
import { NotaModal } from "@/components/crm";

<NotaModal
  open={isOpen}
  onOpenChange={setIsOpen}
  onSubmit={createNota}
  isPending={isCreating}
/>
```

### Componentes de Visualización

#### Timeline
Muestra el historial cronológico de actividades, notas y tareas del lead.

```tsx
import { Timeline } from "@/components/crm";

<Timeline 
  items={timelineData} 
  isLoading={isLoading} 
/>
```

#### TareaItem
Item individual de tarea con acciones de completar/eliminar.

```tsx
import { TareaItem } from "@/components/crm";

<TareaItem
  tarea={tarea}
  onToggleComplete={handleToggle}
  onDelete={handleDelete}
/>
```

#### TagSelector
Selector de tags para asignar a leads.

```tsx
import { TagSelector } from "@/components/crm";

<TagSelector
  tags={availableTags}
  selectedTags={selectedTagIds}
  onChange={handleTagsChange}
  availableTags={allTags}
/>
```

#### TagManager
Modal para gestionar la creación, edición y eliminación de tags.

```tsx
import { TagManager } from "@/components/crm";

<TagManager
  tags={tags}
  onCreate={createTag}
  onUpdate={updateTag}
  onDelete={deleteTag}
/>
```

## Hooks

### Actividades
```tsx
import { 
  useActividades, 
  useCreateActividad, 
  useUpdateActividad,
  useDeleteActividad,
  useLeadTimeline 
} from "@/hooks";

// Listar actividades
const { data } = useActividades({ lead_id: leadId });

// Crear actividad
const { mutate: createActividad } = useCreateActividad();

// Timeline del lead
const { data: timeline } = useLeadTimeline(leadId);
```

### Tareas
```tsx
import { 
  useTareas, 
  useCreateTarea, 
  useUpdateTarea,
  useCompleteTarea,
  useDeleteTarea,
  useTareasStats 
} from "@/hooks";

// Listar tareas
const { data } = useTareas({ lead_id: leadId });

// Stats de tareas
const { data: stats } = useTareasStats();

// Crear/Actualizar/Completar
const { mutate: createTarea } = useCreateTarea();
const { mutate: completeTarea } = useCompleteTarea();
```

### Notas
```tsx
import { 
  useNotas, 
  useCreateNota, 
  useUpdateNota,
  useDeleteNota 
} from "@/hooks";

const { data: notas } = useNotas(leadId);
const { mutate: createNota } = useCreateNota();
```

### Tags
```tsx
import { 
  useTags, 
  useLeadTags,
  useCreateTag, 
  useUpdateTag,
  useDeleteTag,
  useAssignTagsToLead 
} from "@/hooks";

const { data: tags } = useTags();
const { data: leadTags } = useLeadTags(leadId);
const { mutate: assignTags } = useAssignTagsToLead();
```

### Audit Logs
```tsx
import { useAuditLogs, useEntityAuditLogs } from "@/hooks";

// Logs generales
const { data } = useAuditLogs({ entidad_tipo: "lead", entidad_id: leadId });

// Logs de entidad específica
const { data } = useEntityAuditLogs("lead", leadId);
```

## Tipos

Los tipos están definidos en `@/types`:

- `ActividadResponse` / `ActividadCreate` / `ActividadUpdate`
- `TareaResponse` / `TareaCreate` / `TareaUpdate` / `TareaStats`
- `NotaResponse` / `NotaCreate` / `NotaUpdate`
- `TagResponse` / `TagCreate` / `TagUpdate`
- `AuditLogResponse`
- `LeadTimelineItem`

## Integración en LeadDetailModal

El componente `LeadCRMDetail` ya está integrado en `LeadDetailModal`:

```tsx
// LeadDetailModal.tsx
import { LeadCRMDetail } from "@/components/crm";

<Modal ...>
  <LeadHeader lead={lead} />
  <LeadCRMDetail lead={lead} />
  <LeadDataSection lead={lead} />
</Modal>
```

## Endpoints del Backend

Los hooks se conectan a los siguientes endpoints:

| Entidad | Endpoint |
|---------|----------|
| Actividades | `GET/POST /admin/accounts/{id}/actividades` |
| Actividad | `PUT/DELETE /admin/actividades/{id}` |
| Tareas | `GET/POST /admin/accounts/{id}/tareas` |
| Tarea | `PUT/DELETE /admin/tareas/{id}` |
| Completar tarea | `POST /admin/tareas/{id}/completar` |
| Tareas stats | `GET /admin/accounts/{id}/tareas/stats` |
| Notas | `GET/POST /admin/leads/{id}/notas` |
| Nota | `PUT/DELETE /admin/notas/{id}` |
| Tags | `GET/POST /admin/accounts/{id}/tags` |
| Tag | `PUT/DELETE /admin/tags/{id}` |
| Lead tags | `GET /admin/leads/{id}/tags` |
| Asignar tags | `PUT /admin/leads/{id}/tags` |
| Timeline | `GET /admin/leads/{id}/timeline` |
| Audit logs | `GET /admin/accounts/{id}/audit-logs` |
