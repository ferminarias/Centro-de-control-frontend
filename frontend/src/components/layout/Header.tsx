import { useState, useRef, useEffect } from "react"
import { ChevronDown, Settings, Building2 } from "lucide-react"
import { useAccount } from "@/context/AccountContext"
import { useAccountsList } from "@/hooks/useAccounts"
import AdminPanel from "@/components/admin/AdminPanel"

export default function Header() {
  const { selectedAccount, setSelectedAccount } = useAccount()
  const { data } = useAccountsList()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [adminOpen, setAdminOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const accounts = data?.items?.filter((a) => a.activo) ?? []

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Sync: if selected account was deactivated, clear it
  useEffect(() => {
    if (selectedAccount && data) {
      const stillExists = data.items.find((a) => a.id === selectedAccount.id && a.activo)
      if (!stillExists) setSelectedAccount(null)
    }
  }, [data, selectedAccount, setSelectedAccount])

  return (
    <>
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border bg-white px-6 shadow-sm">
        {/* Left side: Logo + Account Selector */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-xs font-bold text-white">CC</span>
            </div>
            <span className="text-lg font-semibold text-foreground hidden sm:block">
              Centro de Control
            </span>
          </div>

          <div className="h-6 w-px bg-border hidden sm:block" />

          {/* Account selector */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 rounded-lg border border-border bg-white px-3 py-2 text-sm hover:bg-gray-50 transition-colors min-w-[180px]"
            >
              <Building2 className="h-4 w-4 text-gray-400" />
              <span className={selectedAccount ? "text-foreground font-medium" : "text-muted-foreground"}>
                {selectedAccount ? selectedAccount.nombre : "Seleccionar cliente"}
              </span>
              <ChevronDown className="h-4 w-4 text-gray-400 ml-auto" />
            </button>

            {dropdownOpen && (
              <div className="absolute left-0 top-full mt-1 w-72 rounded-xl border border-border bg-white shadow-lg z-50">
                <div className="p-2">
                  {accounts.length === 0 ? (
                    <p className="px-3 py-4 text-sm text-muted-foreground text-center">
                      No hay cuentas activas
                    </p>
                  ) : (
                    accounts.map((account) => (
                      <button
                        key={account.id}
                        onClick={() => {
                          setSelectedAccount(account)
                          setDropdownOpen(false)
                        }}
                        className={`w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-left transition-colors ${
                          selectedAccount?.id === account.id
                            ? "bg-primary/10 text-primary"
                            : "hover:bg-gray-50 text-foreground"
                        }`}
                      >
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <span className="text-xs font-semibold text-primary">
                            {account.nombre.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium truncate">{account.nombre}</p>
                          <p className="text-xs text-muted-foreground font-mono truncate">
                            {account.api_key}
                          </p>
                        </div>
                        {selectedAccount?.id === account.id && (
                          <div className="h-2 w-2 rounded-full bg-primary shrink-0" />
                        )}
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right side: Admin button */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setAdminOpen(true)}
            className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground hover:bg-gray-50 transition-colors"
          >
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Administrador</span>
          </button>
        </div>
      </header>

      <AdminPanel open={adminOpen} onOpenChange={setAdminOpen} />
    </>
  )
}
