import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useGroupDetails, useUsers, useAddUserToGroup, useRemoveUserFromGroup } from '@/hooks/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import Icon from '@/components/AppIcon';

/**
 * Manage Group Members Modal Component
 * Allows adding/removing users from a group
 */
const ManageGroupMembersModal = ({ isOpen, onClose, groupId }) => {
  const { t } = useTranslation('groups-management');
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch group details to get current members
  const { 
    data: groupData, 
    isLoading: isLoadingGroup,
    error: groupError,
    refetch: refetchGroup
  } = useGroupDetails(groupId, { 
    enabled: isOpen && !!groupId 
  });

  // Fetch available users for adding
  const { 
    data: usersData, 
    isLoading: isLoadingUsers 
  } = useUsers({ 
    search: searchTerm,
    enabled: isOpen 
  });

  const group = groupData?.group;
  const availableUsers = usersData?.users || [];
  
  // Filter out current members from available users
  const currentMemberIds = group?.members?.map(m => m.id) || [];
  const nonMembers = availableUsers.filter(user => 
    !currentMemberIds.includes(user.id)
  );

  // Mutations for adding/removing users
  const addUserMutation = useAddUserToGroup({
    onSuccess: (data, variables) => {
      toast.success(t('manage_members.user_added_success', { 
        defaultValue: 'User added to group successfully!',
        userName: variables.userId,
        groupName: group?.displayName || group?.id
      }));
      refetchGroup(); // Refresh group data to show updated members
    },
    onError: (error) => {
      toast.error(t('manage_members.user_added_error', { 
        defaultValue: 'Failed to add user to group' 
      }), {
        description: error.message,
      });
    }
  });

  const removeUserMutation = useRemoveUserFromGroup({
    onSuccess: (data, variables) => {
      toast.success(t('manage_members.user_removed_success', { 
        defaultValue: 'User removed from group successfully!',
        userName: variables.userId,
        groupName: group?.displayName || group?.id
      }));
      refetchGroup(); // Refresh group data to show updated members
    },
    onError: (error) => {
      toast.error(t('manage_members.user_removed_error', { 
        defaultValue: 'Failed to remove user from group' 
      }), {
        description: error.message,
      });
    }
  });

  const handleAddUser = (userId) => {
    if (!groupId || !userId) return;
    addUserMutation.mutate({ userId, groupId });
  };

  const handleRemoveUser = (userId) => {
    if (!groupId || !userId) return;
    removeUserMutation.mutate({ userId, groupId });
  };

  const isOperationPending = addUserMutation.isPending || removeUserMutation.isPending;

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
      <DialogContent className="max-w-4xl max-h-[80vh] rtl:[&>button]:left-4 rtl:[&>button]:right-auto rtl:[&>button]:top-4">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-left rtl:text-right">
            <Icon name="Users" size={16} />
            {group ? 
              t('manage_members.title', { 
                defaultValue: 'Manage Members - {{groupName}}',
                groupName: group.displayName || group.id 
              }) : 
              t('manage_members.loading_title', { defaultValue: 'Loading group...' })
            }
          </DialogTitle>
          <DialogDescription className="text-left rtl:text-right">
            {group ?
              t('manage_members.description', { 
                defaultValue: 'Add or remove users from this group. Changes take effect immediately.'
              }) :
              t('manage_members.loading_description', { defaultValue: 'Loading group information...' })
            }
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col lg:flex-row gap-6 min-h-[500px]">
          {/* Loading State */}
          {isLoadingGroup && (
            <div className="space-y-4 w-full">
              <Skeleton className="h-6 w-48" />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-32 w-full" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Error State */}
          {groupError && (
            <Alert variant="destructive" className="w-full">
              <Icon name="AlertCircle" size={16} />
              <AlertDescription>
                {t('manage_members.error_loading', { defaultValue: 'Failed to load group details' })}: {groupError.message}
              </AlertDescription>
            </Alert>
          )}

          {/* Main Content */}
          {group && (
            <>
              {/* Current Members Section */}
              <div className="flex-1">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Icon name="Users" size={14} />
                      {t('manage_members.current_members', { defaultValue: 'Current Members' })} 
                      ({group.memberCount || 0})
                    </CardTitle>
                    <CardDescription>
                      {t('manage_members.current_members_hint', { 
                        defaultValue: 'Users who are currently members of this group' 
                      })}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[400px]">
                      {group.members && group.members.length > 0 ? (
                        <div className="space-y-2">
                          {group.members.map((member) => (
                            <div key={member.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                              <div className="flex items-center space-x-3">
                                <Avatar className="w-8 h-8">
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
                              <div className="flex items-center gap-2">
                                <Badge 
                                  variant={getMemberBadgeVariant(member.type)} 
                                  className="text-xs h-6 px-2"
                                >
                                  <Icon name={getMemberIcon(member.type)} size={8} className="mr-1" />
                                  {member.type === 'admin' 
                                    ? t('manage_members.admin', { defaultValue: 'Admin' })
                                    : member.type === 'subadmin'
                                    ? t('manage_members.subadmin', { defaultValue: 'Subadmin' })
                                    : t('manage_members.member', { defaultValue: 'Member' })
                                  }
                                </Badge>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleRemoveUser(member.id)}
                                  disabled={isOperationPending}
                                  className="h-8 px-2 text-destructive hover:text-destructive"
                                >
                                  <Icon name="UserMinus" size={12} />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <Icon name="UserX" size={32} className="mx-auto text-muted-foreground mb-3" />
                          <p className="text-sm text-muted-foreground">
                            {t('manage_members.no_members', { defaultValue: 'This group has no members yet' })}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {t('manage_members.add_members_hint', { defaultValue: 'Add users from the panel on the right' })}
                          </p>
                        </div>
                      )}
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>

              <Separator orientation="vertical" className="hidden lg:block" />
              <Separator className="lg:hidden" />

              {/* Add Members Section */}
              <div className="flex-1">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Icon name="UserPlus" size={14} />
                      {t('manage_members.add_members', { defaultValue: 'Add Members' })}
                    </CardTitle>
                    <CardDescription>
                      {t('manage_members.add_members_hint', { 
                        defaultValue: 'Search for users to add to this group' 
                      })}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Search Input */}
                      <div>
                        <Label htmlFor="userSearch" className="text-sm font-medium mb-2">
                          {t('manage_members.search_users', { defaultValue: 'Search Users' })}
                        </Label>
                        <div className="relative">
                          <Icon name="Search" size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                          <Input
                            id="userSearch"
                            placeholder={t('manage_members.search_placeholder', { 
                              defaultValue: 'Type username or display name...' 
                            })}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                          />
                        </div>
                      </div>

                      {/* Available Users List */}
                      <ScrollArea className="h-[320px]">
                        {isLoadingUsers ? (
                          <div className="space-y-2">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <div key={i} className="flex items-center justify-between p-3">
                                <div className="flex items-center space-x-3">
                                  <Skeleton className="w-8 h-8 rounded-full" />
                                  <div>
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-3 w-16 mt-1" />
                                  </div>
                                </div>
                                <Skeleton className="h-8 w-16" />
                              </div>
                            ))}
                          </div>
                        ) : nonMembers.length > 0 ? (
                          <div className="space-y-2">
                            {nonMembers.map((user) => (
                              <div key={user.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/30 transition-colors">
                                <div className="flex items-center space-x-3">
                                  <Avatar className="w-8 h-8">
                                    <AvatarFallback className="text-xs">
                                      {user.displayname?.charAt(0).toUpperCase() || user.id?.charAt(0).toUpperCase() || 'U'}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="text-sm font-medium">
                                      {user.displayname || user.id}
                                    </p>
                                    {user.displayname && user.displayname !== user.id && (
                                      <p className="text-xs text-muted-foreground">
                                        {user.id}
                                      </p>
                                    )}
                                  </div>
                                </div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleAddUser(user.id)}
                                  disabled={isOperationPending}
                                  className="h-8 px-2 text-success hover:text-success"
                                >
                                  <Icon name="UserPlus" size={12} />
                                </Button>
                              </div>
                            ))}
                          </div>
                        ) : searchTerm ? (
                          <div className="text-center py-8">
                            <Icon name="Search" size={32} className="mx-auto text-muted-foreground mb-3" />
                            <p className="text-sm text-muted-foreground">
                              {t('manage_members.no_search_results', { 
                                defaultValue: 'No users found matching "{{searchTerm}}"',
                                searchTerm 
                              })}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {t('manage_members.try_different_search', { 
                                defaultValue: 'Try a different search term' 
                              })}
                            </p>
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <Icon name="Users" size={32} className="mx-auto text-muted-foreground mb-3" />
                            <p className="text-sm text-muted-foreground">
                              {t('manage_members.start_searching', { 
                                defaultValue: 'Start typing to search for users' 
                              })}
                            </p>
                          </div>
                        )}
                      </ScrollArea>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </div>

        <DialogFooter className="rtl:flex-row-reverse">
          <Button variant="outline" onClick={onClose}>
            {t('manage_members.close', { defaultValue: 'Close' })}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ManageGroupMembersModal;
