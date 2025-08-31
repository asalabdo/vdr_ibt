import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const SecurityAlerts = () => {
  const [selectedAlert, setSelectedAlert] = useState(null);

  const securityAlerts = [
    {
      id: 1,
      severity: 'critical',
      title: 'Multiple Failed Login Attempts',
      description: 'User account john.doe@company.com has 5 consecutive failed login attempts from IP 45.123.78.90',
      timestamp: '2025-08-31 15:45:00',
      status: 'active',
      category: 'authentication',
      affected_resource: 'Authentication System',
      recommended_action: 'Lock account and investigate source IP',
      escalation_level: 'immediate'
    },
    {
      id: 2,
      severity: 'high',
      title: 'Unusual Document Access Pattern',
      description: 'External user sarah.wilson@advisor.com accessed 15+ sensitive documents within 10 minutes',
      timestamp: '2025-08-31 14:30:00',
      status: 'investigating',
      category: 'access_anomaly',
      affected_resource: 'Deal Room Alpha',
      recommended_action: 'Review user permissions and contact user',
      escalation_level: 'within_1_hour'
    },
    {
      id: 3,
      severity: 'medium',
      title: 'Permission Elevation Request',
      description: 'User michael.chen@company.com requested admin privileges for Deal Room Beta',
      timestamp: '2025-08-31 13:15:00',
      status: 'pending_review',
      category: 'permission_change',
      affected_resource: 'Deal Room Beta',
      recommended_action: 'Review and approve/deny request',
      escalation_level: 'within_4_hours'
    },
    {
      id: 4,
      severity: 'low',
      title: 'New Device Login',
      description: 'User emma.davis@company.com logged in from a new device (Chrome on macOS)',
      timestamp: '2025-08-31 12:00:00',
      status: 'acknowledged',
      category: 'device_change',
      affected_resource: 'User Account',
      recommended_action: 'Verify with user if needed',
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
    switch (status) {
      case 'active':
        return { color: 'bg-error/10 text-error', label: 'Active' };
      case 'investigating':
        return { color: 'bg-warning/10 text-warning', label: 'Investigating' };
      case 'pending_review':
        return { color: 'bg-accent/10 text-accent', label: 'Pending Review' };
      case 'acknowledged':
        return { color: 'bg-success/10 text-success', label: 'Acknowledged' };
      default:
        return { color: 'bg-muted/10 text-muted-foreground', label: 'Unknown' };
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);
    
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return date?.toLocaleDateString();
  };

  const handleAlertAction = (alertId, action) => {
    console.log(`Performing ${action} on alert ${alertId}`);
    // Handle alert actions here
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-1">Security Alerts</h3>
          <p className="text-sm text-muted-foreground">Real-time security incidents and anomalies</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" iconName="Settings">
            Configure
          </Button>
          <Button variant="outline" size="sm" iconName="RefreshCw">
            Refresh
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
                  ? 'border-primary bg-primary/5' :'border-border hover:border-primary/50 hover:bg-muted/20'
                }
              `}
              onClick={() => setSelectedAlert(isSelected ? null : alert?.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <div className={`p-2 rounded-lg border ${severityConfig?.color}`}>
                    <Icon 
                      name={severityConfig?.icon} 
                      size={16} 
                      className={severityConfig?.iconColor}
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="text-sm font-semibold text-foreground">{alert?.title}</h4>
                      <span className={`
                        px-2 py-1 rounded text-xs font-medium border
                        ${severityConfig?.color}
                      `}>
                        {alert?.severity?.toUpperCase()}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${statusConfig?.color}`}>
                        {statusConfig?.label}
                      </span>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-2">
                      {alert?.description}
                    </p>
                    
                    <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                      <span>{formatTimestamp(alert?.timestamp)}</span>
                      <span>•</span>
                      <span>{alert?.affected_resource}</span>
                      <span>•</span>
                      <span>Escalate {alert?.escalation_level?.replace('_', ' ')}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 ml-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e?.stopPropagation();
                      handleAlertAction(alert?.id, 'acknowledge');
                    }}
                    iconName="Check"
                  >
                    Acknowledge
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
                    Investigate
                  </Button>
                </div>
              </div>
              {isSelected && (
                <div className="mt-4 pt-4 border-t border-border">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="text-sm font-medium text-foreground mb-2">Recommended Action</h5>
                      <p className="text-sm text-muted-foreground">{alert?.recommended_action}</p>
                    </div>
                    <div>
                      <h5 className="text-sm font-medium text-foreground mb-2">Category</h5>
                      <p className="text-sm text-muted-foreground capitalize">
                        {alert?.category?.replace('_', ' ')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAlertAction(alert?.id, 'escalate')}
                      iconName="ArrowUp"
                    >
                      Escalate
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAlertAction(alert?.id, 'resolve')}
                      iconName="CheckCircle"
                    >
                      Mark Resolved
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAlertAction(alert?.id, 'details')}
                      iconName="ExternalLink"
                    >
                      View Details
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
            {securityAlerts?.filter(alert => alert?.status === 'active')?.length} active alerts requiring attention
          </div>
          <Button variant="outline" size="sm" iconName="ExternalLink">
            View All Alerts
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SecurityAlerts;