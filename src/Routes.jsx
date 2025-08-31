import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";
import ScrollToTop from "components/ScrollToTop";
import ErrorBoundary from "components/ErrorBoundary";
import NotFound from "pages/NotFound";
import DealAnalyticsIntelligenceDashboard from './pages/deal-analytics-intelligence-dashboard';
import VDROperationsCommandCenter from './pages/vdr-operations-command-center';
import ComplianceSecurityMonitoringDashboard from './pages/compliance-security-monitoring-dashboard';
import ExecutiveDealFlowDashboard from './pages/executive-deal-flow-dashboard';
import DataRoomsManagement from './pages/data-rooms-management';
import QAManagementCenter from './pages/q-a-management-center';
import DocumentManagementConsole from './pages/document-management-console';
import UsersManagement from './pages/users-management';
import RolesPermissions from './pages/roles-permissions';
import AuditLogs from './pages/audit-logs';
import Settings from './pages/settings';

const Routes = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
      <ScrollToTop />
      <RouterRoutes>
        {/* Define your route here */}
        <Route path="/" element={<ComplianceSecurityMonitoringDashboard />} />
        <Route path="/deal-analytics-intelligence-dashboard" element={<DealAnalyticsIntelligenceDashboard />} />
        <Route path="/vdr-operations-command-center" element={<VDROperationsCommandCenter />} />
        <Route path="/compliance-security-monitoring-dashboard" element={<ComplianceSecurityMonitoringDashboard />} />
        <Route path="/executive-deal-flow-dashboard" element={<ExecutiveDealFlowDashboard />} />
        <Route path="/data-rooms-management" element={<DataRoomsManagement />} />
        <Route path="/q-a-management-center" element={<QAManagementCenter />} />
        <Route path="/document-management-console" element={<DocumentManagementConsole />} />
        <Route path="/users-management" element={<UsersManagement />} />
        <Route path="/roles-permissions" element={<RolesPermissions />} />
        <Route path="/audit-logs" element={<AuditLogs />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<NotFound />} />
      </RouterRoutes>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;