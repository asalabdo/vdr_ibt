import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useCreateUser, useGroups, usePromoteUserToSubadmin } from '@/hooks/api';
import { usePermissions } from '@/hooks/api/useAuth';
import { filterGroupsByPermissions } from '@/lib/groupFilters';
import { validateUsername, validatePassword, validateEmail } from '@/lib/formValidation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
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
    role: 'user', // 'user', 'admin', or 'subadmin'
    subadminGroups: [], // For subadmin role - which groups to manage
    groups: [] // Regular groups (non-admin, non-subadmin)
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  // Fetch available groups dynamically
  // Get user permissions  
  const { isAdmin, isSubadmin, managedGroups, canManageAllGroups } = usePermissions();

  const { 
    data: groupsData, 
    isLoading: isLoadingGroups 
  } = useGroups({ enabled: isOpen });

  // Filter groups based on user permissions using centralized logic
  const allGroups = groupsData?.groups || [];
  const userPermissions = {
    isAdmin,
    canManageAllGroups,
    managedGroups
  };
  
  const availableGroups = filterGroupsByPermissions(allGroups, userPermissions);
  const companyGroups = availableGroups; // Company groups for subadmin role assignment

  // Subadmin promotion mutation
  const promoteToSubadminMutation = usePromoteUserToSubadmin();

  // Create user mutation
  const createUserMutation = useCreateUser({
    onSuccess: async (data) => {
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
      
      // Handle subadmin promotion if needed
      if (formData.role === 'subadmin' && formData.subadminGroups.length > 0) {
        const promotionPromises = formData.subadminGroups.map(groupId => 
          promoteToSubadminMutation.mutateAsync({ 
            userId: data.user.id || data.user.username, 
            groupId 
          }).catch(error => {
            console.warn(`Failed to promote to subadmin of ${groupId}:`, error.message);
            return { error: error.message, groupId };
          })
        );
        
        try {
          const results = await Promise.allSettled(promotionPromises);
          const failures = results
            .filter(result => result.status === 'fulfilled' && result.value?.error)
            .map(result => result.value);
          
          if (failures.length > 0) {
            toast.warning('Subadmin assignment warning', {
              description: `Failed to assign subadmin role for: ${failures.map(f => f.groupId).join(', ')}`,
            });
          } else {
            toast.success('Subadmin role assigned', {
              description: `User promoted to company administrator for ${formData.subadminGroups.length} companies.`,
            });
          }
        } catch (error) {
          console.error('Subadmin promotion error:', error);
          toast.error('Subadmin assignment failed', {
            description: 'User was created but subadmin role assignment failed.',
          });
        }
      }
      
      handleClose();
      // Reset form
      setFormData({
        userid: '',
        password: '',
        displayName: '',
        email: '',
        role: 'user',
        subadminGroups: [],
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

  const handleRoleChange = (newRole) => {
    setFormData(prev => ({
      ...prev,
      role: newRole,
      // Clear role-specific selections when changing roles
      subadminGroups: newRole === 'subadmin' ? prev.subadminGroups : [],
      groups: newRole === 'user' ? prev.groups : []
    }));
  };

  const handleGroupToggle = (groupId) => {
    setFormData(prev => ({
      ...prev,
      groups: prev.groups.includes(groupId)
        ? prev.groups.filter(g => g !== groupId)
        : [...prev.groups, groupId]
    }));
  };

  const handleSubadminGroupToggle = (groupId) => {
    setFormData(prev => ({
      ...prev,
      subadminGroups: prev.subadminGroups.includes(groupId)
        ? prev.subadminGroups.filter(g => g !== groupId)
        : [...prev.subadminGroups, groupId]
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

    // Use centralized validation functions
    const usernameError = validateUsername(formData.userid);
    if (usernameError) {
      newErrors.userid = usernameError;
    }

    const passwordError = validatePassword(formData.password);
    if (passwordError) {
      newErrors.password = passwordError;
    }

    if (formData.email) {
      const emailError = validateEmail(formData.email);
      if (emailError) {
        newErrors.email = emailError;
      }
    }

    // Validate role-specific requirements
    if (formData.role === 'subadmin' && formData.subadminGroups.length === 0) {
      newErrors.role = t('form.errors.subadmin_groups_required', 'At least one company must be selected for Company Administrator role');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    // Prepare groups based on role selection
    let finalGroups = [...formData.groups];
    
    // Add admin group if admin role is selected
    if (formData.role === 'admin') {
      finalGroups.push('admin');
    }
    
    // For subadmin, we'll handle subadmin assignment after user creation
    // Regular groups are handled during user creation

    const userData = {
      userid: formData.userid.trim(),
      password: formData.password,
      displayName: formData.displayName.trim() || formData.userid.trim(),
      email: formData.email.trim(),
      groups: finalGroups
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
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto rtl:[&>button]:left-4 rtl:[&>button]:right-auto rtl:[&>button]:top-4">
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center gap-2 rtl:text-right">
            <Icon name="UserPlus" size={18} />
            {t('create_user_modal.title')}
          </DialogTitle>
          <DialogDescription className="text-sm rtl:text-right">
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
                className={`text-sm ${errors.password ? 'border-destructive pr-20 rtl:pr-2 rtl:pl-20' : 'pr-20 rtl:pr-2 rtl:pl-20'}`}
                disabled={createUserMutation.isPending}
              />
              <div className="absolute right-1 rtl:right-auto rtl:left-1 top-1/2 -translate-y-1/2 flex gap-1">
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

          {/* Role Selection Section */}
          <div className="space-y-3">
            <Label className="text-xs font-medium text-muted-foreground">
              {t('create_user_modal.user_role', 'User Role')} *
            </Label>
            
            <RadioGroup 
              value={formData.role} 
              onValueChange={handleRoleChange}
              disabled={createUserMutation.isPending}
              className="space-y-2"
            >
              {/* Regular User */}
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <RadioGroupItem value="user" id="role-user" />
                <Label htmlFor="role-user" className="text-sm cursor-pointer">
                  <div className="flex flex-col">
                    <span className="font-medium">{t('create_user_modal.role_user', 'Regular User')}</span>
                    <span className="text-xs text-muted-foreground">
                      {t('create_user_modal.role_user_desc', 'Standard user with basic permissions')}
                    </span>
                  </div>
                </Label>
              </div>

              {/* Administrator - Only available to admins */}
              {isAdmin && (
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <RadioGroupItem value="admin" id="role-admin" />
                  <Label htmlFor="role-admin" className="text-sm cursor-pointer">
                    <div className="flex flex-col">
                      <span className="font-medium">{t('create_user_modal.role_admin', 'Administrator')}</span>
                      <span className="text-xs text-muted-foreground">
                        {t('create_user_modal.role_admin_desc', 'Full system access and user management')}
                      </span>
                    </div>
                  </Label>
                </div>
              )}

              {/* Company Administrator (Subadmin) */}
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <RadioGroupItem value="subadmin" id="role-subadmin" />
                <Label htmlFor="role-subadmin" className="text-sm cursor-pointer">
                  <div className="flex flex-col">
                    <span className="font-medium">{t('create_user_modal.role_subadmin', 'Company Administrator')}</span>
                    <span className="text-xs text-muted-foreground">
                      {t('create_user_modal.role_subadmin_desc', 'Manages users and resources for specific companies')}
                    </span>
                  </div>
                </Label>
              </div>
            </RadioGroup>

            {/* Role validation error */}
            {errors.role && (
              <p className="text-xs text-destructive">{errors.role}</p>
            )}

            {/* Company Selection for Subadmin */}
            {formData.role === 'subadmin' && (
              <div className="space-y-2 mt-3 pl-6 border-l-2 border-primary/20">
                <Label className="text-xs font-medium text-muted-foreground">
                  {t('create_user_modal.managed_companies', 'Managed Companies')} *
                </Label>
                {isLoadingGroups ? (
                  <div className="text-xs text-muted-foreground">Loading companies...</div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {companyGroups.map((group) => (
                      <div key={group.id} className="flex items-center space-x-2 rtl:space-x-reverse">
                        <Checkbox
                          id={`subadmin-${group.id}`}
                          checked={formData.subadminGroups.includes(group.id)}
                          onCheckedChange={() => handleSubadminGroupToggle(group.id)}
                          disabled={createUserMutation.isPending}
                        />
                        <Label htmlFor={`subadmin-${group.id}`} className="text-xs cursor-pointer">
                          {group.displayName || group.id}
                        </Label>
                      </div>
                    ))}
                  </div>
                )}
                {formData.subadminGroups.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {formData.subadminGroups.map((groupId) => (
                      <Badge key={groupId} variant="outline" className="text-xs py-0 px-2">
                        {companyGroups.find(g => g.id === groupId)?.displayName || groupId}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Information for subadmins about limited group access */}
            {(isSubadmin && !isAdmin) && (
              <Alert className="mt-3">
                <Icon name="Info" size={14} />
                <AlertDescription className="text-sm">
                  As a Company Administrator, you can only assign users to the companies you manage: {Array.isArray(managedGroups) ? managedGroups.join(', ') : 'None'}.
                </AlertDescription>
              </Alert>
            )}

            {/* Regular Groups for Regular Users */}
            {formData.role === 'user' && availableGroups.length > 0 && (
              <div className="space-y-2 mt-3 pl-6 border-l-2 border-primary/20">
                <Label className="text-xs font-medium text-muted-foreground">
                  {t('create_user_modal.additional_groups', 'Additional Groups')}
                </Label>
                {isLoadingGroups ? (
                  <div className="text-xs text-muted-foreground">Loading groups...</div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {availableGroups.map((group) => (
                      <div key={group.id} className="flex items-center space-x-2 rtl:space-x-reverse">
                        <Checkbox
                          id={`group-${group.id}`}
                          checked={formData.groups.includes(group.id)}
                          onCheckedChange={() => handleGroupToggle(group.id)}
                          disabled={createUserMutation.isPending}
                        />
                        <Label htmlFor={`group-${group.id}`} className="text-xs cursor-pointer">
                          {group.displayName || group.id}
                        </Label>
                      </div>
                    ))}
                  </div>
                )}
                {formData.groups.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {formData.groups.map((groupId) => (
                      <Badge key={groupId} variant="secondary" className="text-xs py-0 px-2">
                        {availableGroups.find(g => g.id === groupId)?.displayName || groupId}
                      </Badge>
                    ))}
                  </div>
                )}
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

        <DialogFooter className="rtl:flex-row-reverse">
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
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateUserModal;
