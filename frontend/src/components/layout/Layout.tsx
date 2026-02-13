import { Outlet } from "react-router-dom"
import { useAccount } from "@/context/AccountContext"
import Header from "./Header"
import Sidebar from "./Sidebar"

export default function Layout() {
  const { selectedAccount } = useAccount()

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Sidebar />
      <main className={`pt-0 transition-all ${selectedAccount ? "ml-56" : ""}`}>
        <div className="p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
