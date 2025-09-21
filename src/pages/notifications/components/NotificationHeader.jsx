import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import Icon from '@/components/AppIcon';

const NotificationHeader = ({
  stats,
  searchQuery,
  onSearchChange,
  selectedCount,
  totalCount,
  onSelectAll,
  onDeleteSelected,
  onClearAll,
  onRefresh,
  isLoading
}) => {
  const { t } = useTranslation('notifications');

  const isAllSelected = selectedCount === totalCount && totalCount > 0;
  const isIndeterminate = selectedCount > 0 && selectedCount < totalCount;

  return (
    <div className="space-y-4">
      {/* Page Title and Stats */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div className="mb-4 lg:mb-0">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <h1 className="text-3xl font-bold text-foreground">
              {t('notifications', { defaultValue: 'Notifications' })}
            </h1>
            {stats.total > 0 && (
              <Badge variant="secondary" className="text-sm">
                {stats.total}
              </Badge>
            )}
            {stats.unread > 0 && (
              <Badge variant="default" className="text-sm">
                {stats.unread} {t('unread', { defaultValue: 'unread' })}
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground mt-1">
            {t('notifications_description', { 
              defaultValue: 'Manage your system notifications and stay up to date' 
            })}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <Button
            variant="outline"
            onClick={onRefresh}
            disabled={isLoading}
            className="gap-2"
          >
            <Icon name="RefreshCw" size={14} className={isLoading ? "animate-spin" : ""} />
            {t('refresh', { defaultValue: 'Refresh' })}
          </Button>

          {stats.total > 0 && (
            <Button
              variant="outline"
              onClick={onClearAll}
              disabled={isLoading}
              className="gap-2 text-destructive hover:text-destructive"
            >
              <Icon name="Trash2" size={14} />
              {t('clear_all', { defaultValue: 'Clear All' })}
            </Button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Icon name="Filter" size={14} />
                {t('filter', { defaultValue: 'Filter' })}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem disabled>
                <Icon name="Bell" size={14} className="mr-2" />
                {t('all_notifications', { defaultValue: 'All Notifications' })}
              </DropdownMenuItem>
              <DropdownMenuItem disabled>
                <Icon name="AlertCircle" size={14} className="mr-2" />
                {t('unread_only', { defaultValue: 'Unread Only' })}
              </DropdownMenuItem>
              <DropdownMenuItem disabled>
                <Icon name="Zap" size={14} className="mr-2" />
                {t('action_required', { defaultValue: 'Action Required' })}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem disabled>
                <Icon name="Calendar" size={14} className="mr-2" />
                {t('today', { defaultValue: 'Today' })}
              </DropdownMenuItem>
              <DropdownMenuItem disabled>
                <Icon name="Clock" size={14} className="mr-2" />
                {t('last_7_days', { defaultValue: 'Last 7 Days' })}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Search and Bulk Actions */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Icon 
            name="Search" 
            size={20} 
            className="absolute left-3 rtl:right-3 rtl:left-auto top-1/2 transform -translate-y-1/2 text-muted-foreground" 
          />
          <Input
            type="text"
            placeholder={t('search_notifications', { defaultValue: 'Search notifications...' })}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 rtl:pr-10 rtl:pl-3"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 rtl:left-2 rtl:right-auto top-1/2 transform -translate-y-1/2 h-6 w-6"
              onClick={() => onSearchChange('')}
            >
              <Icon name="X" size={14} />
            </Button>
          )}
        </div>

        {/* Bulk Selection and Actions */}
        {totalCount > 0 && (
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <Checkbox
                checked={isAllSelected}
                indeterminate={isIndeterminate}
                onCheckedChange={onSelectAll}
              />
              <span className="text-sm text-muted-foreground">
                {selectedCount > 0 ? (
                  t('selected_count', { 
                    defaultValue: '{{count}} selected',
                    count: selectedCount 
                  })
                ) : (
                  t('select_all', { defaultValue: 'Select all' })
                )}
              </span>
            </div>

            {selectedCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={onDeleteSelected}
                disabled={isLoading}
                className="gap-1 text-destructive hover:text-destructive"
              >
                <Icon name="Trash2" size={12} />
                {t('delete_selected', { defaultValue: 'Delete' })}
              </Button>
            )}
          </div>
        )}
      </div>

      {/* App Summary */}
      {Object.keys(stats.byApp).length > 0 && (
        <div className="flex flex-wrap gap-2">
          {Object.entries(stats.byApp).map(([app, count]) => (
            <Badge key={app} variant="outline" className="text-xs">
              {app.charAt(0).toUpperCase() + app.slice(1)}: {count}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationHeader;
