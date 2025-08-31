import React from 'react';

import Icon from '../../../components/AppIcon';

const RoleCard = ({ role }) => {
  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diff = Math.floor((now - date) / 1000);

    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  const grantedPermissions = role?.permissions?.filter(p => p?.granted) || [];
  const deniedPermissions = role?.permissions?.filter(p => !p?.granted) || [];

  return (
    <div className="bg-card rounded-xl shadow-sm border border-border p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <Icon name="Shield" size={24} className="text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{role?.name}</h3>
            <p className="text-sm text-muted-foreground">Role ID: {role?.id}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-1">
          <button className="p-1 text-muted-foreground hover:text-primary transition-colors">
            <Icon name="Edit" size={16} />
          </button>
        </div>
      </div>

      {/* Description */}
      <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
        {role?.description}
      </p>

      {/* Permissions */}
      <div className="space-y-2 mb-4">
        <h4 className="text-sm font-medium text-foreground">Permissions:</h4>
        <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
          {grantedPermissions?.map((permission) => (
            <div key={permission?.name} className="flex items-center space-x-2">
              <Icon name="CheckCircle" size={14} className="text-success flex-shrink-0" />
              <span className="text-xs text-muted-foreground capitalize truncate">
                {permission?.name?.replace('_', ' ')}
              </span>
            </div>
          ))}
          {deniedPermissions?.slice(0, 2)?.map((permission) => (
            <div key={permission?.name} className="flex items-center space-x-2">
              <Icon name="XCircle" size={14} className="text-destructive flex-shrink-0" />
              <span className="text-xs text-muted-foreground capitalize truncate">
                {permission?.name?.replace('_', ' ')}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Icon name="Users" size={14} />
          <span>{role?.userCount} users</span>
        </div>
        <span className="text-xs text-muted-foreground">
          {formatTimeAgo(role?.createdDate)}
        </span>
      </div>
    </div>
  );
};

export default RoleCard;