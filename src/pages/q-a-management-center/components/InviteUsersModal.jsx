import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useUsers, useAddParticipant, useParticipants } from '@/hooks/api';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
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
 * Invite Users Modal Component
 * Invites users to an existing Talk room using the Nextcloud Talk API
 */
const InviteUsersModal = ({ isOpen, onClose, room, t }) => {
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [errors, setErrors] = useState({});
  const [isInviting, setIsInviting] = useState(false);

  // Fetch available users
  const { data: usersData, isLoading: isLoadingUsers } = useUsers({ enabled: isOpen });
  const availableUsers = usersData?.users || [];

  // Fetch current participants to filter them out
  const { data: participantsData } = useParticipants(room?.token, { 
    enabled: isOpen && !!room?.token 
  });
  const currentParticipants = participantsData?.participants || [];
  
  // Filter out current participants from available users - just like ManageGroupMembersModal
  // This prevents showing users who are already in the room for invitation
  const currentParticipantIds = currentParticipants.map(p => p.userId || p.actorId || p.id) || [];
  const nonParticipants = availableUsers.filter(user => 
    !currentParticipantIds.includes(user.id)
  );

  // Add participant mutation
  const addParticipantMutation = useAddParticipant({
    onSuccess: () => {
      // Success handled in handleSubmit
    },
    onError: (error, variables) => {
      console.error(`Failed to add participant ${variables.newParticipant}:`, error.message);
    }
  });

  const handleUserToggle = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
    // Clear errors when user makes selection
    if (errors.submit) {
      setErrors({});
    }
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === nonParticipants.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(nonParticipants.map(user => user.id));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (selectedUsers.length === 0) {
      newErrors.submit = t('invite_users_modal.errors.no_users_selected', { 
        defaultValue: 'Please select at least one user to invite' 
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm() || !room || selectedUsers.length === 0) return;

    setIsInviting(true);
    setErrors({});

    try {
      // Invite users sequentially to avoid overwhelming the API
      const invitePromises = selectedUsers.map(userId => 
        addParticipantMutation.mutateAsync({
          roomToken: room.token,
          newParticipant: userId
        }).catch(error => {
          // Handle individual failures
          console.warn(`Failed to invite ${userId}:`, error.message);
          return { error: error.message, userId };
        })
      );

      const results = await Promise.allSettled(invitePromises);
      
      const successful = results.filter(result => 
        result.status === 'fulfilled' && !result.value?.error
      ).length;
      
      const failed = selectedUsers.length - successful;

      // Show appropriate success/error messages
      if (successful > 0 && failed === 0) {
        toast.success(t('invite_users_modal.success_all', { 
          defaultValue: 'All users invited successfully!',
          count: successful 
        }), {
          description: t('invite_users_modal.success_all_description', { 
            defaultValue: `Successfully invited ${successful} users to "${room.displayName}".`,
            count: successful,
            roomName: room.displayName 
          }),
        });
        handleClose();
      } else if (successful > 0 && failed > 0) {
        toast.warning(t('invite_users_modal.success_partial', { 
          defaultValue: 'Some users were invited successfully',
          successful,
          failed 
        }), {
          description: t('invite_users_modal.success_partial_description', { 
            defaultValue: `${successful} users invited successfully, ${failed} failed.`,
            successful,
            failed 
          }),
        });
      } else {
        toast.error(t('invite_users_modal.error_all', { 
          defaultValue: 'Failed to invite users' 
        }), {
          description: t('invite_users_modal.error_all_description', { 
            defaultValue: 'None of the selected users could be invited. Please try again.',
          }),
        });
      }

      // Reset selection if all were successful
      if (failed === 0) {
        setSelectedUsers([]);
      }

    } catch (error) {
      console.error('Failed to invite users:', error.message);
      toast.error(t('invite_users_modal.error_title', { defaultValue: 'Failed to invite users' }), {
        description: error.message,
      });
      setErrors({ submit: error.message });
    } finally {
      setIsInviting(false);
    }
  };

  const handleClose = () => {
    if (!isInviting) {
      setSelectedUsers([]);
      setErrors({});
      onClose();
    }
  };

  if (!room) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col rtl:[&>button]:left-4 rtl:[&>button]:right-auto rtl:[&>button]:top-4">
        <DialogHeader className="pb-3 flex-shrink-0">
          <DialogTitle className="flex items-center gap-2 text-left rtl:text-right">
            <Icon name="UserPlus" size={16} />
            {t('invite_users_modal.title', { defaultValue: 'Invite Users' })}
          </DialogTitle>
          <DialogDescription className="text-sm text-left rtl:text-right">
            {t('invite_users_modal.description', { 
              defaultValue: 'Select users to invite to "{{roomName}}"',
              roomName: room.displayName 
            })}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col lg:flex-row gap-4 flex-1 overflow-hidden">
          {/* Current Participants Section */}
          <div className="flex-1 flex">
            <Card className="flex-1 flex flex-col">
              <CardHeader className="pb-3 flex-shrink-0">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Icon name="Users" size={14} />
                  {t('invite_users_modal.current_participants', { defaultValue: 'Current Participants' })} 
                  ({currentParticipants.length || 0})
                </CardTitle>
                <CardDescription className="text-xs">
                  {t('invite_users_modal.current_participants_hint', { 
                    defaultValue: 'Users who are currently in this room' 
                  })}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0 flex-1 overflow-hidden">
                <ScrollArea className="h-full max-h-[350px]">
                  {currentParticipants && currentParticipants.length > 0 ? (
                    <div className="space-y-2">
                      {currentParticipants.map((participant) => (
                        <div key={participant.userId || participant.actorId || participant.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                          <div className="flex items-center space-x-3">
                            <Avatar className="w-7 h-7">
                              <AvatarFallback className="text-xs">
                                {participant.displayName?.charAt(0).toUpperCase() || participant.userId?.charAt(0).toUpperCase() || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-xs font-medium">
                                {participant.displayName || participant.userId || participant.actorId}
                              </p>
                              {participant.displayName && participant.displayName !== participant.userId && (
                                <p className="text-xs text-muted-foreground">
                                  {participant.userId || participant.actorId}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Badge 
                              variant={participant.participantType === 1 ? 'default' : 'secondary'} 
                              className="text-xs h-5 px-2"
                            >
                              <Icon name={participant.participantType === 1 ? 'Crown' : 'User'} size={8} className="mr-1" />
                              {participant.participantType === 1 
                                ? t('invite_users_modal.moderator', { defaultValue: 'Moderator' })
                                : t('invite_users_modal.participant', { defaultValue: 'Participant' })
                              }
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <Icon name="UserX" size={24} className="mx-auto text-muted-foreground mb-2" />
                      <p className="text-xs text-muted-foreground">
                        {t('invite_users_modal.no_participants', { defaultValue: 'This room has no participants yet' })}
                      </p>
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          <Separator orientation="vertical" className="hidden lg:block" />
          <Separator className="lg:hidden" />

          {/* Invite Users Section */}
          <div className="flex-1 flex">
            <Card className="flex-1 flex flex-col">
              <CardHeader className="pb-3 flex-shrink-0">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Icon name="UserPlus" size={14} />
                  {t('invite_users_modal.invite_users', { defaultValue: 'Invite Users' })}
                </CardTitle>
                <CardDescription className="text-xs">
                  {t('invite_users_modal.invite_users_hint', { 
                    defaultValue: 'Select users to invite to this room' 
                  })}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0 flex-1 overflow-hidden">
                <div className="space-y-3 h-full flex flex-col">
                  {/* Select All Button */}
                  {nonParticipants.length > 0 && (
                    <div className="flex justify-between items-center flex-shrink-0">
                      <Label className="text-xs font-medium text-muted-foreground">
                        {t('invite_users_modal.available_users', { defaultValue: 'Available Users' })}
                      </Label>
                      <Button 
                        type="button"
                        variant="outline" 
                        size="sm"
                        onClick={handleSelectAll}
                        disabled={isInviting}
                        className="h-7 px-3 text-xs"
                      >
                        {selectedUsers.length === nonParticipants.length 
                          ? t('invite_users_modal.deselect_all', { defaultValue: 'Deselect All' })
                          : t('invite_users_modal.select_all', { defaultValue: 'Select All' })
                        }
                      </Button>
                    </div>
                  )}

                  {/* Available Users List */}
                  <ScrollArea className="flex-1 max-h-[300px]">
                    {isLoadingUsers ? (
                      <div className="space-y-2">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <div key={i} className="flex items-center justify-between p-2">
                            <div className="flex items-center space-x-3">
                              <Skeleton className="w-7 h-7 rounded-full" />
                              <div>
                                <Skeleton className="h-3 w-20" />
                                <Skeleton className="h-3 w-14 mt-1" />
                              </div>
                            </div>
                            <Skeleton className="h-3 w-3" />
                          </div>
                        ))}
                      </div>
                    ) : nonParticipants.length > 0 ? (
                      <div className="space-y-2">
                        {nonParticipants.map((user) => (
                          <div key={user.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/30 transition-colors">
                            <div className="flex items-center space-x-3">
                              <Avatar className="w-7 h-7">
                                <AvatarFallback className="text-xs">
                                  {user.displayname?.charAt(0).toUpperCase() || user.username?.charAt(0).toUpperCase() || user.id?.charAt(0).toUpperCase() || 'U'}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-xs font-medium">
                                  {user.displayname || user.username || user.id}
                                </p>
                                {user.displayname && user.displayname !== user.username && (
                                  <p className="text-xs text-muted-foreground">
                                    {user.username || user.id}
                                  </p>
                                )}
                              </div>
                            </div>
                            <Checkbox
                              checked={selectedUsers.includes(user.id)}
                              onCheckedChange={() => handleUserToggle(user.id)}
                              disabled={isInviting}
                              className="w-4 h-4"
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <Icon name="Users" size={24} className="mx-auto text-muted-foreground mb-2" />
                        <p className="text-xs text-muted-foreground">
                          {t('invite_users_modal.no_users_available', { defaultValue: 'No users available for invitation' })}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {t('invite_users_modal.all_users_in_room', { defaultValue: 'All users are already participants in this room' })}
                        </p>
                      </div>
                    )}
                  </ScrollArea>

                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Error Display */}
        {errors.submit && (
          <Alert variant="destructive">
            <Icon name="AlertCircle" size={16} />
            <AlertDescription>{errors.submit}</AlertDescription>
          </Alert>
        )}

        <DialogFooter className="pt-3 flex-shrink-0 rtl:flex-row-reverse">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isInviting}
            size="sm"
          >
            {t('invite_users_modal.cancel', { defaultValue: 'Cancel' })}
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={isInviting || selectedUsers.length === 0}
            className="gap-2"
            size="sm"
          >
            {isInviting ? (
              <Icon name="Loader2" size={12} className="animate-spin" />
            ) : (
              <Icon name="UserPlus" size={12} />
            )}
            {isInviting 
              ? t('invite_users_modal.inviting', { defaultValue: 'Inviting...' })
              : t('invite_users_modal.invite', { 
                  defaultValue: 'Invite Users ({{count}})',
                  count: selectedUsers.length 
                })
            }
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InviteUsersModal;
