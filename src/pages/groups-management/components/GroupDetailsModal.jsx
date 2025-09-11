import React from 'react';
import { useTranslation } from 'react-i18next';
import { useGroupDetails } from '@/hooks/api';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import Icon from '@/components/AppIcon';

/**
 * Group Details Modal Component
 * Shows comprehensive group information fetched on-demand
 */
const GroupDetailsModal = ({ isOpen, onClose, groupId }) => {
  const { t } = useTranslation('groups-management');
  
  // Fetch group details only when modal is open and groupId is provided
  const { 
    data: groupData, 
    isLoading, 
    error, 
    refetch 
  } = useGroupDetails(groupId, { 
    enabled: isOpen && !!groupId 
  });

  const group = groupData?.group;

  const getMemberIcon = (memberType) => {
    switch (memberType) {
      case 'admin':
        return 'Crown';
      case 'subadmin':
        return 'Shield';
      default:
        return 'User';
    }
  };

  const getMemberBadgeVariant = (memberType) => {
    switch (memberType) {
      case 'admin':
        return 'default';
      case 'subadmin':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg rtl:[&>button]:left-4 rtl:[&>button]:right-auto rtl:[&>button]:top-4">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <Icon name="Users" size={16} />
              <div>
                <DialogTitle className="text-left rtl:text-right">
                  {group ? (group.displayName || group.id) : t('details_modal.loading_title', { defaultValue: 'Loading group...' })}
                </DialogTitle>
                {group && (
                  <DialogDescription className="text-left rtl:text-right mt-0">
                    {group.displayName !== group.id && (
                      <span>ID: {group.id} • </span>
                    )}
                    {group.memberCount || 0} {t('details_modal.members_count', { defaultValue: 'members' })}
                  </DialogDescription>
                )}
              </div>
            </div>
            {group && (
              <div className="flex gap-1 mt-5">
                <Badge variant="default" className="text-xs">
                  <Icon name="CheckCircle" size={10} className="mr-1 rtl:ml-1 rtl:mr-0" />
                  {t('details_modal.status_active', { defaultValue: 'Active' })}
                </Badge>
                {group.memberCount === 0 && (
                  <Badge variant="outline" className="text-xs border-orange-200 text-orange-700">
                    <Icon name="UserX" size={10} className="mr-1 rtl:ml-1 rtl:mr-0" />
                    {t('details_modal.empty', { defaultValue: 'Empty' })}
                  </Badge>
                )}
              </div>
            )}
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          <div className="space-y-3">
            {/* Loading State */}
            {isLoading && (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-8 w-8 rounded" />
                  <div className="space-y-1">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="space-y-1">
                      <Skeleton className="h-2 w-12" />
                      <Skeleton className="h-3 w-full" />
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
                  <span>{t('details_modal.error_loading', { defaultValue: 'Error loading group details' })}: {error.message}</span>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => refetch()}
                    className="ml-2 rtl:mr-2 rtl:ml-0 gap-1 rtl:flex-row-reverse"
                  >
                    <Icon name="RefreshCw" size={12} />
                    {t('details_modal.retry', { defaultValue: 'Retry' })}
                  </Button>
                </AlertDescription>
              </Alert>
            )}

             {/* Group Details Content */}
             {group && (
               <>
                 {/* Basic Information */}
                <Card className="rtl:text-right">
                  <CardHeader className="pb-1">
                    <CardTitle className="text-sm flex items-center gap-2 rtl:flex-row-reverse rtl:text-right">
                      <Icon name="Info" size={14} />
                      {t('details_modal.basic_info', { defaultValue: 'Basic Information' })}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-2 space-y-2">
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <p className="text-muted-foreground mb-0.5">
                          {t('details_modal.group_id', { defaultValue: 'Group ID' })}
                        </p>
                        <p className="font-mono text-sm">{group.id}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-0.5">
                          {t('details_modal.display_name', { defaultValue: 'Display Name' })}
                        </p>
                        <p className="font-medium text-sm">{group.displayName || group.id}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-0.5">
                          {t('details_modal.member_count', { defaultValue: 'Members' })}
                        </p>
                        <p className="font-medium text-sm">{group.memberCount || 0}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-0.5">
                          {t('details_modal.status', { defaultValue: 'Status' })}
                        </p>
                        <p className="font-medium text-sm text-success">
                          {t('details_modal.status_active', { defaultValue: 'Active' })}
                        </p>
                      </div>
                    </div>
                    
                    {group.createdAt && (
                      <div className="pt-2 border-t">
                        <p className="text-muted-foreground text-xs mb-1">
                          {t('details_modal.created_at', { defaultValue: 'Created' })}
                        </p>
                        <p className="text-sm">
                          {new Date(group.createdAt).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Members */}
                <Card className="rtl:text-right">
                  <CardHeader className="pb-1">
                    <CardTitle className="text-sm flex items-center gap-2 rtl:flex-row-reverse rtl:text-right">
                      <Icon name="Users" size={14} />
                      {t('details_modal.members', { defaultValue: 'Members' })} 
                      ({group.memberCount || 0})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-2">
                    {group.members && group.members.length > 0 ? (
                      <div className="space-y-2">
                        {group.members.map((member) => (
                          <div key={member.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                            <div className="flex items-center space-x-2">
                              <Avatar className="w-6 h-6">
                                <AvatarFallback className="text-xs">
                                  {member.displayName?.charAt(0).toUpperCase() || member.id?.charAt(0).toUpperCase() || 'U'}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-sm font-medium">
                                  {member.displayName || member.id}
                                </p>
                                {member.displayName && member.displayName !== member.id && (
                                  <p className="text-xs text-muted-foreground">
                                    {member.id}
                                  </p>
                                )}
                              </div>
                            </div>
                            <Badge 
                              variant={getMemberBadgeVariant(member.type)} 
                              className="text-xs h-5 px-2"
                            >
                              <Icon name={getMemberIcon(member.type)} size={8} className="mr-1 rtl:ml-1 rtl:mr-0" />
                              {member.type === 'admin' 
                                ? t('details_modal.admin', { defaultValue: 'Admin' })
                                : member.type === 'subadmin'
                                ? t('details_modal.subadmin', { defaultValue: 'Subadmin' })
                                : t('details_modal.member', { defaultValue: 'Member' })
                              }
                            </Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <Icon name="UserX" size={24} className="mx-auto text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">
                          {t('details_modal.no_members', { defaultValue: 'This group has no members yet' })}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {t('details_modal.add_members_hint', { defaultValue: 'Add users to this group to get started' })}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Subadmins (if available) */}
                {group.subadmins && group.subadmins.length > 0 && (
                  <Card className="rtl:text-right">
                    <CardHeader className="pb-1">
                      <CardTitle className="text-sm flex items-center gap-2 rtl:flex-row-reverse rtl:text-right">
                        <Icon name="Shield" size={14} />
                        {t('details_modal.subadmins', { defaultValue: 'Subadmins' })} 
                        ({group.subadmins.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-2">
                      <div className="flex flex-wrap gap-1">
                        {group.subadmins.map((subadmin) => (
                          <Badge key={subadmin.id} variant="secondary" className="text-xs h-5 px-2">
                            <Icon name="Shield" size={8} className="mr-1 rtl:ml-1 rtl:mr-0" />
                            {subadmin.displayName || subadmin.id}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </div>
        </ScrollArea>

        <DialogFooter className="pt-1 rtl:flex-row-reverse rtl:justify-end">
          <Button variant="outline" onClick={onClose} size="sm" className="w-full">
            {t('details_modal.close', { defaultValue: 'Close' })}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default GroupDetailsModal;
