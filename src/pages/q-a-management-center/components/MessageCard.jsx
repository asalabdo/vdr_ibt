import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/AppIcon';

/**
 * Helper function to detect if a message is from AI Assistant
 */
const isAIMessage = (message) => {
  return message.actorDisplayName === 'AI Assistant' || 
         message.actorDisplayName === 'ai_assistant' ||
         message.actorId === 'ai_assistant';
};

/**
 * Helper function to detect if a message is an AI question
 */
const isAIQuestion = (message) => {
  return message.message && message.message.startsWith('@AI ');
};

/**
 * Helper function to render message content with markdown for AI responses
 */
const renderMessageContent = (message, className = "") => {
  const aiMessage = isAIMessage(message);
  const aiQuestion = isAIQuestion(message);
  const displayMessage = aiQuestion ? message.message.replace(/^@AI\s+/, '') : message.message;
  
  if (aiMessage) {
    return (
      <div className={`${className} ai-message-content`}>
        <div className="relative bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-950/30 dark:to-purple-950/30 rounded-lg p-4 border border-blue-200/30 dark:border-blue-800/30">
          {/* AI Badge */}
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center gap-1.5 px-2 py-1 bg-blue-100 dark:bg-blue-900/50 rounded-full">
              <Icon name="Sparkles" size={10} className="text-blue-600 dark:text-blue-400" />
              <span className="text-xs font-medium text-blue-700 dark:text-blue-300">AI Assistant</span>
            </div>
          </div>
          
          {/* Markdown Content */}
          <div className="prose prose-sm max-w-none dark:prose-invert prose-blue">
            <ReactMarkdown
              components={{
                // Customize markdown components for better styling
                p: ({ children }) => <p className="mb-3 last:mb-0 leading-relaxed text-foreground">{children}</p>,
                ul: ({ children }) => <ul className="mb-3 pl-4 space-y-1 list-disc">{children}</ul>,
                ol: ({ children }) => <ol className="mb-3 pl-4 space-y-1 list-decimal">{children}</ol>,
                li: ({ children }) => <li className="text-sm text-foreground">{children}</li>,
                strong: ({ children }) => <strong className="font-semibold text-blue-900 dark:text-blue-100">{children}</strong>,
                em: ({ children }) => <em className="italic text-blue-700 dark:text-blue-300">{children}</em>,
                code: ({ children }) => (
                  <code className="px-2 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 rounded text-xs font-mono border">{children}</code>
                ),
                pre: ({ children }) => (
                  <pre className="bg-slate-100 dark:bg-slate-800 p-3 rounded-lg overflow-x-auto text-xs border">{children}</pre>
                ),
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-blue-400 dark:border-blue-600 pl-4 italic text-blue-700 dark:text-blue-300 bg-blue-50/50 dark:bg-blue-950/20 py-2 rounded-r">{children}</blockquote>
                ),
                h1: ({ children }) => <h1 className="text-lg font-bold mb-2 text-blue-900 dark:text-blue-100">{children}</h1>,
                h2: ({ children }) => <h2 className="text-base font-semibold mb-2 text-blue-800 dark:text-blue-200">{children}</h2>,
                h3: ({ children }) => <h3 className="text-sm font-medium mb-1 text-blue-700 dark:text-blue-300">{children}</h3>,
              }}
            >
              {displayMessage}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    );
  }
  
  // Regular text for non-AI messages
  return <p className={className}>{displayMessage}</p>;
};

/**
 * Message Card Component - Shows any message with reply capability
 */
