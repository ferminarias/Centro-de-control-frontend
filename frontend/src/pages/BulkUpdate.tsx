import { useState, useRef } from "react"
import { RefreshCw, Download, Upload, CheckCircle, AlertTriangle, XCircle } from "lucide-react"
import { useMutation } from "@tanstack/react-query"
import { useAccount } from "@/context/AccountContext"
import { downloadUpdateTemplate, bulkUpdateLeads } from "@/api/bulkUpdate"
import { Spinner } from "@/components/ui/Loading"
import Badge from "@/components/ui/Badge"
import type { BulkUpdateResponse } from "@/types"

export default function BulkUpdate() {
  const { selectedAccount } = useAccount()
  const accountId = selectedAccount?.id ?? ""

  const [downloading, setDownloading] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [result, setResult] = useState<BulkUpdateResponse | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const uploadMutation = useMutation({
    mutationFn: (f: File) => bulkUpdateLeads(accountId, f),
    onSuccess: (data) => {
      setResult(data)
      setFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ""
    },
  })

  const handleDownload = async () => {
    setDownloading(true)
    try {
      await downloadUpdateTemplate(accountId)
    } catch {
      // silently handled
    } finally {
      setDownloading(false)
    }
  }

  const handleUpload = () => {
    if (!file) return
    setResult(null)
    uploadMutation.mutate(file)
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground">Actualizacion de datos</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Actualiza leads masivamente subiendo un archivo Excel. Usa el <strong>id_lead</strong> como clave primaria.
        </p>
      </div>

      {/* Steps */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {/* Step 1 - Download */}
        <div className="rounded-xl border border-border bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-bold">1</div>
            <h3 className="text-sm font-semibold text-foreground">Descargar plantilla</h3>
          </div>
          <p className="text-xs text-muted-foreground mb-4">
            Descarga el archivo Excel con la columna <code className="bg-gray-100 px-1 rounded">id_lead</code> y los campos de tu cuenta. Completa solo los campos que quieras actualizar.
          </p>
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-foreground hover:bg-gray-50 transition-colors disabled:opacity-50 w-full justify-center"
          >
            <Download className="h-4 w-4" />
            {downloading ? "Descargando..." : "Descargar plantilla"}
          </button>
        </div>

        {/* Step 2 - Upload */}
        <div className="rounded-xl border border-border bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-bold">2</div>
            <h3 className="text-sm font-semibold text-foreground">Subir archivo</h3>
          </div>
          <p className="text-xs text-muted-foreground mb-4">
            Subi el Excel con los datos actualizados. Las celdas vacias no se modifican.
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={(e) => {
              setFile(e.target.files?.[0] ?? null)
              setResult(null)
            }}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 w-full rounded-lg border border-dashed border-border px-4 py-4 text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors justify-center"
          >
            <Upload className="h-4 w-4" />
            {file ? (
              <span className="text-foreground font-medium">{file.name}</span>
            ) : (
              "Seleccionar archivo .xlsx"
            )}
          </button>
          {file && (
            <button
              onClick={() => {
                setFile(null)
                if (fileInputRef.current) fileInputRef.current.value = ""
              }}
              className="mt-1 text-xs text-red-500 hover:text-red-700"
            >
              Quitar archivo
            </button>
          )}
        </div>

        {/* Step 3 - Execute */}
        <div className="rounded-xl border border-border bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-bold">3</div>
            <h3 className="text-sm font-semibold text-foreground">Ejecutar actualizacion</h3>
          </div>
          <p className="text-xs text-muted-foreground mb-4">
            Procesa el archivo y actualiza los leads. Veras un resumen con el resultado.
          </p>
          <button
            onClick={handleUpload}
            disabled={!file || uploadMutation.isPending}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary/90 transition-colors disabled:opacity-50 w-full justify-center"
          >
            {uploadMutation.isPending ? (
              <>
                <Spinner /> Procesando...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4" />
                Actualizar leads
              </>
            )}
          </button>
        </div>
      </div>

      {/* Result */}
      {uploadMutation.isError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-5">
          <div className="flex items-center gap-2 mb-2">
            <XCircle className="h-5 w-5 text-red-600" />
            <h3 className="text-sm font-semibold text-red-700">Error al procesar</h3>
          </div>
          <p className="text-sm text-red-600">
            Hubo un error al procesar el archivo. Verifica que el formato sea correcto y que la primera columna sea <code className="bg-red-100 px-1 rounded">id_lead</code>.
          </p>
        </div>
      )}

      {result && (
        <div className="rounded-xl border border-border bg-white p-5 shadow-sm space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Resultado</h3>

          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-lg bg-green-50 border border-green-200 p-4 text-center">
              <CheckCircle className="h-6 w-6 text-green-600 mx-auto mb-1" />
              <p className="text-2xl font-bold text-green-700">{result.updated}</p>
              <p className="text-xs text-green-600">Actualizados</p>
            </div>
            <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-4 text-center">
              <AlertTriangle className="h-6 w-6 text-yellow-600 mx-auto mb-1" />
              <p className="text-2xl font-bold text-yellow-700">{result.not_found_ids.length}</p>
              <p className="text-xs text-yellow-600">No encontrados</p>
            </div>
            <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-center">
              <XCircle className="h-6 w-6 text-red-600 mx-auto mb-1" />
              <p className="text-2xl font-bold text-red-700">{result.errors.length}</p>
              <p className="text-xs text-red-600">Errores</p>
            </div>
          </div>

          {result.not_found_ids.length > 0 && (
            <div>
              <p className="text-sm font-medium text-foreground mb-1">IDs no encontrados:</p>
              <div className="flex flex-wrap gap-1.5">
                {result.not_found_ids.map((id) => (
                  <Badge key={id} variant="warning">{id}</Badge>
                ))}
              </div>
            </div>
          )}

          {result.errors.length > 0 && (
            <div>
              <p className="text-sm font-medium text-foreground mb-1">Errores:</p>
              <div className="rounded-lg bg-gray-50 border border-border p-3 space-y-1 max-h-40 overflow-y-auto">
                {result.errors.map((err, i) => (
                  <p key={i} className="text-xs text-red-600 font-mono">{err}</p>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
