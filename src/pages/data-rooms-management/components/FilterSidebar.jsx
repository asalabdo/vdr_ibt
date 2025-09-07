import React from 'react';
import { useTranslation } from 'react-i18next';
import Icon from '../../../components/AppIcon';
import { Button } from '@/components/ui/Button';

const FilterSidebar = ({ isOpen, onClose, filters, onFilterChange }) => {
  const { t } = useTranslation('data-rooms-management');
  
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
      <div className="fixed right-0 rtl:left-0 rtl:right-auto top-0 h-full w-80 bg-card border-l rtl:border-r rtl:border-l-0 border-border z-50 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h3 className="text-lg font-semibold text-foreground">
            {t('filters.title')}
          </h3>
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
            <h4 className="text-sm font-medium text-foreground mb-3">
              {t('filters.status.title')}
            </h4>
            <div className="space-y-2">
              {[
                { value: 'all', label: t('filters.status.all'), count: 4 },
                { value: 'active', label: t('filters.status.active'), count: 3 },
                { value: 'archived', label: t('filters.status.archived'), count: 1 },
                { value: 'pending', label: t('filters.status.pending'), count: 0 }
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
            <h4 className="text-sm font-medium text-foreground mb-3">
              {t('filters.deal_type.title')}
            </h4>
            <div className="space-y-2">
              {[
                { value: 'all', label: t('filters.deal_type.all'), count: 4 },
                { value: 'ma', label: t('filters.deal_type.ma'), count: 1 },
                { value: 'due_diligence', label: t('filters.deal_type.due_diligence'), count: 2 },
                { value: 'legal_review', label: t('filters.deal_type.legal_review'), count: 1 }
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
            <h4 className="text-sm font-medium text-foreground mb-3">
              {t('filters.activity.title')}
            </h4>
            <div className="space-y-2">
              {[
                { value: 'all', label: t('filters.activity.all'), count: 4 },
                { value: 'high', label: t('filters.activity.high'), count: 2 },
                { value: 'medium', label: t('filters.activity.medium'), count: 1 },
                { value: 'low', label: t('filters.activity.low'), count: 1 }
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
            <h4 className="text-sm font-medium text-foreground mb-3">
              {t('filters.date_range.title')}
            </h4>
            <div className="space-y-2">
              {[
                { value: 'all', label: t('filters.date_range.all') },
                { value: 'today', label: t('filters.date_range.today') },
                { value: 'week', label: t('filters.date_range.week') },
                { value: 'month', label: t('filters.date_range.month') },
                { value: 'quarter', label: t('filters.date_range.quarter') }
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
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <Button
              variant="outline"
              onClick={clearAllFilters}
              className="flex-1"
            >
              {t('actions.clear_all')}
            </Button>
            <Button
              variant="default"
              onClick={onClose}
              className="flex-1"
            >
              {t('actions.apply')}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default FilterSidebar;
