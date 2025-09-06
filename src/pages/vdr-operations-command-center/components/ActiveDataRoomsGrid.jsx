import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Icon from '../../../components/AppIcon';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

const ActiveDataRoomsGrid = () => {
  const { t } = useTranslation('vdr-operations-dashboard');
  const { t: tCommon } = useTranslation('common');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('activity');
  const [sortOrder, setSortOrder] = useState('desc');

  // Mock data for active data rooms
  const dataRooms = [
    {
      id: 'vdr-001',
      name: t('active_data_rooms.sample_data.rooms.techcorp_acquisition'),
      status: 'active',
      users: 24,
      documents: 1247,
      storage: '2.4 GB',
      lastActivity: tCommon('sample_times.2_min_ago'),
      responseTime: 145,
      uptime: 99.8,
      owner: 'Sarah Johnson',
      created: '2024-08-15',
      dealValue: '$125M',
      phase: t('active_data_rooms.sample_data.phases.due_diligence')
    },
    {
      id: 'vdr-002',
      name: t('active_data_rooms.sample_data.rooms.meddevice_merger'),
      status: 'active',
      users: 18,
      documents: 892,
      storage: '1.8 GB',
      lastActivity: tCommon('sample_times.5_min_ago'),
      responseTime: 98,
      uptime: 99.9,
      owner: 'Michael Chen',
      created: '2024-08-20',
      dealValue: '$89M',
      phase: t('active_data_rooms.sample_data.phases.final_review')
    },
    {
      id: 'vdr-003',
      name: t('active_data_rooms.sample_data.rooms.fintech_partnership'),
      status: 'maintenance',
      users: 12,
      documents: 634,
      storage: '1.2 GB',
      lastActivity: tCommon('sample_times.1_hour_ago'),
      responseTime: 234,
      uptime: 98.5,
      owner: 'Emily Rodriguez',
      created: '2024-08-25',
      dealValue: '$45M',
      phase: t('active_data_rooms.sample_data.phases.initial_review')
    },
    {
      id: 'vdr-004',
      name: t('active_data_rooms.sample_data.rooms.energy_sector_deal'),
      status: 'active',
      users: 31,
      documents: 1856,
      storage: '3.7 GB',
      lastActivity: tCommon('sample_times.1_min_ago'),
      responseTime: 167,
      uptime: 99.7,
      owner: 'David Kim',
      created: '2024-08-10',
      dealValue: '$200M',
      phase: t('active_data_rooms.sample_data.phases.due_diligence')
    },
    {
      id: 'vdr-005',
      name: t('active_data_rooms.sample_data.rooms.retail_chain_buyout'),
      status: 'active',
      users: 15,
      documents: 743,
      storage: '1.5 GB',
      lastActivity: tCommon('sample_times.8_min_ago'),
      responseTime: 112,
      uptime: 99.6,
      owner: 'Lisa Wang',
      created: '2024-08-28',
      dealValue: '$67M',
      phase: t('active_data_rooms.sample_data.phases.negotiation')
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-success bg-success/10 border-success/20';
      case 'maintenance': return 'text-warning bg-warning/10 border-warning/20';
      case 'inactive': return 'text-muted-foreground bg-muted/10 border-border';
      default: return 'text-muted-foreground bg-muted/10 border-border';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return 'CheckCircle';
      case 'maintenance': return 'AlertTriangle';
      case 'inactive': return 'XCircle';
      default: return 'Circle';
    }
  };

  const getUptimeColor = (uptime) => {
    if (uptime >= 99.5) return 'text-success';
    if (uptime >= 98.0) return 'text-warning';
    return 'text-error';
  };

  const getResponseTimeColor = (responseTime) => {
    if (responseTime <= 100) return 'text-success';
    if (responseTime <= 200) return 'text-warning';
    return 'text-error';
  };

  const filteredAndSortedRooms = dataRooms?.filter(room => 
      room?.name?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
      room?.owner?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
      room?.phase?.toLowerCase()?.includes(searchTerm?.toLowerCase())
    )?.sort((a, b) => {
      let aValue, bValue;
      switch (sortBy) {
        case 'name':
          aValue = a?.name;
          bValue = b?.name;
          break;
        case 'users':
          aValue = a?.users;
          bValue = b?.users;
          break;
        case 'documents':
          aValue = a?.documents;
          bValue = b?.documents;
          break;
        case 'activity':
          aValue = new Date(a.lastActivity);
          bValue = new Date(b.lastActivity);
          break;
        case 'uptime':
          aValue = a?.uptime;
          bValue = b?.uptime;
          break;
        default:
          return 0;
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <Icon name="Database" size={20} className="text-accent" />
            <h3 className="text-lg font-semibold text-foreground">{t('active_data_rooms.title')}</h3>
            <span className="px-2 py-1 bg-accent/10 text-accent text-xs font-medium rounded-full">
              {filteredAndSortedRooms?.length}
            </span>
          </div>
          
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <Button variant="outline" size="sm" iconName="Plus">
              {t('active_data_rooms.new_room')}
            </Button>
            <Button variant="ghost" size="sm" iconName="RefreshCw" />
          </div>
        </div>
        
        {/* Search */}
        <div className="max-w-md">
          <Input
            type="search"
            placeholder={t('active_data_rooms.search_placeholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e?.target?.value)}
          />
        </div>
      </div>
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/20">
            <tr>
              <th className="text-left rtl:text-right p-4 text-sm font-medium text-muted-foreground">
                <button
                  onClick={() => handleSort('name')}
                  className="flex items-center space-x-1 rtl:space-x-reverse hover:text-foreground"
                >
                  <span>{t('active_data_rooms.headers.data_room')}</span>
                  <Icon name="ArrowUpDown" size={12} />
                </button>
              </th>
              <th className="text-left rtl:text-right p-4 text-sm font-medium text-muted-foreground">{t('active_data_rooms.headers.status')}</th>
              <th className="text-left rtl:text-right p-4 text-sm font-medium text-muted-foreground">
                <button
                  onClick={() => handleSort('users')}
                  className="flex items-center space-x-1 rtl:space-x-reverse hover:text-foreground"
                >
                  <span>{t('active_data_rooms.headers.users')}</span>
                  <Icon name="ArrowUpDown" size={12} />
                </button>
              </th>
              <th className="text-left rtl:text-right p-4 text-sm font-medium text-muted-foreground">
                <button
                  onClick={() => handleSort('documents')}
                  className="flex items-center space-x-1 rtl:space-x-reverse hover:text-foreground"
                >
                  <span>{t('active_data_rooms.headers.documents')}</span>
                  <Icon name="ArrowUpDown" size={12} />
                </button>
              </th>
              <th className="text-left rtl:text-right p-4 text-sm font-medium text-muted-foreground">{t('active_data_rooms.headers.performance')}</th>
              <th className="text-left rtl:text-right p-4 text-sm font-medium text-muted-foreground">
                <button
                  onClick={() => handleSort('activity')}
                  className="flex items-center space-x-1 rtl:space-x-reverse hover:text-foreground"
                >
                  <span>{t('active_data_rooms.headers.last_activity')}</span>
                  <Icon name="ArrowUpDown" size={12} />
                </button>
              </th>
              <th className="text-left rtl:text-right p-4 text-sm font-medium text-muted-foreground">{t('active_data_rooms.headers.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedRooms?.map((room) => (
              <tr key={room?.id} className="border-t border-border hover:bg-muted/20 transition-colors">
                <td className="p-4">
                  <div>
                    <div className="font-medium text-foreground">{room?.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {room?.dealValue} • {room?.phase}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {t('active_data_rooms.labels.owner')}: {room?.owner}
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <div className={`
                    inline-flex items-center space-x-1 rtl:space-x-reverse px-2 py-1 rounded-full text-xs font-medium border
                    ${getStatusColor(room?.status)}
                  `}>
                    <Icon name={getStatusIcon(room?.status)} size={12} />
                    <span className="capitalize">{tCommon(`status_values.${room?.status}`)}</span>
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <Icon name="Users" size={14} className="text-muted-foreground" />
                    <span className="font-medium">{room?.users}</span>
                  </div>
                </td>
                <td className="p-4">
                  <div>
                    <div className="font-medium">{room?.documents?.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">{room?.storage}</div>
                  </div>
                </td>
                <td className="p-4">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <span className="text-xs text-muted-foreground">{t('active_data_rooms.labels.uptime')}:</span>
                      <span className={`text-xs font-medium ${getUptimeColor(room?.uptime)}`}>
                        {room?.uptime}%
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <span className="text-xs text-muted-foreground">{t('active_data_rooms.labels.response')}:</span>
                      <span className={`text-xs font-medium ${getResponseTimeColor(room?.responseTime)}`}>
                        {room?.responseTime} {tCommon('time_units.ms')}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <span className="text-sm text-muted-foreground">{room?.lastActivity}</span>
                </td>
                <td className="p-4">
                  <div className="flex items-center space-x-1 rtl:space-x-reverse">
                    <Button variant="ghost" size="sm" iconName="Eye" />
                    <Button variant="ghost" size="sm" iconName="Settings" />
                    <Button variant="ghost" size="sm" iconName="MoreHorizontal" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Footer */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{t('active_data_rooms.showing_results', { count: filteredAndSortedRooms?.length, total: dataRooms?.length })}</span>
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <Button variant="ghost" size="sm" disabled>
              {tCommon('actions.previous')}
            </Button>
            <Button variant="ghost" size="sm" disabled>
              {tCommon('actions.next')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActiveDataRoomsGrid;
