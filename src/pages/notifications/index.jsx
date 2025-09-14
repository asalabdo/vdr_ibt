import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { 
  useNotifications, 
  useDeleteNotification, 
  useClearAllNotifications,
  useNotificationAction 
} from '@/hooks/api/useNotifications';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Icon from '@/components/AppIcon';
import NotificationCard from './components/NotificationCard';
import NotificationHeader from './components/NotificationHeader';

const NotificationsPage = () => {
  const { t } = useTranslation('notifications');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNotifications, setSelectedNotifications] = useState(new Set());

  // API hooks
  const { 
    data: notifications = [], 
    isLoading, 
    error, 
    refetch 
  } = useNotifications();

  const deleteNotificationMutation = useDeleteNotification();
  const clearAllMutation = useClearAllNotifications();
  const executeActionMutation = useNotificationAction();

  // Filter notifications based on search
  const filteredNotifications = notifications.filter(notification =>
    notification.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    notification.message?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    notification.app?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Statistics
  const stats = {
    total: notifications.length,
    unread: notifications.filter(n => n.shouldNotify).length,
    withActions: notifications.filter(n => n.actions && n.actions.length > 0).length,
    byApp: notifications.reduce((acc, n) => {
      acc[n.app] = (acc[n.app] || 0) + 1;
      return acc;
    }, {})
  };

  // Handlers
  const handleDeleteNotification = async (notificationId) => {
    try {
      await deleteNotificationMutation.mutateAsync(notificationId);
      toast.success(t('notification_deleted', { defaultValue: 'Notification deleted successfully' }));
      setSelectedNotifications(prev => {
        const updated = new Set(prev);
        updated.delete(notificationId);
        return updated;
      });
    } catch (error) {
      toast.error(t('delete_failed', { defaultValue: 'Failed to delete notification' }));
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm(t('confirm_clear_all', { defaultValue: 'Are you sure you want to clear all notifications?' }))) {
      return;
    }

    try {
      await clearAllMutation.mutateAsync();
      toast.success(t('all_cleared', { defaultValue: 'All notifications cleared successfully' }));
      setSelectedNotifications(new Set());
    } catch (error) {
      toast.error(t('clear_all_failed', { defaultValue: 'Failed to clear all notifications' }));
    }
  };

  const handleExecuteAction = async (notificationId, actionIndex, actionData) => {
    try {
      await executeActionMutation.mutateAsync({ 
        notificationId, 
        actionIndex, 
        actionData 
      });
      toast.success(t('action_executed', { defaultValue: 'Action executed successfully' }));
    } catch (error) {
      toast.error(t('action_failed', { defaultValue: 'Failed to execute action' }));
    }
  };

  const handleSelectNotification = (notificationId, isSelected) => {
    setSelectedNotifications(prev => {
      const updated = new Set(prev);
      if (isSelected) {
        updated.add(notificationId);
      } else {
        updated.delete(notificationId);
      }
      return updated;
    });
  };

  const handleSelectAll = () => {
    if (selectedNotifications.size === filteredNotifications.length) {
      setSelectedNotifications(new Set());
    } else {
      setSelectedNotifications(new Set(filteredNotifications.map(n => n.notification_id)));
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedNotifications.size === 0) return;

    if (!window.confirm(t('confirm_delete_selected', { 
      defaultValue: 'Are you sure you want to delete {{count}} selected notifications?',
      count: selectedNotifications.size 
    }))) {
      return;
    }

    try {
      const deletePromises = Array.from(selectedNotifications).map(id => 
        deleteNotificationMutation.mutateAsync(id)
      );
      await Promise.all(deletePromises);
      
      toast.success(t('selected_deleted', { 
        defaultValue: '{{count}} notifications deleted successfully',
        count: selectedNotifications.size 
      }));
      setSelectedNotifications(new Set());
    } catch (error) {
      toast.error(t('delete_selected_failed', { defaultValue: 'Failed to delete selected notifications' }));
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-8">
            <div className="space-y-6">
              <Skeleton className="h-12 w-64" />
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-4">
                      <Skeleton className="h-16 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-4">
                      <Skeleton className="h-20 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-8">
            <Alert variant="destructive">
              <Icon name="AlertCircle" size={16} className="text-destructive dark:text-destructive-foreground" />
              <AlertDescription className="flex items-center justify-between">
                <span>{t('error_loading', { defaultValue: 'Failed to load notifications' })}: {error.message}</span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => refetch()}
                  className="ml-4 gap-1"
                >
                  <Icon name="RefreshCw" size={14} className="text-current" />
                  {t('retry', { defaultValue: 'Retry' })}
                </Button>
              </AlertDescription>
            </Alert>
          </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
          {/* Header */}
          <NotificationHeader 
            stats={stats}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedCount={selectedNotifications.size}
            totalCount={filteredNotifications.length}
            onSelectAll={handleSelectAll}
            onDeleteSelected={handleDeleteSelected}
            onClearAll={handleClearAll}
            onRefresh={refetch}
            isLoading={deleteNotificationMutation.isPending || clearAllMutation.isPending}
          />

          <Separator className="my-6" />

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-foreground">{stats.total}</div>
                <p className="text-sm text-muted-foreground">
                  {t('total_notifications', { defaultValue: 'Total Notifications' })}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-primary">{stats.unread}</div>
                <p className="text-sm text-muted-foreground">
                  {t('unread_notifications', { defaultValue: 'Unread' })}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-success">{stats.withActions}</div>
                <p className="text-sm text-muted-foreground">
                  {t('actionable', { defaultValue: 'Actionable' })}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-muted-foreground">
                  {Object.keys(stats.byApp).length}
                </div>
                <p className="text-sm text-muted-foreground">
                  {t('apps', { defaultValue: 'Apps' })}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Notifications List */}
          <div className="space-y-4">
            {filteredNotifications.length > 0 ? (
              filteredNotifications.map((notification) => (
                <NotificationCard
                  key={notification.notification_id}
                  notification={notification}
                  isSelected={selectedNotifications.has(notification.notification_id)}
                  onSelect={(isSelected) => 
                    handleSelectNotification(notification.notification_id, isSelected)
                  }
                  onDelete={() => handleDeleteNotification(notification.notification_id)}
                  onExecuteAction={(actionIndex, actionData) => 
                    handleExecuteAction(notification.notification_id, actionIndex, actionData)
                  }
                  isDeleting={deleteNotificationMutation.isPending}
                  isExecutingAction={executeActionMutation.isPending}
                />
              ))
            ) : (
              <Card className="text-center py-12">
                <CardContent className="pt-6">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4 border border-border/50">
                    <Icon name="Bell" size={32} className="text-muted-foreground dark:text-muted-foreground" />
                  </div>
                  <CardTitle className="text-lg mb-2">
                    {searchQuery 
                      ? t('no_search_results', { defaultValue: 'No notifications found' })
                      : t('no_notifications', { defaultValue: 'No notifications' })
                    }
                  </CardTitle>
                  <p className="text-muted-foreground mb-4">
                    {searchQuery 
                      ? t('no_search_results_desc', { defaultValue: 'Try adjusting your search terms' })
                      : t('no_notifications_desc', { defaultValue: 'You\'re all caught up!' })
                    }
                  </p>
                  {searchQuery && (
                    <Button 
                      variant="outline" 
                      onClick={() => setSearchQuery('')}
                      className="gap-2"
                    >
                      <Icon name="X" size={16} />
                      {t('clear_search', { defaultValue: 'Clear Search' })}
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
  );
};

export default NotificationsPage;
