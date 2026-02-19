import { useState, useEffect, useMemo } from "react"
import { 
  ShieldCheck, 
  Plus, 
  Pencil, 
  Trash2, 
  Check, 
  RefreshCw, 
  LayoutGrid, 
  Shield,
  ChevronRight,
  ChevronDown,
  CheckSquare,
  Square,
  MinusSquare,
  Save,
} from "lucide-react"
import { useAccount } from "@/context/AccountContext"
import { 
  useRolesList, 
  useCreateRole, 
  useUpdateRole, 
  useDeleteRole, 
  useLegacyPermissions,
  useModules,
  useSyncModules,
  useRoleModulePermissions,
  useSetRoleModulePermissions,
  useDeleteRoleModulePermissions,
} from "@/hooks/useRoles"
import { TableSkeleton } from "@/components/ui/Loading"
import ErrorState from "@/components/ui/ErrorState"
import EmptyState from "@/components/ui/EmptyState"
import Badge from "@/components/ui/Badge"
import Modal from "@/components/ui/Modal"
import ConfirmDialog from "@/components/ui/ConfirmDialog"
import { formatDate, cn } from "@/lib/utils"
import type { RoleResponse } from "@/types"

// ─────────────────────────────────────────────────────────────────────────────
// Constants & Helpers
// ─────────────────────────────────────────────────────────────────────────────

const PERMISSION_LABELS: Record<string, string> = {
  read: "Leer",
  create: "Crear",
  update: "Editar",
  delete: "Eliminar",
}

const GROUP_LABELS: Record<string, string> = {
  users: "Usuarios",
  roles: "Roles",
  leads: "Leads",
  bases: "Bases",
  lotes: "Lotes",
  fields: "Campos",
  records: "Registros",
  settings: "Configuracion",
  webhooks: "Webhooks",
  automations: "Automatizaciones",
  voip: "VoIP",
  campaigns: "Campañas",
  agents: "Agentes",
}

const ACTION_LABELS: Record<string, string> = {
  view: "Ver",
  create: "Crear",
  edit: "Editar",
  delete: "Eliminar",
  export: "Exportar",
  import: "Importar",
  execute: "Ejecutar",
  activate: "Activar",
  test: "Probar",
  start: "Iniciar",
  stop: "Detener",
  manageSources: "Gestionar Fuentes",
  moveLeads: "Mover Leads",
  manageLotes: "Gestionar Lotes",
  bulkUpdate: "Actualización Masiva",
  manageCampaigns: "Gestionar Campañas",
  manageAgents: "Gestionar Agentes",
  viewCDR: "Ver CDR",
  manageDNC: "Gestionar DNC",
  configureProviders: "Configurar Proveedores",
  configureTrunks: "Configurar Trunks",
  configurePBX: "Configurar PBX",
  manageUsers: "Gestionar Usuarios",
  manageRoles: "Gestionar Roles",
  assignPermissions: "Asignar Permisos",
  resetPassword: "Resetear Password",
}

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface ModuleAction {
  code: string
  label: string
  description?: string
}

interface Module {
  id: string
  codigo: string
  nombre: string
  descripcion?: string
  ruta: string
  icono?: string
  orden: number
  es_submodulo: boolean
  parent_code?: string
  acciones: Record<string, { label: string; description?: string }>
  es_sistema: boolean
}

interface ModulePermissionState {
  [moduleId: string]: string[] // array of allowed action codes
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

export default function RolesAdmin() {
  const { selectedAccount } = useAccount()
  const accountId = selectedAccount?.id ?? ""

  // Data fetching
  const { data: rolesData, isLoading: isLoadingRoles, isError: isErrorRoles, refetch: refetchRoles } = useRolesList(accountId)
  const { data: legacyPermsData } = useLegacyPermissions()
  const { data: modulesData, isLoading: isLoadingModules, refetch: refetchModules } = useModules(accountId)
  const syncModulesMutation = useSyncModules(accountId)
  
  // Mutations
  const createMutation = useCreateRole(accountId)
  const updateMutation = useUpdateRole(accountId)
  const deleteMutation = useDeleteRole(accountId)
  const setModulePermMutation = useSetRoleModulePermissions(accountId)
  const deleteModulePermMutation = useDeleteRoleModulePermissions(accountId)

  // UI State
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<RoleResponse | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<RoleResponse | null>(null)
  const [activeTab, setActiveTab] = useState<"legacy" | "modular">("modular")
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set())
  
