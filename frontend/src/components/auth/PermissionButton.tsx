/**
 * PermissionButton component
 * 
 * A button that only renders if the user has the required permission.
 * Can optionally render as disabled instead of hidden.
 */
import { usePermissions } from "@/hooks/usePermissions";

interface PermissionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Module code */
  module: string;
  /** Action required */
  action: string;
  /** 
   * Behavior when permission is missing:
   * - "hide": Don't render the button (default)
   * - "disable": Render as disabled
   */
  fallback?: "hide" | "disable";
}

/**
 * Button that checks permissions before rendering.
 * 
 * @example
 * <PermissionButton 
 *   module="leads" 
 *   action="create"
 *   onClick={() => openModal()}
 * >
 *   Nuevo Lead
 * </PermissionButton>
 */
export function PermissionButton({
  module,
  action,
  fallback = "hide",
  children,
  disabled,
  className = "",
  ...props
}: PermissionButtonProps) {
  const { can, isLoading } = usePermissions();

  if (isLoading) {
    return null;
  }

  const hasPermission = can(module, action);

  if (!hasPermission) {
    if (fallback === "hide") {
      return null;
    }
    // Render disabled button
    return (
      <button
        type="button"
        disabled
        className={`opacity-50 cursor-not-allowed ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }

  return (
    <button
      type="button"
      disabled={disabled}
      className={className}
      {...props}
    >
      {children}
    </button>
  );
}

/**
 * Props for PermissionIconButton
 */
interface PermissionIconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  module: string;
  action: string;
  fallback?: "hide" | "disable";
  icon: React.ReactNode;
  label?: string;
}

/**
 * Icon button with permission check
 */
export function PermissionIconButton({
  module,
  action,
  fallback = "hide",
  icon,
  label,
  disabled,
  className = "",
  ...props
}: PermissionIconButtonProps) {
  const { can, isLoading } = usePermissions();

  if (isLoading) {
    return null;
  }

  const hasPermission = can(module, action);

  if (!hasPermission) {
    if (fallback === "hide") {
      return null;
    }
    return (
      <button
        type="button"
        disabled
        title={label}
        className={`opacity-50 cursor-not-allowed ${className}`}
        {...props}
      >
        {icon}
      </button>
    );
  }

  return (
    <button
      type="button"
      disabled={disabled}
      title={label}
      className={className}
      {...props}
    >
      {icon}
    </button>
  );
}
