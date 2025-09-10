import React from 'react';
import { useTranslation } from 'react-i18next';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/AppIcon';

const LogCard = ({ log, onClick }) => {
  const { t, i18n } = useTranslation('audit-logs');
  
  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'bg-destructive/10 border-destructive/20 text-destructive';
      case 'high': return 'bg-warning/10 border-warning/20 text-warning';
      case 'medium': return 'bg-warning/5 border-warning/10 text-warning';
      case 'low': return 'bg-primary/10 border-primary/20 text-primary';
      default: return 'bg-muted border-border text-muted-foreground';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'critical': return <Icon name="AlertTriangle" size={16} className="text-destructive" />;
      case 'high': return <Icon name="Shield" size={16} className="text-warning" />;
      case 'medium': return <Icon name="Info" size={16} className="text-warning" />;
      case 'low': return <Icon name="Activity" size={16} className="text-primary" />;
      default: return <Icon name="Info" size={16} className="text-muted-foreground" />;
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'security': return <Icon name="Shield" size={16} className="text-muted-foreground" />;
      case 'files': return <Icon name="FileText" size={16} className="text-muted-foreground" />;
      case 'users': return <Icon name="Users" size={16} className="text-muted-foreground" />;
      case 'data_rooms': return <Icon name="Folder" size={16} className="text-muted-foreground" />;
      case 'system': return <Icon name="Settings" size={16} className="text-muted-foreground" />;
      case 'apps': return <Icon name="Activity" size={16} className="text-muted-foreground" />;
      default: return <Icon name="Info" size={16} className="text-muted-foreground" />;
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'security': return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'files': return 'bg-primary/10 text-primary border-primary/20';
      case 'users': return 'bg-success/10 text-success border-success/20';
      case 'data_rooms': return 'bg-primary/10 text-primary border-primary/20';
      case 'system': return 'bg-muted text-muted-foreground border-border';
      case 'apps': return 'bg-primary/10 text-primary border-primary/20';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  const formatMessage = (message, subject) => {
    // Use subject if message is empty or same as subject
    if (!message || message === subject) {
      return subject;
    }
    
    // If message is different from subject, show both
    return message.length > subject.length ? message : subject;
  };

  return (
    <Card 
      className={`transition-all duration-200 hover:shadow-md hover:border-gray-300 cursor-pointer ${
        log.isSecurityEvent ? 'ring-1 ring-red-200' : ''
      }`}
      onClick={() => onClick(log)}
    >
      <CardContent className="p-4">
        <div className="flex items-start space-x-4">
          {/* Severity Indicator */}
          <div className={`p-2 rounded-lg ${getSeverityColor(log.severity)} border`}>
            {getSeverityIcon(log.severity)}
          </div>
          
          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-foreground truncate">
                  {formatMessage(log.message, log.subject)}
                </h3>
                <div className="flex items-center space-x-4 mt-1 text-xs text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <Icon name="User" size={12} />
                    <span>{log.user}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Icon name="Calendar" size={12} />
                    <span>{log.timeAgo}</span>
                  </div>
                  {log.objectName && (
                    <div className="flex items-center space-x-1">
                      <Icon name="FileText" size={12} />
                      <span className="truncate max-w-32">{log.objectName}</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Time */}
              <div className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                {new Date(log.timestamp).toLocaleTimeString(i18n.language, {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>
            
            {/* Tags and Metadata */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {/* Category Badge */}
                <Badge 
                  variant="outline" 
                  className={`text-xs ${getCategoryColor(log.category)}`}
                >
                  <div className="flex items-center space-x-1">
                    {getCategoryIcon(log.category)}
                    <span className="capitalize">
                      {t(`category.${log.category}`, log.categoryLabel)}
                    </span>
                  </div>
                </Badge>
                
                {/* App Badge */}
                {log.app && log.app !== 'no app in context' && (
                  <Badge variant="secondary" className="text-xs">
                    {log.app}
                  </Badge>
                )}
                
                {/* Security Event Badge */}
                {log.isSecurityEvent && (
                  <Badge variant="destructive" className="text-xs">
                    <Icon name="Shield" size={12} className="mr-1" />
                    {t('securityEvent', 'Security')}
                  </Badge>
                )}
              </div>
              
              {/* Severity Badge */}
              <Badge 
                variant="outline"
                className={`text-xs ${getSeverityColor(log.severity)}`}
              >
                {t(`severity.${log.severity}`, log.severity.charAt(0).toUpperCase() + log.severity.slice(1))}
              </Badge>
            </div>
            
            {/* Additional Details for High/Critical Events */}
            {(log.severity === 'critical' || log.severity === 'high') && log.message !== log.subject && (
              <div className="mt-2 p-2 bg-muted/50 rounded text-xs text-muted-foreground border-l-2 border-border">
                <p className="truncate">{log.subject}</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LogCard;
