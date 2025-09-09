import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useGroupDetails, useUpdateGroup } from '@/hooks/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
 * Edit Group Modal Component
 * Allows updating group settings like display name
 */
const EditGroupModal = ({ isOpen, onClose, groupId }) => {
  const { t } = useTranslation('groups-management');
  
  const [formData, setFormData] = useState({
    displayName: ''
  });
  const [errors, setErrors] = useState({});
  const [hasChanges, setHasChanges] = useState(false);

  // Fetch group details to populate form
  const { 
    data: groupData, 
    isLoading: isLoadingGroup,
    error: groupError 
  } = useGroupDetails(groupId, { 
    enabled: isOpen && !!groupId 
  });

  const group = groupData?.group;

  // Pre-populate form when group data is available
  useEffect(() => {
    if (group) {
      const initialData = {
        displayName: group.displayName || group.id || ''
      };
      setFormData(initialData);
      setHasChanges(false);
    }
  }, [group]);

  // Update group mutation
  const updateGroupMutation = useUpdateGroup({
    onSuccess: (data) => {
      // Show success toast
      toast.success(t('edit_modal.success_title', { defaultValue: 'Group updated successfully!' }), {
        description: t('edit_modal.success_description', { 
          defaultValue: 'Group settings have been updated.',
          groupName: data.group?.displayName || group?.displayName
        }),
      });
      
      handleClose();
    },
    onError: (error) => {
      console.error('Failed to update group:', error.message);
      
      // Show error toast
      toast.error(t('edit_modal.error_title', { defaultValue: 'Failed to update group' }), {
        description: error.message,
      });
      
      setErrors({ submit: error.message });
    }
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      // Check if there are changes from original data
      const originalDisplayName = group?.displayName || group?.id || '';
      setHasChanges(newData.displayName !== originalDisplayName);
      
      return newData;
    });
    
    // Clear error when user starts changing values
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.displayName.trim()) {
      newErrors.displayName = t('edit_modal.errors.display_name_required', { 
        defaultValue: 'Display name is required' 
      });
    } else if (formData.displayName.trim().length > 100) {
      newErrors.displayName = t('edit_modal.errors.display_name_max_length', { 
        defaultValue: 'Display name must be less than 100 characters' 
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm() || !hasChanges) return;
    if (!groupId) return;

    const updates = {
      displayName: formData.displayName.trim()
    };

    updateGroupMutation.mutate({
      groupId,
      updates
    });
  };

  const handleClose = () => {
    setErrors({});
    setHasChanges(false);
    onClose();
  };

  const handleModalClose = () => {
    // Only prevent closing if mutation is actually in progress
    if (!updateGroupMutation.isPending) {
      handleClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleModalClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon name="Settings" size={16} />
            {t('edit_modal.title', { defaultValue: 'Edit Group Settings' })}
          </DialogTitle>
          <DialogDescription>
            {group 
              ? t('edit_modal.description', { 
                  defaultValue: 'Update settings for "{{groupName}}".',
                  groupName: group.displayName || group.id 
                })
              : t('edit_modal.loading_description', { defaultValue: 'Loading group information...' })
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Loading State */}
          {isLoadingGroup && (
            <Card>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div>
                    <Skeleton className="h-4 w-20 mb-2" />
                    <Skeleton className="h-9 w-full" />
                  </div>
                  <div>
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Error State */}
          {groupError && (
            <Alert variant="destructive">
              <Icon name="AlertCircle" size={16} />
              <AlertDescription>
                {t('edit_modal.error_loading', { defaultValue: 'Failed to load group details' })}: {groupError.message}
              </AlertDescription>
            </Alert>
          )}

          {/* Edit Form */}
          {group && (
            <>
              {/* Group Information */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Icon name="Info" size={14} />
                    {t('edit_modal.group_info', { defaultValue: 'Group Information' })}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {t('edit_modal.group_info_hint', { defaultValue: 'Update display information for this group' })}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-1 space-y-3">
                  {/* Group ID (Read-only) */}
                  <div className="space-y-1">
                    <Label className="text-sm font-medium text-muted-foreground">
                      {t('edit_modal.group_id', { defaultValue: 'Group ID' })} 
                      <span className="text-xs ml-1">({t('edit_modal.readonly', { defaultValue: 'read-only' })})</span>
                    </Label>
                    <div className="px-3 py-2 bg-muted rounded-md">
                      <p className="text-sm font-mono text-muted-foreground">{group.id}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {t('edit_modal.group_id_hint', { defaultValue: 'Group ID cannot be changed after creation' })}
                    </p>
                  </div>

                  {/* Display Name */}
                  <div className="space-y-2">
                    <Label htmlFor="displayName" className="text-sm font-medium">
                      {t('edit_modal.display_name', { defaultValue: 'Display Name' })} <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="displayName"
                      value={formData.displayName}
                      onChange={(e) => handleInputChange('displayName', e.target.value)}
                      placeholder={t('edit_modal.display_name_placeholder', { 
                        defaultValue: 'Human-readable group name' 
                      })}
                      className={errors.displayName ? 'border-destructive' : ''}
                      disabled={updateGroupMutation.isPending}
                    />
                    {errors.displayName && (
                      <p className="text-xs text-destructive">{errors.displayName}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {t('edit_modal.display_name_hint', { 
                        defaultValue: 'This name will be shown in the interface and group listings' 
                      })}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Current Status Info */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Icon name="Users" size={14} />
                    {t('edit_modal.current_status', { defaultValue: 'Current Status' })}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-1">
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <p className="text-muted-foreground mb-1">
                        {t('edit_modal.member_count', { defaultValue: 'Members' })}
                      </p>
                      <p className="font-medium">{group.memberCount || 0}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1">
                        {t('edit_modal.status', { defaultValue: 'Status' })}
                      </p>
                      <p className="font-medium text-success">
                        {t('edit_modal.status_active', { defaultValue: 'Active' })}
                      </p>
                    </div>
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
            </>
          )}
        </div>

        <DialogFooter className="pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleModalClose}
            disabled={updateGroupMutation.isPending}
            size="sm"
          >
            {t('edit_modal.cancel', { defaultValue: 'Cancel' })}
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={updateGroupMutation.isPending || !hasChanges || isLoadingGroup}
            size="sm"
            className="gap-2"
          >
            {updateGroupMutation.isPending ? (
              <Icon name="Loader2" size={14} className="animate-spin" />
            ) : (
              <Icon name="Save" size={14} />
            )}
            {updateGroupMutation.isPending 
              ? t('edit_modal.saving', { defaultValue: 'Saving...' })
              : t('edit_modal.save', { defaultValue: 'Save Changes' })
            }
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditGroupModal;
