import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const UserEngagementHeatmap = () => {
  const [selectedView, setSelectedView] = useState('weekly');
  const [selectedMetric, setSelectedMetric] = useState('sessions');

  const heatmapData = {
    weekly: [
      { day: 'Mon', hours: Array.from({length: 24}, (_, i) => ({
        hour: i,
        sessions: Math.floor(Math.random() * 50) + 10,
        documents: Math.floor(Math.random() * 30) + 5,
        qa_activity: Math.floor(Math.random() * 20) + 2
      }))},
      { day: 'Tue', hours: Array.from({length: 24}, (_, i) => ({
        hour: i,
        sessions: Math.floor(Math.random() * 60) + 15,
        documents: Math.floor(Math.random() * 35) + 8,
        qa_activity: Math.floor(Math.random() * 25) + 3
      }))},
      { day: 'Wed', hours: Array.from({length: 24}, (_, i) => ({
        hour: i,
        sessions: Math.floor(Math.random() * 70) + 20,
        documents: Math.floor(Math.random() * 40) + 10,
        qa_activity: Math.floor(Math.random() * 30) + 5
      }))},
      { day: 'Thu', hours: Array.from({length: 24}, (_, i) => ({
        hour: i,
        sessions: Math.floor(Math.random() * 65) + 18,
        documents: Math.floor(Math.random() * 38) + 9,
        qa_activity: Math.floor(Math.random() * 28) + 4
      }))},
      { day: 'Fri', hours: Array.from({length: 24}, (_, i) => ({
        hour: i,
        sessions: Math.floor(Math.random() * 55) + 12,
        documents: Math.floor(Math.random() * 32) + 6,
        qa_activity: Math.floor(Math.random() * 22) + 2
      }))},
      { day: 'Sat', hours: Array.from({length: 24}, (_, i) => ({
        hour: i,
        sessions: Math.floor(Math.random() * 25) + 3,
        documents: Math.floor(Math.random() * 15) + 2,
        qa_activity: Math.floor(Math.random() * 10) + 1
      }))},
      { day: 'Sun', hours: Array.from({length: 24}, (_, i) => ({
        hour: i,
        sessions: Math.floor(Math.random() * 20) + 2,
        documents: Math.floor(Math.random() * 12) + 1,
        qa_activity: Math.floor(Math.random() * 8) + 1
      }))}
    ]
  };

  const metricOptions = [
    { value: 'sessions', label: 'User Sessions', color: '#1e40af' },
    { value: 'documents', label: 'Document Access', color: '#059669' },
    { value: 'qa_activity', label: 'Q&A Activity', color: '#d97706' }
  ];

  const getIntensityColor = (value, maxValue) => {
    const intensity = value / maxValue;
    if (intensity === 0) return 'bg-muted/20';
    if (intensity <= 0.2) return 'bg-primary/20';
    if (intensity <= 0.4) return 'bg-primary/40';
    if (intensity <= 0.6) return 'bg-primary/60';
    if (intensity <= 0.8) return 'bg-primary/80';
    return 'bg-primary';
  };

  const getAllValues = () => {
    return heatmapData?.weekly?.flatMap(day => 
      day?.hours?.map(hour => hour?.[selectedMetric])
    );
  };

  const maxValue = Math.max(...getAllValues());
  const avgValue = getAllValues()?.reduce((sum, val) => sum + val, 0) / getAllValues()?.length;

  const getHourLabel = (hour) => {
    if (hour === 0) return '12 AM';
    if (hour < 12) return `${hour} AM`;
    if (hour === 12) return '12 PM';
    return `${hour - 12} PM`;
  };

  const [hoveredCell, setHoveredCell] = useState(null);

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-1">User Engagement Heatmap</h3>
          <p className="text-sm text-muted-foreground">Activity patterns across time periods</p>
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

          <button className="p-2 hover:bg-muted rounded-lg transition-colors">
            <Icon name="Download" size={16} className="text-muted-foreground" />
          </button>
        </div>
      </div>
      <div className="relative">
        {/* Hour labels */}
        <div className="flex mb-2">
          <div className="w-12"></div>
          <div className="flex-1 grid grid-cols-24 gap-1">
            {Array.from({length: 24}, (_, i) => (
              <div key={i} className="text-xs text-muted-foreground text-center">
                {i % 4 === 0 ? getHourLabel(i)?.split(' ')?.[0] : ''}
              </div>
            ))}
          </div>
        </div>

        {/* Heatmap grid */}
        <div className="space-y-1">
          {heatmapData?.weekly?.map((dayData, dayIndex) => (
            <div key={dayData?.day} className="flex items-center">
              <div className="w-12 text-sm font-medium text-foreground text-right pr-2">
                {dayData?.day}
              </div>
              <div className="flex-1 grid grid-cols-24 gap-1">
                {dayData?.hours?.map((hourData, hourIndex) => {
                  const value = hourData?.[selectedMetric];
                  const isHovered = hoveredCell?.day === dayIndex && hoveredCell?.hour === hourIndex;
                  
                  return (
                    <div
                      key={hourIndex}
                      className={`
                        h-6 rounded-sm cursor-pointer transition-all duration-200 border
                        ${getIntensityColor(value, maxValue)}
                        ${isHovered ? 'border-primary scale-110 z-10 relative' : 'border-transparent'}
                      `}
                      onMouseEnter={() => setHoveredCell({ day: dayIndex, hour: hourIndex, value, dayName: dayData?.day, hourLabel: getHourLabel(hourIndex) })}
                      onMouseLeave={() => setHoveredCell(null)}
                      title={`${dayData?.day} ${getHourLabel(hourIndex)}: ${value} ${metricOptions?.find(m => m?.value === selectedMetric)?.label}`}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Tooltip */}
        {hoveredCell && (
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full mb-2 bg-popover border border-border rounded-lg p-3 shadow-elevation-2 z-20">
            <div className="text-sm font-medium text-popover-foreground">
              {hoveredCell?.dayName} {hoveredCell?.hourLabel}
            </div>
            <div className="text-xs text-muted-foreground">
              {metricOptions?.find(m => m?.value === selectedMetric)?.label}: {hoveredCell?.value}
            </div>
          </div>
        )}
      </div>
      {/* Legend and stats */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-6 pt-6 border-t border-border">
        <div className="flex items-center space-x-4 mb-4 sm:mb-0">
          <span className="text-sm text-muted-foreground">Less</span>
          <div className="flex space-x-1">
            <div className="w-3 h-3 bg-muted/20 rounded-sm"></div>
            <div className="w-3 h-3 bg-primary/20 rounded-sm"></div>
            <div className="w-3 h-3 bg-primary/40 rounded-sm"></div>
            <div className="w-3 h-3 bg-primary/60 rounded-sm"></div>
            <div className="w-3 h-3 bg-primary/80 rounded-sm"></div>
            <div className="w-3 h-3 bg-primary rounded-sm"></div>
          </div>
          <span className="text-sm text-muted-foreground">More</span>
        </div>

        <div className="flex items-center space-x-6">
          <div className="text-center">
            <div className="text-sm font-medium text-foreground">{maxValue}</div>
            <div className="text-xs text-muted-foreground">Peak</div>
          </div>
          <div className="text-center">
            <div className="text-sm font-medium text-foreground">{avgValue?.toFixed(1)}</div>
            <div className="text-xs text-muted-foreground">Average</div>
          </div>
          <div className="text-center">
            <div className="text-sm font-medium text-foreground">
              {heatmapData?.weekly?.reduce((sum, day) => sum + day?.hours?.reduce((daySum, hour) => daySum + hour?.[selectedMetric], 0), 0)}
            </div>
            <div className="text-xs text-muted-foreground">Total</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserEngagementHeatmap;