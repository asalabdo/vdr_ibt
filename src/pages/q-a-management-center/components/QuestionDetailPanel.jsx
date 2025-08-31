import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';


const QuestionDetailPanel = ({ question, onClose }) => {
  const [response, setResponse] = useState('');
  const [priority, setPriority] = useState(question?.priority || 'medium');

  if (!question) {
    return (
      <div className="bg-card rounded-xl border border-border p-6 h-fit">
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon name="MessageSquare" size={32} className="text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">Select a Question</h3>
          <p className="text-muted-foreground">
            Choose a question from the list to view details and respond
          </p>
        </div>
      </div>
    );
  }

  const getPriorityColor = (priorityLevel) => {
    switch (priorityLevel) {
      case 'high':
        return 'bg-error/20 text-error border-error/30';
      case 'medium':
        return 'bg-warning/20 text-warning border-warning/30';
      case 'low':
        return 'bg-success/20 text-success border-success/30';
      default:
        return 'bg-muted text-muted-foreground border-muted';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return { bg: 'bg-warning/20', text: 'text-warning', icon: 'Clock' };
      case 'answered':
        return { bg: 'bg-blue-100', text: 'text-blue-600', icon: 'MessageSquare' };
      case 'approved':
        return { bg: 'bg-success/20', text: 'text-success', icon: 'CheckCircle' };
      default:
        return { bg: 'bg-muted', text: 'text-muted-foreground', icon: 'HelpCircle' };
    }
  };

  const statusConfig = getStatusColor(question?.status);
  const formatDateTime = (dateString) => {
    return new Date(dateString)?.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-card rounded-xl border border-border h-fit sticky top-8">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h3 className="text-lg font-semibold text-foreground">Question Details</h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
        >
          <Icon name="X" size={20} />
        </Button>
      </div>
      <div className="p-4 space-y-6">
        {/* Question Info */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(question?.priority)}`}>
                {question?.priority?.toUpperCase()}
              </span>
              <span className="text-sm text-muted-foreground">#{question?.id}</span>
            </div>
            
            <div className={`flex items-center space-x-2 px-2 py-1 rounded-full ${statusConfig?.bg}`}>
              <Icon name={statusConfig?.icon} size={14} className={statusConfig?.text} />
              <span className={`text-xs font-medium capitalize ${statusConfig?.text}`}>
                {question?.status}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Icon name="User" size={14} />
              <span>Asked by {question?.askedBy}</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Icon name="FolderOpen" size={14} />
              <span>in {question?.room}</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Icon name="Calendar" size={14} />
              <span>{formatDateTime(question?.createdAt)}</span>
            </div>
          </div>
        </div>

        {/* Question */}
        <div>
          <h4 className="text-sm font-medium text-foreground mb-2">Question</h4>
          <div className="bg-muted/30 p-3 rounded-lg">
            <p className="text-foreground">{question?.question}</p>
          </div>
        </div>

        {/* Existing Responses */}
        {question?.responses?.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-foreground mb-3">
              Responses ({question?.responses?.length})
            </h4>
            <div className="space-y-3">
              {question?.responses?.map((resp, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-sm">
                      <Icon name="MessageCircle" size={14} className="text-muted-foreground" />
                      <span className="font-medium text-foreground">{resp?.respondedBy}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {resp?.status === 'approved' && (
                        <div className="flex items-center space-x-1 text-success">
                          <Icon name="CheckCircle" size={14} />
                          <span className="text-xs">Approved</span>
                        </div>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {formatDateTime(resp?.respondedAt)}
                      </span>
                    </div>
                  </div>
                  <div className="bg-primary/5 p-3 rounded-lg border border-primary/20">
                    <p className="text-foreground text-sm">{resp?.answer}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Response Form */}
        {question?.status === 'pending' && (
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-foreground">Add Response</h4>
            
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Priority Level
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e?.target?.value)}
                className="w-full border border-input rounded-lg px-3 py-2 bg-background text-foreground focus:ring-2 focus:ring-ring focus:border-transparent"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Your Response
              </label>
              <textarea
                value={response}
                onChange={(e) => setResponse(e?.target?.value || '')}
                placeholder="Type your response here..."
                rows={4}
                className="w-full border border-input rounded-lg px-3 py-2 bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:border-transparent resize-none"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Button variant="default" size="sm" className="flex-1">
                <Icon name="Send" size={14} className="mr-1" />
                Send Response
              </Button>
              <Button variant="outline" size="sm">
                <Icon name="Paperclip" size={14} />
              </Button>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-2 pt-4 border-t border-border">
          <Button variant="outline" size="sm" className="w-full">
            <Icon name="Eye" size={14} className="mr-2" />
            View in Room
          </Button>
          <Button variant="outline" size="sm" className="w-full">
            <Icon name="UserPlus" size={14} className="mr-2" />
            Assign to Expert
          </Button>
          {question?.status === 'answered' && (
            <Button variant="success" size="sm" className="w-full">
              <Icon name="CheckCircle" size={14} className="mr-2" />
              Approve Response
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuestionDetailPanel;