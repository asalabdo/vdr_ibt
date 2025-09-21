import React from 'react';
import { useTranslation } from 'react-i18next';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const CompliancePeriodSelector = ({ 
  selectedPeriod, 
  onPeriodChange, 
  selectedFramework, 
  onFrameworkChange, 
  securityLevel, 
  onSecurityLevelChange 
}) => {
  const { t } = useTranslation('compliance-security-dashboard');

  const periodOptions = [
    { value: 'last_7_days', label: t('period_selector.periods.last_7_days') },
    { value: 'last_30_days', label: t('period_selector.periods.last_30_days') },
    { value: 'last_90_days', label: t('period_selector.periods.last_90_days') },
    { value: 'last_6_months', label: t('period_selector.periods.last_6_months') },
    { value: 'last_year', label: t('period_selector.periods.last_year') },
    { value: 'custom', label: t('period_selector.periods.custom') }
  ];

  const frameworkOptions = [
    { value: 'all', label: t('period_selector.frameworks.all') },
    { value: 'sox', label: t('period_selector.frameworks.sox') },
    { value: 'gdpr', label: t('period_selector.frameworks.gdpr') },
    { value: 'sec', label: t('period_selector.frameworks.sec') },
    { value: 'iso27001', label: t('period_selector.frameworks.iso27001') },
    { value: 'hipaa', label: t('period_selector.frameworks.hipaa') }
  ];

  const securityLevelOptions = [
    { value: 'all', label: t('period_selector.security_levels.all') },
    { value: 'critical', label: t('period_selector.security_levels.critical') },
    { value: 'high', label: t('period_selector.security_levels.high') },
    { value: 'medium', label: t('period_selector.security_levels.medium') },
    { value: 'low', label: t('period_selector.security_levels.low') }
  ];

  return (
    <div className="flex flex-wrap items-center gap-4">
      <Select
        options={periodOptions}
        value={selectedPeriod}
        onChange={onPeriodChange}
        placeholder={t('period_selector.placeholders.select_period')}
        className="min-w-40"
      />
      
      <Select
        options={frameworkOptions}
        value={selectedFramework}
        onChange={onFrameworkChange}
        placeholder={t('period_selector.placeholders.regulatory_framework')}
        className="min-w-48"
      />
      
      <Select
        options={securityLevelOptions}
        value={securityLevel}
        onChange={onSecurityLevelChange}
        placeholder={t('period_selector.placeholders.security_level')}
        className="min-w-40"
      />
    </div>
  );
};

export default CompliancePeriodSelector;