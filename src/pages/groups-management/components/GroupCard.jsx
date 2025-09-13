import React from 'react';
import { useTranslation } from 'react-i18next';
import Icon from '../../../components/AppIcon';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

const GroupCard = ({ group, onViewDetails, onEdit, onDelete, onManageMembers }) => {
  const { t, i18n } = useTranslation('groups-management');
  const { t: tCommon } = useTranslation('common');

  const isProtectedGroup = group?.id?.toLowerCase() === 'admin';

  const getMemberCountColor = (count) => {
    if (count === 0) return 'bg-muted text-muted-foreground';
    if (count < 5) return 'bg-warning text-warning-foreground';
    if (count < 20) return 'bg-primary text-primary-foreground';
    return 'bg-success text-success-foreground';
  };

  const getGroupInitials = (groupName) => {
    if (!groupName) return 'G';
    return groupName
      .split(/[\s-_]+/)
      .map(word => word.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;
    return new Date(dateString)?.toLocaleDateString(i18n.language, {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <Card className="hover:shadow-md transition-all duration-200 group">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3 rtl:space-x-reverse cursor-pointer flex-1" onClick={() => onViewDetails?.(group.id)}>
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Icon name="Users" size={24} className="text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                {group?.displayName || group?.id}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t('group_card.group_id', { 
                  defaultValue: 'Group ID: {{id}}',
                  id: group?.id 
                })}
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
              <DropdownMenuItem onClick={() => onViewDetails?.(group.id)}>
                <Icon name="Eye" size={14} className="mr-2" />
                {t('actions.view_details', { defaultValue: 'View Details' })}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit?.(group.id)}>
                <Icon name="Settings" size={14} className="mr-2" />
                {t('actions.edit', { defaultValue: 'Edit' })}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onManageMembers?.(group.id)}>
                <Icon name="Users" size={14} className="mr-2" />
                {t('actions.manage_members', { defaultValue: 'Manage Members' })}
              </DropdownMenuItem>
              
              {!isProtectedGroup && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => onDelete?.(group.id)} 
                    className="text-destructive focus:text-destructive"
                  >
                    <Icon name="Trash2" size={14} className="mr-2" />
                    {t('actions.delete', { defaultValue: 'Delete' })}
                  </DropdownMenuItem>
                </>
              )}
              
              {isProtectedGroup && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    disabled 
                    className="text-muted-foreground"
                  >
                    <Icon name="Shield" size={14} className="mr-2" />
                    {t('actions.protected_group', { defaultValue: 'Protected Group' })}
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Group Description or ID as fallback */}
        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
          {group?.displayName !== group?.id 
            ? t('group_card.id_display', { 
                defaultValue: 'ID: {{id}}',
                id: group?.id 
              })
            : t('group_card.no_description', { 
                defaultValue: 'No description available' 
              })
          }
        </p>

        {/* Status and Member Count */}
        <div className="flex items-center justify-between mb-4">
          <Badge variant="default" className="gap-1">
            <Icon name="CheckCircle" size={12} />
            {t('group_card.status.active', { defaultValue: 'Active' })}
          </Badge>
          <Badge variant="outline" className={`gap-1 ${getMemberCountColor(group?.memberCount || 0)}`}>
            <Icon name="Users" size={12} />
            {group?.memberCount || 0} {t('group_card.members', { defaultValue: 'members' })}
          </Badge>
        </div>

        {/* Member Avatars Preview */}
        {group?.members && group.members.length > 0 ? (
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <div className="flex -space-x-2 rtl:space-x-reverse rtl:-space-x-2">
                {group.members.slice(0, 3).map((member, index) => (
                  <Avatar key={member.id || index} className="w-8 h-8 border-2 border-card">
                    <AvatarFallback className="text-xs font-medium bg-primary text-primary-foreground">
                      {member.displayName?.charAt(0).toUpperCase() || member.id?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                ))}
                {group.members.length > 3 && (
                  <Avatar className="w-8 h-8 border-2 border-card">
                    <AvatarFallback className="text-xs font-medium bg-muted text-muted-foreground">
                      +{group.members.length - 3}
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
              <span className="text-sm text-muted-foreground ml-2 rtl:mr-2 rtl:ml-0">
                {group.memberCount || group.members.length} {t('group_card.members', { defaultValue: 'members' })}
              </span>
            </div>
          </div>
        ) : (
          <div className="mb-4">
            <div className="flex items-center justify-center py-3 bg-muted/50 rounded-lg">
              <Icon name="UserX" size={16} className="text-muted-foreground mr-2" />
              <span className="text-sm text-muted-foreground">
                {t('group_card.no_members', { defaultValue: 'No members yet' })}
              </span>
            </div>
          </div>
        )}

        {/* Group Info */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1 rtl:space-x-reverse text-muted-foreground mb-1">
              <Icon name="Users" size={14} />
              <span className="text-xs">{t('group_card.members', { defaultValue: 'Members' })}</span>
            </div>
            <p className="text-sm font-medium text-foreground">{group?.memberCount || 0}</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1 rtl:space-x-reverse text-muted-foreground mb-1">
              <Icon name="Shield" size={14} />
              <span className="text-xs">{t('group_card.permissions', { defaultValue: 'Permissions' })}</span>
            </div>
            <p className="text-sm font-medium text-foreground">
              {t('group_card.standard', { defaultValue: 'Standard' })}
            </p>
          </div>
        </div>

        <Separator className="my-4" />
        
        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center space-x-1 rtl:space-x-reverse">
            <Icon name="Hash" size={12} />
            <span>
              {t('group_card.id_label', { defaultValue: 'ID' })}: {group?.id}
            </span>
          </div>
          {group?.createdAt && (
            <div className="flex items-center space-x-1 rtl:space-x-reverse">
              <Icon name="Calendar" size={12} />
              <span>
                {t('group_card.created', { defaultValue: 'Created' })}: {formatDate(group.createdAt)}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default GroupCard;
