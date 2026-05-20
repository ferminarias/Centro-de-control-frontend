import { useProdeAuth } from "../context/ProdeAuthContext"
import { useNavigate } from "react-router-dom"

function ComingSoonCard({ emoji, title, description }: { emoji: string; title: string; description: string }) {
  return (
    <div
      className="rounded-2xl p-6 flex flex-col gap-3 relative overflow-hidden"
      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(74,222,128,0.1)" }}
    >
      <div className="text-4xl">{emoji}</div>
      <h3 className="text-base font-bold" style={{ color: "#f0fdf4" }}>{title}</h3>
      <p className="text-xs leading-relaxed" style={{ color: "#6b7280" }}>{description}</p>
      <div
        className="mt-2 inline-flex self-start items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold tracking-widest uppercase"
        style={{ background: "rgba(250,204,21,0.1)", border: "1px solid rgba(250,204,21,0.3)", color: "#facc15" }}
      >
        Próximamente
      </div>
    </div>
  )
}

export default function ProdeHome() {
  const { user, logout } = useProdeAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate("/prode/login", { replace: true })
  }

  return (
    <div
      className="min-h-screen"
      style={{ background: "linear-gradient(135deg, #030d03 0%, #0a1f0a 40%, #061506 70%, #020802 100%)" }}
    >
      {/* Field lines background */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `
            repeating-linear-gradient(0deg, transparent, transparent 60px, #22c55e 60px, #22c55e 62px),
            repeating-linear-gradient(90deg, transparent, transparent 60px, #22c55e 60px, #22c55e 62px)
          `,
        }}
      />

      {/* Navbar */}
      <nav
        className="sticky top-0 z-40 flex items-center justify-between px-6 py-4"
        style={{
          background: "rgba(3,13,3,0.85)",
          backdropFilter: "blur(16px)",
          borderBottom: "1px solid rgba(74,222,128,0.1)",
        }}
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">⚽</span>
          <div>
            <span className="text-base font-black tracking-tight" style={{ color: "#f0fdf4" }}>
              PRODE{" "}
            </span>
            <span className="text-base font-black" style={{ color: "#facc15" }}>
              MUNDIAL 2026
            </span>
          </div>
          <div
            className="hidden sm:block h-5 w-px mx-2"
            style={{ background: "rgba(74,222,128,0.2)" }}
          />
          <span className="hidden sm:block text-xs font-semibold tracking-widest uppercase" style={{ color: "#4ade80" }}>
            Grupo Nods
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm" style={{ color: "#86efac" }}>
            Hola, <strong>{user?.nombre}</strong>
          </span>
          <button
            onClick={handleLogout}
            className="rounded-xl px-4 py-2 text-xs font-semibold tracking-widest uppercase transition-all"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(74,222,128,0.15)",
              color: "#6b7280",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#f0fdf4"
              e.currentTarget.style.borderColor = "rgba(74,222,128,0.3)"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "#6b7280"
              e.currentTarget.style.borderColor = "rgba(74,222,128,0.15)"
            }}
          >
            Salir
          </button>
        </div>
      </nav>

      <div className="relative max-w-4xl mx-auto px-4 py-10 space-y-10">
        {/* Hero */}
        <div className="text-center space-y-3 py-6">
          <div className="text-6xl mb-2">🏆</div>
          <h1
            className="text-4xl sm:text-5xl font-black tracking-tight"
            style={{ color: "#f0fdf4", textShadow: "0 0 40px rgba(74,222,128,0.2)" }}
          >
            ¡Bienvenido,{" "}
            <span style={{ color: "#4ade80" }}>{user?.nombre}</span>!
          </h1>
          <p className="text-base" style={{ color: "#6b7280" }}>
            El prode del Mundial 2026 está por comenzar. <br className="hidden sm:block" />
            Prepará tus pronósticos y competí con el equipo.
          </p>
          <div
            className="inline-flex items-center gap-2 rounded-full px-5 py-2 text-xs font-semibold tracking-widest uppercase mt-2"
            style={{
              background: "rgba(22,163,74,0.1)",
              border: "1px solid rgba(22,163,74,0.3)",
              color: "#4ade80",
            }}
          >
            <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
            Inscripción abierta · Junio 2026
          </div>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4">
          <div className="flex-1 h-px" style={{ background: "rgba(74,222,128,0.1)" }} />
          <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: "#374151" }}>
            Secciones
          </span>
          <div className="flex-1 h-px" style={{ background: "rgba(74,222,128,0.1)" }} />
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ComingSoonCard
            emoji="📋"
            title="Mis Pronósticos"
            description="Ingresá el resultado exacto de cada partido antes de que arranque. Ganás puntos extra por adivinar al ganador, el marcador y el goleador."
          />
          <ComingSoonCard
            emoji="🥇"
            title="Tabla de Posiciones"
            description="Rankeate con el resto del equipo. El sistema actualiza los puntos en tiempo real a medida que se van jugando los partidos."
          />
          <ComingSoonCard
            emoji="📅"
            title="Fixture Completo"
            description="Todos los partidos del Mundial 2026: fase de grupos, octavos, cuartos, semifinales y la gran final."
          />
          <ComingSoonCard
            emoji="⚡"
            title="Estadísticas"
            description="¿Quién predice mejor? Seguí tus aciertos, errores y racha de predicciones correctas a lo largo del torneo."
          />
        </div>

        {/* Countries banner */}
        <div
          className="rounded-2xl px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-4"
          style={{
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(74,222,128,0.08)",
          }}
        >
          <div className="flex items-center gap-3">
            <span className="text-3xl">🌎</span>
            <div>
              <p className="text-sm font-bold" style={{ color: "#f0fdf4" }}>FIFA World Cup 2026™</p>
              <p className="text-xs" style={{ color: "#4b5563" }}>48 selecciones · 104 partidos · 3 países sede</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-xl">
            <span title="USA">🇺🇸</span>
            <span title="Canada">🇨🇦</span>
            <span title="México">🇲🇽</span>
          </div>
        </div>

        <p className="text-center text-xs pb-4" style={{ color: "#1f2937" }}>
          Grupo Nods · Prode Mundial 2026 · Solo uso interno
        </p>
      </div>
    </div>
  )
}
