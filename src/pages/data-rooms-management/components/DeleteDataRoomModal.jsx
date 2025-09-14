import React from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useDeleteDataRoom } from '@/hooks/api';
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
 * Delete Data Room Modal Component
 * Confirms deletion of a data room (Group Folder) with proper warnings
 */
const DeleteDataRoomModal = ({ isOpen, onClose, room }) => {
  const { t } = useTranslation('data-rooms-management');

  // Delete data room mutation
  const deleteDataRoomMutation = useDeleteDataRoom({
    onSuccess: (data) => {
      // Show success toast
      toast.success(t('delete_modal.success_title', { defaultValue: 'Data room deleted successfully!' }), {
        description: t('delete_modal.success_description', { 
          defaultValue: 'Data room "{{roomName}}" has been permanently deleted.',
          roomName: room?.roomName || room?.mountPoint
        }),
      });
      
      handleClose();
    },
    onError: (error) => {
      console.error('Failed to delete data room:', error.message);
      
      // Show error toast
      toast.error(t('delete_modal.error_title', { defaultValue: 'Failed to delete data room' }), {
        description: error.message,
      });
    }
  });

  const handleDelete = async () => {
    if (!room?.roomId) return;

    console.log('🗑️ Attempting to delete data room:', room.roomId);
    deleteDataRoomMutation.mutate(room.roomId);
  };

  const handleClose = () => {
    onClose();
  };

  const handleModalClose = () => {
    // Only prevent closing if mutation is actually in progress
    if (!deleteDataRoomMutation.isPending) {
      handleClose();
    }
  };

  if (!room) return null;

  const roomName = room.roomName || room.mountPoint;
  const groupsCount = room.groupsCount || 0;

  return (
    <Dialog open={isOpen} onOpenChange={handleModalClose}>
      <DialogContent className="max-w-md rtl:[&>button]:left-4 rtl:[&>button]:right-auto rtl:[&>button]:top-4">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-left rtl:text-right">
            <Icon name="AlertTriangle" size={16} className="text-destructive" />
            {t('delete_modal.title', { defaultValue: 'Delete Data Room' })}
          </DialogTitle>
          <DialogDescription className="text-left rtl:text-right">
            {t('delete_modal.description', { 
              defaultValue: 'Are you sure you want to delete "{{roomName}}"? This action cannot be undone.',
              roomName: roomName
            })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Warning for folders with groups */}
          {groupsCount > 0 && (
            <Alert variant="destructive">
              <Icon name="AlertTriangle" size={16} />
              <AlertDescription>
                <strong>{t('delete_modal.groups_warning_title', { defaultValue: 'Warning:' })}</strong>{' '}
                {t('delete_modal.groups_warning', { 
                  defaultValue: 'This data room has {{count}} group(s) with access. Deleting it will remove all group permissions and shared files.',
                  count: groupsCount
                })}
              </AlertDescription>
            </Alert>
          )}

          {/* Storage warning */}
          {room.currentSize > 0 && (
            <Alert>
              <Icon name="Info" size={16} />
              <AlertDescription>
                {t('delete_modal.storage_warning', { 
                  defaultValue: 'Current storage used: {{size}}. All files in this data room will be permanently deleted.',
                  size: room.formattedSize || 'Unknown'
                })}
              </AlertDescription>
            </Alert>
          )}

          {/* Final Warning */}
          <Alert variant="destructive">
            <Icon name="AlertTriangle" size={16} />
            <AlertDescription>
              <strong>{t('delete_modal.final_warning_title', { defaultValue: 'Warning:' })}</strong>{' '}
              {t('delete_modal.final_warning', { 
                defaultValue: 'This action is irreversible. All data, group permissions, and shared access will be permanently lost.' 
              })}
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter className="pt-4 rtl:flex-row-reverse rtl:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={handleModalClose}
            disabled={deleteDataRoomMutation.isPending}
            size="sm"
          >
            {t('delete_modal.cancel', { defaultValue: 'Cancel' })}
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteDataRoomMutation.isPending}
            className="gap-2 rtl:flex-row-reverse"
            size="sm"
          >
            {deleteDataRoomMutation.isPending ? (
              <Icon name="Loader2" size={14} className="animate-spin" />
            ) : (
              <Icon name="Trash2" size={14} />
            )}
            {deleteDataRoomMutation.isPending 
              ? t('delete_modal.deleting', { defaultValue: 'Deleting...' })
              : t('delete_modal.delete', { defaultValue: 'Delete Data Room' })
            }
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteDataRoomModal;
