import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Icon from '@/components/AppIcon';
import { 
  useRooms, 
  useQAMessages, 
  useSendQuestion, 
  useSendAnswer,
  useRoomPermissions,
  useRoomsPermissions
} from '@/hooks/api/useTalk';
import EditRoomModal from './EditRoomModal';
import InviteUsersModal from './InviteUsersModal';
import RemoveUsersModal from './RemoveUsersModal';
import DeleteTalkRoomModal from './DeleteTalkRoomModal';

/**
 * Talk Q&A Panel Component - Main interface for Q&A discussions in Talk rooms
 */
const TalkQAPanel = ({ selectedRoomToken, onSelectRoom }) => {
  const { t } = useTranslation('q-a-management-center');
  const [newQuestion, setNewQuestion] = useState('');
  const [answerInputs, setAnswerInputs] = useState({});

  // API Hooks - ALL hooks must be called before any conditional returns
  const roomsQuery = useRooms();
  const qaQuery = useQAMessages(selectedRoomToken, { 
    enabled: !!selectedRoomToken,
    refetchInterval: 30000
  });
  
  const sendQuestionMutation = useSendQuestion({
    onSuccess: () => setNewQuestion('')
  });
  
  const sendAnswerMutation = useSendAnswer({
    onSuccess: (data, variables) => {
      setAnswerInputs(prev => ({
        ...prev,
        [variables.questionId]: ''
      }));
    }
  });


  // Calculate derived state - must be before any conditional returns
  const questions = qaQuery.data?.questions || [];
  const selectedRoom = roomsQuery.data?.rooms?.find(r => r.token === selectedRoomToken);
  
  // Get permission status for the selected room using hook - MUST be before conditional returns
  const roomPermissions = useRoomPermissions(selectedRoom);

  // Event Handlers - simplified
  const handleSendQuestion = (e) => {
    e.preventDefault();
    if (!newQuestion.trim() || !selectedRoomToken) return;
    
    sendQuestionMutation.mutate({
      roomToken: selectedRoomToken,
      question: newQuestion.trim()
    });
  };

  const handleSendAnswer = (questionId, answer) => {
    if (!answer.trim() || !selectedRoomToken) return;
    
    sendAnswerMutation.mutate({
      roomToken: selectedRoomToken,
      questionId,
      answer: answer.trim()
    });
  };

  // Loading state
  if (roomsQuery.isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Icon name="RefreshCcw" size={24} className="animate-spin mr-2" />
        <span>{t('loading.rooms', { defaultValue: 'Loading rooms...' })}</span>
      </div>
    );
  }

  // Room selection when no room selected
  if (!selectedRoomToken) {
    return <RoomSelectionInterface 
      rooms={roomsQuery.data?.rooms || []} 
      onRoomSelect={onSelectRoom}
      t={t}
    />;
  }

  return (
    <div className="space-y-4">
      {/* Room Header with Permission Status */}
      {selectedRoom && roomPermissions && (
        <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <Icon name="MessageCircle" size={20} className="text-primary" />
            <div>
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <h3 className="font-semibold">{selectedRoom.displayName}</h3>
                {roomPermissions.isReadOnly ? (
                  <Badge variant="destructive" className="bg-destructive/10 text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/20 dark:bg-destructive/20 dark:text-red-400 dark:border-destructive/30">
                    <Icon name="Lock" size={12} className="mr-1 rtl:ml-1 rtl:mr-0" />
                    {t('permissions.read_only', { defaultValue: 'Read-only' })}
                  </Badge>
                ) : (
                  <Badge variant="default" className="bg-green-500/10 text-green-700 hover:bg-green-500/10 hover:text-green-700 border-green-500/20 dark:bg-green-500/20 dark:text-green-400 dark:border-green-500/30">
                    <Icon name="Edit" size={12} className="mr-1 rtl:ml-1 rtl:mr-0" />
                    {t('permissions.can_write', { defaultValue: 'Can Write' })}
                  </Badge>
                )}
              </div>
              {selectedRoom.description && (
                <p className="text-sm text-muted-foreground">{selectedRoom.description}</p>
              )}
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => qaQuery.refetch()}
            disabled={qaQuery.isFetching}
          >
            <Icon name="RefreshCcw" size={16} className={qaQuery.isFetching ? 'animate-spin' : ''} />
            {t('messages.refresh', { defaultValue: 'Refresh' })}
          </Button>
        </div>
      )}

      {/* Message Form - Permission-aware */}
      <Card className="p-4">
        {roomPermissions?.canWrite ? (
          <form onSubmit={handleSendQuestion} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">{t('messages.post_message.label', { defaultValue: 'Post a Message' })}</label>
              <Textarea
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                placeholder={t('messages.post_message.placeholder', { defaultValue: 'Type your message here...' })}
                className="min-h-[80px]"
                disabled={sendQuestionMutation.isPending}
              />
            </div>
            <div className="flex justify-end">
              <Button 
                type="submit" 
                disabled={!newQuestion.trim() || sendQuestionMutation.isPending}
              >
                <Icon name="Send" size={16} className="mr-2" />
                {t('messages.post_message.send', { defaultValue: 'Send Message' })}
              </Button>
            </div>
          </form>
        ) : (
          <div className="text-center py-6">
            <Icon name="Lock" size={48} className="text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">{t('permissions.cannot_post.title', { defaultValue: 'Cannot Post Messages' })}</h3>
            <p className="text-muted-foreground">
              {roomPermissions?.reason || t('permissions.cannot_post.description', { defaultValue: 'You do not have permission to post messages in this room.' })}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              {t('permissions.cannot_post.note', { defaultValue: 'You can still view and read all messages in this room.' })}
            </p>
          </div>
        )}
      </Card>

      {/* All Messages List */}
      <div className="space-y-4">
        {questions.length === 0 ? (
          <Card className="p-8 text-center">
            <Icon name="MessageCircle" size={48} className="text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">{t('messages.empty_state.title', { defaultValue: 'No messages yet' })}</h3>
            <p className="text-muted-foreground">{t('messages.empty_state.description', { defaultValue: 'Be the first to start the conversation!' })}</p>
          </Card>
        ) : (
          questions.map((message) => (
            <SimpleMessageCard
              key={message.id}
              message={message}
              onSendAnswer={handleSendAnswer}
              answerInputs={answerInputs}
              setAnswerInputs={setAnswerInputs}
              isSendingAnswer={sendAnswerMutation.isPending}
              roomPermissions={roomPermissions}
              t={t}
            />
          ))
        )}
      </div>
    </div>
  );
};

