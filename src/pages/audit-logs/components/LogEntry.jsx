import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Icon from '../../../components/AppIcon';

const LogEntry = ({ log }) => {
  const { t } = useTranslation('audit-logs');
  const [isExpanded, setIsExpanded] = useState(false);

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diff = Math.floor((now - date) / 1000);

    if (diff < 60) return t('time.just_now');
    if (diff < 3600) return t('time.minutes_ago', { count: Math.floor(diff / 60) });
    if (diff < 86400) return t('time.hours_ago', { count: Math.floor(diff / 3600) });
    return t('time.days_ago', { count: Math.floor(diff / 86400) });
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'info': return 'text-blue-600 bg-blue-100';
      case 'warning': return 'text-warning bg-warning/10';
      case 'error': return 'text-destructive bg-destructive/10';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'info': return 'Info';
      case 'warning': return 'AlertTriangle';
      case 'error': return 'AlertCircle';
      default: return 'Circle';
    }
  };

  const getActionIcon = (action) => {
    switch (action) {
      case 'document_download': return 'Download';
      case 'document_upload': return 'Upload';
      case 'user_login': return 'LogIn';
      case 'failed_login': return 'ShieldAlert';
      case 'permission_change': return 'Shield';
      case 'qa_response': return 'MessageSquare';
      default: return 'Activity';
    }
  };

  return (
    <div className="bg-card rounded-xl shadow-sm border border-border p-6 hover:shadow-md transition-shadow">
      {/* Main Log Entry */}
      <div className="flex items-start space-x-4 rtl:space-x-reverse">
        {/* Severity Indicator */}
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getSeverityColor(log?.severity)}`}>
          <Icon name={getSeverityIcon(log?.severity)} size={20} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <Icon name={getActionIcon(log?.action)} size={16} className="text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">
                {t(`actions_types.${log?.action}`)}
              </span>
              <span className="text-xs px-2 py-1 bg-muted/50 rounded-full text-muted-foreground">
                {t(`resource_types.${log?.resourceType}`)}
              </span>
            </div>
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {formatTimeAgo(log?.timestamp)}
            </span>
          </div>

          <p className="text-foreground mb-2">{log?.description}</p>

          <div className="flex items-center space-x-4 rtl:space-x-reverse text-xs text-muted-foreground">
            <div className="flex items-center space-x-1 rtl:space-x-reverse">
              <Icon name="User" size={12} />
              <span>{log?.user?.name}</span>
            </div>
            <div className="flex items-center space-x-1 rtl:space-x-reverse">
              <Icon name="MapPin" size={12} />
              <span>{log?.location}</span>
            </div>
            <div className="flex items-center space-x-1 rtl:space-x-reverse">
              <Icon name="Globe" size={12} />
              <span>{log?.ipAddress}</span>
            </div>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center space-x-1 rtl:space-x-reverse hover:text-foreground transition-colors"
            >
              <Icon name={isExpanded ? 'ChevronUp' : 'ChevronDown'} size={12} />
              <span>{isExpanded ? t('actions.less') : t('actions.more')}</span>
            </button>
          </div>
        </div>
      </div>
      {/* Expanded Details */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-border">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium text-foreground mb-2">{t('log_entry.user_details')}</h4>
              <div className="space-y-1 text-muted-foreground">
                <div>{t('log_entry.labels.email')}: {log?.user?.email}</div>
                <div>{t('log_entry.labels.ip_address')}: {log?.ipAddress}</div>
                <div>{t('log_entry.labels.location')}: {log?.location}</div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-foreground mb-2">{t('log_entry.additional_information')}</h4>
              <div className="space-y-1 text-muted-foreground">
                {Object.entries(log?.additionalData || {})?.map(([key, value]) => (
                  <div key={key}>
                    {key?.replace(/([A-Z])/g, ' $1')?.replace(/^./, str => str?.toUpperCase())}: {value}
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="mt-3 p-3 bg-muted/30 rounded-lg">
            <div className="text-xs text-muted-foreground">
              <strong>{t('log_entry.user_agent')}:</strong> {log?.userAgent}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LogEntry;