  // Form state - Legacy
  const [nombre, setNombre] = useState("")
  const [descripcion, setDescripcion] = useState("")
  const [selectedPerms, setSelectedPerms] = useState<Set<string>>(new Set())
  
  // Form state - Modular
  const [modulePermissions, setModulePermissions] = useState<ModulePermissionState>({})
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  const roles = rolesData?.items ?? []
  const grouped = legacyPermsData?.grouped ?? {}
  const modules = modulesData?.items ?? []

  // Group modules by parent
  const { parentModules, subModules } = useMemo(() => {
    const parents = modules.filter(m => !m.es_submodulo).sort((a, b) => a.orden - b.orden)
    const subs = modules.filter(m => m.es_submodulo).sort((a, b) => a.orden - b.orden)
    return { parentModules: parents, subModules: subs }
  }, [modules])

  // Fetch module permissions when editing a role
  const { data: roleModulePerms, refetch: refetchRoleModulePerms } = useRoleModulePermissions(editing?.id)

  // Sync module permissions to local state when data arrives
  useEffect(() => {
    if (roleModulePerms && editing) {
      const perms: ModulePermissionState = {}
      roleModulePerms.forEach(p => {
        perms[p.module_id] = p.acciones_permitidas
      })
      setModulePermissions(perms)
      setHasUnsavedChanges(false)
    }
  }, [roleModulePerms, editing])

  // ─────────────────────────────────────────────────────────────────────────
  // Handlers
  // ─────────────────────────────────────────────────────────────────────────

  const openCreate = () => {
    setEditing(null)
    setNombre("")
    setDescripcion("")
    setSelectedPerms(new Set())
    setModulePermissions({})
    setHasUnsavedChanges(false)
    setShowForm(true)
  }

  const openEdit = (role: RoleResponse) => {
    setEditing(role)
    setNombre(role.nombre)
    setDescripcion(role.descripcion ?? "")
    setSelectedPerms(new Set(role.permisos))
    setModulePermissions({})
    setHasUnsavedChanges(false)
    setShowForm(true)
  }

  const handleSyncModules = () => {
    syncModulesMutation.mutate()
  }

  // Legacy permission handlers
  const togglePerm = (perm: string) => {
    setSelectedPerms((prev) => {
      const next = new Set(prev)
      if (next.has(perm)) next.delete(perm)
      else next.add(perm)
      return next
    })
  }

  const toggleGroup = (groupPerms: string[]) => {
    const allSelected = groupPerms.every((p) => selectedPerms.has(p))
    setSelectedPerms((prev) => {
      const next = new Set(prev)
      for (const p of groupPerms) {
        if (allSelected) next.delete(p)
        else next.add(p)
      }
      return next
    })
  }

  // Modular permission handlers
  const toggleModuleAction = (moduleId: string, actionCode: string) => {
    setModulePermissions(prev => {
      const current = prev[moduleId] || []
      const hasAction = current.includes(actionCode)
      
      if (hasAction) {
        // Remove action
        const updated = current.filter(a => a !== actionCode)
        const newState = { ...prev }
        if (updated.length === 0) {
          delete newState[moduleId]
        } else {
          newState[moduleId] = updated
        }
        setHasUnsavedChanges(true)
        return newState
      } else {
        // Add action
        setHasUnsavedChanges(true)
        return {
          ...prev,
          [moduleId]: [...current, actionCode]
        }
      }
    })
  }

  const toggleAllModuleActions = (module: Module) => {
    const actionCodes = Object.keys(module.acciones)
    const current = modulePermissions[module.id] || []
    const allSelected = actionCodes.every(a => current.includes(a))
    
    setModulePermissions(prev => {
      setHasUnsavedChanges(true)
      if (allSelected) {
        // Deselect all
        const newState = { ...prev }
        delete newState[module.id]
        return newState
      } else {
        // Select all
        return {
          ...prev,
          [module.id]: [...actionCodes]
        }
      }
    })
  }

