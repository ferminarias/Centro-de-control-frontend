import { Routes, Route, Navigate } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ProdeAuthProvider } from "./context/ProdeAuthContext"
import ProdeLogin from "./pages/ProdeLogin"
import ProdeHome from "./pages/ProdeHome"
import ProdeProtectedRoute from "./components/ProdeProtectedRoute"

// Isolated QueryClient — completely separate from the CRM's QueryClient.
// Prevents any CRM background queries or interceptors from firing while
// the user is in the prode sub-app.
const prodeQueryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false, staleTime: 60_000 },
  },
})

export default function ProdeApp() {
  return (
    <QueryClientProvider client={prodeQueryClient}>
      <ProdeAuthProvider>
        <Routes>
          <Route path="login" element={<ProdeLogin />} />
          <Route
            path=""
            element={
              <ProdeProtectedRoute>
                <ProdeHome />
              </ProdeProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/prode" replace />} />
        </Routes>
      </ProdeAuthProvider>
    </QueryClientProvider>
  )
}
