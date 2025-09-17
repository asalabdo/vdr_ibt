import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Icon from '@/components/AppIcon';
import { useRoomsPermissions } from '@/hooks/api/useTalk';
import EditRoomModal from './EditRoomModal';
import InviteUsersModal from './InviteUsersModal';
import RemoveUsersModal from './RemoveUsersModal';
import DeleteTalkRoomModal from './DeleteTalkRoomModal';

/**
 * Get room type label for display
 */
const getRoomTypeLabel = (roomType, t) => {
  switch (roomType) {
    case 2:
      return t('room_selection.room_types.group_chat', { defaultValue: 'Group Chat' });
    case 6:
      return t('room_selection.room_types.personal', { defaultValue: 'Personal' });
    case 4:
      return t('room_selection.room_types.changelog', { defaultValue: 'Changelog' });
    default:
      return t('room_selection.room_types.group_chat', { defaultValue: 'Group Chat' });
  }
};

/**
 * Room Selection Interface Component
 */
const RoomSelectionInterface = ({ rooms, onRoomSelect, t }) => {
  // Edit modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedRoomForEdit, setSelectedRoomForEdit] = useState(null);

  // Invite users modal state
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [selectedRoomForInvite, setSelectedRoomForInvite] = useState(null);

  // Remove users modal state
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);
  const [selectedRoomForRemove, setSelectedRoomForRemove] = useState(null);

  // Delete room modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedRoomForDelete, setSelectedRoomForDelete] = useState(null);

  // Get permissions for all rooms using hook
  const roomsPermissions = useRoomsPermissions(rooms);

  const handleDeleteRoom = (room) => {
    setSelectedRoomForDelete(room);
    setIsDeleteModalOpen(true);
  };

  const handleEditRoom = (room) => {
    setSelectedRoomForEdit(room);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedRoomForEdit(null);
  };

  const handleInviteUsers = (room) => {
    setSelectedRoomForInvite(room);
    setIsInviteModalOpen(true);
  };

  const handleCloseInviteModal = () => {
    setIsInviteModalOpen(false);
    setSelectedRoomForInvite(null);
  };

  const handleRemoveUsers = (room) => {
    setSelectedRoomForRemove(room);
    setIsRemoveModalOpen(true);
  };

  const handleCloseRemoveModal = () => {
    setIsRemoveModalOpen(false);
    setSelectedRoomForRemove(null);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedRoomForDelete(null);
  };

  if (rooms.length === 0) {
    return (
      <Card className="p-8 text-center">
        <Icon name="MessageCircle" size={48} className="text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">
          {t('room_selection.empty_state.title', { defaultValue: 'No Talk Rooms Available' })}
        </h3>
        <p className="text-muted-foreground">
          {t('room_selection.empty_state.description', { 
            defaultValue: 'Create a Talk room in Nextcloud first, then return here to view and participate in discussions.' 
          })}
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold mb-1">
          {t('room_selection.title', { defaultValue: 'Select a Talk Room' })}
        </h2>
        <p className="text-muted-foreground">
          {t('room_selection.description', { 
            defaultValue: 'Choose a room to view messages and participate in discussions' 
          })}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rooms.map((room) => {
          const roomPermissions = roomsPermissions[room.token];
          
          return (
            <Card 
              key={room.token} 
              className="p-4 hover:shadow-lg transition-all duration-200 hover:border-primary/30 hover:bg-muted/20"
            >
              <div className="flex items-start justify-between mb-3">
                <div 
                  className="flex items-center space-x-2 rtl:space-x-reverse cursor-pointer flex-1"
                  onClick={() => onRoomSelect(room.token)}
                >
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <Icon name="MessageCircle" size={16} className="text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-1 rtl:space-x-reverse mb-1">
                      <h4 className="font-medium truncate">{room.displayName}</h4>
                      {roomPermissions?.isReadOnly && (
                        <Icon name="Lock" size={12} className="text-orange-500" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {getRoomTypeLabel(room.type, t)}
                      {roomPermissions?.isReadOnly && ` • ${t('permissions.read_only', { defaultValue: 'Read-only' })}`}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  {room.unreadMessages > 0 && (
                    <Badge variant="destructive" className="text-xs">
                      {room.unreadMessages}
                    </Badge>
                  )}
                  
                  {/* Room Management Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0 hover:bg-muted"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Icon name="MoreVertical" size={14} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem 
                        onClick={() => onRoomSelect(room.token)}
                        className="gap-2"
                      >
                        <Icon name="MessageCircle" size={14} />
                        {t('room_management.enter_room', { defaultValue: 'Enter Room' })}
                      </DropdownMenuItem>
                      
                      <DropdownMenuSeparator />
                      
                      <DropdownMenuItem 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditRoom(room);
                        }}
                        className="gap-2"
                      >
                        <Icon name="Edit" size={14} />
                        {t('room_management.edit_room', { defaultValue: 'Edit Room' })}
                      </DropdownMenuItem>
                      
                      <DropdownMenuItem 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleInviteUsers(room);
                        }}
                        className="gap-2"
                      >
                        <Icon name="UserPlus" size={14} />
                        {t('room_management.invite_users', { defaultValue: 'Invite Users' })}
                      </DropdownMenuItem>
                      
                      <DropdownMenuItem 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveUsers(room);
                        }}
                        className="gap-2"
                      >
                        <Icon name="UserMinus" size={14} />
                        {t('room_management.remove_users', { defaultValue: 'Remove Users' })}
                      </DropdownMenuItem>
                      
                      <DropdownMenuSeparator />
                      
                      <DropdownMenuItem 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteRoom(room);
                        }}
                        className="gap-2 text-destructive focus:text-destructive"
                      >
                        <Icon name="Trash2" size={14} />
                        {t('room_management.delete_room', { defaultValue: 'Delete Room' })}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              
              {/* Room Description */}
              {room.description && (
                <div className="mt-2 pt-2 border-t">
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {room.description}
                  </p>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Edit Room Modal */}
      <EditRoomModal 
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        room={selectedRoomForEdit}
        t={t}
      />

      {/* Invite Users Modal */}
      <InviteUsersModal 
        isOpen={isInviteModalOpen}
        onClose={handleCloseInviteModal}
        room={selectedRoomForInvite}
        t={t}
      />

      {/* Remove Users Modal */}
      <RemoveUsersModal 
        isOpen={isRemoveModalOpen}
        onClose={handleCloseRemoveModal}
        room={selectedRoomForRemove}
        t={t}
      />

      {/* Delete Room Modal */}
      <DeleteTalkRoomModal 
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        room={selectedRoomForDelete}
      />
    </div>
  );
};

export default RoomSelectionInterface;
