import { useState } from "react"
import { NavLink, useLocation } from "react-router-dom"
import { Database, Users, HardDrive, ChevronDown, Layers, GitBranch, ArrowRightLeft } from "lucide-react"
import { useAccount } from "@/context/AccountContext"
import { cn } from "@/lib/utils"

export default function Sidebar() {
  const { selectedAccount } = useAccount()
  const location = useLocation()

  const isBasesSection = location.pathname.startsWith("/bases") || location.pathname.startsWith("/datasources") || location.pathname.startsWith("/move-leads")
  const [basesOpen, setBasesOpen] = useState(isBasesSection)

  if (!selectedAccount) return null

  return (
    <aside className="fixed left-0 top-16 z-30 h-[calc(100vh-4rem)] w-56 border-r border-border bg-white">
      <div className="px-3 py-4">
        <p className="px-3 mb-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Navegacion
        </p>
        <nav className="space-y-1">
          {/* Datos */}
          <NavLink
            to="/fields"
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-gray-600 hover:bg-gray-50 hover:text-foreground"
              )
            }
          >
            <Database className="h-5 w-5" />
            Datos
          </NavLink>

          {/* Leads */}
          <NavLink
            to="/leads"
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-gray-600 hover:bg-gray-50 hover:text-foreground"
              )
            }
          >
            <Users className="h-5 w-5" />
            Leads
          </NavLink>

          {/* Bases de Datos - Expandable */}
          <div>
            <button
              onClick={() => setBasesOpen(!basesOpen)}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isBasesSection
                  ? "text-primary"
                  : "text-gray-600 hover:bg-gray-50 hover:text-foreground"
              )}
            >
              <HardDrive className="h-5 w-5" />
              <span className="flex-1 text-left">Bases de Datos</span>
              <ChevronDown
                className={cn(
                  "h-4 w-4 transition-transform",
                  basesOpen ? "rotate-180" : ""
                )}
              />
            </button>

            {basesOpen && (
              <div className="ml-4 mt-1 space-y-1 border-l border-border pl-3">
                <NavLink
                  to="/bases"
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-gray-500 hover:bg-gray-50 hover:text-foreground"
                    )
                  }
                >
                  <Layers className="h-4 w-4" />
                  Bases
                </NavLink>
                <NavLink
                  to="/datasources"
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-gray-500 hover:bg-gray-50 hover:text-foreground"
                    )
                  }
                >
                  <GitBranch className="h-4 w-4" />
                  DataSources
                </NavLink>
                <NavLink
                  to="/move-leads"
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-gray-500 hover:bg-gray-50 hover:text-foreground"
                    )
                  }
                >
                  <ArrowRightLeft className="h-4 w-4" />
                  Mover Leads
                </NavLink>
              </div>
            )}
          </div>
        </nav>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-border">
        <div className="rounded-lg bg-gray-50 p-3">
          <p className="text-xs font-medium text-foreground truncate">{selectedAccount.nombre}</p>
          <p className="text-[10px] text-muted-foreground font-mono truncate mt-0.5">
            {selectedAccount.api_key}
          </p>
        </div>
      </div>
    </aside>
  )
}
