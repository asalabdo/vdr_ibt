import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

// UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from '@/components/ui/pagination';
import Icon from '@/components/AppIcon';

// Local Components
import FilterSidebar from './components/FilterSidebar';
import StatsOverview from './components/StatsOverview';
import LogDetailsModal from './components/LogDetailsModal';
import ExportModal from './components/ExportModal';

// Hooks
import { useAuditLogStats, useAuditLogsManagement } from '@/hooks/api/useAuditLogs';

const AuditLogs = () => {
  const { t } = useTranslation('audit-logs');
  
  // Pagination constants
  const LOGS_PER_PAGE = 10;
  
  // State management
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('logs');
  const [selectedLog, setSelectedLog] = useState(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  
  // Filter state
  const [filters, setFilters] = useState({
    categories: [],
    severities: [],
    apps: [],
    users: [],
    // Remove since/until from filters - they're handled by period selector
  });
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);

  // API hooks - single source of truth for both logs and stats
  const {
    data: statsData,
    isLoading: statsLoading,
    error: statsError,
    refetch: refetchStats
  } = useAuditLogStats({
    search: searchQuery || undefined,
    ...filters,
  });

  const { refreshAllData } = useAuditLogsManagement();

  // Extract data from stats response
  const allLogs = statsData?.logs || [];
  const stats = statsData?.stats || {};
  
  // Client-side filtering (like UsersTable.jsx)
  const filteredLogs = searchQuery
    ? allLogs.filter(log => 
        log.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.message?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.user?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.app?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : allLogs;
  
  // Client-side pagination (like UsersTable.jsx)
  const totalLogs = filteredLogs.length;
  const totalPages = Math.ceil(totalLogs / LOGS_PER_PAGE);
  const startIndex = (currentPage - 1) * LOGS_PER_PAGE;
  const endIndex = startIndex + LOGS_PER_PAGE;
  const logs = filteredLogs.slice(startIndex, endIndex);

  // Event handlers
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset pagination
  };

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setCurrentPage(1); // Reset pagination
  };

  const handleRefresh = () => {
    refetchStats(); // Only need to refresh stats since it contains everything
  };

  const handleLogClick = (log) => {
    setSelectedLog(log);
  };

  const handleCloseLogDetails = () => {
    setSelectedLog(null);
  };


  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  // Reset to first page when search or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filters]);

  // Get severity stats for quick overview
  const severityStats = {
    critical: stats.bySeverity?.critical || 0,
    high: stats.bySeverity?.high || 0,
    medium: stats.bySeverity?.medium || 0,
    low: stats.bySeverity?.low || 0,
  };

  // Helper function to get user initials for avatar
  const getUserInitials = (log) => {
    if (!log || !log.user) return '?';
    const name = log.user || '';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';
  };

  // Helper function to format timestamp
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '-';
    return new Date(timestamp).toLocaleString();
  };

  // Helper function to get severity color
  const getSeverityBadgeClass = (severity) => {
    switch (severity) {
      case 'critical': return 'bg-destructive/10 text-destructive';
      case 'high': return 'bg-warning/10 text-warning';
      case 'medium': return 'bg-warning/5 text-warning';
      case 'low': return 'bg-primary/10 text-primary';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'warning';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'critical': return <Icon name="AlertTriangle" size={16} className="text-destructive" />;
      case 'high': return <Icon name="Shield" size={16} className="text-warning" />;
      case 'medium': return <Icon name="Info" size={16} className="text-warning" />;
      case 'low': return <Icon name="Activity" size={16} className="text-primary" />;
      default: return <Icon name="Info" size={16} className="text-muted-foreground" />;
    }
  };

  return (
    <TooltipProvider>
      <div className="flex h-full">
        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="px-6 py-8">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
              <div className="mb-4 lg:mb-0">
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  {t('title', 'Audit Logs')}
                </h1>
                <p className="text-muted-foreground">
                  {t('description', 'Monitor and analyze system activities and security events')}
                </p>
              </div>
              
              <div className="flex items-center gap-3 rtl:space-x-reverse">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={statsLoading}
                  className="gap-2 rtl:space-x-reverse"
                >
                  <Icon name="RefreshCw" size={16} className={statsLoading ? 'animate-spin' : ''} />
                  {t('refresh', 'Refresh')}
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsExportModalOpen(true)}
                  className="gap-2 rtl:space-x-reverse"
                >
                  <Icon name="Download" size={16} />
                  {t('exportButton', 'Export')}
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsFilterOpen(true)}
                  className="gap-2 rtl:space-x-reverse"
                >
                  <Icon name="Filter" size={16} />
                  {t('filterButton', 'Filter')}
                </Button>
              </div>
            </div>

            <Separator className="my-8" />

            {/* Quick Stats */}
            {!statsLoading && stats && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {Object.entries(severityStats).map(([severity, count]) => (
                  <Card key={severity} className="p-3">
                    <div className="flex items-center space-x-3 rtl:space-x-reverse">
                      <div className={`p-2 rounded-lg ${
                        severity === 'critical' ? 'bg-destructive/10 text-destructive' :
                        severity === 'high' ? 'bg-warning/10 text-warning' :
                        severity === 'medium' ? 'bg-warning/5 text-warning' :
                        'bg-primary/10 text-primary'
                      }`}>
                        {getSeverityIcon(severity)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground capitalize">
                          {t(`severity.${severity}`, severity)}
                        </p>
                        <p className="text-xl font-bold text-foreground">{count}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Content Tabs */}
          <div className="flex-1 overflow-hidden">
          <Tabs defaultValue="logs" value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <div className="mx-6 mt-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="logs" className="flex items-center space-x-2 rtl:space-x-reverse rtl:order-2">
                  <Icon name="Activity" size={16} />
                  <span>{t('tabs.logs', 'Audit Logs')}</span>
                </TabsTrigger>
                <TabsTrigger value="analytics" className="flex items-center space-x-2 rtl:space-x-reverse rtl:order-1">
                  <Icon name="BarChart3" size={16} />
                  <span>{t('tabs.analytics', 'Analytics')}</span>
                </TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="logs" className="flex-1 overflow-hidden mt-4">
                <Card className="mx-6">
                  <CardHeader className="pb-4 space-y-3">
                    <div className="flex items-center justify-between rtl:flex-row-reverse">
                      <CardTitle className="flex items-center gap-2 text-lg rtl:space-x-reverse">
                        <Icon name="Activity" size={18} />
                        {t('tabs.logs', 'Audit Logs')}
                      </CardTitle>
                      <Badge variant="secondary" className="px-2 py-1 text-xs">
                        {totalLogs} {t('totalLogs', 'logs')}
                      </Badge>
                    </div>
                    
                    {/* Search and Actions */}
                      <div className="flex items-center gap-3 rtl:space-x-reverse">
                        <div className="relative flex-1 max-w-sm">
                          <Icon 
                            name="Search" 
                            size={14} 
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground rtl:left-auto rtl:right-3" 
                          />
                          <Input
                            placeholder={t('searchPlaceholder', 'Search audit logs...')}
                            value={searchQuery}
                            onChange={handleSearch}
                            className="pl-9 h-9 text-sm rtl:pl-3 rtl:pr-9"
                          />
                        </div>
                      
                      
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={refetchStats}
                            disabled={statsLoading}
                            className="h-9 w-9 p-0"
                          >
                            <Icon name="RefreshCw" size={14} className={statsLoading ? "animate-spin" : ""} />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{t('refresh', 'Refresh')}</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </CardHeader>
                
                  <CardContent>
                    {statsLoading ? (
                      <div className="space-y-3">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <div key={i} className="flex items-center justify-between py-2">
                            <div className="flex items-center space-x-3">
                              <Skeleton className="h-9 w-9 rounded-full" />
                              <div className="space-y-1">
                                <Skeleton className="h-4 w-40" />
                                <Skeleton className="h-3 w-24" />
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <Skeleton className="h-6 w-16" />
                              <Skeleton className="h-3 w-20" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : statsError ? (
                      <Alert variant="destructive">
                        <Icon name="AlertCircle" size={16} />
                        <AlertDescription className="flex items-center justify-between">
                          <span>{t('error.loadLogs', 'Failed to load audit logs')}: {statsError.message}</span>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={refetchStats}
                            className="ml-4 gap-1"
                          >
                            <Icon name="RefreshCw" size={14} />
                            {t('retry', 'Try Again')}
                          </Button>
                        </AlertDescription>
                      </Alert>
                    ) : logs.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                        <div className="rounded-full bg-muted/20 p-3 mb-3">
                          <Icon name="Activity" size={24} className="text-muted-foreground" />
                        </div>
                        <h3 className="font-semibold text-base mb-1">{t('noLogs', 'No audit logs found')}</h3>
                        <p className="text-muted-foreground text-xs max-w-sm">
                          {searchQuery ? t('table.no_search_results', 'No logs match your search') : t('table.no_logs_available', 'No audit logs available for the selected period')}
                        </p>
                        {searchQuery && (
                          <Button 
                            variant="outline" 
                            onClick={() => setSearchQuery('')}
                            size="sm"
                            className="mt-3 gap-1"
                          >
                            <Icon name="X" size={12} />
                            {t('table.clear_search', 'Clear search')}
                          </Button>
                        )}
                      </div>
                    ) : (
                      <>
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow className="hover:bg-transparent">
                                <TableHead className="text-xs font-medium text-muted-foreground">{t('table.user', 'User')}</TableHead>
                                <TableHead className="text-xs font-medium text-muted-foreground">{t('table.activity', 'Activity')}</TableHead>
                                <TableHead className="text-xs font-medium text-muted-foreground">{t('table.severity', 'Severity')}</TableHead>
                                <TableHead className="text-xs font-medium text-muted-foreground">{t('table.time', 'Time')}</TableHead>
                                <TableHead className="text-xs font-medium text-muted-foreground w-[100px]">{t('table.actions', 'Actions')}</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {logs.map((log) => (
                                <TableRow key={log.id} className="group hover:bg-muted/30">
                                  <TableCell className="py-3">
                                    <div className="flex items-center gap-3">
                                      <Avatar className="h-8 w-8">
                                        <AvatarFallback className="bg-primary/10 text-primary font-medium text-xs">
                                          {getUserInitials(log)}
                                        </AvatarFallback>
                                      </Avatar>
                                      <div className="min-w-0 flex-1">
                                        <p className="font-medium text-sm truncate">{log.user || 'System'}</p>
                                        <p className="text-muted-foreground text-xs truncate">{log.app}</p>
                                      </div>
                                    </div>
                                  </TableCell>
                                  <TableCell className="py-3 max-w-md">
                                    <div className="space-y-1">
                                      <p className="text-sm font-medium truncate">{log.subject || log.message}</p>
                                      <p className="text-xs text-muted-foreground truncate">{log.message !== log.subject ? log.message : log.type}</p>
                                    </div>
                                  </TableCell>
                                  <TableCell className="py-3">
                                    <Badge 
                                      variant="secondary" 
                                      className={`text-xs py-0 px-2 ${getSeverityBadgeClass(log.severity)}`}
                                    >
                                      {t(`severity.${log.severity}`, log.severity)}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="py-3">
                                    <div className="text-xs space-y-1">
                                      <p className="font-medium">{formatTimestamp(log.timestamp)}</p>
                                      {log.relativeTime && (
                                        <p className="text-muted-foreground">{log.relativeTime}</p>
                                      )}
                                    </div>
                                  </TableCell>
                                  <TableCell className="py-3">
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={() => handleLogClick(log)}
                                      className="gap-1 h-7 px-2 text-xs"
                                    >
                                      <Icon name="Eye" size={10} />
                                      {t('table.view', 'View')}
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                        
                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                            <div className="mt-6 flex items-center justify-between rtl:flex-row-reverse">
                              <div className="text-sm text-muted-foreground">
                                {t('pagination.showing', 'Showing {{start}} to {{end}} of {{total}} logs', {
                                  start: startIndex + 1,
                                  end: Math.min(startIndex + logs.length, totalLogs),
                                  total: totalLogs
                                })}
                              </div>
                              <Pagination className="mx-0 w-auto justify-end rtl:justify-start">
                                <PaginationContent className="rtl:flex-row-reverse">
                                  <PaginationItem>
                                    <PaginationPrevious 
                                      onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                                      className={currentPage <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                    />
                                  </PaginationItem>
                                
                                {[...Array(totalPages)].map((_, index) => {
                                  const pageNumber = index + 1;
                                  // Show first page, last page, current page, and pages around current page
                                  const showPage = pageNumber === 1 || 
                                                  pageNumber === totalPages || 
                                                  (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1);
                                  
                                  if (!showPage) {
                                    // Show ellipsis for gaps
                                    if (pageNumber === currentPage - 2 || pageNumber === currentPage + 2) {
                                      return (
                                        <PaginationItem key={pageNumber}>
                                          <PaginationEllipsis />
                                        </PaginationItem>
                                      );
                                    }
                                    return null;
                                  }
                                  
                                  return (
                                    <PaginationItem key={pageNumber}>
                                      <PaginationLink
                                        onClick={() => handlePageChange(pageNumber)}
                                        isActive={currentPage === pageNumber}
                                        className="cursor-pointer"
                                      >
                                        {pageNumber}
                                      </PaginationLink>
                                    </PaginationItem>
                                  );
                                })}
                                
                                <PaginationItem>
                                  <PaginationNext 
                                    onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                                    className={currentPage >= totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                  />
                                </PaginationItem>
                              </PaginationContent>
                            </Pagination>
                          </div>
                        )}
                      </>
                    )}
                  </CardContent>
                </Card>
            </TabsContent>
            
            <TabsContent value="analytics" className="flex-1 overflow-hidden mt-4">
              <div className="h-full overflow-auto px-6">
                <StatsOverview 
                  stats={stats}
                  loading={statsLoading}
                  error={statsError}
                  onRefresh={refetchStats}
                />
              </div>
            </TabsContent>
          </Tabs>
          </div>
        </div>
      </div>

      {/* Modals */}
      <FilterSidebar
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        filters={filters}
        onFilterChange={handleFilterChange}
        logs={allLogs}
      />

      <LogDetailsModal
        isOpen={!!selectedLog}
        onClose={handleCloseLogDetails}
        log={selectedLog}
      />

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        filters={filters}
      />
    </TooltipProvider>
  );
};

export default AuditLogs;