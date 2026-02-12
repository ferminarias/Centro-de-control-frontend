import { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { Send } from "lucide-react"
import { sendTestWebhook } from "@/api/records"
import Badge from "@/components/ui/Badge"
import CopyButton from "@/components/ui/CopyButton"
import type { IngestResponse } from "@/types"

const DEFAULT_JSON = JSON.stringify(
  {
    nombre: "Juan Perez",
    email: "juan@ejemplo.com",
    telefono: "+52 555 123 4567",
    empresa: "Mi Empresa",
    interesado_en: "Plan Pro",
  },
  null,
  2
)

interface Props {
  apiKey: string
}

export default function WebhookTestTab({ apiKey }: Props) {
  const [jsonInput, setJsonInput] = useState(DEFAULT_JSON)
  const [result, setResult] = useState<IngestResponse | null>(null)
  const [parseError, setParseError] = useState<string | null>(null)

  const mutation = useMutation({
    mutationFn: (payload: unknown) => sendTestWebhook(apiKey, payload),
    onSuccess: (data) => setResult(data),
  })

  const handleSend = () => {
    setParseError(null)
    setResult(null)
    try {
      const parsed = JSON.parse(jsonInput)
      mutation.mutate(parsed)
    } catch {
      setParseError("JSON invalido. Verifica la sintaxis.")
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <label className="text-sm font-medium text-foreground mb-2 block">
          JSON de prueba
        </label>
        <textarea
          value={jsonInput}
          onChange={(e) => setJsonInput(e.target.value)}
          rows={10}
          className="w-full rounded-lg border border-border bg-muted px-4 py-3 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-y"
          spellCheck={false}
        />
        {parseError && (
          <p className="text-sm text-destructive mt-1">{parseError}</p>
        )}
        {mutation.isError && (
          <p className="text-sm text-destructive mt-1">Error al enviar el webhook</p>
        )}
      </div>

      <button
        onClick={handleSend}
        disabled={mutation.isPending}
        className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary/90 transition-colors disabled:opacity-50"
      >
        <Send className="h-4 w-4" />
        {mutation.isPending ? "Enviando..." : "Enviar webhook de prueba"}
      </button>

      {result && (
        <div className="rounded-xl border border-border bg-muted/50 p-6 space-y-4">
          <h4 className="text-sm font-semibold text-foreground">Respuesta</h4>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Record ID:</span>
            <code className="text-sm font-mono">{result.record_id}</code>
            <CopyButton text={result.record_id} />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Auto-crear campos:</span>
            <Badge variant={result.auto_create_enabled ? "success" : "danger"}>
              {result.auto_create_enabled ? "ON" : "OFF"}
            </Badge>
          </div>

          {result.fields_created && result.fields_created.length > 0 && (
            <div>
              <span className="text-sm text-muted-foreground block mb-1.5">Campos creados:</span>
              <div className="flex flex-wrap gap-1.5">
                {result.fields_created.map((f) => (
                  <Badge key={f} variant="success">Campo creado: {f}</Badge>
                ))}
              </div>
            </div>
          )}

          {result.unknown_fields.length > 0 && (
            <div>
              <span className="text-sm text-muted-foreground block mb-1.5">Campos desconocidos:</span>
              <div className="flex flex-wrap gap-1.5">
                {result.unknown_fields.map((f) => (
                  <Badge key={f} variant="warning">Campo desconocido: {f}</Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
