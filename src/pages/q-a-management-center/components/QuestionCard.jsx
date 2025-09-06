import React from 'react';
import { useTranslation } from 'react-i18next';
import Icon from '../../../components/AppIcon';

const QuestionCard = ({ question, onSelect, isSelected, formatTimeAgo }) => {
  const { t } = useTranslation('q-a-management-center');
  const getPriorityColor = (priority) => {
    switch (priority) {
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

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return { icon: 'Clock', color: 'text-warning' };
      case 'answered':
        return { icon: 'MessageSquare', color: 'text-blue-600' };
      case 'approved':
        return { icon: 'CheckCircle', color: 'text-success' };
      default:
        return { icon: 'HelpCircle', color: 'text-muted-foreground' };
    }
  };

  const statusConfig = getStatusIcon(question?.status);

  return (
    <div
      className={`bg-card rounded-xl shadow-sm border p-6 cursor-pointer transition-all duration-200 hover:shadow-md ${
        isSelected 
          ? 'border-primary shadow-md ring-1 ring-primary/20' 
          : 'border-border hover:border-primary/30'
      }`}
      onClick={() => onSelect(question)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
            <Icon name="MessageSquare" size={20} className="text-primary" />
          </div>
          <div>
            <div className="flex items-center space-x-2 rtl:space-x-reverse mb-1">
              <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(question?.priority)}`}>
                {t(`priority_levels.${question?.priority}`)}
              </span>
              <span className="text-sm text-muted-foreground">
                {t('question_card.in_room', { room: question?.room })}
              </span>
            </div>
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <Icon name={statusConfig?.icon} size={16} className={statusConfig?.color} />
              <span className={`text-sm font-medium capitalize ${statusConfig?.color}`}>
                {t(`status_labels.${question?.status}`)}
              </span>
            </div>
          </div>
        </div>
        
        <div className="text-sm text-muted-foreground">
          {formatTimeAgo(question?.updatedAt)}
        </div>
      </div>
      {/* Question Content */}
      <div className="space-y-4">
        <div>
          <div className="flex items-center space-x-2 rtl:space-x-reverse mb-2">
            <Icon name="User" size={14} className="text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">
              {t('question_card.question_by', { askedBy: question?.askedBy })}
            </span>
          </div>
          <div className="bg-muted/30 p-3 rounded-lg">
            <p className="text-foreground line-clamp-3">{question?.question}</p>
          </div>
        </div>

        {/* Response Preview */}
        {question?.responses?.length > 0 && (
          <div>
            <div className="flex items-center space-x-2 rtl:space-x-reverse mb-2">
              <Icon name="MessageCircle" size={14} className="text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">
                {t('question_card.response_by', { respondedBy: question?.responses?.[0]?.respondedBy })}
              </span>
            </div>
            <div className="bg-primary/5 p-3 rounded-lg border border-primary/20">
              <p className="text-foreground text-sm line-clamp-2">
                {question?.responses?.[0]?.answer}
              </p>
            </div>
          </div>
        )}

        {/* Metadata */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-4 border-t border-border">
          <div className="flex items-center space-x-4 rtl:space-x-reverse">
            <div className="flex items-center space-x-1 rtl:space-x-reverse">
              <Icon name="MessageSquare" size={12} />
              <span>
                {question?.responses?.length === 1 
                  ? t('question_card.response_count', { count: question?.responses?.length })
                  : t('question_card.responses_count', { count: question?.responses?.length })
                }
              </span>
            </div>
            {question?.attachments?.length > 0 && (
              <div className="flex items-center space-x-1 rtl:space-x-reverse">
                <Icon name="Paperclip" size={12} />
                <span>
                  {question?.attachments?.length === 1 
                    ? t('question_card.attachment_count', { count: question?.attachments?.length })
                    : t('question_card.attachments_count', { count: question?.attachments?.length })
                  }
                </span>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-1 rtl:space-x-reverse">
            <Icon name="Calendar" size={12} />
            <span>{t('question_card.asked_time', { timeAgo: formatTimeAgo(question?.createdAt) })}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionCard;