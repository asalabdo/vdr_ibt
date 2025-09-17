import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/AppIcon';

/**
 * Message Form Component - Handles message posting with AI toggle
 */
const MessageForm = ({
  newQuestion,
  setNewQuestion,
  isAiEnabled,
  setIsAiEnabled,
  onSendQuestion,
  isPending,
  roomPermissions,
  t
}) => {
  return (
    <div className="p-4">
      {roomPermissions?.canWrite ? (
        <div className="w-full">
          <form onSubmit={onSendQuestion} className="space-y-4">
            {/* AI Mode Toggle Banner */}
            {isAiEnabled && (
              <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50/60 via-indigo-50/40 to-purple-50/60 dark:from-blue-950/40 dark:via-indigo-950/30 dark:to-purple-950/40 rounded-lg border border-blue-200/40 dark:border-blue-800/40">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <Icon name="Sparkles" size={14} className="text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-blue-700 border-blue-500/20 dark:from-blue-500/20 dark:to-purple-500/20 dark:text-blue-400 dark:border-blue-500/30 hover:bg-gradient-to-r hover:from-blue-500/10 hover:to-purple-500/10">
                      <Icon name="Bot" size={8} className="mr-1" />
                      {t('messages.ai_assistant.mode_active', { defaultValue: 'AI Assistant Mode' })}
                    </Badge>
                    <span className="text-sm text-blue-700 dark:text-blue-300 font-medium">
                      {t('messages.ai_assistant.will_respond', { defaultValue: 'AI will respond automatically' })}
                    </span>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsAiEnabled(false)}
                  className="h-8 px-2 text-blue-600 hover:text-blue-700 hover:bg-blue-100/50 dark:text-blue-300 dark:hover:text-blue-200 dark:hover:bg-blue-800/30 transition-colors"
                  disabled={isPending}
                >
                  <Icon name="X" size={14} />
                </Button>
              </div>
            )}

            {/* Facebook-style Compose Box - Full Width */}
            <Card className="transition-colors shadow-sm">
              <div className="p-6">
                <div className="flex gap-4 w-full">
                  {/* User Avatar */}
                  <div className="flex-shrink-0">
                    <Avatar className="w-12 h-12 ring-1 ring-border">
                      <AvatarFallback className="bg-gradient-to-r from-green-400 to-blue-500 text-white text-sm font-semibold">
                        U
                      </AvatarFallback>
                    </Avatar>
                  </div>

                  {/* Input Area - Takes full width */}
                  <div className="flex-1 w-full">
                    <Textarea
                      value={newQuestion}
                      onChange={(e) => setNewQuestion(e.target.value)}
                      onKeyDown={(e) => {
                        // Submit on Ctrl/Cmd + Enter
                        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                          e.preventDefault();
                          if (newQuestion.trim() && !isPending) {
                            onSendQuestion(e);
                          }
                        }
                      }}
                      placeholder={
                        isAiEnabled 
                          ? t('messages.post_message.ai_placeholder', { 
                              defaultValue: 'Ask AI anything... What would you like to know?' 
                            })
                          : t('messages.post_message.placeholder', { 
                              defaultValue: 'What\'s on your mind?' 
                            })
                      }
                      className={`min-h-[100px] resize-none text-base leading-relaxed ${
                        isAiEnabled 
                          ? 'border-blue-200 bg-blue-50/50 focus-visible:ring-blue-200 dark:border-blue-800 dark:bg-blue-950/30 dark:focus-visible:ring-blue-800' 
                          : ''
                      }`}
                      disabled={isPending}
                      rows={4}
                    />

                    {/* Actions Row */}
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/30">
                      {/* Left Actions */}
                      <div className="flex items-center gap-4">
                        {/* AI Toggle Switch */}
                        <div className="flex items-center space-x-3">
                          <Switch
                            id="ai-mode"
                            checked={isAiEnabled}
                            onCheckedChange={setIsAiEnabled}
                            disabled={isPending}
                            className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-blue-500 data-[state=checked]:to-purple-600"
                          />
                          <Label 
                            htmlFor="ai-mode" 
                            className={`text-sm font-medium cursor-pointer transition-colors select-none ${
                              isAiEnabled 
                                ? 'text-blue-700 dark:text-blue-300' 
                                : 'text-muted-foreground hover:text-foreground'
                            }`}
                          >
                            <div className="flex items-center gap-1.5">
                              <Icon 
                                name={isAiEnabled ? "Sparkles" : "Bot"} 
                                size={14} 
                                className={isAiEnabled ? "text-blue-600 dark:text-blue-400" : "text-muted-foreground"} 
                              />
                              {isAiEnabled 
                                ? t('messages.ai_assistant.mode_active_short', { defaultValue: 'AI Mode' })
                                : t('messages.ai_assistant.ask_ai', { defaultValue: 'Ask AI' })
                              }
                            </div>
                          </Label>
                        </div>

                        {newQuestion.trim() && (
                          <div className="text-xs text-muted-foreground ml-auto">
                            {newQuestion.trim().length} characters
                          </div>
                        )}
                      </div>

                      {/* Send Button */}
                      <Button 
                        type="submit" 
                        disabled={!newQuestion.trim() || isPending}
                        size="sm"
                        className={`h-8 px-4 font-medium transition-all ${
                          isAiEnabled 
                            ? 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 shadow-md dark:from-blue-400 dark:to-purple-500 dark:hover:from-blue-500 dark:hover:to-purple-600' 
                            : 'shadow-sm'
                        }`}
                      >
                        {isPending ? (
                          <Icon name="Loader2" size={14} className="animate-spin mr-1.5" />
                        ) : (
                          <Icon name={isAiEnabled ? "Sparkles" : "Send"} size={14} className="mr-1.5" />
                        )}
                        {isPending
                          ? t('messages.post_message.sending', { defaultValue: 'Sending...' })
                          : isAiEnabled 
                            ? t('messages.post_message.ask_ai', { defaultValue: 'Ask AI' })
                            : t('messages.post_message.send', { defaultValue: 'Post' })
                        }
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </form>
        </div>
      ) : (
        <div className="w-full">
          <Card className="border-dashed border-2 border-muted-foreground/20">
            <div className="text-center py-8 px-6">
              <div className="w-16 h-16 bg-muted/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="Lock" size={24} className="text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                {t('permissions.cannot_post.title', { defaultValue: 'Cannot Post Messages' })}
              </h3>
              <p className="text-muted-foreground mb-2">
                {roomPermissions?.reason || t('permissions.cannot_post.description', { 
                  defaultValue: 'You do not have permission to post messages in this room.' 
                })}
              </p>
              <p className="text-sm text-muted-foreground">
                {t('permissions.cannot_post.note', { 
                  defaultValue: 'You can still view and read all messages in this room.' 
                })}
              </p>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default MessageForm;
