import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { apiClient } from "@/api/client"

export default function Login() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [cuentaId, setCuentaId] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const payload: any = {
        username,
        password,
      }
      
      // Solo agregar cuenta_id si tiene valor
      if (cuentaId && cuentaId.trim() !== "") {
        payload.cuenta_id = cuentaId.trim()
      }
      
      const { data } = await apiClient.post("/api/v1/auth/login", payload)
      
      // Guardar token
      localStorage.setItem("token", data.access_token)
      
      // Redirigir al home
      navigate("/")
    } catch (err: any) {
      console.error("Login error:", err)
      const errorMsg = err.response?.data?.detail || err.response?.data?.msg || "Error al iniciar sesión"
      setError(typeof errorMsg === "string" ? errorMsg : "Error al iniciar sesión")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-lg">
        <div className="text-center mb-8">
          <div className="h-12 w-12 rounded-lg bg-primary flex items-center justify-center mx-auto mb-4">
            <span className="text-lg font-bold text-white">CC</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Centro de Control</h1>
          <p className="text-gray-500 mt-2">Inicia sesión para continuar</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Usuario
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Nombre de usuario"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ID de Cuenta (opcional)
            </label>
            <input
              type="text"
              value={cuentaId}
              onChange={(e) => setCuentaId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="UUID de la cuenta"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 px-4 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
          </button>
        </form>
      </div>
    </div>
  )
}
