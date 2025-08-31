import React from 'react';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const FilterSidebar = ({ isOpen, onClose, filters, onFilterChange, auditLogs }) => {
  if (!isOpen) return null;

  const handleFilterChange = (key, value) => {
    onFilterChange(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearAllFilters = () => {
    onFilterChange({
      action: 'all',
      user: 'all',
      severity: 'all',
      dateRange: 'today'
    });
  };

  // Extract unique values for filter options
  const uniqueActions = [...new Set(auditLogs?.map(log => log?.action))];
  const uniqueUsers = [...new Set(auditLogs?.map(log => log?.user?.name))];

  return (
    <div className="fixed inset-0 z-50 lg:relative lg:inset-auto">
      {/* Backdrop for mobile */}
      <div 
        className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Sidebar */}
      <div className="fixed right-0 top-0 h-full w-80 bg-card border-l border-border shadow-lg z-10 lg:relative lg:w-full lg:h-auto lg:shadow-none">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h3 className="text-lg font-semibold text-foreground">Filters</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <Icon name="X" size={20} className="text-muted-foreground" />
          </button>
        </div>

        {/* Filters */}
        <div className="p-6 space-y-6">
          {/* Action Filter */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Action Type
            </label>
            <select
              value={filters?.action}
              onChange={(e) => handleFilterChange('action', e?.target?.value)}
              className="w-full border border-input rounded-lg px-3 py-2 bg-background text-foreground focus:ring-2 focus:ring-ring focus:border-transparent"
            >
              <option value="all">All Actions</option>
              {uniqueActions?.map((action) => (
                <option key={action} value={action}>
                  {action?.replace('_', ' ')?.replace(/\b\w/g, l => l?.toUpperCase())}
                </option>
              ))}
            </select>
          </div>

          {/* User Filter */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              User
            </label>
            <select
              value={filters?.user}
              onChange={(e) => handleFilterChange('user', e?.target?.value)}
              className="w-full border border-input rounded-lg px-3 py-2 bg-background text-foreground focus:ring-2 focus:ring-ring focus:border-transparent"
            >
              <option value="all">All Users</option>
              {uniqueUsers?.map((user) => (
                <option key={user} value={user}>{user}</option>
              ))}
            </select>
          </div>

          {/* Severity Filter */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Severity Level
            </label>
            <select
              value={filters?.severity}
              onChange={(e) => handleFilterChange('severity', e?.target?.value)}
              className="w-full border border-input rounded-lg px-3 py-2 bg-background text-foreground focus:ring-2 focus:ring-ring focus:border-transparent"
            >
              <option value="all">All Levels</option>
              <option value="info">Info</option>
              <option value="warning">Warning</option>
              <option value="error">Error</option>
            </select>
          </div>

          {/* Date Range Filter */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Time Range
            </label>
            <select
              value={filters?.dateRange}
              onChange={(e) => handleFilterChange('dateRange', e?.target?.value)}
              className="w-full border border-input rounded-lg px-3 py-2 bg-background text-foreground focus:ring-2 focus:ring-ring focus:border-transparent"
            >
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>

          {/* Clear Filters */}
          <div className="pt-4 border-t border-border">
            <Button
              onClick={clearAllFilters}
              variant="outline"
              className="w-full"
              iconName="X"
            >
              Clear All Filters
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterSidebar;