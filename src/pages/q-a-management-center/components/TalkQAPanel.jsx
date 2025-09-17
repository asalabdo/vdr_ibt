import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/AppIcon';
import { 
  useRooms, 
  useQAMessages, 
  useSendQuestion, 
  useSendAnswer,
  useRoomPermissions
} from '@/hooks/api/useTalk';
import MessageCard from './MessageCard';
import MessageForm from './MessageForm';
import RoomSelectionInterface from './RoomSelectionInterface';

/**
 * Talk Q&A Panel Component - Main interface for Q&A discussions in Talk rooms
 */
const TalkQAPanel = ({ selectedRoomToken, onSelectRoom }) => {
  const { t } = useTranslation('q-a-management-center');
  const [newQuestion, setNewQuestion] = useState('');
  const [answerInputs, setAnswerInputs] = useState({});
  const [isAiEnabled, setIsAiEnabled] = useState(false);

  // API Hooks - ALL hooks must be called before any conditional returns
  const roomsQuery = useRooms();
  const qaQuery = useQAMessages(selectedRoomToken, { 
    enabled: !!selectedRoomToken,
    refetchInterval: 30000
  });
  
  const sendQuestionMutation = useSendQuestion({
    onSuccess: () => {
      setNewQuestion('');
      setIsAiEnabled(false); // Reset AI toggle after sending
    }
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

  // Event Handlers
  const handleSendQuestion = (e) => {
    e.preventDefault();
    if (!newQuestion.trim() || !selectedRoomToken) return;
    
    // Automatically prepend @AI if AI toggle is enabled
    const finalMessage = isAiEnabled ? `@AI ${newQuestion.trim()}` : newQuestion.trim();
    
    sendQuestionMutation.mutate({
      roomToken: selectedRoomToken,
      question: finalMessage
    });
  };

  const handleSendAnswer = (questionId, answer, options = {}) => {
    if (!answer.trim() || !selectedRoomToken) return;
    
    // Automatically add @AI prefix if replying to an AI conversation
    let finalAnswer = answer.trim();
    let autoAIAdded = false;
    
    if (options.replyingToAI && !finalAnswer.startsWith('@AI ')) {
      finalAnswer = `@AI ${finalAnswer}`;
      autoAIAdded = true;
      
      // Show feedback that @AI was automatically added
      toast.info(t('messages.reply.auto_ai_added', { 
        defaultValue: '🤖 Added @AI automatically - AI will respond to your reply' 
      }), {
        description: t('messages.reply.auto_ai_description', { 
          defaultValue: 'Since you\'re continuing an AI conversation, @AI was added to trigger an AI response' 
        }),
        duration: 3000,
        action: {
          label: t('messages.reply.got_it', { defaultValue: 'Got it' }),
          onClick: () => {},
        },
      });
    }
    
    sendAnswerMutation.mutate({
      roomToken: selectedRoomToken,
      questionId,
      answer: finalAnswer
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
    return (
      <RoomSelectionInterface 
        rooms={roomsQuery.data?.rooms || []} 
        onRoomSelect={onSelectRoom}
        t={t}
      />
    );
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

      {/* Message Form */}
      <MessageForm
        newQuestion={newQuestion}
        setNewQuestion={setNewQuestion}
        isAiEnabled={isAiEnabled}
        setIsAiEnabled={setIsAiEnabled}
        onSendQuestion={handleSendQuestion}
        isPending={sendQuestionMutation.isPending}
        roomPermissions={roomPermissions}
        t={t}
      />

      {/* All Messages List */}
      <div className="space-y-4">
        {questions.length === 0 ? (
          <Card className="p-8 text-center">
            <Icon name="MessageCircle" size={48} className="text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">
              {t('messages.empty_state.title', { defaultValue: 'No messages yet' })}
            </h3>
            <p className="text-muted-foreground">
              {t('messages.empty_state.description', { defaultValue: 'Be the first to start the conversation!' })}
            </p>
          </Card>
        ) : (
          questions.map((message) => (
            <MessageCard
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

export default TalkQAPanel;