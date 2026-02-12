import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import Modal from "@/components/ui/Modal"
import CopyButton from "@/components/ui/CopyButton"
import { createAccount } from "@/api/accounts"
import { WEBHOOK_BASE_URL } from "@/lib/utils"
import type { AccountResponse } from "@/types"

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function CreateAccountModal({ open, onOpenChange }: Props) {
  const [nombre, setNombre] = useState("")
  const [autoCreate, setAutoCreate] = useState(true)
  const [createdAccount, setCreatedAccount] = useState<AccountResponse | null>(null)
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: createAccount,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] })
      setCreatedAccount(data)
      toast.success("Cuenta creada exitosamente")
    },
    onError: () => {
      toast.error("Error al crear la cuenta")
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!nombre.trim()) return
    mutation.mutate({ nombre: nombre.trim(), auto_crear_campos: autoCreate })
  }

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      setNombre("")
      setAutoCreate(true)
      setCreatedAccount(null)
      mutation.reset()
    }
    onOpenChange(isOpen)
  }

  if (createdAccount) {
    const webhookUrl = `${WEBHOOK_BASE_URL}/api/v1/ingest/${createdAccount.api_key}`
    return (
      <Modal open={open} onOpenChange={handleClose} title="Cuenta creada">
        <div className="space-y-4">
          <div className="rounded-lg bg-green-500/10 border border-green-500/20 p-4">
            <p className="text-sm font-medium text-green-400 mb-1">Cuenta creada exitosamente</p>
            <p className="text-foreground font-semibold">{createdAccount.nombre}</p>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground">API Key</label>
            <div className="flex items-center gap-2 mt-1 rounded-lg bg-muted p-3 font-mono text-sm">
              <span className="flex-1 break-all">{createdAccount.api_key}</span>
              <CopyButton text={createdAccount.api_key} />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground">URL Webhook</label>
            <div className="flex items-center gap-2 mt-1 rounded-lg bg-muted p-3 font-mono text-xs">
              <span className="flex-1 break-all">{webhookUrl}</span>
              <CopyButton text={webhookUrl} />
            </div>
          </div>

          <p className="text-xs text-yellow-400">
            Guarda la API Key, no se mostrara de nuevo de esta forma.
          </p>

          <button
            onClick={() => handleClose(false)}
            className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary/90 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </Modal>
    )
  }

  return (
    <Modal open={open} onOpenChange={handleClose} title="Nueva cuenta" description="Crea una nueva cuenta para ingesta de datos">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium text-foreground">Nombre</label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Nombre de la cuenta"
            className="mt-1 w-full rounded-lg border border-border bg-muted px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            required
          />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium text-foreground">Auto-crear campos</label>
            <p className="text-xs text-muted-foreground">Crear campos automaticamente al recibir datos</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={autoCreate}
            onClick={() => setAutoCreate(!autoCreate)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
              autoCreate ? "bg-primary" : "bg-muted"
            }`}
          >
            <span
              className={`pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg transition-transform ${
                autoCreate ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => handleClose(false)}
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-accent transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={mutation.isPending || !nombre.trim()}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {mutation.isPending ? "Creando..." : "Crear cuenta"}
          </button>
        </div>
      </form>
    </Modal>
  )
}
