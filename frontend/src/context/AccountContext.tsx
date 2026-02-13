import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { AccountResponse } from "@/types"

interface AccountContextType {
  selectedAccount: AccountResponse | null
  setSelectedAccount: (account: AccountResponse | null) => void
}

const AccountContext = createContext<AccountContextType | undefined>(undefined)

const STORAGE_KEY = "cc_selected_account"

export function AccountProvider({ children }: { children: ReactNode }) {
  const [selectedAccount, setSelectedAccountState] = useState<AccountResponse | null>(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        return JSON.parse(stored)
      } catch {
        return null
      }
    }
    return null
  })

  const setSelectedAccount = (account: AccountResponse | null) => {
    setSelectedAccountState(account)
    if (account) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(account))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  }

  useEffect(() => {
    if (selectedAccount) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedAccount))
    }
  }, [selectedAccount])

  return (
    <AccountContext.Provider value={{ selectedAccount, setSelectedAccount }}>
      {children}
    </AccountContext.Provider>
  )
}

export function useAccount() {
  const ctx = useContext(AccountContext)
  if (!ctx) throw new Error("useAccount must be used within AccountProvider")
  return ctx
}
