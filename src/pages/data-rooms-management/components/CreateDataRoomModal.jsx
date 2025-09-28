import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useCreateDataRoom, useAvailableGroups } from '@/hooks/api';
import { usePermissions } from '@/hooks/api/useAuth';
import { filterGroupsByPermissions } from '@/lib/groupFilters';
import { validateMountpoint } from '@/lib/formValidation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
 * Create Data Room Modal Component
 * Creates a new data room (group folder) with mountpoint, then adds groups via separate API calls
 * Note: Quota setting is not supported in the Group Folders creation API
 */
const CreateDataRoomModal = ({ isOpen, onClose }) => {
  const { t } = useTranslation('data-rooms-management');
  const [formData, setFormData] = useState({
    mountpoint: '',
    groups: []
  });
  const [errors, setErrors] = useState({});

  // Get user permissions to filter available groups
  const { isAdmin, isSubadmin, managedGroups, canManageAllGroups } = usePermissions();

  // Fetch available groups dynamically
  const { 
    data: groupsData, 
    isLoading: isLoadingGroups,
    error: groupsError 
  } = useAvailableGroups({ 
    enabled: isOpen // Only fetch when modal is open
  });
  
  // Filter groups based on user permissions using centralized logic
  const allGroups = groupsData?.groups || [];
  const userPermissions = {
    isAdmin,
    canManageAllGroups,
    managedGroups
  };
  
  const availableGroups = filterGroupsByPermissions(allGroups, userPermissions);

  // Create data room mutation
  const createDataRoomMutation = useCreateDataRoom({
    onSuccess: (data) => {
      // Show success toast
      toast.success(t('create_modal.success_title', { defaultValue: 'Data room created successfully!' }), {
        description: t('create_modal.success_description', { 
          defaultValue: 'Data room "{roomName}" has been created and configured.',
          roomName: data.mountPoint || data.mount_point || formData.mountpoint
        }),
      });
      
      // Show warnings if some groups failed to assign
      if (data.warnings && data.warnings.length > 0) {
        console.warn('Group assignment warnings:', data.warnings);
        toast.warning(t('create_modal.warning_title', { defaultValue: 'Group assignment warning' }), {
          description: data.warnings.join('. '),
        });
      }
      
      handleClose();
      // Reset form
      setFormData({
        mountpoint: '',
        groups: []
      });
      setErrors({});
    },
    onError: (error) => {
      console.error('Failed to create data room:', error.message);
      
      // Show error toast
      toast.error(t('create_modal.error_title', { defaultValue: 'Failed to create data room' }), {
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

  const handleGroupToggle = (groupId) => {
    setFormData(prev => ({
      ...prev,
      groups: prev.groups.find(g => g.groupId === groupId)
        ? prev.groups.filter(g => g.groupId !== groupId)
        : [...prev.groups, { groupId, permissions: 31 }] // Default to full permissions
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    // Use centralized validation function
    const mountpointError = validateMountpoint(formData.mountpoint);
    if (mountpointError) {
      newErrors.mountpoint = mountpointError;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    // For subadmins: automatically assign to their managed groups
    // For admins: use selected groups or empty array
    let groupsToAssign = [];
    
    if (isSubadmin && !isAdmin && Array.isArray(managedGroups)) {
      // Subadmins: automatically assign to all their managed groups
      groupsToAssign = managedGroups.map(groupId => ({ groupId, permissions: 31 }));
    } else {
      // Admins: use selected groups
      groupsToAssign = formData.groups;
    }

    const roomData = {
      mountpoint: formData.mountpoint.trim(),
      groups: groupsToAssign
    };

    createDataRoomMutation.mutate(roomData);
  };

  const handleClose = () => {
    setErrors({});
    onClose();
  };

  const handleModalClose = () => {
    // Only prevent closing if mutation is actually in progress
    if (!createDataRoomMutation.isPending) {
      handleClose();
    }
  };


  return (
    <Dialog open={isOpen} onOpenChange={handleModalClose}>
      <DialogContent className="max-w-lg rtl:[&>button]:left-4 rtl:[&>button]:right-auto rtl:[&>button]:top-4">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 rtl:text-right">
            <Icon name="FolderPlus" size={16} />
            {t('create_modal.title', { defaultValue: 'Create New Data Room' })}
          </DialogTitle>
          <DialogDescription className=" rtl:text-right">
            {t('create_modal.description', { defaultValue: 'Create a new data room with secure group access controls.' })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Data Room Name */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{t('create_modal.room_configuration')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="mountpoint" className="text-sm font-medium">
                  {t('create_modal.mountpoint', { defaultValue: 'Data Room Name' })} <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="mountpoint"
                  value={formData.mountpoint}
                  onChange={(e) => handleInputChange('mountpoint', e.target.value)}
                  placeholder={t('create_modal.mountpoint_placeholder', { defaultValue: 'e.g., project-alpha, legal-docs' })}
                  className={errors.mountpoint ? 'border-destructive' : ''}
                  disabled={createDataRoomMutation.isPending}
                />
                {errors.mountpoint && (
                  <p className="text-xs text-destructive">{errors.mountpoint}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  {t('create_modal.mountpoint_hint', { defaultValue: 'Use letters, numbers, hyphens, and underscores only' })}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Groups Selection - Only for Admins */}
          {isAdmin ? (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">{t('create_modal.group_access')}</CardTitle>
                <CardDescription>
                  {t('create_modal.groups_hint', { defaultValue: 'Select groups that will have access to this data room' })}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Loading State */}
                {isLoadingGroups && (
                  <div className="flex items-center justify-center py-6">
                    <Icon name="Loader2" size={16} className="animate-spin mr-2" />
                    <span className="text-sm text-muted-foreground">
                      {t('create_modal.loading_groups', { defaultValue: 'Loading available groups...' })}
                    </span>
                  </div>
                )}
                
                {/* Error State */}
                {groupsError && (
                  <Alert variant="destructive">
                    <Icon name="AlertCircle" size={16} />
                    <AlertDescription>
                      {t('create_modal.groups_error', { defaultValue: 'Failed to load groups' })}: {groupsError.message}
                    </AlertDescription>
                  </Alert>
                )}
                
                {/* Groups List */}
                {!isLoadingGroups && !groupsError && (
                  <div className="space-y-3">
                    {availableGroups.length > 0 ? (
                      <ScrollArea className="h-24">
                        <div className="space-y-2">
                          {availableGroups.map((group) => (
                            <div key={group.id} className="flex items-center space-x-2">
                              <Checkbox
                                id={group.id}
                                checked={formData.groups.some(g => g.groupId === group.id)}
                                onCheckedChange={() => handleGroupToggle(group.id)}
                                disabled={createDataRoomMutation.isPending}
                              />
                              <Label htmlFor={group.id} className="text-sm cursor-pointer flex-1">
                                {group.displayName || group.id}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    ) : (
                      <div className="text-center py-6">
                        <Icon name="Users" size={24} className="mx-auto text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground mb-3">
                          {t('create_modal.no_groups', { defaultValue: 'No groups available' })}
                        </p>
                        <p className="text-xs text-muted-foreground mb-3">
                          {t('create_modal.create_groups_hint', { defaultValue: 'Create groups first to assign access permissions to your data rooms.' })}
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
                          {t('create_modal.manage_groups', { defaultValue: 'Manage Groups' })}
                        </Button>
                      </div>
                    )}
                    
                    {/* Selected Groups Preview */}
                    {formData.groups.length > 0 && (
                      <div className="space-y-2">
                        <Label className="text-xs font-medium text-muted-foreground">Selected Groups</Label>
                        <div className="flex flex-wrap gap-1">
                          {formData.groups.map((group) => (
                            <Badge key={group.groupId} variant="secondary" className="text-xs">
                              {availableGroups.find(g => g.id === group.groupId)?.displayName || group.groupId}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            /* For Subadmins - Show automatic assignment info */
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">{t('create_modal.company_assignment', 'Company Assignment')}</CardTitle>
                <CardDescription>
                  {t('create_modal.auto_assignment_hint', 'This data room will automatically be assigned to your managed companies')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Alert>
                  <Icon name="Building" size={14} />
                  <AlertDescription className="text-sm">
                    <div className="space-y-2">
                      <p><strong>Auto-assigned companies:</strong></p>
                      {Array.isArray(managedGroups) && managedGroups.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {managedGroups.map((groupId) => (
                            <Badge key={groupId} variant="outline" className="text-xs">
                              {availableGroups.find(g => g.id === groupId)?.displayName || groupId}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground text-xs">No companies assigned to your account</p>
                      )}
                    </div>
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          )}

          {/* Error Display */}
          {errors.submit && (
            <Alert variant="destructive">
              <Icon name="AlertCircle" size={16} />
              <AlertDescription>{errors.submit}</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter className="rtl:flex-row-reverse">
          <Button
            type="button"
            variant="outline"
            onClick={handleModalClose}
            disabled={createDataRoomMutation.isPending}
          >
            {t('create_modal.cancel', { defaultValue: 'Cancel' })}
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={createDataRoomMutation.isPending || !formData.mountpoint.trim()}
            className="gap-2"
          >
            {createDataRoomMutation.isPending ? (
              <Icon name="Loader2" size={14} className="animate-spin" />
            ) : (
              <Icon name="FolderPlus" size={14} />
            )}
            {createDataRoomMutation.isPending 
              ? t('create_modal.creating', { defaultValue: 'Creating...' })
              : t('create_modal.create', { defaultValue: 'Create Data Room' })
            }
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateDataRoomModal;
