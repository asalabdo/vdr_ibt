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
      textColor: 'text-green-600 dark:text-green-400', 
      bgColor: 'bg-green-500/10 dark:bg-green-500/20',
      badgeColor: 'bg-green-500/20 text-green-700 dark:bg-green-500/30 dark:text-green-300',
      icon: 'TrendingUp' 
    };
    if (changeType === 'negative') return { 
      textColor: 'text-red-600 dark:text-red-400', 
      bgColor: 'bg-red-500/10 dark:bg-red-500/20',
      badgeColor: 'bg-red-500/20 text-red-700 dark:bg-red-500/30 dark:text-red-300',
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
      'DollarSign': { bg: 'bg-blue-500/20 dark:bg-blue-500/30', color: 'text-blue-600 dark:text-blue-400' },
      'Clock': { bg: 'bg-purple-500/20 dark:bg-purple-500/30', color: 'text-purple-600 dark:text-purple-400' },
      'Activity': { bg: 'bg-orange-500/20 dark:bg-orange-500/30', color: 'text-orange-600 dark:text-orange-400' },
      'TrendingUp': { bg: 'bg-green-500/20 dark:bg-green-500/30', color: 'text-green-600 dark:text-green-400' }
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
