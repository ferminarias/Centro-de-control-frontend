import { useState, useRef, useEffect } from "react"
import { ChevronDown, Settings, Building2, Megaphone } from "lucide-react"
import { useAccount } from "@/context/AccountContext"
import { useCampaign } from "@/context/CampaignContext"
import { useAccountsList } from "@/hooks/useAccounts"
import { useCampaigns } from "@/hooks/useVoip"
import AdminPanel from "@/components/admin/AdminPanel"
import Badge from "@/components/ui/Badge"
import type { CampaignStatus } from "@/types"

const statusLabel = (s: CampaignStatus) => {
  switch (s) { case "running": return "En curso"; case "paused": return "Pausada"; case "completed": return "Completada"; case "idle": return "Inactiva"; default: return s }
}
const statusVariant = (s: CampaignStatus) => {
  switch (s) { case "running": return "success" as const; case "paused": return "warning" as const; case "completed": return "info" as const; default: return "default" as const }
}

export default function Header() {
  const { selectedAccount, setSelectedAccount } = useAccount()
  const { selectedCampaign, setSelectedCampaign } = useCampaign()
  const { data, error, isLoading } = useAccountsList()
  const { data: campaignsData } = useCampaigns(selectedAccount?.id ?? undefined)

  // Debug: log API response
  useEffect(() => {
    console.log("Accounts data:", data)
    console.log("Accounts error:", error)
  }, [data, error])

  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [campaignDropdownOpen, setCampaignDropdownOpen] = useState(false)
  const [adminOpen, setAdminOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const campaignDropdownRef = useRef<HTMLDivElement>(null)

  const accounts = data?.items?.filter((a) => a.activo) ?? []
  
  // Debug: show raw count
  const rawCount = data?.items?.length ?? 0
  const campaigns = campaignsData?.items ?? []

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
      if (campaignDropdownRef.current && !campaignDropdownRef.current.contains(e.target as Node)) {
        setCampaignDropdownOpen(false)
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

  // Sync: if selected campaign is no longer in list, clear it
  useEffect(() => {
    if (selectedCampaign && campaignsData) {
      const stillExists = campaignsData.items.find((c) => c.id === selectedCampaign.id)
      if (!stillExists) setSelectedCampaign(null)
    }
  }, [campaignsData, selectedCampaign, setSelectedCampaign])

  return (
    <>
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border bg-white px-6 shadow-sm">
        {/* Left side: Logo + Account Selector + Campaign Selector */}
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
                    <div className="px-3 py-4 text-sm text-muted-foreground text-center">
                      <p>No hay cuentas activas</p>
                      {isLoading && <p className="text-xs mt-1">Cargando...</p>}
                      {error && <p className="text-xs text-red-500 mt-1">Error: {error.message}</p>}
                      {!isLoading && !error && rawCount > 0 && (
                        <p className="text-xs text-orange-500 mt-1">
                          {rawCount} cuenta(s) encontrada(s) pero inactiva(s)
                        </p>
                      )}
                      {!isLoading && !error && rawCount === 0 && (
                        <p className="text-xs text-gray-400 mt-1">API devolvió 0 cuentas</p>
                      )}
                    </div>
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

          {/* Campaign selector (only when account is selected and there are campaigns) */}
          {selectedAccount && campaigns.length > 0 && (
            <>
              <div className="h-6 w-px bg-border hidden sm:block" />
              <div className="relative" ref={campaignDropdownRef}>
                <button
                  onClick={() => setCampaignDropdownOpen(!campaignDropdownOpen)}
                  className="flex items-center gap-2 rounded-lg border border-border bg-white px-3 py-2 text-sm hover:bg-gray-50 transition-colors min-w-[160px]"
                >
                  <Megaphone className="h-4 w-4 text-gray-400" />
                  <span className={selectedCampaign ? "text-foreground font-medium" : "text-muted-foreground"}>
                    {selectedCampaign ? selectedCampaign.nombre : "Campana"}
                  </span>
                  <ChevronDown className="h-4 w-4 text-gray-400 ml-auto" />
                </button>

                {campaignDropdownOpen && (
                  <div className="absolute left-0 top-full mt-1 w-72 rounded-xl border border-border bg-white shadow-lg z-50">
                    <div className="p-2">
                      {/* Option to deselect */}
                      <button
                        onClick={() => { setSelectedCampaign(null); setCampaignDropdownOpen(false) }}
                        className={`w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-left transition-colors ${!selectedCampaign ? "bg-primary/10 text-primary" : "hover:bg-gray-50 text-muted-foreground"}`}
                      >
                        Todas las campanas
                      </button>
                      {campaigns.map((campaign) => (
                        <button
                          key={campaign.id}
                          onClick={() => {
                            setSelectedCampaign(campaign)
                            setCampaignDropdownOpen(false)
                          }}
                          className={`w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-left transition-colors ${
                            selectedCampaign?.id === campaign.id
                              ? "bg-primary/10 text-primary"
                              : "hover:bg-gray-50 text-foreground"
                          }`}
                        >
                          <div className="min-w-0 flex-1">
                            <p className="font-medium truncate">{campaign.nombre}</p>
                            <p className="text-xs text-muted-foreground">{campaign.total_leads} leads</p>
                          </div>
                          <Badge variant={statusVariant(campaign.estado)} className="shrink-0">
                            {statusLabel(campaign.estado)}
                          </Badge>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
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
