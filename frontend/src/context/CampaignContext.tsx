import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useAccount } from "./AccountContext"
import type { CampaignResponse } from "@/types"

interface CampaignContextType {
  selectedCampaign: CampaignResponse | null
  setSelectedCampaign: (campaign: CampaignResponse | null) => void
}

const CampaignContext = createContext<CampaignContextType | undefined>(undefined)

const STORAGE_KEY = "cc_selected_campaign"

export function CampaignProvider({ children }: { children: ReactNode }) {
  const { selectedAccount } = useAccount()

  const [selectedCampaign, setSelectedCampaignState] = useState<CampaignResponse | null>(() => {
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

  const setSelectedCampaign = (campaign: CampaignResponse | null) => {
    setSelectedCampaignState(campaign)
    if (campaign) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(campaign))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  }

  // Clear campaign when account changes
  useEffect(() => {
    if (selectedCampaign && selectedAccount && selectedCampaign.cuenta_id !== selectedAccount.id) {
      setSelectedCampaign(null)
    }
    if (!selectedAccount) {
      setSelectedCampaign(null)
    }
  }, [selectedAccount]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <CampaignContext.Provider value={{ selectedCampaign, setSelectedCampaign }}>
      {children}
    </CampaignContext.Provider>
  )
}

export function useCampaign() {
  const ctx = useContext(CampaignContext)
  if (!ctx) throw new Error("useCampaign must be used within CampaignProvider")
  return ctx
}
