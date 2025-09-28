import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { 
  useDataRoomDetails, 
  useAvailableGroups, 
  useAddGroupToDataRoom, 
  useRemoveGroupFromDataRoom,
  useSetGroupPermissions 
} from '@/hooks/api';
import { usePermissions } from '@/hooks/api/useAuth';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
 * Manage Data Room Groups Modal Component
 * Allows adding/removing groups and setting permissions for existing data rooms
 */
const ManageDataRoomGroupsModal = ({ isOpen, onClose, roomId }) => {
  const { t } = useTranslation('data-rooms-management');
  
  // Get user permissions to filter available groups
  const { isAdmin, isSubadmin, managedGroups, canManageAllGroups } = usePermissions();
  
  // Get data room details
  const { 
    data: room, 
    isLoading: isLoadingRoom,
    error: roomError 
  } = useDataRoomDetails(roomId, { 
    enabled: isOpen && !!roomId 
  });

  // Get available groups
  const { 
    data: groupsData, 
    isLoading: isLoadingGroups,
    error: groupsError 
  } = useAvailableGroups({ 
    enabled: isOpen 
  });
  
  // Filter groups based on user permissions
  const allGroups = groupsData?.groups?.filter(group => group.id !== 'admin') || [];
  
  // Subadmins can only manage groups they are assigned to
  const availableGroups = isAdmin || canManageAllGroups 
    ? allGroups 
    : allGroups.filter(group => 
        Array.isArray(managedGroups) ? managedGroups.includes(group.id) : false
      );
      
  const currentGroups = room?.groupsList || [];

  // Mutations
  const addGroupMutation = useAddGroupToDataRoom({
    onSuccess: (data, variables) => {
      toast.success(t('manage_groups.add_success', { 
        defaultValue: 'Group added successfully',
        groupName: variables.groupId 
      }));
    },
    onError: (error) => {
      toast.error(t('manage_groups.add_error', { defaultValue: 'Failed to add group' }), {
        description: error.message,
      });
    }
  });

  const removeGroupMutation = useRemoveGroupFromDataRoom({
    onSuccess: (data, variables) => {
      toast.success(t('manage_groups.remove_success', { 
        defaultValue: 'Group removed successfully',
        groupName: variables.groupId 
      }));
    },
    onError: (error) => {
      toast.error(t('manage_groups.remove_error', { defaultValue: 'Failed to remove group' }), {
        description: error.message,
      });
    }
  });

  const updatePermissionsMutation = useSetGroupPermissions({
    onSuccess: (data, variables) => {
      toast.success(t('manage_groups.permissions_success', { 
        defaultValue: 'Permissions updated successfully',
        groupName: variables.groupId 
      }));
    },
    onError: (error) => {
      toast.error(t('manage_groups.permissions_error', { defaultValue: 'Failed to update permissions' }), {
        description: error.message,
      });
    }
  });

  const handleGroupToggle = (groupId) => {
    const isCurrentlyAssigned = currentGroups.includes(groupId);
    
    if (isCurrentlyAssigned) {
      // Remove group
      removeGroupMutation.mutate({ roomId, groupId });
    } else {
      // Add group with default permissions (31 = full permissions)
      addGroupMutation.mutate({ roomId, groupId, permissions: 31 });
    }
  };

  const handlePermissionChange = (groupId, permissions) => {
    updatePermissionsMutation.mutate({ roomId, groupId, permissions: parseInt(permissions) });
  };

  const handleClose = () => {
    onClose();
  };

  const handleModalClose = () => {
    // Prevent closing if any mutation is in progress
    const isAnyMutationPending = addGroupMutation.isPending || 
                                 removeGroupMutation.isPending || 
                                 updatePermissionsMutation.isPending;
    
    if (!isAnyMutationPending) {
      handleClose();
    }
  };

  const getPermissionLabel = (permissionValue) => {
    switch (permissionValue) {
      case 1: return t('permissions.read_only', { defaultValue: 'Read Only' });
      case 15: return t('permissions.read_write', { defaultValue: 'Read & Write' });
      case 31: return t('permissions.full_access', { defaultValue: 'Full Access' });
      default: return t('permissions.custom', { defaultValue: 'Custom' });
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleModalClose}>
      <DialogContent className="max-w-2xl rtl:[&>button]:left-4 rtl:[&>button]:right-auto rtl:[&>button]:top-4">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-left rtl:text-right">
            <Icon name="Users" size={16} />
            {isLoadingRoom ? 
              t('manage_groups.loading_title', { defaultValue: 'Loading...' }) :
              t('manage_groups.title', { 
                defaultValue: 'Manage Groups - {{roomName}}',
                roomName: room?.roomName || room?.mountPoint 
              })
            }
          </DialogTitle>
          <DialogDescription className="text-left rtl:text-right">
            {isLoadingRoom ? 
              t('manage_groups.loading_description', { defaultValue: 'Loading data room information...' }) :
              t('manage_groups.description', { 
                defaultValue: 'Add or remove groups and set their permissions for this data room. Changes take effect immediately.' 
              })
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Loading State */}
          {(isLoadingRoom || isLoadingGroups) && (
            <div className="space-y-4">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          )}

          {/* Error States */}
          {(roomError || groupsError) && (
            <Alert variant="destructive">
              <Icon name="AlertCircle" size={16} />
              <AlertDescription>
                {roomError?.message || groupsError?.message || t('manage_groups.error_loading', { defaultValue: 'Failed to load data' })}
              </AlertDescription>
            </Alert>
          )}

          {/* Content */}
          {!isLoadingRoom && !isLoadingGroups && !roomError && !groupsError && room && (
            <>
              {/* Information for subadmins about limited group access */}
              {(isSubadmin && !isAdmin) && (
                <Alert className="mb-4">
                  <Icon name="Info" size={14} />
                  <AlertDescription className="text-sm">
                    As a Company Administrator, you can only manage groups for the companies you manage: {Array.isArray(managedGroups) ? managedGroups.join(', ') : 'None'}.
                  </AlertDescription>
                </Alert>
              )}

              {/* Current Groups */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Icon name="Shield" size={14} />
                    {t('manage_groups.current_groups', { defaultValue: 'Current Groups' })}
                  </CardTitle>
                  <CardDescription>
                    {t('manage_groups.current_groups_hint', { defaultValue: 'Groups currently with access to this data room' })}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-1">
                  {currentGroups.length > 0 ? (
                    <div className="space-y-3">
                      {currentGroups.map((groupId) => {
                        const group = availableGroups.find(g => g.id === groupId);
                        return (
                          <div key={groupId} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center space-x-3 rtl:space-x-reverse">
                              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                                <Icon name="Users" size={14} className="text-primary" />
                              </div>
                              <div>
                                <p className="text-sm font-medium">{group?.displayName || groupId}</p>
                                <p className="text-xs text-muted-foreground">
                                  {group?.memberCount ? `${group.memberCount} members` : 'Group members'}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2 rtl:space-x-reverse">
                              <Select 
                                value="31" 
                                onValueChange={(value) => handlePermissionChange(groupId, value)}
                                disabled={updatePermissionsMutation.isPending}
                              >
                                <SelectTrigger className="w-32 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="1">{getPermissionLabel(1)}</SelectItem>
                                  <SelectItem value="15">{getPermissionLabel(15)}</SelectItem>
                                  <SelectItem value="31">{getPermissionLabel(31)}</SelectItem>
                                </SelectContent>
                              </Select>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleGroupToggle(groupId)}
                                disabled={removeGroupMutation.isPending}
                                className="gap-1"
                              >
                                {removeGroupMutation.isPending ? (
                                  <Icon name="Loader2" size={12} className="animate-spin" />
                                ) : (
                                  <Icon name="X" size={12} />
                                )}
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <Icon name="Users" size={24} className="mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">
                        {t('manage_groups.no_groups', { defaultValue: 'No groups have access to this data room' })}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Separator />

              {/* Available Groups */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Icon name="Plus" size={14} />
                    {t('manage_groups.add_groups', { defaultValue: 'Add Groups' })}
                  </CardTitle>
                  <CardDescription>
                    {t('manage_groups.add_groups_hint', { defaultValue: 'Select groups to give access to this data room' })}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-1">
                  {availableGroups.length > 0 ? (
                    <ScrollArea className="h-48">
                      <div className="space-y-2">
                        {availableGroups.map((group) => {
                          const isAssigned = currentGroups.includes(group.id);
                          return (
                            <div key={group.id} className="flex items-center space-x-2 rtl:space-x-reverse">
                              <Checkbox
                                id={group.id}
                                checked={isAssigned}
                                onCheckedChange={() => handleGroupToggle(group.id)}
                                disabled={addGroupMutation.isPending || removeGroupMutation.isPending}
                              />
                              <Label htmlFor={group.id} className="text-sm cursor-pointer flex-1 flex items-center justify-between">
                                <span>{group.displayName || group.id}</span>
                                {isAssigned && (
                                  <Badge variant="secondary" className="text-xs">
                                    {t('manage_groups.assigned', { defaultValue: 'Assigned' })}
                                  </Badge>
                                )}
                              </Label>
                            </div>
                          );
                        })}
                      </div>
                    </ScrollArea>
                  ) : (
                    <div className="text-center py-6">
                      <Icon name="Users" size={24} className="mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground mb-3">
                        {t('manage_groups.no_available_groups', { defaultValue: 'No groups available' })}
                      </p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="gap-2"
                        onClick={() => {
                          window.open('/groups-management', '_blank');
                        }}
                      >
                        <Icon name="Plus" size={14} />
                        {t('manage_groups.create_groups', { defaultValue: 'Create Groups' })}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </div>

        <DialogFooter className="pt-4 rtl:flex-row-reverse rtl:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={handleModalClose}
            disabled={addGroupMutation.isPending || removeGroupMutation.isPending || updatePermissionsMutation.isPending}
            size="sm"
            className="w-full"
          >
            {t('manage_groups.close', { defaultValue: 'Close' })}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ManageDataRoomGroupsModal;
