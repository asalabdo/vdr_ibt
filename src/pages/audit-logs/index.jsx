import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Header from '../../components/ui/Header';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import Icon from '../../components/AppIcon';
import LogEntry from './components/LogEntry';
import FilterSidebar from './components/FilterSidebar';

const AuditLogs = () => {
  const { t } = useTranslation('audit-logs');
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterSidebarOpen, setIsFilterSidebarOpen] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({
    action: 'all',
    user: 'all',
    severity: 'all',
    dateRange: 'today'
  });

  // Mock audit logs data using translation keys
  const [auditLogsData] = useState([
    {
      id: 1,
      timestamp: '2025-08-31T15:45:00Z',
      action: 'document_download',
      descriptionKey: 'sample_data.descriptions.document_download',
      descriptionParams: { fileName: 'sample_data.resources.contract_draft' },
      userKey: 'sample_data.users.legal_advisor',
      userEmail: 'legal@company.com',
      avatar: 'LA',
      resourceKey: 'sample_data.resources.contract_draft',
      resourceType: 'document',
      severity: 'info',
      ipAddress: '192.168.1.105',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/118.0.0.0',
      locationKey: 'sample_data.locations.new_york',
      additionalData: {
        fileSizeKey: 'sample_data.additional_data.file_size',
        fileSizeValue: '3.2 MB',
        roomKey: 'sample_data.additional_data.room',
        roomValue: 'Legal Documents'
      }
    },
    {
      id: 2,
      timestamp: '2025-08-31T15:30:00Z',
      action: 'user_login',
      descriptionKey: 'sample_data.descriptions.user_login',
      userKey: 'sample_data.users.admin_user',
      userEmail: 'admin@company.com',
      avatar: 'AU',
      resourceKey: 'sample_data.resources.authentication_system',
      resourceType: 'system',
      severity: 'info',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (macOS; Intel Mac OS X 10_15_7) Safari/605.1.15',
      locationKey: 'sample_data.locations.san_francisco',
      additionalData: {
        loginMethodKey: 'sample_data.additional_data.login_method',
        loginMethodValue: 'password',
        sessionDurationKey: 'sample_data.additional_data.session_duration',
        sessionDurationValue: '2h 15m'
      }
    },
    {
      id: 3,
      timestamp: '2025-08-31T15:15:00Z',
      action: 'permission_change',
      descriptionKey: 'sample_data.descriptions.permission_change',
      userKey: 'sample_data.users.admin_user',
      userEmail: 'admin@company.com',
      avatar: 'AU',
      resourceKey: 'sample_data.users.financial_analyst',
      resourceType: 'user',
      severity: 'warning',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (macOS; Intel Mac OS X 10_15_7) Safari/605.1.15',
      locationKey: 'sample_data.locations.san_francisco',
      additionalData: {
        oldRoleKey: 'sample_data.additional_data.old_role',
        oldRoleValue: 'Viewer',
        newRoleKey: 'sample_data.additional_data.new_role',
        newRoleValue: 'Q&A Observer – View Only'
      }
    },
    {
      id: 4,
      timestamp: '2025-08-31T15:00:00Z',
      action: 'document_upload',
      descriptionKey: 'sample_data.descriptions.document_upload',
      descriptionParams: { fileName: 'Technical_Specs_v2.docx' },
      userKey: 'sample_data.users.admin_user',
      userEmail: 'tech@company.com',
      avatar: 'TL',
      resource: 'Technical_Specs_v2.docx',
      resourceType: 'document',
      severity: 'info',
      ipAddress: '192.168.1.112',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/118.0.0.0',
      locationKey: 'sample_data.locations.new_york',
      additionalData: {
        fileSizeKey: 'sample_data.additional_data.file_size',
        fileSizeValue: '2.1 MB',
        roomKey: 'sample_data.additional_data.room',
        roomValue: 'Project Alpha'
      }
    }
  ]);

  // Transform keys to actual translated text
  const auditLogs = auditLogsData.map(logData => ({
    ...logData,
    description: logData.descriptionParams 
      ? t(logData.descriptionKey, { fileName: t(logData.descriptionParams.fileName) })
      : t(logData.descriptionKey),
    user: {
      name: t(logData.userKey),
      email: logData.userEmail,
      avatar: logData.avatar
    },
    resource: t(logData.resourceKey),
    location: t(logData.locationKey)
  }));

  const filteredLogs = auditLogs?.filter(log => {
    const matchesSearch = log?.description?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
                         log?.user?.name?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
                         log?.resource?.toLowerCase()?.includes(searchQuery?.toLowerCase());
    const matchesAction = selectedFilters?.action === 'all' || log?.action === selectedFilters?.action;
    const matchesUser = selectedFilters?.user === 'all' || log?.user?.name === selectedFilters?.user;
    const matchesSeverity = selectedFilters?.severity === 'all' || log?.severity === selectedFilters?.severity;
    
    return matchesSearch && matchesAction && matchesUser && matchesSeverity;
  });

  const stats = {
    total: auditLogs?.length || 0,
    info: auditLogs?.filter(log => log?.severity === 'info')?.length || 0,
    warning: auditLogs?.filter(log => log?.severity === 'warning')?.length || 0,
    error: auditLogs?.filter(log => log?.severity === 'error')?.length || 0
  };

  const handleExport = () => {
    console.log('Exporting audit logs...');
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-4">
        <div className="max-w-full mx-auto px-6 py-8">
          {/* Header Section */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
            <div className="mb-4 lg:mb-0">
              <h1 className="text-3xl font-bold text-foreground mb-2">
                {t('title')}
              </h1>
              <p className="text-muted-foreground">
                {t('subtitle')}
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button iconName="Download" variant="outline" onClick={handleExport}>
                {t('actions.export_logs')}
              </Button>
              <Button iconName="Shield" variant="outline">
                {t('actions.security_report')}
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-card rounded-lg shadow-sm border border-border p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Icon name="FileText" size={20} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t('stats.total_logs')}</p>
                  <p className="text-2xl font-bold text-foreground">{stats?.total}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-card rounded-lg shadow-sm border border-border p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
                  <Icon name="Info" size={20} className="text-success" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t('stats.info_logs')}</p>
                  <p className="text-2xl font-bold text-foreground">{stats?.info}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-card rounded-lg shadow-sm border border-border p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center">
                  <Icon name="AlertTriangle" size={20} className="text-warning" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t('stats.warnings')}</p>
                  <p className="text-2xl font-bold text-foreground">{stats?.warning}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-card rounded-lg shadow-sm border border-border p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-destructive/10 rounded-lg flex items-center justify-center">
                  <Icon name="AlertCircle" size={20} className="text-destructive" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t('stats.errors')}</p>
                  <p className="text-2xl font-bold text-foreground">{stats?.error}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filter Controls */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Icon name="Search" size={20} className="absolute left-3 rtl:right-3 rtl:left-auto top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder={t('search.placeholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e?.target?.value || '')}
                className="pl-10 rtl:pr-10 rtl:pl-3"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                iconName="Filter"
                variant="outline"
                onClick={() => setIsFilterSidebarOpen(!isFilterSidebarOpen)}
              >
                {t('actions.filters')}
              </Button>
              <Button iconName="Calendar" variant="outline">
                {t('actions.date_range')}
              </Button>
            </div>
          </div>

          {/* Audit Logs List */}
          <div className="space-y-4">
            {filteredLogs?.map((log) => (
              <LogEntry key={log?.id} log={log} />
            ))}
          </div>

          {/* Empty State */}
          {filteredLogs?.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="FileText" size={32} className="text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">{t('search.no_results_title')}</h3>
              <p className="text-muted-foreground">
                {searchQuery || Object.values(selectedFilters)?.some(f => f !== 'all' && f !== 'today')
                  ? t('search.no_results_description')
                  : t('search.empty_state_description')
                }
              </p>
            </div>
          )}
        </div>
      </main>
      {/* Filter Sidebar */}
      <FilterSidebar
        isOpen={isFilterSidebarOpen}
        onClose={() => setIsFilterSidebarOpen(false)}
        filters={selectedFilters}
        onFilterChange={setSelectedFilters}
        auditLogs={auditLogs}
      />
    </div>
  );
};

export default AuditLogs;
