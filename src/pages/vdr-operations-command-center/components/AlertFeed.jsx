import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const AlertFeed = ({ alerts = [] }) => {
  const [filter, setFilter] = useState('all');

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'text-error bg-error/10 border-error/20';
      case 'warning': return 'text-warning bg-warning/10 border-warning/20';
      case 'info': return 'text-accent bg-accent/10 border-accent/20';
      default: return 'text-muted-foreground bg-muted/10 border-border';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'critical': return 'AlertTriangle';
      case 'warning': return 'AlertCircle';
      case 'info': return 'Info';
      default: return 'Bell';
    }
  };

  const formatTime = (timestamp) => {
    const now = new Date();
    const alertTime = new Date(timestamp);
    const diff = Math.floor((now - alertTime) / 1000);
    
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  const filteredAlerts = alerts?.filter(alert => 
    filter === 'all' || alert?.severity === filter
  );

  const severityCounts = alerts?.reduce((acc, alert) => {
    acc[alert.severity] = (acc?.[alert?.severity] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="bg-card border border-border rounded-lg h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-foreground">System Alerts</h3>
          <Button variant="ghost" size="sm" iconName="Settings" />
        </div>
        
        {/* Filter Tabs */}
        <div className="flex space-x-1">
          {[
            { key: 'all', label: 'All', count: alerts?.length },
            { key: 'critical', label: 'Critical', count: severityCounts?.critical || 0 },
            { key: 'warning', label: 'Warning', count: severityCounts?.warning || 0 },
            { key: 'info', label: 'Info', count: severityCounts?.info || 0 }
          ]?.map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`
                px-3 py-1.5 text-xs font-medium rounded-md transition-colors
                ${filter === key 
                  ? 'bg-primary text-primary-foreground' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }
              `}
            >
              {label} ({count})
            </button>
          ))}
        </div>
      </div>
      {/* Alert List */}
      <div className="flex-1 overflow-y-auto">
        {filteredAlerts?.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
            <Icon name="CheckCircle" size={24} className="mb-2" />
            <span className="text-sm">No alerts to display</span>
          </div>
        ) : (
          <div className="space-y-2 p-4">
            {filteredAlerts?.map((alert) => (
              <div
                key={alert?.id}
                className={`
                  p-3 rounded-lg border transition-all duration-200 hover:shadow-sm
                  ${getSeverityColor(alert?.severity)}
                `}
              >
                <div className="flex items-start space-x-3">
                  <Icon 
                    name={getSeverityIcon(alert?.severity)} 
                    size={16} 
                    className="mt-0.5 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium truncate">
                        {alert?.title}
                      </span>
                      <span className="text-xs opacity-60 flex-shrink-0 ml-2">
                        {formatTime(alert?.timestamp)}
                      </span>
                    </div>
                    <p className="text-xs opacity-80 line-clamp-2">
                      {alert?.message}
                    </p>
                    {alert?.source && (
                      <div className="flex items-center mt-2 text-xs opacity-60">
                        <Icon name="Server" size={12} className="mr-1" />
                        <span>{alert?.source}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {alert?.actions && (
                  <div className="flex space-x-2 mt-3">
                    {alert?.actions?.map((action, index) => (
                      <Button
                        key={index}
                        variant="ghost"
                        size="xs"
                        onClick={action?.onClick}
                      >
                        {action?.label}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Footer Actions */}
      <div className="p-4 border-t border-border">
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" fullWidth>
            Mark All Read
          </Button>
          <Button variant="ghost" size="sm" fullWidth>
            View History
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AlertFeed;