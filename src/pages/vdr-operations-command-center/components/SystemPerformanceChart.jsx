import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const SystemPerformanceChart = () => {
  const [selectedMetric, setSelectedMetric] = useState('response_time');
  const [chartType, setChartType] = useState('line');

  const metrics = [
    { 
      key: 'response_time', 
      label: 'Response Time', 
      unit: 'ms', 
      color: '#0ea5e9',
      icon: 'Zap'
    },
    { 
      key: 'cpu_usage', 
      label: 'CPU Usage', 
      unit: '%', 
      color: '#059669',
      icon: 'Cpu'
    },
    { 
      key: 'memory_usage', 
      label: 'Memory Usage', 
      unit: '%', 
      color: '#d97706',
      icon: 'HardDrive'
    },
    { 
      key: 'network_io', 
      label: 'Network I/O', 
      unit: 'MB/s', 
      color: '#dc2626',
      icon: 'Wifi'
    }
  ];

  // Generate mock performance data
  const generatePerformanceData = () => {
    const now = new Date();
    return Array.from({ length: 60 }, (_, i) => {
      const time = new Date(now.getTime() - (59 - i) * 60000);
      return {
        time: time?.toLocaleTimeString('en-US', { 
          hour12: false, 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        timestamp: time?.getTime(),
        response_time: Math.floor(Math.random() * 200) + 50,
        cpu_usage: Math.floor(Math.random() * 40) + 20,
        memory_usage: Math.floor(Math.random() * 30) + 40,
        network_io: Math.floor(Math.random() * 50) + 10
      };
    });
  };

  const data = generatePerformanceData();
  const currentMetric = metrics?.find(m => m?.key === selectedMetric);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload?.length) {
      return (
        <div className="bg-popover border border-border rounded-lg p-3 shadow-elevation-2">
          <p className="text-sm font-medium text-popover-foreground mb-1">{label}</p>
          <div className="flex items-center space-x-2">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: payload?.[0]?.color }}
            />
            <span className="text-sm text-popover-foreground">
              {currentMetric?.label}: {payload?.[0]?.value}{currentMetric?.unit}
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  const getLatestValue = () => {
    const latest = data?.[data?.length - 1];
    return latest ? latest?.[selectedMetric] : 0;
  };

  const getAverageValue = () => {
    const sum = data?.reduce((acc, item) => acc + item?.[selectedMetric], 0);
    return Math.round(sum / data?.length);
  };

  const getTrendDirection = () => {
    if (data?.length < 2) return 'stable';
    const recent = data?.slice(-10);
    const earlier = data?.slice(-20, -10);
    const recentAvg = recent?.reduce((acc, item) => acc + item?.[selectedMetric], 0) / recent?.length;
    const earlierAvg = earlier?.reduce((acc, item) => acc + item?.[selectedMetric], 0) / earlier?.length;
    
    if (recentAvg > earlierAvg * 1.05) return 'up';
    if (recentAvg < earlierAvg * 0.95) return 'down';
    return 'stable';
  };

  const trend = getTrendDirection();

  return (
    <div className="bg-card border border-border rounded-lg p-4 h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <Icon name="TrendingUp" size={20} className="text-accent" />
          <h3 className="text-lg font-semibold text-foreground">System Performance</h3>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Chart Type Toggle */}
          <div className="flex bg-muted/20 rounded-lg p-1">
            <button
              onClick={() => setChartType('line')}
              className={`
                p-1.5 rounded transition-colors
                ${chartType === 'line' ?'bg-primary text-primary-foreground' :'text-muted-foreground hover:text-foreground'
                }
              `}
            >
              <Icon name="TrendingUp" size={14} />
            </button>
            <button
              onClick={() => setChartType('area')}
              className={`
                p-1.5 rounded transition-colors
                ${chartType === 'area' ?'bg-primary text-primary-foreground' :'text-muted-foreground hover:text-foreground'
                }
              `}
            >
              <Icon name="BarChart3" size={14} />
            </button>
          </div>
          
          <Button variant="ghost" size="sm" iconName="Download" />
        </div>
      </div>
      {/* Metric Selector */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-4">
        {metrics?.map(metric => (
          <button
            key={metric?.key}
            onClick={() => setSelectedMetric(metric?.key)}
            className={`
              flex items-center space-x-2 p-3 rounded-lg text-sm font-medium
              transition-all duration-200 border
              ${selectedMetric === metric?.key
                ? 'border-accent/20 bg-accent/10 text-accent' :'border-border text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }
            `}
          >
            <Icon name={metric?.icon} size={16} />
            <div className="text-left">
              <div className="font-medium">{metric?.label}</div>
              <div className="text-xs opacity-60">
                {selectedMetric === metric?.key ? getLatestValue() : getAverageValue()}{metric?.unit}
              </div>
            </div>
          </button>
        ))}
      </div>
      {/* Performance Stats */}
      <div className="flex items-center justify-between mb-4 p-3 bg-muted/20 rounded-lg">
        <div className="flex items-center space-x-4">
          <div className="text-sm">
            <span className="text-muted-foreground">Current: </span>
            <span className="font-semibold text-foreground">
              {getLatestValue()}{currentMetric?.unit}
            </span>
          </div>
          <div className="text-sm">
            <span className="text-muted-foreground">Average: </span>
            <span className="font-semibold text-foreground">
              {getAverageValue()}{currentMetric?.unit}
            </span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Icon 
            name={trend === 'up' ? 'TrendingUp' : trend === 'down' ? 'TrendingDown' : 'Minus'} 
            size={16} 
            className={
              trend === 'up' ? 'text-success' : 
              trend === 'down'? 'text-error' : 'text-muted-foreground'
            }
          />
          <span className="text-sm text-muted-foreground">
            {trend === 'up' ? 'Increasing' : trend === 'down' ? 'Decreasing' : 'Stable'}
          </span>
        </div>
      </div>
      {/* Chart */}
      <div className="flex-1 min-h-64">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'line' ? (
            <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis 
                dataKey="time" 
                stroke="var(--color-muted-foreground)"
                fontSize={12}
                interval="preserveStartEnd"
              />
              <YAxis 
                stroke="var(--color-muted-foreground)"
                fontSize={12}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey={selectedMetric}
                stroke={currentMetric?.color}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, stroke: currentMetric?.color, strokeWidth: 2 }}
              />
            </LineChart>
          ) : (
            <AreaChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis 
                dataKey="time" 
                stroke="var(--color-muted-foreground)"
                fontSize={12}
                interval="preserveStartEnd"
              />
              <YAxis 
                stroke="var(--color-muted-foreground)"
                fontSize={12}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey={selectedMetric}
                stroke={currentMetric?.color}
                fill={`${currentMetric?.color}20`}
                strokeWidth={2}
              />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SystemPerformanceChart;