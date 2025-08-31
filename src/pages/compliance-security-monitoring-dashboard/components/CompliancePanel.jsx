import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const CompliancePanel = () => {
  const complianceChecklist = [
    {
      id: 1,
      framework: 'SOX',
      requirement: 'Access Control Documentation',
      status: 'completed',
      completedDate: '2025-08-30',
      nextReview: '2025-09-30'
    },
    {
      id: 2,
      framework: 'GDPR',
      requirement: 'Data Processing Records',
      status: 'in_progress',
      completedDate: null,
      nextReview: '2025-09-15'
    },
    {
      id: 3,
      framework: 'SEC',
      requirement: 'Audit Trail Completeness',
      status: 'completed',
      completedDate: '2025-08-29',
      nextReview: '2025-10-01'
    },
    {
      id: 4,
      framework: 'ISO 27001',
      requirement: 'Security Incident Response',
      status: 'overdue',
      completedDate: null,
      nextReview: '2025-08-25'
    }
  ];

  const recentAuditActivities = [
    {
      id: 1,
      type: 'access_review',
      description: 'Quarterly access review completed for Deal Room Alpha',
      timestamp: '2025-08-31 14:30:00',
      user: 'Sarah Johnson',
      status: 'completed'
    },
    {
      id: 2,
      type: 'permission_change',
      description: 'Bulk permission update for external advisors',
      timestamp: '2025-08-31 12:15:00',
      user: 'Michael Chen',
      status: 'completed'
    },
    {
      id: 3,
      type: 'security_scan',
      description: 'Automated security vulnerability scan initiated',
      timestamp: '2025-08-31 10:00:00',
      user: 'System',
      status: 'in_progress'
    },
    {
      id: 4,
      type: 'compliance_report',
      description: 'Monthly compliance report generated',
      timestamp: '2025-08-31 09:45:00',
      user: 'Compliance Bot',
      status: 'completed'
    }
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return { icon: 'CheckCircle', color: 'text-success' };
      case 'in_progress':
        return { icon: 'Clock', color: 'text-warning' };
      case 'overdue':
        return { icon: 'AlertCircle', color: 'text-error' };
      default:
        return { icon: 'Circle', color: 'text-muted-foreground' };
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'access_review':
        return 'Users';
      case 'permission_change':
        return 'Shield';
      case 'security_scan':
        return 'Search';
      case 'compliance_report':
        return 'FileText';
      default:
        return 'Activity';
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

  return (
    <div className="space-y-6">
      {/* Regulatory Checklist */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Regulatory Checklist</h3>
            <p className="text-sm text-muted-foreground">Compliance requirements status</p>
          </div>
          <Button variant="ghost" size="sm" iconName="RefreshCw">
            Refresh
          </Button>
        </div>

        <div className="space-y-3">
          {complianceChecklist?.map((item) => {
            const statusConfig = getStatusIcon(item?.status);
            return (
              <div key={item?.id} className="flex items-start space-x-3 p-3 bg-muted/20 rounded-lg">
                <Icon 
                  name={statusConfig?.icon} 
                  size={16} 
                  className={statusConfig?.color}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded">
                      {item?.framework}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-foreground mb-1">
                    {item?.requirement}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Next review: {new Date(item.nextReview)?.toLocaleDateString()}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 pt-4 border-t border-border">
          <Button variant="outline" size="sm" fullWidth iconName="FileText">
            Generate Compliance Report
          </Button>
        </div>
      </div>
      {/* Recent Audit Activities */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Recent Activities</h3>
            <p className="text-sm text-muted-foreground">Latest audit and compliance actions</p>
          </div>
          <Button variant="ghost" size="sm" iconName="ExternalLink">
            View All
          </Button>
        </div>

        <div className="space-y-3">
          {recentAuditActivities?.map((activity) => (
            <div key={activity?.id} className="flex items-start space-x-3 p-3 hover:bg-muted/20 rounded-lg transition-colors">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Icon 
                  name={getActivityIcon(activity?.type)} 
                  size={16} 
                  className="text-primary"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground mb-1">
                  {activity?.description}
                </p>
                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                  <span>{activity?.user}</span>
                  <span>•</span>
                  <span>{formatTimestamp(activity?.timestamp)}</span>
                </div>
              </div>
              <div className={`
                px-2 py-1 rounded text-xs font-medium
                ${activity?.status === 'completed' 
                  ? 'bg-success/10 text-success' :'bg-warning/10 text-warning'
                }
              `}>
                {activity?.status?.replace('_', ' ')}
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Quick Actions */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
        <div className="space-y-2">
          <Button variant="outline" size="sm" fullWidth iconName="Download">
            Export Audit Logs
          </Button>
          <Button variant="outline" size="sm" fullWidth iconName="AlertTriangle">
            Create Security Incident
          </Button>
          <Button variant="outline" size="sm" fullWidth iconName="Settings">
            Configure Alerts
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CompliancePanel;