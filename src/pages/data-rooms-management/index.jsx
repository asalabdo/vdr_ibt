import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useDataRooms } from '@/hooks/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '../../components/AppIcon';
import DataRoomCard from './components/DataRoomCard';
import FilterSidebar from './components/FilterSidebar';
import CreateDataRoomModal from './components/CreateDataRoomModal';
import DataRoomDetailsModal from './components/DataRoomDetailsModal';
import EditDataRoomModal from './components/EditDataRoomModal';
import DeleteDataRoomModal from './components/DeleteDataRoomModal';
import ManageDataRoomGroupsModal from './components/ManageDataRoomGroupsModal';

const DataRoomsManagement = () => {
  const { t } = useTranslation('data-rooms-management');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterSidebarOpen, setIsFilterSidebarOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [detailsModal, setDetailsModal] = useState({ open: false, roomId: null });
  const [editModal, setEditModal] = useState({ open: false, roomId: null });
  const [deleteModal, setDeleteModal] = useState({ open: false, room: null });
  const [manageGroupsModal, setManageGroupsModal] = useState({ open: false, roomId: null });
  const [selectedFilters, setSelectedFilters] = useState({
    status: 'all',
    dealType: 'all',
    activity: 'all',
    dateRange: 'all'
  });

  // Fetch real data rooms using the API
  const { 
    data: dataRoomsData, 
    isLoading, 
    error, 
    refetch 
  } = useDataRooms({ search: searchQuery });

  // Get data rooms from API response
  const dataRooms = dataRoomsData?.dataRooms || [];

  // Handle create data room
  const handleCreateRoom = () => {
    setIsCreateModalOpen(true);
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
  };

  // Handle data room actions
  const handleViewDetails = (roomId) => {
    setDetailsModal({ open: true, roomId });
  };

  const handleCloseDetails = () => {
    setDetailsModal({ open: false, roomId: null });
  };

  const handleEditRoom = (roomId) => {
    setEditModal({ open: true, roomId });
  };

  const handleCloseEdit = () => {
    setEditModal({ open: false, roomId: null });
  };

  const handleDeleteRoom = (room) => {
    setDeleteModal({ open: true, room });
  };

  const handleCloseDelete = () => {
    setDeleteModal({ open: false, room: null });
  };

  const handleManageGroups = (roomId) => {
    setManageGroupsModal({ open: true, roomId });
  };

  const handleCloseManageGroups = () => {
    setManageGroupsModal({ open: false, roomId: null });
  };


  // Filter rooms based on search and filters (already filtered by API search)
  const filteredRooms = dataRooms?.filter(room => {
    // API already handles search, so we only need to apply local filters
    const matchesStatus = selectedFilters?.status === 'all' || 
      (room?.isActive ? 'active' : 'inactive') === selectedFilters?.status;
    // For now, we'll simplify dealType filtering since it's not in the API data
    return matchesStatus;
  });

  // Calculate stats from real data
  const stats = {
    total: dataRooms?.length || 0,
    active: dataRooms?.filter(room => room?.isActive)?.length || 0,
    archived: dataRooms?.filter(room => !room?.isActive)?.length || 0,
    totalUsers: dataRooms?.reduce((sum, room) => sum + (room?.groupsCount || 0), 0),
    totalFiles: dataRooms?.length || 0 // API doesn't provide file counts yet
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
                <Skeleton className="h-10 w-32" />
              </div>
            </div>
            
            <Separator className="my-8" />
            
            {/* Stats Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
              {Array.from({ length: 5 }).map((_, i) => (
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
                  {t('title')}
                </h1>
                <p className="text-muted-foreground">
                  {t('subtitle')}
                </p>
              </div>
            </div>
            
            <Separator className="my-8" />
            
            <Alert variant="destructive">
              <Icon name="AlertCircle" size={16} />
              <AlertDescription className="flex items-center justify-between">
                <span>{t('table.error_loading')}: {error.message}</span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => refetch()}
                  className="ml-4 gap-1"
                >
                  <Icon name="RefreshCw" size={14} />
                  {t('table.retry')}
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
                {t('title')}
              </h1>
              <p className="text-muted-foreground">
                {t('subtitle')}
              </p>
            </div>
            
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <Button variant="default" onClick={handleCreateRoom} className="gap-2">
                <Icon name="Plus" size={16} />
                {t('actions.create_room')}
              </Button>
              <Button variant="success" className="gap-2">
                <Icon name="Download" size={16} />
                {t('actions.export_rooms')}
              </Button>
              <Button 
                variant="outline" 
                className="gap-2"
                onClick={() => {
                  window.location.href = '/groups-management';
                }}
              >
                <Icon name="Users" size={16} />
                {t('actions.manage_groups', { defaultValue: 'Manage Groups' })}
              </Button>
            </div>
          </div>
          
          <Separator className="my-8" />

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Icon name="FolderOpen" size={20} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {t('stats.total_rooms')}
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
                      {t('stats.active')}
                    </p>
                    <p className="text-2xl font-bold text-foreground">{stats?.active}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                    <Icon name="Archive" size={20} className="text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {t('stats.archived')}
                    </p>
                    <p className="text-2xl font-bold text-foreground">{stats?.archived}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                    <Icon name="Users" size={20} className="text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {t('stats.total_users')}
                    </p>
                    <p className="text-2xl font-bold text-foreground">{stats?.totalUsers}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                    <Icon name="FileText" size={20} className="text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {t('stats.total_files')}
                    </p>
                    <p className="text-2xl font-bold text-foreground">{stats?.totalFiles}</p>
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
                placeholder={t('search.placeholder')}
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
                {isLoading ? t('actions.refreshing') : t('actions.refresh')}
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsFilterSidebarOpen(!isFilterSidebarOpen)}
                className="gap-2"
              >
                <Icon name="Filter" size={14} />
                {t('actions.filters')}
              </Button>
              <Button variant="outline" className="gap-2">
                <Icon name="SortDesc" size={14} />
                {t('actions.sort')}
              </Button>
            </div>
          </div>

          {/* Data Rooms Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRooms?.map((room) => (
              <DataRoomCard
                key={room?.roomId}
                room={room}
                onViewDetails={handleViewDetails}
                onEdit={handleEditRoom}
                onDelete={handleDeleteRoom}
                onManageGroups={handleManageGroups}
              />
            ))}
          </div>

          {/* Empty State */}
          {filteredRooms?.length === 0 && (
            <Card className="text-center py-12">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon name="FolderOpen" size={32} className="text-muted-foreground" />
                </div>
                <CardTitle className="text-lg mb-2">
                  {t('search.no_results')}
                </CardTitle>
                <p className="text-muted-foreground mb-4">
                  {searchQuery ? t('search.no_results_description') : t('search.empty_state_description')}
                </p>
                <Button variant="default" onClick={handleCreateRoom} className="gap-2">
                  <Icon name="Plus" size={16} />
                  {t('actions.create_room')}
                </Button>
              </CardContent>
            </Card>
          )}
      {/* Filter Sidebar */}
      <FilterSidebar
        isOpen={isFilterSidebarOpen}
        onClose={() => setIsFilterSidebarOpen(false)}
        filters={selectedFilters}
        onFilterChange={setSelectedFilters}
        dataRooms={dataRooms}
      />
      
      {/* Create Data Room Modal */}
      <CreateDataRoomModal 
        isOpen={isCreateModalOpen}
        onClose={handleCloseCreateModal}
      />
      
      {/* Data Room Details Modal */}
      <DataRoomDetailsModal 
        isOpen={detailsModal.open}
        onClose={handleCloseDetails}
        roomId={detailsModal.roomId}
      />
      
      {/* Edit Data Room Modal */}
      <EditDataRoomModal 
        isOpen={editModal.open}
        onClose={handleCloseEdit}
        room={editModal.roomId ? dataRooms?.find(room => room.roomId === editModal.roomId) : null}
      />
      
      {/* Delete Data Room Modal */}
      <DeleteDataRoomModal 
        isOpen={deleteModal.open}
        onClose={handleCloseDelete}
        room={deleteModal.room}
      />
      
      {/* Manage Data Room Groups Modal */}
      <ManageDataRoomGroupsModal 
        isOpen={manageGroupsModal.open}
        onClose={handleCloseManageGroups}
        roomId={manageGroupsModal.roomId}
      />
    </div>
  );
};

export default DataRoomsManagement;
