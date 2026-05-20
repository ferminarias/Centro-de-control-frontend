import { Navigate } from "react-router-dom"
import { useProdeAuth } from "../context/ProdeAuthContext"

export default function ProdeProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useProdeAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0a1a0a" }}>
        <div className="flex flex-col items-center gap-4">
          <span className="text-5xl animate-bounce">⚽</span>
          <p className="text-green-400 text-sm font-medium tracking-widest uppercase">Cargando...</p>
        </div>
      </div>
    )
  }

  return user ? <>{children}</> : <Navigate to="/prode/login" replace />
}
