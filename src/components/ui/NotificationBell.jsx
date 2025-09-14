import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Icon from '@/components/AppIcon';
import { useNotifications } from '@/hooks/api/useNotifications';
import { formatDistanceToNow } from 'date-fns';

const NotificationBell = () => {
  const navigate = useNavigate();
  const { t } = useTranslation('notifications');
  const { data: notifications = [], isLoading } = useNotifications({
    refetchInterval: 60000 // Refetch every minute
  });

  // Get recent notifications (max 5 for dropdown)
  const recentNotifications = notifications.slice(0, 5);
  const unreadCount = notifications.filter(n => n.shouldNotify).length;

  // Format timestamp for quick view
  const formatQuickTimestamp = (timestamp) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch (error) {
      return timestamp;
    }
  };

  // Get app display name
  const getAppDisplayName = (appName) => {
    const appNames = {
      'survey_client': 'Survey',
      'firstrunwizard': 'Setup',
      'files': 'Files',
      'activity': 'Activity',
      'vdr_ibt': 'VDR'
    };
    return appNames[appName] || appName;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-10 w-10 rounded-lg hover:bg-muted/80 transition-all duration-200 group"
          title={t('notifications', { defaultValue: 'Notifications' })}
        >
          <Icon 
            name="Bell" 
            size={18} 
            className={`transition-colors ${
              unreadCount > 0 
                ? 'text-primary group-hover:text-primary/80' 
                : 'text-muted-foreground group-hover:text-foreground'
            }`}
          />
          {/* Notification Count Badge */}
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs font-bold bg-primary text-primary-foreground shadow-md animate-pulse"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent 
        className="w-80 max-h-96 overflow-y-auto" 
        align="end" 
        forceMount
      >
        <DropdownMenuLabel className="flex items-center justify-between">
          <span className="font-semibold">
            {t('notifications', { defaultValue: 'Notifications' })}
          </span>
          {unreadCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {unreadCount} {t('unread', { defaultValue: 'unread' })}
            </Badge>
          )}
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        {/* Loading State */}
        {isLoading && (
          <div className="px-2 py-4">
            <div className="flex items-center justify-center">
              <Icon name="Loader2" size={16} className="animate-spin mr-2" />
              <span className="text-sm text-muted-foreground">
                {t('loading', { defaultValue: 'Loading...' })}
              </span>
            </div>
          </div>
        )}

        {/* Notifications List */}
        {!isLoading && recentNotifications.length > 0 && (
          <div className="max-h-64 overflow-y-auto">
            {recentNotifications.map((notification) => (
              <DropdownMenuItem
                key={notification.notification_id}
                className="flex items-start space-x-3 p-3 cursor-pointer hover:bg-muted/50 border-b border-border/50 last:border-b-0"
                onClick={() => {
                  if (notification.link) {
                    window.open(notification.link, '_blank');
                  }
                }}
              >
                {/* App Icon */}
                <div className="flex-shrink-0 mt-0.5">
                  {notification.icon ? (
                    <Avatar className="w-8 h-8">
                      <AvatarImage 
                        src={notification.icon} 
                        alt={getAppDisplayName(notification.app)}
                        className="dark:brightness-0 dark:invert filter transition-all duration-200" 
                      />
                      <AvatarFallback className="text-xs bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-foreground">
                        {getAppDisplayName(notification.app).charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center border border-border/50">
                      <Icon name="Bell" size={12} className="text-muted-foreground dark:text-muted-foreground" />
                    </div>
                  )}
                </div>

                {/* Notification Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-1">
                    <h4 className="text-sm font-medium text-foreground leading-tight line-clamp-2 pr-2">
                      {notification.subject}
                    </h4>
                    {notification.shouldNotify && (
                      <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-1.5" />
                    )}
                  </div>
                  
                  <div className="text-xs text-muted-foreground mb-1">
                    {getAppDisplayName(notification.app)} • {formatQuickTimestamp(notification.datetime)}
                  </div>

                  {notification.message && (
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                      {notification.message}
                    </p>
                  )}

                  {notification.actions && notification.actions.length > 0 && (
                    <div className="mt-2">
                      <Badge variant="outline" className="text-xs">
                        {notification.actions.length} action{notification.actions.length > 1 ? 's' : ''} available
                      </Badge>
                    </div>
                  )}
                </div>
              </DropdownMenuItem>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && recentNotifications.length === 0 && (
          <div className="px-2 py-8 text-center">
            <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-3 border border-border/50">
              <Icon name="Bell" size={20} className="text-muted-foreground dark:text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground mb-1">
              {t('no_notifications', { defaultValue: 'No notifications' })}
            </p>
            <p className="text-xs text-muted-foreground">
              {t('no_notifications_desc', { defaultValue: 'You\'re all caught up!' })}
            </p>
          </div>
        )}

        <DropdownMenuSeparator />

        {/* View All Button */}
        <DropdownMenuItem 
          className="cursor-pointer justify-center font-medium text-primary hover:text-primary/80"
          onClick={() => navigate('/notifications')}
        >
          <Icon name="Eye" size={14} className="mr-2" />
          {t('view_all', { defaultValue: 'View All Notifications' })}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationBell;
