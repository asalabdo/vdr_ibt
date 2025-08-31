import React from 'react';
import Select from '../../../components/ui/Select';

const CompliancePeriodSelector = ({ selectedPeriod, onPeriodChange, selectedFramework, onFrameworkChange, securityLevel, onSecurityLevelChange }) => {
  const periodOptions = [
    { value: 'last_7_days', label: 'Last 7 Days' },
    { value: 'last_30_days', label: 'Last 30 Days' },
    { value: 'last_90_days', label: 'Last 90 Days' },
    { value: 'last_6_months', label: 'Last 6 Months' },
    { value: 'last_year', label: 'Last Year' },
    { value: 'custom', label: 'Custom Range' }
  ];

  const frameworkOptions = [
    { value: 'all', label: 'All Frameworks' },
    { value: 'sox', label: 'SOX Compliance' },
    { value: 'gdpr', label: 'GDPR' },
    { value: 'sec', label: 'SEC Regulations' },
    { value: 'iso27001', label: 'ISO 27001' },
    { value: 'hipaa', label: 'HIPAA' }
  ];

  const securityLevelOptions = [
    { value: 'all', label: 'All Levels' },
    { value: 'critical', label: 'Critical Only' },
    { value: 'high', label: 'High & Above' },
    { value: 'medium', label: 'Medium & Above' },
    { value: 'low', label: 'All Levels' }
  ];

  return (
    <div className="flex flex-wrap items-center gap-4">
      <Select
        options={periodOptions}
        value={selectedPeriod}
        onChange={onPeriodChange}
        placeholder="Select period"
        className="min-w-40"
      />
      
      <Select
        options={frameworkOptions}
        value={selectedFramework}
        onChange={onFrameworkChange}
        placeholder="Regulatory framework"
        className="min-w-48"
      />
      
      <Select
        options={securityLevelOptions}
        value={securityLevel}
        onChange={onSecurityLevelChange}
        placeholder="Security level"
        className="min-w-40"
      />
    </div>
  );
};

export default CompliancePeriodSelector;