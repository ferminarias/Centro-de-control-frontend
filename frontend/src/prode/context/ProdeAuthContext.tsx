import { createContext, useContext, useState, useEffect } from "react"
import type { ReactNode } from "react"
import { prodeMe } from "../api/prodeAuth"
import type { ProdeUser } from "../api/prodeAuth"

interface ProdeAuthContextType {
  user: ProdeUser | null
  token: string | null
  isLoading: boolean
  login: (token: string, user: ProdeUser) => void
  logout: () => void
}

const ProdeAuthContext = createContext<ProdeAuthContextType | null>(null)

export function ProdeAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<ProdeUser | null>(null)
  const [token, setToken] = useState<string | null>(localStorage.getItem("prode_token"))
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!token) {
      setIsLoading(false)
      return
    }
    prodeMe()
      .then(setUser)
      .catch(() => {
        localStorage.removeItem("prode_token")
        setToken(null)
      })
      .finally(() => setIsLoading(false))
  }, [token])

  const login = (newToken: string, newUser: ProdeUser) => {
    localStorage.setItem("prode_token", newToken)
    setToken(newToken)
    setUser(newUser)
  }

  const logout = () => {
    localStorage.removeItem("prode_token")
    setToken(null)
    setUser(null)
  }

  return (
    <ProdeAuthContext.Provider value={{ user, token, isLoading, login, logout }}>
      {children}
    </ProdeAuthContext.Provider>
  )
}

export function useProdeAuth() {
  const ctx = useContext(ProdeAuthContext)
  if (!ctx) throw new Error("useProdeAuth must be used inside ProdeAuthProvider")
  return ctx
}