/**
 * Message Card Component - Shows any message with reply capability
 */
const SimpleMessageCard = ({ 
  message, 
  onSendAnswer,
  answerInputs,
  setAnswerInputs,
  isSendingAnswer,
  roomPermissions,
  t
}) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const replyInput = answerInputs[message.id] || '';

  const handleSubmitReply = (e) => {
    e.preventDefault();
    if (!replyInput.trim()) return;
    
    onSendAnswer(message.id, replyInput);
    setShowReplyForm(false);
  };

  const handleReplyInputChange = (value) => {
    setAnswerInputs(prev => ({
      ...prev,
      [message.id]: value
    }));
  };

  // All messages in the main list are top-level messages
  const badgeColor = 'secondary';

  return (
    <Card className="p-4">
      <div className="space-y-3">
        {/* Message Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <Badge variant={badgeColor}>{t('message_types.message', { defaultValue: 'Message' })}</Badge>
              <span className="text-sm text-muted-foreground">
                {t('messages.by_user', { user: message.actorDisplayName, defaultValue: 'by {{user}}' })}
              </span>
              <span className="text-xs text-muted-foreground">
                {message.timeAgo}
              </span>
            </div>
            <p className="font-medium">{message.message}</p>
          </div>
          <div className="ml-4">
            {message.hasAnswers ? (
              <Badge variant="default" className="bg-green-500/10 text-green-700 border-green-500/20 dark:bg-green-500/20 dark:text-green-400 dark:border-green-500/30">
                <Icon name="MessageSquare" size={10} className="mr-1 rtl:ml-1 rtl:mr-0" />
                {t('messages.replies_count', { count: message.answersCount, defaultValue: '{{count}} replies' })}
              </Badge>
            ) : (
              <Badge variant="secondary" className="dark:bg-muted dark:text-muted-foreground dark:border-muted-foreground/20">
                {t('messages.no_replies', { defaultValue: 'No replies' })}
              </Badge>
            )}
          </div>
        </div>

        {/* Replies */}
        {message.answers?.length > 0 && (
          <div className="mt-3">
            <div className="ml-4 rtl:mr-4 rtl:ml-0 border-l-2 rtl:border-l-0 rtl:border-r-2 border-primary/30 pl-4 rtl:pr-4 rtl:pl-0 space-y-3">
              {message.answers.map((reply, index) => (
                <div key={reply.id} className="relative">
                  <div className="bg-muted/50 rounded-lg p-3 border border-primary/10 shadow-sm hover:bg-muted/70 transition-colors">
                    <div className="flex items-center space-x-2 rtl:space-x-reverse mb-2">
                      <Icon name="CornerDownRight" size={12} className="text-primary shrink-0" />
                      <span className="text-sm font-medium text-primary truncate">{reply.actorDisplayName}</span>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">{reply.timeAgo}</span>
                      <Badge variant="outline" className="text-xs px-1.5 py-0.5 h-4 bg-primary/5 text-primary border-primary/20 shrink-0">
                        {t('message_types.reply', { defaultValue: 'Reply' })}
                      </Badge>
                    </div>
                    <p className="text-sm text-foreground ml-5 rtl:mr-5 rtl:ml-0 leading-relaxed">{reply.message}</p>
                  </div>
                  {index < message.answers.length - 1 && (
                    <div className="absolute left-2 rtl:right-2 rtl:left-auto top-full w-0.5 h-3 bg-primary/20"></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reply Form - Permission-aware */}
        <div className="pt-2">
          {roomPermissions?.canWrite ? (
            !showReplyForm ? (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowReplyForm(true)}
              >
                <Icon name="MessageCircle" size={16} className="mr-1 rtl:ml-1 rtl:mr-0" />
                {t('messages.reply.button', { defaultValue: 'Reply' })}
              </Button>
            ) : (
              <form onSubmit={handleSubmitReply} className="space-y-2">
                <Textarea
                  value={replyInput}
                  onChange={(e) => handleReplyInputChange(e.target.value)}
                  placeholder={t('messages.reply.placeholder', { defaultValue: 'Type your reply here...' })}
                  className="min-h-[60px] focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
                  disabled={isSendingAnswer}
                  autoFocus
                />
                <div className="flex justify-end space-x-2 rtl:space-x-reverse">
                  <Button 
                    type="button"
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setShowReplyForm(false);
                      handleReplyInputChange('');
                    }}
                  >
                    {t('messages.reply.cancel', { defaultValue: 'Cancel' })}
                  </Button>
                  <Button 
                    type="submit" 
                    size="sm"
                    disabled={!replyInput.trim() || isSendingAnswer}
                    className="min-w-[100px]"
                  >
                    {isSendingAnswer ? (
                      <Icon name="Loader2" size={14} className="animate-spin mr-1 rtl:ml-1 rtl:mr-0" />
                    ) : (
                      <Icon name="Send" size={14} className="mr-1 rtl:ml-1 rtl:mr-0" />
                    )}
                    {isSendingAnswer 
                      ? t('messages.reply.sending', { defaultValue: 'Sending...' })
                      : t('messages.reply.send', { defaultValue: 'Send Reply' })
                    }
                  </Button>
                </div>
              </form>
            )
          ) : (
            <div className="text-center py-4 px-2 bg-muted/20 rounded-lg border border-dashed">
              <Icon name="Lock" size={16} className="text-muted-foreground mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">
                {t('permissions.cannot_reply', { defaultValue: 'Cannot reply' })} - {roomPermissions?.reason?.toLowerCase() || t('permissions.no_write_permission', { defaultValue: 'no write permission' })}
              </p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

// Removed overcomplicated CreateQARoomForm - use existing Talk rooms

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
 * Simplified Room Selection Interface
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
        <h3 className="text-lg font-semibold mb-2">{t('room_selection.empty_state.title', { defaultValue: 'No Talk Rooms Available' })}</h3>
        <p className="text-muted-foreground">
          {t('room_selection.empty_state.description', { defaultValue: 'Create a Talk room in Nextcloud first, then return here to view and participate in discussions.' })}
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold mb-1">{t('room_selection.title', { defaultValue: 'Select a Talk Room' })}</h2>
        <p className="text-muted-foreground">{t('room_selection.description', { defaultValue: 'Choose a room to view messages and participate in discussions' })}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rooms.map((room) => {
          const roomPermissions = roomsPermissions[room.token];
          
          return (
            <Card key={room.token} className="p-4 hover:shadow-lg transition-all duration-200 hover:border-primary/30 hover:bg-muted/20">
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

export default TalkQAPanel;
