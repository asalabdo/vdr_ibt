import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Header from '../../components/ui/Header';
import { Button } from '@/components/ui/Button';
import { Separator } from '@/components/ui/separator';
import Icon from '../../components/AppIcon';
import UsersTable from './components/UsersTable';
import CreateUserModal from './components/CreateUserModal';

const UsersManagement = () => {
  const { t } = useTranslation('users-management');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handleCreateUser = () => {
    setIsCreateModalOpen(true);
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-4">
        <div className="max-w-7xl mx-auto px-6 py-8">
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
              <Button 
                onClick={handleCreateUser}
                className="gap-2"
              >
                <Icon name="Plus" size={16} />
                {t('actions.create_user')}
              </Button>
              <Button variant="outline" className="gap-2">
                <Icon name="Download" size={16} />
                {t('actions.export_users')}
              </Button>
            </div>
          </div>

          <Separator className="my-8" />

          {/* Users Management Table */}
          <UsersTable />
        </div>
      </main>

      {/* Create User Modal */}
      <CreateUserModal 
        isOpen={isCreateModalOpen}
        onClose={handleCloseCreateModal}
      />
    </div>
  );
};

export default UsersManagement;