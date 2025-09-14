import React from 'react';
import { useTranslation } from 'react-i18next';
import { useUserDetails } from '@/hooks/api';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/AppIcon';

/**
 * User Details Modal Component
 * Shows comprehensive user information fetched on-demand
 */
const UserDetailsModal = ({ isOpen, onClose, userId }) => {
  const { t } = useTranslation('users-management');
  
  // Fetch user details only when modal is open and userId is provided
  const { 
    data: user, 
    isLoading, 
    error, 
    refetch 
  } = useUserDetails(userId, { 
    enabled: isOpen && !!userId 
  });

  // Helper function to get user initials
  const getUserInitials = (userData) => {
    if (!userData) return '?';
    const name = userData.displayname || userData.username || '';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // Helper function to format storage size
  const formatStorageSize = (bytes) => {
    if (!bytes || bytes < 0) return 'Unlimited';
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${Math.round(bytes / Math.pow(1024, i) * 10) / 10} ${sizes[i]}`;
  };

  // Helper function to format date
  const formatDate = (timestamp) => {
    if (!timestamp) return '-';
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center gap-2">
            <Icon name="User" size={18} />
            {user ? t('modal.user_details_title', { username: user.username }) : t('modal.loading_user_details')}
          </DialogTitle>
          <DialogDescription className="text-sm">
            {user ? t('modal.user_details_description') : t('modal.loading_description')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Loading State */}
          {isLoading && (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-1">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="space-y-1">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <Alert variant="destructive">
              <Icon name="AlertCircle" size={16} />
              <AlertDescription className="flex items-center justify-between">
                <span>{t('modal.error_loading')}: {error.message}</span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => refetch()}
                  className="ml-4 gap-1"
                >
                  <Icon name="RefreshCw" size={14} />
                  {t('modal.retry')}
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* User Details Content */}
          {user && (
            <>
              {/* Profile Header */}
              <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-primary/10 text-primary font-medium">
                    {getUserInitials(user)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold">{user.displayname}</h3>
                  <p className="text-muted-foreground text-sm">@{user.username}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge 
                      variant={user.enabled ? "default" : "secondary"}
                      className={user.enabled ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" : ""}
                    >
                      <Icon 
                        name={user.enabled ? "CheckCircle" : "XCircle"} 
                        size={10} 
                        className="mr-1" 
                      />
                      {user.enabled ? t('modal.enabled') : t('modal.disabled')}
                    </Badge>
                    {user.isAdmin && (
                      <Badge variant="outline" className="border-amber-200 text-amber-800 bg-amber-50 dark:border-amber-800 dark:text-amber-300 dark:bg-amber-950">
                        <Icon name="Shield" size={10} className="mr-1" />
                        Admin
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Basic Information & Groups */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Icon name="User" size={14} />
                    {t('modal.basic_info')} & {t('modal.groups')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">{t('modal.email')}</label>
                      <p className="text-sm">{user.email || '-'}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">{t('modal.language')}</label>
                      <p className="text-sm">{user.language || '-'}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">{t('modal.backend')}</label>
                      <p className="text-sm">{user.backend || '-'}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">{t('modal.last_login')}</label>
                      <p className="text-sm">{formatDate(user.lastLogin)}</p>
                    </div>
                  </div>
                  <div className="pt-2 border-t">
                    <label className="text-xs font-medium text-muted-foreground block mb-2">{t('modal.groups')}</label>
                    <div className="flex flex-wrap gap-1">
                      {user.groups && user.groups.length > 0 ? (
                        user.groups.map((group) => (
                          <Badge key={group} variant="outline" className="text-xs py-0 px-2">
                            {group}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-muted-foreground text-xs">No groups assigned</span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Storage Information */}
              {user.quota && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Icon name="HardDrive" size={14} />
                      {t('modal.storage_info')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                      <div>
                        <label className="text-xs font-medium text-muted-foreground">{t('modal.used_space')}</label>
                        <p className="text-sm">{formatStorageSize(user.quota.used)}</p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground">{t('modal.available_space')}</label>
                        <p className="text-sm">{formatStorageSize(user.quota.free)}</p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground">{t('modal.total_quota')}</label>
                        <p className="text-sm">{formatStorageSize(user.quota.total)}</p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground">{t('modal.quota_usage')}</label>
                        <p className="text-sm">{user.quota.relative ? `${user.quota.relative}%` : '0%'}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Contact Information */}
              {(user.phone || user.address || user.website || user.organisation) && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Icon name="Phone" size={14} />
                      {t('modal.contact_info')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                      {user.phone && (
                        <div>
                          <label className="text-xs font-medium text-muted-foreground">{t('modal.phone')}</label>
                          <p className="text-sm">{user.phone}</p>
                        </div>
                      )}
                      {user.address && (
                        <div>
                          <label className="text-xs font-medium text-muted-foreground">{t('modal.address')}</label>
                          <p className="text-sm">{user.address}</p>
                        </div>
                      )}
                      {user.website && (
                        <div>
                          <label className="text-xs font-medium text-muted-foreground">{t('modal.website')}</label>
                          <p className="text-sm">{user.website}</p>
                        </div>
                      )}
                      {user.organisation && (
                        <div>
                          <label className="text-xs font-medium text-muted-foreground">{t('modal.organisation')}</label>
                          <p className="text-sm">{user.organisation}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end pt-3">
          <Button variant="outline" onClick={onClose} size="sm">
            {t('modal.close')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserDetailsModal;
