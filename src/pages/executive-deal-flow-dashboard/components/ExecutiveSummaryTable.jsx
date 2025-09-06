import React from 'react';
import { useTranslation } from 'react-i18next';
import Icon from '../../../components/AppIcon';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';

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
    <Card className="overflow-hidden">
      <CardHeader className="border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{t('executive_summary.title', 'Executive Summary')}</CardTitle>
            <CardDescription>{t('executive_summary.subtitle', 'Key deals requiring attention')}</CardDescription>
          </div>
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <button className="px-3 py-1.5 text-xs font-medium bg-muted/30 text-muted-foreground rounded-md hover:bg-muted/50 transition-colors">
              {t('actions.export', 'Export')}
            </button>
            <Icon name="Download" size={16} className="text-muted-foreground" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-left rtl:text-right">
                {t('executive_summary.table.deal_name', 'Deal Name')}
              </TableHead>
              <TableHead className="text-left rtl:text-right">
                {t('executive_summary.table.value', 'Value')}
              </TableHead>
              <TableHead className="text-left rtl:text-right">
                {t('executive_summary.table.status', 'Status')}
              </TableHead>
              <TableHead className="text-left rtl:text-right">
                {t('executive_summary.table.priority', 'Priority')}
              </TableHead>
              <TableHead className="text-left rtl:text-right">
                {t('executive_summary.table.projected_close', 'Projected Close')}
              </TableHead>
              <TableHead className="text-left rtl:text-right">
                {t('executive_summary.table.progress', 'Progress')}
              </TableHead>
              <TableHead className="text-right rtl:text-left">
                {t('executive_summary.table.actions', 'Actions')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {deals?.map((deal) => {
              const priorityInfo = getPriorityIcon(deal?.priority);
              return (
                <TableRow key={deal?.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3 rtl:space-x-reverse">
                      <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Icon name="FileText" size={14} className="text-primary" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-foreground">{deal?.name}</div>
                        <div className="text-xs text-muted-foreground">{deal?.company}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm font-medium text-foreground">{deal?.value}</div>
                    <div className="text-xs text-muted-foreground">{deal?.type}</div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(deal?.status)}>
                      {deal?.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <Icon name={priorityInfo?.icon} size={14} className={priorityInfo?.color} />
                      <span className="text-sm text-foreground capitalize">{deal?.priority}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-foreground">{formatDate(deal?.projectedClose)}</div>
                    <div className="text-xs text-muted-foreground">{deal?.daysRemaining} {tCommon('units.days')}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <Progress value={deal?.progress} className="flex-1" />
                      <span className="text-xs text-muted-foreground w-8">{deal?.progress}%</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right rtl:text-left">
                    <button className="text-primary hover:text-primary/80 transition-colors">
                      <Icon name="ExternalLink" size={14} />
                    </button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExecutiveSummaryTable;
