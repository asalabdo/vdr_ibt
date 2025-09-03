import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import Input from '../../../components/ui/Input';

const ControlBar = ({ 
  selectedEnvironment, 
  onEnvironmentChange, 
  refreshInterval, 
  onRefreshIntervalChange,
  onGlobalSearch,
  connectionStatus 
}) => {
  const { t } = useTranslation('vdr-operations-dashboard');
  const { t: tCommon } = useTranslation('common');
  const [searchQuery, setSearchQuery] = useState('');

  const environmentOptions = [
    { value: 'production', label: t('control_bar.environment.options.production') },
    { value: 'staging', label: t('control_bar.environment.options.staging') },
    { value: 'development', label: t('control_bar.environment.options.development') }
  ];

  const refreshOptions = [
    { value: '30', label: t('control_bar.refresh_interval.options.30_seconds') },
    { value: '60', label: t('control_bar.refresh_interval.options.1_minute') },
    { value: '300', label: t('control_bar.refresh_interval.options.5_minutes') }
  ];

  const handleSearch = (e) => {
    e?.preventDefault();
    onGlobalSearch(searchQuery);
  };

  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'text-success';
      case 'connecting': return 'text-warning';
      case 'disconnected': return 'text-error';
      default: return 'text-muted-foreground';
    }
  };

  const getConnectionStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected': return 'Wifi';
      case 'connecting': return 'Loader';
      case 'disconnected': return 'WifiOff';
      default: return 'Wifi';
    }
  };

  return (
    <div className="bg-card border-b border-border p-4">
      <div className="flex items-center justify-between flex-wrap gap-4">
        {/* Left Section - Environment & Refresh */}
        <div className="flex items-center space-x-4 rtl:space-x-reverse">
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <Icon name="Server" size={16} className="text-muted-foreground" />
            <Select
              options={environmentOptions}
              value={selectedEnvironment}
              onChange={onEnvironmentChange}
              placeholder={t('control_bar.environment.label')}
              className="w-40"
            />
          </div>
          
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <Icon name="RefreshCw" size={16} className="text-muted-foreground" />
            <Select
              options={refreshOptions}
              value={refreshInterval}
              onChange={onRefreshIntervalChange}
              placeholder={t('control_bar.refresh_interval.label')}
              className="w-36"
            />
          </div>

          {/* Connection Status */}
          <div className="flex items-center space-x-2 rtl:space-x-reverse px-3 py-1.5 bg-muted/20 rounded-lg">
            <Icon 
              name={getConnectionStatusIcon()} 
              size={14} 
              className={`${getConnectionStatusColor()} ${connectionStatus === 'connecting' ? 'animate-spin' : ''}`}
            />
            <span className={`text-xs font-medium ${getConnectionStatusColor()}`}>
              {t(`control_bar.connection_status.${connectionStatus}`)}
            </span>
          </div>
        </div>

        {/* Center Section - Search */}
        <form onSubmit={handleSearch} className="flex-1 max-w-md">
          <div className="relative">
            <Input
              type="search"
              placeholder={t('control_bar.search_placeholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e?.target?.value)}
              className="pr-10 rtl:pl-10 rtl:pr-3"
            />
            <button
              type="submit"
              className="absolute right-2 rtl:left-2 rtl:right-auto top-1/2 -translate-y-1/2 p-1 hover:bg-muted/50 rounded"
            >
              <Icon name="Search" size={16} className="text-muted-foreground" />
            </button>
          </div>
        </form>

        {/* Right Section - Actions */}
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <Button variant="outline" size="sm" iconName="Download">
            {t('control_bar.actions.export')}
          </Button>
          <Button variant="outline" size="sm" iconName="Settings">
            {t('control_bar.actions.configure')}
          </Button>
          <Button variant="default" size="sm" iconName="AlertTriangle">
            {t('control_bar.actions.alerts')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ControlBar;