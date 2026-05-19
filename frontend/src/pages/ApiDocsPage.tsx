import { useState } from "react"
import {
  Code2,
  Copy,
  Check,
  Eye,
  EyeOff,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  Key,
  Webhook,
  Zap,
  AlertTriangle,
} from "lucide-react"
import { useAccount } from "@/context/AccountContext"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getAccount, regenerateApiKey, regenerateWebhookSecret } from "@/api/accounts"
import ConfirmDialog from "@/components/ui/ConfirmDialog"

const BASE_URL = import.meta.env.VITE_API_URL || "https://web-production-7d1a.up.railway.app"

// ── Copy button with feedback ─────────────────────────────────────────────────

function CopyButton({ text, className = "" }: { text: string; className?: string }) {
  const [copied, setCopied] = useState(false)
  const handle = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button
      onClick={handle}
      className={`inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium transition-colors ${
        copied
          ? "bg-green-100 text-green-700"
          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
      } ${className}`}
    >
      {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
      {copied ? "Copiado" : "Copiar"}
    </button>
  )
}

// ── Secret field with reveal/copy ────────────────────────────────────────────

function SecretField({
  label,
  value,
  onRegenerate,
  regenerating,
}: {
  label: string
  value: string
  onRegenerate: () => void
  regenerating: boolean
}) {
  const [visible, setVisible] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)

  const masked = value.slice(0, 6) + "•".repeat(Math.max(0, value.length - 10)) + value.slice(-4)

  return (
    <>
      <div className="rounded-lg border border-border bg-gray-50 p-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
          {label}
        </p>
        <div className="flex items-center gap-2">
          <code className="flex-1 font-mono text-sm text-foreground break-all">
            {visible ? value : masked}
          </code>
          <div className="flex shrink-0 items-center gap-1">
            <button
              onClick={() => setVisible(!visible)}
              className="rounded p-1.5 text-gray-400 hover:bg-gray-200 hover:text-gray-600 transition-colors"
              title={visible ? "Ocultar" : "Mostrar"}
            >
              {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
            <CopyButton text={value} />
            <button
              onClick={() => setConfirmOpen(true)}
              disabled={regenerating}
              className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors disabled:opacity-50"
              title="Regenerar"
            >
              <RefreshCw className={`h-3 w-3 ${regenerating ? "animate-spin" : ""}`} />
              Regenerar
            </button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={`Regenerar ${label}`}
        description={`¿Estás seguro? Los sistemas que usen esta clave dejarán de funcionar hasta que la actualices.`}
        confirmLabel="Sí, regenerar"
        variant="danger"
        onConfirm={() => {
          setConfirmOpen(false)
          onRegenerate()
        }}
      />
    </>
  )
}

// ── Method badge ──────────────────────────────────────────────────────────────

const METHOD_COLORS: Record<string, string> = {
  GET: "bg-green-100 text-green-700",
  POST: "bg-blue-100 text-blue-700",
  PUT: "bg-yellow-100 text-yellow-700",
  PATCH: "bg-purple-100 text-purple-700",
  DELETE: "bg-red-100 text-red-700",
}

