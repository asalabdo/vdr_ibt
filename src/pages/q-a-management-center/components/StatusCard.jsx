import React from 'react';
import Icon from '../../../components/AppIcon';

const StatusCard = ({ title, value, icon, color, description }) => {
  const getColorClasses = (colorType) => {
    switch (colorType) {
      case 'warning':
        return {
          bg: 'bg-warning/10',
          icon: 'text-warning',
          text: 'text-warning'
        };
      case 'info':
        return {
          bg: 'bg-blue-100',
          icon: 'text-blue-600',
          text: 'text-blue-600'
        };
      case 'success':
        return {
          bg: 'bg-success/10',
          icon: 'text-success',
          text: 'text-success'
        };
      case 'error':
        return {
          bg: 'bg-error/10',
          icon: 'text-error',
          text: 'text-error'
        };
      default:
        return {
          bg: 'bg-muted',
          icon: 'text-muted-foreground',
          text: 'text-muted-foreground'
        };
    }
  };

  const colors = getColorClasses(color);

  return (
    <div className="bg-card rounded-lg shadow-sm border border-border p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center space-x-3 rtl:space-x-reverse">
        <div className={`w-10 h-10 ${colors?.bg} rounded-lg flex items-center justify-center`}>
          <Icon name={icon} size={20} className={colors?.icon} />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold text-foreground">{value}</p>
        </div>
      </div>
      {description && (
        <p className="text-xs text-muted-foreground mt-2">{description}</p>
      )}
    </div>
  );
};

export default StatusCard;