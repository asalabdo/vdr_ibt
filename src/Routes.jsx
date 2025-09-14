import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";
import ScrollToTop from "@/components/ScrollToTop";
import ErrorBoundary from "@/components/ErrorBoundary";
import NotFound from "@/pages/NotFound";
import DealAnalyticsIntelligenceDashboard from '@/pages/deal-analytics-intelligence-dashboard';
import VDROperationsCommandCenter from '@/pages/vdr-operations-command-center';
import ComplianceSecurityMonitoringDashboard from '@/pages/compliance-security-monitoring-dashboard';
import ExecutiveDealFlowDashboard from '@/pages/executive-deal-flow-dashboard';
import DataRoomsManagement from '@/pages/data-rooms-management';
import GroupsManagement from '@/pages/groups-management';
import QAManagementCenter from '@/pages/q-a-management-center';
import DocumentManagementConsole from '@/pages/document-management-console';
import UsersManagement from '@/pages/users-management';
import RolesPermissions from '@/pages/roles-permissions';
import AuditLogs from '@/pages/audit-logs';
import Settings from '@/pages/settings';
import NotificationsPage from '@/pages/notifications';
import Header from '@/components/ui/Header';
import Login from '@/pages/Login';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import PublicRoute from '@/components/auth/PublicRoute';
import PermissionGuard, { 
  AdminGuard, 
  SubadminGuard, 
  UsersManagementGuard, 
  GroupsManagementGuard,
  AuditLogsGuard,
  SystemSettingsGuard
} from '@/components/PermissionGuard';
import { AppSidebar } from '@/components/app-sidebar';
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';


const Routes = () => {
  // Layout component for protected routes
  const AppLayout = ({ children }) => (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Header />
        <div className="flex-1 space-y-4 p-8 pt-6">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );

  return (
    <BrowserRouter>
      <ErrorBoundary>
        <ScrollToTop />
        
        <RouterRoutes>
          {/* Public Routes - Login Page (redirects if authenticated) */}
          <Route path="/login" element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } />
          
          {/* Protected Routes - Require Authentication */}
          <Route path="/deal-analytics-intelligence-dashboard" element={
            <ProtectedRoute>
              <AppLayout><DealAnalyticsIntelligenceDashboard /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/vdr-operations-command-center" element={
            <ProtectedRoute>
              <AppLayout>
                <PermissionGuard permission="data_rooms.manage">
                  <VDROperationsCommandCenter />
                </PermissionGuard>
              </AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/compliance-security-monitoring-dashboard" element={
            <ProtectedRoute>
              <AppLayout>
                <AuditLogsGuard>
                  <ComplianceSecurityMonitoringDashboard />
                </AuditLogsGuard>
              </AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/executive-deal-flow-dashboard" element={
            <ProtectedRoute>
              <AppLayout><ExecutiveDealFlowDashboard /></AppLayout>
            </ProtectedRoute>
          } />

          <Route path="/" element={
            <ProtectedRoute>
              <AppLayout><ExecutiveDealFlowDashboard /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/data-rooms-management" element={
            <ProtectedRoute>
              <AppLayout><DataRoomsManagement /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/groups-management" element={
            <ProtectedRoute>
              <AppLayout>
                <GroupsManagementGuard>
                  <GroupsManagement />
                </GroupsManagementGuard>
              </AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/q-a-management-center" element={
            <ProtectedRoute>
              <AppLayout><QAManagementCenter /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/document-management-console" element={
            <ProtectedRoute>
              <AppLayout><DocumentManagementConsole /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/users-management" element={
            <ProtectedRoute>
              <AppLayout>
                <UsersManagementGuard>
                  <UsersManagement />
                </UsersManagementGuard>
              </AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/roles-permissions" element={
            <ProtectedRoute>
              <AppLayout>
                <AdminGuard>
                  <RolesPermissions />
                </AdminGuard>
              </AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/audit-logs" element={
            <ProtectedRoute>
              <AppLayout>
                <AuditLogsGuard>
                  <AuditLogs />
                </AuditLogsGuard>
              </AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute>
              <AppLayout><Settings /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/notifications" element={
            <ProtectedRoute>
              <AppLayout><NotificationsPage /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="*" element={
            <ProtectedRoute>
              <AppLayout><NotFound /></AppLayout>
            </ProtectedRoute>
          } />
        </RouterRoutes>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;