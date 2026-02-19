/**
 * useAuth hook
 * 
 * Provides access to current user authentication state and info.
 */
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/api/client";

export interface User {
  id: string;
  email: string;
  nombre: string;
  cuenta_id: string;
  role_id: string | null;
  role_nombre: string | null;
  is_active: boolean;
}

/**
 * Hook to get current authenticated user
 */
export function useAuth() {
  const { data: user, isLoading, error } = useQuery({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      const response = await apiClient.get<User>("/auth/me");
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
  });

  return {
    user,
    isLoading,
    error,
    isAuthenticated: !!user,
  };
}
