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

export function formatDateShort(dateString: string) {
  return new Date(dateString).toLocaleDateString("es-ES", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

export async function copyToClipboard(text: string) {
  await navigator.clipboard.writeText(text)
}

export const TIPO_DATO_COLORS: Record<string, string> = {
  string: "bg-gray-100 text-gray-700",
  number: "bg-blue-100 text-blue-700",
  boolean: "bg-purple-100 text-purple-700",
  datetime: "bg-cyan-100 text-cyan-700",
  email: "bg-green-100 text-green-700",
  phone: "bg-orange-100 text-orange-700",
}
