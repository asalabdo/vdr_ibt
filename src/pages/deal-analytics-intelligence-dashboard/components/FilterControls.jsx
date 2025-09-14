import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';

const FilterControls = ({ onFiltersChange }) => {
  const { t } = useTranslation('deal-analytics-dashboard');
  const [selectedDealTypes, setSelectedDealTypes] = useState([]);
  const [dateRange, setDateRange] = useState('last30days');
  const [userRoles, setUserRoles] = useState([]);
  const [comparisonMode, setComparisonMode] = useState(false);

  const dealTypeOptions = [
    { value: 'ma', label: t('filters.options.deal_types.ma') },
    { value: 'ipo', label: t('filters.options.deal_types.ipo') },
    { value: 'fundraising', label: t('filters.options.deal_types.fundraising') },
    { value: 'divestiture', label: t('filters.options.deal_types.divestiture') },
    { value: 'joint_venture', label: t('filters.options.deal_types.joint_venture') },
    { value: 'restructuring', label: t('filters.options.deal_types.restructuring') }
  ];

  const dateRangeOptions = [
    { value: 'last7days', label: t('filters.options.date_ranges.last7days') },
    { value: 'last30days', label: t('filters.options.date_ranges.last30days') },
    { value: 'last90days', label: t('filters.options.date_ranges.last90days') },
    { value: 'ytd', label: t('filters.options.date_ranges.ytd') },
    { value: 'custom', label: t('filters.options.date_ranges.custom') }
  ];

  const userRoleOptions = [
    { value: 'buyer', label: t('filters.options.user_roles.buyer') },
    { value: 'seller', label: t('filters.options.user_roles.seller') },
    { value: 'advisor', label: t('filters.options.user_roles.advisor') },
    { value: 'legal', label: t('filters.options.user_roles.legal') },
    { value: 'finance', label: t('filters.options.user_roles.finance') },
    { value: 'admin', label: t('filters.options.user_roles.admin') }
  ];

  const handleFilterChange = (type, value) => {
    const newFilters = {
      dealTypes: type === 'dealTypes' ? value : selectedDealTypes,
      dateRange: type === 'dateRange' ? value : dateRange,
      userRoles: type === 'userRoles' ? value : userRoles,
      comparisonMode: type === 'comparisonMode' ? value : comparisonMode
    };

    if (type === 'dealTypes') setSelectedDealTypes(value);
    if (type === 'dateRange') setDateRange(value);
    if (type === 'userRoles') setUserRoles(value);
    if (type === 'comparisonMode') setComparisonMode(value);

    onFiltersChange(newFilters);
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="min-w-0 flex-1">
            <Select
              label={t('filters.deal_types')}
              options={dealTypeOptions}
              value={selectedDealTypes}
              onChange={(value) => handleFilterChange('dealTypes', value)}
              multiple
              searchable
              placeholder={t('filters.placeholders.select_deal_types')}
              className="w-full"
            />
          </div>

          <div className="min-w-0 flex-1">
            <Select
              label={t('filters.date_range')}
              options={dateRangeOptions}
              value={dateRange}
              onChange={(value) => handleFilterChange('dateRange', value)}
              placeholder={t('filters.placeholders.select_date_range')}
              className="w-full"
            />
          </div>

          <div className="min-w-0 flex-1">
            <Select
              label={t('filters.user_roles')}
              options={userRoleOptions}
              value={userRoles}
              onChange={(value) => handleFilterChange('userRoles', value)}
              multiple
              searchable
              placeholder={t('filters.placeholders.select_user_roles')}
              className="w-full"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <label className="text-sm font-medium text-foreground">{t('filters.comparison_mode')}</label>
            <button
              onClick={() => handleFilterChange('comparisonMode', !comparisonMode)}
              className={`
                relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                ${comparisonMode ? 'bg-primary' : 'bg-muted'}
              `}
            >
              <span
                className={`
                  inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                  ${comparisonMode ? 'translate-x-6 rtl:-translate-x-6' : 'translate-x-1 rtl:-translate-x-1'}
                `}
              />
            </button>
          </div>

          <Button
            variant="outline"
            iconName="Download"
            iconPosition="left"
            onClick={() => {/* Export functionality */}}
          >
            {t('actions.export')}
          </Button>

          <Button
            variant="ghost"
            iconName="RotateCcw"
            iconPosition="left"
            onClick={() => {
              setSelectedDealTypes([]);
              setDateRange('last30days');
              setUserRoles([]);
              setComparisonMode(false);
              handleFilterChange('reset', {});
            }}
          >
            {t('actions.reset')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FilterControls;
