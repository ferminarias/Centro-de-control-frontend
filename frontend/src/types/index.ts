// ── Accounts ──

export interface AccountResponse {
  id: string
  nombre: string
  api_key: string
  activo: boolean
  auto_crear_campos: boolean
  created_at: string
  updated_at: string
}

export interface AccountListResponse {
  items: AccountResponse[]
  total: number
}

export interface AccountCreate {
  nombre: string
  auto_crear_campos?: boolean
}

export interface AccountUpdate {
  nombre?: string
  activo?: boolean
  auto_crear_campos?: boolean
}

// ── Fields ──

export type TipoDato = "string" | "number" | "boolean" | "datetime" | "email" | "phone"

export interface FieldResponse {
  id: string
  cuenta_id: string
  nombre_campo: string
  tipo_dato: TipoDato
  descripcion: string | null
  es_requerido: boolean
  created_at: string
}

export interface FieldListResponse {
  items: FieldResponse[]
  total: number
}

export interface FieldCreate {
  nombre_campo: string
  tipo_dato?: TipoDato
  descripcion?: string
  es_requerido?: boolean
}

export interface FieldUpdate {
  tipo_dato?: TipoDato
  descripcion?: string
  es_requerido?: boolean
}

// ── Leads ──

export interface LeadResponse {
  id: string
  id_lead: number
  cuenta_id: string
  record_id: string
  lead_base_id: string | null
  base_nombre: string | null
  lote_id: string | null
  lote_nombre: string | null
  datos: Record<string, unknown>
  created_at: string
  // CRM fields
  score?: number
  temperatura?: 'frio' | 'templado' | 'caliente'
  tipificacion_id?: string
  tipificacion?: {
    id: string
    nombre: string
    color: string
  }
  subtipificacion_id?: string
  subtipificacion?: {
    id: string
    nombre: string
    color: string
  }
  assigned_to_id?: string
  assigned_to?: {
    id: string
    nombre: string
    email: string
  }
  assigned_at?: string
  assigned_by_rule?: string
  updated_at?: string
}

export interface BulkUpdateResponse {
  updated: number
  not_found_ids: number[]
  errors: string[]
}

export interface LeadListResponse {
  items: LeadResponse[]
  total: number
  page: number
  page_size: number
}

// ── Records ──

export interface RecordResponse {
  id: string
  cuenta_id: string
  datos: Record<string, unknown>
  metadata_: {
    source_ip: string | null
    unknown_fields: string[] | null
  } | null
  created_at: string
}

export interface RecordListResponse {
  items: RecordResponse[]
  total: number
  page: number
  page_size: number
}

// ── Lead Bases ──

export interface LeadBaseResponse {
  id: string
  cuenta_id: string
  nombre: string
  descripcion: string | null
  es_default: boolean
  created_at: string
  updated_at: string
  leads_count?: number
  total_leads?: number
}

export interface LeadBaseListResponse {
  items: LeadBaseResponse[]
  total: number
}

export interface LeadBaseCreate {
  nombre: string
  descripcion?: string
  es_default?: boolean
}

export interface LeadBaseUpdate {
  nombre?: string
  descripcion?: string
  es_default?: boolean
}

// ── Routing Rules ──

export type RuleOperator = "equals" | "not_equals" | "contains" | "greater_than" | "less_than"

export interface RoutingRuleResponse {
  id: string
  lead_base_id: string
  campo: string
  operador: RuleOperator
  valor: string
  prioridad: number
  created_at: string
}

export interface RoutingRuleListResponse {
  items: RoutingRuleResponse[]
  total: number
}

export interface RoutingRuleCreate {
  campo: string
  operador: RuleOperator
  valor: string
  prioridad?: number
}

export interface RoutingRuleUpdate {
  campo?: string
  operador?: RuleOperator
  valor?: string
  prioridad?: number
}

// ── Lotes ──

export interface LoteResponse {
  id: string
  cuenta_id: string
  nombre: string
  lead_base_id: string | null
  total_leads: number
  created_at: string
}

