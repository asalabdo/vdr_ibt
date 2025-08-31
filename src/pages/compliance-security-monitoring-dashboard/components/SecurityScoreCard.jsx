import React from 'react';
import Icon from '../../../components/AppIcon';

const SecurityScoreCard = ({ title, value, change, changeType, icon, color, description }) => {
  const getColorClasses = (color) => {
    switch (color) {
      case 'success':
        return 'bg-success/10 text-success border-success/20';
      case 'warning':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'error':
        return 'bg-error/10 text-error border-error/20';
      default:
        return 'bg-primary/10 text-primary border-primary/20';
    }
  };

  const getChangeIcon = (type) => {
    switch (type) {
      case 'increase':
        return 'TrendingUp';
      case 'decrease':
        return 'TrendingDown';
      default:
        return 'Minus';
    }
  };

  const getChangeColor = (type) => {
    switch (type) {
      case 'increase':
        return color === 'error' ? 'text-error' : 'text-success';
      case 'decrease':
        return color === 'error' ? 'text-success' : 'text-error';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 hover:shadow-elevation-1 transition-all duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-lg border ${getColorClasses(color)}`}>
          <Icon name={icon} size={24} />
        </div>
        <div className={`flex items-center space-x-1 text-sm ${getChangeColor(changeType)}`}>
          <Icon name={getChangeIcon(changeType)} size={16} />
          <span>{change}</span>
        </div>
      </div>
      
      <div className="space-y-2">
        <h3 className="text-2xl font-bold text-foreground">{value}</h3>
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  );
};

export default SecurityScoreCard;