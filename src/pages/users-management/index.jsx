import React, { useState } from 'react';
import Header from '../../components/ui/Header';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Icon from '../../components/AppIcon';
import UserCard from './components/UserCard';
import InviteUserModal from './components/InviteUserModal';

const UsersManagement = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  // Mock users data
  const [users] = useState([
    {
      id: 1,
      name: 'Admin User',
      email: 'admin@company.com',
      role: 'Admin',
      status: 'active',
      avatar: 'AU',
      lastLogin: '2025-08-31T15:30:00Z',
      joinedDate: '2025-01-15T10:00:00Z',
      dataRoomsAccess: ['Project Alpha', 'Legal Documents', 'Financial Reports'],
      permissions: ['view_questions', 'reply_questions', 'approve_answers', 'upload_files', 'user_management']
    },
    {
      id: 2,
      name: 'Q&A Observer Full',
      email: 'qa.observer@company.com',
      role: 'Q&A Observer – Full Control',
      status: 'active',
      avatar: 'QO',
      lastLogin: '2025-08-31T14:15:00Z',
      joinedDate: '2025-02-20T09:30:00Z',
      dataRoomsAccess: ['Project Alpha', 'Legal Documents'],
      permissions: ['view_questions', 'reply_questions']
    },
    {
      id: 3,
      name: 'Financial Analyst',
      email: 'analyst@company.com',
      role: 'Q&A Observer – View Only',
      status: 'active',
      avatar: 'FA',
      lastLogin: '2025-08-31T13:45:00Z',
      joinedDate: '2025-03-10T11:00:00Z',
      dataRoomsAccess: ['Financial Reports'],
      permissions: ['view_questions']
    },
    {
      id: 4,
      name: 'Legal Advisor',
      email: 'legal@company.com',
      role: 'Q&A Observer – Full Control',
      status: 'inactive',
      avatar: 'LA',
      lastLogin: '2025-08-28T16:20:00Z',
      joinedDate: '2025-01-25T14:30:00Z',
      dataRoomsAccess: ['Legal Documents'],
      permissions: ['view_questions', 'reply_questions']
    },
    {
      id: 5,
      name: 'Marketing Director',
      email: 'marketing@company.com',
      role: 'Q&A Observer – View Only',
      status: 'pending',
      avatar: 'MD',
      lastLogin: null,
      joinedDate: '2025-08-30T10:15:00Z',
      dataRoomsAccess: ['Marketing Materials'],
      permissions: ['view_questions']
    }
  ]);

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

  const roles = [
    'Admin',
    'Q&A Observer – Full Control',
    'Q&A Observer – View Only'
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-4">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Header Section */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
            <div className="mb-4 lg:mb-0">
              <h1 className="text-3xl font-bold text-foreground mb-2">Users Management</h1>
              <p className="text-muted-foreground">
                Manage user accounts and access permissions
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button 
                iconName="Plus" 
                variant="default"
                onClick={() => setIsInviteModalOpen(true)}
              >
                Invite User
              </Button>
              <Button iconName="Download" variant="outline">
                Export Users
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-card rounded-lg shadow-sm border border-border p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Icon name="Users" size={20} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                  <p className="text-2xl font-bold text-foreground">{stats?.total}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-card rounded-lg shadow-sm border border-border p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
                  <Icon name="CheckCircle" size={20} className="text-success" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active</p>
                  <p className="text-2xl font-bold text-foreground">{stats?.active}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-card rounded-lg shadow-sm border border-border p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                  <Icon name="UserX" size={20} className="text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Inactive</p>
                  <p className="text-2xl font-bold text-foreground">{stats?.inactive}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-card rounded-lg shadow-sm border border-border p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center">
                  <Icon name="Clock" size={20} className="text-warning" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold text-foreground">{stats?.pending}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filter Controls */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Icon name="Search" size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e?.target?.value || '')}
                className="pl-10"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Icon name="Filter" size={16} className="text-muted-foreground" />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e?.target?.value)}
                className="border border-input rounded-lg px-3 py-2 bg-background text-foreground focus:ring-2 focus:ring-ring focus:border-transparent"
              >
                <option value="all">All Roles</option>
                {roles?.map((role) => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e?.target?.value)}
                className="border border-input rounded-lg px-3 py-2 bg-background text-foreground focus:ring-2 focus:ring-ring focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="pending">Pending</option>
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
              <h3 className="text-lg font-medium text-foreground mb-2">No users found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || roleFilter !== 'all' || statusFilter !== 'all' ?'Try adjusting your search criteria' :'Invite your first user to get started'
                }
              </p>
              <Button 
                iconName="Plus" 
                variant="default"
                onClick={() => setIsInviteModalOpen(true)}
              >
                Invite User
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