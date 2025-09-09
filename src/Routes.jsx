import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes as RouterRoutes, Route, Link, useLocation } from "react-router-dom";
import ScrollToTop from "@/components/ScrollToTop";
import ErrorBoundary from "@/components/ErrorBoundary";
import NotFound from "@/pages/NotFound";
import DealAnalyticsIntelligenceDashboard from '@/pages/deal-analytics-intelligence-dashboard';
import VDROperationsCommandCenter from '@/pages/vdr-operations-command-center';
import ComplianceSecurityMonitoringDashboard from '@/pages/compliance-security-monitoring-dashboard';
import ExecutiveDealFlowDashboard from '@/pages/executive-deal-flow-dashboard';
import DataRoomsManagement from '@/pages/data-rooms-management';
import QAManagementCenter from '@/pages/q-a-management-center';
import DocumentManagementConsole from '@/pages/document-management-console';
import UsersManagement from '@/pages/users-management';
import RolesPermissions from '@/pages/roles-permissions';
import AuditLogs from '@/pages/audit-logs';
import Settings from '@/pages/settings';
import NotificationsPage from '@/pages/notifications';
import Header from '@/components/ui/Header';
import Icon from '@/components/AppIcon';
import { useTranslation } from 'react-i18next';
import Login from '@/pages/Login';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import PublicRoute from '@/components/auth/PublicRoute';

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { t } = useTranslation('navigation'); // Use navigation namespace for all routes/sections
  const [openSections, setOpenSections] = React.useState({ Dashboard: false }); // Dashboard hidden by default

  const routeSections = [
    {
      section: t('sections.dashboard'),
      items: [
        { label: t('routes.executive_overview'), path: '/executive-deal-flow-dashboard', icon: 'BarChart3' },
        { label: t('routes.deal_intelligence'), path: '/deal-analytics-intelligence-dashboard', icon: 'TrendingUp' },
        { label: t('routes.operations_center'), path: '/vdr-operations-command-center', icon: 'Monitor' },
        { label: t('routes.compliance_security'), path: '/compliance-security-monitoring-dashboard', icon: 'Shield' },
      ]
    },
    {
      section: t('sections.workspace'),
      items: [
        { label: t('routes.home'), path: '/', icon: 'Home' },
        { label: t('routes.data_rooms'), path: '/data-rooms-management', icon: 'Folder' },
        { label: t('routes.q_a_center'), path: '/q-a-management-center', icon: 'MessageSquare' },
        { label: t('routes.document_console'), path: '/document-management-console', icon: 'FileText' },
        { label: t('routes.users'), path: '/users-management', icon: 'Users' },
        { label: t('routes.roles_permissions'), path: '/roles-permissions', icon: 'Key' },
        { label: t('routes.audit_logs'), path: '/audit-logs', icon: 'Clipboard' },
        { label: t('routes.notifications'), path: '/notifications', icon: 'Bell' },
        { label: t('routes.settings'), path: '/settings', icon: 'Settings' }
      ]
    }
  ];

  const toggleSection = (name) => {
    setOpenSections((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  // On mobile, when sidebar is open we show a full panel; on desktop we collapse to icon-only when closed
  return (
    <>
      {/* Mobile overlay when open */}
      <div className={`lg:hidden ${isOpen ? 'fixed inset-0 z-40' : 'hidden'}`}>
        <div className="absolute inset-0 bg-black/50" onClick={onClose} />
        <aside className="absolute right-0 top-0 h-full w-64 bg-card border-l border-border shadow-lg z-50">
          <nav className="p-4 space-y-4">
            {routeSections.map((section) => (
              <div key={section.section}>
                <button
                  onClick={() => toggleSection(section.section)}
                  className="w-full flex items-center justify-between px-1 mb-2"
                >
                  <div className="text-xs uppercase text-muted-foreground">{section.section}</div>
                  <Icon name={openSections[section.section] ? 'ChevronDown' : 'ChevronRight'} size={16} />
                </button>

                {openSections[section.section] && (
                  <div className="space-y-2">
                    {section.items.map((item) => {
                      const isActive = location.pathname === item.path;
                      return (
                        <Link
                          key={item.path}
                          to={item.path}
                          onClick={onClose}
                          className={`w-full flex items-start space-x-3 px-3 py-2 rounded-lg transition-colors text-sm ${isActive ? 'bg-primary/10 text-primary border border-primary/20' : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'}`}
                        >
                          <div className="mt-0.5">
                            <Icon name={item.icon} size={18} />
                          </div>
                          <div className="flex-1">
                            <div className="font-medium">{item.label}</div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </aside>
      </div>

      {/* Desktop sidebar (collapsible) */}
      <aside className={`hidden lg:block h-[calc(100vh-4rem)] pt-6 sticky top-16 transition-all ${isOpen ? 'w-64' : 'w-20'}`}>
        <nav className="space-y-4 px-2">
          {routeSections.map((section) => (
            <div key={section.section}>
              <button
                onClick={() => toggleSection(section.section)}
                className={`w-full flex items-center justify-between ${isOpen ? 'px-1 text-xs uppercase text-muted-foreground mb-2' : 'px-0 mb-2'}`}
              >
                <div className="flex items-center space-x-2">
                  <div className="w-6 flex justify-center">
                    {/* optional placeholder for section icon */}
                    <Icon name={section.section === 'Dashboard' ? 'Grid' : 'Layers'} size={16} />
                  </div>
                  <div className={`${isOpen ? '' : 'sr-only'}`}>{section.section}</div>
                </div>
                <Icon name={openSections[section.section] ? 'ChevronDown' : 'ChevronRight'} size={16} />
              </button>

              {openSections[section.section] && (
                <div className="space-y-2">
                  {section.items.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors text-sm ${isActive ? 'bg-primary/10 text-primary border border-primary/20' : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'}`}
                      >
                        <div className="w-6 flex justify-center">
                          <Icon name={item.icon} size={18} />
                        </div>
                        <div className={`${isOpen ? 'flex-1' : 'sr-only'}`}>
                          <div className="font-medium">{item.label}</div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
};

const Routes = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const openSidebar = () => setIsSidebarOpen(true);
  const closeSidebar = () => setIsSidebarOpen(false);
  const toggleSidebar = () => setIsSidebarOpen((s) => !s);


  // Layout component for protected routes
  const AppLayout = ({ children }) => (
    <>
      <Header onToggleSidebar={toggleSidebar} />
      <div className="pt-4 bg-background min-h-screen">
        <div className="max-w-7xl mx-auto py-8 flex gap-2">
          <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
          <main className="flex-1">
            {children}
          </main>
        </div>
      </div>
    </>
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
              <AppLayout><VDROperationsCommandCenter /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/compliance-security-monitoring-dashboard" element={
            <ProtectedRoute>
              <AppLayout><ComplianceSecurityMonitoringDashboard /></AppLayout>
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
              <AppLayout><UsersManagement /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/roles-permissions" element={
            <ProtectedRoute>
              <AppLayout><RolesPermissions /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/audit-logs" element={
            <ProtectedRoute>
              <AppLayout><AuditLogs /></AppLayout>
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