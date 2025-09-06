import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const AuditTable = () => {
  const { t } = useTranslation('compliance-security-dashboard');
  const { t: tCommon } = useTranslation('common');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortField, setSortField] = useState('timestamp');
  const [sortDirection, setSortDirection] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const auditLogs = [
    {
      id: 1,
      timestamp: '2025-08-31 15:45:23',
      user: 'john.doe@company.com',
      action: 'document_access',
      actionDisplay: t('audit_table.sample_data.actions.document_access'),
      resource: t('audit_table.sample_data.resources.financial_statements'),
      ip_address: '192.168.1.100',
      location: t('audit_table.sample_data.locations.new_york'),
      status: 'success',
      risk_level: 'low',
      session_id: 'sess_abc123'
    },
    {
      id: 2,
      timestamp: '2025-08-31 15:42:15',
      user: 'sarah.wilson@advisor.com',
      action: 'permission_change',
      actionDisplay: t('audit_table.sample_data.actions.permission_change'),
      resource: t('audit_table.sample_data.resources.deal_room_alpha'),
      ip_address: '203.45.67.89',
      location: t('audit_table.sample_data.locations.london'),
      status: 'success',
      risk_level: 'medium',
      session_id: 'sess_def456'
    },
    {
      id: 3,
      timestamp: '2025-08-31 15:38:07',
      user: 'michael.chen@company.com',
      action: 'failed_login',
      actionDisplay: t('audit_table.sample_data.actions.failed_login'),
      resource: t('audit_table.sample_data.resources.auth_system'),
      ip_address: '45.123.78.90',
      location: t('audit_table.sample_data.locations.unknown'),
      status: 'failed',
      risk_level: 'high',
      session_id: 'sess_ghi789'
    },
    {
      id: 4,
      timestamp: '2025-08-31 15:35:42',
      user: 'emma.davis@company.com',
      action: 'document_download',
      actionDisplay: t('audit_table.sample_data.actions.document_download'),
      resource: t('audit_table.sample_data.resources.legal_contracts'),
      ip_address: '192.168.1.105',
      location: t('audit_table.sample_data.locations.san_francisco'),
      status: 'success',
      risk_level: 'medium',
      session_id: 'sess_jkl012'
    },
    {
      id: 5,
      timestamp: '2025-08-31 15:32:18',
      user: 'admin@company.com',
      action: 'user_role_update',
      actionDisplay: t('audit_table.sample_data.actions.user_role_update'),
      resource: t('audit_table.sample_data.resources.user_management'),
      ip_address: '192.168.1.1',
      location: t('audit_table.sample_data.locations.new_york'),
      status: 'success',
      risk_level: 'high',
      session_id: 'sess_mno345'
    },
    {
      id: 6,
      timestamp: '2025-08-31 15:28:55',
      user: 'robert.taylor@external.com',
      action: 'document_view',
      actionDisplay: t('audit_table.sample_data.actions.document_view'),
      resource: t('audit_table.sample_data.resources.market_analysis'),
      ip_address: '78.45.123.67',
      location: t('audit_table.sample_data.locations.toronto'),
      status: 'success',
      risk_level: 'low',
      session_id: 'sess_pqr678'
    }
  ];

  const actionTypes = [
    { value: 'all', label: t('audit_table.action_types.all') },
    { value: 'document_access', label: t('audit_table.action_types.document_access') },
    { value: 'document_download', label: t('audit_table.action_types.document_download') },
    { value: 'permission_change', label: t('audit_table.action_types.permission_change') },
    { value: 'failed_login', label: t('audit_table.action_types.failed_login') },
    { value: 'user_role_update', label: t('audit_table.action_types.user_role_update') }
  ];

  const getRiskLevelColor = (level) => {
    switch (level) {
      case 'high':
        return 'bg-error/10 text-error border-error/20';
      case 'medium':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'low':
        return 'bg-success/10 text-success border-success/20';
      default:
        return 'bg-muted/10 text-muted-foreground border-border';
    }
  };

  const getStatusIcon = (status) => {
    return status === 'success' 
      ? { icon: 'CheckCircle', color: 'text-success' }
      : { icon: 'XCircle', color: 'text-error' };
  };

  const filteredLogs = auditLogs?.filter(log => {
    const matchesSearch = searchTerm === '' || 
      log?.user?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
      log?.actionDisplay?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
      log?.resource?.toLowerCase()?.includes(searchTerm?.toLowerCase());
    
    const matchesFilter = filterType === 'all' || log?.action === filterType;
    
    return matchesSearch && matchesFilter;
  });

  const sortedLogs = [...filteredLogs]?.sort((a, b) => {
    const aValue = a?.[sortField];
    const bValue = b?.[sortField];
    
    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const totalPages = Math.ceil(sortedLogs?.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedLogs = sortedLogs?.slice(startIndex, startIndex + itemsPerPage);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date?.toLocaleString();
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-1">
            {t('audit_table.title')}
          </h3>
          <p className="text-sm text-muted-foreground">
            {t('audit_table.subtitle')}
          </p>
        </div>
        
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <Button variant="outline" size="sm" iconName="Download">
            {t('actions.export_csv')}
          </Button>
          <Button variant="outline" size="sm" iconName="Filter">
            {t('actions.advanced_filter')}
          </Button>
        </div>
      </div>
      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <Input
            type="search"
            placeholder={t('audit_table.search_placeholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e?.target?.value)}
          />
        </div>
        
        <Select
          options={actionTypes}
          value={filterType}
          onChange={setFilterType}
          placeholder={t('audit_table.filter_placeholder')}
          className="sm:w-48"
        />
      </div>
      {/* Audit Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4">
                <button
                  onClick={() => handleSort('timestamp')}
                  className="flex items-center space-x-1 rtl:space-x-reverse text-sm font-medium text-muted-foreground hover:text-foreground"
                >
                  <span>{t('audit_table.headers.timestamp')}</span>
                  <Icon 
                    name={sortField === 'timestamp' && sortDirection === 'asc' ? 'ChevronUp' : 'ChevronDown'} 
                    size={14} 
                  />
                </button>
              </th>
              <th className="text-left py-3 px-4">
                <button
                  onClick={() => handleSort('user')}
                  className="flex items-center space-x-1 rtl:space-x-reverse text-sm font-medium text-muted-foreground hover:text-foreground"
                >
                  <span>{t('audit_table.headers.user')}</span>
                  <Icon 
                    name={sortField === 'user' && sortDirection === 'asc' ? 'ChevronUp' : 'ChevronDown'} 
                    size={14} 
                  />
                </button>
              </th>
              <th className="text-left py-3 px-4">
                <span className="text-sm font-medium text-muted-foreground">
                  {t('audit_table.headers.action')}
                </span>
              </th>
              <th className="text-left py-3 px-4">
                <span className="text-sm font-medium text-muted-foreground">
                  {t('audit_table.headers.resource')}
                </span>
              </th>
              <th className="text-left py-3 px-4">
                <span className="text-sm font-medium text-muted-foreground">
                  {t('audit_table.headers.location')}
                </span>
              </th>
              <th className="text-left py-3 px-4">
                <span className="text-sm font-medium text-muted-foreground">
                  {t('audit_table.headers.risk_level')}
                </span>
              </th>
              <th className="text-left py-3 px-4">
                <span className="text-sm font-medium text-muted-foreground">
                  {t('audit_table.headers.status')}
                </span>
              </th>
              <th className="text-left py-3 px-4">
                <span className="text-sm font-medium text-muted-foreground">
                  {t('audit_table.headers.actions')}
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedLogs?.map((log) => {
              const statusConfig = getStatusIcon(log?.status);
              return (
                <tr key={log?.id} className="border-b border-border hover:bg-muted/20 transition-colors">
                  <td className="py-3 px-4">
                    <span className="text-sm text-foreground">{formatTimestamp(log?.timestamp)}</span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                        <Icon name="User" size={12} className="text-primary" />
                      </div>
                      <span className="text-sm text-foreground">{log?.user}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm text-foreground">{log?.actionDisplay}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm text-foreground truncate max-w-32" title={log?.resource}>
                      {log?.resource}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-sm text-foreground">
                      <div>{log?.location}</div>
                      <div className="text-xs text-muted-foreground">{log?.ip_address}</div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`
                      px-2 py-1 rounded text-xs font-medium border
                      ${getRiskLevelColor(log?.risk_level)}
                    `}>
                      {t(`audit_table.risk_levels.${log?.risk_level}`)}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-1 rtl:space-x-reverse">
                      <Icon name={statusConfig?.icon} size={16} className={statusConfig?.color} />
                      <span className="text-sm text-foreground capitalize">
                        {t(`audit_table.status_labels.${log?.status}`)}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-1 rtl:space-x-reverse">
                      <Button variant="ghost" size="sm" iconName="Eye">
                        {t('actions.view_details')}
                      </Button>
                      <Button variant="ghost" size="sm" iconName="ExternalLink">
                        {t('actions.investigate')}
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {/* Pagination */}
      <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
        <div className="text-sm text-muted-foreground">
          {t('audit_table.pagination.showing', { 
            start: startIndex + 1, 
            end: Math.min(startIndex + itemsPerPage, sortedLogs?.length), 
            total: sortedLogs?.length 
          })}
        </div>
        
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            iconName="ChevronLeft"
          >
            {t('audit_table.pagination.previous')}
          </Button>
          
          <div className="flex items-center space-x-1 rtl:space-x-reverse">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const page = i + 1;
              return (
                <Button
                  key={page}
                  variant={currentPage === page ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </Button>
              );
            })}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            iconName="ChevronRight"
          >
            {t('audit_table.pagination.next')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AuditTable;