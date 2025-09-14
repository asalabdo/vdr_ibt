import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useDeleteGroup } from '@/hooks/api';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
 * Delete Group Confirmation Modal Component
 * Provides a safe way to delete groups with confirmation
 */
const DeleteGroupModal = ({ isOpen, onClose, group }) => {
  const { t } = useTranslation('groups-management');
  const [errors, setErrors] = useState({});

  // Delete group mutation
  const deleteGroupMutation = useDeleteGroup({
    onSuccess: (data) => {
      // Show success toast
      toast.success(t('delete_modal.success_title', { defaultValue: 'Group deleted successfully!' }), {
        description: t('delete_modal.success_description', { 
          defaultValue: 'Group "{{groupName}}" has been permanently deleted.',
          groupName: group?.displayName || group?.id
        }),
      });
      
      handleClose();
    },
    onError: (error) => {
      console.error('Failed to delete group:', error.message);
      
      // Show error toast
      toast.error(t('delete_modal.error_title', { defaultValue: 'Failed to delete group' }), {
        description: error.message,
      });
      
      setErrors({ submit: error.message });
    }
  });

  const handleDelete = async () => {
    if (!group?.id) return;

    console.log('🗑️ Attempting to delete group:', group.id);
    deleteGroupMutation.mutate(group.id);
  };

  const handleClose = () => {
    // Reset errors
    setErrors({});
    onClose();
  };

  const handleModalClose = () => {
    // Only prevent closing if mutation is actually in progress
    if (!deleteGroupMutation.isPending) {
      handleClose();
    }
  };

  if (!group) return null;

  const groupName = group.displayName || group.id;
  const memberCount = group.memberCount || 0;
  const isProtectedGroup = group?.id?.toLowerCase() === 'admin';

  return (
    <Dialog open={isOpen} onOpenChange={handleModalClose}>
      <DialogContent className="max-w-md rtl:[&>button]:left-4 rtl:[&>button]:right-auto rtl:[&>button]:top-4">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-left rtl:text-right text-destructive">
            <Icon name="AlertTriangle" size={16} />
            {t('delete_modal.title', { defaultValue: 'Delete Group' })}
          </DialogTitle>
          <DialogDescription className="text-left rtl:text-right">
            {t('delete_modal.description', { 
              defaultValue: 'This action cannot be undone. This will permanently delete the group and remove all associated permissions.' 
            })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Group Information */}
          <Card className="border-destructive/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Icon name="Users" size={16} />
                {t('delete_modal.group_info', { defaultValue: 'Group to be deleted' })}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {t('delete_modal.group_name', { defaultValue: 'Group Name' })}:
                </span>
                <span className="font-medium">{groupName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {t('delete_modal.group_id', { defaultValue: 'Group ID' })}:
                </span>
                <span className="font-mono text-xs">{group.id}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {t('delete_modal.member_count', { defaultValue: 'Members' })}:
                </span>
                <span className="font-medium">{memberCount}</span>
              </div>
            </CardContent>
          </Card>

          {/* Warning for groups with members */}
          {memberCount > 0 && (
            <Alert variant="destructive">
              <Icon name="AlertTriangle" size={16} />
              <AlertDescription>
                {t('delete_modal.members_warning', { 
                  defaultValue: 'This group has {{count}} member(s). Deleting it will remove their group-based permissions and access to shared resources.',
                  count: memberCount
                })}
              </AlertDescription>
            </Alert>
          )}

          {/* Warning for protected groups */}
          {group?.id?.toLowerCase() === 'admin' && (
            <Alert variant="destructive">
              <Icon name="Shield" size={16} />
              <AlertDescription>
                {t('delete_modal.protected_group_warning', { 
                  defaultValue: 'This is a system group that cannot be deleted. The admin group is required for Nextcloud operation.'
                })}
              </AlertDescription>
            </Alert>
          )}


          {/* Error Display */}
          {errors.submit && (
            <Alert variant="destructive">
              <Icon name="AlertCircle" size={16} />
              <AlertDescription>{errors.submit}</AlertDescription>
            </Alert>
          )}

          {/* Final Warning */}
          <Alert variant="destructive">
            <Icon name="AlertTriangle" size={16} />
            <AlertDescription>
              <strong>{t('delete_modal.final_warning_title', { defaultValue: 'Warning:' })}</strong>{' '}
              {t('delete_modal.final_warning', { 
                defaultValue: 'This action is irreversible. All group permissions, shared folder access, and member associations will be permanently lost.' 
              })}
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter className="rtl:flex-row-reverse">
          <Button
            type="button"
            variant="outline"
            onClick={handleModalClose}
            disabled={deleteGroupMutation.isPending}
          >
            {t('delete_modal.cancel', { defaultValue: 'Cancel' })}
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteGroupMutation.isPending || isProtectedGroup}
            className="gap-2 rtl:flex-row-reverse"
          >
            {deleteGroupMutation.isPending ? (
              <Icon name="Loader2" size={14} className="animate-spin" />
            ) : (
              <Icon name="Trash2" size={14} />
            )}
            {deleteGroupMutation.isPending 
              ? t('delete_modal.deleting', { defaultValue: 'Deleting...' })
              : t('delete_modal.delete', { defaultValue: 'Delete Group' })
            }
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteGroupModal;
