import React from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import Icon from '@/components/AppIcon';

const LogDetailsModal = ({ isOpen, onClose, log }) => {
  const { t, i18n } = useTranslation('audit-logs');
  
  const [copiedField, setCopiedField] = React.useState(null);

  if (!log) return null;

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'high': return 'bg-warning/10 text-warning border-warning/20';
      case 'medium': return 'bg-warning/5 text-warning border-warning/10';
      case 'low': return 'bg-primary/10 text-primary border-primary/20';
      default: return 'bg-muted text-muted-foreground border-border';
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

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'critical': return <Icon name="AlertTriangle" size={20} className="text-destructive" />;
      case 'high': return <Icon name="Shield" size={20} className="text-warning" />;
      case 'medium': return <Icon name="Info" size={20} className="text-warning" />;
      case 'low': return <Icon name="Activity" size={20} className="text-primary" />;
      default: return <Icon name="Info" size={20} className="text-muted-foreground" />;
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'security': return <Icon name="Shield" size={20} className="text-muted-foreground" />;
      case 'files': return <Icon name="FileText" size={20} className="text-muted-foreground" />;
      case 'users': return <Icon name="Users" size={20} className="text-muted-foreground" />;
      case 'data_rooms': return <Icon name="Folder" size={20} className="text-muted-foreground" />;
      case 'system': return <Icon name="Settings" size={20} className="text-muted-foreground" />;
      case 'apps': return <Icon name="Activity" size={20} className="text-muted-foreground" />;
      default: return <Icon name="Info" size={20} className="text-muted-foreground" />;
    }
  };

  const copyToClipboard = async (text, field) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleString(i18n.language, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZoneName: 'short'
      });
    } catch (error) {
      return dateString;
    }
  };

  const CopyableField = ({ label, value, field }) => {
    if (!value) return null;
    
    return (
      <div>
        <Label className="text-sm font-medium text-muted-foreground">
          {label}
        </Label>
        <div className="mt-1 flex items-center space-x-2">
          <span className="text-sm text-foreground bg-muted/50 p-2 rounded border flex-1 break-all">
            {value}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => copyToClipboard(value, field)}
            className="shrink-0"
          >
            {copiedField === field ? (
              <Icon name="CheckCircle" size={16} className="text-green-600" />
            ) : (
              <Icon name="Copy" size={16} />
            )}
          </Button>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            {getSeverityIcon(log.severity)}
            <span>{t('details.title', 'Audit Log Details')}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Summary Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('details.summary', 'Summary')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  {t('details.message', 'Message')}
                </Label>
                <p className="mt-1 text-sm text-foreground bg-muted/50 p-3 rounded border">
                  {log.message || log.subject}
                </p>
              </div>
              
              {log.subject && log.subject !== log.message && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    {t('details.subject', 'Subject')}
                  </Label>
                  <p className="mt-1 text-sm text-foreground bg-muted/50 p-3 rounded border">
                    {log.subject}
                  </p>
                </div>
              )}

              <div className="flex items-center space-x-4">
                <Badge variant="outline" className={`${getSeverityColor(log.severity)} border`}>
                  <div className="flex items-center space-x-1">
                    {getSeverityIcon(log.severity)}
                    <span className="capitalize">
                      {t(`severity.${log.severity}`, log.severity)}
                    </span>
                  </div>
                </Badge>
                
                <Badge variant="outline" className={`${getCategoryColor(log.category)} border`}>
                  <div className="flex items-center space-x-1">
                    {getCategoryIcon(log.category)}
                    <span className="capitalize">
                      {t(`category.${log.category}`, log.categoryLabel)}
                    </span>
                  </div>
                </Badge>
                
                {log.isSecurityEvent && (
                  <Badge variant="destructive">
                    <Icon name="Shield" size={12} className="mr-1" />
                    {t('securityEvent', 'Security Event')}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Timeline Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <Icon name="Clock" size={20} />
                <span>{t('details.timeline', 'Timeline')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <CopyableField
                label={t('details.timestamp', 'Timestamp')}
                value={formatDate(log.timestamp)}
                field="timestamp"
              />
              
              <div>
                <Label className="text-sm font-medium text-gray-700">
                  {t('details.timeAgo', 'Time Ago')}
                </Label>
                <p className="mt-1 text-sm text-gray-900">{log.timeAgo}</p>
              </div>
            </CardContent>
          </Card>

          {/* User Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <Icon name="User" size={20} />
                <span>{t('details.userInfo', 'User Information')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <CopyableField
                label={t('details.user', 'User')}
                value={log.user}
                field="user"
              />
              
              {log.author && log.author !== log.user && (
                <CopyableField
                  label={t('details.author', 'Author')}
                  value={log.author}
                  field="author"
                />
              )}
            </CardContent>
          </Card>

          {/* Technical Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <Icon name="Settings" size={20} />
                <span>{t('details.technical', 'Technical Details')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <CopyableField
                label={t('details.logId', 'Log ID')}
                value={log.logId || log.id}
                field="logId"
              />
              
              <CopyableField
                label={t('details.app', 'Application')}
                value={log.app}
                field="app"
              />
              
              <CopyableField
                label={t('details.type', 'Type')}
                value={log.type}
                field="type"
              />
              
              {log.objectType && (
                <CopyableField
                  label={t('details.objectType', 'Object Type')}
                  value={log.objectType}
                  field="objectType"
                />
              )}
              
              {log.objectId && (
                <CopyableField
                  label={t('details.objectId', 'Object ID')}
                  value={log.objectId}
                  field="objectId"
                />
              )}
              
              {log.objectName && (
                <CopyableField
                  label={t('details.objectName', 'Object Name')}
                  value={log.objectName}
                  field="objectName"
                />
              )}
            </CardContent>
          </Card>

          {/* Classifications */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <Icon name="Tag" size={20} />
                <span>{t('details.classifications', 'Classifications')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">
                    {t('details.isSecurityEvent', 'Security Event:')}
                  </span>
                  <Badge variant={log.isSecurityEvent ? 'destructive' : 'secondary'}>
                    {log.isSecurityEvent ? t('yes', 'Yes') : t('no', 'No')}
                  </Badge>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">
                    {t('details.isDataEvent', 'Data Event:')}
                  </span>
                  <Badge variant={log.isDataEvent ? 'default' : 'secondary'}>
                    {log.isDataEvent ? t('yes', 'Yes') : t('no', 'No')}
                  </Badge>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">
                    {t('details.isSystemEvent', 'System Event:')}
                  </span>
                  <Badge variant={log.isSystemEvent ? 'default' : 'secondary'}>
                    {log.isSystemEvent ? t('yes', 'Yes') : t('no', 'No')}
                  </Badge>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">
                    {t('details.isUserEvent', 'User Event:')}
                  </span>
                  <Badge variant={log.isUserEvent ? 'default' : 'secondary'}>
                    {log.isUserEvent ? t('yes', 'Yes') : t('no', 'No')}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Raw Data (for debugging) */}
          {log.raw && Object.keys(log.raw).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center space-x-2">
                  <Icon name="Hash" size={20} />
                  <span>{t('details.rawData', 'Raw Data')}</span>
                </CardTitle>
                <CardDescription>
                  {t('details.rawDataDescription', 'Original data from the audit log entry')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-muted/50 p-3 rounded border font-mono text-xs overflow-x-auto">
                  <pre>{JSON.stringify(log.raw, null, 2)}</pre>
                </div>
                <div className="mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(JSON.stringify(log.raw, null, 2), 'rawData')}
                  >
                    {copiedField === 'rawData' ? (
                      <>
                        <Icon name="CheckCircle" size={16} className="mr-2 text-green-600" />
                        {t('copied', 'Copied')}
                      </>
                    ) : (
                      <>
                        <Icon name="Copy" size={16} className="mr-2" />
                        {t('copyRawData', 'Copy Raw Data')}
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Close Button */}
        <div className="flex justify-end pt-4 border-t">
          <Button onClick={onClose}>
            {t('close', 'Close')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LogDetailsModal;