export interface LoteListResponse {
  items: LoteResponse[]
  total: number
}

export interface LoteAssociateRequest {
  lead_base_id: string | null
}

export interface LoteAssociateResponse {
  lote_id: string
  lead_base_id: string | null
  moved: number
}

// ── Roles ──

export interface RoleResponse {
  id: string
  cuenta_id: string
  nombre: string
  descripcion: string | null
  permisos: string[]
  total_users?: number
  created_at: string
}

export interface RoleListResponse {
  items: RoleResponse[]
  total: number
}

export interface RoleCreate {
  nombre: string
  descripcion?: string
  permisos: string[]
}

export interface RoleUpdate {
  nombre?: string
  descripcion?: string
  permisos?: string[]
}

// ── Users ──

export interface UserResponse {
  id: string
  cuenta_id: string
  role_id: string | null
  nombre: string
  apellido: string
  email: string
  username: string
  role_nombre: string | null
  activo: boolean
  created_at: string
  updated_at: string
}

export interface UserListResponse {
  items: UserResponse[]
  total: number
  page: number
  page_size: number
}

export interface UserCreate {
  nombre: string
  apellido: string
  email: string
  username: string
  password: string
  role_id?: string | null
  activo?: boolean
}

export interface UserUpdate {
  nombre?: string
  apellido?: string
  email?: string
  username?: string
  password?: string
  role_id?: string | null
  activo?: boolean
}

// ── Permissions ──

export interface PermissionsResponse {
  permissions: string[]
  grouped: Record<string, string[]>
}

// ── Webhooks ──

export interface WebhookResponse {
  id: string
  cuenta_id: string
  nombre: string
  url: string
  eventos: string[]
  headers_custom: Record<string, string> | null
  secret: string | null
  activo: boolean
  created_at: string
  updated_at: string
}

export interface WebhookListResponse {
  items: WebhookResponse[]
  total: number
}

export interface WebhookCreate {
  nombre: string
  url: string
  eventos: string[]
  headers_custom?: Record<string, string>
  secret?: string
}

export interface WebhookUpdate {
  nombre?: string
  url?: string
  eventos?: string[]
  headers_custom?: Record<string, string>
  secret?: string
  activo?: boolean
}

export interface WebhookLogResponse {
  id: string
  webhook_id: string
  evento: string
  payload: Record<string, unknown>
  status_code: number | null
  response_body: string | null
  error: string | null
  duration_ms: number | null
  created_at: string
}

export interface WebhookLogListResponse {
  items: WebhookLogResponse[]
  total: number
  page: number
  page_size: number
}

export interface WebhookTestResponse {
  status_code: number | null
  response_body: string | null
  error: string | null
  duration_ms: number | null
}

// ── Automations ──

export interface AutomationConditionResponse {
  id: string
  automation_id: string
  campo: string
  operador: string
  valor: string
  orden: number
}

export interface AutomationActionResponse {
  id: string
  automation_id: string
  tipo: string
  config: Record<string, unknown>
  orden: number
}

export interface AutomationResponse {
  id: string
  cuenta_id: string
  nombre: string
  descripcion: string | null
  trigger_tipo: string
  trigger_config: Record<string, unknown> | null
  activo: boolean
  conditions: AutomationConditionResponse[]
  actions: AutomationActionResponse[]
  created_at: string
  updated_at: string
}

export interface AutomationListResponse {
  items: AutomationResponse[]
  total: number
}

export interface AutomationConditionCreate {
  campo: string
  operador: string
  valor: string
  orden: number
}

export interface AutomationActionCreate {
  tipo: string
  config: Record<string, unknown>
  orden: number
}

export interface AutomationCreate {
  nombre: string
  descripcion?: string
  trigger_tipo: string
  trigger_config?: Record<string, unknown>
  conditions?: AutomationConditionCreate[]
  actions?: AutomationActionCreate[]
}

export interface AutomationUpdate {
  nombre?: string
  descripcion?: string
  trigger_tipo?: string
  trigger_config?: Record<string, unknown>
  activo?: boolean
}

