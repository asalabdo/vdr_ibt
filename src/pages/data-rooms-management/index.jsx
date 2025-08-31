import React, { useState, useEffect } from 'react';
import Header from '../../components/ui/Header';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Icon from '../../components/AppIcon';
import DataRoomCard from './components/DataRoomCard';
import FilterSidebar from './components/FilterSidebar';

const DataRoomsManagement = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterSidebarOpen, setIsFilterSidebarOpen] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({
    status: 'all',
    dealType: 'all',
    activity: 'all',
    dateRange: 'all'
  });

  // Mock data for data rooms
  const [dataRooms] = useState([
    {
      id: 1,
      name: 'Project Alpha',
      description: 'Confidential project documentation',
      creator: 'Admin User',
      userCount: 8,
      fileCount: 24,
      storageUsed: '2.1 GB',
      createdDate: '2025-08-31',
      lastActivity: '2025-08-31',
      status: 'active',
      dealType: 'M&A',
      completionScore: 85,
      securityScore: 94,
      avatars: [
        { name: 'John Doe', initials: 'JD' },
        { name: 'Jane Smith', initials: 'JS' },
        { name: 'Mike Johnson', initials: 'MJ' },
        { name: 'Sarah Wilson', initials: 'SW' }
      ]
    },
    {
      id: 2,
      name: 'Legal Documents',
      description: 'Legal review materials',
      creator: 'Admin User',
      userCount: 12,
      fileCount: 18,
      storageUsed: '1.8 GB',
      createdDate: '2025-08-30',
      lastActivity: '2025-08-31',
      status: 'active',
      dealType: 'Legal Review',
      completionScore: 67,
      securityScore: 98,
      avatars: [
        { name: 'Legal Advisor', initials: 'LA' },
        { name: 'Contract Manager', initials: 'CM' },
        { name: 'Compliance Officer', initials: 'CO' }
      ]
    },
    {
      id: 3,
      name: 'Financial Reports',
      description: 'Q4 financial data',
      creator: 'Admin User',
      userCount: 15,
      fileCount: 32,
      storageUsed: '4.2 GB',
      createdDate: '2025-08-29',
      lastActivity: '2025-08-30',
      status: 'archived',
      dealType: 'Due Diligence',
      completionScore: 100,
      securityScore: 92,
      avatars: [
        { name: 'CFO', initials: 'CF' },
        { name: 'Financial Analyst', initials: 'FA' },
        { name: 'Auditor', initials: 'AU' },
        { name: 'Investment Manager', initials: 'IM' }
      ]
    },
    {
      id: 4,
      name: 'Due Diligence Materials',
      description: 'Comprehensive due diligence package',
      creator: 'Admin User',
      userCount: 22,
      fileCount: 156,
      storageUsed: '8.7 GB',
      createdDate: '2025-08-25',
      lastActivity: '2025-08-31',
      status: 'active',
      dealType: 'Due Diligence',
      completionScore: 78,
      securityScore: 96,
      avatars: [
        { name: 'Deal Manager', initials: 'DM' },
        { name: 'Analyst', initials: 'AN' },
        { name: 'Reviewer', initials: 'RV' },
        { name: 'Partner', initials: 'PT' }
      ]
    }
  ]);

  const filteredRooms = dataRooms?.filter(room => {
    const matchesSearch = room?.name?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
                         room?.description?.toLowerCase()?.includes(searchQuery?.toLowerCase());
    const matchesStatus = selectedFilters?.status === 'all' || room?.status === selectedFilters?.status;
    const matchesDealType = selectedFilters?.dealType === 'all' || room?.dealType === selectedFilters?.dealType;
    
    return matchesSearch && matchesStatus && matchesDealType;
  });

  const stats = {
    total: dataRooms?.length || 0,
    active: dataRooms?.filter(room => room?.status === 'active')?.length || 0,
    archived: dataRooms?.filter(room => room?.status === 'archived')?.length || 0,
    totalUsers: dataRooms?.reduce((sum, room) => sum + (room?.userCount || 0), 0),
    totalFiles: dataRooms?.reduce((sum, room) => sum + (room?.fileCount || 0), 0)
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Header Section */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
            <div className="mb-4 lg:mb-0">
              <h1 className="text-3xl font-bold text-foreground mb-2">Data Rooms</h1>
              <p className="text-muted-foreground">
                Manage and access your virtual data rooms
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button iconName="Plus" variant="default">
                Create Room
              </Button>
              <Button iconName="Download" variant="success">
                Export Rooms
              </Button>
              <Button iconName="Users" variant="outline">
                Bulk Invite
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-card rounded-lg shadow-sm border border-border p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Icon name="FolderOpen" size={20} className="text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Rooms</p>
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
                  <Icon name="Archive" size={20} className="text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Archived</p>
                  <p className="text-2xl font-bold text-foreground">{stats?.archived}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-card rounded-lg shadow-sm border border-border p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Icon name="Users" size={20} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                  <p className="text-2xl font-bold text-foreground">{stats?.totalUsers}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-card rounded-lg shadow-sm border border-border p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Icon name="FileText" size={20} className="text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Files</p>
                  <p className="text-2xl font-bold text-foreground">{stats?.totalFiles}</p>
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
                placeholder="Search data rooms..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e?.target?.value || '')}
                className="pl-10"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                iconName="Filter"
                variant="outline"
                onClick={() => setIsFilterSidebarOpen(!isFilterSidebarOpen)}
              >
                Filters
              </Button>
              <Button iconName="SortDesc" variant="outline">
                Sort
              </Button>
            </div>
          </div>

          {/* Data Rooms Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRooms?.map((room) => (
              <DataRoomCard
                key={room?.id}
                room={room}
              />
            ))}
          </div>

          {/* Empty State */}
          {filteredRooms?.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="FolderOpen" size={32} className="text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">No data rooms found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery ? 'Try adjusting your search criteria' : 'Create your first data room to get started'}
              </p>
              <Button iconName="Plus" variant="default">
                Create Room
              </Button>
            </div>
          )}
        </div>
      </main>
      {/* Filter Sidebar */}
      <FilterSidebar
        isOpen={isFilterSidebarOpen}
        onClose={() => setIsFilterSidebarOpen(false)}
        filters={selectedFilters}
        onFilterChange={setSelectedFilters}
      />
    </div>
  );
};

export default DataRoomsManagement;