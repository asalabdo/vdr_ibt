import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import Icon from '@/components/AppIcon';
import { 
  useUserDetails, 
  useUpdateUserDisplayName,
  useUpdateUserEmail,
  useUpdateUserPassword,
  useEnableUser,
  useDisableUser
} from '@/hooks/api';

/**
 * Edit User Modal Component
 * Allows comprehensive editing of user information
 */
const EditUserModal = ({ isOpen, onClose, userId }) => {
  const { t } = useTranslation('users-management');

  // Form states
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [hasChanges, setHasChanges] = useState(false);

  // Fetch user details
  const { data: user, isLoading, error, refetch } = useUserDetails(userId, { 
    enabled: isOpen && !!userId 
  });

  // Mutations
  const updateDisplayNameMutation = useUpdateUserDisplayName({
    onSuccess: () => {
      toast.success(t('edit.success_display_name'));
      setHasChanges(false);
    },
    onError: (error) => {
      toast.error(t('edit.error_display_name'), {
        description: error.message,
      });
    }
  });

  const updateEmailMutation = useUpdateUserEmail({
    onSuccess: () => {
      toast.success(t('edit.success_email'));
      setHasChanges(false);
    },
    onError: (error) => {
      toast.error(t('edit.error_email'), {
        description: error.message,
      });
    }
  });

  const updatePasswordMutation = useUpdateUserPassword({
    onSuccess: () => {
      toast.success(t('edit.success_password'));
      setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
      setHasChanges(false);
    },
    onError: (error) => {
      toast.error(t('edit.error_password'), {
        description: error.message,
      });
    }
  });

  const enableUserMutation = useEnableUser({
    onSuccess: () => {
      toast.success(t('edit.success_enable'));
      refetch();
    },
    onError: (error) => {
      toast.error(t('edit.error_enable'), {
        description: error.message,
      });
    }
  });

  const disableUserMutation = useDisableUser({
    onSuccess: () => {
      toast.success(t('edit.success_disable'));
      refetch();
    },
    onError: (error) => {
      toast.error(t('edit.error_disable'), {
        description: error.message,
      });
    }
  });

  // Initialize form data when user data loads
  useEffect(() => {
    if (user) {
      setFormData({
        displayName: user.displayname || '',
        email: user.email || '',
        password: '',
        confirmPassword: ''
      });
      setHasChanges(false);
    }
  }, [user]);

  // Handle input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      // Check if there are changes from original user data
      if (user) {
        const hasDisplayNameChange = newData.displayName !== (user.displayname || '');
        const hasEmailChange = newData.email !== (user.email || '');
        const hasPasswordChange = newData.password !== '';
        
        setHasChanges(hasDisplayNameChange || hasEmailChange || hasPasswordChange);
      }
      
      return newData;
    });
  };

  // Handle status toggle
  const handleStatusToggle = (enabled) => {
    if (enabled) {
      enableUserMutation.mutate(userId);
    } else {
      disableUserMutation.mutate(userId);
    }
  };

  // Handle form submission
  const handleSave = async () => {
    if (!user) return;

    const updates = [];

    // Update display name if changed
    if (formData.displayName !== (user.displayname || '')) {
      updates.push(
        updateDisplayNameMutation.mutateAsync({ userId, displayName: formData.displayName })
      );
    }

    // Update email if changed
    if (formData.email !== (user.email || '')) {
      updates.push(
        updateEmailMutation.mutateAsync({ userId, email: formData.email })
      );
    }

    // Update password if provided
    if (formData.password) {
      if (formData.password !== formData.confirmPassword) {
        toast.error(t('edit.error_password_mismatch'));
        return;
      }
      updates.push(
        updatePasswordMutation.mutateAsync({ userId, password: formData.password })
      );
    }

    // Execute all updates
    try {
      await Promise.all(updates);
      if (updates.length > 0) {
        toast.success(t('edit.success_general'));
      }
    } catch (error) {
      // Individual errors are handled by mutation callbacks
      console.error('Some updates failed:', error);
    }
  };

  const getUserInitials = (userData) => {
    if (!userData) return '?';
    const name = userData.displayname || userData.username || '';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const isLoading_mutations = updateDisplayNameMutation.isPending || 
                            updateEmailMutation.isPending || 
                            updatePasswordMutation.isPending ||
                            enableUserMutation.isPending ||
                            disableUserMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center gap-2">
            <Icon name="Edit" size={18} />
            {user ? t('modal.edit_user_title', { username: user.username }) : t('modal.edit_user_loading')}
          </DialogTitle>
          <DialogDescription className="text-sm">
            {t('modal.edit_user_description')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {isLoading && (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-1">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="space-y-1">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <Icon name="AlertCircle" size={16} />
              <AlertDescription>
                {t('edit.error_loading')}: {error.message}
              </AlertDescription>
            </Alert>
          )}

          {user && (
            <>
              {/* Profile Header */}
              <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-primary font-medium">
                    {getUserInitials(user)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold">{user.displayname}</h3>
                  <p className="text-muted-foreground text-sm">@{user.username}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge 
                      variant={user.enabled ? "default" : "secondary"}
                      className={user.enabled ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" : ""}
                    >
                      <Icon 
                        name={user.enabled ? "CheckCircle" : "XCircle"} 
                        size={10} 
                        className="mr-1" 
                      />
                      {user.enabled ? t('status.enabled') : t('status.disabled')}
                    </Badge>
                    {user.isAdmin && (
                      <Badge variant="outline" className="border-amber-200 text-amber-800 bg-amber-50 dark:border-amber-800 dark:text-amber-300 dark:bg-amber-950">
                        <Icon name="Shield" size={10} className="mr-1" />
                        {t('status.admin')}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Basic Information */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Icon name="User" size={14} />
                    {t('edit.basic_info')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label htmlFor="displayName" className="text-xs font-medium text-muted-foreground">{t('edit.display_name')}</Label>
                      <Input
                        id="displayName"
                        value={formData.displayName}
                        onChange={(e) => handleInputChange('displayName', e.target.value)}
                        placeholder={t('edit.display_name_placeholder')}
                        className="text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="email" className="text-xs font-medium text-muted-foreground">{t('edit.email')}</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder={t('edit.email_placeholder')}
                        className="text-sm"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Security */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Icon name="Lock" size={14} />
                    {t('edit.security')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label htmlFor="password" className="text-xs font-medium text-muted-foreground">{t('edit.new_password')}</Label>
                      <Input
                        id="password"
                        type="password"
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        placeholder={t('edit.password_placeholder')}
                        className="text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="confirmPassword" className="text-xs font-medium text-muted-foreground">{t('edit.confirm_password')}</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                        placeholder={t('edit.confirm_password_placeholder')}
                        className="text-sm"
                      />
                    </div>
                  </div>
                  {formData.password && formData.confirmPassword && 
                   formData.password !== formData.confirmPassword && (
                    <Alert variant="destructive">
                      <Icon name="AlertCircle" size={16} />
                      <AlertDescription>
                        {t('edit.password_mismatch')}
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>

              {/* Account Status */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Icon name="Settings" size={14} />
                    {t('edit.account_status')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-xs font-medium text-muted-foreground">{t('edit.account_enabled')}</Label>
                      <p className="text-xs text-muted-foreground">
                        {t('edit.account_enabled_description')}
                      </p>
                    </div>
                    <Switch
                      checked={user.enabled}
                      onCheckedChange={handleStatusToggle}
                      disabled={enableUserMutation.isPending || disableUserMutation.isPending}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Groups & Permissions */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Icon name="Users" size={14} />
                    {t('edit.groups_permissions')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground block mb-2">{t('edit.assigned_groups')}</Label>
                    <div className="flex flex-wrap gap-1">
                      {user.groups && user.groups.length > 0 ? (
                        user.groups.map((group) => (
                          <Badge key={group} variant="outline" className="text-xs py-0 px-2">
                            {group}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-muted-foreground text-xs">
                          {t('edit.no_groups')}
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {t('edit.groups_note')}
                  </p>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-2 pt-3">
          <Button variant="outline" onClick={onClose} size="sm">
            {t('modal.close')}
          </Button>
          {user && (
            <Button 
              onClick={handleSave}
              disabled={!hasChanges || isLoading_mutations}
              size="sm"
            >
              {isLoading_mutations ? (
                <Icon name="Loader2" size={14} className="mr-2 animate-spin" />
              ) : (
                <Icon name="Save" size={14} className="mr-2" />
              )}
              {t('edit.save_changes')}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditUserModal;
