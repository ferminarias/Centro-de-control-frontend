/**
 * UI Modules Registry
 * 
 * This file defines all frontend modules (screens) and their available actions.
 * This registry is used for:
 * - Permission checking
 * - Dynamic sidebar generation
 * - Role configuration
 * 
 * IMPORTANT: When adding a new screen, register it here.
 */

export interface ModuleAction {
  label: string;
  description?: string;
}

export interface UIModule {
  /** Unique code for the module (used in permissions) */
  code: string;
  /** Display name */
  name: string;
  /** Description of what this module does */
  description?: string;
  /** Frontend route path */
  route: string;
  /** Lucide icon name */
  icon: string;
  /** Order in navigation (lower = first) */
  order: number;
  /** Whether this is a submenu item */
  isSubModule?: boolean;
  /** Parent module code (for submodules) */
  parentCode?: string;
  /** Available actions for this module */
  actions: Record<string, ModuleAction>;
}

/**
 * Registry of all UI modules in the application.
 * This is the single source of truth for module definitions.
 */
export const MODULES_REGISTRY: Record<string, UIModule> = {
  // ─────────────────────────────────────────────────────────────────────────
  // Main Data Modules
  // ─────────────────────────────────────────────────────────────────────────
  
  fields: {
    code: "fields",
    name: "Datos",
    description: "Gestión de campos personalizados",
    route: "/fields",
    icon: "Database",
    order: 1,
    actions: {
      view: { label: "Ver", description: "Ver campos personalizados" },
      create: { label: "Crear", description: "Crear nuevos campos" },
      edit: { label: "Editar", description: "Editar campos existentes" },
      delete: { label: "Eliminar", description: "Eliminar campos" },
    },
  },
  
  leads: {
    code: "leads",
    name: "Leads",
    description: "Gestión de leads y contactos",
    route: "/leads",
    icon: "Users",
    order: 2,
    actions: {
      view: { label: "Ver", description: "Ver lista de leads" },
      create: { label: "Crear", description: "Crear nuevos leads" },
      edit: { label: "Editar", description: "Editar leads existentes" },
      delete: { label: "Eliminar", description: "Eliminar leads" },
      export: { label: "Exportar", description: "Exportar leads a Excel" },
      import: { label: "Importar", description: "Importar leads desde Excel" },
      bulkUpdate: { label: "Actualización Masiva", description: "Actualizar múltiples leads" },
    },
  },
  
  // ─────────────────────────────────────────────────────────────────────────
  // Bases de Datos (with submodules)
  // ─────────────────────────────────────────────────────────────────────────
  
  bases: {
    code: "bases",
    name: "Bases de Datos",
    description: "Gestión de bases de datos",
    route: "/bases",
    icon: "HardDrive",
    order: 3,
    actions: {
      view: { label: "Ver", description: "Ver bases de datos" },
      create: { label: "Crear", description: "Crear nuevas bases" },
      edit: { label: "Editar", description: "Editar bases existentes" },
      delete: { label: "Eliminar", description: "Eliminar bases" },
      manageSources: { label: "Gestionar Fuentes", description: "Configurar datasources" },
      moveLeads: { label: "Mover Leads", description: "Mover leads entre bases" },
      manageLotes: { label: "Gestionar Lotes", description: "Administrar lotes" },
    },
  },
  
  datasources: {
    code: "datasources",
    name: "DataSources",
    description: "Configuración de fuentes de datos",
    route: "/datasources",
    icon: "GitBranch",
    order: 4,
    isSubModule: true,
    parentCode: "bases",
    actions: {
      view: { label: "Ver", description: "Ver fuentes de datos" },
      create: { label: "Crear", description: "Crear nuevas fuentes" },
      edit: { label: "Editar", description: "Editar fuentes existentes" },
      delete: { label: "Eliminar", description: "Eliminar fuentes" },
    },
  },
  
  moveLeads: {
    code: "move_leads",
    name: "Mover Leads",
    description: "Mover leads entre bases",
    route: "/move-leads",
    icon: "ArrowRightLeft",
    order: 5,
    isSubModule: true,
    parentCode: "bases",
    actions: {
      view: { label: "Ver", description: "Acceder a mover leads" },
      execute: { label: "Ejecutar", description: "Mover leads entre bases" },
    },
  },
  
  lotes: {
    code: "lotes",
    name: "Lotes",
    description: "Gestión de lotes de leads",
    route: "/lotes",
    icon: "Package",
    order: 6,
    isSubModule: true,
    parentCode: "bases",
    actions: {
      view: { label: "Ver", description: "Ver lotes" },
      create: { label: "Crear", description: "Crear nuevos lotes" },
      edit: { label: "Editar", description: "Editar lotes" },
      delete: { label: "Eliminar", description: "Eliminar lotes" },
    },
  },
  
  bulkUpdate: {
    code: "bulk_update",
    name: "Actualización Masiva",
    description: "Actualizar leads en masa",
    route: "/bulk-update",
    icon: "RefreshCw",
    order: 7,
    isSubModule: true,
    parentCode: "leads",
    actions: {
      view: { label: "Ver", description: "Acceder a actualización masiva" },
      execute: { label: "Ejecutar", description: "Ejecutar actualización masiva" },
    },
  },
  
  // ─────────────────────────────────────────────────────────────────────────
  // Automations & Webhooks
  // ─────────────────────────────────────────────────────────────────────────
  
  webhooks: {
    code: "webhooks",
    name: "Webhooks",
    description: "Configuración de webhooks",
    route: "/webhooks",
    icon: "Webhook",
    order: 10,
    actions: {
      view: { label: "Ver", description: "Ver webhooks" },
      create: { label: "Crear", description: "Crear webhooks" },
      edit: { label: "Editar", description: "Editar webhooks" },
      delete: { label: "Eliminar", description: "Eliminar webhooks" },
      test: { label: "Probar", description: "Probar webhooks" },
    },
  },
  
  automations: {
    code: "automations",
    name: "Automatizaciones",
    description: "Workflows y automatizaciones",
    route: "/automations",
    icon: "Workflow",
    order: 11,
    actions: {
      view: { label: "Ver", description: "Ver automatizaciones" },
      create: { label: "Crear", description: "Crear automatizaciones" },
      edit: { label: "Editar", description: "Editar automatizaciones" },
      delete: { label: "Eliminar", description: "Eliminar automatizaciones" },
      activate: { label: "Activar/Desactivar", description: "Activar o desactivar" },
    },
  },
  
  // ─────────────────────────────────────────────────────────────────────────
  // Call Center (VoIP)
  // ─────────────────────────────────────────────────────────────────────────
  
  callCenter: {
    code: "callcenter",
    name: "Call Center",
    description: "Centro de llamadas VoIP",
    route: "/callcenter/campaigns",
    icon: "Phone",
    order: 20,
    actions: {
      view: { label: "Ver", description: "Ver call center" },
      manageCampaigns: { label: "Gestionar Campañas", description: "Administrar campañas" },
      manageAgents: { label: "Gestionar Agentes", description: "Administrar agentes" },
      viewCDR: { label: "Ver CDR", description: "Ver registros de llamadas" },
      manageDNC: { label: "Gestionar DNC", description: "Administrar lista DNC" },
      configureProviders: { label: "Configurar Proveedores", description: "Configurar SIP providers" },
      configureTrunks: { label: "Configurar Trunks", description: "Configurar SIP trunks" },
      configurePBX: { label: "Configurar PBX", description: "Configurar nodos PBX" },
    },
  },
  
  campaigns: {
    code: "campaigns",
    name: "Campañas",
    description: "Campañas de llamadas",
    route: "/callcenter/campaigns",
    icon: "Megaphone",
    order: 21,
    isSubModule: true,
    parentCode: "callcenter",
    actions: {
      view: { label: "Ver", description: "Ver campañas" },
      create: { label: "Crear", description: "Crear campañas" },
      edit: { label: "Editar", description: "Editar campañas" },
      delete: { label: "Eliminar", description: "Eliminar campañas" },
      start: { label: "Iniciar", description: "Iniciar campaña" },
      stop: { label: "Detener", description: "Detener campaña" },
    },
  },
  
  voipAgents: {
    code: "voip_agents",
    name: "Agentes",
    description: "Agentes del call center",
    route: "/callcenter/agents",
    icon: "Headset",
    order: 22,
    isSubModule: true,
    parentCode: "callcenter",
    actions: {
      view: { label: "Ver", description: "Ver agentes" },
      create: { label: "Crear", description: "Crear agentes" },
      edit: { label: "Editar", description: "Editar agentes" },
      delete: { label: "Eliminar", description: "Eliminar agentes" },
    },
  },
  
  callRecords: {
    code: "call_records",
    name: "CDR",
    description: "Registros de llamadas",
    route: "/callcenter/cdr",
    icon: "PhoneCall",
    order: 23,
    isSubModule: true,
    parentCode: "callcenter",
    actions: {
      view: { label: "Ver", description: "Ver registros de llamadas" },
      export: { label: "Exportar", description: "Exportar CDR" },
    },
  },
  
  dncList: {
    code: "dnc_list",
    name: "DNC",
    description: "Lista de no llamar",
    route: "/callcenter/dnc",
    icon: "PhoneOff",
    order: 24,
    isSubModule: true,
    parentCode: "callcenter",
    actions: {
      view: { label: "Ver", description: "Ver lista DNC" },
      create: { label: "Agregar", description: "Agregar número a DNC" },
      delete: { label: "Eliminar", description: "Eliminar de DNC" },
      import: { label: "Importar", description: "Importar lista DNC" },
    },
  },
  
  dispositions: {
    code: "dispositions",
    name: "Disposiciones",
    description: "Resultados de llamadas",
    route: "/callcenter/dispositions",
    icon: "CheckCircle",
    order: 25,
    isSubModule: true,
    parentCode: "callcenter",
    actions: {
      view: { label: "Ver", description: "Ver disposiciones" },
      create: { label: "Crear", description: "Crear disposiciones" },
      edit: { label: "Editar", description: "Editar disposiciones" },
      delete: { label: "Eliminar", description: "Eliminar disposiciones" },
    },
  },
  
  sipProviders: {
    code: "sip_providers",
    name: "Proveedores SIP",
    description: "Proveedores VoIP",
    route: "/callcenter/providers",
    icon: "Globe",
    order: 26,
    isSubModule: true,
    parentCode: "callcenter",
    actions: {
      view: { label: "Ver", description: "Ver proveedores" },
      create: { label: "Crear", description: "Crear proveedores" },
      edit: { label: "Editar", description: "Editar proveedores" },
      delete: { label: "Eliminar", description: "Eliminar proveedores" },
    },
  },
  
  sipTrunks: {
    code: "sip_trunks",
    name: "Trunks SIP",
    description: "Trunks SIP",
    route: "/callcenter/trunks",
    icon: "Link",
    order: 27,
    isSubModule: true,
    parentCode: "callcenter",
    actions: {
      view: { label: "Ver", description: "Ver trunks" },
      create: { label: "Crear", description: "Crear trunks" },
      edit: { label: "Editar", description: "Editar trunks" },
      delete: { label: "Eliminar", description: "Eliminar trunks" },
    },
  },
  
  pbxNodes: {
    code: "pbx_nodes",
    name: "Nodos PBX",
    description: "Servidores Asterisk",
    route: "/callcenter/pbx",
    icon: "Server",
    order: 28,
    isSubModule: true,
    parentCode: "callcenter",
    actions: {
      view: { label: "Ver", description: "Ver nodos PBX" },
      create: { label: "Crear", description: "Crear nodos" },
      edit: { label: "Editar", description: "Editar nodos" },
      delete: { label: "Eliminar", description: "Eliminar nodos" },
    },
  },
  
  // ─────────────────────────────────────────────────────────────────────────
  // Admin
  // ─────────────────────────────────────────────────────────────────────────
  
  admin: {
    code: "admin",
    name: "Administración",
    description: "Administración del sistema",
    route: "/admin/users",
    icon: "Shield",
    order: 30,
    actions: {
      view: { label: "Ver", description: "Ver panel de admin" },
      manageUsers: { label: "Gestionar Usuarios", description: "Administrar usuarios" },
      manageRoles: { label: "Gestionar Roles", description: "Administrar roles" },
    },
  },
  
  usersAdmin: {
    code: "users_admin",
    name: "Usuarios",
    description: "Gestión de usuarios",
    route: "/admin/users",
    icon: "UserCog",
    order: 31,
    isSubModule: true,
    parentCode: "admin",
    actions: {
      view: { label: "Ver", description: "Ver usuarios" },
      create: { label: "Crear", description: "Crear usuarios" },
      edit: { label: "Editar", description: "Editar usuarios" },
      delete: { label: "Eliminar", description: "Eliminar usuarios" },
      resetPassword: { label: "Resetear Password", description: "Resetear contraseñas" },
    },
  },
  
  rolesAdmin: {
    code: "roles_admin",
    name: "Roles",
    description: "Gestión de roles y permisos",
    route: "/admin/roles",
    icon: "Lock",
    order: 32,
    isSubModule: true,
    parentCode: "admin",
    actions: {
      view: { label: "Ver", description: "Ver roles" },
      create: { label: "Crear", description: "Crear roles" },
      edit: { label: "Editar", description: "Editar roles" },
      delete: { label: "Eliminar", description: "Eliminar roles" },
      assignPermissions: { label: "Asignar Permisos", description: "Gestionar permisos" },
    },
  },
  
  tipificacionesAdmin: {
    code: "tipificaciones_admin",
    name: "Tipificaciones",
    description: "Gestión de tipificaciones y subtipificaciones",
    route: "/admin/tipificaciones",
    icon: "Tags",
    order: 33,
    isSubModule: true,
    parentCode: "admin",
    actions: {
      view: { label: "Ver", description: "Ver tipificaciones" },
      create: { label: "Crear", description: "Crear tipificaciones" },
      edit: { label: "Editar", description: "Editar tipificaciones" },
      delete: { label: "Eliminar", description: "Eliminar tipificaciones" },
      manageSub: { label: "Gestionar Subtipificaciones", description: "Administrar subtipificaciones" },
      assign: { label: "Tipificar Leads", description: "Asignar tipificaciones a leads" },
    },
  },
  
  campaniasAdmin: {
    code: "campanias_admin",
    name: "Campañas",
    description: "Gestión de campañas de contact center",
    route: "/admin/campanias",
    icon: "Megaphone",
    order: 34,
    isSubModule: true,
    parentCode: "admin",
    actions: {
      view: { label: "Ver", description: "Ver campañas" },
      create: { label: "Crear", description: "Crear campañas" },
      edit: { label: "Editar", description: "Editar campañas" },
      delete: { label: "Eliminar", description: "Eliminar campañas" },
      activate: { label: "Activar", description: "Activar campañas" },
      pause: { label: "Pausar", description: "Pausar campañas" },
      assignAgents: { label: "Asignar Agentes", description: "Asignar agentes a campañas" },
      assignBases: { label: "Asignar Bases", description: "Asignar bases a campañas" },
    },
  },
  
  auditoriaAdmin: {
    code: "auditoria_admin",
    name: "Auditoría",
    description: "Logs y auditoría del sistema",
    route: "/admin/auditoria",
    icon: "History",
    order: 35,
    isSubModule: true,
    parentCode: "admin",
    actions: {
      view: { label: "Ver", description: "Ver logs de auditoría" },
      export: { label: "Exportar", description: "Exportar logs" },
      config: { label: "Configurar", description: "Configurar retención" },
    },
  },
  
  // ─────────────────────────────────────────────────────────────────────────
  // Reportes (Nuevo módulo principal)
  // ─────────────────────────────────────────────────────────────────────────
  
  reportes: {
    code: "reportes",
    name: "Reportes",
    description: "Reportes y métricas del sistema",
    route: "/reportes",
    icon: "BarChart3",
    order: 40,
    actions: {
      view: { label: "Ver", description: "Ver reportes" },
      dashboard: { label: "Dashboard", description: "Ver dashboard general" },
      bases: { label: "Reporte Bases", description: "Ver reporte de bases" },
      agentes: { label: "Métricas Agentes", description: "Ver métricas de agentes" },
      campanas: { label: "Métricas Campañas", description: "Ver métricas de campañas" },
      monitor: { label: "Monitor", description: "Ver monitor en tiempo real" },
      export: { label: "Exportar", description: "Exportar reportes a Excel" },
    },
  },
  
  reportesBases: {
    code: "reportes_bases",
    name: "Reporte de Bases",
    description: "Gestión y exportación de bases",
    route: "/reportes/bases",
    icon: "Database",
    order: 41,
    isSubModule: true,
    parentCode: "reportes",
    actions: {
      view: { label: "Ver", description: "Ver reporte de bases" },
      export: { label: "Exportar Excel", description: "Exportar a Excel" },
    },
  },
  
  reportesAgentes: {
    code: "reportes_agentes",
    name: "Métricas de Agentes",
    description: "Productividad y tiempos",
    route: "/reportes/agentes",
    icon: "Users",
    order: 42,
    isSubModule: true,
    parentCode: "reportes",
    actions: {
      view: { label: "Ver", description: "Ver métricas de agentes" },
      export: { label: "Exportar Excel", description: "Exportar a Excel" },
    },
  },
  
  reportesMonitor: {
    code: "reportes_monitor",
    name: "Monitor",
    description: "Supervisión en tiempo real",
    route: "/reportes/monitor",
    icon: "Activity",
    order: 43,
    isSubModule: true,
    parentCode: "reportes",
    actions: {
      view: { label: "Ver", description: "Ver monitor" },
    },
  },
  
  // ─────────────────────────────────────────────────────────────────────────
  // Gestión de Contactos (Call Center Agent)
  // ─────────────────────────────────────────────────────────────────────────
  
  gestionContactos: {
    code: "gestion_contactos",
    name: "Gestión de Contactos",
    description: "Workspace para agentes de call center",
    route: "/callcenter/gestion",
    icon: "Headphones",
    order: 50,
    actions: {
      view: { label: "Ver", description: "Acceder a gestión" },
      entrarCampania: { label: "Entrar a Campaña", description: "Entrar a campaña" },
      solicitarFicha: { label: "Solicitar Ficha", description: "Solicitar ficha" },
      gestionarFicha: { label: "Gestionar Ficha", description: "Gestionar ficha" },
      tipificar: { label: "Tipificar", description: "Tipificar contacto" },
      saltarFicha: { label: "Saltar Ficha", description: "Saltar ficha" },
    },
  },
};

