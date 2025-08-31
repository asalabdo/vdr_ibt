import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Select from '../../../components/ui/Select';

const GlobalControls = ({ onFiltersChange }) => {
  const [selectedDateRange, setSelectedDateRange] = useState('Q4 2024');
  const [selectedStage, setSelectedStage] = useState('all');
  const [selectedRegion, setSelectedRegion] = useState('global');

  const dateRangeOptions = [
    { value: 'Q4 2024', label: 'Q4 2024 (Current)' },
    { value: 'Q3 2024', label: 'Q3 2024' },
    { value: 'Q2 2024', label: 'Q2 2024' },
    { value: 'Q1 2024', label: 'Q1 2024' },
    { value: 'FY 2024', label: 'Full Year 2024' },
    { value: 'custom', label: 'Custom Range' }
  ];

  const stageOptions = [
    { value: 'all', label: 'All Stages' },
    { value: 'prospecting', label: 'Prospecting' },
    { value: 'qualification', label: 'Qualification' },
    { value: 'proposal', label: 'Proposal' },
    { value: 'negotiation', label: 'Negotiation' },
    { value: 'closing', label: 'Closing' }
  ];

  const regionOptions = [
    { value: 'global', label: 'Global' },
    { value: 'north-america', label: 'North America' },
    { value: 'europe', label: 'Europe' },
    { value: 'asia-pacific', label: 'Asia Pacific' },
    { value: 'latin-america', label: 'Latin America' }
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
    <div className="bg-card border border-border rounded-lg p-6 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Icon name="Calendar" size={20} className="text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Executive Dashboard</h2>
          </div>
          <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 bg-success/10 text-success rounded-full">
            <div className="w-2 h-2 bg-success rounded-full animate-pulse-subtle" />
            <span className="text-xs font-medium">Live Data</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
            <Select
              options={dateRangeOptions}
              value={selectedDateRange}
              onChange={(value) => handleFilterChange('dateRange', value)}
              placeholder="Select period"
              className="w-full sm:w-40"
            />

            <Select
              options={stageOptions}
              value={selectedStage}
              onChange={(value) => handleFilterChange('stage', value)}
              placeholder="All stages"
              className="w-full sm:w-36"
            />

            <Select
              options={regionOptions}
              value={selectedRegion}
              onChange={(value) => handleFilterChange('region', value)}
              placeholder="Global"
              className="w-full sm:w-36"
            />
          </div>

          <div className="flex items-center space-x-2">
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
          <div className="flex items-center space-x-2">
            <Icon name="Clock" size={14} />
            <span>Last updated: 2 minutes ago</span>
          </div>
          <div className="flex items-center space-x-2">
            <Icon name="Database" size={14} />
            <span>Data source: VDR Core Analytics</span>
          </div>
          <div className="flex items-center space-x-2">
            <Icon name="Users" size={14} />
            <span>Active sessions: 1,247</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlobalControls;