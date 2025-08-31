import React from 'react';
import Icon from '../../../components/AppIcon';

const MetricCard = ({ 
  title, 
  value, 
  unit, 
  change, 
  changeType, 
  icon, 
  status, 
  sparklineData = [],
  onClick 
}) => {
  const getStatusColor = () => {
    switch (status) {
      case 'critical': return 'text-error border-error/20 bg-error/5';
      case 'warning': return 'text-warning border-warning/20 bg-warning/5';
      case 'success': return 'text-success border-success/20 bg-success/5';
      default: return 'text-foreground border-border bg-card';
    }
  };

  const getChangeColor = () => {
    if (changeType === 'positive') return 'text-success';
    if (changeType === 'negative') return 'text-error';
    return 'text-muted-foreground';
  };

  const renderSparkline = () => {
    if (!sparklineData?.length) return null;
    
    const max = Math.max(...sparklineData);
    const min = Math.min(...sparklineData);
    const range = max - min || 1;
    
    const points = sparklineData?.map((value, index) => {
      const x = (index / (sparklineData?.length - 1)) * 60;
      const y = 20 - ((value - min) / range) * 15;
      return `${x},${y}`;
    })?.join(' ');

    return (
      <svg width="60" height="20" className="opacity-60">
        <polyline
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          points={points}
        />
      </svg>
    );
  };

  return (
    <div 
      className={`
        p-4 rounded-lg border transition-all duration-200 cursor-pointer
        hover:shadow-elevation-1 ${getStatusColor()}
      `}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Icon name={icon} size={16} className="opacity-60" />
          <span className="text-sm font-medium opacity-80">{title}</span>
        </div>
        {status === 'critical' && (
          <div className="w-2 h-2 bg-error rounded-full animate-pulse-subtle"></div>
        )}
      </div>
      
      <div className="flex items-end justify-between">
        <div>
          <div className="text-2xl font-bold">
            {value}
            {unit && <span className="text-sm font-normal opacity-60 ml-1">{unit}</span>}
          </div>
          {change && (
            <div className={`text-xs font-medium ${getChangeColor()}`}>
              {changeType === 'positive' ? '+' : changeType === 'negative' ? '-' : ''}
              {Math.abs(change)}%
            </div>
          )}
        </div>
        
        <div className="flex flex-col items-end space-y-1">
          {renderSparkline()}
        </div>
      </div>
    </div>
  );
};

export default MetricCard;