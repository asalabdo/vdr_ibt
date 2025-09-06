import React from 'react';
import { useTranslation } from 'react-i18next';
import Icon from '../../../components/AppIcon';

const KPICard = ({ title, value, change, changeType, icon, subtitle, trend }) => {
  const { t } = useTranslation('executive-dashboard');
  const { t: tCommon } = useTranslation('common');

  const getChangeColor = () => {
    if (changeType === 'positive') return 'text-success';
    if (changeType === 'negative') return 'text-error';
    return 'text-muted-foreground';
  };

  const getChangeIcon = () => {
    if (changeType === 'positive') return 'TrendingUp';
    if (changeType === 'negative') return 'TrendingDown';
    return 'Minus';
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 hover:shadow-elevation-1 transition-all duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <Icon name={icon} size={20} className="text-primary" />
          </div>
          <div className="rtl:text-right">
            <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
            {subtitle && (
              <p className="text-xs text-muted-foreground/70 mt-1">{subtitle}</p>
            )}
          </div>
        </div>
        {trend && (
          <div className="w-16 h-8 flex items-end space-x-0.5 rtl:space-x-reverse rtl:flex-row-reverse">
            {trend?.map((point, index) => (
              <div
                key={index}
                className="bg-primary/20 rounded-sm flex-1"
                style={{ height: `${point}%` }}
              />
            ))}
          </div>
        )}
      </div>
      <div className="space-y-2">
        <div className="text-2xl font-bold text-foreground rtl:text-right">{value}</div>
        {change && (
          <div className={`flex items-center space-x-1 rtl:space-x-reverse text-sm ${getChangeColor()}`}>
            <Icon name={getChangeIcon()} size={14} />
            <span>{change}</span>
            <span className="text-muted-foreground">{tCommon('time_comparison.vs_last_quarter')}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default KPICard;