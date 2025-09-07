import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Icon from '../../../components/AppIcon';
import { Button } from '@/components/ui/Button';

const RecentUserSessions = () => {
  const { t } = useTranslation('vdr-operations-dashboard');
  const { t: tCommon } = useTranslation('common');
  const [filter, setFilter] = useState('all');

  // Mock user session data
  const userSessions = [
    {
      id: 'session-001',
      user: {
        name: 'Sarah Johnson',
        email: 'sarah.johnson@techcorp.com',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=32&h=32&fit=crop&crop=face',
        role: t('user_sessions.user_roles.deal_manager')
      },
      dataRoom: 'TechCorp Acquisition',
      status: 'active',
      duration: tCommon('sample_times.duration_2h_34m'),
      lastActivity: tCommon('sample_times.2_min_ago'),
      documentsViewed: 23,
      location: 'New York, US',
      device: 'Desktop',
      ipAddress: '192.168.1.100'
    },
    {
      id: 'session-002',
      user: {
        name: 'Michael Chen',
        email: 'michael.chen@meddevice.com',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face',
        role: t('user_sessions.user_roles.legal_advisor')
      },
      dataRoom: 'MedDevice Merger',
      status: 'active',
      duration: tCommon('sample_times.duration_1h_45m'),
      lastActivity: tCommon('sample_times.5_min_ago'),
      documentsViewed: 18,
      location: 'London, UK',
      device: 'Mobile',
      ipAddress: '10.0.0.45'
    },
    {
      id: 'session-003',
      user: {
        name: 'Emily Rodriguez',
        email: 'emily.rodriguez@fintech.com',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=32&h=32&fit=crop&crop=face',
        role: t('user_sessions.user_roles.financial_analyst')
      },
      dataRoom: 'FinTech Partnership',
      status: 'idle',
      duration: tCommon('sample_times.duration_45m'),
      lastActivity: tCommon('sample_times.15_min_ago'),
      documentsViewed: 12,
      location: 'San Francisco, US',
      device: 'Tablet',
      ipAddress: '172.16.0.23'
    },
    {
      id: 'session-004',
      user: {
        name: 'David Kim',
        email: 'david.kim@energy.com',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face',
        role: t('user_sessions.user_roles.senior_analyst')
      },
      dataRoom: 'Energy Sector Deal',
      status: 'active',
      duration: tCommon('sample_times.duration_3h_12m'),
      lastActivity: tCommon('sample_times.1_min_ago'),
      documentsViewed: 41,
      location: 'Tokyo, JP',
      device: 'Desktop',
      ipAddress: '203.0.113.15'
    },
    {
      id: 'session-005',
      user: {
        name: 'Lisa Wang',
        email: 'lisa.wang@retail.com',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=32&h=32&fit=crop&crop=face',
        role: t('user_sessions.user_roles.investment_manager')
      },
      dataRoom: 'Retail Chain Buyout',
      status: 'ended',
      duration: tCommon('sample_times.duration_1h_23m'),
      lastActivity: tCommon('sample_times.30_min_ago'),
      documentsViewed: 15,
      location: 'Sydney, AU',
      device: 'Desktop',
      ipAddress: '198.51.100.42'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-success bg-success/10 border-success/20';
      case 'idle': return 'text-warning bg-warning/10 border-warning/20';
      case 'ended': return 'text-muted-foreground bg-muted/10 border-border';
      default: return 'text-muted-foreground bg-muted/10 border-border';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return 'Circle';
      case 'idle': return 'Clock';
      case 'ended': return 'XCircle';
      default: return 'Circle';
    }
  };

  const getDeviceIcon = (device) => {
    switch (device?.toLowerCase()) {
      case 'desktop': return 'Monitor';
      case 'mobile': return 'Smartphone';
      case 'tablet': return 'Tablet';
      default: return 'Monitor';
    }
  };

  const filteredSessions = userSessions?.filter(session => {
    if (filter === 'all') return true;
    return session?.status === filter;
  });

  const statusCounts = userSessions?.reduce((acc, session) => {
    acc[session.status] = (acc?.[session?.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="bg-card border border-border rounded-lg h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <Icon name="Users" size={20} className="text-accent" />
            <h3 className="text-lg font-semibold text-foreground">{t('user_sessions.title')}</h3>
          </div>
          <Button variant="ghost" size="sm" iconName="RefreshCw" />
        </div>
        
        {/* Filter Tabs */}
        <div className="flex space-x-1 rtl:space-x-reverse">
          {[
            { key: 'all', label: t('user_sessions.tabs.all'), count: userSessions?.length },
            { key: 'active', label: t('user_sessions.tabs.active'), count: statusCounts?.active || 0 },
            { key: 'idle', label: t('user_sessions.tabs.idle'), count: statusCounts?.idle || 0 },
            { key: 'ended', label: t('user_sessions.tabs.ended'), count: statusCounts?.ended || 0 }
          ]?.map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`
                px-3 py-1.5 text-xs font-medium rounded-md transition-colors
                ${filter === key 
                  ? 'bg-primary text-primary-foreground' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }
              `}
            >
              {label} ({count})
            </button>
          ))}
        </div>
      </div>
      {/* Session List */}
      <div className="flex-1 overflow-y-auto">
        {filteredSessions?.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
            <Icon name="Users" size={24} className="mb-2" />
            <span className="text-sm">{t('user_sessions.empty_state')}</span>
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {filteredSessions?.map((session) => (
              <div
                key={session?.id}
                className="p-3 rounded-lg hover:bg-muted/20 transition-colors cursor-pointer"
              >
                <div className="flex items-start space-x-3">
                  {/* User Avatar */}
                  <div className="relative flex-shrink-0">
                    <img
                      src={session?.user?.avatar}
                      alt={session?.user?.name}
                      className="w-10 h-10 rounded-full object-cover"
                      onError={(e) => {
                        e.target.src = '/assets/images/no_image.png';
                      }}
                    />
                    <div className={`
                      absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-card
                      flex items-center justify-center
                      ${session?.status === 'active' ? 'bg-success' : 
                        session?.status === 'idle' ? 'bg-warning' : 'bg-muted-foreground'}
                    `}>
                      <Icon 
                        name={getStatusIcon(session?.status)} 
                        size={8} 
                        color="white"
                      />
                    </div>
                  </div>

                  {/* Session Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div>
                        <span className="text-sm font-medium text-foreground truncate">
                          {session?.user?.name}
                        </span>
                        <span className="text-xs text-muted-foreground ml-2">
                          {session?.user?.role}
                        </span>
                      </div>
                      <div className={`
                        inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-xs font-medium border
                        ${getStatusColor(session?.status)}
                      `}>
                        <span className="capitalize">{tCommon(`status_values.${session?.status}`)}</span>
                      </div>
                    </div>

                    <div className="text-xs text-muted-foreground mb-2">
                      {session?.dataRoom}
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center space-x-1 rtl:space-x-reverse">
                        <Icon name="Clock" size={12} className="text-muted-foreground" />
                        <span>{session?.duration}</span>
                      </div>
                      <div className="flex items-center space-x-1 rtl:space-x-reverse">
                        <Icon name="FileText" size={12} className="text-muted-foreground" />
                        <span>{session?.documentsViewed} {tCommon('labels.docs')}</span>
                      </div>
                      <div className="flex items-center space-x-1 rtl:space-x-reverse">
                        <Icon name={getDeviceIcon(session?.device)} size={12} className="text-muted-foreground" />
                        <span>{session?.device}</span>
                      </div>
                      <div className="flex items-center space-x-1 rtl:space-x-reverse">
                        <Icon name="MapPin" size={12} className="text-muted-foreground" />
                        <span>{session?.location}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-muted-foreground">
                        {t('user_sessions.session_details.last_activity')}: {session?.lastActivity}
                      </span>
                      <div className="flex space-x-1 rtl:space-x-reverse">
                        <Button variant="ghost" size="xs" iconName="Eye" />
                        <Button variant="ghost" size="xs" iconName="MessageSquare" />
                        {session?.status === 'active' && (
                          <Button variant="ghost" size="xs" iconName="UserX" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Footer */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {filteredSessions?.length} {tCommon('labels.of')} {userSessions?.length} {tCommon('labels.sessions')}
          </span>
          <Button variant="ghost" size="sm">
            {t('user_sessions.view_all_sessions')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RecentUserSessions;