export interface AutomationLogResponse {
  id: string
  automation_id: string
  lead_id: string | null
  trigger_evento: string
  conditions_passed: boolean
  actions_result: Record<string, unknown>[] | null
  error: string | null
  created_at: string
}

export interface AutomationLogListResponse {
  items: AutomationLogResponse[]
  total: number
  page: number
  page_size: number
}

export interface AutomationMeta {
  trigger_types: string[]
  action_types: string[]
  condition_operators: string[]
}

// ── VoIP / Call Center ──

export type CampaignStatus = "idle" | "running" | "paused" | "completed"
export type CampaignMode = "manual" | "progressive" | "predictive"
export type AgentStatus = "offline" | "available" | "on_call" | "wrap_up" | "paused"
export type CampaignLeadStatus = "pending" | "dialing" | "contacted" | "no_answer" | "busy" | "failed" | "completed" | "callback" | "dnc"

export interface SipProviderResponse {
  id: string
  cuenta_id: string
  nombre: string
  host: string
  puerto: number
  protocolo: string
  activo: boolean
  created_at: string
}
export interface SipProviderListResponse { items: SipProviderResponse[]; total: number }
export interface SipProviderCreate { nombre: string; host: string; puerto?: number; protocolo?: string }
export interface SipProviderUpdate { nombre?: string; host?: string; puerto?: number; protocolo?: string; activo?: boolean }

export interface SipTrunkResponse {
  id: string
  provider_id: string
  nombre: string
  username: string
  auth_type: string
  max_channels: number
  activo: boolean
  created_at: string
}
export interface SipTrunkListResponse { items: SipTrunkResponse[]; total: number }
export interface SipTrunkCreate { nombre: string; username: string; password?: string; auth_type?: string; max_channels?: number }
export interface SipTrunkUpdate { nombre?: string; username?: string; password?: string; max_channels?: number; activo?: boolean }

export interface PbxNodeResponse {
  id: string
  cuenta_id: string
  nombre: string
  host: string
  ami_port: number
  ami_user: string
  activo: boolean
  created_at: string
}
export interface PbxNodeListResponse { items: PbxNodeResponse[]; total: number }
export interface PbxNodeCreate { nombre: string; host: string; ami_port?: number; ami_user: string; ami_password: string }
export interface PbxNodeUpdate { nombre?: string; host?: string; ami_port?: number; ami_user?: string; ami_password?: string; activo?: boolean }

export interface AgentResponse {
  id: string
  cuenta_id: string
  nombre: string
  extension: string
  estado: AgentStatus
  activo: boolean
  created_at: string
}
export interface AgentListResponse { items: AgentResponse[]; total: number }
export interface AgentCreate { nombre: string; extension: string }
export interface AgentUpdate { nombre?: string; extension?: string; activo?: boolean }

export interface DispositionResponse {
  id: string
  cuenta_id: string
  nombre: string
  categoria: string
  es_contacto: boolean
  requiere_callback: boolean
  created_at: string
}
export interface DispositionListResponse { items: DispositionResponse[]; total: number }
export interface DispositionCreate { nombre: string; categoria?: string; es_contacto?: boolean; requiere_callback?: boolean }
export interface DispositionUpdate { nombre?: string; categoria?: string; es_contacto?: boolean; requiere_callback?: boolean }

export interface CampaignResponse {
  id: string
  cuenta_id: string
  nombre: string
  descripcion: string | null
  modo: CampaignMode
  estado: CampaignStatus
  trunk_id: string | null
  caller_id: string | null
  max_concurrent: number
  total_leads: number
  created_at: string
  updated_at: string
}
export interface CampaignListResponse { items: CampaignResponse[]; total: number }
export interface CampaignCreate { nombre: string; descripcion?: string; modo?: CampaignMode; trunk_id?: string; caller_id?: string; max_concurrent?: number }
export interface CampaignUpdate { nombre?: string; descripcion?: string; modo?: CampaignMode; trunk_id?: string; caller_id?: string; max_concurrent?: number }

