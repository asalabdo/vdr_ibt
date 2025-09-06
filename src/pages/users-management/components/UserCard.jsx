import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const UserCard = ({ user }) => {
  const { t } = useTranslation('users-management');
  const [isExpanded, setIsExpanded] = useState(false);

  const formatTimeAgo = (dateString) => {
    if (!dateString) return t('time.never');
    const now = new Date();
    const date = new Date(dateString);
    const diff = Math.floor((now - date) / 1000);

    if (diff < 60) return t('time.just_now');
    if (diff < 3600) return t('time.minutes_ago', { count: Math.floor(diff / 60) });
    if (diff < 86400) return t('time.hours_ago', { count: Math.floor(diff / 3600) });
    return t('time.days_ago', { count: Math.floor(diff / 86400) });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-success';
      case 'inactive': return 'text-muted-foreground';
      case 'pending': return 'text-warning';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return 'CheckCircle';
      case 'inactive': return 'XCircle';
      case 'pending': return 'Clock';
      default: return 'Circle';
    }
  };

  return (
    <div className="bg-card rounded-xl shadow-sm border border-border p-6 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
            <span className="text-lg font-semibold text-primary">{user?.avatar}</span>
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{user?.name}</h3>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
        </div>
        
        <button className="p-2 text-muted-foreground hover:text-foreground transition-colors">
          <Icon name="MoreVertical" size={16} />
        </button>
      </div>

      {/* Role and Status */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-foreground">{t('user_card.role')}</span>
          <span className="text-sm text-muted-foreground">{user?.role}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-foreground">{t('user_card.status')}</span>
          <div className="flex items-center space-x-1 rtl:space-x-reverse">
            <Icon name={getStatusIcon(user?.status)} size={14} className={getStatusColor(user?.status)} />
            <span className={`text-sm capitalize ${getStatusColor(user?.status)}`}>
              {t(`status_labels.${user?.status}`)}
            </span>
          </div>
        </div>
      </div>

      {/* Data Rooms Access */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-foreground">{t('user_card.data_rooms')}</span>
          <span className="text-sm text-muted-foreground">{user?.dataRoomsAccess?.length || 0}</span>
        </div>
        
        {user?.dataRoomsAccess?.slice(0, 2)?.map((room, index) => (
          <div key={index} className="text-xs text-muted-foreground mb-1">
            • {room}
          </div>
        ))}
        
        {user?.dataRoomsAccess?.length > 2 && (
          <div className="text-xs text-muted-foreground">
            {t('user_card.more_rooms', { count: user?.dataRoomsAccess?.length - 2 })}
          </div>
        )}
      </div>

      {/* Expandable Permissions */}
      <div className="mb-4">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center justify-between w-full text-sm font-medium text-foreground hover:text-primary transition-colors"
        >
          <span>{t('user_card.permissions')}</span>
          <Icon name={isExpanded ? 'ChevronUp' : 'ChevronDown'} size={14} />
        </button>
        
        {isExpanded && (
          <div className="mt-2 space-y-1">
            {user?.permissions?.map((permission, index) => (
              <div key={index} className="flex items-center space-x-2 rtl:space-x-reverse">
                <Icon name="CheckCircle" size={12} className="text-success" />
                <span className="text-xs text-muted-foreground capitalize">
                  {t(`permissions.${permission}`)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <div className="text-xs text-muted-foreground">
          {t('user_card.last_login')} {formatTimeAgo(user?.lastLogin)}
        </div>
        
        <div className="flex items-center space-x-1 rtl:space-x-reverse">
          <Button variant="ghost" size="sm" title={t('actions.edit')}>
            <Icon name="Edit" size={14} />
          </Button>
          <Button variant="ghost" size="sm" title={t('actions.manage_permissions')}>
            <Icon name="Shield" size={14} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UserCard;