import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Icon from '@/components/AppIcon';
import { usePermissions } from '@/hooks/api/useAuth';
import UsersTable from './components/UsersTable';
import CreateUserModal from './components/CreateUserModal';

const UsersManagement = () => {
  const { t } = useTranslation('users-management');
  const { isAdmin, isSubadmin, managedGroups } = usePermissions();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handleCreateUser = () => {
    setIsCreateModalOpen(true);
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
  };

  return (
    <div className="px-6 py-8">
          {/* Header Section */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
            <div className="mb-4 lg:mb-0">
              <h1 className="text-3xl font-bold text-foreground mb-2">
                {t('title')}
              </h1>
              <p className="text-muted-foreground">
                {t('subtitle')}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Only admins can create new users - Sub-admins can only edit existing users */}
              {isAdmin && (
                <Button 
                  onClick={handleCreateUser}
                  className="gap-2"
                >
                  <Icon name="Plus" size={16} />
                  {t('actions.create_user')}
                </Button>
              )}
            </div>
          </div>

          <Separator className="my-8" />

          {/* Information alert for sub-admins about their limited permissions */}
          {isSubadmin && !isAdmin && (
            <Alert className="mb-6">
              <Icon name="Info" size={16} />
              <AlertDescription>
                <strong>Company Administrator Access:</strong> You can view and edit existing users in your assigned companies ({Array.isArray(managedGroups) ? managedGroups.join(', ') : 'None'}). 
                Only system administrators can create new users. If you need to add a new user, please contact your system administrator.
              </AlertDescription>
            </Alert>
          )}

          {/* Users Management Table */}
          <UsersTable />

      {/* Create User Modal */}
      <CreateUserModal 
        isOpen={isCreateModalOpen}
        onClose={handleCloseCreateModal}
      />
    </div>
  );
};

export default UsersManagement;