import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { usePermissions } from '@/hooks/api/useAuth';
import { PERMISSIONS } from '@/lib/permissions';
import Icon from '../../../components/AppIcon';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

const DataRoomCard = ({ room, onViewDetails, onEdit, onDelete, onManageGroups }) => {
  const { t, i18n } = useTranslation('data-rooms-management');
  const { t: tCommon } = useTranslation('common');
  const navigate = useNavigate();
  
  // Get user permissions
  const {
    canManageDataRooms,
    canCreateDataRooms,
    isAdmin,
    isSubadmin,
    hasPermission
  } = usePermissions();

  const getStatusColor = (isEnabled) => {
    return isEnabled 
      ? 'bg-success text-success-foreground'
      : 'bg-muted text-muted-foreground';
  };

  const getCompletionColor = (score) => {
    if (score >= 90) return 'bg-success';
    if (score >= 70) return 'bg-warning';
    return 'bg-error';
  };

  // Get room status based on ACL enabled
  const getRoomStatus = () => {
    return room?.aclEnabled ? 'active' : 'inactive';
  };

  // Get completion score (mock for now since API doesn't provide this)
  const getCompletionScore = () => {
    // Mock completion score based on whether room has groups and managers
    let score = 50; // Base score
    if (room?.hasGroups) score += 25;
    if (room?.hasManagers) score += 25;
    return score;
  };

  const formatDate = (dateString) => {
    return new Date(dateString)?.toLocaleDateString(i18n.language, {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Navigate to document management console with the data room folder
  const handleBrowseFiles = () => {
    if (room?.mountPoint) {
      // Navigate with clean URL but pass room data via state
      navigate('/document-management-console', {
        state: { 
          roomPath: room.mountPoint,
          roomName: room.roomName || room.mountPoint,
          roomId: room.roomId
        }
      });
    }
  };

  return (
    <Card className="hover:shadow-md transition-all duration-200 group">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
        <div 
          className="flex items-center space-x-3 rtl:space-x-reverse cursor-pointer flex-1"
          onClick={hasPermission(PERMISSIONS.DOCUMENTS_VIEW) ? handleBrowseFiles : undefined}
        >
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
            <Icon name="FolderOpen" size={24} className="text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
              {room?.roomName || room?.mountPoint}
            </h3>
            <p className="text-sm text-muted-foreground">
              {t('room_card.room_id', { id: room?.roomId })}
            </p>
          </div>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="transition-opacity"
            >
              <Icon name="MoreVertical" size={16} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {/* Browse Files - Available to users with documents.view permission */}
            {hasPermission('documents.view') && (
              <DropdownMenuItem onClick={handleBrowseFiles}>
                <Icon name="Folder" size={14} className="mr-2" />
                {t('actions.browse_files', { defaultValue: 'Browse Files' })}
              </DropdownMenuItem>
            )}
            
            {/* View Details - Available to all users */}
            <DropdownMenuItem onClick={() => onViewDetails?.(room.roomId)}>
              <Icon name="Eye" size={14} className="mr-2" />
              {t('actions.view_details')}
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
            
            {/* Edit - Only for users who can manage data rooms */}
            {canManageDataRooms && (
              <DropdownMenuItem onClick={() => onEdit?.(room.roomId)}>
                <Icon name="Settings" size={14} className="mr-2" />
                {t('actions.edit', { defaultValue: 'Edit' })}
              </DropdownMenuItem>
            )}
            
            {/* Manage Groups - Only for users who can manage data rooms */}
            {canManageDataRooms && (
              <DropdownMenuItem onClick={() => onManageGroups?.(room.roomId)}>
                <Icon name="Users" size={14} className="mr-2" />
                {t('actions.manage_groups', { defaultValue: 'Manage Groups' })}
              </DropdownMenuItem>
            )}
            
            {/* Show separator only if user has management permissions */}
            {canManageDataRooms && <DropdownMenuSeparator />}
            
            {/* Delete - Only for admins or users with full data room management */}
            {canManageDataRooms && (
              <DropdownMenuItem 
                onClick={() => onDelete?.(room)} 
                className="text-destructive focus:text-destructive"
              >
                <Icon name="Trash2" size={14} className="mr-2" />
                {t('actions.delete', { defaultValue: 'Delete' })}
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Mount Point as Description */}
      <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
        {t('room_card.mount_point', { mountPoint: room?.mountPoint })}
      </p>

      {/* Status and Info */}
      <div className="flex items-center justify-between mb-4">
        <Badge variant={room?.isActive ? "default" : "secondary"}>
          {room?.isActive 
            ? t('room_card.status_labels.active')
            : t('room_card.status_labels.inactive')
          }
        </Badge>
        <Badge variant="outline">
          {room?.isUnlimitedQuota 
            ? t('room_card.unlimited_quota')
            : room?.formattedQuota
          }
        </Badge>
      </div>

      {/* Groups Info */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <div className="flex -space-x-2 rtl:space-x-reverse rtl:-space-x-2">
            {room?.groupsList?.slice(0, 3)?.map((groupName, index) => (
              <Avatar key={index} className="w-8 h-8 border-2 border-card">
                <AvatarFallback className="text-xs font-medium bg-primary text-primary-foreground">
                  {groupName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            ))}
            {room?.groupsCount > 3 && (
              <Avatar className="w-8 h-8 border-2 border-card">
                <AvatarFallback className="text-xs font-medium bg-muted text-muted-foreground">
                  +{room?.groupsCount - 3}
                </AvatarFallback>
              </Avatar>
            )}
          </div>
          <span className="text-sm text-muted-foreground ml-2 rtl:mr-2 rtl:ml-0">
            {room?.groupsCount || 0} {t('room_card.groups')}
          </span>
        </div>
      </div>

      {/* Progress and Completion */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">
            {t('room_card.setup_completion')}
          </span>
          <span className="text-sm font-medium text-foreground">
            {getCompletionScore()}%
          </span>
        </div>
        <Progress value={getCompletionScore()} className="h-2" />
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-1 rtl:space-x-reverse text-muted-foreground mb-1">
            <Icon name="Users" size={14} />
            <span className="text-xs">{t('room_card.groups')}</span>
          </div>
          <p className="text-sm font-medium text-foreground">{room?.groupsCount || 0}</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center space-x-1 rtl:space-x-reverse text-muted-foreground mb-1">
            <Icon name="HardDrive" size={14} />
            <span className="text-xs">{t('room_card.storage')}</span>
          </div>
          <p className="text-sm font-medium text-foreground">{room?.formattedSize}</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center space-x-1 rtl:space-x-reverse text-muted-foreground mb-1">
            <Icon name="Crown" size={14} />
            <span className="text-xs">{t('room_card.managers')}</span>
          </div>
          <p className="text-sm font-medium text-foreground">{room?.managersCount || 0}</p>
        </div>
      </div>

        <Separator className="my-4" />
        
        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center space-x-1 rtl:space-x-reverse">
            <Icon name="FolderOpen" size={12} />
            <span>
              {t('room_card.mount_point_label')}: {room?.mountPoint}
            </span>
          </div>
          <div className="flex items-center space-x-1 rtl:space-x-reverse">
            <Icon name="Hash" size={12} />
            <span>
              {t('room_card.id_label')}: {room?.id}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DataRoomCard;
