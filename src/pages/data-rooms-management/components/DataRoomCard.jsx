import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const DataRoomCard = ({ room }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-success text-success-foreground';
      case 'archived':
        return 'bg-muted text-muted-foreground';
      case 'pending':
        return 'bg-warning text-warning-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getCompletionColor = (score) => {
    if (score >= 90) return 'bg-success';
    if (score >= 70) return 'bg-warning';
    return 'bg-error';
  };

  const formatDate = (dateString) => {
    return new Date(dateString)?.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="bg-card rounded-xl shadow-sm border border-border p-6 hover:shadow-md transition-all duration-200 group">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3 cursor-pointer flex-1">
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
            <Icon name="FolderOpen" size={24} className="text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
              {room?.name}
            </h3>
            <p className="text-sm text-muted-foreground">
              Created by {room?.creator}
            </p>
          </div>
        </div>
        
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Icon name="MoreVertical" size={16} />
          </Button>
          
          {/* Dropdown Menu */}
          {isMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-popover border border-border rounded-lg shadow-lg py-2 z-10">
              <button className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-popover-foreground hover:bg-muted/50 transition-colors">
                <Icon name="Eye" size={14} />
                <span>View Details</span>
              </button>
              <button className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-popover-foreground hover:bg-muted/50 transition-colors">
                <Icon name="Users" size={14} />
                <span>Manage Users</span>
              </button>
              <button className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-popover-foreground hover:bg-muted/50 transition-colors">
                <Icon name="Settings" size={14} />
                <span>Settings</span>
              </button>
              <button className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-popover-foreground hover:bg-muted/50 transition-colors">
                <Icon name="Download" size={14} />
                <span>Export</span>
              </button>
              <div className="border-t border-border my-1"></div>
              <button className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-error hover:bg-error/10 transition-colors">
                <Icon name="Archive" size={14} />
                <span>Archive Room</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
        {room?.description}
      </p>

      {/* Status and Deal Type */}
      <div className="flex items-center justify-between mb-4">
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(room?.status)}`}>
          {room?.status?.toUpperCase()}
        </span>
        <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
          {room?.dealType}
        </span>
      </div>

      {/* User Avatars */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="flex -space-x-2">
            {room?.avatars?.slice(0, 4)?.map((avatar, index) => (
              <div
                key={index}
                className="w-8 h-8 bg-primary rounded-full border-2 border-card flex items-center justify-center text-xs font-medium text-primary-foreground"
                title={avatar?.name}
              >
                {avatar?.initials}
              </div>
            ))}
            {room?.userCount > 4 && (
              <div className="w-8 h-8 bg-muted rounded-full border-2 border-card flex items-center justify-center text-xs font-medium text-muted-foreground">
                +{room?.userCount - 4}
              </div>
            )}
          </div>
          <span className="text-sm text-muted-foreground ml-2">
            {room?.userCount} users
          </span>
        </div>
      </div>

      {/* Progress and Completion */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">Completion</span>
          <span className="text-sm font-medium text-foreground">
            {room?.completionScore}%
          </span>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${getCompletionColor(room?.completionScore)}`}
            style={{ width: `${room?.completionScore}%` }}
          ></div>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-1 text-muted-foreground mb-1">
            <Icon name="FileText" size={14} />
            <span className="text-xs">Files</span>
          </div>
          <p className="text-sm font-medium text-foreground">{room?.fileCount}</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center space-x-1 text-muted-foreground mb-1">
            <Icon name="HardDrive" size={14} />
            <span className="text-xs">Storage</span>
          </div>
          <p className="text-sm font-medium text-foreground">{room?.storageUsed}</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center space-x-1 text-muted-foreground mb-1">
            <Icon name="Shield" size={14} />
            <span className="text-xs">Security</span>
          </div>
          <p className="text-sm font-medium text-foreground">{room?.securityScore}%</p>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-muted-foreground pt-4 border-t border-border">
        <div className="flex items-center space-x-1">
          <Icon name="Calendar" size={12} />
          <span>Created {formatDate(room?.createdDate)}</span>
        </div>
        <div className="flex items-center space-x-1">
          <Icon name="Clock" size={12} />
          <span>Updated {formatDate(room?.lastActivity)}</span>
        </div>
      </div>
    </div>
  );
};

export default DataRoomCard;