/**
 * UI Modules System
 * 
 * This module provides the complete permission system for the application.
 * 
 * Usage:
 * 1. Register new screens in registry.ts
 * 2. Use hooks and components to check permissions
 * 3. Manage role permissions from the Roles admin page
 */

// Registry
export { 
  MODULES_REGISTRY, 
  getModulesList, 
  getMainModules, 
  getSubModules,
  getModuleByRoute,
  getModuleByCode,
  getModulesForSync,
  type ModuleCode,
  type UIModule,
  type ModuleAction,
} from "./registry";
