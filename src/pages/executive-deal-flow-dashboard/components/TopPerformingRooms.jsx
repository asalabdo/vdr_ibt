import React from 'react';
import { useTranslation } from 'react-i18next';
import Icon from '../../../components/AppIcon';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

const TopPerformingRooms = ({ rooms }) => {
  const { t } = useTranslation('executive-dashboard');
  const { t: tCommon } = useTranslation('common');

  const getRankInfo = (rank) => {
    if (rank === 1) return { 
      icon: 'Trophy', 
      color: 'text-yellow-600', 
      bgColor: 'bg-gradient-to-br from-yellow-400/20 to-yellow-600/20',
      borderColor: 'border-yellow-400/30',
      tag: '🥇',
      tagBg: 'bg-gradient-to-r from-yellow-500 to-yellow-600',
      tagText: 'text-white'
    };
    if (rank === 2) return { 
      icon: 'Award', 
      color: 'text-slate-600', 
      bgColor: 'bg-gradient-to-br from-slate-400/20 to-slate-600/20',
      borderColor: 'border-slate-400/30',
      tag: '🥈',
      tagBg: 'bg-gradient-to-r from-slate-500 to-slate-600',
      tagText: 'text-white'
    };
    if (rank === 3) return { 
      icon: 'Medal', 
      color: 'text-orange-700', 
      bgColor: 'bg-gradient-to-br from-orange-400/20 to-orange-700/20',
      borderColor: 'border-orange-500/30',
      tag: '🥉',
      tagBg: 'bg-gradient-to-r from-orange-600 to-orange-700',
      tagText: 'text-white'
    };
    return { 
      icon: 'Circle', 
      color: 'text-muted-foreground', 
      bgColor: 'bg-muted/10',
      borderColor: 'border-muted/20',
      tag: `#${rank}`,
      tagBg: 'bg-muted',
      tagText: 'text-muted-foreground'
    };
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
          <Button variant="link" size="sm">
            {t('actions.view_all', 'View All')} {t('symbols.arrow', '→')}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
      <div className="space-y-3">
        {rooms?.map((room, index) => {
          const rankInfo = getRankInfo(index + 1);
          const isTopThree = index < 3;
          return (
            <div 
              key={room?.id} 
              className={`group relative p-4 rounded-xl border transition-all duration-300 hover:shadow-lg hover:scale-[1.01] ${
                isTopThree 
                  ? `${rankInfo?.borderColor} ${rankInfo?.bgColor} hover:shadow-xl` 
                  : 'border-border/50 hover:border-border hover:bg-muted/20'
              }`}
            >
              {/* Ranking Tag - Top corner */}
              <div className={`absolute -top-2 -left-2 rtl:-right-2 rtl:left-auto px-2 py-1 rounded-full text-xs font-bold shadow-lg ${rankInfo?.tagBg} ${rankInfo?.tagText} z-10`}>
                {rankInfo?.tag}
              </div>

              {/* Header Row */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  <div className={`w-10 h-10 ${rankInfo?.bgColor} rounded-xl flex items-center justify-center shadow-sm border ${rankInfo?.borderColor}`}>
                    <Icon name={rankInfo?.icon} size={16} className={rankInfo?.color} />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-foreground leading-tight group-hover:text-primary transition-colors">
                      {room?.name}
                    </h4>
                    <p className="text-xs text-muted-foreground font-medium">{room?.dealValue}</p>
                  </div>
                </div>
                <div className="text-right rtl:text-left">
                  <div className={`text-xl font-bold ${getPerformanceColor(room?.score)} drop-shadow-sm`}>
                    {room?.score}%
                  </div>
                  <div className="text-xs text-muted-foreground font-medium">
                    {t('top_performing_rooms.score', 'Score')}
                  </div>
                </div>
              </div>

              {/* Stats Row */}
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-4 rtl:space-x-reverse">
                  <div className="flex items-center space-x-1.5 rtl:space-x-reverse text-muted-foreground">
                    <div className="w-4 h-4 bg-blue-100 rounded-full flex items-center justify-center">
                      <Icon name="Users" size={10} className="text-blue-600" />
                    </div>
                    <span className="font-medium">{room?.participants}</span>
                  </div>
                  <div className="flex items-center space-x-1.5 rtl:space-x-reverse text-muted-foreground">
                    <div className="w-4 h-4 bg-green-100 rounded-full flex items-center justify-center">
                      <Icon name="UserCheck" size={10} className="text-green-600" />
                    </div>
                    <span className="font-medium">{room?.activeUsers} {t('common.active', 'active')}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-1.5 rtl:space-x-reverse text-muted-foreground">
                  <div className="w-4 h-4 bg-purple-100 rounded-full flex items-center justify-center">
                    <Icon name="Clock" size={10} className="text-purple-600" />
                  </div>
                  <span className="font-medium">{room?.avgTime}</span>
                </div>
              </div>

              {/* Subtle shine effect for top 3 */}
              {isTopThree && (
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
              )}
            </div>
          );
        })}
      </div>
       <div className="mt-4">
         <Separator />
         <div className="pt-4">
           <div className="grid grid-cols-2 gap-4 text-center">
             <div>
               <div className="text-2xl font-bold text-success mb-1">94.2%</div>
               <div className="text-xs text-muted-foreground font-medium">
                 {t('top_performing_rooms.avg_success_rate', 'Avg Success Rate')}
               </div>
             </div>
             <div>
               <div className="text-2xl font-bold text-primary mb-1">12.5d</div>
               <div className="text-xs text-muted-foreground font-medium">
                 {t('top_performing_rooms.avg_close_time', 'Avg Close Time')}
               </div>
             </div>
           </div>
         </div>
       </div>
      </CardContent>
    </Card>
  );
};

export default TopPerformingRooms;
