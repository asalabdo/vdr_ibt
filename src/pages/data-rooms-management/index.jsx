import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Header from '../../components/ui/Header';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Icon from '../../components/AppIcon';
import DataRoomCard from './components/DataRoomCard';
import FilterSidebar from './components/FilterSidebar';

const DataRoomsManagement = () => {
  const { t, ready } = useTranslation('data-rooms-management');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterSidebarOpen, setIsFilterSidebarOpen] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({
    status: 'all',
    dealType: 'all',
    activity: 'all',
    dateRange: 'all'
  });

  // Mock data for data rooms - only initialize when translations are ready
  const dataRooms = ready ? [
    {
      id: 1,
      name: t('sample_data.rooms.project_alpha.name'),
      description: t('sample_data.rooms.project_alpha.description'),
      creator: t('sample_data.user_roles.admin_user'),
      userCount: 8,
      fileCount: 24,
      storageUsed: '2.1 GB',
      createdDate: '2025-08-31',
      lastActivity: '2025-08-31',
      status: 'active',
      dealType: 'ma',
      dealTypeDisplay: t('sample_data.deal_types.ma'),
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
      name: t('sample_data.rooms.legal_documents.name'),
      description: t('sample_data.rooms.legal_documents.description'),
      creator: t('sample_data.user_roles.admin_user'),
      userCount: 12,
      fileCount: 18,
      storageUsed: '1.8 GB',
      createdDate: '2025-08-30',
      lastActivity: '2025-08-31',
      status: 'active',
      dealType: 'legal_review',
      dealTypeDisplay: t('sample_data.deal_types.legal_review'),
      completionScore: 67,
      securityScore: 98,
      avatars: [
        { name: t('sample_data.user_roles.legal_advisor'), initials: 'LA' },
        { name: t('sample_data.user_roles.contract_manager'), initials: 'CM' },
        { name: t('sample_data.user_roles.compliance_officer'), initials: 'CO' }
      ]
    },
    {
      id: 3,
      name: t('sample_data.rooms.financial_reports.name'),
      description: t('sample_data.rooms.financial_reports.description'),
      creator: t('sample_data.user_roles.admin_user'),
      userCount: 15,
      fileCount: 32,
      storageUsed: '4.2 GB',
      createdDate: '2025-08-29',
      lastActivity: '2025-08-30',
      status: 'archived',
      dealType: 'due_diligence',
      dealTypeDisplay: t('sample_data.deal_types.due_diligence'),
      completionScore: 100,
      securityScore: 92,
      avatars: [
        { name: t('sample_data.user_roles.cfo'), initials: 'CF' },
        { name: t('sample_data.user_roles.financial_analyst'), initials: 'FA' },
        { name: t('sample_data.user_roles.auditor'), initials: 'AU' },
        { name: t('sample_data.user_roles.investment_manager'), initials: 'IM' }
      ]
    },
    {
      id: 4,
      name: t('sample_data.rooms.due_diligence_materials.name'),
      description: t('sample_data.rooms.due_diligence_materials.description'),
      creator: t('sample_data.user_roles.admin_user'),
      userCount: 22,
      fileCount: 156,
      storageUsed: '8.7 GB',
      createdDate: '2025-08-25',
      lastActivity: '2025-08-31',
      status: 'active',
      dealType: 'due_diligence',
      dealTypeDisplay: t('sample_data.deal_types.due_diligence'),
      completionScore: 78,
      securityScore: 96,
      avatars: [
        { name: t('sample_data.user_roles.deal_manager'), initials: 'DM' },
        { name: t('sample_data.user_roles.analyst'), initials: 'AN' },
        { name: t('sample_data.user_roles.reviewer'), initials: 'RV' },
        { name: t('sample_data.user_roles.partner'), initials: 'PT' }
      ]
    }
  ] : [];

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
              <Button iconName="Plus" variant="default">
                {t('actions.create_room')}
              </Button>
              <Button iconName="Download" variant="success">
                {t('actions.export_rooms')}
              </Button>
              <Button iconName="Users" variant="outline">
                {t('actions.bulk_invite')}
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-card rounded-lg shadow-sm border border-border p-4">
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
            </div>
            
            <div className="bg-card rounded-lg shadow-sm border border-border p-4">
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
            </div>
            
            <div className="bg-card rounded-lg shadow-sm border border-border p-4">
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
            </div>
            
            <div className="bg-card rounded-lg shadow-sm border border-border p-4">
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Icon name="Users" size={20} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {t('stats.total_users')}
                  </p>
                  <p className="text-2xl font-bold text-foreground">{stats?.totalUsers}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-card rounded-lg shadow-sm border border-border p-4">
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Icon name="FileText" size={20} className="text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {t('stats.total_files')}
                  </p>
                  <p className="text-2xl font-bold text-foreground">{stats?.totalFiles}</p>
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
              <Button
                iconName="Filter"
                variant="outline"
                onClick={() => setIsFilterSidebarOpen(!isFilterSidebarOpen)}
              >
                {t('actions.filters')}
              </Button>
              <Button iconName="SortDesc" variant="outline">
                {t('actions.sort')}
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
              <h3 className="text-lg font-medium text-foreground mb-2">
                {t('search.no_results')}
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery ? t('search.no_results_description') : t('search.empty_state_description')}
              </p>
              <Button iconName="Plus" variant="default">
                {t('actions.create_room')}
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