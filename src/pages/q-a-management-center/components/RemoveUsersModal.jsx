import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useRemoveParticipant, useParticipants } from '@/hooks/api';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/Checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
 * Remove Users Modal Component
 * Removes participants from an existing Talk room using the Nextcloud Talk API
 */
const RemoveUsersModal = ({ isOpen, onClose, room, t }) => {
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [errors, setErrors] = useState({});
  const [successCount, setSuccessCount] = useState(0);
  const [failureCount, setFailureCount] = useState(0);
  const [isRemoving, setIsRemoving] = useState(false);

  // Fetch current participants
  const { data: participantsData, isLoading: isLoadingParticipants } = useParticipants(room?.token, { 
    enabled: isOpen && !!room?.token 
  });
  const currentParticipants = participantsData?.participants || [];
  
  // Filter out the current user (they can't remove themselves) and get removable participants
  const removableParticipants = currentParticipants.filter(participant => {
    // Skip if it's the current user (usually has participantType of 1 for owner or is the session actor)
    // This prevents users from accidentally removing themselves
    const isCurrentUser = participant.sessionId || participant.actorType === 'users';
    const canBeRemoved = participant.participantType !== 1; // Not the room owner
    return !isCurrentUser || canBeRemoved; // Allow removal if not current user or if they can be removed
  });

  // Remove participant mutation
  const removeParticipantMutation = useRemoveParticipant({
    onSuccess: () => {
      setSuccessCount(prev => prev + 1);
    },
    onError: (error, variables) => {
      console.error(`Failed to remove participant ${variables.participant}:`, error.message);
      setFailureCount(prev => prev + 1);
    }
  });

  const handleUserToggle = (participantId) => {
    setSelectedUsers(prev => 
      prev.includes(participantId)
        ? prev.filter(id => id !== participantId)
        : [...prev, participantId]
    );
    // Clear errors when user makes selection
    if (errors.submit) {
      setErrors({});
    }
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === removableParticipants.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(removableParticipants.map(participant => participant.userId || participant.actorId || participant.id));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (selectedUsers.length === 0) {
      newErrors.submit = t('remove_users_modal.errors.no_users_selected', { 
        defaultValue: 'Please select at least one participant to remove' 
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm() || !room || selectedUsers.length === 0) return;

    setIsRemoving(true);
    setSuccessCount(0);
    setFailureCount(0);
    setErrors({});

    try {
      // Remove participants one by one
      const removePromises = selectedUsers.map(participantId =>
        removeParticipantMutation.mutateAsync({
          roomToken: room.token,
          participant: participantId
        })
      );

      await Promise.allSettled(removePromises);

      // Success feedback
      if (successCount > 0) {
        const successMessage = successCount === 1
          ? t('remove_users_modal.success.single', { 
              defaultValue: 'Participant removed successfully'
            })
          : t('remove_users_modal.success.multiple', { 
              defaultValue: '{{count}} participants removed successfully',
              count: successCount 
            });
        
        toast.success(successMessage);
      }

      // Warning for failures
      if (failureCount > 0) {
        const failureMessage = t('remove_users_modal.warning.partial_failure', { 
          defaultValue: 'Some participants could not be removed',
          failed: failureCount,
          total: selectedUsers.length
        });
        
        toast.warning(failureMessage);
      }

      // Reset form and close modal on success
      if (failureCount === 0) {
        setSelectedUsers([]);
        onClose();
      }

    } catch (error) {
      console.error('Error removing participants:', error);
      const errorMessage = error.response?.data?.ocs?.meta?.message || 
                           error.message || 
                           t('remove_users_modal.errors.general', { 
                             defaultValue: 'Failed to remove participants'
                           });
      
      setErrors({ submit: errorMessage });
      toast.error(errorMessage);
    } finally {
      setIsRemoving(false);
    }
  };

  const handleClose = () => {
    if (!isRemoving) {
      setSelectedUsers([]);
      setErrors({});
      setSuccessCount(0);
      setFailureCount(0);
      onClose();
    }
  };

  const UserSkeleton = () => (
    <div className="flex items-center space-x-2 rtl:space-x-reverse p-2 rounded border">
      <Skeleton className="w-4 h-4" />
      <div className="flex items-center space-x-2 rtl:space-x-reverse flex-1">
        <Skeleton className="w-6 h-6 rounded-full" />
        <Skeleton className="h-4 w-24" />
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="flex flex-col max-w-md max-h-[85vh]">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center space-x-2 rtl:space-x-reverse">
            <Icon name="UserMinus" size={18} className="text-destructive" />
            <span>{t('remove_users_modal.title', { defaultValue: 'Remove Participants' })}</span>
          </DialogTitle>
          <DialogDescription>
            {t('remove_users_modal.description', { 
              defaultValue: 'Select participants to remove from "{{roomName}}"',
              roomName: room?.displayName || room?.name || 'this room'
            })}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <form onSubmit={handleSubmit} className="h-full max-h-[350px] flex flex-col">
            {/* Current Participants */}
            <Card className="flex-1 flex flex-col">
              <CardHeader className="flex-shrink-0 pb-3">
                <CardTitle className="text-sm font-medium flex items-center space-x-2 rtl:space-x-reverse">
                  <Icon name="Users" size={14} className="text-muted-foreground" />
                  <span>
                    {t('remove_users_modal.current_participants', { 
                      defaultValue: 'Current Participants ({{count}})',
                      count: removableParticipants.length
                    })}
                  </span>
                </CardTitle>
                <CardDescription className="text-xs">
                  {t('remove_users_modal.participants_hint', { 
                    defaultValue: 'Select participants to remove from this room.'
                  })}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="flex-1 flex flex-col pt-2">
                {isLoadingParticipants ? (
                  <ScrollArea className="flex-1 max-h-[300px]">
                    <div className="space-y-2 pr-4">
                      {[1, 2, 3].map((i) => (
                        <UserSkeleton key={i} />
                      ))}
                    </div>
                  </ScrollArea>
                ) : removableParticipants.length > 0 ? (
                  <div className="space-y-2">
                    {/* Select All Button */}
                    <div className="flex justify-between items-center">
                      <Label className="text-xs font-medium text-muted-foreground">
                        {t('remove_users_modal.removable_participants', { 
                          defaultValue: 'Removable Participants ({{count}})',
                          count: removableParticipants.length
                        })}
                      </Label>
                      <Button 
                        type="button"
                        variant="outline" 
                        size="sm"
                        onClick={handleSelectAll}
                        disabled={isRemoving}
                        className="h-7 px-3 text-xs"
                      >
                        {selectedUsers.length === removableParticipants.length 
                          ? t('remove_users_modal.deselect_all', { defaultValue: 'Deselect All' })
                          : t('remove_users_modal.select_all', { defaultValue: 'Select All' })
                        }
                      </Button>
                    </div>
                    <ScrollArea className="h-full max-h-[250px] border rounded-md p-2">
                      <div className="space-y-2">
                        {removableParticipants.map((participant) => {
                          const participantId = participant.userId || participant.actorId || participant.id;
                          const displayName = participant.displayName || participant.userId || participant.actorId || 'Unknown User';
                          
                          return (
                            <div key={participantId} className="flex items-center space-x-2 rtl:space-x-reverse">
                              <Checkbox
                                id={participantId}
                                checked={selectedUsers.includes(participantId)}
                                onCheckedChange={() => handleUserToggle(participantId)}
                                disabled={isRemoving}
                              />
                              <Label htmlFor={participantId} className="text-xs cursor-pointer flex-1">
                                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                                  <div className="w-6 h-6 bg-destructive/10 rounded-full flex items-center justify-center">
                                    <span className="text-xs text-destructive">
                                      {displayName?.charAt(0)?.toUpperCase() || '?'}
                                    </span>
                                  </div>
                                  <span>{displayName}</span>
                                  {participant.participantType === 2 && (
                                    <Badge variant="secondary" className="text-xs h-4 px-1">
                                      Moderator
                                    </Badge>
                                  )}
                                </div>
                              </Label>
                            </div>
                          );
                        })}
                      </div>
                    </ScrollArea>
                  </div>
                ) : (
                  <div className="text-xs text-muted-foreground p-3 border rounded-md text-center">
                    {t('remove_users_modal.no_removable_participants', { 
                      defaultValue: 'No removable participants available' 
                    })}
                  </div>
                )}

                {/* Selected Users Preview */}
                {selectedUsers.length > 0 && (
                  <div className="flex items-center justify-between py-2 px-3 bg-destructive/5 rounded-lg border border-destructive/10">
                    <div className="flex items-center gap-2">
                      <Icon name="Check" size={14} className="text-destructive" />
                      <Label className="text-xs font-medium text-destructive">
                        {t('remove_users_modal.selected_participants', { 
                          defaultValue: 'Selected Participants'
                        })}
                      </Label>
                    </div>
                    <Badge variant="default" className="bg-destructive text-destructive-foreground text-xs h-5 px-2">
                      {selectedUsers.length}
                    </Badge>
                  </div>
                )}

                {/* Error Display */}
                {errors.submit && (
                  <Alert className="border-destructive">
                    <Icon name="AlertCircle" size={16} className="text-destructive" />
                    <AlertDescription className="text-destructive text-xs">
                      {errors.submit}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </form>
        </div>

        <DialogFooter className="flex-shrink-0">
          <div className="flex justify-end space-x-2 rtl:space-x-reverse w-full">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
              disabled={isRemoving}
            >
              {t('remove_users_modal.cancel', { defaultValue: 'Cancel' })}
            </Button>
            <Button 
              type="button"
              variant="destructive"
              onClick={handleSubmit}
              disabled={selectedUsers.length === 0 || isRemoving}
              className="min-w-[120px]"
            >
              {isRemoving ? (
                <>
                  <Icon name="Loader2" size={14} className="animate-spin mr-1 rtl:ml-1 rtl:mr-0" />
                  {t('remove_users_modal.removing', { defaultValue: 'Removing...' })}
                </>
              ) : (
                <>
                  <Icon name="UserMinus" size={14} className="mr-1 rtl:ml-1 rtl:mr-0" />
                  {t('remove_users_modal.remove_participants', { 
                    defaultValue: 'Remove Participants',
                    count: selectedUsers.length 
                  })}
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RemoveUsersModal;
