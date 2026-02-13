import { cn } from "@/lib/utils"

interface BadgeProps {
  children: React.ReactNode
  variant?: "default" | "success" | "danger" | "warning" | "info"
  className?: string
}

const variants = {
  default: "bg-gray-100 text-gray-700",
  success: "bg-green-50 text-green-700 ring-1 ring-green-600/20",
  danger: "bg-red-50 text-red-700 ring-1 ring-red-600/20",
  warning: "bg-yellow-50 text-yellow-700 ring-1 ring-yellow-600/20",
  info: "bg-blue-50 text-blue-700 ring-1 ring-blue-600/20",
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
