import React from 'react';
import { useTranslation } from 'react-i18next';
import Icon from '../../../components/AppIcon';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const TopPerformingRooms = ({ rooms }) => {
  const { t } = useTranslation('executive-dashboard');
  const { t: tCommon } = useTranslation('common');

  const getRankIcon = (rank) => {
    if (rank === 1) return { icon: 'Trophy', color: 'text-yellow-500' };
    if (rank === 2) return { icon: 'Award', color: 'text-gray-400' };
    if (rank === 3) return { icon: 'Medal', color: 'text-amber-600' };
    return { icon: 'Circle', color: 'text-muted-foreground' };
  };

  const getPerformanceColor = (score) => {
    if (score >= 90) return 'text-success';
    if (score >= 75) return 'text-warning';
    return 'text-error';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{t('top_performing_rooms.title', 'Top Performing Rooms')}</CardTitle>
            <CardDescription>{t('top_performing_rooms.subtitle', 'Based on engagement & conversion')}</CardDescription>
          </div>
          <button className="text-sm text-primary hover:text-primary/80 transition-colors">
            {t('actions.view_all', 'View All')} {t('symbols.arrow', '→')}
          </button>
        </div>
      </CardHeader>
      <CardContent>
      <div className="space-y-4">
        {rooms?.map((room, index) => {
          const rankInfo = getRankIcon(index + 1);
          return (
            <div key={room?.id} className="flex items-center space-x-4 rtl:space-x-reverse p-3 rounded-lg hover:bg-muted/30 transition-colors">
              <div className="flex items-center justify-center w-8 h-8">
                <Icon name={rankInfo?.icon} size={16} className={rankInfo?.color} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-foreground truncate">{room?.name}</h4>
                  <span className={`text-sm font-medium ${getPerformanceColor(room?.score)}`}>
                    {room?.score}%
                  </span>
                </div>
                <div className="flex items-center space-x-4 rtl:space-x-reverse mt-1">
                  <span className="text-xs text-muted-foreground">{room?.dealValue}</span>
                  <span className="text-xs text-muted-foreground">{t('symbols.bullet', '•')}</span>
                  <span className="text-xs text-muted-foreground">{room?.participants} {tCommon('participants')}</span>
                </div>
              </div>
              <div className="flex flex-col items-end rtl:items-start space-y-1">
                <div className="flex items-center space-x-1 rtl:space-x-reverse">
                  <Icon name="Users" size={12} className="text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{room?.activeUsers}</span>
                </div>
                <div className="flex items-center space-x-1 rtl:space-x-reverse">
                  <Icon name="Clock" size={12} className="text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{room?.avgTime}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-6 pt-4 border-t border-border">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="text-lg font-bold text-foreground">94.2%</div>
            <div className="text-xs text-muted-foreground">{t('top_performing_rooms.avg_success_rate', 'Avg Success Rate')}</div>
          </div>
          <div>
            <div className="text-lg font-bold text-foreground">12.5d</div>
            <div className="text-xs text-muted-foreground">{t('top_performing_rooms.avg_close_time', 'Avg Close Time')}</div>
          </div>
        </div>
      </div>
      </CardContent>
    </Card>
  );
};

export default TopPerformingRooms;
