import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/AppIcon';
import UserRoleDisplay from './UserRoleDisplay';
import {
  useMakeUserAdmin,
  useRemoveAdminPrivileges,
  usePromoteUserToSubadmin,
  useDemoteUserFromSubadmin,
  useUserRole,
} from '@/hooks/api/useUserRoles';
import { usePermissions } from '@/hooks/api/useAuth';

/**
 * UserRoleManager Component
 * Manages user role changes with proper permission checks
 * 
 * @param {Object} props
 * @param {Object} props.user - User data
 * @param {string} props.userId - User ID
 * @param {Array} [props.availableGroups] - Available groups for subadmin assignment
 * @param {Function} [props.onRoleChange] - Callback when role changes
 */
const UserRoleManager = ({ 
  user, 
  userId, 
  availableGroups = [], 
  onRoleChange 
}) => {
  const { t } = useTranslation('users-management');
  const { isAdmin } = usePermissions();
  const { 
    role: userRole, 
    isAdmin: isUserAdmin, 
    isSubadmin: isUserSubadmin, 
    subadminGroups 
  } = useUserRole(user, userId);
  
  // Mutations
  const makeAdminMutation = useMakeUserAdmin({
    onSuccess: () => {
      onRoleChange?.('admin');
    }
  });

  const removeAdminMutation = useRemoveAdminPrivileges({
    onSuccess: () => {
      onRoleChange?.('user');
    }
  });

  const promoteSubadminMutation = usePromoteUserToSubadmin({
    onSuccess: () => {
      onRoleChange?.('subadmin');
    }
  });

  const demoteSubadminMutation = useDemoteUserFromSubadmin({
    onSuccess: () => {
      onRoleChange?.('user');
    }
  });

  // Event handlers
  const handleMakeAdmin = () => {
    makeAdminMutation.mutate(userId);
  };

  const handleRemoveAdmin = () => {
    removeAdminMutation.mutate(userId);
  };

  const handlePromoteToSubadmin = (groupId) => {
    promoteSubadminMutation.mutate({ userId, groupId });
  };

  const handleDemoteFromSubadmin = (groupId) => {
    demoteSubadminMutation.mutate({ userId, groupId });
  };

  const isLoading = makeAdminMutation.isPending || 
                   removeAdminMutation.isPending || 
                   promoteSubadminMutation.isPending || 
                   demoteSubadminMutation.isPending;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Icon name="Shield" size={14} />
          {t('edit.role_management', 'Role Management')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Role Display */}
        <div className="space-y-2">
          <Label className="text-xs font-medium text-muted-foreground">
            {t('edit.current_role', 'Current Role')}
          </Label>
          <div className="flex items-center gap-2">
            <UserRoleDisplay user={user} userId={userId} size="sm" />
          </div>
        </div>

        {/* Administrator Controls - Only for Admins */}
        {isAdmin ? (
          <>
            {!isUserAdmin && (
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">
                  {t('edit.administrator_promotion', 'Administrator Promotion')}
                </Label>
                <Button
                  variant="outline" 
                  size="sm"
                  onClick={handleMakeAdmin}
                  disabled={isLoading}
                  className="w-full gap-2"
                >
                  {makeAdminMutation.isPending ? (
                    <Icon name="Loader2" size={12} className="animate-spin" />
                  ) : (
                    <Icon name="ShieldCheck" size={12} />
                  )}
                  {t('edit.make_administrator', 'Promote to Administrator')}
                </Button>
                <p className="text-xs text-muted-foreground">
                  {t('edit.admin_promotion_desc', 'Grant full system access and user management privileges')}
                </p>
              </div>
            )}

            {isUserAdmin && (
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">
                  {t('edit.administrator_demotion', 'Administrator Demotion')}
                </Label>
                <Button
                  variant="outline" 
                  size="sm"
                  onClick={handleRemoveAdmin}
                  disabled={isLoading}
                  className="w-full gap-2 text-orange-600 hover:text-orange-700"
                >
                  {removeAdminMutation.isPending ? (
                    <Icon name="Loader2" size={12} className="animate-spin" />
                  ) : (
                    <Icon name="ShieldOff" size={12} />
                  )}
                  {t('edit.remove_administrator', 'Remove Administrator Privileges')}
                </Button>
                <p className="text-xs text-muted-foreground">
                  {t('edit.admin_demotion_desc', 'Remove administrator privileges and convert to regular user')}
                </p>
              </div>
            )}
          </>
        ) : (
          <Alert>
            <Icon name="Info" size={14} />
            <AlertDescription className="text-sm">
              Administrator role management requires full administrator privileges. Only administrators can promote or demote other users to/from administrator roles.
            </AlertDescription>
          </Alert>
        )}

        {/* Company Administrator (Subadmin) Controls - Only for Admins */}
        {isAdmin ? (
          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground">
              {t('edit.company_administrator', 'Company Administrator')}
            </Label>
            
            {/* Current Subadmin Groups */}
            {isUserSubadmin && (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">
                  {t('edit.manages_companies', 'Manages Companies')}:
                </p>
                <div className="flex flex-wrap gap-1">
                  {subadminGroups?.map((groupId) => (
                    <div key={groupId} className="flex items-center gap-1">
                      <Badge variant="outline" className="text-xs">
                        {availableGroups.find(g => g.id === groupId)?.displayName || groupId}
                      </Badge>
                      {/* Remove Sub-admin - Admin Only */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDemoteFromSubadmin(groupId)}
                        disabled={isLoading}
                        className="h-auto p-0.5 text-red-500 hover:text-red-600"
                        title={t('edit.remove_company_management', 'Remove company management privileges')}
                      >
                        <Icon name="X" size={10} />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Add Subadmin to Companies - Admin Only */}
            {availableGroups.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">
                  {t('edit.add_company_management', 'Add Company Management')}:
                </p>
                <p className="text-[10px] text-muted-foreground/70 italic">
                  {t('edit.subadmin_promotion_note', 'Note: User will be added to the group and granted management privileges')}
                </p>
                <div className="grid grid-cols-1 gap-1 max-h-32 overflow-y-auto">
                  {availableGroups
                    .filter(group => !(subadminGroups || []).includes(group.id))
                    .map((group) => (
                    <Button
                      key={group.id}
                      variant="ghost"
                      size="sm"
                      onClick={() => handlePromoteToSubadmin(group.id)}
                      disabled={isLoading}
                      className="justify-start gap-2 h-auto py-1"
                    >
                      {promoteSubadminMutation.isPending ? (
                        <Icon name="Loader2" size={10} className="animate-spin" />
                      ) : (
                        <Icon name="Plus" size={10} />
                      )}
                      <span className="text-xs">{group.displayName || group.id}</span>
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground">
              {t('edit.company_administrator', 'Company Administrator')}
            </Label>
            
            {/* Read-only view for non-admins */}
            {isUserSubadmin && (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">
                  {t('edit.manages_companies', 'Manages Companies')}:
                </p>
                <div className="flex flex-wrap gap-1">
                  {subadminGroups?.map((groupId) => (
                    <Badge key={groupId} variant="outline" className="text-xs">
                      {availableGroups.find(g => g.id === groupId)?.displayName || groupId}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            <Alert>
              <Icon name="Info" size={14} />
              <AlertDescription className="text-sm">
                {t('edit.subadmin_permission_required', 'Only system administrators can assign or remove company administrator privileges. Sub-admins can only manage existing users within their assigned companies.')}
              </AlertDescription>
            </Alert>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UserRoleManager;
