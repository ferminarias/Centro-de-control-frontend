import { useState, FormEvent } from "react"
import { useNavigate, Navigate } from "react-router-dom"
import { useProdeAuth } from "../context/ProdeAuthContext"
import { prodeLogin } from "../api/prodeAuth"

export default function ProdeLogin() {
  const navigate = useNavigate()
  const { login, user, isLoading } = useProdeAuth()

  // If already authenticated, skip the login page
  if (!isLoading && user) return <Navigate to="/prode" replace />

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const res = await prodeLogin(email, password)
      login(res.access_token, res.user)
      navigate("/prode", { replace: true })
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { detail?: string } } }).response?.data?.detail
          : undefined
      setError(msg || "Error al iniciar sesión")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{
        background: "linear-gradient(135deg, #030d03 0%, #0a1f0a 40%, #061506 70%, #020802 100%)",
      }}
    >
      {/* Field lines background decoration */}
      <div
        className="fixed inset-0 pointer-events-none opacity-5"
        style={{
          backgroundImage: `
            repeating-linear-gradient(0deg, transparent, transparent 60px, #22c55e 60px, #22c55e 62px),
            repeating-linear-gradient(90deg, transparent, transparent 60px, #22c55e 60px, #22c55e 62px)
          `,
        }}
      />

      <div className="relative w-full max-w-md">
        {/* Glow effect behind card */}
        <div
          className="absolute inset-0 rounded-3xl blur-3xl opacity-20"
          style={{ background: "radial-gradient(ellipse, #16a34a, transparent 70%)" }}
        />

        {/* Card */}
        <div
          className="relative rounded-2xl border border-white/10 px-8 py-10 shadow-2xl"
          style={{ background: "rgba(5, 20, 5, 0.85)", backdropFilter: "blur(20px)" }}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="text-6xl mb-4 select-none">⚽</div>
            <h1
              className="text-3xl font-black tracking-tight mb-1"
              style={{ color: "#f0fdf4", textShadow: "0 0 30px rgba(74,222,128,0.3)" }}
            >
              PRODE
            </h1>
            <h2
              className="text-xl font-black tracking-[0.2em] uppercase mb-3"
              style={{ color: "#facc15" }}
            >
              MUNDIAL 2026
            </h2>
            <div className="flex items-center justify-center gap-2">
              <div className="h-px flex-1 max-w-[60px]" style={{ background: "#16a34a" }} />
              <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: "#4ade80" }}>
                Grupo Nods
              </span>
              <div className="h-px flex-1 max-w-[60px]" style={{ background: "#16a34a" }} />
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: "#86efac" }}>
                Email institucional
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
                placeholder="tu@gruponods.com"
                className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(74,222,128,0.2)",
                  color: "#f0fdf4",
                  caretColor: "#4ade80",
                }}
                onFocus={(e) => (e.target.style.borderColor = "rgba(74,222,128,0.6)")}
                onBlur={(e) => (e.target.style.borderColor = "rgba(74,222,128,0.2)")}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: "#86efac" }}>
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(74,222,128,0.2)",
                  color: "#f0fdf4",
                  caretColor: "#4ade80",
                }}
                onFocus={(e) => (e.target.style.borderColor = "rgba(74,222,128,0.6)")}
                onBlur={(e) => (e.target.style.borderColor = "rgba(74,222,128,0.2)")}
              />
            </div>

            {error && (
              <div
                className="rounded-xl px-4 py-3 text-sm text-center"
                style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#fca5a5" }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl py-3.5 text-sm font-black tracking-widest uppercase transition-all disabled:opacity-50"
              style={{
                background: loading
                  ? "#15803d"
                  : "linear-gradient(135deg, #16a34a, #15803d)",
                color: "#f0fdf4",
                boxShadow: "0 0 20px rgba(22,163,74,0.4)",
              }}
            >
              {loading ? "Ingresando..." : "Ingresar"}
            </button>
          </form>

          {/* Footer */}
          <p className="text-center mt-6 text-xs" style={{ color: "#4b5563" }}>
            USA • CANADA • MÉXICO — JUNIO 2026
          </p>
        </div>
      </div>
    </div>
  )
}
