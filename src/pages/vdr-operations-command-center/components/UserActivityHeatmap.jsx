import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const UserActivityHeatmap = ({ data = [] }) => {
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h');
  const [selectedMetric, setSelectedMetric] = useState('sessions');

  const timeRanges = [
    { value: '1h', label: '1H' },
    { value: '6h', label: '6H' },
    { value: '24h', label: '24H' },
    { value: '7d', label: '7D' }
  ];

  const metrics = [
    { value: 'sessions', label: 'Active Sessions', icon: 'Users' },
    { value: 'downloads', label: 'Downloads', icon: 'Download' },
    { value: 'uploads', label: 'Uploads', icon: 'Upload' },
    { value: 'views', label: 'Document Views', icon: 'Eye' }
  ];

  // Generate mock heatmap data
  const generateHeatmapData = () => {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    
    return days?.map(day => ({
      day,
      hours: hours?.map(hour => ({
        hour,
        value: Math.floor(Math.random() * 100),
        sessions: Math.floor(Math.random() * 50),
        downloads: Math.floor(Math.random() * 30),
        uploads: Math.floor(Math.random() * 20),
        views: Math.floor(Math.random() * 80)
      }))
    }));
  };

  const heatmapData = generateHeatmapData();

  const getIntensityColor = (value) => {
    const intensity = Math.min(value / 100, 1);
    if (intensity === 0) return 'bg-muted/20';
    if (intensity < 0.25) return 'bg-accent/30';
    if (intensity < 0.5) return 'bg-accent/50';
    if (intensity < 0.75) return 'bg-accent/70';
    return 'bg-accent';
  };

  const getCurrentMetricData = () => {
    return heatmapData?.map(dayData => ({
      ...dayData,
      hours: dayData?.hours?.map(hourData => ({
        ...hourData,
        value: hourData?.[selectedMetric] || 0
      }))
    }));
  };

  const currentData = getCurrentMetricData();
  const maxValue = Math.max(...currentData?.flatMap(d => d?.hours?.map(h => h?.value)));

  return (
    <div className="bg-card border border-border rounded-lg p-4 h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <Icon name="Activity" size={20} className="text-accent" />
          <h3 className="text-lg font-semibold text-foreground">User Activity Heatmap</h3>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Time Range Selector */}
          <div className="flex bg-muted/20 rounded-lg p-1">
            {timeRanges?.map(range => (
              <button
                key={range?.value}
                onClick={() => setSelectedTimeRange(range?.value)}
                className={`
                  px-3 py-1 text-xs font-medium rounded transition-colors
                  ${selectedTimeRange === range?.value
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                  }
                `}
              >
                {range?.label}
              </button>
            ))}
          </div>
          
          <Button variant="ghost" size="sm" iconName="Maximize2" />
        </div>
      </div>
      {/* Metric Selector */}
      <div className="flex space-x-2 mb-4">
        {metrics?.map(metric => (
          <button
            key={metric?.value}
            onClick={() => setSelectedMetric(metric?.value)}
            className={`
              flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium
              transition-colors border
              ${selectedMetric === metric?.value
                ? 'bg-accent/10 text-accent border-accent/20' :'text-muted-foreground hover:text-foreground border-border hover:bg-muted/50'
              }
            `}
          >
            <Icon name={metric?.icon} size={14} />
            <span>{metric?.label}</span>
          </button>
        ))}
      </div>
      {/* Heatmap */}
      <div className="flex-1 overflow-auto">
        <div className="min-w-max">
          {/* Hour Labels */}
          <div className="flex mb-2">
            <div className="w-12"></div>
            {Array.from({ length: 24 }, (_, i) => (
              <div key={i} className="w-6 text-xs text-muted-foreground text-center">
                {i % 4 === 0 ? `${i}h` : ''}
              </div>
            ))}
          </div>

          {/* Heatmap Grid */}
          {currentData?.map((dayData, dayIndex) => (
            <div key={dayData?.day} className="flex items-center mb-1">
              <div className="w-12 text-xs text-muted-foreground font-medium">
                {dayData?.day}
              </div>
              {dayData?.hours?.map((hourData, hourIndex) => (
                <div
                  key={`${dayIndex}-${hourIndex}`}
                  className={`
                    w-6 h-4 mr-0.5 rounded-sm cursor-pointer transition-all duration-200
                    hover:ring-2 hover:ring-accent/50 hover:scale-110
                    ${getIntensityColor(hourData?.value)}
                  `}
                  title={`${dayData?.day} ${hourData?.hour}:00 - ${hourData?.value} ${selectedMetric}`}
                />
              ))}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            <span>Less</span>
            <div className="flex space-x-1">
              {[0, 0.25, 0.5, 0.75, 1]?.map((intensity, index) => (
                <div
                  key={index}
                  className={`w-3 h-3 rounded-sm ${getIntensityColor(intensity * 100)}`}
                />
              ))}
            </div>
            <span>More</span>
          </div>
          
          <div className="text-xs text-muted-foreground">
            Peak: {maxValue} {selectedMetric} • Last updated: 2 min ago
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserActivityHeatmap;