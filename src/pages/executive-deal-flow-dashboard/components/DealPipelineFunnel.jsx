import React from 'react';
import { useTranslation } from 'react-i18next';
import Icon from '../../../components/AppIcon';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

const DealPipelineFunnel = ({ stages }) => {
  const { t } = useTranslation('executive-dashboard');
  
  const getStageInfo = (index) => {
    const stageConfigs = [
      { 
        color: 'bg-blue-500', 
        iconBg: 'bg-blue-500/20 dark:bg-blue-500/30', 
        textColor: 'text-blue-600 dark:text-blue-400',
        icon: 'Target'
      },
      { 
        color: 'bg-indigo-500', 
        iconBg: 'bg-indigo-500/20 dark:bg-indigo-500/30', 
        textColor: 'text-indigo-600 dark:text-indigo-400',
        icon: 'Eye'
      },
      { 
        color: 'bg-purple-500', 
        iconBg: 'bg-purple-500/20 dark:bg-purple-500/30', 
        textColor: 'text-purple-600 dark:text-purple-400',
        icon: 'MessageSquare'
      },
      { 
        color: 'bg-pink-500', 
        iconBg: 'bg-pink-500/20 dark:bg-pink-500/30', 
        textColor: 'text-pink-600 dark:text-pink-400',
        icon: 'HandHeart'
      },
      { 
        color: 'bg-green-500', 
        iconBg: 'bg-green-500/20 dark:bg-green-500/30', 
        textColor: 'text-green-600 dark:text-green-400',
        icon: 'CheckCircle'
      }
    ];
    return stageConfigs?.[index] || { 
      color: 'bg-muted', 
      iconBg: 'bg-muted/20 dark:bg-muted/30', 
      textColor: 'text-muted-foreground',
      icon: 'Circle'
    };
  };

  const getStageWidth = (count, maxCount) => {
    return Math.max((count / maxCount) * 100, 10);
  };

  const maxCount = Math.max(...stages?.map(stage => stage?.count));

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{t('pipeline.title', 'Deal Pipeline')}</CardTitle>
            <CardDescription>{t('pipeline.subtitle', 'Stage-wise conversion analysis')}</CardDescription>
          </div>
          <Icon name="Filter" size={16} className="text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent>
      <div className="space-y-2">
        {stages?.map((stage, index) => {
          const stageInfo = getStageInfo(index);
          const isLast = index === stages?.length - 1;
          return (
            <div key={stage?.name} className="group">
              {/* Stage Card */}
              <div className="p-3 rounded-lg border border-border/50 hover:border-border/80 hover:shadow-sm hover:shadow-black/5 dark:hover:shadow-white/5 transition-all duration-200 bg-card">
                {/* Header Row */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <div className={`w-8 h-8 ${stageInfo?.iconBg} rounded-lg flex items-center justify-center`}>
                      <Icon name={stageInfo?.icon} size={14} className={stageInfo?.textColor} />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-foreground leading-tight">
                        {stage?.name}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        {stage?.count} {t('pipeline.deals', 'deals')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right rtl:text-left">
                    <div className="text-base font-bold text-foreground">
                      ${stage?.value}M
                    </div>
                    {stage?.conversionRate && (
                      <Badge variant="secondary" className="text-xs h-5 px-1.5">
                        {stage?.conversionRate}%
                      </Badge>
                    )}
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{t('pipeline.progress', 'Progress')}</span>
                    <span className="font-medium">{getStageWidth(stage?.count, maxCount).toFixed(0)}%</span>
                  </div>
                  <div className="relative w-full h-1.5 bg-muted/20 dark:bg-muted/10 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${stageInfo?.color} rounded-full transition-all duration-500`}
                      style={{ width: `${getStageWidth(stage?.count, maxCount)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Connector Arrow */}
              {!isLast && (
                <div className="flex justify-center py-1">
                  <div className="w-6 h-6 bg-muted/10 dark:bg-muted/20 rounded-full flex items-center justify-center border border-muted/20 dark:border-muted/30">
                    <Icon name="ChevronDown" size={12} className="text-muted-foreground" />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-3">
        <Separator />
        <div className="pt-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <div className="w-6 h-6 bg-green-500/20 dark:bg-green-500/30 rounded-md flex items-center justify-center">
                <Icon name="TrendingUp" size={12} className="text-green-600 dark:text-green-400" />
              </div>
              <span className="text-sm text-muted-foreground font-medium">
                {t('pipeline.overall_conversion_rate', 'Overall Conversion Rate')}
              </span>
            </div>
            <div className="text-right rtl:text-left">
              <div className="text-lg font-bold text-green-600 dark:text-green-400">
                {((stages?.[stages?.length - 1]?.count / stages?.[0]?.count) * 100)?.toFixed(1)}%
              </div>
            </div>
          </div>
        </div>
      </div>
      </CardContent>
    </Card>
  );
};

export default DealPipelineFunnel;