const MessageCard = ({ 
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

  // Check if this is an AI message (from AI Assistant)
  const aiMessage = isAIMessage(message);

  // Check if this is an AI question to determine badge style
  const aiQuestion = isAIQuestion(message);

  // Check if this message is part of an AI conversation context
  const isAIConversationContext = aiMessage || aiQuestion;

  const handleSubmitReply = (e) => {
    e.preventDefault();
    if (!replyInput.trim()) return;
    
    // Pass both the reply text and whether this is replying to an AI conversation
    onSendAnswer(message.id, replyInput, { replyingToAI: isAIConversationContext });
    setShowReplyForm(false);
  };

  const handleReplyInputChange = (value) => {
    setAnswerInputs(prev => ({
      ...prev,
      [message.id]: value
    }));
  };

  const badgeColor = aiQuestion ? 'default' : 'secondary';

  return (
    <Card className="p-4">
      <div className="space-y-3">
        {/* Message Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              {aiQuestion ? (
                <Badge className="bg-blue-500/10 text-blue-700 border-blue-500/20 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-500/30">
                  <Icon name="Bot" size={10} className="mr-1 rtl:ml-1 rtl:mr-0" />
                  {t('message_types.ai_question', { defaultValue: 'AI Question' })}
                </Badge>
              ) : (
                <Badge variant={badgeColor}>{t('message_types.message', { defaultValue: 'Message' })}</Badge>
              )}
              <span className="text-sm text-muted-foreground">
                {t('messages.by_user', { user: message.actorDisplayName, defaultValue: 'by {{user}}' })}
              </span>
              <span className="text-xs text-muted-foreground">
                {message.timeAgo}
              </span>
            </div>
            {renderMessageContent(message, "font-medium")}
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
              {message.answers.map((reply, index) => {
                // Check if reply is an AI question
                const isReplyAIQuestion = isAIQuestion(reply);
                
                return (
                  <div key={reply.id} className="relative">
                    <div className="bg-muted/50 rounded-lg p-3 border border-primary/10 shadow-sm hover:bg-muted/70 transition-colors">
                      <div className="flex items-center space-x-2 rtl:space-x-reverse mb-2">
                        <Icon name="CornerDownRight" size={12} className="text-primary shrink-0" />
                        <span className="text-sm font-medium text-primary truncate">{reply.actorDisplayName}</span>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">{reply.timeAgo}</span>
                        {isReplyAIQuestion ? (
                          <Badge className="text-xs px-1.5 py-0.5 h-4 bg-blue-500/10 text-blue-700 border-blue-500/20 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-500/30 shrink-0">
                            <Icon name="Bot" size={8} className="mr-1 rtl:ml-1 rtl:mr-0" />
                            {t('message_types.ai_reply', { defaultValue: 'AI Reply' })}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs px-1.5 py-0.5 h-4 bg-primary/5 text-primary border-primary/20 shrink-0">
                            {t('message_types.reply', { defaultValue: 'Reply' })}
                          </Badge>
                        )}
                      </div>
                      {renderMessageContent(reply, "text-sm text-foreground ml-5 rtl:mr-5 rtl:ml-0 leading-relaxed")}
                    </div>
                    {index < message.answers.length - 1 && (
                      <div className="absolute left-2 rtl:right-2 rtl:left-auto top-full w-0.5 h-3 bg-primary/20"></div>
                    )}
                  </div>
                );
              })}
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
                {/* AI Auto-Reply Indicator */}
                {isAIConversationContext && (
                  <div className="flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800/30">
                    <Icon name="Sparkles" size={14} className="text-blue-600 dark:text-blue-400" />
                    <span className="text-xs text-blue-700 dark:text-blue-300 font-medium">
                      {t('messages.reply.ai_auto_reply', { defaultValue: 'AI will automatically respond to your reply' })}
                    </span>
                  </div>
                )}
                <Textarea
                  value={replyInput}
                  onChange={(e) => handleReplyInputChange(e.target.value)}
                  placeholder={
                    isAIConversationContext 
                      ? t('messages.reply.ai_placeholder', { defaultValue: 'Reply to AI (AI will respond automatically)...' })
                      : t('messages.reply.placeholder', { defaultValue: 'Type your reply here...' })
                  }
                  className={`min-h-[60px] focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-colors ${
                    isAIConversationContext ? 'border-blue-200 dark:border-blue-800 bg-blue-50/30 dark:bg-blue-950/10' : ''
                  }`}
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

export default MessageCard;
