import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import Icon from '../../../components/AppIcon';

const StatusCard = ({ title, value, icon, color, description }) => {
  const getColorClasses = (colorType) => {
    switch (colorType) {
      case 'warning':
        return {
          bg: 'bg-warning/10',
          icon: 'text-warning',
          badge: 'bg-warning/20 text-warning border-warning/30'
        };
      case 'info':
        return {
          bg: 'bg-blue-500/10',
          icon: 'text-blue-600',
          badge: 'bg-blue-100 text-blue-700 border-blue-200'
        };
      case 'success':
        return {
          bg: 'bg-success/10',
          icon: 'text-success',
          badge: 'bg-success/20 text-success border-success/30'
        };
      case 'error':
        return {
          bg: 'bg-error/10',
          icon: 'text-error',
          badge: 'bg-error/20 text-error border-error/30'
        };
      default:
        return {
          bg: 'bg-muted',
          icon: 'text-muted-foreground',
          badge: 'bg-muted text-muted-foreground'
        };
    }
  };

  const colors = getColorClasses(color);

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <div className={`w-10 h-10 ${colors.bg} rounded-lg flex items-center justify-center`}>
            <Icon name={icon} size={20} className={colors.icon} />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold text-foreground">{value}</p>
          </div>
        </div>
        {description && (
          <p className="text-xs text-muted-foreground mt-2">{description}</p>
        )}
      </CardContent>
    </Card>
  );
};

export default StatusCard;