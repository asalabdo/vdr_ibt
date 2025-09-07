import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Header from '../../components/ui/Header';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import Icon from '../../components/AppIcon';
import UserCard from './components/UserCard';
import InviteUserModal from './components/InviteUserModal';

const UsersManagement = () => {
  const { t } = useTranslation('users-management');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  // Mock users data using translation keys
  const [usersData] = useState([
    {
      id: 1,
      nameKey: 'mock_data.users.admin_user',
      email: 'admin@company.com',
      roleKey: 'mock_data.roles.admin',
      status: 'active',
      avatar: 'AU',
      lastLogin: '2025-08-31T15:30:00Z',
      joinedDate: '2025-01-15T10:00:00Z',
      dataRoomsAccessKeys: ['mock_data.data_rooms.project_alpha', 'mock_data.data_rooms.legal_documents', 'mock_data.data_rooms.financial_reports'],
      permissions: ['view_questions', 'reply_questions', 'approve_answers', 'upload_files', 'user_management']
    },
    {
      id: 2,
      nameKey: 'mock_data.users.qa_observer_full',
      email: 'qa.observer@company.com',
      roleKey: 'mock_data.roles.qa_observer_full_control',
      status: 'active',
      avatar: 'QO',
      lastLogin: '2025-08-31T14:15:00Z',
      joinedDate: '2025-02-20T09:30:00Z',
      dataRoomsAccessKeys: ['mock_data.data_rooms.project_alpha', 'mock_data.data_rooms.legal_documents'],
      permissions: ['view_questions', 'reply_questions']
    },
    {
      id: 3,
      nameKey: 'mock_data.users.financial_analyst',
      email: 'analyst@company.com',
      roleKey: 'mock_data.roles.qa_observer_view_only',
      status: 'active',
      avatar: 'FA',
      lastLogin: '2025-08-31T13:45:00Z',
      joinedDate: '2025-03-10T11:00:00Z',
      dataRoomsAccessKeys: ['mock_data.data_rooms.financial_reports'],
      permissions: ['view_questions']
    },
    {
      id: 4,
      nameKey: 'mock_data.users.legal_advisor',
      email: 'legal@company.com',
      roleKey: 'mock_data.roles.qa_observer_full_control',
      status: 'inactive',
      avatar: 'LA',
      lastLogin: '2025-08-28T16:20:00Z',
      joinedDate: '2025-01-25T14:30:00Z',
      dataRoomsAccessKeys: ['mock_data.data_rooms.legal_documents'],
      permissions: ['view_questions', 'reply_questions']
    },
    {
      id: 5,
      nameKey: 'mock_data.users.marketing_director',
      email: 'marketing@company.com',
      roleKey: 'mock_data.roles.qa_observer_view_only',
      status: 'pending',
      avatar: 'MD',
      lastLogin: null,
      joinedDate: '2025-08-30T10:15:00Z',
      dataRoomsAccessKeys: ['mock_data.data_rooms.marketing_materials'],
      permissions: ['view_questions']
    }
  ]);

  // Transform keys to actual translated text
  const users = usersData.map(userData => ({
    ...userData,
    name: t(userData.nameKey),
    role: t(userData.roleKey),
    dataRoomsAccess: userData.dataRoomsAccessKeys.map(key => t(key))
  }));

  const filteredUsers = users?.filter(user => {
    const matchesSearch = user?.name?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
                         user?.email?.toLowerCase()?.includes(searchQuery?.toLowerCase());
    const matchesRole = roleFilter === 'all' || user?.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user?.status === statusFilter;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const stats = {
    total: users?.length || 0,
    active: users?.filter(user => user?.status === 'active')?.length || 0,
    inactive: users?.filter(user => user?.status === 'inactive')?.length || 0,
    pending: users?.filter(user => user?.status === 'pending')?.length || 0
  };

  const rolesData = [
    'mock_data.roles.admin',
    'mock_data.roles.qa_observer_full_control',
    'mock_data.roles.qa_observer_view_only'
  ];

  const roles = rolesData.map(roleKey => t(roleKey));

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
            
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <Button 
                iconName="Plus" 
                variant="default"
                onClick={() => setIsInviteModalOpen(true)}
              >
                {t('actions.invite_user')}
              </Button>
              <Button iconName="Download" variant="outline">
                {t('actions.export_users')}
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-card rounded-lg shadow-sm border border-border p-4">
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Icon name="Users" size={20} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t('stats.total_users')}</p>
                  <p className="text-2xl font-bold text-foreground">{stats?.total}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-card rounded-lg shadow-sm border border-border p-4">
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
                  <Icon name="CheckCircle" size={20} className="text-success" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t('stats.active')}</p>
                  <p className="text-2xl font-bold text-foreground">{stats?.active}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-card rounded-lg shadow-sm border border-border p-4">
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                  <Icon name="UserX" size={20} className="text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t('stats.inactive')}</p>
                  <p className="text-2xl font-bold text-foreground">{stats?.inactive}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-card rounded-lg shadow-sm border border-border p-4">
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center">
                  <Icon name="Clock" size={20} className="text-warning" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t('stats.pending')}</p>
                  <p className="text-2xl font-bold text-foreground">{stats?.pending}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filter Controls */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Icon name="Search" size={20} className="absolute left-3 rtl:right-3 rtl:left-auto top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder={t('search.placeholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e?.target?.value || '')}
                className="pl-10 rtl:pr-10 rtl:pl-3"
              />
            </div>
            
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <Icon name="Filter" size={16} className="text-muted-foreground" />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e?.target?.value)}
                className="border border-input rounded-lg px-3 py-2 bg-background text-foreground focus:ring-2 focus:ring-ring focus:border-transparent"
              >
                <option value="all">{t('filters.all_roles')}</option>
                {roles?.map((role) => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e?.target?.value)}
                className="border border-input rounded-lg px-3 py-2 bg-background text-foreground focus:ring-2 focus:ring-ring focus:border-transparent"
              >
                <option value="all">{t('filters.all_status')}</option>
                <option value="active">{t('filters.active')}</option>
                <option value="inactive">{t('filters.inactive')}</option>
                <option value="pending">{t('filters.pending')}</option>
              </select>
            </div>
          </div>

          {/* Users Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUsers?.map((user) => (
              <UserCard key={user?.id} user={user} />
            ))}
          </div>

          {/* Empty State */}
          {filteredUsers?.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="Users" size={32} className="text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">{t('search.no_results_title')}</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || roleFilter !== 'all' || statusFilter !== 'all' 
                  ? t('search.no_results_description') 
                  : t('search.empty_state_description')
                }
              </p>
              <Button 
                iconName="Plus" 
                variant="default"
                onClick={() => setIsInviteModalOpen(true)}
              >
                {t('actions.invite_user')}
              </Button>
            </div>
          )}
        </div>
      </main>
      {/* Invite User Modal */}
      <InviteUserModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        availableRoles={roles}
      />
    </div>
  );
};

export default UsersManagement;
