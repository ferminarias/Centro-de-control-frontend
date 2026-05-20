import { Routes, Route, Navigate } from "react-router-dom"
import { ProdeAuthProvider } from "./context/ProdeAuthContext"
import ProdeLogin from "./pages/ProdeLogin"
import ProdeHome from "./pages/ProdeHome"
import ProdeProtectedRoute from "./components/ProdeProtectedRoute"

export default function ProdeApp() {
  return (
    <ProdeAuthProvider>
      <Routes>
        <Route path="login" element={<ProdeLogin />} />
        <Route
          path=""
          element={
            <ProdeProtectedRoute>
              <ProdeHome />
            </ProdeProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/prode" replace />} />
      </Routes>
    </ProdeAuthProvider>
  )
}
