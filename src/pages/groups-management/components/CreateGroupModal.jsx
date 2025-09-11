import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useCreateGroup } from '@/hooks/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/label';
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
 * Create Group Modal Component
 * Creates a new group with basic information
 */
const CreateGroupModal = ({ isOpen, onClose }) => {
  const { t } = useTranslation('groups-management');
  const [formData, setFormData] = useState({
    groupId: '',
    displayName: ''
  });
  const [errors, setErrors] = useState({});

  // Create group mutation
  const createGroupMutation = useCreateGroup({
    onSuccess: (data) => {
      // Show success toast
      toast.success(t('create_modal.success_title', { defaultValue: 'Group created successfully!' }), {
        description: t('create_modal.success_description', { 
          defaultValue: 'Group "{{groupName}}" has been created and is ready to use.',
          groupName: data.group?.displayName || data.group?.id
        }),
      });
      
      handleClose();
    },
    onError: (error) => {
      console.error('Failed to create group:', error.message);
      
      // Show error toast
      toast.error(t('create_modal.error_title', { defaultValue: 'Failed to create group' }), {
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

  const validateForm = () => {
    const newErrors = {};

    // Group ID validation
    if (!formData.groupId.trim()) {
      newErrors.groupId = t('create_modal.errors.group_id_required', { 
        defaultValue: 'Group ID is required' 
      });
    } else if (formData.groupId.length < 2) {
      newErrors.groupId = t('create_modal.errors.group_id_min_length', { 
        defaultValue: 'Group ID must be at least 2 characters' 
      });
    } else if (!/^[a-zA-Z0-9_-]+$/.test(formData.groupId)) {
      newErrors.groupId = t('create_modal.errors.group_id_invalid', { 
        defaultValue: 'Group ID can only contain letters, numbers, hyphens, and underscores' 
      });
    }

    // Display name validation (optional but has rules if provided)
    if (formData.displayName.trim() && formData.displayName.trim().length > 100) {
      newErrors.displayName = t('create_modal.errors.display_name_max_length', { 
        defaultValue: 'Display name must be less than 100 characters' 
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const groupData = {
      groupId: formData.groupId.trim(),
      displayName: formData.displayName.trim() || formData.groupId.trim()
    };

    createGroupMutation.mutate(groupData);
  };

  const handleClose = () => {
    // Reset form
    setFormData({
      groupId: '',
      displayName: ''
    });
    setErrors({});
    onClose();
  };

  const handleModalClose = () => {
    // Only prevent closing if mutation is actually in progress
    if (!createGroupMutation.isPending) {
      handleClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleModalClose}>
      <DialogContent className="max-w-md rtl:[&>button]:left-4 rtl:[&>button]:right-auto rtl:[&>button]:top-4">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-left rtl:text-right">
            <Icon name="Users" size={16} />
            {t('create_modal.title', { defaultValue: 'Create New Group' })}
          </DialogTitle>
          <DialogDescription className="text-left rtl:text-right">
            {t('create_modal.description', { 
              defaultValue: 'Create a new group to organize users and manage permissions effectively.' 
            })}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Group Configuration */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{t('create_modal.group_info', { defaultValue: 'Group Information' })}</CardTitle>
              <CardDescription className="text-sm">
                {t('create_modal.info_hint', { 
                  defaultValue: 'Basic group details for identification and display' 
                })}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Group ID */}
              <div className="space-y-2">
                <Label htmlFor="groupId" className="text-sm font-medium">
                  {t('create_modal.group_id', { defaultValue: 'Group ID' })} <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="groupId"
                  value={formData.groupId}
                  onChange={(e) => handleInputChange('groupId', e.target.value)}
                  placeholder={t('create_modal.group_id_placeholder', { 
                    defaultValue: 'e.g., developers, marketing, admins' 
                  })}
                  className={errors.groupId ? 'border-destructive' : ''}
                  disabled={createGroupMutation.isPending}
                />
                {errors.groupId && (
                  <p className="text-xs text-destructive">{errors.groupId}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  {t('create_modal.group_id_hint', { 
                    defaultValue: 'Unique identifier used internally. Use letters, numbers, hyphens, and underscores only.' 
                  })}
                </p>
              </div>

              {/* Display Name */}
              <div className="space-y-2">
                <Label htmlFor="displayName" className="text-sm font-medium">
                  {t('create_modal.display_name', { defaultValue: 'Display Name' })} 
                  <span className="text-muted-foreground text-xs ml-1">
                    ({t('create_modal.optional', { defaultValue: 'optional' })})
                  </span>
                </Label>
                <Input
                  id="displayName"
                  value={formData.displayName}
                  onChange={(e) => handleInputChange('displayName', e.target.value)}
                  placeholder={t('create_modal.display_name_placeholder', { 
                    defaultValue: 'e.g., Development Team, Marketing Department' 
                  })}
                  className={errors.displayName ? 'border-destructive' : ''}
                  disabled={createGroupMutation.isPending}
                />
                {errors.displayName && (
                  <p className="text-xs text-destructive">{errors.displayName}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  {t('create_modal.display_name_hint', { 
                    defaultValue: 'Human-readable name shown in the interface. Defaults to Group ID if not provided.' 
                  })}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Error Display */}
          {errors.submit && (
            <Alert variant="destructive">
              <Icon name="AlertCircle" size={16} />
              <AlertDescription>{errors.submit}</AlertDescription>
            </Alert>
          )}

          {/* Info Card */}
          <Alert>
            <Icon name="Info" size={16} />
            <AlertDescription>
              {t('create_modal.info_message', { 
                defaultValue: 'You can add users to this group and manage permissions after creation.' 
              })}
            </AlertDescription>
          </Alert>
        </form>

        <DialogFooter className="rtl:flex-row-reverse">
          <Button
            type="button"
            variant="outline"
            onClick={handleModalClose}
            disabled={createGroupMutation.isPending}
          >
            {t('create_modal.cancel', { defaultValue: 'Cancel' })}
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={createGroupMutation.isPending || !formData.groupId.trim()}
            className="gap-2 rtl:flex-row-reverse"
          >
            {createGroupMutation.isPending ? (
              <Icon name="Loader2" size={14} className="animate-spin" />
            ) : (
              <Icon name="Users" size={14} />
            )}
            {createGroupMutation.isPending 
              ? t('create_modal.creating', { defaultValue: 'Creating...' })
              : t('create_modal.create', { defaultValue: 'Create Group' })
            }
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateGroupModal;
