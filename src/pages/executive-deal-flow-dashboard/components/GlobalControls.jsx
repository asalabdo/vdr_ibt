import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Icon from '../../../components/AppIcon';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';

const GlobalControls = ({ onFiltersChange }) => {
  const { t } = useTranslation('executive-dashboard');
  const { t: tCommon } = useTranslation('common');
  const [selectedDateRange, setSelectedDateRange] = useState('Q4 2024');
  const [selectedStage, setSelectedStage] = useState('all');
  const [selectedRegion, setSelectedRegion] = useState('global');

  const dateRangeOptions = [
    { value: 'Q4 2024', label: t('filters.date_ranges.q4_2024_current', 'Q4 2024 (Current)') },
    { value: 'Q3 2024', label: t('filters.date_ranges.q3_2024', 'Q3 2024') },
    { value: 'Q2 2024', label: t('filters.date_ranges.q2_2024', 'Q2 2024') },
    { value: 'Q1 2024', label: t('filters.date_ranges.q1_2024', 'Q1 2024') },
    { value: 'FY 2024', label: t('filters.date_ranges.fy_2024', 'Full Year 2024') },
    { value: 'custom', label: t('filters.date_ranges.custom', 'Custom Range') }
  ];

  const stageOptions = [
    { value: 'all', label: t('filters.stages.all', 'All Stages') },
    { value: 'prospecting', label: t('pipeline.stages.prospecting', 'Prospecting') },
    { value: 'qualification', label: t('pipeline.stages.qualification', 'Qualification') },
    { value: 'proposal', label: t('pipeline.stages.proposal', 'Proposal') },
    { value: 'negotiation', label: t('pipeline.stages.negotiation', 'Negotiation') },
    { value: 'closing', label: t('pipeline.stages.closing', 'Closing') }
  ];

  const regionOptions = [
    { value: 'global', label: t('filters.regions.global', 'Global') },
    { value: 'north-america', label: t('filters.regions.north_america', 'North America') },
    { value: 'europe', label: t('filters.regions.europe', 'Europe') },
    { value: 'asia-pacific', label: t('filters.regions.asia_pacific', 'Asia Pacific') },
    { value: 'latin-america', label: t('filters.regions.latin_america', 'Latin America') }
  ];

  const handleFilterChange = (type, value) => {
    const filters = {
      dateRange: selectedDateRange,
      stage: selectedStage,
      region: selectedRegion,
      [type]: value
    };

    if (type === 'dateRange') setSelectedDateRange(value);
    if (type === 'stage') setSelectedStage(value);
    if (type === 'region') setSelectedRegion(value);

    onFiltersChange?.(filters);
  };

  return (
    <Card className="mb-6">
      <CardContent className="p-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div className="flex items-center space-x-4 rtl:space-x-reverse">
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <Icon name="Calendar" size={20} className="text-primary" />
            <h2 className="text-lg font-semibold text-foreground">{t('title', 'Executive Dashboard')}</h2>
          </div>
          <div className="hidden sm:flex items-center space-x-2 rtl:space-x-reverse px-3 py-1.5 bg-success/10 text-success rounded-full">
            <div className="w-2 h-2 bg-success rounded-full animate-pulse-subtle" />
            <span className="text-xs font-medium">{t('status.live_data', 'Live Data')}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 rtl:space-x-reverse">
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 rtl:space-x-reverse">
            <Select value={selectedDateRange} onValueChange={(value) => handleFilterChange('dateRange', value)}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder={t('filters.placeholders.select_period', 'Select period')} />
              </SelectTrigger>
              <SelectContent>
                {dateRangeOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedStage} onValueChange={(value) => handleFilterChange('stage', value)}>
              <SelectTrigger className="w-full sm:w-36">
                <SelectValue placeholder={t('filters.placeholders.all_stages', 'All stages')} />
              </SelectTrigger>
              <SelectContent>
                {stageOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedRegion} onValueChange={(value) => handleFilterChange('region', value)}>
              <SelectTrigger className="w-full sm:w-36">
                <SelectValue placeholder={t('filters.placeholders.global', 'Global')} />
              </SelectTrigger>
              <SelectContent>
                {regionOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <button className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-colors">
              <Icon name="RefreshCw" size={16} />
            </button>
            <button className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-colors">
              <Icon name="Download" size={16} />
            </button>
            <button className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-colors">
              <Icon name="Settings" size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-border">
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <Icon name="Clock" size={14} />
            <span>{t('status.last_updated', 'Last updated: {{time}}', { time: tCommon('time_ago.minutes_ago', { count: 2 }) })}</span>
          </div>
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <Icon name="Database" size={14} />
            <span>{t('status.data_source', 'Data source: VDR Core Analytics')}</span>
          </div>
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <Icon name="Users" size={14} />
            <span>{t('status.active_sessions', 'Active sessions: {{count}}', { count: '1,247' })}</span>
          </div>
        </div>
      </div>
      </CardContent>
    </Card>
  );
};

export default GlobalControls;
