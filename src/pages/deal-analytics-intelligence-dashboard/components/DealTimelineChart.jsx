import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import Icon from '../../../components/AppIcon';

const DealTimelineChart = () => {
  const { t } = useTranslation('deal-analytics-dashboard');
  const { t: tCommon } = useTranslation('common');
  const [selectedTimeframe, setSelectedTimeframe] = useState('6months');
  const [selectedMetric, setSelectedMetric] = useState('velocity');

  const timelineData = [
    {
      month: `${tCommon('time.months.mar')} 2024`,
      velocity: 45,
      volume: 12,
      success_rate: 85,
      avg_size: 2.4,
      deals: [
        { name: t('sample_data.deals.techcorp_acquisition'), status: tCommon('status_values.completed'), duration: 42 },
        { name: t('sample_data.deals.finserv_merger'), status: tCommon('status_values.active'), duration: 38 }
      ]
    },
    {
      month: `${tCommon('time.months.apr')} 2024`,
      velocity: 38,
      volume: 15,
      success_rate: 92,
      avg_size: 3.1,
      deals: [
        { name: t('sample_data.deals.healthcare_ipo'), status: tCommon('status_values.completed'), duration: 35 },
        { name: t('sample_data.deals.energy_divestiture'), status: tCommon('status_values.completed'), duration: 41 }
      ]
    },
    {
      month: `${tCommon('time.months.may')} 2024`,
      velocity: 52,
      volume: 9,
      success_rate: 78,
      avg_size: 1.8,
      deals: [
        { name: t('sample_data.deals.retail_chain_sale'), status: tCommon('status_values.active'), duration: 48 },
        { name: t('sample_data.deals.tech_startup_round'), status: tCommon('status_values.completed'), duration: 29 }
      ]
    },
    {
      month: `${tCommon('time.months.jun')} 2024`,
      velocity: 41,
      volume: 18,
      success_rate: 88,
      avg_size: 4.2,
      deals: [
        { name: t('sample_data.deals.manufacturing_jv'), status: tCommon('status_values.completed'), duration: 39 },
        { name: t('sample_data.deals.pharma_licensing'), status: tCommon('status_values.active'), duration: 44 }
      ]
    },
    {
      month: `${tCommon('time.months.jul')} 2024`,
      velocity: 47,
      volume: 14,
      success_rate: 91,
      avg_size: 2.9,
      deals: [
        { name: t('sample_data.deals.logistics_acquisition'), status: tCommon('status_values.completed'), duration: 43 },
        { name: t('sample_data.deals.saas_company_sale'), status: tCommon('status_values.active'), duration: 51 }
      ]
    },
    {
      month: `${tCommon('time.months.aug')} 2024`,
      velocity: 42,
      volume: 16,
      success_rate: 87,
      avg_size: 3.6,
      deals: [
        { name: t('sample_data.deals.real_estate_reit'), status: tCommon('status_values.active'), duration: 40 },
        { name: t('sample_data.deals.biotech_merger'), status: tCommon('status_values.completed'), duration: 44 }
      ]
    }
  ];

  const metricOptions = [
    { value: 'velocity', label: t('charts.timeline.metrics.velocity'), color: '#1e40af' },
    { value: 'volume', label: t('charts.timeline.metrics.volume'), color: '#059669' },
    { value: 'success_rate', label: t('charts.timeline.metrics.success_rate'), color: '#0ea5e9' },
    { value: 'avg_size', label: t('charts.timeline.metrics.avg_size'), color: '#d97706' }
  ];

  const timeframeOptions = [
    { value: '3months', label: t('charts.timeline.timeframes.3months') },
    { value: '6months', label: t('charts.timeline.timeframes.6months') },
    { value: '12months', label: t('charts.timeline.timeframes.12months') },
    { value: 'ytd', label: t('charts.timeline.timeframes.ytd') }
  ];

  const currentMetric = metricOptions?.find(m => m?.value === selectedMetric);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload?.length) {
      const data = payload?.[0]?.payload;
      return (
        <div className="bg-popover border border-border rounded-lg p-4 shadow-elevation-2">
          <p className="font-medium text-popover-foreground mb-2">{label}</p>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{currentMetric?.label}:</span>
              <span className="font-medium text-popover-foreground">
                {payload?.[0]?.value}
                {selectedMetric === 'success_rate' ? tCommon('units.percent') : 
                 selectedMetric === 'avg_size' ? tCommon('units.million') : 
                 selectedMetric === 'velocity' ? ` ${tCommon('units.days')}` : ''}
              </span>
            </div>
            <div className="border-t border-border pt-4">
              <p className="text-xs text-muted-foreground mb-1">{t('charts.timeline.active_deals')}:</p>
              {data?.deals?.map((deal, index) => (
                <div key={index} className="flex items-center justify-between text-xs">
                  <span className="text-popover-foreground">{deal?.name}</span>
                  <span className={`px-2 py-1 rounded-full ${
                    deal?.status === 'completed' ? 'bg-success/20 text-success' : 'bg-warning/20 text-warning'
                  }`}>
                    {deal?.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const getBarColor = (value, index) => {
    const baseColor = currentMetric?.color;
    const opacity = 0.7 + (value / Math.max(...timelineData?.map(d => d?.[selectedMetric]))) * 0.3;
    return baseColor + Math.floor(opacity * 255)?.toString(16)?.padStart(2, '0');
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-1">{t('charts.timeline.title')}</h3>
          <p className="text-sm text-muted-foreground">{t('charts.timeline.subtitle')}</p>
        </div>
        
        <div className="flex items-center space-x-3 rtl:space-x-reverse mt-4 sm:mt-0">
          <select
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e?.target?.value)}
            className="px-3 py-2 bg-input border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {metricOptions?.map(option => (
              <option key={option?.value} value={option?.value}>{option?.label}</option>
            ))}
          </select>
          
          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e?.target?.value)}
            className="px-3 py-2 bg-input border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {timeframeOptions?.map(option => (
              <option key={option?.value} value={option?.value}>{option?.label}</option>
            ))}
          </select>

          <button className="p-2 hover:bg-muted rounded-lg transition-colors">
            <Icon name="Download" size={16} className="text-muted-foreground" />
          </button>
        </div>
      </div>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={timelineData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis 
              dataKey="month" 
              stroke="var(--color-muted-foreground)"
              fontSize={12}
              tickLine={false}
            />
            <YAxis 
              stroke="var(--color-muted-foreground)"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey={selectedMetric} 
              radius={[4, 4, 0, 0]}
              fill={currentMetric?.color}
            >
              {timelineData?.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(entry?.[selectedMetric], index)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-border">
        {metricOptions?.map(metric => {
          const avgValue = timelineData?.reduce((sum, item) => sum + item?.[metric?.value], 0) / timelineData?.length;
          return (
            <div key={metric?.value} className="text-center">
              <div className="text-sm text-muted-foreground mb-1">{metric?.label}</div>
              <div className="text-lg font-semibold text-foreground" style={{ color: metric?.color }}>
                {avgValue?.toFixed(1)}
                {metric?.value === 'success_rate' ? tCommon('units.percent') : 
                 metric?.value === 'avg_size' ? tCommon('units.million') : 
                 metric?.value === 'velocity' ? ` ${tCommon('units.days')}` : ''}
              </div>
              <div className="text-xs text-muted-foreground">{t('charts.timeline.average')}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DealTimelineChart;