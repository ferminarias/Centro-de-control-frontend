import { Routes, Route, Navigate } from "react-router-dom"
import Layout from "./components/layout/Layout"
import Welcome from "./pages/Welcome"
import Fields from "./pages/Fields"
import Leads from "./pages/Leads"
import Bases from "./pages/Bases"
import BaseDetail from "./pages/BaseDetail"
import DataSources from "./pages/DataSources"
import MoveLeads from "./pages/MoveLeads"

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Welcome />} />
        <Route path="/fields" element={<Fields />} />
        <Route path="/leads" element={<Leads />} />
        <Route path="/bases" element={<Bases />} />
        <Route path="/bases/:baseId" element={<BaseDetail />} />
        <Route path="/datasources" element={<DataSources />} />
        <Route path="/move-leads" element={<MoveLeads />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
