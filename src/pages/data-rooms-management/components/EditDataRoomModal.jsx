import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useUpdateDataRoom } from '@/hooks/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/Checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
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
 * Edit Data Room Modal Component
 * Allows updating data room settings like quota and ACL
 */
const EditDataRoomModal = ({ isOpen, onClose, room }) => {
  const { t } = useTranslation('data-rooms-management');
  
  const [formData, setFormData] = useState({
    quota: -3, // Unlimited by default
    quotaUnit: 'GB',
    aclEnabled: false
  });
  const [errors, setErrors] = useState({});

  // Pre-populate form when room data is available
  useEffect(() => {
    if (room) {
      setFormData({
        quota: room.isUnlimitedQuota ? -3 : Math.round(room.storageQuota / (1024 * 1024 * 1024)), // Convert bytes to GB
        quotaUnit: 'GB',
        aclEnabled: room.aclEnabled || false
      });
    }
  }, [room]);

  // Update data room mutation
  const updateDataRoomMutation = useUpdateDataRoom({
    onSuccess: (data) => {
      // Show success toast
      toast.success(t('edit_modal.success_title', { defaultValue: 'Data room updated successfully!' }), {
        description: t('edit_modal.success_description', { 
          defaultValue: 'Data room settings have been updated.',
          roomName: data.dataRoom?.roomName || room?.roomName
        }),
      });
      
      handleClose();
    },
    onError: (error) => {
      console.error('Failed to update data room:', error.message);
      
      // Show error toast
      toast.error(t('edit_modal.error_title', { defaultValue: 'Failed to update data room' }), {
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
    // Clear error when user starts changing values
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const getQuotaInBytes = () => {
    if (formData.quota === -3) return -3; // Unlimited
    
    const quotaValue = parseInt(formData.quota);
    if (isNaN(quotaValue) || quotaValue <= 0) return -3;
    
    // Convert to bytes based on unit
    switch (formData.quotaUnit) {
      case 'MB':
        return quotaValue * 1024 * 1024;
      case 'GB':
        return quotaValue * 1024 * 1024 * 1024;
      case 'TB':
        return quotaValue * 1024 * 1024 * 1024 * 1024;
      default:
        return quotaValue;
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (formData.quota !== -3 && (isNaN(parseInt(formData.quota)) || parseInt(formData.quota) <= 0)) {
      newErrors.quota = t('edit_modal.errors.quota_invalid', { defaultValue: 'Please enter a valid quota value' });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    if (!room?.id) return;

    const updates = {
      quota: getQuotaInBytes(),
      acl: formData.aclEnabled
    };

    updateDataRoomMutation.mutate({
      roomId: room.roomId,
      updates
    });
  };

  const handleClose = () => {
    setErrors({});
    onClose();
  };

  const handleModalClose = () => {
    // Only prevent closing if mutation is actually in progress
    if (!updateDataRoomMutation.isPending) {
      handleClose();
    }
  };

  if (!room) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleModalClose}>
      <DialogContent className="max-w-md rtl:[&>button]:left-4 rtl:[&>button]:right-auto rtl:[&>button]:top-4">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-left rtl:text-right">
            <Icon name="Settings" size={16} />
            {t('edit_modal.title', { defaultValue: 'Edit Data Room Settings' })}
          </DialogTitle>
          <DialogDescription className="text-left rtl:text-right">
            {t('edit_modal.description', { 
              defaultValue: 'Update storage quota and access control settings for "{{roomName}}".',
              roomName: room.roomName 
            })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {/* Storage Configuration */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Icon name="HardDrive" size={14} />
                {t('edit_modal.storage_quota', { defaultValue: 'Storage Quota' })}
              </CardTitle>
              <CardDescription className="text-xs">
                {t('edit_modal.quota_hint', { defaultValue: 'Set storage limit (leave empty for unlimited)' })}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-1 space-y-2">
              <div className="flex items-center space-x-2 rtl:space-x-reverse rtl:space-x-2">
                <Checkbox
                  id="unlimited-quota"
                  checked={formData.quota === -3}
                  onCheckedChange={(checked) => handleInputChange('quota', checked ? -3 : 1)}
                  disabled={updateDataRoomMutation.isPending}
                />
                <Label htmlFor="unlimited-quota" className="text-sm cursor-pointer">
                  {t('edit_modal.quota_unlimited', { defaultValue: 'Unlimited' })}
                </Label>
              </div>
              
              {formData.quota !== -3 && (
                <div className="flex items-center space-x-2">
                  <Input
                    type="number"
                    min="1"
                    value={formData.quota}
                    onChange={(e) => handleInputChange('quota', e.target.value)}
                    placeholder="10"
                    className={`flex-1 ${errors.quota ? 'border-destructive' : ''}`}
                    disabled={updateDataRoomMutation.isPending}
                  />
                  <Select 
                    value={formData.quotaUnit} 
                    onValueChange={(value) => handleInputChange('quotaUnit', value)}
                    disabled={updateDataRoomMutation.isPending}
                  >
                    <SelectTrigger className="w-16 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MB">MB</SelectItem>
                      <SelectItem value="GB">GB</SelectItem>
                      <SelectItem value="TB">TB</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              {errors.quota && (
                <p className="text-xs text-destructive">{errors.quota}</p>
              )}
            </CardContent>
          </Card>

          {/* Access Control & Current Usage Combined */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Icon name="Shield" size={14} />
                {t('edit_modal.acl_settings', { defaultValue: 'Access Control' })}
                {room.currentSize > 0 && (
                  <>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-xs font-normal text-muted-foreground">
                      {t('edit_modal.storage_used', { defaultValue: 'Used:' })} {room.formattedSize}
                      {!room.isUnlimitedQuota && room.storageQuota > 0 && (
                        <span className="ml-1">
                          ({Math.round((room.currentSize / room.storageQuota) * 100)}%)
                        </span>
                      )}
                    </span>
                  </>
                )}
              </CardTitle>
              <CardDescription className="text-xs">
                {t('edit_modal.acl_hint', { defaultValue: 'Enable fine-grained permission control for groups' })}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-1">
              <div className="flex items-center space-x-2 rtl:space-x-reverse rtl:space-x-2">
                <Checkbox
                  id="acl-enabled"
                  checked={formData.aclEnabled}
                  onCheckedChange={(checked) => handleInputChange('aclEnabled', checked)}
                  disabled={updateDataRoomMutation.isPending}
                />
                <Label htmlFor="acl-enabled" className="text-sm cursor-pointer">
                  {t('edit_modal.acl_enabled', { defaultValue: 'Enable Advanced Permissions (ACL)' })}
                </Label>
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
        </div>

        <DialogFooter className="pt-2 rtl:flex-row-reverse rtl:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={handleModalClose}
            disabled={updateDataRoomMutation.isPending}
            size="sm"
          >
            {t('edit_modal.cancel', { defaultValue: 'Cancel' })}
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={updateDataRoomMutation.isPending}
            size="sm"
            className="gap-2 rtl:flex-row-reverse"
          >
            {updateDataRoomMutation.isPending ? (
              <Icon name="Loader2" size={14} className="animate-spin" />
            ) : (
              <Icon name="Save" size={14} />
            )}
            {updateDataRoomMutation.isPending 
              ? t('edit_modal.saving', { defaultValue: 'Saving...' })
              : t('edit_modal.save', { defaultValue: 'Save Changes' })
            }
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditDataRoomModal;
