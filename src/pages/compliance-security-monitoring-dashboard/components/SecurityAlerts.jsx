import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const SecurityAlerts = () => {
  const { t } = useTranslation('compliance-security-dashboard');
  const { t: tCommon } = useTranslation('common');
  const [selectedAlert, setSelectedAlert] = useState(null);

  const securityAlerts = [
    {
      id: 1,
      severity: 'critical',
      title: t('security_alerts.sample_alerts.failed_login.title'),
      description: t('security_alerts.sample_alerts.failed_login.description'),
      timestamp: '2025-08-31 15:45:00',
      status: 'active',
      category: 'authentication',
      affected_resource: t('security_alerts.sample_alerts.failed_login.affected_resource'),
      recommended_action: t('security_alerts.sample_alerts.failed_login.recommended_action'),
      escalation_level: 'immediate'
    },
    {
      id: 2,
      severity: 'high',
      title: t('security_alerts.sample_alerts.unusual_access.title'),
      description: t('security_alerts.sample_alerts.unusual_access.description'),
      timestamp: '2025-08-31 14:30:00',
      status: 'investigating',
      category: 'access_anomaly',
      affected_resource: t('security_alerts.sample_alerts.unusual_access.affected_resource'),
      recommended_action: t('security_alerts.sample_alerts.unusual_access.recommended_action'),
      escalation_level: 'within_1_hour'
    },
    {
      id: 3,
      severity: 'medium',
      title: t('security_alerts.sample_alerts.permission_request.title'),
      description: t('security_alerts.sample_alerts.permission_request.description'),
      timestamp: '2025-08-31 13:15:00',
      status: 'pending_review',
      category: 'permission_change',
      affected_resource: t('security_alerts.sample_alerts.permission_request.affected_resource'),
      recommended_action: t('security_alerts.sample_alerts.permission_request.recommended_action'),
      escalation_level: 'within_4_hours'
    },
    {
      id: 4,
      severity: 'low',
      title: t('security_alerts.sample_alerts.new_device.title'),
      description: t('security_alerts.sample_alerts.new_device.description'),
      timestamp: '2025-08-31 12:00:00',
      status: 'acknowledged',
      category: 'device_change',
      affected_resource: t('security_alerts.sample_alerts.new_device.affected_resource'),
      recommended_action: t('security_alerts.sample_alerts.new_device.recommended_action'),
      escalation_level: 'within_24_hours'
    }
  ];

  const getSeverityConfig = (severity) => {
    switch (severity) {
      case 'critical':
        return {
          color: 'bg-error/10 text-error border-error/20',
          icon: 'AlertTriangle',
          iconColor: 'text-error'
        };
      case 'high':
        return {
          color: 'bg-warning/10 text-warning border-warning/20',
          icon: 'AlertCircle',
          iconColor: 'text-warning'
        };
      case 'medium':
        return {
          color: 'bg-accent/10 text-accent border-accent/20',
          icon: 'Info',
          iconColor: 'text-accent'
        };
      case 'low':
        return {
          color: 'bg-muted/10 text-muted-foreground border-border',
          icon: 'Bell',
          iconColor: 'text-muted-foreground'
        };
      default:
        return {
          color: 'bg-muted/10 text-muted-foreground border-border',
          icon: 'Bell',
          iconColor: 'text-muted-foreground'
        };
    }
  };

  const getStatusConfig = (status) => {
    const statusLabels = {
      'active': t('security_alerts.status_labels.active'),
      'investigating': t('security_alerts.status_labels.investigating'),
      'pending_review': t('security_alerts.status_labels.pending_review'),
      'acknowledged': t('security_alerts.status_labels.acknowledged')
    };

    switch (status) {
      case 'active':
        return { color: 'bg-error/10 text-error', label: statusLabels.active };
      case 'investigating':
        return { color: 'bg-warning/10 text-warning', label: statusLabels.investigating };
      case 'pending_review':
        return { color: 'bg-accent/10 text-accent', label: statusLabels.pending_review };
      case 'acknowledged':
        return { color: 'bg-success/10 text-success', label: statusLabels.acknowledged };
      default:
        return { color: 'bg-muted/10 text-muted-foreground', label: t('security_alerts.status_labels.unknown') };
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);
    
    if (diff < 60) return tCommon('time_ago.just_now');
    if (diff < 3600) return tCommon('time_ago.minutes_ago', { count: Math.floor(diff / 60) });
    if (diff < 86400) return tCommon('time_ago.hours_ago', { count: Math.floor(diff / 3600) });
    return date?.toLocaleDateString();
  };

  const handleAlertAction = (alertId, action) => {
    // Handle alert actions here
    // TODO: Implement actual alert action logic
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-1">
            {t('security_alerts.title')}
          </h3>
          <p className="text-sm text-muted-foreground">
            {t('security_alerts.subtitle')}
          </p>
        </div>
        
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <Button variant="outline" size="sm" iconName="Settings">
            {t('actions.configure')}
          </Button>
          <Button variant="outline" size="sm" iconName="RefreshCw">
            {t('actions.refresh')}
          </Button>
        </div>
      </div>
      
      <div className="space-y-4">
        {securityAlerts?.map((alert) => {
          const severityConfig = getSeverityConfig(alert?.severity);
          const statusConfig = getStatusConfig(alert?.status);
          const isSelected = selectedAlert === alert?.id;

          return (
            <div
              key={alert?.id}
              className={`
                border rounded-lg p-4 cursor-pointer transition-all duration-200
                ${isSelected 
                  ? 'border-primary bg-primary/5' 
                  : 'border-border hover:border-primary/50 hover:bg-muted/20'
                }
              `}
              onClick={() => setSelectedAlert(isSelected ? null : alert?.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 rtl:space-x-reverse flex-1">
                  <div className={`p-2 rounded-lg border ${severityConfig?.color}`}>
                    <Icon 
                      name={severityConfig?.icon} 
                      size={16} 
                      className={severityConfig?.iconColor}
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 rtl:space-x-reverse mb-2">
                      <h4 className="text-sm font-semibold text-foreground">{alert?.title}</h4>
                      <span className={`
                        px-2 py-1 rounded text-xs font-medium border
                        ${severityConfig?.color}
                      `}>
                        {t(`security_alerts.severity_levels.${alert?.severity}`)}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${statusConfig?.color}`}>
                        {statusConfig?.label}
                      </span>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-2">
                      {alert?.description}
                    </p>
                    
                    <div className="flex items-center space-x-4 rtl:space-x-reverse text-xs text-muted-foreground">
                      <span>{formatTimestamp(alert?.timestamp)}</span>
                      <span>•</span>
                      <span>{alert?.affected_resource}</span>
                      <span>•</span>
                      <span>
                        {t('actions.escalate')} {t(`security_alerts.escalation_levels.${alert?.escalation_level}`)}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 rtl:space-x-reverse ml-4 rtl:mr-4 rtl:ml-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e?.stopPropagation();
                      handleAlertAction(alert?.id, 'acknowledge');
                    }}
                    iconName="Check"
                  >
                    {t('actions.acknowledge')}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e?.stopPropagation();
                      handleAlertAction(alert?.id, 'investigate');
                    }}
                    iconName="Search"
                  >
                    {t('actions.investigate')}
                  </Button>
                </div>
              </div>
              
              {isSelected && (
                <div className="mt-4 pt-4 border-t border-border">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="text-sm font-medium text-foreground mb-2">
                        {t('security_alerts.headers.recommended_action')}
                      </h5>
                      <p className="text-sm text-muted-foreground">{alert?.recommended_action}</p>
                    </div>
                    <div>
                      <h5 className="text-sm font-medium text-foreground mb-2">
                        {t('security_alerts.headers.category')}
                      </h5>
                      <p className="text-sm text-muted-foreground capitalize">
                        {t(`security_alerts.categories.${alert?.category}`)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 rtl:space-x-reverse mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAlertAction(alert?.id, 'escalate')}
                      iconName="ArrowUp"
                    >
                      {t('actions.escalate')}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAlertAction(alert?.id, 'resolve')}
                      iconName="CheckCircle"
                    >
                      {t('actions.mark_resolved')}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAlertAction(alert?.id, 'details')}
                      iconName="ExternalLink"
                    >
                      {t('actions.view_details')}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      <div className="mt-6 pt-4 border-t border-border">
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {t('security_alerts.footer_text', { 
              count: securityAlerts?.filter(alert => alert?.status === 'active')?.length 
            })}
          </div>
          <Button variant="outline" size="sm" iconName="ExternalLink">
            {t('actions.view_all_alerts')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SecurityAlerts;