import React, { useState } from 'react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const SecurityTimeline = () => {
  const [timelineView, setTimelineView] = useState('access_patterns');
  const [zoomLevel, setZoomLevel] = useState('day');

  const timelineData = [
    { time: '00:00', access_events: 12, permission_changes: 2, security_alerts: 0, anomalies: 1 },
    { time: '04:00', access_events: 8, permission_changes: 1, security_alerts: 1, anomalies: 0 },
    { time: '08:00', access_events: 45, permission_changes: 5, security_alerts: 0, anomalies: 2 },
    { time: '12:00', access_events: 67, permission_changes: 8, security_alerts: 2, anomalies: 1 },
    { time: '16:00', access_events: 52, permission_changes: 3, security_alerts: 1, anomalies: 3 },
    { time: '20:00', access_events: 28, permission_changes: 2, security_alerts: 0, anomalies: 0 }
  ];

  const viewOptions = [
    { key: 'access_patterns', label: 'Access Patterns', icon: 'Users', color: '#0ea5e9' },
    { key: 'permission_changes', label: 'Permission Changes', icon: 'Shield', color: '#d97706' },
    { key: 'security_alerts', label: 'Security Alerts', icon: 'AlertTriangle', color: '#dc2626' },
    { key: 'anomalies', label: 'Anomalies', icon: 'Zap', color: '#7c3aed' }
  ];

  const zoomOptions = [
    { key: 'hour', label: 'Hourly' },
    { key: 'day', label: 'Daily' },
    { key: 'week', label: 'Weekly' }
  ];

  const currentView = viewOptions?.find(option => option?.key === timelineView);

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-1">Security Timeline</h3>
          <p className="text-sm text-muted-foreground">Real-time security events and access patterns</p>
        </div>
        
        <div className="flex items-center space-x-2">
          {zoomOptions?.map((option) => (
            <Button
              key={option?.key}
              variant={zoomLevel === option?.key ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setZoomLevel(option?.key)}
            >
              {option?.label}
            </Button>
          ))}
        </div>
      </div>
      <div className="flex flex-wrap gap-2 mb-6">
        {viewOptions?.map((option) => (
          <button
            key={option?.key}
            onClick={() => setTimelineView(option?.key)}
            className={`
              flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium
              transition-all duration-200 border
              ${timelineView === option?.key
                ? 'bg-primary/10 text-primary border-primary/20' :'bg-muted/30 text-muted-foreground border-border hover:bg-muted/50'
              }
            `}
          >
            <Icon name={option?.icon} size={16} />
            <span>{option?.label}</span>
          </button>
        ))}
      </div>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={timelineData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis 
              dataKey="time" 
              stroke="var(--color-muted-foreground)"
              fontSize={12}
            />
            <YAxis 
              stroke="var(--color-muted-foreground)"
              fontSize={12}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--color-popover)',
                border: '1px solid var(--color-border)',
                borderRadius: '8px',
                color: 'var(--color-popover-foreground)'
              }}
            />
            <Area
              type="monotone"
              dataKey={timelineView}
              stroke={currentView?.color}
              fill={currentView?.color}
              fillOpacity={0.2}
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-success"></div>
            <span>Normal Activity</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-warning"></div>
            <span>Elevated Activity</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-error"></div>
            <span>Critical Events</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" iconName="Download">
            Export Data
          </Button>
          <Button variant="ghost" size="sm" iconName="RefreshCw">
            Refresh
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SecurityTimeline;