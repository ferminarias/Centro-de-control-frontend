import { Routes, Route, Navigate } from "react-router-dom"
import Layout from "./components/layout/Layout"
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
import Campaigns from "./pages/Campaigns"
import CampaignDetail from "./pages/CampaignDetail"
import CallRecords from "./pages/CallRecords"
import DncList from "./pages/DncList"

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<Layout />}>
        <Route path="/" element={<Welcome />} />
        <Route path="/fields" element={<Fields />} />
        <Route path="/leads" element={<Leads />} />
        <Route path="/bases" element={<Bases />} />
        <Route path="/bases/:baseId" element={<BaseDetail />} />
        <Route path="/datasources" element={<DataSources />} />
        <Route path="/move-leads" element={<MoveLeads />} />
        <Route path="/lotes" element={<Lotes />} />
        <Route path="/bulk-update" element={<BulkUpdate />} />
        <Route path="/webhooks" element={<Webhooks />} />
        <Route path="/automations" element={<Automations />} />
        <Route path="/callcenter/providers" element={<SipProviders />} />
        <Route path="/callcenter/trunks" element={<SipTrunks />} />
        <Route path="/callcenter/pbx" element={<PbxNodes />} />
        <Route path="/callcenter/agents" element={<VoipAgents />} />
        <Route path="/callcenter/dispositions" element={<Dispositions />} />
        <Route path="/callcenter/campaigns" element={<Campaigns />} />
        <Route path="/callcenter/campaigns/:campaignId" element={<CampaignDetail />} />
        <Route path="/callcenter/cdr" element={<CallRecords />} />
        <Route path="/callcenter/dnc" element={<DncList />} />
        <Route path="/admin/users" element={<UsersAdmin />} />
        <Route path="/admin/roles" element={<RolesAdmin />} />
        <Route path="/admin/tipificaciones" element={<TipificacionesAdmin />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
