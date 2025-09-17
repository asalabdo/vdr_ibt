import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
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
        <div className="relative bg-gradient-to-br from-blue-50/60 via-indigo-50/40 to-purple-50/60 dark:from-blue-950/40 dark:via-indigo-950/30 dark:to-purple-950/40 rounded-xl p-5 border border-blue-200/40 dark:border-blue-800/40 shadow-sm">
          {/* AI Glow Effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-indigo-500/5 to-purple-500/5 rounded-xl" />
          
          {/* Content Container */}
          <div className="relative">
            {/* Enhanced Markdown Content */}
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <ReactMarkdown
                components={{
                  // Enhanced paragraph styling
                  p: ({ children }) => (
                    <p className="mb-4 last:mb-0 leading-relaxed text-foreground/90 text-sm">
                      {children}
                    </p>
                  ),
                  
                  // Enhanced list styling
                  ul: ({ children }) => (
                    <ul className="mb-4 pl-5 space-y-2 text-sm">
                      {children}
                    </ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="mb-4 pl-5 space-y-2 list-decimal">
                      {children}
                    </ol>
                  ),
                  li: ({ children }) => (
                    <li className="text-sm text-foreground/90 leading-relaxed marker:text-blue-500 dark:marker:text-blue-400">
                      {children}
                    </li>
                  ),
                  
                  // Enhanced text styling
                  strong: ({ children }) => (
                    <strong className="font-semibold text-blue-900 dark:text-blue-100 bg-blue-100/50 dark:bg-blue-900/30 px-1 rounded">
                      {children}
                    </strong>
                  ),
                  em: ({ children }) => (
                    <em className="italic text-blue-700 dark:text-blue-300 font-medium">
                      {children}
                    </em>
                  ),
                  
                  // Enhanced code styling
                  code: ({ children }) => (
                    <code className="px-2 py-1 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/60 dark:to-indigo-900/60 text-blue-800 dark:text-blue-200 rounded-md text-xs font-mono border border-blue-200/50 dark:border-blue-700/50 shadow-sm">
                      {children}
                    </code>
                  ),
                  
                  // Enhanced pre/code block styling
                  pre: ({ children }) => (
                    <div className="relative my-4">
                      <div className="absolute top-2 right-2 z-10">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-red-400 rounded-full" />
                          <div className="w-2 h-2 bg-yellow-400 rounded-full" />
                          <div className="w-2 h-2 bg-green-400 rounded-full" />
                        </div>
                      </div>
                      <pre className="bg-gradient-to-br from-slate-900 to-slate-800 text-slate-100 p-4 pt-8 rounded-lg overflow-x-auto text-xs font-mono border border-slate-700 shadow-lg">
                        {children}
                      </pre>
                    </div>
                  ),
                  
                  // Enhanced blockquote styling
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-gradient-to-b border-blue-400 dark:border-blue-500 pl-4 py-3 my-4 italic text-blue-800 dark:text-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-r-lg shadow-sm">
                      {children}
                    </blockquote>
                  ),
                  
                  // Enhanced heading styling
                  h1: ({ children }) => (
                    <h1 className="text-lg font-bold mb-3 text-blue-900 dark:text-blue-100 border-b border-blue-200 dark:border-blue-800 pb-2">
                      {children}
                    </h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-base font-semibold mb-3 text-blue-800 dark:text-blue-200 flex items-center gap-2">
                      <div className="w-1 h-4 bg-gradient-to-b from-blue-500 to-indigo-500 rounded-full" />
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-sm font-medium mb-2 text-blue-700 dark:text-blue-300 flex items-center gap-2">
                      <div className="w-0.5 h-3 bg-blue-400 rounded-full" />
                      {children}
                    </h3>
                  ),
                }}
              >
                {displayMessage}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Enhanced regular message styling
  if (aiQuestion) {
    return (
      <div className={`${className} ai-question-content`}>
        <div className="relative bg-gradient-to-br from-orange-50/60 via-amber-50/40 to-yellow-50/60 dark:from-orange-950/40 dark:via-amber-950/30 dark:to-yellow-950/40 rounded-lg p-4 border border-orange-200/40 dark:border-orange-800/40 shadow-sm">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-amber-500/5 to-yellow-500/5 rounded-lg" />
          <div className="relative">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <div className="w-6 h-6 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full flex items-center justify-center">
                  <Icon name="HelpCircle" size={12} className="text-white" />
                </div>
              </div>
              <div className="flex-1">
                <p className="text-sm leading-relaxed text-foreground/90">
                  {displayMessage}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Regular user messages
  return (
    <div className={className}>
      <p className="text-sm leading-relaxed text-foreground/90">
        {displayMessage}
      </p>
    </div>
  );
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

  return (
    <div className="group relative">
      {/* Main Message Thread */}
      <div className="flex gap-4 p-4 rounded-lg">
        {/* User Avatar */}
        <div className="flex-shrink-0">
          <HoverCard>
            <HoverCardTrigger asChild>
              <Avatar className="w-10 h-10 cursor-pointer ring-2 ring-transparent hover:ring-primary/20 transition-all">
                <AvatarFallback className={`text-sm font-semibold ${
                  aiMessage 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white' 
                    : aiQuestion 
                      ? 'bg-gradient-to-r from-orange-400 to-pink-500 text-white'
                      : 'bg-gradient-to-r from-green-400 to-blue-500 text-white'
                }`}>
                  {aiMessage ? (
                    <Icon name="Bot" size={16} />
                  ) : (
                    message.actorDisplayName?.charAt(0)?.toUpperCase() || 'U'
                  )}
                </AvatarFallback>
              </Avatar>
            </HoverCardTrigger>
            <HoverCardContent className="w-80" side="top">
              <div className="flex justify-between space-x-4">
                <Avatar className="w-12 h-12">
                  <AvatarFallback className={`${
                    aiMessage 
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white' 
                      : 'bg-gradient-to-r from-green-400 to-blue-500 text-white'
                  }`}>
                    {aiMessage ? (
                      <Icon name="Bot" size={20} />
                    ) : (
                      message.actorDisplayName?.charAt(0)?.toUpperCase() || 'U'
                    )}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-1 flex-1">
                  <h4 className="text-sm font-semibold">{message.actorDisplayName}</h4>
                  <p className="text-xs text-muted-foreground">
                    {aiMessage 
                      ? t('user_types.ai_assistant', { defaultValue: 'AI Assistant - Here to help!' })
                      : t('user_types.user', { defaultValue: 'Team Member' })
                    }
                  </p>
                  <div className="flex items-center pt-2">
                    <Icon name="Clock" size={12} className="mr-1 rtl:ml-1 rtl:mr-0 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{message.timeAgo}</span>
                  </div>
                </div>
              </div>
            </HoverCardContent>
          </HoverCard>
        </div>

        {/* Message Content */}
        <div className="flex-1 min-w-0">
          {/* Message Header */}
          <div className="flex items-center gap-3 mb-2">
            <span className="font-semibold text-foreground hover:underline cursor-pointer">
              {message.actorDisplayName}
            </span>
            
            {/* Message Type Badge */}
            {aiQuestion ? (
              <Badge variant="outline" className="bg-gradient-to-r from-orange-500/10 to-pink-500/10 text-orange-700 border-orange-500/20 dark:bg-gradient-to-r dark:from-orange-500/20 dark:to-pink-500/20 dark:text-orange-400 dark:border-orange-500/30 hover:bg-gradient-to-r hover:from-orange-500/10 hover:to-pink-500/10">
                <Icon name="MessageCircleQuestion" size={10} className="mr-1 rtl:ml-1 rtl:mr-0" />
                {t('message_types.ai_question', { defaultValue: 'AI Question' })}
              </Badge>
            ) : aiMessage ? (
              <Badge variant="outline" className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-blue-700 border-blue-500/20 dark:bg-gradient-to-r dark:from-blue-500/20 dark:to-purple-500/20 dark:text-blue-400 dark:border-blue-500/30 hover:bg-gradient-to-r hover:from-blue-500/10 hover:to-purple-500/10">
                <Icon name="Sparkles" size={10} className="mr-1 rtl:ml-1 rtl:mr-0" />
                {t('message_types.ai_response', { defaultValue: 'AI Response' })}
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-secondary text-secondary-foreground hover:bg-secondary">
                <Icon name="User" size={10} className="mr-1 rtl:ml-1 rtl:mr-0" />
                {t('message_types.message', { defaultValue: 'Message' })}
              </Badge>
            )}

            <span className="text-xs text-muted-foreground">
              {message.timeAgo}
            </span>

            {/* Reply Count */}
            <div className="ml-auto flex items-center gap-1">
              {message.hasAnswers ? (
                <Badge variant="outline" className="bg-green-500/5 text-green-700 border-green-500/20 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/30 hover:bg-green-500/5 dark:hover:bg-green-500/10">
                  <Icon name="MessageSquare" size={10} className="mr-1 rtl:ml-1 rtl:mr-0" />
                  {t('messages.replies_count', { count: message.answersCount, defaultValue: '{{count}}' })}
                </Badge>
              ) : (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 px-2 text-xs hover:bg-muted/50 transition-colors"
                  onClick={() => setShowReplyForm(true)}
                >
                  <Icon name="Reply" size={12} className="mr-1 rtl:ml-1 rtl:mr-0" />
                  {t('messages.reply.button', { defaultValue: 'Reply' })}
                </Button>
              )}
            </div>
          </div>

          {/* Message Content */}
          <div className="prose prose-sm max-w-none dark:prose-invert">
            {renderMessageContent(message)}
          </div>
        </div>
      </div>

      {/* Thread Replies */}
      {message.answers?.length > 0 && (
        <div className="relative">
          {/* Threading Line */}
          <div className="absolute left-[34px] top-0 bottom-0 w-px bg-gradient-to-b from-primary/30 via-primary/20 to-transparent" />
          
          <div className="ml-14 space-y-3">
            {message.answers.map((reply, index) => {
              const isReplyAI = isAIMessage(reply);
              const isReplyAIQuestion = isAIQuestion(reply);
              
              return (
                <div key={reply.id} className="group/reply relative">
                  {/* Reply Thread */}
                  <div className="flex gap-3 p-3 rounded-lg">
                    {/* Reply Avatar */}
                    <div className="flex-shrink-0">
                      <Avatar className="w-8 h-8 ring-1 ring-border hover:ring-primary/30 transition-all">
                        <AvatarFallback className={`text-xs font-medium ${
                          isReplyAI 
                            ? 'bg-gradient-to-r from-blue-400 to-purple-500 text-white' 
                            : isReplyAIQuestion
                              ? 'bg-gradient-to-r from-orange-400 to-pink-500 text-white'
                              : 'bg-gradient-to-r from-slate-400 to-slate-500 text-white'
                        }`}>
                          {isReplyAI ? (
                            <Icon name="Bot" size={12} />
                          ) : (
                            reply.actorDisplayName?.charAt(0)?.toUpperCase() || 'U'
                          )}
                        </AvatarFallback>
                      </Avatar>
                    </div>

                    {/* Reply Content */}
                    <div className="flex-1 min-w-0">
                      {/* Reply Header */}
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-foreground">
                          {reply.actorDisplayName}
                        </span>
                        
                        {/* Reply Type Badge */}
                        {isReplyAIQuestion ? (
                          <Badge variant="outline" className="text-xs h-4 px-1.5 bg-gradient-to-r from-orange-500/10 to-pink-500/10 text-orange-700 border-orange-500/20 dark:from-orange-500/20 dark:to-pink-500/20 dark:text-orange-400 hover:bg-gradient-to-r hover:from-orange-500/10 hover:to-pink-500/10">
                            <Icon name="MessageCircleQuestion" size={8} className="mr-1 rtl:ml-1 rtl:mr-0" />
                            {t('message_types.ai_question', { defaultValue: 'Question' })}
                          </Badge>
                        ) : isReplyAI ? (
                          <Badge variant="outline" className="text-xs h-4 px-1.5 bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-blue-700 border-blue-500/20 dark:from-blue-500/20 dark:to-purple-500/20 dark:text-blue-400 hover:bg-gradient-to-r hover:from-blue-500/10 hover:to-purple-500/10">
                            <Icon name="Sparkles" size={8} className="mr-1 rtl:ml-1 rtl:mr-0" />
                            {t('message_types.ai_response', { defaultValue: 'AI' })}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs h-4 px-1.5 bg-muted/20 hover:bg-muted/20">
                            <Icon name="Reply" size={8} className="mr-1 rtl:ml-1 rtl:mr-0" />
                            {t('message_types.reply', { defaultValue: 'Reply' })}
                          </Badge>
                        )}

                        <span className="text-xs text-muted-foreground">
                          {reply.timeAgo}
                        </span>
                      </div>

                      {/* Reply Content */}
                      <div className="prose prose-sm max-w-none dark:prose-invert">
                        {renderMessageContent(reply)}
                      </div>
                    </div>
                  </div>

                  {/* Connection Line to Next Reply */}
                  {index < message.answers.length - 1 && (
                    <div className="absolute left-4 top-full w-px h-3 bg-gradient-to-b from-primary/20 to-primary/10" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Reply Section */}
      <div className="ml-14 mt-2">
        {roomPermissions?.canWrite ? (
          !showReplyForm ? (
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                className="h-8 px-3 text-xs hover:bg-muted/50 transition-colors"
                onClick={() => setShowReplyForm(true)}
              >
                <Icon name="MessageCircle" size={14} className="mr-1.5 rtl:ml-1.5 rtl:mr-0" />
                {t('messages.reply.button', { defaultValue: 'Reply' })}
              </Button>
            </div>
          ) : (
            <div className="relative">
              {/* Reply Form */}
              <div className="bg-muted/20 border border-border/50 rounded-lg p-4 mt-2">
                <form onSubmit={handleSubmitReply} className="space-y-3">
                  {/* AI Auto-Reply Indicator */}
                  {isAIConversationContext && (
                    <div className="flex items-start gap-3 p-3 bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-lg border border-blue-200/50 dark:border-blue-800/30">
                      <div className="flex-shrink-0">
                        <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <Icon name="Sparkles" size={12} className="text-white" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                          {t('messages.reply.ai_auto_reply_title', { defaultValue: '🤖 AI Assistant Active' })}
                        </p>
                        <p className="text-xs text-blue-700 dark:text-blue-300">
                          {t('messages.reply.ai_auto_reply', { defaultValue: 'AI will automatically respond to your reply' })}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex gap-3">
                    {/* User Avatar */}
                    <Avatar className="w-8 h-8 ring-1 ring-border flex-shrink-0 mt-1">
                      <AvatarFallback className="bg-gradient-to-r from-green-400 to-blue-500 text-white text-xs font-medium">
                        U
                      </AvatarFallback>
                    </Avatar>
                    
                    {/* Reply Input */}
                    <div className="flex-1">
                      <Textarea
                        value={replyInput}
                        onChange={(e) => handleReplyInputChange(e.target.value)}
                        placeholder={
                          isAIConversationContext 
                            ? t('messages.reply.ai_placeholder', { defaultValue: 'Reply to AI (AI will respond automatically)...' })
                            : t('messages.reply.placeholder', { defaultValue: 'Type your reply here...' })
                        }
                        className={`min-h-[80px] resize-none focus:ring-2 focus:ring-primary/20 transition-all ${
                          isAIConversationContext ? 'border-blue-200 dark:border-blue-800 bg-blue-50/30 dark:bg-blue-950/10' : ''
                        }`}
                        disabled={isSendingAnswer}
                        autoFocus
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="text-xs text-muted-foreground">
                      {isAIConversationContext && (
                        <div className="flex items-center gap-1">
                          <Icon name="Info" size={12} />
                          <span>{t('messages.reply.ai_context_hint', { defaultValue: 'Continuing AI conversation' })}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        type="button"
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setShowReplyForm(false);
                          handleReplyInputChange('');
                        }}
                        disabled={isSendingAnswer}
                      >
                        {t('messages.reply.cancel', { defaultValue: 'Cancel' })}
                      </Button>
                      <Button 
                        type="submit" 
                        size="sm"
                        disabled={!replyInput.trim() || isSendingAnswer}
                        className={`min-w-[100px] ${
                          isAIConversationContext ? 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700' : ''
                        }`}
                      >
                        {isSendingAnswer ? (
                          <Icon name="Loader2" size={14} className="animate-spin mr-1.5 rtl:ml-1.5 rtl:mr-0" />
                        ) : (
                          <Icon name="Send" size={14} className="mr-1.5 rtl:ml-1.5 rtl:mr-0" />
                        )}
                        {isSendingAnswer 
                          ? t('messages.reply.sending', { defaultValue: 'Sending...' })
                          : isAIConversationContext 
                            ? t('messages.reply.send_to_ai', { defaultValue: 'Ask AI' })
                            : t('messages.reply.send', { defaultValue: 'Send Reply' })
                        }
                      </Button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          )
        ) : (
          <div className="ml-3 mt-2 p-3 bg-muted/10 rounded-lg border border-dashed border-muted-foreground/20">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Icon name="Lock" size={14} />
              <span className="text-sm">
                {t('permissions.cannot_reply', { defaultValue: 'Cannot reply' })} - {roomPermissions?.reason?.toLowerCase() || t('permissions.no_write_permission', { defaultValue: 'no write permission' })}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageCard;
