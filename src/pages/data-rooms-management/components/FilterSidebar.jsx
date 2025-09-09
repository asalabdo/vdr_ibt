import React from 'react';
import { useTranslation } from 'react-i18next';
import Icon from '../../../components/AppIcon';
import { Button } from '@/components/ui/Button';

const FilterSidebar = ({ isOpen, onClose, filters, onFilterChange, dataRooms = [] }) => {
  const { t } = useTranslation('data-rooms-management');
  
  const handleFilterChange = (filterType, value) => {
    onFilterChange({
      ...filters,
      [filterType]: value
    });
  };

  // Calculate real counts from data
  const getStatusCounts = () => {
    const total = dataRooms.length;
    const active = dataRooms.filter(room => room?.isActive).length;
    const archived = dataRooms.filter(room => !room?.isActive).length;
    const pending = 0; // This would need additional status logic from your data model
    
    return { total, active, archived, pending };
  };

  const getDealTypeCounts = () => {
    // Since Group Folders don't have deal types, we'll simulate based on naming patterns
    // In a real VDR system, you'd have this data in your room metadata
    const total = dataRooms.length;
    const ma = dataRooms.filter(room => 
      room?.roomName?.toLowerCase().includes('ma') || 
      room?.roomName?.toLowerCase().includes('merger')
    ).length;
    const dueDiligence = dataRooms.filter(room => 
      room?.roomName?.toLowerCase().includes('dd') || 
      room?.roomName?.toLowerCase().includes('diligence')
    ).length;
    const legalReview = dataRooms.filter(room => 
      room?.roomName?.toLowerCase().includes('legal') || 
      room?.roomName?.toLowerCase().includes('contract')
    ).length;
    
    return { total, ma, dueDiligence, legalReview };
  };

  const getActivityCounts = () => {
    // Activity levels based on group count and usage
    const total = dataRooms.length;
    const high = dataRooms.filter(room => room?.groupsCount >= 3).length;
    const medium = dataRooms.filter(room => room?.groupsCount === 2).length;
    const low = dataRooms.filter(room => room?.groupsCount <= 1).length;
    
    return { total, high, medium, low };
  };

  const statusCounts = getStatusCounts();
  const dealTypeCounts = getDealTypeCounts();
  const activityCounts = getActivityCounts();

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
                { value: 'all', label: t('filters.status.all'), count: statusCounts.total },
                { value: 'active', label: t('filters.status.active'), count: statusCounts.active },
                { value: 'archived', label: t('filters.status.archived'), count: statusCounts.archived },
                { value: 'pending', label: t('filters.status.pending'), count: statusCounts.pending }
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
                { value: 'all', label: t('filters.deal_type.all'), count: dealTypeCounts.total },
                { value: 'ma', label: t('filters.deal_type.ma'), count: dealTypeCounts.ma },
                { value: 'due_diligence', label: t('filters.deal_type.due_diligence'), count: dealTypeCounts.dueDiligence },
                { value: 'legal_review', label: t('filters.deal_type.legal_review'), count: dealTypeCounts.legalReview }
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
                { value: 'all', label: t('filters.activity.all'), count: activityCounts.total },
                { value: 'high', label: t('filters.activity.high'), count: activityCounts.high },
                { value: 'medium', label: t('filters.activity.medium'), count: activityCounts.medium },
                { value: 'low', label: t('filters.activity.low'), count: activityCounts.low }
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