/** Type for module codes */
export type ModuleCode = keyof typeof MODULES_REGISTRY;

/** Get all modules as an array */
export function getModulesList(): UIModule[] {
  return Object.values(MODULES_REGISTRY).sort((a, b) => a.order - b.order);
}

/** Get main modules (not submodules) */
export function getMainModules(): UIModule[] {
  return getModulesList().filter((m) => !m.isSubModule);
}

/** Get submodules for a parent */
export function getSubModules(parentCode: string): UIModule[] {
  return getModulesList().filter(
    (m) => m.isSubModule && m.parentCode === parentCode
  );
}

/** Get a module by its route */
export function getModuleByRoute(route: string): UIModule | undefined {
  return Object.values(MODULES_REGISTRY).find((m) => m.route === route);
}

/** Get a module by its code */
export function getModuleByCode(code: string): UIModule | undefined {
  return MODULES_REGISTRY[code];
}

/** Convert registry to format expected by backend sync endpoint */
export function getModulesForSync(): Array<{
  codigo: string;
  nombre: string;
  descripcion?: string;
  ruta: string;
  icono?: string;
  orden: number;
  es_submodulo: boolean;
  parent_code?: string;
  acciones: Record<string, { label: string; description?: string }>;
}> {
  return Object.values(MODULES_REGISTRY).map((module) => ({
    codigo: module.code,
    nombre: module.name,
    descripcion: module.description,
    ruta: module.route,
    icono: module.icon,
    orden: module.order,
    es_submodulo: module.isSubModule ?? false,
    parent_code: module.parentCode,
    acciones: module.actions,
  }));
}
