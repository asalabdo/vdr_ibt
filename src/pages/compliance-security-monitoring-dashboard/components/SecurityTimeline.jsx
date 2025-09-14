import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import Icon from '../../../components/AppIcon';
import { Button } from '@/components/ui/button';

const SecurityTimeline = () => {
  const { t } = useTranslation('compliance-security-dashboard');
  const { t: tCommon } = useTranslation('common');
  
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
    { key: 'access_patterns', label: t('timeline.views.access_patterns'), icon: 'Users', color: '#0ea5e9' },
    { key: 'permission_changes', label: t('timeline.views.permission_changes'), icon: 'Shield', color: '#d97706' },
    { key: 'security_alerts', label: t('timeline.views.security_alerts'), icon: 'AlertTriangle', color: '#dc2626' },
    { key: 'anomalies', label: t('timeline.views.anomalies'), icon: 'Zap', color: '#7c3aed' }
  ];

  const zoomOptions = [
    { key: 'hour', label: t('timeline.zoom_levels.hour') },
    { key: 'day', label: t('timeline.zoom_levels.day') },
    { key: 'week', label: t('timeline.zoom_levels.week') }
  ];

  const currentView = viewOptions?.find(option => option?.key === timelineView);

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-1">
            {t('timeline.title')}
          </h3>
          <p className="text-sm text-muted-foreground">
            {t('timeline.subtitle')}
          </p>
        </div>
        
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
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
              flex items-center space-x-2 rtl:space-x-reverse px-3 py-2 rounded-lg text-sm font-medium
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
        <div className="flex items-center space-x-4 rtl:space-x-reverse text-sm text-muted-foreground">
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <div className="w-3 h-3 rounded-full bg-success"></div>
            <span>{t('timeline.legend.normal_activity')}</span>
          </div>
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <div className="w-3 h-3 rounded-full bg-warning"></div>
            <span>{t('timeline.legend.elevated_activity')}</span>
          </div>
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <div className="w-3 h-3 rounded-full bg-error"></div>
            <span>{t('timeline.legend.critical_events')}</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <Button variant="ghost" size="sm" iconName="Download">
            {tCommon('actions.export')}
          </Button>
          <Button variant="ghost" size="sm" iconName="RefreshCw">
            {t('actions.refresh')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SecurityTimeline;
