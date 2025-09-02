import React from 'react';
import { useTranslation } from 'react-i18next';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const DealVolumeChart = ({ data, onDrillDown }) => {
  const { t } = useTranslation('dashboard');

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload?.length) {
      return (
        <div className="bg-popover border border-border rounded-lg p-3 shadow-elevation-2">
          <p className="text-sm font-medium text-popover-foreground mb-2">{label}</p>
          {payload?.map((entry, index) => (
            <div key={index} className="flex items-center space-x-2 text-sm">
              <div 
                className="w-3 h-3 rounded-sm" 
                style={{ backgroundColor: entry?.color }}
              />
              <span className="text-muted-foreground">{entry?.dataKey}:</span>
              <span className="text-popover-foreground font-medium">
                {entry?.dataKey === 'dealVolume' ? entry?.value : `$${entry?.value}M`}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">{t('charts.deal_volume_title', 'Deal Volume & Average Size')}</h3>
          <p className="text-sm text-muted-foreground">{t('charts.deal_volume_subtitle', 'Monthly transaction analytics with trend analysis')}</p>
        </div>
        <button
          onClick={onDrillDown}
          className="text-sm text-primary hover:text-primary/80 transition-colors"
        >
          {t('actions.view_quarterly', 'View Quarterly')} {t('symbols.arrow', '→')}
        </button>
      </div>
      
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis 
              dataKey="month" 
              stroke="var(--color-muted-foreground)"
              fontSize={12}
            />
            <YAxis 
              yAxisId="left"
              stroke="var(--color-muted-foreground)"
              fontSize={12}
            />
            <YAxis 
              yAxisId="right" 
              orientation="right"
              stroke="var(--color-muted-foreground)"
              fontSize={12}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar 
              yAxisId="left"
              dataKey="dealVolume" 
              fill="var(--color-primary)"
              name={t('charts.deal_volume', 'Deal Volume')}
              radius={[2, 2, 0, 0]}
            />
            <Line 
              yAxisId="right"
              type="monotone" 
              dataKey="avgDealSize" 
              stroke="var(--color-accent)"
              strokeWidth={3}
              name={t('charts.avg_deal_size', 'Avg Deal Size ($M)')}
              dot={{ fill: 'var(--color-accent)', strokeWidth: 2, r: 4 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DealVolumeChart;