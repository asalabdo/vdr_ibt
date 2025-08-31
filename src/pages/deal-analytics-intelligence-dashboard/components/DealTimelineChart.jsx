import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import Icon from '../../../components/AppIcon';

const DealTimelineChart = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('6months');
  const [selectedMetric, setSelectedMetric] = useState('velocity');

  const timelineData = [
    {
      month: 'Mar 2024',
      velocity: 45,
      volume: 12,
      success_rate: 85,
      avg_size: 2.4,
      deals: [
        { name: 'TechCorp Acquisition', status: 'completed', duration: 42 },
        { name: 'FinServ Merger', status: 'active', duration: 38 }
      ]
    },
    {
      month: 'Apr 2024',
      velocity: 38,
      volume: 15,
      success_rate: 92,
      avg_size: 3.1,
      deals: [
        { name: 'Healthcare IPO', status: 'completed', duration: 35 },
        { name: 'Energy Divestiture', status: 'completed', duration: 41 }
      ]
    },
    {
      month: 'May 2024',
      velocity: 52,
      volume: 9,
      success_rate: 78,
      avg_size: 1.8,
      deals: [
        { name: 'Retail Chain Sale', status: 'active', duration: 48 },
        { name: 'Tech Startup Round', status: 'completed', duration: 29 }
      ]
    },
    {
      month: 'Jun 2024',
      velocity: 41,
      volume: 18,
      success_rate: 88,
      avg_size: 4.2,
      deals: [
        { name: 'Manufacturing JV', status: 'completed', duration: 39 },
        { name: 'Pharma Licensing', status: 'active', duration: 44 }
      ]
    },
    {
      month: 'Jul 2024',
      velocity: 47,
      volume: 14,
      success_rate: 91,
      avg_size: 2.9,
      deals: [
        { name: 'Logistics Acquisition', status: 'completed', duration: 43 },
        { name: 'SaaS Company Sale', status: 'active', duration: 51 }
      ]
    },
    {
      month: 'Aug 2024',
      velocity: 42,
      volume: 16,
      success_rate: 87,
      avg_size: 3.6,
      deals: [
        { name: 'Real Estate REIT', status: 'active', duration: 40 },
        { name: 'Biotech Merger', status: 'completed', duration: 44 }
      ]
    }
  ];

  const metricOptions = [
    { value: 'velocity', label: 'Deal Velocity (Days)', color: '#1e40af' },
    { value: 'volume', label: 'Deal Volume', color: '#059669' },
    { value: 'success_rate', label: 'Success Rate (%)', color: '#0ea5e9' },
    { value: 'avg_size', label: 'Avg Size ($M)', color: '#d97706' }
  ];

  const timeframeOptions = [
    { value: '3months', label: '3 Months' },
    { value: '6months', label: '6 Months' },
    { value: '12months', label: '12 Months' },
    { value: 'ytd', label: 'Year to Date' }
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
                {selectedMetric === 'success_rate' ? '%' : selectedMetric === 'avg_size' ? 'M' : selectedMetric === 'velocity' ? ' days' : ''}
              </span>
            </div>
            <div className="border-t border-border pt-4">
              <p className="text-xs text-muted-foreground mb-1">Active Deals:</p>
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
          <h3 className="text-lg font-semibold text-foreground mb-1">Deal Timeline Analysis</h3>
          <p className="text-sm text-muted-foreground">Track deal progression and performance metrics over time</p>
        </div>
        
        <div className="flex items-center space-x-3 mt-4 sm:mt-0">
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
                {metric?.value === 'success_rate' ? '%' : metric?.value === 'avg_size' ? 'M' : metric?.value === 'velocity' ? ' days' : ''}
              </div>
              <div className="text-xs text-muted-foreground">Average</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DealTimelineChart;