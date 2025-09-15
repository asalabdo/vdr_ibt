import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useUpdateRoom } from '@/hooks/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/Checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
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
 * Edit Room Modal Component
 * Edits an existing Talk room using the Nextcloud Talk API
 */
const EditRoomModal = ({ isOpen, onClose, room, t }) => {
  const [formData, setFormData] = useState({
    roomName: '',
    description: '',
    readOnly: false
  });
  const [errors, setErrors] = useState({});

  // Update room mutation
  const updateRoomMutation = useUpdateRoom({
    onSuccess: (data) => {
      // Show success toast
      toast.success(t('edit_room_modal.success_title', { defaultValue: 'Room updated successfully!' }), {
        description: t('edit_room_modal.success_description', { 
          defaultValue: `Talk room "${data.displayName}" has been updated.`,
          roomName: data.displayName 
        }),
      });
      
      handleClose();
    },
    onError: (error) => {
      console.error('Failed to update room:', error.message);
      
      // Show error toast
      toast.error(t('edit_room_modal.error_title', { defaultValue: 'Failed to update room' }), {
        description: error.message,
      });
      
      setErrors({ submit: error.message });
    }
  });

  // Initialize form data when room changes
  useEffect(() => {
    if (room) {
      setFormData({
        roomName: room.displayName || '',
        description: room.description || '',
        readOnly: room.readOnly === 1
      });
    }
  }, [room]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.roomName.trim()) {
      newErrors.roomName = t('edit_room_modal.errors.name_required', { defaultValue: 'Room name is required' });
    } else if (formData.roomName.length < 3) {
      newErrors.roomName = t('edit_room_modal.errors.name_min_length', { defaultValue: 'Room name must be at least 3 characters' });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm() || !room) return;

    const updateData = {
      roomName: formData.roomName.trim(),
      description: formData.description.trim(),
      readOnly: formData.readOnly ? 1 : 0
    };

    updateRoomMutation.mutate({
      roomToken: room.token,
      updateData
    });
  };

  const handleClose = () => {
    setErrors({});
    onClose();
  };

  const handleModalClose = () => {
    // Only prevent closing if mutation is actually in progress
    if (!updateRoomMutation.isPending) {
      handleClose();
    }
  };

  if (!room) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleModalClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center gap-2">
            <Icon name="Edit" size={18} />
            {t('edit_room_modal.title', { defaultValue: 'Edit Talk Room' })}
          </DialogTitle>
          <DialogDescription className="text-sm">
            {t('edit_room_modal.description', { defaultValue: 'Update the room settings and configuration.' })}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Room Name Field */}
          <div className="space-y-1">
            <Label htmlFor="roomName" className="text-xs font-medium text-muted-foreground">
              {t('edit_room_modal.room_name', { defaultValue: 'Room Name' })} *
            </Label>
            <Input
              id="roomName"
              type="text"
              value={formData.roomName}
              onChange={(e) => handleInputChange('roomName', e.target.value)}
              placeholder={t('edit_room_modal.room_name_placeholder', { defaultValue: 'Enter room name...' })}
              className={`text-sm ${errors.roomName ? 'border-destructive' : ''}`}
              disabled={updateRoomMutation.isPending}
            />
            {errors.roomName && (
              <p className="text-xs text-destructive">{errors.roomName}</p>
            )}
          </div>

          {/* Room Description Field */}
          <div className="space-y-1">
            <Label htmlFor="description" className="text-xs font-medium text-muted-foreground">
              {t('edit_room_modal.room_description', { defaultValue: 'Description' })}
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder={t('edit_room_modal.description_placeholder', { defaultValue: 'Optional room description...' })}
              className="text-sm resize-none"
              rows={3}
              disabled={updateRoomMutation.isPending}
            />
          </div>

          <Separator />

          {/* Read-only Setting */}
          <div className="space-y-3">
            <Label className="text-xs font-medium text-muted-foreground">
              {t('edit_room_modal.room_settings', { defaultValue: 'Room Settings' })}
            </Label>
            
            <div className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-muted/20 transition-colors">
              <Checkbox
                id="readOnly"
                checked={formData.readOnly}
                onCheckedChange={(checked) => handleInputChange('readOnly', checked)}
                disabled={updateRoomMutation.isPending}
                className="mt-1"
              />
              <div className="flex-1 space-y-1">
                <Label htmlFor="readOnly" className="text-sm font-medium cursor-pointer">
                  <Icon name="Lock" size={14} className="inline mr-1 rtl:ml-1 rtl:mr-0" />
                  {t('edit_room_modal.read_only', { defaultValue: 'Read-only Room' })}
                </Label>
                <p className="text-xs text-muted-foreground">
                  {t('edit_room_modal.read_only_description', { defaultValue: 'Prevent users from posting new messages (only administrators can post)' })}
                </p>
              </div>
            </div>
          </div>

          {/* Error Display */}
          {errors.submit && (
            <Alert variant="destructive">
              <Icon name="AlertCircle" size={16} />
              <AlertDescription>{errors.submit}</AlertDescription>
            </Alert>
          )}
        </form>

        <div className="flex justify-end gap-2 pt-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleModalClose}
            disabled={updateRoomMutation.isPending}
            size="sm"
          >
            {t('edit_room_modal.cancel', { defaultValue: 'Cancel' })}
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={updateRoomMutation.isPending}
            size="sm"
            className="gap-2"
          >
            {updateRoomMutation.isPending ? (
              <Icon name="Loader2" size={14} className="animate-spin" />
            ) : (
              <Icon name="Save" size={14} />
            )}
            {updateRoomMutation.isPending 
              ? t('edit_room_modal.updating', { defaultValue: 'Updating...' })
              : t('edit_room_modal.update', { defaultValue: 'Update Room' })
            }
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditRoomModal;
