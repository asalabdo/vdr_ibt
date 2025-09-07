import React from 'react';
import { useTranslation } from 'react-i18next';
import Icon from '../../../components/AppIcon';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const KPICard = ({ title, value, change, changeType, icon, subtitle, trend }) => {
  const { t } = useTranslation('executive-dashboard');
  const { t: tCommon } = useTranslation('common');

  const getKPIInfo = () => {
    if (changeType === 'positive') return { 
      textColor: 'text-success', 
      bgColor: 'bg-success/10',
      badgeColor: 'bg-success/20 text-success',
      icon: 'TrendingUp' 
    };
    if (changeType === 'negative') return { 
      textColor: 'text-error', 
      bgColor: 'bg-error/10',
      badgeColor: 'bg-error/20 text-error',
      icon: 'TrendingDown' 
    };
    return { 
      textColor: 'text-muted-foreground', 
      bgColor: 'bg-muted/10',
      badgeColor: 'bg-muted/20 text-muted-foreground',
      icon: 'Minus' 
    };
  };

  const getIconInfo = () => {
    const iconConfigs = {
      'DollarSign': { bg: 'bg-primary/20', color: 'text-primary' },
      'Clock': { bg: 'bg-accent/20', color: 'text-accent-foreground' },
      'Activity': { bg: 'bg-warning/20', color: 'text-warning' },
      'TrendingUp': { bg: 'bg-success/20', color: 'text-success' }
    };
    return iconConfigs[icon] || { bg: 'bg-primary/20', color: 'text-primary' };
  };

  const kpiInfo = getKPIInfo();
  const iconInfo = getIconInfo();

  return (
    <Card className="border-border/50">
      <CardContent className="p-6">
        {/* Header Section */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center space-x-4 rtl:space-x-reverse">
            <div className={`w-12 h-12 ${iconInfo.bg} rounded-xl flex items-center justify-center shadow-sm`}>
              <Icon name={icon} size={22} className={iconInfo.color} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                {title}
              </h3>
              {subtitle && (
                <p className="text-xs text-muted-foreground mt-1 font-medium">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          {/* Mini Chart */}
          {trend && (
            <div className="w-20 h-10 flex items-end space-x-1 rtl:space-x-reverse rtl:flex-row-reverse">
              {trend?.map((point, index) => (
                <div
                  key={index}
                  className={`${iconInfo.bg} rounded-sm flex-1`}
                  style={{ 
                    height: `${Math.max(point * 0.8, 15)}%`
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Value Section */}
        <div className="space-y-4">
          {/* Main Value */}
          <div className="text-3xl font-bold text-foreground rtl:text-right">
            {value}
          </div>

          {/* Change Indicator */}
          {change && (
            <div className="flex items-center justify-between">
              <div className={`flex items-center space-x-2 rtl:space-x-reverse ${kpiInfo.textColor}`}>
                <div className={`w-6 h-6 ${kpiInfo.bgColor} rounded-full flex items-center justify-center`}>
                  <Icon name={kpiInfo.icon} size={12} />
                </div>
                <span className="font-semibold text-sm">{change}</span>
              </div>
              
              <Badge variant="secondary" className={`text-xs px-2 py-1 ${kpiInfo.badgeColor} border-0`}>
                {tCommon('time_comparison.vs_last_quarter', 'vs last quarter')}
              </Badge>
            </div>
          )}
        </div>

      </CardContent>
    </Card>
  );
};

export default KPICard;
