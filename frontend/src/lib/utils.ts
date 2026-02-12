import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function truncate(str: string, length: number) {
  if (str.length <= length) return str
  return str.slice(0, length) + "..."
}

export function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("es-ES", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export async function copyToClipboard(text: string) {
  await navigator.clipboard.writeText(text)
}

export const TIPO_DATO_COLORS: Record<string, string> = {
  string: "bg-gray-500/20 text-gray-300",
  number: "bg-blue-500/20 text-blue-300",
  boolean: "bg-purple-500/20 text-purple-300",
  datetime: "bg-cyan-500/20 text-cyan-300",
  email: "bg-green-500/20 text-green-300",
  phone: "bg-orange-500/20 text-orange-300",
}

export const WEBHOOK_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000"
