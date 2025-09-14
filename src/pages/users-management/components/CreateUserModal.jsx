import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useCreateUser } from '@/hooks/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/Checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
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
 * Create User Modal Component
 * Creates a new user in the Nextcloud system using the real API
 */
const CreateUserModal = ({ isOpen, onClose }) => {
  const { t } = useTranslation('users-management');
  const [formData, setFormData] = useState({
    userid: '',
    password: '',
    displayName: '',
    email: '',
    groups: []
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  // Available groups for user assignment (using common Nextcloud groups)
  const availableGroups = ['admin'];

  // Create user mutation
  const createUserMutation = useCreateUser({
    onSuccess: (data) => {
      // Show success toast
      toast.success('User created successfully!', {
        description: `User "${data.user.displayname}" has been created and added to the system.`,
      });
      
      // Show warnings if some groups failed to assign
      if (data.warnings && data.warnings.length > 0) {
        console.warn('Group assignment warnings:', data.warnings);
        toast.warning('Group assignment warning', {
          description: data.warnings.join('. '),
        });
      }
      
      handleClose();
      // Reset form
      setFormData({
        userid: '',
        password: '',
        displayName: '',
        email: '',
        groups: []
      });
      setErrors({});
      setShowPassword(false);
      setCopySuccess(false);
    },
    onError: (error) => {
      console.error('Failed to create user:', error.message);
      
      // Show error toast
      toast.error('Failed to create user', {
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
      groups: prev.groups.includes(groupId)
        ? prev.groups.filter(g => g !== groupId)
        : [...prev.groups, groupId]
    }));
  };

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(prev => ({ ...prev, password }));
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
      
      // Show copy success toast
      toast.success('Password copied!', {
        description: 'The password has been copied to your clipboard.',
      });
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
      toast.error('Copy failed', {
        description: 'Unable to copy password to clipboard.',
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.userid.trim()) {
      newErrors.userid = t('form.errors.username_required');
    } else if (formData.userid.length < 3) {
      newErrors.userid = t('form.errors.username_min_length');
    }

    if (!formData.password.trim()) {
      newErrors.password = t('form.errors.password_required');
    } else if (formData.password.length < 8) {
      newErrors.password = t('form.errors.password_min_length');
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t('form.errors.email_invalid');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const userData = {
      userid: formData.userid.trim(),
      password: formData.password,
      displayName: formData.displayName.trim() || formData.userid.trim(),
      email: formData.email.trim(),
      groups: formData.groups
    };

    createUserMutation.mutate(userData);
  };

  const handleClose = () => {
    setErrors({});
    setShowPassword(false);
    setCopySuccess(false);
    onClose();
  };

  const handleModalClose = () => {
    // Only prevent closing if mutation is actually in progress
    if (!createUserMutation.isPending) {
      handleClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleModalClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center gap-2">
            <Icon name="UserPlus" size={18} />
            {t('create_user_modal.title')}
          </DialogTitle>
          <DialogDescription className="text-sm">
            {t('create_user_modal.description')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {/* Username Field */}
            <div className="space-y-1">
              <Label htmlFor="userid" className="text-xs font-medium text-muted-foreground">
                {t('create_user_modal.username')} *
              </Label>
              <Input
                id="userid"
                type="text"
                value={formData.userid}
                onChange={(e) => handleInputChange('userid', e.target.value)}
                placeholder={t('create_user_modal.username_placeholder')}
                className={`text-sm ${errors.userid ? 'border-destructive' : ''}`}
                disabled={createUserMutation.isPending}
              />
              {errors.userid && (
                <p className="text-xs text-destructive">{errors.userid}</p>
              )}
            </div>

            {/* Display Name Field */}
            <div className="space-y-1">
              <Label htmlFor="displayName" className="text-xs font-medium text-muted-foreground">
                {t('create_user_modal.display_name')}
              </Label>
              <Input
                id="displayName"
                type="text"
                value={formData.displayName}
                onChange={(e) => handleInputChange('displayName', e.target.value)}
                placeholder={t('create_user_modal.display_name_placeholder')}
                className="text-sm"
                disabled={createUserMutation.isPending}
              />
            </div>
          </div>

          {/* Email Field */}
          <div className="space-y-1">
            <Label htmlFor="email" className="text-xs font-medium text-muted-foreground">
              {t('create_user_modal.email')}
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder={t('create_user_modal.email_placeholder')}
              className={`text-sm ${errors.email ? 'border-destructive' : ''}`}
              disabled={createUserMutation.isPending}
            />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email}</p>
            )}
          </div>

          <Separator />

          {/* Password Section */}
          <div className="space-y-1">
            <Label className="text-xs font-medium text-muted-foreground">
              {t('create_user_modal.password')} *
            </Label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                placeholder={t('create_user_modal.password_placeholder')}
                className={`text-sm ${errors.password ? 'border-destructive pr-20' : 'pr-20'}`}
                disabled={createUserMutation.isPending}
              />
              <div className="absolute right-1 top-1/2 -translate-y-1/2 flex gap-1">
                {formData.password && (
                  <>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowPassword(!showPassword)}
                      className="h-8 w-8 p-0"
                      disabled={createUserMutation.isPending}
                    >
                      <Icon name={showPassword ? "EyeOff" : "Eye"} size={12} />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(formData.password)}
                      className="h-8 w-8 p-0"
                      disabled={createUserMutation.isPending}
                    >
                      <Icon name={copySuccess ? "Check" : "Copy"} size={12} />
                    </Button>
                  </>
                )}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={generateRandomPassword}
                  className="h-8 w-8 p-0"
                  disabled={createUserMutation.isPending}
                >
                  <Icon name="RefreshCw" size={12} />
                </Button>
              </div>
            </div>
            {errors.password && (
              <p className="text-xs text-destructive">{errors.password}</p>
            )}
            <p className="text-xs text-muted-foreground">
              {t('create_user_modal.password_hint')}
            </p>
          </div>

          <Separator />

          {/* Groups Section */}
          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground">
              {t('create_user_modal.groups')}
            </Label>
            <div className="grid grid-cols-2 gap-2">
              {availableGroups.map((group) => (
                <div key={group} className="flex items-center space-x-2">
                  <Checkbox
                    id={group}
                    checked={formData.groups.includes(group)}
                    onCheckedChange={() => handleGroupToggle(group)}
                    disabled={createUserMutation.isPending}
                  />
                  <Label htmlFor={group} className="text-xs cursor-pointer capitalize">
                    {group}
                  </Label>
                </div>
              ))}
            </div>
            {formData.groups.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {formData.groups.map((group) => (
                  <Badge key={group} variant="secondary" className="text-xs py-0 px-2">
                    {group}
                  </Badge>
                ))}
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
            disabled={createUserMutation.isPending}
            size="sm"
          >
            {t('create_user_modal.cancel')}
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={createUserMutation.isPending}
            size="sm"
            className="gap-2"
          >
            {createUserMutation.isPending ? (
              <Icon name="Loader2" size={14} className="animate-spin" />
            ) : (
              <Icon name="UserPlus" size={14} />
            )}
            {createUserMutation.isPending 
              ? t('create_user_modal.creating')
              : t('create_user_modal.create')
            }
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateUserModal;
