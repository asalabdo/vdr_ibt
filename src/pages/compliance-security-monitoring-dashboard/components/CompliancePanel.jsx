import React from 'react';
import { useTranslation } from 'react-i18next';
import Icon from '../../../components/AppIcon';
import { Button } from '@/components/ui/Button';

const CompliancePanel = () => {
  const { t } = useTranslation('compliance-security-dashboard');
  const { t: tCommon } = useTranslation('common');
  
  const complianceChecklist = [
    {
      id: 1,
      framework: t('compliance_panel.frameworks.sox'),
      requirement: t('compliance_panel.requirements.access_control'),
      status: 'completed',
      completedDate: '2025-08-30',
      nextReview: '2025-09-30'
    },
    {
      id: 2,
      framework: t('compliance_panel.frameworks.gdpr'),
      requirement: t('compliance_panel.requirements.data_processing'),
      status: 'in_progress',
      completedDate: null,
      nextReview: '2025-09-15'
    },
    {
      id: 3,
      framework: t('compliance_panel.frameworks.sec'),
      requirement: t('compliance_panel.requirements.audit_trail'),
      status: 'completed',
      completedDate: '2025-08-29',
      nextReview: '2025-10-01'
    },
    {
      id: 4,
      framework: t('compliance_panel.frameworks.iso27001'),
      requirement: t('compliance_panel.requirements.incident_response'),
      status: 'overdue',
      completedDate: null,
      nextReview: '2025-08-25'
    }
  ];

  const recentAuditActivities = [
    {
      id: 1,
      type: 'access_review',
      description: t('compliance_panel.sample_activities.quarterly_review'),
      timestamp: '2025-08-31 14:30:00',
      user: t('compliance_panel.users.sarah_johnson'),
      status: 'completed'
    },
    {
      id: 2,
      type: 'permission_change',
      description: t('compliance_panel.sample_activities.bulk_update'),
      timestamp: '2025-08-31 12:15:00',
      user: t('compliance_panel.users.michael_chen'),
      status: 'completed'
    },
    {
      id: 3,
      type: 'security_scan',
      description: t('compliance_panel.sample_activities.security_scan'),
      timestamp: '2025-08-31 10:00:00',
      user: t('compliance_panel.users.system'),
      status: 'in_progress'
    },
    {
      id: 4,
      type: 'compliance_report',
      description: t('compliance_panel.sample_activities.monthly_report'),
      timestamp: '2025-08-31 09:45:00',
      user: t('compliance_panel.users.compliance_bot'),
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
    
    if (diff < 60) return tCommon('time_ago.just_now');
    if (diff < 3600) return tCommon('time_ago.minutes_ago', { count: Math.floor(diff / 60) });
    if (diff < 86400) return tCommon('time_ago.hours_ago', { count: Math.floor(diff / 3600) });
    return date?.toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      {/* Regulatory Checklist */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              {t('compliance_panel.regulatory_checklist.title')}
            </h3>
            <p className="text-sm text-muted-foreground">
              {t('compliance_panel.regulatory_checklist.subtitle')}
            </p>
          </div>
          <Button variant="ghost" size="sm" iconName="RefreshCw">
            {t('actions.refresh')}
          </Button>
        </div>

        <div className="space-y-3">
          {complianceChecklist?.map((item) => {
            const statusConfig = getStatusIcon(item?.status);
            return (
              <div key={item?.id} className="flex items-start space-x-3 rtl:space-x-reverse p-3 bg-muted/20 rounded-lg">
                <Icon 
                  name={statusConfig?.icon} 
                  size={16} 
                  className={statusConfig?.color}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 rtl:space-x-reverse mb-1">
                    <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded">
                      {item?.framework}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-foreground mb-1">
                    {item?.requirement}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t('compliance_panel.labels.next_review')}: {new Date(item.nextReview)?.toLocaleDateString()}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 pt-4 border-t border-border">
          <Button variant="outline" size="sm" fullWidth iconName="FileText">
            {t('actions.generate_report')}
          </Button>
        </div>
      </div>
      {/* Recent Audit Activities */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              {t('compliance_panel.recent_activities.title')}
            </h3>
            <p className="text-sm text-muted-foreground">
              {t('compliance_panel.recent_activities.subtitle')}
            </p>
          </div>
          <Button variant="ghost" size="sm" iconName="ExternalLink">
            {t('actions.view_all')}
          </Button>
        </div>

        <div className="space-y-3">
          {recentAuditActivities?.map((activity) => (
            <div key={activity?.id} className="flex items-start space-x-3 rtl:space-x-reverse p-3 hover:bg-muted/20 rounded-lg transition-colors">
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
                <div className="flex items-center space-x-2 rtl:space-x-reverse text-xs text-muted-foreground">
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
                {activity?.status === 'completed' 
                  ? tCommon('status_values.completed')
                  : activity?.status === 'in_progress'
                    ? tCommon('status_values.pending')
                    : tCommon('status_values.active')
                }
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Quick Actions */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          {t('compliance_panel.quick_actions.title')}
        </h3>
        <div className="space-y-2">
          <Button variant="outline" size="sm" fullWidth iconName="Download">
            {t('actions.export_logs')}
          </Button>
          <Button variant="outline" size="sm" fullWidth iconName="AlertTriangle">
            {t('actions.create_incident')}
          </Button>
          <Button variant="outline" size="sm" fullWidth iconName="Settings">
            {t('actions.configure_alerts')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CompliancePanel;