function MethodBadge({ method }: { method: string }) {
  return (
    <span
      className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-bold font-mono ${
        METHOD_COLORS[method] ?? "bg-gray-100 text-gray-700"
      }`}
    >
      {method}
    </span>
  )
}

// ── Endpoint card ─────────────────────────────────────────────────────────────

interface EndpointDef {
  method: string
  path: string
  description: string
  notes?: string[]
  curl: string
  auth: "api_key" | "jwt" | "none"
}

function EndpointCard({ ep }: { ep: EndpointDef }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="rounded-lg border border-border bg-white overflow-hidden">
      {/* Header row */}
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setOpen(!open)}
      >
        <MethodBadge method={ep.method} />
        <code className="flex-1 font-mono text-sm text-foreground break-all">{ep.path}</code>
        {ep.auth === "api_key" && (
          <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-600">
            <Key className="h-3 w-3" />
            API Key
          </span>
        )}
        {ep.auth === "jwt" && (
          <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-purple-50 px-2 py-0.5 text-xs text-purple-600">
            <Key className="h-3 w-3" />
            JWT
          </span>
        )}
        {open ? (
          <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
        )}
      </div>

      {/* Expanded */}
      {open && (
        <div className="border-t border-border px-4 py-4 space-y-3">
          <p className="text-sm text-muted-foreground">{ep.description}</p>

          {ep.notes && ep.notes.length > 0 && (
            <ul className="list-disc list-inside space-y-1">
              {ep.notes.map((n, i) => (
                <li key={i} className="text-xs text-gray-500">
                  {n}
                </li>
              ))}
            </ul>
          )}

          {/* Code block */}
          <div className="rounded-lg bg-gray-900 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 border-b border-gray-700">
              <span className="text-xs text-gray-400 font-mono">curl</span>
              <CopyButton text={ep.curl} className="bg-gray-700 text-gray-300 hover:bg-gray-600" />
            </div>
            <pre className="px-4 py-3 text-xs text-gray-100 font-mono overflow-x-auto whitespace-pre-wrap">
              {ep.curl}
            </pre>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function ApiDocsPage() {
  const { selectedAccount } = useAccount()
  const queryClient = useQueryClient()

  const { data: account, isLoading } = useQuery({
    queryKey: ["account", selectedAccount?.id],
    queryFn: () => getAccount(selectedAccount!.id),
    enabled: !!selectedAccount?.id,
    staleTime: 30_000,
  })

  const regenKey = useMutation({
    mutationFn: () => regenerateApiKey(account!.id),
    onSuccess: (updated) => {
      queryClient.setQueryData(["account", account!.id], updated)
    },
  })

  const regenSecret = useMutation({
    mutationFn: () => regenerateWebhookSecret(account!.id),
    onSuccess: (updated) => {
      queryClient.setQueryData(["account", account!.id], updated)
    },
  })

  if (!selectedAccount) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        Selecciona una cuenta para ver la documentación de integración.
      </div>
    )
  }

  const apiKey = account?.api_key ?? selectedAccount.api_key
  const accountId = account?.id ?? selectedAccount.id
  const webhookSecret = account?.webhook_secret ?? ""

  // Build endpoint definitions with live values
  const endpoints: { category: string; icon: React.ReactNode; items: EndpointDef[] }[] = [
    {
      category: "Ingesta de Datos",
      icon: <Zap className="h-4 w-4" />,
      items: [
        {
          method: "POST",
          path: `/api/v1/ingest/${apiKey}`,
          auth: "api_key",
          description:
            "Envía datos de leads desde sistemas externos (formularios, CRMs, plataformas de ads). El API key identifica la cuenta destino.",
          notes: [
            "Los campos del JSON deben coincidir con los campos configurados en la cuenta.",
            "Si auto_crear_campos=true, los campos nuevos se crean automáticamente.",
            "Incluye X-Idempotency-Key para evitar duplicados.",
            "Incluye X-Signature (HMAC-SHA256 con webhook_secret) para verificar origen.",
          ],
          curl: `curl -X POST "${BASE_URL}/api/v1/ingest/${apiKey}" \\
  -H "Content-Type: application/json" \\
  -H "X-Idempotency-Key: unique-id-123" \\
  -d '{
    "nombre": "Juan Pérez",
    "email": "juan@ejemplo.com",
    "telefono": "1155556789",
    "origen": "formulario-web"
  }'`,
        },
      ],
    },
    {
      category: "Autenticación",
      icon: <Key className="h-4 w-4" />,
      items: [
        {
          method: "POST",
          path: `/api/v1/auth/login`,
          auth: "none",
          description:
            "Obtiene tokens JWT para autenticación de usuarios del sistema. Incluir cuenta_id para login en cuenta específica.",
          notes: [
            "access_token expira en 30 minutos.",
            "Usar refresh_token para renovar sin re-login.",
          ],
          curl: `curl -X POST "${BASE_URL}/api/v1/auth/login" \\
  -H "Content-Type: application/json" \\
  -d '{
    "username": "usuario",
    "password": "contraseña",
    "cuenta_id": "${accountId}"
  }'`,
        },
        {
          method: "POST",
          path: `/api/v1/auth/refresh`,
          auth: "jwt",
          description: "Renueva el access_token usando el refresh_token.",
          curl: `curl -X POST "${BASE_URL}/api/v1/auth/refresh" \\
  -H "Authorization: Bearer <refresh_token>"`,
        },
      ],
    },
    {
      category: "Leads",
      icon: <Code2 className="h-4 w-4" />,
      items: [
        {
          method: "GET",
          path: `/api/v1/admin/accounts/${accountId}/leads`,
          auth: "jwt",
          description: "Lista los leads de la cuenta con paginación y filtros.",
          notes: [
            "Requiere Bearer JWT en el header Authorization.",
            "Parámetros: page, page_size, search, base_id, lote_id.",
          ],
          curl: `curl -X GET "${BASE_URL}/api/v1/admin/accounts/${accountId}/leads?page=1&page_size=20" \\
  -H "Authorization: Bearer <access_token>"`,
        },
        {
          method: "GET",
          path: `/api/v1/admin/accounts/${accountId}/fields`,
          auth: "jwt",
          description: "Lista los campos personalizados configurados para la cuenta.",
          curl: `curl -X GET "${BASE_URL}/api/v1/admin/accounts/${accountId}/fields" \\
  -H "Authorization: Bearer <access_token>"`,
        },
      ],
    },
    {
      category: "Webhooks Salientes",
      icon: <Webhook className="h-4 w-4" />,
      items: [
        {
          method: "GET",
          path: `/api/v1/admin/accounts/${accountId}/webhooks`,
          auth: "jwt",
          description: "Lista los webhooks configurados para la cuenta.",
          curl: `curl -X GET "${BASE_URL}/api/v1/admin/accounts/${accountId}/webhooks" \\
  -H "Authorization: Bearer <access_token>"`,
        },
        {
          method: "POST",
          path: `/api/v1/admin/accounts/${accountId}/webhooks`,
          auth: "jwt",
          description:
            "Crea un webhook saliente. El sistema enviará un POST a tu URL con los eventos seleccionados.",
          notes: [
            "Cada request incluye el header X-Signature con firma HMAC-SHA256.",
            `Verificar firma: HMAC-SHA256(webhook_secret, body)`,
            "Eventos disponibles: lead.created, lead.updated, lead.assigned.",
          ],
          curl: `curl -X POST "${BASE_URL}/api/v1/admin/accounts/${accountId}/webhooks" \\
  -H "Authorization: Bearer <access_token>" \\
  -H "Content-Type: application/json" \\
  -d '{
    "nombre": "Mi Webhook",
    "url": "https://mi-sistema.com/webhook",
    "eventos": ["lead.created", "lead.updated"],
    "activo": true
  }'`,
        },
      ],
    },
  ]

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Page header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <Code2 className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">API & Integración</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Credenciales y referencia de endpoints para integrar sistemas externos con{" "}
          <span className="font-medium text-foreground">{selectedAccount.nombre}</span>.
        </p>
      </div>

      {/* Base URL chip */}
      <div className="flex items-center gap-2 rounded-lg border border-border bg-gray-50 px-4 py-3">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Base URL
        </span>
        <code className="flex-1 font-mono text-sm text-foreground">{BASE_URL}</code>
        <CopyButton text={BASE_URL} />
      </div>

      {/* Credentials */}
      <section>
        <h2 className="text-base font-semibold text-foreground mb-3 flex items-center gap-2">
          <Key className="h-4 w-4 text-primary" />
          Credenciales
        </h2>

        {isLoading ? (
          <div className="space-y-3">
            <div className="h-16 rounded-lg bg-gray-100 animate-pulse" />
            <div className="h-16 rounded-lg bg-gray-100 animate-pulse" />
          </div>
        ) : (
          <div className="space-y-3">
            <SecretField
              label="API Key (Ingesta)"
              value={apiKey}
              onRegenerate={() => regenKey.mutate()}
              regenerating={regenKey.isPending}
            />
            {webhookSecret && (
              <SecretField
                label="Webhook Secret (firma HMAC)"
                value={webhookSecret}
                onRegenerate={() => regenSecret.mutate()}
                regenerating={regenSecret.isPending}
              />
            )}
          </div>
        )}

        <div className="mt-3 flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 px-4 py-3">
          <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700">
            Nunca compartas el API Key ni el Webhook Secret públicamente. Regenerar una clave
            invalida la anterior inmediatamente.
          </p>
        </div>
      </section>

      {/* Endpoints */}
      <section>
        <h2 className="text-base font-semibold text-foreground mb-3 flex items-center gap-2">
          <Code2 className="h-4 w-4 text-primary" />
          Endpoints disponibles
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          Haz clic en un endpoint para ver descripción y ejemplo de uso. Las URLs ya incluyen los
          valores de tu cuenta.
        </p>

        <div className="space-y-6">
          {endpoints.map((group) => (
            <div key={group.category}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-muted-foreground">{group.icon}</span>
                <h3 className="text-sm font-semibold text-foreground">{group.category}</h3>
              </div>
              <div className="space-y-2">
                {group.items.map((ep) => (
                  <EndpointCard key={`${ep.method}-${ep.path}`} ep={ep} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Account ID reference */}
      <section className="rounded-lg border border-border bg-gray-50 p-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
          Account ID (referencia)
        </p>
        <div className="flex items-center gap-2">
          <code className="flex-1 font-mono text-sm text-foreground">{accountId}</code>
          <CopyButton text={accountId} />
        </div>
      </section>
    </div>
  )
}
