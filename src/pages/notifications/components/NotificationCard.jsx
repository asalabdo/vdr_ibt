import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formatDistanceToNow } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import Icon from '@/components/AppIcon';

const NotificationCard = ({ 
  notification, 
  isSelected, 
  onSelect, 
  onDelete, 
  onExecuteAction,
  isDeleting,
  isExecutingAction
}) => {
  const { t, i18n } = useTranslation('notifications');
  const [isExpanded, setIsExpanded] = useState(false);

  const {
    notification_id,
    app,
    subject,
    message,
    datetime,
    icon,
    link,
    actions = [],
    shouldNotify,
    object_type,
    subjectRich,
    messageRich
  } = notification;

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { 
        addSuffix: true,
        locale: i18n.language === 'ar' ? require('date-fns/locale/ar-SA') : undefined
      });
    } catch (error) {
      return timestamp;
    }
  };

  // Get app display name
  const getAppDisplayName = (appName) => {
    const appNames = {
      'survey_client': 'Survey',
      'firstrunwizard': 'First Run Wizard',
      'files': 'Files',
      'activity': 'Activity',
      'notifications': 'Notifications',
      'vdr_ibt': 'VDR',
      'groupfolders': 'Team Folders'
    };
    return appNames[appName] || appName.charAt(0).toUpperCase() + appName.slice(1);
  };

  // Get notification type badge
  const getNotificationTypeBadge = () => {
    if (actions.length > 0) {
      return <Badge variant="outline" className="text-xs">Action Required</Badge>;
    }
    if (shouldNotify) {
      return <Badge variant="secondary" className="text-xs">Unread</Badge>;
    }
    return <Badge variant="outline" className="text-xs opacity-60">Read</Badge>;
  };

  // Handle action execution
  const handleActionClick = async (actionIndex, action) => {
    await onExecuteAction(actionIndex, action);
  };

  // Handle card click (expand/collapse)
  const handleCardClick = (e) => {
    // Don't expand if clicking on checkbox or actions
    if (e.target.closest('input[type="checkbox"]') || 
        e.target.closest('button') || 
        e.target.closest('[role="menuitem"]')) {
      return;
    }
    
    if (message || actions.length > 0) {
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <Card 
      className={`transition-all duration-200 hover:shadow-md cursor-pointer ${
        isSelected ? 'ring-2 ring-primary' : ''
      } ${shouldNotify ? 'border-l-4 border-l-primary' : ''}`}
      onClick={handleCardClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start space-x-4 rtl:space-x-reverse">
          {/* Selection Checkbox */}
          <Checkbox
            checked={isSelected}
            onCheckedChange={onSelect}
            className="mt-1"
            onClick={(e) => e.stopPropagation()}
          />

          {/* App Icon */}
          <div className="flex-shrink-0">
            {icon ? (
              <Avatar className="w-10 h-10">
                <AvatarImage 
                  src={icon} 
                  alt={getAppDisplayName(app)}
                  className="dark:brightness-0 dark:invert filter transition-all duration-200" 
                />
                <AvatarFallback className="text-xs font-medium bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-foreground">
                  {getAppDisplayName(app).charAt(0)}
                </AvatarFallback>
              </Avatar>
            ) : (
              <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center border border-border/50">
                <Icon name="Bell" size={16} className="text-muted-foreground dark:text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Notification Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 rtl:space-x-reverse mb-1">
                  <h3 className="font-medium text-foreground text-sm leading-tight line-clamp-2">
                    {subjectRich || subject}
                  </h3>
                  {getNotificationTypeBadge()}
                </div>
                
                <div className="flex items-center space-x-2 rtl:space-x-reverse text-xs text-muted-foreground">
                  <span>{getAppDisplayName(app)}</span>
                  <span>•</span>
                  <span>{formatTimestamp(datetime)}</span>
                  {object_type && (
                    <>
                      <span>•</span>
                      <span className="capitalize">{object_type}</span>
                    </>
                  )}
                </div>
              </div>

              {/* More Options */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 opacity-60 hover:opacity-100"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Icon name="MoreVertical" size={16} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {link && (
                    <>
                      <DropdownMenuItem 
                        onClick={() => window.open(link, '_blank')}
                        className="gap-2"
                      >
                        <Icon name="ExternalLink" size={14} />
                        {t('open_link', { defaultValue: 'Open Link' })}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuItem 
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete();
                    }}
                    disabled={isDeleting}
                    className="gap-2 text-destructive focus:text-destructive"
                  >
                    <Icon name="Trash2" size={14} />
                    {isDeleting 
                      ? t('deleting', { defaultValue: 'Deleting...' })
                      : t('delete', { defaultValue: 'Delete' })
                    }
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Expanded Content */}
            {(isExpanded || !message) && message && (
              <>
                <Separator className="my-3" />
                <div className="text-sm text-muted-foreground leading-relaxed">
                  {messageRich || message}
                </div>
              </>
            )}

            {/* Action Buttons */}
            {actions.length > 0 && (isExpanded || actions.length <= 2) && (
              <>
                <Separator className="my-3" />
                <div className="flex flex-wrap gap-2">
                  {actions.map((action, index) => (
                    <Button
                      key={index}
                      variant={action.primary ? "default" : "outline"}
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleActionClick(index, action);
                      }}
                      disabled={isExecutingAction}
                      className="gap-1"
                    >
                      {isExecutingAction ? (
                        <Icon name="Loader2" size={12} className="animate-spin" />
                      ) : action.type === 'DELETE' ? (
                        <Icon name="Trash2" size={12} />
                      ) : action.type === 'POST' ? (
                        <Icon name="Send" size={12} />
                      ) : (
                        <Icon name="ExternalLink" size={12} />
                      )}
                      {action.label}
                    </Button>
                  ))}
                </div>
              </>
            )}

            {/* Expand/Collapse Indicator */}
            {(message || actions.length > 2) && (
              <div className="flex justify-center mt-3">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsExpanded(!isExpanded);
                  }}
                  className="gap-1 text-xs h-6 px-2"
                >
                  <Icon 
                    name={isExpanded ? "ChevronUp" : "ChevronDown"} 
                    size={12} 
                  />
                  {isExpanded 
                    ? t('show_less', { defaultValue: 'Show Less' })
                    : t('show_more', { defaultValue: 'Show More' })
                  }
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationCard;
