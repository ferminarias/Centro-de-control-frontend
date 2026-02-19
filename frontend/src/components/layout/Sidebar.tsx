import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { 
  Database, Users, HardDrive, ChevronDown, Layers, GitBranch, ArrowRightLeft,
  Package, RefreshCw, Webhook, Workflow, Phone, Megaphone, Headset, 
  PhoneCall, PhoneOff, CheckCircle, Globe, Link, Server, Shield, UserCog, Lock
} from "lucide-react";
import { useAccount } from "@/context/AccountContext";
import { usePermissions } from "@/hooks/usePermissions";
import { cn } from "@/lib/utils";

// Icon mapping for dynamic rendering
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Database,
  Users,
  HardDrive,
  Layers,
  GitBranch,
  ArrowRightLeft,
  Package,
  RefreshCw,
  Webhook,
  Workflow,
  Phone,
  Megaphone,
  Headset,
  PhoneCall,
  PhoneOff,
  CheckCircle,
  Globe,
  Link,
  Server,
  Shield,
  UserCog,
  Lock,
};

export default function Sidebar() {
  const { selectedAccount } = useAccount();
  const { modules, isLoading } = usePermissions();
  const location = useLocation();

  // Track expanded state for parent modules
  const [expandedParents, setExpandedParents] = useState<Record<string, boolean>>(() => {
    // Auto-expand if current route is under a parent
    const initial: Record<string, boolean> = {};
    const currentModule = modules?.find(m => m.ruta === location.pathname);
    if (currentModule?.parent_code) {
      initial[currentModule.parent_code] = true;
    }
    return initial;
  });

  if (!selectedAccount) return null;

  if (isLoading) {
    return (
      <aside className="fixed left-0 top-16 z-30 h-[calc(100vh-4rem)] w-56 border-r border-border bg-white">
        <div className="flex h-full items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      </aside>
    );
  }

  // Group modules by parent
  const parentModules = modules?.filter(m => !m.es_submodulo && m.puede_ver) || [];
  const subModules = modules?.filter(m => m.es_submodulo && m.puede_ver) || [];

  const toggleParent = (code: string) => {
    setExpandedParents(prev => ({ ...prev, [code]: !prev[code] }));
  };

  const isParentActive = (parentCode: string) => {
    return subModules.some(
      sub => sub.parent_code === parentCode && location.pathname.startsWith(sub.ruta)
    );
  };

  return (
    <aside className="fixed left-0 top-16 z-30 h-[calc(100vh-4rem)] w-56 border-r border-border bg-white">
      <div className="px-3 py-4">
        <p className="px-3 mb-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Navegación
        </p>
        <nav className="space-y-1">
          {parentModules.map(module => {
            const Icon = ICON_MAP[module.icono || "Database"] || Database;
            const childModules = subModules.filter(s => s.parent_code === module.codigo);
            const hasChildren = childModules.length > 0;
            const isExpanded = expandedParents[module.codigo] || isParentActive(module.codigo);
            const isActive = location.pathname === module.ruta || isParentActive(module.codigo);

            if (hasChildren) {
              // Render as expandable parent
              return (
                <div key={module.codigo}>
                  <button
                    onClick={() => toggleParent(module.codigo)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      isActive
                        ? "text-primary"
                        : "text-gray-600 hover:bg-gray-50 hover:text-foreground"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="flex-1 text-left">{module.nombre}</span>
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 transition-transform",
                        isExpanded ? "rotate-180" : ""
                      )}
                    />
                  </button>

                  {isExpanded && (
                    <div className="ml-4 mt-1 space-y-1 border-l border-border pl-3">
                      {/* Parent as first child (view action) */}
                      <NavLink
                        to={module.ruta}
                        className={({ isActive: isChildActive }) =>
                          cn(
                            "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                            isChildActive
                              ? "bg-primary/10 text-primary"
                              : "text-gray-500 hover:bg-gray-50 hover:text-foreground"
                          )
                        }
                      >
                        <Layers className="h-4 w-4" />
                        {module.nombre}
                      </NavLink>

                      {/* Child modules */}
                      {childModules.map(child => {
                        const ChildIcon = ICON_MAP[child.icono || "Database"] || Database;
                        return (
                          <NavLink
                            key={child.codigo}
                            to={child.ruta}
                            className={({ isActive: isChildActive }) =>
                              cn(
                                "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                                isChildActive
                                  ? "bg-primary/10 text-primary"
                                  : "text-gray-500 hover:bg-gray-50 hover:text-foreground"
                              )
                            }
                          >
                            <ChildIcon className="h-4 w-4" />
                            {child.nombre}
                          </NavLink>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            // Render as simple link (no children)
            return (
              <NavLink
                key={module.codigo}
                to={module.ruta}
                className={({ isActive: isItemActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isItemActive
                      ? "bg-primary/10 text-primary"
                      : "text-gray-600 hover:bg-gray-50 hover:text-foreground"
                  )
                }
              >
                <Icon className="h-5 w-5" />
                {module.nombre}
              </NavLink>
            );
          })}
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
  );
}
