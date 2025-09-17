import React from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useDeleteRoom } from '@/hooks/api';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
 * Delete Talk Room Modal Component
 * Confirms deletion of a Talk room with proper warnings
 */
const DeleteTalkRoomModal = ({ isOpen, onClose, room }) => {
  const { t } = useTranslation('q-a-management-center');

  // Delete room mutation
  const deleteRoomMutation = useDeleteRoom({
    onSuccess: (data) => {
      // Show success toast
      toast.success(t('delete_room_modal.success_title', { defaultValue: 'Room deleted successfully!' }), {
        description: t('delete_room_modal.success_description', { 
          defaultValue: 'Talk room "{{roomName}}" has been permanently deleted.',
          roomName: room?.displayName
        }),
      });
      
      handleClose();
    },
    onError: (error) => {
      console.error('Failed to delete Talk room:', error.message);
      
      // Show error toast
      toast.error(t('delete_room_modal.error_title', { defaultValue: 'Failed to delete room' }), {
        description: error.message,
      });
    }
  });

  const handleDelete = async () => {
    if (!room?.token) return;

    deleteRoomMutation.mutate(room.token);
  };

  const handleClose = () => {
    onClose();
  };

  const handleModalClose = () => {
    // Only prevent closing if mutation is actually in progress
    if (!deleteRoomMutation.isPending) {
      handleClose();
    }
  };

  if (!room) return null;

  const participantsCount = room.participantsCount || 0;

  return (
    <Dialog open={isOpen} onOpenChange={handleModalClose}>
      <DialogContent className="max-w-md rtl:[&>button]:left-4 rtl:[&>button]:right-auto rtl:[&>button]:top-4">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-left rtl:text-right">
            <Icon name="AlertTriangle" size={16} className="text-destructive" />
            {t('delete_room_modal.title', { defaultValue: 'Delete Talk Room' })}
          </DialogTitle>
          <DialogDescription className="text-left rtl:text-right">
            {t('delete_room_modal.description', { 
              defaultValue: 'Are you sure you want to delete "{{roomName}}"? This action cannot be undone.',
              roomName: room.displayName
            })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Warning for rooms with participants */}
          {participantsCount > 0 && (
            <Alert variant="destructive">
              <Icon name="AlertTriangle" size={16} />
              <AlertDescription>
                <strong>{t('delete_room_modal.participants_warning_title', { defaultValue: 'Warning:' })}</strong>{' '}
                {t('delete_room_modal.participants_warning', { 
                  defaultValue: 'This room has {{count}} participant(s). Deleting it will remove all access and chat history.',
                  count: participantsCount
                })}
              </AlertDescription>
            </Alert>
          )}

          {/* Messages warning */}
          {room.hasMessages && (
            <Alert>
              <Icon name="MessageCircle" size={16} />
              <AlertDescription>
                {t('delete_room_modal.messages_warning', { 
                  defaultValue: 'All messages and chat history in this room will be permanently deleted.'
                })}
              </AlertDescription>
            </Alert>
          )}

          {/* Final Warning */}
          <Alert variant="destructive">
            <Icon name="AlertTriangle" size={16} />
            <AlertDescription>
              <strong>{t('delete_room_modal.final_warning_title', { defaultValue: 'Warning:' })}</strong>{' '}
              {t('delete_room_modal.final_warning', { 
                defaultValue: 'This action is irreversible. All messages, participants, and shared access will be permanently lost.' 
              })}
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter className="pt-4 rtl:flex-row-reverse rtl:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={handleModalClose}
            disabled={deleteRoomMutation.isPending}
            size="sm"
          >
            {t('delete_room_modal.cancel', { defaultValue: 'Cancel' })}
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteRoomMutation.isPending}
            className="gap-2 rtl:flex-row-reverse"
            size="sm"
          >
            {deleteRoomMutation.isPending ? (
              <Icon name="Loader2" size={14} className="animate-spin" />
            ) : (
              <Icon name="Trash2" size={14} />
            )}
            {deleteRoomMutation.isPending 
              ? t('delete_room_modal.deleting', { defaultValue: 'Deleting...' })
              : t('delete_room_modal.delete', { defaultValue: 'Delete Room' })
            }
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteTalkRoomModal;
