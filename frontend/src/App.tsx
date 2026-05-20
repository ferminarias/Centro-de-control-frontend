import { Routes, Route, Navigate } from "react-router-dom"
import Layout from "./components/layout/Layout"
import { ProtectedRoute } from "./components/auth/ProtectedRoute"
import Welcome from "./pages/Welcome"
import Login from "./pages/Login"
import Fields from "./pages/Fields"
import Leads from "./pages/Leads"
import Bases from "./pages/Bases"
import BaseDetail from "./pages/BaseDetail"
import DataSources from "./pages/DataSources"
import MoveLeads from "./pages/MoveLeads"
import Lotes from "./pages/Lotes"
import UsersAdmin from "./pages/UsersAdmin"
import RolesAdmin from "./pages/RolesAdmin"
import BulkUpdate from "./pages/BulkUpdate"
import Webhooks from "./pages/Webhooks"
import Automations from "./pages/Automations"
import SipProviders from "./pages/SipProviders"
import SipTrunks from "./pages/SipTrunks"
import PbxNodes from "./pages/PbxNodes"
import VoipAgents from "./pages/VoipAgents"
import Dispositions from "./pages/Dispositions"
import TipificacionesAdmin from "./pages/TipificacionesAdmin"
import CampaniasAdmin from "./pages/CampaniasAdmin"
import AuditoriaPage from "./pages/AuditoriaPage"
import Campaigns from "./pages/Campaigns"
import ReportesPage from "./pages/reportes/ReportesPage"
import ReporteBasesPage from "./pages/reportes/ReporteBasesPage"
import MetricasAgentesPage from "./pages/reportes/MetricasAgentesPage"
import MonitorPage from "./pages/reportes/MonitorPage"
import CampaignDetail from "./pages/CampaignDetail"
import GestionContactos from "./pages/GestionContactos"
import CallRecords from "./pages/CallRecords"
import DncList from "./pages/DncList"
import FichaConfigAdmin from "./pages/FichaConfigAdmin"
import CentroControlPage from "./pages/CentroControlPage"
import ApiDocsPage from "./pages/ApiDocsPage"
import ProdeApp from "./prode/ProdeApp"

export default function App() {
  return (
    <Routes>
      {/* Prode Mundial 2026 — standalone app, no CRM layout */}
      <Route path="/prode/*" element={<ProdeApp />} />

      <Route path="/login" element={<Login />} />
      <Route element={<Layout />}>
        <Route path="/" element={<Welcome />} />

        {/* Data */}
        <Route path="/fields" element={
          <ProtectedRoute module="fields">
            <Fields />
          </ProtectedRoute>
        } />
        <Route path="/leads" element={
          <ProtectedRoute module="leads">
            <Leads />
          </ProtectedRoute>
        } />
        <Route path="/bases" element={
          <ProtectedRoute module="leads">
            <Bases />
          </ProtectedRoute>
        } />
        <Route path="/bases/:baseId" element={
          <ProtectedRoute module="leads">
            <BaseDetail />
          </ProtectedRoute>
        } />
        <Route path="/datasources" element={
          <ProtectedRoute module="leads">
            <DataSources />
          </ProtectedRoute>
        } />
        <Route path="/move-leads" element={
          <ProtectedRoute module="leads" action="edit">
            <MoveLeads />
          </ProtectedRoute>
        } />
        <Route path="/lotes" element={
          <ProtectedRoute module="leads">
            <Lotes />
          </ProtectedRoute>
        } />
        <Route path="/bulk-update" element={
          <ProtectedRoute module="leads" action="edit">
            <BulkUpdate />
          </ProtectedRoute>
        } />

        {/* Automation */}
        <Route path="/webhooks" element={
          <ProtectedRoute module="webhooks">
            <Webhooks />
          </ProtectedRoute>
        } />
        <Route path="/automations" element={
          <ProtectedRoute module="automations">
            <Automations />
          </ProtectedRoute>
        } />

        {/* Call Center */}
        <Route path="/callcenter/providers" element={
          <ProtectedRoute module="voip">
            <SipProviders />
          </ProtectedRoute>
        } />
        <Route path="/callcenter/trunks" element={
          <ProtectedRoute module="voip">
            <SipTrunks />
          </ProtectedRoute>
        } />
        <Route path="/callcenter/pbx" element={
          <ProtectedRoute module="voip">
            <PbxNodes />
          </ProtectedRoute>
        } />
        <Route path="/callcenter/agents" element={
          <ProtectedRoute module="agents">
            <VoipAgents />
          </ProtectedRoute>
        } />
        <Route path="/callcenter/dispositions" element={
          <ProtectedRoute module="voip">
            <Dispositions />
          </ProtectedRoute>
        } />
        <Route path="/callcenter/campaigns" element={
          <ProtectedRoute module="campaigns">
            <Campaigns />
          </ProtectedRoute>
        } />
        <Route path="/callcenter/campaigns/:campaignId" element={
          <ProtectedRoute module="campaigns">
            <CampaignDetail />
          </ProtectedRoute>
        } />
        <Route path="/callcenter/cdr" element={
          <ProtectedRoute module="voip">
            <CallRecords />
          </ProtectedRoute>
        } />
        <Route path="/callcenter/dnc" element={
          <ProtectedRoute module="voip">
            <DncList />
          </ProtectedRoute>
        } />
        <Route path="/callcenter/gestion" element={
          <ProtectedRoute module="campaigns">
            <GestionContactos />
          </ProtectedRoute>
        } />

        {/* Admin — requires explicit admin permissions */}
        <Route path="/admin/users" element={
          <ProtectedRoute module="users">
            <UsersAdmin />
          </ProtectedRoute>
        } />
        <Route path="/admin/roles" element={
          <ProtectedRoute module="roles">
            <RolesAdmin />
          </ProtectedRoute>
        } />
        <Route path="/admin/tipificaciones" element={
          <ProtectedRoute module="settings">
            <TipificacionesAdmin />
          </ProtectedRoute>
        } />
        <Route path="/admin/campanias" element={
          <ProtectedRoute module="campaigns">
            <CampaniasAdmin />
          </ProtectedRoute>
        } />
        <Route path="/admin/auditoria" element={
          <ProtectedRoute module="settings">
            <AuditoriaPage />
          </ProtectedRoute>
        } />
        <Route path="/admin/ficha-config" element={
          <ProtectedRoute module="settings">
            <FichaConfigAdmin />
          </ProtectedRoute>
        } />
        <Route path="/admin/api-docs" element={
          <ProtectedRoute module="accounts">
            <ApiDocsPage />
          </ProtectedRoute>
        } />

        {/* Centro de Control */}
        <Route path="/centro-control" element={<CentroControlPage />} />

        {/* Reportes */}
        <Route path="/reportes" element={
          <ProtectedRoute module="reportes">
            <ReportesPage />
          </ProtectedRoute>
        } />
        <Route path="/reportes/bases" element={
          <ProtectedRoute module="reportes">
            <ReporteBasesPage />
          </ProtectedRoute>
        } />
        <Route path="/reportes/agentes" element={
          <ProtectedRoute module="reportes">
            <MetricasAgentesPage />
          </ProtectedRoute>
        } />
        <Route path="/reportes/monitor" element={
          <ProtectedRoute module="reportes">
            <MonitorPage />
          </ProtectedRoute>
        } />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
