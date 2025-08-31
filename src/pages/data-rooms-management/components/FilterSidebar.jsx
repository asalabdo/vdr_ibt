import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const FilterSidebar = ({ isOpen, onClose, filters, onFilterChange }) => {
  const handleFilterChange = (filterType, value) => {
    onFilterChange({
      ...filters,
      [filterType]: value
    });
  };

  const clearAllFilters = () => {
    onFilterChange({
      status: 'all',
      dealType: 'all',
      activity: 'all',
      dateRange: 'all'
    });
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />
      {/* Sidebar */}
      <div className="fixed right-0 top-0 h-full w-80 bg-card border-l border-border z-50 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h3 className="text-lg font-semibold text-foreground">Filters</h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
          >
            <Icon name="X" size={20} />
          </Button>
        </div>
        
        {/* Filter Content */}
        <div className="p-6 space-y-6">
          {/* Status Filter */}
          <div>
            <h4 className="text-sm font-medium text-foreground mb-3">Status</h4>
            <div className="space-y-2">
              {[
                { value: 'all', label: 'All Status', count: 4 },
                { value: 'active', label: 'Active', count: 3 },
                { value: 'archived', label: 'Archived', count: 1 },
                { value: 'pending', label: 'Pending', count: 0 }
              ]?.map((option) => (
                <button
                  key={option?.value}
                  onClick={() => handleFilterChange('status', option?.value)}
                  className={`w-full flex items-center justify-between p-2 rounded-lg text-sm transition-colors ${
                    filters?.status === option?.value
                      ? 'bg-primary/10 text-primary border border-primary/20' :'hover:bg-muted/50 text-muted-foreground'
                  }`}
                >
                  <span>{option?.label}</span>
                  <span className="text-xs bg-muted px-2 py-1 rounded-full">
                    {option?.count}
                  </span>
                </button>
              ))}
            </div>
          </div>
          
          {/* Deal Type Filter */}
          <div>
            <h4 className="text-sm font-medium text-foreground mb-3">Deal Type</h4>
            <div className="space-y-2">
              {[
                { value: 'all', label: 'All Types', count: 4 },
                { value: 'M&A', label: 'M&A', count: 1 },
                { value: 'Due Diligence', label: 'Due Diligence', count: 2 },
                { value: 'Legal Review', label: 'Legal Review', count: 1 }
              ]?.map((option) => (
                <button
                  key={option?.value}
                  onClick={() => handleFilterChange('dealType', option?.value)}
                  className={`w-full flex items-center justify-between p-2 rounded-lg text-sm transition-colors ${
                    filters?.dealType === option?.value
                      ? 'bg-primary/10 text-primary border border-primary/20' :'hover:bg-muted/50 text-muted-foreground'
                  }`}
                >
                  <span>{option?.label}</span>
                  <span className="text-xs bg-muted px-2 py-1 rounded-full">
                    {option?.count}
                  </span>
                </button>
              ))}
            </div>
          </div>
          
          {/* Activity Filter */}
          <div>
            <h4 className="text-sm font-medium text-foreground mb-3">Activity Level</h4>
            <div className="space-y-2">
              {[
                { value: 'all', label: 'All Activity', count: 4 },
                { value: 'high', label: 'High Activity', count: 2 },
                { value: 'medium', label: 'Medium Activity', count: 1 },
                { value: 'low', label: 'Low Activity', count: 1 }
              ]?.map((option) => (
                <button
                  key={option?.value}
                  onClick={() => handleFilterChange('activity', option?.value)}
                  className={`w-full flex items-center justify-between p-2 rounded-lg text-sm transition-colors ${
                    filters?.activity === option?.value
                      ? 'bg-primary/10 text-primary border border-primary/20' :'hover:bg-muted/50 text-muted-foreground'
                  }`}
                >
                  <span>{option?.label}</span>
                  <span className="text-xs bg-muted px-2 py-1 rounded-full">
                    {option?.count}
                  </span>
                </button>
              ))}
            </div>
          </div>
          
          {/* Date Range Filter */}
          <div>
            <h4 className="text-sm font-medium text-foreground mb-3">Date Range</h4>
            <div className="space-y-2">
              {[
                { value: 'all', label: 'All Time' },
                { value: 'today', label: 'Today' },
                { value: 'week', label: 'This Week' },
                { value: 'month', label: 'This Month' },
                { value: 'quarter', label: 'This Quarter' }
              ]?.map((option) => (
                <button
                  key={option?.value}
                  onClick={() => handleFilterChange('dateRange', option?.value)}
                  className={`w-full flex items-center justify-between p-2 rounded-lg text-sm transition-colors ${
                    filters?.dateRange === option?.value
                      ? 'bg-primary/10 text-primary border border-primary/20' :'hover:bg-muted/50 text-muted-foreground'
                  }`}
                >
                  <span>{option?.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="p-6 border-t border-border">
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              onClick={clearAllFilters}
              className="flex-1"
            >
              Clear All
            </Button>
            <Button
              variant="default"
              onClick={onClose}
              className="flex-1"
            >
              Apply
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default FilterSidebar;