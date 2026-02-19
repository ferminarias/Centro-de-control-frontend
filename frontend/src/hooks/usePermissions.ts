/**
 * usePermissions hook
 * 
 * Provides access to user permissions with both legacy (flat) and new (modular) formats.
 * 
 * Legacy format: "leads:read", "users:create"
 * New format: { "leads": ["view", "create"], "users": ["view"] }
 */
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/api/client";

export interface UserPermissions {
  role_id: string | null;
  role_nombre: string | null;
  /** Legacy flat permissions */
  permisos: string[];
  /** New modular permissions */
  modulos: Record<string, string[]>;
}

export interface ModuleWithPermissions {
  id: string;
  codigo: string;
  nombre: string;
  descripcion?: string;
  ruta: string;
  icono?: string;
  orden: number;
  es_submodulo: boolean;
  parent_code?: string;
  acciones: Array<{
    code: string;
    label: string;
    description?: string;
    allowed: boolean;
  }>;
  puede_ver: boolean;
}

/**
 * Hook to fetch and use user permissions
 */
export function usePermissions() {
  // Fetch user permissions from backend
  const permissionsQuery = useQuery({
    queryKey: ["permissions"],
    queryFn: async () => {
      const response = await apiClient.get<UserPermissions>("/api/v1/auth/me/permissions");
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
  });

  // Fetch accessible modules with detailed permission info
  const modulesQuery = useQuery({
    queryKey: ["modules", "accessible"],
    queryFn: async () => {
      const response = await apiClient.get<ModuleWithPermissions[]>("/api/v1/auth/me/modules");
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const permissions = permissionsQuery.data;
  const modules = modulesQuery.data;
  const isLoading = permissionsQuery.isLoading || modulesQuery.isLoading;
  const error = permissionsQuery.error || modulesQuery.error;

  /**
   * Check if user has a specific legacy permission
   * @param permission - Legacy permission string (e.g., "leads:read")
   */
  const hasLegacyPermission = (permission: string): boolean => {
    if (!permissions?.permisos) return false;
    return permissions.permisos.includes(permission);
  };

  /**
   * Check if user can perform an action on a module
   * @param moduleCode - Module code (e.g., "leads")
   * @param action - Action code (e.g., "view", "create")
   */
  const can = (moduleCode: string, action: string): boolean => {
    if (!permissions?.modulos) return false;
    const modulePerms = permissions.modulos[moduleCode];
    if (!modulePerms) return false;
    return modulePerms.includes("*") || modulePerms.includes(action);
  };

  /**
   * Check if user can view a module
   * @param moduleCode - Module code
   */
  const canView = (moduleCode: string): boolean => {
    return can(moduleCode, "view");
  };

  /**
   * Check if user can create in a module
   * @param moduleCode - Module code
   */
  const canCreate = (moduleCode: string): boolean => {
    return can(moduleCode, "create");
  };

  /**
   * Check if user can edit in a module
   * @param moduleCode - Module code
   */
  const canEdit = (moduleCode: string): boolean => {
    return can(moduleCode, "edit");
  };

  /**
   * Check if user can delete in a module
   * @param moduleCode - Module code
   */
  const canDelete = (moduleCode: string): boolean => {
    return can(moduleCode, "delete");
  };

  /**
   * Get all allowed actions for a module
   * @param moduleCode - Module code
   */
  const getModulePermissions = (moduleCode: string): string[] => {
    if (!permissions?.modulos) return [];
    return permissions.modulos[moduleCode] || [];
  };

  /**
   * Get modules that the user can view
   */
  const getVisibleModules = (): ModuleWithPermissions[] => {
    if (!modules) return [];
    return modules.filter((m) => m.puede_ver);
  };

  /**
   * Check if a specific module is accessible
   * @param moduleCode - Module code
   */
  const isModuleAccessible = (moduleCode: string): boolean => {
    if (!modules) return false;
    const module = modules.find((m) => m.codigo === moduleCode);
    return module?.puede_ver ?? false;
  };

  return {
    // Data
    permissions,
    modules,
    roleId: permissions?.role_id ?? null,
    roleName: permissions?.role_nombre ?? null,
    
    // Loading state
    isLoading,
    error,
    
    // Legacy permission checking
    hasLegacyPermission,
    
    // Modular permission checking
    can,
    canView,
    canCreate,
    canEdit,
    canDelete,
    
    // Helpers
    getModulePermissions,
    getVisibleModules,
    isModuleAccessible,
  };
}

/**
 * Hook to check permission for a specific module (convenience hook)
 */
export function useModulePermission(moduleCode: string) {
  const { can, canView, canCreate, canEdit, canDelete, isLoading } = usePermissions();

  return {
    can: (action: string) => can(moduleCode, action),
    canView: canView(moduleCode),
    canCreate: canCreate(moduleCode),
    canEdit: canEdit(moduleCode),
    canDelete: canDelete(moduleCode),
    isLoading,
  };
}
