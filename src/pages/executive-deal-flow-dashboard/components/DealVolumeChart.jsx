import React from 'react';
import { useTranslation } from 'react-i18next';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const DealVolumeChart = ({ data, onDrillDown }) => {
  const { t } = useTranslation('executive-dashboard');

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload?.length) {
      return (
        <div className="bg-popover border border-border rounded-lg p-3 shadow-md">
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
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{t('charts.deal_volume_title', 'Deal Volume & Average Size')}</CardTitle>
            <CardDescription>{t('charts.deal_volume_subtitle', 'Monthly transaction analytics with trend analysis')}</CardDescription>
          </div>
          <Button 
            variant="link" 
            size="sm"
            onClick={onDrillDown}
          >
            {t('actions.view_quarterly', 'View Quarterly')} {t('symbols.arrow', '→')}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
      
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="month" 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <YAxis 
              yAxisId="left"
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <YAxis 
              yAxisId="right" 
              orientation="right"
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar 
              yAxisId="left"
              dataKey="dealVolume" 
              fill="hsl(var(--chart-1))"
              name={t('charts.deal_volume', 'Deal Volume')}
              radius={[2, 2, 0, 0]}
            />
            <Line 
              yAxisId="right"
              type="monotone" 
              dataKey="avgDealSize" 
              stroke="hsl(var(--chart-2))"
              strokeWidth={3}
              name={t('charts.avg_deal_size', 'Avg Deal Size ($M)')}
              dot={{ fill: 'hsl(var(--chart-2))', strokeWidth: 2, r: 4 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      </CardContent>
    </Card>
  );
};

export default DealVolumeChart;
