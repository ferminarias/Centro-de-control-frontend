import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { BrowserRouter } from "react-router-dom"
import { Toaster } from "sonner"
import { AccountProvider } from "./context/AccountContext"
import { CampaignProvider } from "./context/CampaignContext"
import { ErrorBoundary } from "./components/ui/ErrorBoundary"
import App from "./App"
import "./index.css"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 30_000,
    },
  },
})

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
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
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  </StrictMode>
)
