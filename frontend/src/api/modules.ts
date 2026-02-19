/**
 * API functions for UI Module management
 */
import { apiClient } from "./client";
import type { 
  UIModuleListResponse, 
  UIModuleResponse,
  ModulePermissionResponse,
} from "@/types";

export interface SyncModulesPayload {
  modules: Array<{
    codigo: string;
    nombre: string;
    descripcion?: string;
    ruta: string;
    icono?: string;
    orden: number;
    es_submodulo: boolean;
    parent_code?: string;
    acciones: Record<string, { label: string; description?: string }>;
  }>;
}

/**
 * Get all modules for an account
 */
export async function getModules(
  accountId: string,
  includeSystem = true
): Promise<UIModuleListResponse> {
  const response = await apiClient.get<UIModuleListResponse>(`/api/v1/accounts/${accountId}/modules`, {
    params: { include_system: includeSystem },
  });
  return response.data;
}

/**
 * Sync modules from frontend registry to backend
 */
export async function syncModules(
  accountId: string,
  payload: SyncModulesPayload
): Promise<UIModuleListResponse> {
  const response = await apiClient.post<UIModuleListResponse>(
    `/api/v1/accounts/${accountId}/modules/sync`,
    payload
  );
  return response.data;
}

/**
 * Get a single module by ID
 */
export async function getModule(moduleId: string): Promise<UIModuleResponse> {
  const response = await apiClient.get<UIModuleResponse>(`/api/v1/modules/${moduleId}`);
  return response.data;
}

/**
 * Get role's module permissions
 */
export async function getRoleModulePermissions(
  roleId: string
): Promise<ModulePermissionResponse[]> {
  const response = await apiClient.get<ModulePermissionResponse[]>(`/api/v1/roles/${roleId}/module-permissions`);
  return response.data;
}

/**
 * Set role's permissions for a module
 */
export async function setRoleModulePermissions(
  roleId: string,
  moduleId: string,
  accionesPermitidas: string[]
): Promise<ModulePermissionResponse> {
  const response = await apiClient.put<ModulePermissionResponse>(
    `/api/v1/roles/${roleId}/module-permissions`,
    {
      module_id: moduleId,
      acciones_permitidas: accionesPermitidas,
    }
  );
  return response.data;
}

/**
 * Remove role's permissions for a module
 */
export async function deleteRoleModulePermissions(
  roleId: string,
  moduleId: string
): Promise<void> {
  await apiClient.delete(`/api/v1/roles/${roleId}/module-permissions/${moduleId}`);
}

/**
 * Initialize system modules (admin only)
 */
export async function initializeSystemModules(): Promise<UIModuleListResponse> {
  const response = await apiClient.post<UIModuleListResponse>("/api/v1/admin/modules/initialize");
  return response.data;
}
