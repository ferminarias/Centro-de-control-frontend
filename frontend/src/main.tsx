import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import { Toaster } from "sonner"
import { AccountProvider } from "./context/AccountContext"
import { CampaignProvider } from "./context/CampaignContext"
import { ErrorBoundary } from "./components/ui/ErrorBoundary"
import App from "./App"
import ProdeApp from "./prode/ProdeApp"
import "./index.css"

// ── Two completely isolated QueryClients ──────────────────────────────────────
// The CRM and Prode never share cache, interceptors, or background refetches.

const crmQueryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false, staleTime: 30_000 },
  },
})

const prodeQueryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false, staleTime: 60_000 },
  },
})

// ── Root router: split at the path level before any context loads ─────────────
// /prode/* → Prode app (own QueryClient, own auth, no CRM context)
// everything else → CRM app

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          {/* Prode: completely isolated — no CRM providers anywhere in this tree */}
          <Route
            path="/prode/*"
            element={
              <QueryClientProvider client={prodeQueryClient}>
                <ProdeApp />
              </QueryClientProvider>
            }
          />

          {/* CRM: all existing providers and routing */}
          <Route
            path="*"
            element={
              <QueryClientProvider client={crmQueryClient}>
                <AccountProvider>
                  <CampaignProvider>
                    <App />
                    <Toaster
                      position="top-right"
                      toastOptions={{
                        style: {
                          background: "#ffffff",
                          color: "#111827",
                          border: "1px solid #E5E7EB",
                          boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
                        },
                      }}
                    />
                  </CampaignProvider>
                </AccountProvider>
              </QueryClientProvider>
            }
          />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>
)
