import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const AuditTable = () => {
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
      action: 'Document Access',
      resource: 'Financial_Statements_Q3.pdf',
      ip_address: '192.168.1.100',
      location: 'New York, US',
      status: 'success',
      risk_level: 'low',
      session_id: 'sess_abc123'
    },
    {
      id: 2,
      timestamp: '2025-08-31 15:42:15',
      user: 'sarah.wilson@advisor.com',
      action: 'Permission Change',
      resource: 'Deal Room Alpha',
      ip_address: '203.45.67.89',
      location: 'London, UK',
      status: 'success',
      risk_level: 'medium',
      session_id: 'sess_def456'
    },
    {
      id: 3,
      timestamp: '2025-08-31 15:38:07',
      user: 'michael.chen@company.com',
      action: 'Failed Login Attempt',
      resource: 'Authentication System',
      ip_address: '45.123.78.90',
      location: 'Unknown',
      status: 'failed',
      risk_level: 'high',
      session_id: 'sess_ghi789'
    },
    {
      id: 4,
      timestamp: '2025-08-31 15:35:42',
      user: 'emma.davis@company.com',
      action: 'Document Download',
      resource: 'Legal_Contracts_Bundle.zip',
      ip_address: '192.168.1.105',
      location: 'San Francisco, US',
      status: 'success',
      risk_level: 'medium',
      session_id: 'sess_jkl012'
    },
    {
      id: 5,
      timestamp: '2025-08-31 15:32:18',
      user: 'admin@company.com',
      action: 'User Role Update',
      resource: 'User Management',
      ip_address: '192.168.1.1',
      location: 'New York, US',
      status: 'success',
      risk_level: 'high',
      session_id: 'sess_mno345'
    },
    {
      id: 6,
      timestamp: '2025-08-31 15:28:55',
      user: 'robert.taylor@external.com',
      action: 'Document View',
      resource: 'Market_Analysis_Report.pdf',
      ip_address: '78.45.123.67',
      location: 'Toronto, CA',
      status: 'success',
      risk_level: 'low',
      session_id: 'sess_pqr678'
    }
  ];

  const actionTypes = [
    { value: 'all', label: 'All Actions' },
    { value: 'Document Access', label: 'Document Access' },
    { value: 'Document Download', label: 'Document Download' },
    { value: 'Permission Change', label: 'Permission Change' },
    { value: 'Failed Login Attempt', label: 'Failed Login' },
    { value: 'User Role Update', label: 'User Role Update' }
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
      log?.action?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
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
          <h3 className="text-lg font-semibold text-foreground mb-1">Comprehensive Audit Trail</h3>
          <p className="text-sm text-muted-foreground">Detailed access logs and security events</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" iconName="Download">
            Export CSV
          </Button>
          <Button variant="outline" size="sm" iconName="Filter">
            Advanced Filter
          </Button>
        </div>
      </div>
      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <Input
            type="search"
            placeholder="Search users, actions, or resources..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e?.target?.value)}
          />
        </div>
        
        <Select
          options={actionTypes}
          value={filterType}
          onChange={setFilterType}
          placeholder="Filter by action"
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
                  className="flex items-center space-x-1 text-sm font-medium text-muted-foreground hover:text-foreground"
                >
                  <span>Timestamp</span>
                  <Icon 
                    name={sortField === 'timestamp' && sortDirection === 'asc' ? 'ChevronUp' : 'ChevronDown'} 
                    size={14} 
                  />
                </button>
              </th>
              <th className="text-left py-3 px-4">
                <button
                  onClick={() => handleSort('user')}
                  className="flex items-center space-x-1 text-sm font-medium text-muted-foreground hover:text-foreground"
                >
                  <span>User</span>
                  <Icon 
                    name={sortField === 'user' && sortDirection === 'asc' ? 'ChevronUp' : 'ChevronDown'} 
                    size={14} 
                  />
                </button>
              </th>
              <th className="text-left py-3 px-4">
                <span className="text-sm font-medium text-muted-foreground">Action</span>
              </th>
              <th className="text-left py-3 px-4">
                <span className="text-sm font-medium text-muted-foreground">Resource</span>
              </th>
              <th className="text-left py-3 px-4">
                <span className="text-sm font-medium text-muted-foreground">Location</span>
              </th>
              <th className="text-left py-3 px-4">
                <span className="text-sm font-medium text-muted-foreground">Risk Level</span>
              </th>
              <th className="text-left py-3 px-4">
                <span className="text-sm font-medium text-muted-foreground">Status</span>
              </th>
              <th className="text-left py-3 px-4">
                <span className="text-sm font-medium text-muted-foreground">Actions</span>
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
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                        <Icon name="User" size={12} className="text-primary" />
                      </div>
                      <span className="text-sm text-foreground">{log?.user}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm text-foreground">{log?.action}</span>
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
                      {log?.risk_level?.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-1">
                      <Icon name={statusConfig?.icon} size={16} className={statusConfig?.color} />
                      <span className="text-sm text-foreground capitalize">{log?.status}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-1">
                      <Button variant="ghost" size="sm" iconName="Eye">
                        Details
                      </Button>
                      <Button variant="ghost" size="sm" iconName="ExternalLink">
                        Investigate
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
          Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, sortedLogs?.length)} of {sortedLogs?.length} entries
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            iconName="ChevronLeft"
          >
            Previous
          </Button>
          
          <div className="flex items-center space-x-1">
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
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AuditTable;