export interface CampaignLeadResponse {
  id: string
  campaign_id: string
  lead_id: string
  id_lead: number
  telefono: string
  estado: CampaignLeadStatus
  intentos: number
  disposition_id: string | null
  disposition_nombre: string | null
  ultimo_intento: string | null
  callback_at: string | null
  datos: Record<string, unknown>
}
export interface CampaignLeadListResponse { items: CampaignLeadResponse[]; total: number; page: number; page_size: number }

export interface CampaignStatsResponse {
  total_leads: number
  contacted: number
  pending: number
  completed: number
  failed: number
  asr: number
  aht: number
  contact_rate: number
}

export interface CallRecordResponse {
  id: string
  cuenta_id: string
  campaign_id: string | null
  agent_id: string | null
  agent_nombre: string | null
  campaign_lead_id: string | null
  telefono: string
  direccion: string
  estado: string
  duracion: number | null
  duracion_conversacion: number | null
  disposition_id: string | null
  disposition_nombre: string | null
  grabacion_url: string | null
  created_at: string
}
export interface CallRecordListResponse { items: CallRecordResponse[]; total: number; page: number; page_size: number }

export interface CallEventResponse {
  id: string
  call_record_id: string
  evento: string
  detalle: string | null
  created_at: string
}

export interface DncEntryResponse {
  id: string
  cuenta_id: string
  telefono: string
  motivo: string | null
  created_at: string
}
export interface DncListResponse { items: DncEntryResponse[]; total: number; page: number; page_size: number }
export interface DncCreate { telefono: string; motivo?: string }

export interface ManualCallResponse {
  call_id: string
  status: string
  channel: string | null
}

// ── Ingest ──

export interface IngestResponse {
  success: boolean
  record_id: string
  lead_id: string
  unknown_fields: string[]
  auto_create_enabled: boolean
  fields_created: string[] | null
}

// ── UI Modules (Permissions) ──

export interface UIModuleResponse {
  id: string
  cuenta_id: string | null
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
  created_at: string
  updated_at: string
}

export interface UIModuleListResponse {
  items: UIModuleResponse[]
  total: number
}

export interface ModulePermissionResponse {
  module_id: string
  codigo: string
  nombre: string
  acciones_permitidas: string[]
}

// ── Tipificaciones ──

export interface SubtipificacionResponse {
  id: string
  tipificacion_id: string
  cuenta_id: string
  nombre: string
  descripcion?: string
  color?: string
  orden: number
  activo: boolean
  created_at: string
  updated_at: string
}

export interface TipificacionResponse {
  id: string
  cuenta_id: string
  nombre: string
  descripcion?: string
  color: string
  orden: number
  activo: boolean
  es_final: boolean
  subtipificaciones: SubtipificacionResponse[]
  total_subtipificaciones: number
  total_leads: number
  created_at: string
  updated_at: string
}

export interface TipificacionListResponse {
  items: TipificacionResponse[]
  total: number
}

export interface SubtipificacionListResponse {
  items: SubtipificacionResponse[]
  total: number
}

export interface TipificacionCreate {
  nombre: string
  descripcion?: string
  color?: string
  orden?: number
  activo?: boolean
  es_final?: boolean
  subtipificaciones?: SubtipificacionCreate[]
}

export interface SubtipificacionCreate {
  nombre: string
  descripcion?: string
  color?: string
  orden?: number
  activo?: boolean
}

export interface TipificacionUpdate {
  nombre?: string
  descripcion?: string
  color?: string
  orden?: number
  activo?: boolean
  es_final?: boolean
}

export interface SubtipificacionUpdate {
  nombre?: string
  descripcion?: string
  color?: string
  orden?: number
  activo?: boolean
}

export interface LeadTipificacionUpdate {
  tipificacion_id?: string | null
  subtipificacion_id?: string | null
}

export interface TipificacionStats {
  id: string
  nombre: string
  color: string
  count: number
  subtipificaciones: Array<{
    id: string
    nombre: string
    color?: string
    count: number
  }>
}