  const toggleModuleExpand = (moduleId: string) => {
    setExpandedModules(prev => {
      const next = new Set(prev)
      if (next.has(moduleId)) {
        next.delete(moduleId)
      } else {
        next.add(moduleId)
      }
      return next
    })
  }

  const saveModulePermissions = async () => {
    if (!editing) return
    
    // Save each module's permissions
    const promises = Object.entries(modulePermissions).map(([moduleId, actions]) => {
      if (actions.length === 0) {
        // Delete permission entry if no actions
        return deleteModulePermMutation.mutateAsync({ roleId: editing.id, moduleId })
      } else {
        return setModulePermMutation.mutateAsync({ 
          roleId: editing.id, 
          moduleId, 
          accionesPermitidas: actions 
        })
      }
    })

    // Also delete permissions for modules that were removed
    const existingModuleIds = new Set(Object.keys(modulePermissions))
    const modulesToDelete = roleModulePerms?.filter(p => 
      !existingModuleIds.has(p.module_id) && p.acciones_permitidas.length > 0
    ) || []
    
    modulesToDelete.forEach(p => {
      promises.push(deleteModulePermMutation.mutateAsync({ 
        roleId: editing.id, 
        moduleId: p.module_id 
      }))
    })

    await Promise.all(promises)
    setHasUnsavedChanges(false)
    refetchRoleModulePerms()
  }

  // Main submit handler
  const handleSubmit = () => {
    const trimmed = nombre.trim()
    if (!trimmed) return
    const permisos = Array.from(selectedPerms)

    if (editing) {
      updateMutation.mutate(
        { 
          roleId: editing.id, 
          payload: { 
            nombre: trimmed, 
            descripcion: descripcion.trim() || undefined, 
            permisos 
          } 
        },
        { 
          onSuccess: () => {
            // Also save modular permissions
            saveModulePermissions().then(() => {
              setShowForm(false)
            })
          } 
        }
      )
    } else {
      createMutation.mutate(
        { 
          nombre: trimmed, 
          descripcion: descripcion.trim() || undefined, 
          permisos 
        },
        { 
          onSuccess: (newRole) => {
            // Save modular permissions for new role
            setEditing(newRole)
            saveModulePermissions().then(() => {
              setShowForm(false)
            })
          } 
        }
      )
    }
  }

  const handleDelete = () => {
    if (!deleteTarget) return
    deleteMutation.mutate(deleteTarget.id, {
      onSuccess: () => setDeleteTarget(null),
    })
  }

  const isPending = createMutation.isPending || updateMutation.isPending

  // ─────────────────────────────────────────────────────────────────────────
  // Render Helpers
  // ─────────────────────────────────────────────────────────────────────────

  const getModuleStatus = (module: Module): "empty" | "partial" | "full" => {
    const actions = modulePermissions[module.id] || []
    const totalActions = Object.keys(module.acciones).length
    if (actions.length === 0) return "empty"
    if (actions.length === totalActions) return "full"
    return "partial"
  }

  const renderModuleCheckbox = (module: Module) => {
    const status = getModuleStatus(module)
    const Icon = status === "full" ? CheckSquare : status === "partial" ? MinusSquare : Square
    
    return (
      <button
        onClick={() => toggleAllModuleActions(module)}
        className={cn(
          "flex items-center gap-2 text-sm font-medium transition-colors",
          status === "full" ? "text-primary" : "text-gray-600"
        )}
      >
        <Icon className="h-5 w-5" />
        <span>Todo</span>
      </button>
    )
  }

