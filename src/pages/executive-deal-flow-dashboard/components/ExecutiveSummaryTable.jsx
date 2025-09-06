import React from 'react';
import { useTranslation } from 'react-i18next';
import Icon from '../../../components/AppIcon';

const ExecutiveSummaryTable = ({ deals }) => {
  const { t } = useTranslation('executive-dashboard');
  const { t: tCommon } = useTranslation('common');

  const getStatusColor = (status) => {
    const statusLower = status?.toLowerCase();
    // Handle both English and Arabic status values
    switch (statusLower) {
      case 'critical':
      case 'حرج':
        return 'bg-error/10 text-error border-error/20';
      case 'attention':
      case 'يحتاج انتباه':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'on-track':
      case 'على المسار الصحيح':
        return 'bg-success/10 text-success border-success/20';
      default: 
        return 'bg-muted/10 text-muted-foreground border-muted/20';
    }
  };

  const getPriorityIcon = (priority) => {
    const priorityLower = priority?.toLowerCase();
    // Handle both English and Arabic priority values
    switch (priorityLower) {
      case 'high':
      case 'عالي': 
        return { icon: 'AlertTriangle', color: 'text-error' };
      case 'medium':
      case 'متوسط': 
        return { icon: 'AlertCircle', color: 'text-warning' };
      case 'low':
      case 'منخفض': 
        return { icon: 'Info', color: 'text-muted-foreground' };
      default: 
        return { icon: 'Circle', color: 'text-muted-foreground' };
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString)?.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground">{t('executive_summary.title', 'Executive Summary')}</h3>
            <p className="text-sm text-muted-foreground">{t('executive_summary.subtitle', 'Key deals requiring attention')}</p>
          </div>
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <button className="px-3 py-1.5 text-xs font-medium bg-muted/30 text-muted-foreground rounded-md hover:bg-muted/50 transition-colors">
              {t('actions.export', 'Export')}
            </button>
            <Icon name="Download" size={16} className="text-muted-foreground" />
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/20">
            <tr>
              <th className="text-left rtl:text-right p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {t('executive_summary.table.deal_name', 'Deal Name')}
              </th>
              <th className="text-left rtl:text-right p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {t('executive_summary.table.value', 'Value')}
              </th>
              <th className="text-left rtl:text-right p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {t('executive_summary.table.status', 'Status')}
              </th>
              <th className="text-left rtl:text-right p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {t('executive_summary.table.priority', 'Priority')}
              </th>
              <th className="text-left rtl:text-right p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {t('executive_summary.table.projected_close', 'Projected Close')}
              </th>
              <th className="text-left rtl:text-right p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {t('executive_summary.table.progress', 'Progress')}
              </th>
              <th className="text-right rtl:text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {t('executive_summary.table.actions', 'Actions')}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {deals?.map((deal) => {
              const priorityInfo = getPriorityIcon(deal?.priority);
              return (
                <tr key={deal?.id} className="hover:bg-muted/10 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center space-x-3 rtl:space-x-reverse">
                      <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Icon name="FileText" size={14} className="text-primary" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-foreground">{deal?.name}</div>
                        <div className="text-xs text-muted-foreground">{deal?.company}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="text-sm font-medium text-foreground">{deal?.value}</div>
                    <div className="text-xs text-muted-foreground">{deal?.type}</div>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(deal?.status)}`}>
                      {deal?.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <Icon name={priorityInfo?.icon} size={14} className={priorityInfo?.color} />
                      <span className="text-sm text-foreground capitalize">{deal?.priority}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="text-sm text-foreground">{formatDate(deal?.projectedClose)}</div>
                    <div className="text-xs text-muted-foreground">{deal?.daysRemaining} {tCommon('units.days')}</div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <div className="flex-1 bg-muted/30 rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all duration-300"
                          style={{ width: `${deal?.progress}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground w-8">{deal?.progress}%</span>
                    </div>
                  </td>
                  <td className="p-4 text-right rtl:text-left">
                    <button className="text-primary hover:text-primary/80 transition-colors">
                      <Icon name="ExternalLink" size={14} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ExecutiveSummaryTable;