import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useCreateRoom, useUsers, ROOM_TYPES } from '@/hooks/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
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
 * Create Room Modal Component
 * Creates a new Talk room using the real Nextcloud Talk API
 */
const CreateRoomModal = ({ isOpen, onClose, t }) => {
  const [formData, setFormData] = useState({
    roomName: '',
    roomType: ROOM_TYPES.GROUP, // Always Group Chat - no user selection needed
    description: '',
    invite: []
  });
  const [errors, setErrors] = useState({});

  // Fetch available users for invitation
  const { data: usersData } = useUsers({ enabled: isOpen });
  const availableUsers = usersData?.users || [];

  // Create room mutation
  const createRoomMutation = useCreateRoom({
    onSuccess: (data) => {
      // Show success toast
      toast.success(t('create_room_modal.success_title', { defaultValue: 'Room created successfully!' }), {
        description: t('create_room_modal.success_description', { 
          defaultValue: `Talk room "${data.displayName}" has been created and is ready for use.`,
          roomName: data.displayName 
        }),
      });
      
      handleClose();
      // Reset form
      setFormData({
        roomName: '',
        roomType: ROOM_TYPES.GROUP, // Always Group Chat
        description: '',
        invite: []
      });
      setErrors({});
    },
    onError: (error) => {
      console.error('Failed to create room:', error.message);
      
      // Show error toast
      toast.error(t('create_room_modal.error_title', { defaultValue: 'Failed to create room' }), {
        description: error.message,
      });
      
      setErrors({ submit: error.message });
    }
  });

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

  const handleUserToggle = (userId) => {
    setFormData(prev => ({
      ...prev,
      invite: prev.invite.includes(userId)
        ? prev.invite.filter(id => id !== userId)
        : [...prev.invite, userId]
    }));
  };

  const handleSelectAll = () => {
    if (formData.invite.length === availableUsers.length) {
      // Deselect all
      setFormData(prev => ({
        ...prev,
        invite: []
      }));
    } else {
      // Select all
      setFormData(prev => ({
        ...prev,
        invite: availableUsers.map(user => user.id)
      }));
    }
  };


  const validateForm = () => {
    const newErrors = {};

    if (!formData.roomName.trim()) {
      newErrors.roomName = t('create_room_modal.errors.name_required', { defaultValue: 'Room name is required' });
    } else if (formData.roomName.length < 3) {
      newErrors.roomName = t('create_room_modal.errors.name_min_length', { defaultValue: 'Room name must be at least 3 characters' });
    }


    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const roomData = {
        roomName: formData.roomName.trim(),
        roomType: formData.roomType, // Already a number
        description: formData.description.trim(),
        invite: formData.invite.length > 0 ? formData.invite.join(',') : undefined
      };

    createRoomMutation.mutate(roomData);
  };

  const handleClose = () => {
    setErrors({});
    onClose();
  };

  const handleModalClose = () => {
    // Only prevent closing if mutation is actually in progress
    if (!createRoomMutation.isPending) {
      handleClose();
    }
  };


  return (
    <Dialog open={isOpen} onOpenChange={handleModalClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto rtl:[&>button]:left-4 rtl:[&>button]:right-auto rtl:[&>button]:top-4">
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center gap-2 rtl:text-right">
            <Icon name="MessageCircle" size={18} />
            {t('create_room_modal.title', { defaultValue: 'Create Talk Room' })}
          </DialogTitle>
          <DialogDescription className="text-sm rtl:text-right">
            {t('create_room_modal.description', { defaultValue: 'Create a new Talk room for messaging and communication.' })}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Room Name Field */}
          <div className="space-y-1">
            <Label htmlFor="roomName" className="text-xs font-medium text-muted-foreground">
              {t('create_room_modal.room_name', { defaultValue: 'Room Name' })} *
            </Label>
            <Input
              id="roomName"
              type="text"
              value={formData.roomName}
              onChange={(e) => handleInputChange('roomName', e.target.value)}
              placeholder={t('create_room_modal.room_name_placeholder', { defaultValue: 'Enter room name...' })}
              className={`text-sm ${errors.roomName ? 'border-destructive' : ''}`}
              disabled={createRoomMutation.isPending}
            />
            {errors.roomName && (
              <p className="text-xs text-destructive">{errors.roomName}</p>
            )}
          </div>

          {/* Room Description Field */}
          <div className="space-y-1">
            <Label htmlFor="description" className="text-xs font-medium text-muted-foreground">
              {t('create_room_modal.room_description', { defaultValue: 'Description' })}
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder={t('create_room_modal.description_placeholder', { defaultValue: 'Optional room description...' })}
              className="text-sm resize-none"
              rows={3}
              disabled={createRoomMutation.isPending}
            />
          </div>

          <Separator />

          {/* Participants Section */}
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">
                  {t('create_room_modal.participants', { defaultValue: 'Invite Participants' })}
                </Label>
                <p className="text-xs text-muted-foreground">
                  {t('create_room_modal.participants_hint', { defaultValue: 'Select users to invite to this room (optional).' })}
                </p>

                {/* Helpful Tip for Public-like Behavior */}
                <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-start space-x-2 rtl:space-x-reverse">
                    <Icon name="Info" size={16} className="text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-blue-900 dark:text-blue-100 font-medium">
                        {t('create_room_modal.public_tip_title', { defaultValue: '💡 Tip: Want everyone to access this room?' })}
                      </p>
                      <p className="text-xs text-blue-700 dark:text-blue-300">
                        {t('create_room_modal.public_tip_description', { defaultValue: 'Click "Select All" to invite all users to this room.' })}
                      </p>
                    </div>
                  </div>
                </div>
                
                {availableUsers.length > 0 ? (
                  <div className="space-y-2">
                    {/* Select All Button */}
                    <div className="flex justify-between items-center">
                      <Label className="text-xs font-medium text-muted-foreground">
                        {t('create_room_modal.available_users', { 
                          defaultValue: 'Available Users ({{count}})',
                          count: availableUsers.length
                        })}
                      </Label>
                      <Button 
                        type="button"
                        variant="outline" 
                        size="sm"
                        onClick={handleSelectAll}
                        disabled={createRoomMutation.isPending}
                        className="h-7 px-3 text-xs"
                      >
                        {formData.invite.length === availableUsers.length 
                          ? t('create_room_modal.deselect_all', { defaultValue: 'Deselect All' })
                          : t('create_room_modal.select_all', { defaultValue: 'Select All' })
                        }
                      </Button>
                    </div>
                    <ScrollArea className="h-32 border rounded-md p-2">
                    <div className="space-y-2">
                      {availableUsers.map((user) => (
                        <div key={user.id} className="flex items-center space-x-2 rtl:space-x-reverse">
                          <Checkbox
                            id={user.id}
                            checked={formData.invite.includes(user.id)}
                            onCheckedChange={() => handleUserToggle(user.id)}
                            disabled={createRoomMutation.isPending}
                          />
                          <Label htmlFor={user.id} className="text-xs cursor-pointer flex-1">
                            <div className="flex items-center space-x-2 rtl:space-x-reverse">
                              <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                                <span className="text-xs text-primary">
                                  {user.username?.charAt(0)?.toUpperCase() || '?'}
                                </span>
                              </div>
                              <span>{user.username}</span>
                            </div>
                          </Label>
                        </div>
                      ))}
                    </div>
                    </ScrollArea>
                  </div>
                ) : (
                  <div className="text-xs text-muted-foreground p-3 border rounded-md text-center">
                    {t('create_room_modal.no_users_available', { defaultValue: 'No users available for invitation' })}
                  </div>
                )}
                
                {formData.invite.length > 0 && (
                  <div className="flex items-center justify-between py-2 px-3 bg-primary/5 rounded-lg border border-primary/10">
                    <div className="flex items-center gap-2">
                      <Icon name="Check" size={14} className="text-primary" />
                      <Label className="text-xs font-medium text-primary">
                        {t('create_room_modal.selected_users', { 
                          defaultValue: 'Selected Users'
                        })}
                      </Label>
                    </div>
                    <Badge variant="default" className="bg-primary text-primary-foreground text-xs h-5 px-2">
                      {formData.invite.length}
                    </Badge>
                  </div>
                )}
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
            disabled={createRoomMutation.isPending}
            size="sm"
          >
            {t('create_room_modal.cancel', { defaultValue: 'Cancel' })}
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={createRoomMutation.isPending}
            size="sm"
            className="gap-2"
          >
            {createRoomMutation.isPending ? (
              <Icon name="Loader2" size={14} className="animate-spin" />
            ) : (
              <Icon name="MessageCircle" size={14} />
            )}
            {createRoomMutation.isPending 
              ? t('create_room_modal.creating', { defaultValue: 'Creating...' })
              : t('create_room_modal.create', { defaultValue: 'Create Room' })
            }
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateRoomModal;
