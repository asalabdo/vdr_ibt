import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useGroups, useGroupMemberCounts } from '@/hooks/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '../../components/AppIcon';
import GroupCard from './components/GroupCard';
import CreateGroupModal from './components/CreateGroupModal';
import GroupDetailsModal from './components/GroupDetailsModal';
import EditGroupModal from './components/EditGroupModal';
import DeleteGroupModal from './components/DeleteGroupModal';
import ManageGroupMembersModal from './components/ManageGroupMembersModal';

const GroupsManagement = () => {
  const { t } = useTranslation('groups-management');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [detailsModal, setDetailsModal] = useState({ open: false, groupId: null });
  const [editModal, setEditModal] = useState({ open: false, groupId: null });
  const [deleteModal, setDeleteModal] = useState({ open: false, group: null });
  const [membersModal, setMembersModal] = useState({ open: false, groupId: null });

  // Fetch groups using the API
  const { 
    data: groupsData, 
    isLoading, 
    error, 
    refetch 
  } = useGroups({ search: searchQuery });

  // Get groups from API response
  const groups = groupsData?.groups || [];
  
  // Get member counts for all groups
  const groupIds = groups.map(group => group.id);
  const { 
    data: memberCounts = {},
    isLoading: isLoadingMemberCounts 
  } = useGroupMemberCounts(groupIds, {
    enabled: groups.length > 0
  });

  // Merge groups with member counts
  const groupsWithMemberData = groups.map(group => ({
    ...group,
    memberCount: memberCounts[group.id]?.count || 0,
    members: memberCounts[group.id]?.users || []
  }));

  // Handle create group
  const handleCreateGroup = () => {
    setIsCreateModalOpen(true);
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
  };

  // Handle group actions
  const handleViewDetails = (groupId) => {
    setDetailsModal({ open: true, groupId });
  };

  const handleCloseDetails = () => {
    setDetailsModal({ open: false, groupId: null });
  };

  const handleEditGroup = (groupId) => {
    setEditModal({ open: true, groupId });
  };

  const handleCloseEdit = () => {
    setEditModal({ open: false, groupId: null });
  };

  const handleDeleteGroup = (groupId) => {
    // Find the group data to pass to the modal
    const groupToDelete = groupsWithMemberData.find(group => group.id === groupId);
    if (groupToDelete) {
      setDeleteModal({ open: true, group: groupToDelete });
    }
  };

  const handleCloseDelete = () => {
    setDeleteModal({ open: false, group: null });
  };

  const handleManageMembers = (groupId) => {
    setMembersModal({ open: true, groupId });
  };

  const handleCloseMembers = () => {
    setMembersModal({ open: false, groupId: null });
  };

  // Calculate stats from real data
  const stats = {
    total: groupsWithMemberData?.length || 0,
    active: groupsWithMemberData?.length || 0, // All groups are considered active by default
    empty: groupsWithMemberData?.filter(group => group?.memberCount === 0)?.length || 0,
    withMembers: groupsWithMemberData?.filter(group => group?.memberCount > 0)?.length || 0,
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="px-6 py-8">
            {/* Header Skeleton */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
              <div className="mb-4 lg:mb-0">
                <Skeleton className="h-9 w-64 mb-2" />
                <Skeleton className="h-5 w-48" />
              </div>
              <div className="flex items-center space-x-3">
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-10 w-32" />
              </div>
            </div>
            
            <Separator className="my-8" />
            
            {/* Stats Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <Skeleton className="w-10 h-10 rounded-lg" />
                      <div className="space-y-1">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-6 w-8" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {/* Grid Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <Skeleton className="w-12 h-12 rounded-lg" />
                        <div className="space-y-1">
                          <Skeleton className="h-5 w-32" />
                          <Skeleton className="h-4 w-24" />
                        </div>
                      </div>
                      <Skeleton className="h-16 w-full" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="px-6 py-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
              <div className="mb-4 lg:mb-0">
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  {t('title', { defaultValue: 'Groups Management' })}
                </h1>
                <p className="text-muted-foreground">
                  {t('subtitle', { defaultValue: 'Create and manage user groups for access control and collaboration' })}
                </p>
              </div>
            </div>
            
            <Separator className="my-8" />
            
            <Alert variant="destructive">
              <Icon name="AlertCircle" size={16} />
              <AlertDescription className="flex items-center justify-between">
                <span>{t('errors.loading_failed', { defaultValue: 'Failed to load groups' })}: {error.message}</span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => refetch()}
                  className="ml-4 gap-1"
                >
                  <Icon name="RefreshCw" size={14} />
                  {t('actions.retry', { defaultValue: 'Retry' })}
                </Button>
              </AlertDescription>
            </Alert>
          </div>
    );
  }

  return (
    <div className="px-6 py-8">
          {/* Header Section */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
            <div className="mb-4 lg:mb-0">
              <h1 className="text-3xl font-bold text-foreground mb-2">
                {t('title', { defaultValue: 'Groups Management' })}
              </h1>
              <p className="text-muted-foreground">
                {t('subtitle', { defaultValue: 'Create and manage user groups for access control and collaboration' })}
              </p>
            </div>
            
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <Button variant="default" onClick={handleCreateGroup} className="gap-2">
                <Icon name="Plus" size={16} />
                {t('actions.create_group', { defaultValue: 'Create Group' })}
              </Button>
              <Button 
                variant="outline" 
                className="gap-2"
                onClick={() => {
                  window.location.href = '/data-rooms-management';
                }}
              >
                <Icon name="FolderOpen" size={16} />
                {t('actions.view_data_rooms', { defaultValue: 'Data Rooms' })}
              </Button>
            </div>
          </div>
          
          <Separator className="my-8" />

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Icon name="Users" size={20} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {t('stats.total_groups', { defaultValue: 'Total Groups' })}
                    </p>
                    <p className="text-2xl font-bold text-foreground">{stats?.total}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
                    <Icon name="CheckCircle" size={20} className="text-success" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {t('stats.active', { defaultValue: 'Active' })}
                    </p>
                    <p className="text-2xl font-bold text-foreground">{stats?.active}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                    <Icon name="UserCheck" size={20} className="text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {t('stats.with_members', { defaultValue: 'With Members' })}
                    </p>
                    <p className="text-2xl font-bold text-foreground">{stats?.withMembers}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
                    <Icon name="UserX" size={20} className="text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {t('stats.empty', { defaultValue: 'Empty' })}
                    </p>
                    <p className="text-2xl font-bold text-foreground">{stats?.empty}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filter Controls */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Icon name="Search" size={20} className="absolute left-3 rtl:right-3 rtl:left-auto top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder={t('search.placeholder', { defaultValue: 'Search groups by name...' })}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e?.target?.value || '')}
                className="pl-10 rtl:pr-10 rtl:pl-3"
              />
            </div>
            
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <Button
                variant="outline"
                onClick={() => refetch()}
                disabled={isLoading}
                className="gap-2"
              >
                <Icon name="RefreshCw" size={14} className={isLoading ? "animate-spin" : ""} />
                {isLoading ? t('actions.refreshing', { defaultValue: 'Refreshing...' }) : t('actions.refresh', { defaultValue: 'Refresh' })}
              </Button>
              <Button variant="outline" className="gap-2">
                <Icon name="SortDesc" size={14} />
                {t('actions.sort', { defaultValue: 'Sort' })}
              </Button>
            </div>
          </div>

          {/* Groups Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groupsWithMemberData?.map((group) => (
              <GroupCard
                key={group?.id}
                group={group}
                onViewDetails={handleViewDetails}
                onEdit={handleEditGroup}
                onDelete={handleDeleteGroup}
                onManageMembers={handleManageMembers}
              />
            ))}
          </div>

          {/* Empty State */}
          {groupsWithMemberData?.length === 0 && (
            <Card className="text-center py-12">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon name="Users" size={32} className="text-muted-foreground" />
                </div>
                <CardTitle className="text-lg mb-2">
                  {t('search.no_results', { defaultValue: 'No groups found' })}
                </CardTitle>
                <p className="text-muted-foreground mb-4">
                  {searchQuery 
                    ? t('search.no_results_description', { defaultValue: 'No groups match your search criteria. Try adjusting your search terms.' })
                    : t('search.empty_state_description', { defaultValue: 'Get started by creating your first group to organize users and manage permissions.' })
                  }
                </p>
                <Button variant="default" onClick={handleCreateGroup} className="gap-2">
                  <Icon name="Plus" size={16} />
                  {t('actions.create_group', { defaultValue: 'Create Group' })}
                </Button>
              </CardContent>
            </Card>
          )}
      
      {/* Create Group Modal */}
      <CreateGroupModal 
        isOpen={isCreateModalOpen}
        onClose={handleCloseCreateModal}
      />
      
      {/* Group Details Modal */}
      <GroupDetailsModal 
        isOpen={detailsModal.open}
        onClose={handleCloseDetails}
        groupId={detailsModal.groupId}
      />
      
      {/* Edit Group Modal */}
      <EditGroupModal 
        isOpen={editModal.open}
        onClose={handleCloseEdit}
        groupId={editModal.groupId}
      />
      
      {/* Delete Group Modal */}
      <DeleteGroupModal 
        isOpen={deleteModal.open}
        onClose={handleCloseDelete}
        group={deleteModal.group}
      />
      
      {/* Manage Group Members Modal */}
      <ManageGroupMembersModal 
        isOpen={membersModal.open}
        onClose={handleCloseMembers}
        groupId={membersModal.groupId}
      />
    </div>
  );
};

export default GroupsManagement;