  const renderModuleActions = (module: Module) => {
    const selected = modulePermissions[module.id] || []
    
    return (
      <div className="flex flex-wrap gap-2">
        {Object.entries(module.acciones).map(([code, action]) => {
          const isChecked = selected.includes(code)
          return (
            <button
              key={code}
              onClick={() => toggleModuleAction(module.id, code)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all",
                isChecked 
                  ? "bg-primary text-white shadow-sm" 
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              )}
            >
              {isChecked && <Check className="h-3.5 w-3.5" />}
              <span>{ACTION_LABELS[code] || action.label}</span>
            </button>
          )
        })}
      </div>
    )
  }

  const renderModuleItem = (module: Module, isChild = false) => {
    const isExpanded = expandedModules.has(module.id)
    const childModules = subModules.filter(s => s.parent_code === module.codigo)
    const hasChildren = childModules.length > 0
    
    return (
      <div 
        key={module.id} 
        className={cn(
          "rounded-xl border transition-all",
          isChild ? "border-gray-200 bg-gray-50/50" : "border-border bg-white shadow-sm",
          hasUnsavedChanges && modulePermissions[module.id] && "ring-1 ring-primary/20"
        )}
      >
        <div className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                {hasChildren && (
                  <button
                    onClick={() => toggleModuleExpand(module.id)}
                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                  >
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4 text-gray-500" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-gray-500" />
                    )}
                  </button>
                )}
                <h4 className={cn(
                  "font-semibold text-foreground",
                  isChild && "text-sm"
                )}>
                  {module.nombre}
                </h4>
                {module.descripcion && (
                  <span className="text-xs text-muted-foreground hidden sm:inline">
                    ({module.descripcion})
                  </span>
                )}
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                {renderModuleCheckbox(module)}
                <div className="h-4 w-px bg-gray-300" />
                {renderModuleActions(module)}
              </div>
            </div>
          </div>
        </div>
        
        {/* Child modules */}
        {hasChildren && isExpanded && (
          <div className="border-t border-gray-100 px-4 pb-4">
            <div className="mt-3 space-y-3">
              {childModules.map(child => renderModuleItem(child, true))}
            </div>
          </div>
        )}
      </div>
    )
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Roles</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Administra los roles y permisos de esta cuenta.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSyncModules}
            disabled={syncModulesMutation.isPending}
            className="flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-foreground hover:bg-gray-50 transition-colors disabled:opacity-50"
            title="Sincronizar módulos con el frontend"
          >
            <RefreshCw className={cn("h-4 w-4", syncModulesMutation.isPending && "animate-spin")} />
            Sincronizar
          </button>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Crear rol
          </button>
        </div>
      </div>

      {/* Roles Table */}
      <div className="rounded-xl border border-border bg-white shadow-sm">
        {isLoadingRoles ? (
          <div className="p-6"><TableSkeleton rows={4} cols={5} /></div>
        ) : isErrorRoles ? (
          <ErrorState onRetry={() => refetchRoles()} />
        ) : roles.length === 0 ? (
          <EmptyState
            icon={ShieldCheck}
            title="No hay roles"
            description="Crea un rol para asignar permisos a los usuarios."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Nombre</th>
                  <th className="px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Descripción</th>
                  <th className="px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Permisos</th>
                  <th className="px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Usuarios</th>
                  <th className="px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Creado</th>
                  <th className="px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {roles.map((role) => (
                  <tr key={role.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-foreground">{role.nombre}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground max-w-[200px] truncate">
                      {role.descripcion || "—"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-1">
                        <Badge variant="info">{role.permisos.length} legado</Badge>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="default">{role.total_users ?? 0} usuarios</Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground whitespace-nowrap">
                      {formatDate(role.created_at)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEdit(role)}
                          className="inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium text-primary hover:bg-primary/10 transition-colors"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          Editar
                        </button>
                        <button
                          onClick={() => setDeleteTarget(role)}
                          className="inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      <Modal
        open={showForm}
        onOpenChange={setShowForm}
        title={editing ? "Editar rol" : "Crear rol"}
        wide
      >
        <div className="space-y-4">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Nombre</label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej: Administrador"
                className="w-full rounded-lg border border-border bg-white px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Descripción</label>
              <input
                type="text"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Opcional"
                className="w-full rounded-lg border border-border bg-white px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-border">
            <div className="flex gap-4">
              <button
                onClick={() => setActiveTab("modular")}
                className={cn(
                  "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors",
                  activeTab === "modular"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                <LayoutGrid className="h-4 w-4" />
                Permisos por Módulo
              </button>
              <button
                onClick={() => setActiveTab("legacy")}
                className={cn(
                  "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors",
                  activeTab === "legacy"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                <Shield className="h-4 w-4" />
                Permisos Legacy
              </button>
            </div>
          </div>

          {/* Modular Permissions Tab */}
          {activeTab === "modular" && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-foreground">
                  Permisos por Módulo
                </label>
                {hasUnsavedChanges && editing && (
                  <Badge variant="warning">Cambios sin guardar</Badge>
                )}
              </div>
              
              {isLoadingModules ? (
                <div className="py-8 text-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto" />
                  <p className="text-sm text-muted-foreground mt-2">Cargando módulos...</p>
                </div>
              ) : modules.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border p-6 text-center">
                  <p className="text-sm text-muted-foreground">
                    No hay módulos sincronizados.
                  </p>
                  <button
                    onClick={handleSyncModules}
                    className="mt-2 text-sm text-primary hover:underline"
                  >
                    Sincronizar ahora
                  </button>
                </div>
              ) : (
                <div className="space-y-3 max-h-[50vh] overflow-y-auto rounded-lg border border-border p-4 bg-gray-50">
                  {parentModules.map(module => renderModuleItem(module))}
                </div>
              )}
              
              <p className="text-xs text-muted-foreground mt-2">
                Selecciona las acciones que este rol podrá realizar en cada módulo.
                Haz clic en "Todo" para seleccionar todas las acciones de un módulo.
              </p>
            </div>
          )}

          {/* Legacy Permissions Tab */}
          {activeTab === "legacy" && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Permisos Legacy (API)
              </label>
              <div className="space-y-3 max-h-[40vh] overflow-y-auto rounded-lg border border-border p-4 bg-gray-50">
                {Object.entries(grouped).map(([group, perms]) => {
                  const allSelected = perms.every((p) => selectedPerms.has(p))
                  const someSelected = perms.some((p) => selectedPerms.has(p)) && !allSelected
                  return (
                    <div key={group} className="rounded-lg bg-white border border-border p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <button
                          type="button"
                          onClick={() => toggleGroup(perms)}
                          className={cn(
                            "flex h-5 w-5 items-center justify-center rounded border transition-colors",
                            allSelected
                              ? "bg-primary border-primary text-white"
                              : someSelected
                                ? "bg-primary/20 border-primary"
                                : "border-gray-300 hover:border-primary"
                          )}
                        >
                          {(allSelected || someSelected) && <Check className="h-3.5 w-3.5" />}
                        </button>
                        <span className="text-sm font-semibold text-foreground capitalize">
                          {GROUP_LABELS[group] ?? group}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-3 ml-7">
                        {perms.map((perm) => {
                          const action = perm.split(":")[1]
                          const checked = selectedPerms.has(perm)
                          return (
                            <label
                              key={perm}
                              className="flex items-center gap-1.5 cursor-pointer"
                            >
                              <button
                                type="button"
                                onClick={() => togglePerm(perm)}
                                className={cn(
                                  "flex h-4 w-4 items-center justify-center rounded border transition-colors",
                                  checked
                                    ? "bg-primary border-primary text-white"
                                    : "border-gray-300 hover:border-primary"
                                )}
                              >
                                {checked && <Check className="h-3 w-3" />}
                              </button>
                              <span className="text-sm text-foreground">
                                {PERMISSION_LABELS[action] ?? action}
                              </span>
                            </label>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {selectedPerms.size} permiso{selectedPerms.size !== 1 ? "s" : ""} legacy seleccionado{selectedPerms.size !== 1 ? "s" : ""}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2 border-t border-border">
            <button
              onClick={() => setShowForm(false)}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={!nombre.trim() || isPending}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {isPending ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  {editing ? "Guardar cambios" : "Crear rol"}
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Eliminar rol"
        description={
          (deleteTarget?.total_users ?? 0) > 0
            ? `El rol "${deleteTarget?.nombre}" tiene ${deleteTarget?.total_users} usuario(s) asignado(s). No se puede eliminar un rol con usuarios.`
            : `Se eliminará el rol "${deleteTarget?.nombre}". Esta acción no se puede deshacer.`
        }
        confirmLabel="Eliminar"
        variant="danger"
        onConfirm={handleDelete}
        loading={deleteMutation.isPending}
      />
    </div>
  )
}
