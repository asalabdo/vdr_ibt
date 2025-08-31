import React, { useState } from 'react';
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
  const [searchQuery, setSearchQuery] = useState('');

  const environmentOptions = [
    { value: 'production', label: 'Production' },
    { value: 'staging', label: 'Staging' },
    { value: 'development', label: 'Development' }
  ];

  const refreshOptions = [
    { value: '30', label: '30 seconds' },
    { value: '60', label: '1 minute' },
    { value: '300', label: '5 minutes' }
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
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Icon name="Server" size={16} className="text-muted-foreground" />
            <Select
              options={environmentOptions}
              value={selectedEnvironment}
              onChange={onEnvironmentChange}
              placeholder="Select Environment"
              className="w-40"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Icon name="RefreshCw" size={16} className="text-muted-foreground" />
            <Select
              options={refreshOptions}
              value={refreshInterval}
              onChange={onRefreshIntervalChange}
              placeholder="Refresh Rate"
              className="w-36"
            />
          </div>

          {/* Connection Status */}
          <div className="flex items-center space-x-2 px-3 py-1.5 bg-muted/20 rounded-lg">
            <Icon 
              name={getConnectionStatusIcon()} 
              size={14} 
              className={`${getConnectionStatusColor()} ${connectionStatus === 'connecting' ? 'animate-spin' : ''}`}
            />
            <span className={`text-xs font-medium ${getConnectionStatusColor()}`}>
              {connectionStatus?.charAt(0)?.toUpperCase() + connectionStatus?.slice(1)}
            </span>
          </div>
        </div>

        {/* Center Section - Search */}
        <form onSubmit={handleSearch} className="flex-1 max-w-md">
          <div className="relative">
            <Input
              type="search"
              placeholder="Search across all metrics, users, documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e?.target?.value)}
              className="pr-10"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-muted/50 rounded"
            >
              <Icon name="Search" size={16} className="text-muted-foreground" />
            </button>
          </div>
        </form>

        {/* Right Section - Actions */}
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" iconName="Download">
            Export
          </Button>
          <Button variant="outline" size="sm" iconName="Settings">
            Configure
          </Button>
          <Button variant="default" size="sm" iconName="AlertTriangle">
            Alerts
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ControlBar;