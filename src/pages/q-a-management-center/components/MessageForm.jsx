import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
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
    <Card className="p-4">
      {roomPermissions?.canWrite ? (
        <form onSubmit={onSendQuestion} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              {t('messages.post_message.label', { defaultValue: 'Post a Message' })}
            </label>
            <Textarea
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              placeholder={
                isAiEnabled 
                  ? t('messages.post_message.ai_placeholder', { 
                      defaultValue: 'Ask AI anything... (AI will automatically respond to your question)' 
                    })
                  : t('messages.post_message.placeholder', { 
                      defaultValue: 'Type your message here...' 
                    })
              }
              className={`min-h-[80px] transition-colors ${isAiEnabled ? 'border-primary/50 bg-primary/5' : ''}`}
              disabled={isPending}
            />
          </div>

          {/* AI Assistant Toggle */}
          <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border">
            <div className="flex items-center space-x-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                isAiEnabled ? 'bg-primary/20 text-primary' : 'bg-muted'
              }`}>
                <Icon 
                  name="Bot" 
                  size={16} 
                  className={isAiEnabled ? 'text-primary' : 'text-muted-foreground'} 
                />
              </div>
              <div>
                <Label htmlFor="ai-toggle" className="text-sm font-medium cursor-pointer">
                  {t('messages.ai_assistant.label', { defaultValue: 'Ask AI Assistant' })}
                </Label>
                <p className="text-xs text-muted-foreground">
                  {isAiEnabled 
                    ? t('messages.ai_assistant.enabled_hint', { 
                        defaultValue: 'AI will respond to your message automatically' 
                      })
                    : t('messages.ai_assistant.disabled_hint', { 
                        defaultValue: 'Toggle to get AI assistance with your question' 
                      })
                  }
                </p>
              </div>
            </div>
            <Switch
              id="ai-toggle"
              checked={isAiEnabled}
              onCheckedChange={setIsAiEnabled}
              disabled={isPending}
            />
          </div>

          <div className="flex justify-between items-center">
            {isAiEnabled && (
              <div className="flex items-center space-x-2 text-xs text-primary">
                <Icon name="Sparkles" size={12} />
                <span>
                  {t('messages.ai_assistant.will_respond', { 
                    defaultValue: 'AI will respond automatically' 
                  })}
                </span>
              </div>
            )}
            <div className="flex-1"></div>
            <Button 
              type="submit" 
              disabled={!newQuestion.trim() || isPending}
              className={isAiEnabled ? 'bg-primary hover:bg-primary/90' : ''}
            >
              <Icon name={isAiEnabled ? "Sparkles" : "Send"} size={16} className="mr-2" />
              {isAiEnabled 
                ? t('messages.post_message.ask_ai', { defaultValue: 'Ask AI' })
                : t('messages.post_message.send', { defaultValue: 'Send Message' })
              }
            </Button>
          </div>
        </form>
      ) : (
        <div className="text-center py-6">
          <Icon name="Lock" size={48} className="text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">
            {t('permissions.cannot_post.title', { defaultValue: 'Cannot Post Messages' })}
          </h3>
          <p className="text-muted-foreground">
            {roomPermissions?.reason || t('permissions.cannot_post.description', { 
              defaultValue: 'You do not have permission to post messages in this room.' 
            })}
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            {t('permissions.cannot_post.note', { 
              defaultValue: 'You can still view and read all messages in this room.' 
            })}
          </p>
        </div>
      )}
    </Card>
  );
};

export default MessageForm;
