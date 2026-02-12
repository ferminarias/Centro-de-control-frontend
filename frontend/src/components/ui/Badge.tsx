import { cn } from "@/lib/utils"

interface BadgeProps {
  children: React.ReactNode
  variant?: "default" | "success" | "danger" | "warning" | "info"
  className?: string
}

const variants = {
  default: "bg-secondary text-secondary-foreground",
  success: "bg-green-500/20 text-green-400",
  danger: "bg-red-500/20 text-red-400",
  warning: "bg-yellow-500/20 text-yellow-400",
  info: "bg-blue-500/20 text-blue-400",
}

export default function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  )
}
