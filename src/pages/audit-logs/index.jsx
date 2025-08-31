import React, { useState } from 'react';
import Header from '../../components/ui/Header';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Icon from '../../components/AppIcon';
import LogEntry from './components/LogEntry';
import FilterSidebar from './components/FilterSidebar';

const AuditLogs = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterSidebarOpen, setIsFilterSidebarOpen] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({
    action: 'all',
    user: 'all',
    severity: 'all',
    dateRange: 'today'
  });

  // Mock audit logs data
  const [auditLogs] = useState([
    {
      id: 1,
      timestamp: '2025-08-31T15:45:00Z',
      action: 'document_download',
      description: 'Downloaded Contract_Draft.pdf',
      user: {
        name: 'Legal Advisor',
        email: 'legal@company.com',
        avatar: 'LA'
      },
      resource: 'Contract_Draft.pdf',
      resourceType: 'document',
      severity: 'info',
      ipAddress: '192.168.1.105',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/118.0.0.0',
      location: 'New York, US',
      additionalData: {
        fileSize: '3.2 MB',
        room: 'Legal Documents'
      }
    },
    {
      id: 2,
      timestamp: '2025-08-31T15:30:00Z',
      action: 'user_login',
      description: 'Successful login attempt',
      user: {
        name: 'Admin User',
        email: 'admin@company.com',
        avatar: 'AU'
      },
      resource: 'Authentication System',
      resourceType: 'system',
      severity: 'info',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (macOS; Intel Mac OS X 10_15_7) Safari/605.1.15',
      location: 'San Francisco, US',
      additionalData: {
        loginMethod: 'password',
        sessionDuration: '2h 15m'
      }
    },
    {
      id: 3,
      timestamp: '2025-08-31T15:15:00Z',
      action: 'permission_change',
      description: 'Updated user permissions for Financial Analyst',
      user: {
        name: 'Admin User',
        email: 'admin@company.com',
        avatar: 'AU'
      },
      resource: 'Financial Analyst',
      resourceType: 'user',
      severity: 'warning',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (macOS; Intel Mac OS X 10_15_7) Safari/605.1.15',
      location: 'San Francisco, US',
      additionalData: {
        oldRole: 'Viewer',
        newRole: 'Q&A Observer – View Only',
        changedBy: 'Admin User'
      }
    },
    {
      id: 4,
      timestamp: '2025-08-31T15:00:00Z',
      action: 'document_upload',
      description: 'Uploaded new document to Project Alpha',
      user: {
        name: 'Technical Lead',
        email: 'tech@company.com',
        avatar: 'TL'
      },
      resource: 'Technical_Specs_v2.docx',
      resourceType: 'document',
      severity: 'info',
      ipAddress: '192.168.1.112',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/118.0.0.0',
      location: 'Austin, US',
      additionalData: {
        fileSize: '2.1 MB',
        room: 'Project Alpha',
        version: '2.0'
      }
    },
    {
      id: 5,
      timestamp: '2025-08-31T14:45:00Z',
      action: 'failed_login',
      description: 'Failed login attempt - invalid credentials',
      user: {
        name: 'Unknown User',
        email: 'suspicious@external.com',
        avatar: '??'
      },
      resource: 'Authentication System',
      resourceType: 'system',
      severity: 'error',
      ipAddress: '203.45.67.89',
      userAgent: 'curl/7.68.0',
      location: 'Unknown',
      additionalData: {
        attemptCount: 5,
        blocked: true,
        reason: 'Multiple failed attempts'
      }
    },
    {
      id: 6,
      timestamp: '2025-08-31T14:30:00Z',
      action: 'qa_response',
      description: 'Responded to question in Project Alpha',
      user: {
        name: 'Q&A Observer Full',
        email: 'qa.observer@company.com',
        avatar: 'QO'
      },
      resource: 'Question #2',
      resourceType: 'qa',
      severity: 'info',
      ipAddress: '192.168.1.108',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/118.0.0.0',
      location: 'Chicago, US',
      additionalData: {
        questionId: 2,
        room: 'Project Alpha',
        responseLength: '156 characters'
      }
    }
  ]);

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
      <main className="pt-16">
        <div className="max-w-full mx-auto px-6 py-8">
          {/* Header Section */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
            <div className="mb-4 lg:mb-0">
              <h1 className="text-3xl font-bold text-foreground mb-2">Audit Logs</h1>
              <p className="text-muted-foreground">
                Monitor system activities and security events
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button iconName="Download" variant="outline" onClick={handleExport}>
                Export Logs
              </Button>
              <Button iconName="Shield" variant="outline">
                Security Report
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
                  <p className="text-sm font-medium text-muted-foreground">Total Events</p>
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
                  <p className="text-sm font-medium text-muted-foreground">Info</p>
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
                  <p className="text-sm font-medium text-muted-foreground">Warnings</p>
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
                  <p className="text-sm font-medium text-muted-foreground">Errors</p>
                  <p className="text-2xl font-bold text-foreground">{stats?.error}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filter Controls */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Icon name="Search" size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search audit logs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e?.target?.value || '')}
                className="pl-10"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                iconName="Filter"
                variant="outline"
                onClick={() => setIsFilterSidebarOpen(!isFilterSidebarOpen)}
              >
                Filters
              </Button>
              <Button iconName="Calendar" variant="outline">
                Date Range
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
              <h3 className="text-lg font-medium text-foreground mb-2">No audit logs found</h3>
              <p className="text-muted-foreground">
                {searchQuery || Object.values(selectedFilters)?.some(f => f !== 'all' && f !== 'today')
                  ? 'Try adjusting your search criteria or filters' :'Audit logs will appear here as users interact with the system'
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