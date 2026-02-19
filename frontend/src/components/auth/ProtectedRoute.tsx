/**
 * ProtectedRoute component
 * 
 * Protects a route based on module permissions.
 * Redirects to home if user doesn't have access.
 */
import { Navigate } from "react-router-dom";
import { usePermissions } from "@/hooks/usePermissions";
import { Loading } from "@/components/ui/Loading";

interface ProtectedRouteProps {
  /** Module code required to access this route */
  module: string;
  /** Specific action required (default: "view") */
  action?: string;
  /** Content to render if authorized */
  children: React.ReactNode;
  /** Custom fallback element (default: redirects to home) */
  fallback?: React.ReactNode;
}

/**
 * Protects a route based on user permissions.
 * 
 * @example
 * <Route path="/leads" element={
 *   <ProtectedRoute module="leads">
 *     <LeadsPage />
 *   </ProtectedRoute>
 * } />
 */
export function ProtectedRoute({
  module,
  action = "view",
  children,
  fallback = <Navigate to="/" replace />,
}: ProtectedRouteProps) {
  const { can, isLoading } = usePermissions();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loading className="h-12 w-12" />
      </div>
    );
  }

  return can(module, action) ? <>{children}</> : <>{fallback}</>;
}

/**
 * Hides children if user doesn't have permission (doesn't redirect)
 */
export function ProtectedContent({
  module,
  action = "view",
  children,
}: Omit<ProtectedRouteProps, "fallback">) {
  const { can, isLoading } = usePermissions();

  if (isLoading) {
    return null;
  }

  return can(module, action) ? <>{children}</> : null;
}