// ── CRM Extras (Actividades, Tareas, Notas, Tags, AuditLog) ──

export interface ActividadResponse {
  id: string
  cuenta_id: string
  lead_id: string
  user_id?: string
  tipo: string
  direccion: string
  asunto?: string
  descripcion?: string
  metadata?: Record<string, any>
  fecha_inicio: string
  fecha_fin?: string
  resultado?: string
  created_at: string
  updated_at: string
  user_nombre?: string
  lead_nombre?: string
}

export interface ActividadListResponse {
  items: ActividadResponse[]
  total: number
}

export interface ActividadCreate {
  lead_id: string
  tipo: string
  direccion?: string
  asunto?: string
  descripcion?: string
  metadata?: Record<string, any>
  fecha_inicio: string
  fecha_fin?: string
  resultado?: string
  user_id?: string
}

export interface ActividadUpdate {
  tipo?: string
  asunto?: string
  descripcion?: string
  metadata?: Record<string, any>
  fecha_inicio?: string
  fecha_fin?: string
  resultado?: string
}

export interface TareaResponse {
  id: string
  cuenta_id: string
  lead_id?: string
  user_id?: string
  titulo: string
  descripcion?: string
  tipo: string
  prioridad: string
  estado: string
  fecha_vencimiento?: string
  fecha_completada?: string
  es_recurrente: boolean
  frecuencia?: string
  recordatorio_enviado: boolean
  created_at: string
  updated_at: string
  user_nombre?: string
  lead_nombre?: string
}

export interface TareaListResponse {
  items: TareaResponse[]
  total: number
}

export interface TareaStats {
  pendientes: number
  vencidas: number
  completadas_hoy: number
  completadas_semana: number
}

export interface TareaCreate {
  lead_id?: string
  titulo: string
  descripcion?: string
  tipo?: string
  prioridad?: string
  estado?: string
  fecha_vencimiento?: string
  es_recurrente?: boolean
  frecuencia?: string
  user_id?: string
}

export interface TareaUpdate {
  titulo?: string
  descripcion?: string
  tipo?: string
  prioridad?: string
  estado?: string
  fecha_vencimiento?: string
  es_recurrente?: boolean
  frecuencia?: string
}

export interface NotaResponse {
  id: string
  cuenta_id: string
  lead_id: string
  user_id?: string
  contenido: string
  tipo: string
  es_privada: boolean
  es_sistema: boolean
  created_at: string
  updated_at: string
  user_nombre?: string
}

export interface NotaListResponse {
  items: NotaResponse[]
  total: number
}

export interface NotaCreate {
  contenido: string
  tipo?: string
  es_privada?: boolean
}

export interface NotaUpdate {
  contenido?: string
  es_privada?: boolean
}

export interface TagResponse {
  id: string
  cuenta_id: string
  nombre: string
  color: string
  descripcion?: string
  es_sistema: boolean
  orden: number
  activo: boolean
  created_at: string
  total_leads?: number
}

export interface TagListResponse {
  items: TagResponse[]
  total: number
}

export interface TagCreate {
  nombre: string
  color?: string
  descripcion?: string
  orden?: number
  activo?: boolean
}

export interface TagUpdate {
  nombre?: string
  color?: string
  descripcion?: string
  orden?: number
  activo?: boolean
}

export interface LeadTimelineItem {
  tipo: string
  fecha: string
  titulo: string
  descripcion?: string
  usuario?: string
  metadata?: Record<string, any>
}

export interface AuditLogResponse {
  id: string
  cuenta_id: string
  user_id?: string
  entidad_tipo: string
  entidad_id: string
  accion: string
  campo?: string
  valor_anterior?: string
  valor_nuevo?: string
  snapshot?: Record<string, any>
  ip_address?: string
  endpoint?: string
  created_at: string
  user_nombre?: string
  user_email?: string
}

export interface AuditLogListResponse {
  items: AuditLogResponse[]
  total: number
}
