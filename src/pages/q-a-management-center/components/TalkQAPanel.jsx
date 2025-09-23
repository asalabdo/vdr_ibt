import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
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
    enabled: !!selectedRoomToken
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
    
    if (options.replyingToAI && !finalAnswer.startsWith('@AI ')) {
      finalAnswer = `@AI ${finalAnswer}`;
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
      <div className="p-6">
        <div className="space-y-6">
          {/* Title skeleton */}
          <div className="text-center md:text-left">
            <Skeleton className="h-8 w-64 mb-2 mx-auto md:mx-0" />
            <Skeleton className="h-6 w-96 mx-auto md:mx-0" />
          </div>

          {/* Room cards skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <Card key={index} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3 flex-1">
                    <Skeleton className="w-10 h-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Skeleton className="w-8 h-8 rounded" />
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-border/50">
                  <Skeleton className="h-4 w-full mb-1" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Room selection when no room selected
  if (!selectedRoomToken) {
    return (
      <div className="p-6">
        <RoomSelectionInterface 
          rooms={roomsQuery.data?.rooms || []} 
          onRoomSelect={onSelectRoom}
          t={t}
        />
      </div>
    );
  }

  return (
    <div>
      {/* Room Header with Permission Status */}
      {selectedRoom && roomPermissions && (
        <div className="border-b border-border/50 bg-muted/20">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-4">
              {/* Room Avatar */}
              <div className="w-12 h-12 bg-gradient-to-r from-primary/10 to-primary/20 rounded-full flex items-center justify-center border border-primary/20">
                <Icon name="MessageCircle" size={20} className="text-primary" />
              </div>
              
              {/* Room Info */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-lg font-semibold text-foreground">{selectedRoom.displayName}</h3>
                  
                  {/* Permission Status */}
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
                  <p className="text-sm text-muted-foreground leading-relaxed">{selectedRoom.description}</p>
                )}
              </div>
            </div>
            
            {/* Room Actions */}
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => qaQuery.refetch()}
                disabled={qaQuery.isFetching}
                className="h-9 px-3"
              >
                <Icon name="RefreshCcw" size={14} className={`mr-2 ${qaQuery.isFetching ? 'animate-spin' : ''}`} />
                {t('messages.refresh', { defaultValue: 'Refresh' })}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Message Form */}
      <div className="border-b border-border/50">
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
      </div>

      {/* Messages Thread - Full Page Flow */}
      <div className="space-y-6 p-4">
        {questions.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-950/30 dark:to-purple-950/30 rounded-full flex items-center justify-center mb-6">
              <Icon name="MessageCircle" size={32} className="text-blue-500 dark:text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-foreground">
              {t('messages.empty_state.title', { defaultValue: 'Start the Conversation' })}
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              {t('messages.empty_state.description', { 
                defaultValue: 'This room is ready for your first message. Share your thoughts or ask the AI assistant anything!' 
              })}
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              <Badge variant="outline" className="text-xs">
                <Icon name="Lightbulb" size={10} className="mr-1" />
                {t('empty_state.suggestions.ideas', { defaultValue: 'Share ideas' })}
              </Badge>
              <Badge variant="outline" className="text-xs">
                <Icon name="HelpCircle" size={10} className="mr-1" />
                {t('empty_state.suggestions.questions', { defaultValue: 'Ask questions' })}
              </Badge>
              <Badge variant="outline" className="text-xs">
                <Icon name="Bot" size={10} className="mr-1" />
                {t('empty_state.suggestions.ai', { defaultValue: 'Talk to AI' })}
              </Badge>
            </div>
          </div>
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