import React, { useState } from 'react';
import Header from '../../components/ui/Header';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Icon from '../../components/AppIcon';
import RoleCard from './components/RoleCard';
import CreateRoleModal from './components/CreateRoleModal';

const RolesPermissions = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Mock roles data
  const [roles] = useState([
    {
      id: 1,
      name: 'Admin',
      description: 'Full system access and management',
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
      name: 'Q&A Observer – Full Control',
      description: 'Can view and reply to questions',
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
      name: 'Q&A Observer – View Only',
      description: 'Can only view questions',
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
      name: 'Document Viewer',
      description: 'View documents and basic interactions',
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

  const filteredRoles = roles?.filter(role => 
    role?.name?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
    role?.description?.toLowerCase()?.includes(searchQuery?.toLowerCase())
  );

  const stats = {
    totalRoles: roles?.length || 0,
    totalUsers: roles?.reduce((sum, role) => sum + (role?.userCount || 0), 0),
    activeRoles: roles?.filter(role => role?.userCount > 0)?.length || 0
  };

  const availablePermissions = [
    { name: 'view_questions', label: 'View Questions', description: 'View all questions and answers' },
    { name: 'reply_questions', label: 'Reply Questions', description: 'Reply to questions' },
    { name: 'approve_answers', label: 'Approve Answers', description: 'Approve or reject answers' },
    { name: 'upload_files', label: 'Upload Files', description: 'Upload documents and files' },
    { name: 'user_management', label: 'User Management', description: 'Manage user accounts' },
    { name: 'role_management', label: 'Role Management', description: 'Create and edit roles' },
    { name: 'system_settings', label: 'System Settings', description: 'Access system configuration' }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-4">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Header Section */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
            <div className="mb-4 lg:mb-0">
              <h1 className="text-3xl font-bold text-foreground mb-2">Roles & Permissions</h1>
              <p className="text-muted-foreground">
                Manage system roles and their permissions
              </p>
            </div>
            
            <Button 
              iconName="Plus" 
              variant="default"
              onClick={() => setIsCreateModalOpen(true)}
            >
              Create Role
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-card rounded-lg shadow-sm border border-border p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Icon name="Shield" size={20} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Roles</p>
                  <p className="text-2xl font-bold text-foreground">{stats?.totalRoles}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-card rounded-lg shadow-sm border border-border p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
                  <Icon name="Users" size={20} className="text-success" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                  <p className="text-2xl font-bold text-foreground">{stats?.totalUsers}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-card rounded-lg shadow-sm border border-border p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center">
                  <Icon name="CheckCircle" size={20} className="text-warning" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Roles</p>
                  <p className="text-2xl font-bold text-foreground">{stats?.activeRoles}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <Icon name="Search" size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search roles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e?.target?.value || '')}
                className="pl-10"
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
              <h3 className="text-lg font-medium text-foreground mb-2">No roles found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery 
                  ? 'Try adjusting your search criteria' :'Create your first role to get started'
                }
              </p>
              <Button 
                iconName="Plus" 
                variant="default"
                onClick={() => setIsCreateModalOpen(true)}
              >
                Create Role
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