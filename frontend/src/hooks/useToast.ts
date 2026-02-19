/**
 * useToast hook
 * 
 * Simple wrapper around sonner toast
 */
import { toast as sonnerToast } from "sonner";

export function useToast() {
  return {
    toast: sonnerToast,
    success: sonnerToast.success,
    error: sonnerToast.error,
    warning: sonnerToast.warning,
    info: sonnerToast.info,
  };
}

export { sonnerToast as toast };
