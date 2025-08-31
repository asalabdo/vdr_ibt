import React, { useState } from 'react';

import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';

const FilterControls = ({ onFiltersChange }) => {
  const [selectedDealTypes, setSelectedDealTypes] = useState([]);
  const [dateRange, setDateRange] = useState('last30days');
  const [userRoles, setUserRoles] = useState([]);
  const [comparisonMode, setComparisonMode] = useState(false);

  const dealTypeOptions = [
    { value: 'ma', label: 'M&A Transactions' },
    { value: 'ipo', label: 'IPO Preparations' },
    { value: 'fundraising', label: 'Fundraising Rounds' },
    { value: 'divestiture', label: 'Divestitures' },
    { value: 'joint_venture', label: 'Joint Ventures' },
    { value: 'restructuring', label: 'Restructuring' }
  ];

  const dateRangeOptions = [
    { value: 'last7days', label: 'Last 7 Days' },
    { value: 'last30days', label: 'Last 30 Days' },
    { value: 'last90days', label: 'Last 90 Days' },
    { value: 'ytd', label: 'Year to Date' },
    { value: 'custom', label: 'Custom Range' }
  ];

  const userRoleOptions = [
    { value: 'buyer', label: 'Buyers' },
    { value: 'seller', label: 'Sellers' },
    { value: 'advisor', label: 'Advisors' },
    { value: 'legal', label: 'Legal Teams' },
    { value: 'finance', label: 'Finance Teams' },
    { value: 'admin', label: 'Administrators' }
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
              label="Deal Types"
              options={dealTypeOptions}
              value={selectedDealTypes}
              onChange={(value) => handleFilterChange('dealTypes', value)}
              multiple
              searchable
              placeholder="Select deal types..."
              className="w-full"
            />
          </div>

          <div className="min-w-0 flex-1">
            <Select
              label="Date Range"
              options={dateRangeOptions}
              value={dateRange}
              onChange={(value) => handleFilterChange('dateRange', value)}
              placeholder="Select date range..."
              className="w-full"
            />
          </div>

          <div className="min-w-0 flex-1">
            <Select
              label="User Roles"
              options={userRoleOptions}
              value={userRoles}
              onChange={(value) => handleFilterChange('userRoles', value)}
              multiple
              searchable
              placeholder="Select user roles..."
              className="w-full"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-foreground">Comparison Mode</label>
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
                  ${comparisonMode ? 'translate-x-6' : 'translate-x-1'}
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
            Export
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
            Reset
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FilterControls;