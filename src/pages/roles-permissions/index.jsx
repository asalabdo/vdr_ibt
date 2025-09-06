import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Header from '../../components/ui/Header';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Icon from '../../components/AppIcon';
import RoleCard from './components/RoleCard';
import CreateRoleModal from './components/CreateRoleModal';

const RolesPermissions = () => {
  const { t } = useTranslation('roles-permissions');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Mock roles data using translation keys
  const [rolesData] = useState([
    {
      id: 1,
      nameKey: 'mock_data.roles.admin.name',
      descriptionKey: 'mock_data.roles.admin.description',
      userCount: 1,
      createdDate: '2025-08-31T10:00:00Z',
      permissions: [
        { name: 'view_questions', granted: true },
        { name: 'reply_questions', granted: true },
        { name: 'approve_answers', granted: true },
        { name: 'upload_files', granted: true },
        { name: 'user_management', granted: true },
        { name: 'role_management', granted: true },
        { name: 'system_settings', granted: true }
      ]
    },
    {
      id: 2,
      nameKey: 'mock_data.roles.qa_observer_full.name',
      descriptionKey: 'mock_data.roles.qa_observer_full.description',
      userCount: 2,
      createdDate: '2025-08-31T10:00:00Z',
      permissions: [
        { name: 'view_questions', granted: true },
        { name: 'reply_questions', granted: true },
        { name: 'approve_answers', granted: false },
        { name: 'upload_files', granted: false },
        { name: 'user_management', granted: false },
        { name: 'role_management', granted: false },
        { name: 'system_settings', granted: false }
      ]
    },
    {
      id: 3,
      nameKey: 'mock_data.roles.qa_observer_view.name',
      descriptionKey: 'mock_data.roles.qa_observer_view.description',
      userCount: 2,
      createdDate: '2025-08-31T10:00:00Z',
      permissions: [
        { name: 'view_questions', granted: true },
        { name: 'reply_questions', granted: false },
        { name: 'approve_answers', granted: false },
        { name: 'upload_files', granted: false },
        { name: 'user_management', granted: false },
        { name: 'role_management', granted: false },
        { name: 'system_settings', granted: false }
      ]
    },
    {
      id: 4,
      nameKey: 'mock_data.roles.document_viewer.name',
      descriptionKey: 'mock_data.roles.document_viewer.description',
      userCount: 0,
      createdDate: '2025-08-30T14:30:00Z',
      permissions: [
        { name: 'view_documents', granted: true },
        { name: 'download_documents', granted: true },
        { name: 'view_questions', granted: true },
        { name: 'reply_questions', granted: false },
        { name: 'approve_answers', granted: false },
        { name: 'upload_files', granted: false },
        { name: 'user_management', granted: false }
      ]
    }
  ]);

  // Transform keys to actual translated text
  const roles = rolesData.map(roleData => ({
    ...roleData,
    name: t(roleData.nameKey),
    description: t(roleData.descriptionKey)
  }));

  const filteredRoles = roles?.filter(role => 
    role?.name?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
    role?.description?.toLowerCase()?.includes(searchQuery?.toLowerCase())
  );

  const stats = {
    totalRoles: roles?.length || 0,
    totalUsers: roles?.reduce((sum, role) => sum + (role?.userCount || 0), 0),
    activeRoles: roles?.filter(role => role?.userCount > 0)?.length || 0
  };

  const availablePermissionsData = [
    { name: 'view_questions', labelKey: 'permissions.view_questions.label', descriptionKey: 'permissions.view_questions.description' },
    { name: 'reply_questions', labelKey: 'permissions.reply_questions.label', descriptionKey: 'permissions.reply_questions.description' },
    { name: 'approve_answers', labelKey: 'permissions.approve_answers.label', descriptionKey: 'permissions.approve_answers.description' },
    { name: 'upload_files', labelKey: 'permissions.upload_files.label', descriptionKey: 'permissions.upload_files.description' },
    { name: 'user_management', labelKey: 'permissions.user_management.label', descriptionKey: 'permissions.user_management.description' },
    { name: 'role_management', labelKey: 'permissions.role_management.label', descriptionKey: 'permissions.role_management.description' },
    { name: 'system_settings', labelKey: 'permissions.system_settings.label', descriptionKey: 'permissions.system_settings.description' }
  ];

  const availablePermissions = availablePermissionsData.map(permission => ({
    ...permission,
    label: t(permission.labelKey),
    description: t(permission.descriptionKey)
  }));

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
            
            <Button 
              iconName="Plus" 
              variant="default"
              onClick={() => setIsCreateModalOpen(true)}
            >
              {t('actions.create_role')}
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-card rounded-lg shadow-sm border border-border p-4">
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Icon name="Shield" size={20} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t('stats.total_roles')}</p>
                  <p className="text-2xl font-bold text-foreground">{stats?.totalRoles}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-card rounded-lg shadow-sm border border-border p-4">
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
                  <Icon name="Users" size={20} className="text-success" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t('stats.total_users')}</p>
                  <p className="text-2xl font-bold text-foreground">{stats?.totalUsers}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-card rounded-lg shadow-sm border border-border p-4">
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center">
                  <Icon name="CheckCircle" size={20} className="text-warning" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t('stats.active_roles')}</p>
                  <p className="text-2xl font-bold text-foreground">{stats?.activeRoles}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <Icon name="Search" size={20} className="absolute left-3 rtl:right-3 rtl:left-auto top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder={t('search.placeholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e?.target?.value || '')}
                className="pl-10 rtl:pr-10 rtl:pl-3"
              />
            </div>
          </div>

          {/* Roles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRoles?.map((role) => (
              <RoleCard key={role?.id} role={role} />
            ))}
          </div>

          {/* Empty State */}
          {filteredRoles?.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="Shield" size={32} className="text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">{t('search.no_results_title')}</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery 
                  ? t('search.no_results_description') 
                  : t('search.empty_state_description')
                }
              </p>
              <Button 
                iconName="Plus" 
                variant="default"
                onClick={() => setIsCreateModalOpen(true)}
              >
                {t('actions.create_role')}
              </Button>
            </div>
          )}
        </div>
      </main>
      {/* Create Role Modal */}
      <CreateRoleModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        availablePermissions={availablePermissions}
      />
    </div>
  );
};

export default RolesPermissions;