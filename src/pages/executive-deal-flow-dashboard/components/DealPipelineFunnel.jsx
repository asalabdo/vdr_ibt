import React from 'react';
import { useTranslation } from 'react-i18next';
import Icon from '../../../components/AppIcon';

const DealPipelineFunnel = ({ stages }) => {
  const { t } = useTranslation('dashboard');
  
  const getStageColor = (index) => {
    const colors = [
      'bg-blue-500',
      'bg-indigo-500', 
      'bg-purple-500',
      'bg-pink-500',
      'bg-success'
    ];
    return colors?.[index] || 'bg-muted';
  };

  const getStageWidth = (count, maxCount) => {
    return Math.max((count / maxCount) * 100, 10);
  };

  const maxCount = Math.max(...stages?.map(stage => stage?.count));

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">{t('pipeline.title', 'Deal Pipeline')}</h3>
          <p className="text-sm text-muted-foreground">{t('pipeline.subtitle', 'Stage-wise conversion analysis')}</p>
        </div>
        <Icon name="Filter" size={16} className="text-muted-foreground" />
      </div>
      <div className="space-y-4">
        {stages?.map((stage, index) => (
          <div key={stage?.name} className="relative">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <div className={`w-3 h-3 rounded-full ${getStageColor(index)}`} />
                <span className="text-sm font-medium text-foreground">{stage?.name}</span>
              </div>
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <span className="text-sm text-muted-foreground">
                  {stage?.count} {t('pipeline.deals', 'deals')}
                </span>
                <span className="text-sm font-medium text-foreground">${stage?.value}M</span>
              </div>
            </div>
            
            <div className="relative">
              <div className="w-full h-2 bg-muted/30 rounded-full overflow-hidden">
                <div
                  className={`h-full ${getStageColor(index)} transition-all duration-500 ease-out`}
                  style={{ width: `${getStageWidth(stage?.count, maxCount)}%` }}
                />
              </div>
              
              {stage?.conversionRate && (
                <div className="absolute -right-2 rtl:-left-2 rtl:right-auto -top-1 bg-popover border border-border rounded px-2 py-1">
                  <span className="text-xs font-medium text-popover-foreground">
                    {stage?.conversionRate}%
                  </span>
                </div>
              )}
            </div>

            {index < stages?.length - 1 && (
              <div className="flex justify-center mt-2">
                <Icon name="ChevronDown" size={14} className="text-muted-foreground" />
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="mt-6 pt-4 border-t border-border">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{t('pipeline.overall_conversion_rate', 'Overall Conversion Rate')}</span>
          <span className="font-medium text-success">
            {((stages?.[stages?.length - 1]?.count / stages?.[0]?.count) * 100)?.toFixed(1)}%
          </span>
        </div>
      </div>
    </div>
  );
};

export default DealPipelineFunnel;