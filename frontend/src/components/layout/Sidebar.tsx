import { useState } from "react"
import { NavLink, useLocation } from "react-router-dom"
import { Database, Users, HardDrive, ChevronDown, Layers, GitBranch, ArrowRightLeft, Package, Shield, UserCog, ShieldCheck, Webhook, Zap, RefreshCw, Phone, Server, Cable, Headphones, ClipboardList, Megaphone, PhoneCall, PhoneOff, Tag, BarChart3, History, LayoutList } from "lucide-react"
import { useAccount } from "@/context/AccountContext"
import { cn } from "@/lib/utils"

export default function Sidebar() {
  const { selectedAccount } = useAccount()
  const location = useLocation()

  const isBasesSection = location.pathname.startsWith("/bases") || location.pathname.startsWith("/datasources") || location.pathname.startsWith("/move-leads")
  const isAdminSection = location.pathname.startsWith("/admin")
  const isCallCenterSection = location.pathname.startsWith("/callcenter")
  const [basesOpen, setBasesOpen] = useState(isBasesSection)
  const [adminOpen, setAdminOpen] = useState(isAdminSection)
  const [callCenterOpen, setCallCenterOpen] = useState(isCallCenterSection)

  if (!selectedAccount) return null

  return (
    <aside className="fixed left-0 top-16 z-30 h-[calc(100vh-4rem)] w-56 border-r border-border bg-white flex flex-col">
      <div className="flex-1 overflow-y-auto px-3 py-4">
        <p className="px-3 mb-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Navegación
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

          {/* Lotes */}
          <NavLink
            to="/lotes"
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-gray-600 hover:bg-gray-50 hover:text-foreground"
              )
            }
          >
            <Package className="h-5 w-5" />
            Lotes
          </NavLink>

          {/* Actualización de datos */}
          <NavLink
            to="/bulk-update"
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-gray-600 hover:bg-gray-50 hover:text-foreground"
              )
            }
          >
            <RefreshCw className="h-5 w-5" />
            Actualizar datos
          </NavLink>

          {/* Webhooks */}
          <NavLink
            to="/webhooks"
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-gray-600 hover:bg-gray-50 hover:text-foreground"
              )
            }
          >
            <Webhook className="h-5 w-5" />
            Webhooks
          </NavLink>

          {/* Automatizaciones */}
          <NavLink
            to="/automations"
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-gray-600 hover:bg-gray-50 hover:text-foreground"
              )
            }
          >
            <Zap className="h-5 w-5" />
            Automatizaciones
          </NavLink>

          {/* Call Center - Expandable */}
          <div>
            <button
              onClick={() => setCallCenterOpen(!callCenterOpen)}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isCallCenterSection
                  ? "text-primary"
                  : "text-gray-600 hover:bg-gray-50 hover:text-foreground"
              )}
            >
              <Phone className="h-5 w-5" />
              <span className="flex-1 text-left">Call Center</span>
              <ChevronDown
                className={cn(
                  "h-4 w-4 transition-transform",
                  callCenterOpen ? "rotate-180" : ""
                )}
              />
            </button>

            {callCenterOpen && (
              <div className="ml-4 mt-1 space-y-1 border-l border-border pl-3">
                <NavLink
                  to="/callcenter/providers"
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-gray-500 hover:bg-gray-50 hover:text-foreground"
                    )
                  }
                >
                  <Server className="h-4 w-4" />
                  Proveedores SIP
                </NavLink>
                <NavLink
                  to="/callcenter/trunks"
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-gray-500 hover:bg-gray-50 hover:text-foreground"
                    )
                  }
                >
                  <Cable className="h-4 w-4" />
                  Troncales
                </NavLink>
                <NavLink
                  to="/callcenter/pbx"
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-gray-500 hover:bg-gray-50 hover:text-foreground"
                    )
                  }
                >
                  <Server className="h-4 w-4" />
                  Nodos PBX
                </NavLink>
                <NavLink
                  to="/callcenter/agents"
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-gray-500 hover:bg-gray-50 hover:text-foreground"
                    )
                  }
                >
                  <Headphones className="h-4 w-4" />
                  Agentes
                </NavLink>
                <NavLink
                  to="/callcenter/dispositions"
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-gray-500 hover:bg-gray-50 hover:text-foreground"
                    )
                  }
                >
                  <ClipboardList className="h-4 w-4" />
                  Tipificaciones
                </NavLink>
                <NavLink
                  to="/callcenter/campaigns"
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-gray-500 hover:bg-gray-50 hover:text-foreground"
                    )
                  }
                >
                  <Megaphone className="h-4 w-4" />
                  Campañas
                </NavLink>
                <NavLink
                  to="/callcenter/cdr"
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-gray-500 hover:bg-gray-50 hover:text-foreground"
                    )
                  }
                >
                  <PhoneCall className="h-4 w-4" />
                  CDR
                </NavLink>
                <NavLink
                  to="/callcenter/dnc"
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-gray-500 hover:bg-gray-50 hover:text-foreground"
                    )
                  }
                >
                  <PhoneOff className="h-4 w-4" />
                  Lista DNC
                </NavLink>
                <NavLink
                  to="/callcenter/gestion"
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-gray-500 hover:bg-gray-50 hover:text-foreground"
                    )
                  }
                >
                  <Headphones className="h-4 w-4" />
                  Gestión Contactos
                </NavLink>
              </div>
            )}
          </div>

          {/* Reportes */}
          <NavLink
            to="/reportes"
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-gray-600 hover:bg-gray-50 hover:text-foreground"
              )
            }
          >
            <BarChart3 className="h-5 w-5" />
            Reportes
          </NavLink>

          {/* Administración - Expandable */}
          <div>
            <button
              onClick={() => setAdminOpen(!adminOpen)}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isAdminSection
                  ? "text-primary"
                  : "text-gray-600 hover:bg-gray-50 hover:text-foreground"
              )}
            >
              <Shield className="h-5 w-5" />
              <span className="flex-1 text-left">Administración</span>
              <ChevronDown
                className={cn(
                  "h-4 w-4 transition-transform",
                  adminOpen ? "rotate-180" : ""
                )}
              />
            </button>

            {adminOpen && (
              <div className="ml-4 mt-1 space-y-1 border-l border-border pl-3">
                <NavLink
                  to="/admin/users"
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-gray-500 hover:bg-gray-50 hover:text-foreground"
                    )
                  }
                >
                  <UserCog className="h-4 w-4" />
                  Usuarios
                </NavLink>
                <NavLink
                  to="/admin/roles"
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-gray-500 hover:bg-gray-50 hover:text-foreground"
                    )
                  }
                >
                  <ShieldCheck className="h-4 w-4" />
                  Roles
                </NavLink>
                <NavLink
                  to="/admin/campanias"
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-gray-500 hover:bg-gray-50 hover:text-foreground"
                    )
                  }
                >
                  <Megaphone className="h-4 w-4" />
                  Campañas
                </NavLink>
                <NavLink
                  to="/admin/tipificaciones"
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-gray-500 hover:bg-gray-50 hover:text-foreground"
                    )
                  }
                >
                  <Tag className="h-4 w-4" />
                  Tipificaciones
                </NavLink>
                <NavLink
                  to="/admin/auditoria"
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-gray-500 hover:bg-gray-50 hover:text-foreground"
                    )
                  }
                >
                  <History className="h-4 w-4" />
                  Auditoría
                </NavLink>
                <NavLink
                  to="/admin/ficha-config"
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-gray-500 hover:bg-gray-50 hover:text-foreground"
                    )
                  }
                >
                  <LayoutList className="h-4 w-4" />
                  Ficha Contacto
                </NavLink>
              </div>
            )}
          </div>
        </nav>
      </div>

      <div className="shrink-0 p-3 border-t border-border">
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
