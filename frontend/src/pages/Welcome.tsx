import { Building2 } from "lucide-react"
import { useAccount } from "@/context/AccountContext"

export default function Welcome() {
  const { selectedAccount } = useAccount()

  if (selectedAccount) return null

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="rounded-2xl bg-primary/5 p-6 mb-6">
        <Building2 className="h-12 w-12 text-primary" />
      </div>
      <h1 className="text-2xl font-bold text-foreground mb-2">Bienvenido al Centro de Control</h1>
      <p className="text-muted-foreground max-w-md mb-6">
        Selecciona un cliente del selector en el header para comenzar a gestionar sus datos y leads.
        Si no hay cuentas, usa el boton "Administrador" para crear la primera.
      </p>
    </div>
  )
}
