import React from 'react';
import { useTranslation } from 'react-i18next';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import Icon from '@/components/AppIcon';

const StatsOverview = ({ stats, loading, error, onRefresh }) => {
  const { t } = useTranslation('audit-logs');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-8 text-center">
        <Icon name="AlertTriangle" size={48} className="text-destructive mx-auto mb-4" />
        <p className="text-muted-foreground mb-4">{t('error.loadStats', 'Failed to load statistics')}</p>
        <Button onClick={onRefresh} variant="outline">
          {t('retry', 'Try Again')}
        </Button>
      </Card>
    );
  }

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
      case 'security': return <Icon name="Shield" size={20} className="text-destructive" />;
      case 'files': return <Icon name="FileText" size={20} className="text-primary" />;
      case 'users': return <Icon name="Users" size={20} className="text-success" />;
      case 'data_rooms': return <Icon name="Folder" size={20} className="text-primary" />;
      case 'system': return <Icon name="Settings" size={20} className="text-muted-foreground" />;
      case 'apps': return <Icon name="Activity" size={20} className="text-primary" />;
      default: return <Icon name="Info" size={20} className="text-muted-foreground" />;
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'bg-destructive/10 border-destructive/20';
      case 'high': return 'bg-warning/10 border-warning/20';
      case 'medium': return 'bg-warning/5 border-warning/10';
      case 'low': return 'bg-primary/10 border-primary/20';
      default: return 'bg-muted border-border';
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'security': return 'bg-destructive/10 border-destructive/20';
      case 'files': return 'bg-primary/10 border-primary/20';
      case 'users': return 'bg-success/10 border-success/20';
      case 'data_rooms': return 'bg-primary/10 border-primary/20';
      case 'system': return 'bg-muted border-border';
      case 'apps': return 'bg-primary/10 border-primary/20';
      default: return 'bg-muted border-border';
    }
  };

  const calculatePercentage = (value, total) => {
    if (total === 0) return 0;
    return Math.round((value / total) * 100);
  };


  // Calculate totals
  const totalLogs = stats.totalLogs || 0;
  const severityTotals = Object.values(stats.bySeverity || {}).reduce((sum, count) => sum + count, 0);
  const categoryTotals = Object.values(stats.byCategory || {}).reduce((sum, count) => sum + count, 0);

  return (
    <div className="space-y-6 pb-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">
            {t('analytics.title', 'Audit Log Analytics')}
          </h2>
          <p className="text-sm text-muted-foreground mt-1 flex items-center space-x-2">
            <Icon name="Activity" size={16} />
            <span>{t('analytics.allLogs', 'All available audit logs')}</span>
            <Badge variant="outline" className="ml-2">
              {totalLogs} {t('analytics.totalLogs', 'total logs')}
            </Badge>
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={onRefresh}>
          <Icon name="RefreshCw" size={16} className="mr-2" />
          {t('refresh', 'Refresh')}
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-destructive/10 rounded-lg">
                <Icon name="Shield" size={20} className="text-destructive" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {t('analytics.securityEvents', 'Security Events')}
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {stats.securityEvents || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Icon name="FileText" size={20} className="text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {t('analytics.dataEvents', 'Data Events')}
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {stats.dataEvents || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-muted rounded-lg">
                <Icon name="Settings" size={20} className="text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {t('analytics.systemEvents', 'System Events')}
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {stats.systemEvents || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-success/10 rounded-lg">
                <Icon name="Users" size={20} className="text-success" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {t('analytics.userEvents', 'User Events')}
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {stats.userEvents || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Severity Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Icon name="BarChart3" size={20} />
              <span>{t('analytics.severityBreakdown', 'Severity Breakdown')}</span>
            </CardTitle>
            <CardDescription>
              {t('analytics.severityDescription', 'Distribution of logs by severity level')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(stats.bySeverity || {}).map(([severity, count]) => {
              const percentage = calculatePercentage(count, severityTotals);
              return (
                <div key={severity}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {getSeverityIcon(severity)}
                      <span className="text-sm font-medium capitalize">
                        {t(`severity.${severity}`, severity)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-muted-foreground">{count}</span>
                      <Badge variant="outline" className="text-xs">
                        {percentage}%
                      </Badge>
                    </div>
                  </div>
                  <Progress 
                    value={percentage} 
                    className={`h-2 ${getSeverityColor(severity)}`}
                  />
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Category Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Icon name="Activity" size={20} />
              <span>{t('analytics.categoryBreakdown', 'Category Breakdown')}</span>
            </CardTitle>
            <CardDescription>
              {t('analytics.categoryDescription', 'Distribution of logs by category')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(stats.byCategory || {})
              .filter(([, count]) => count > 0)
              .sort(([,a], [,b]) => b - a)
              .map(([category, count]) => {
              const percentage = calculatePercentage(count, categoryTotals);
              return (
                <div key={category}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {getCategoryIcon(category)}
                      <span className="text-sm font-medium">
                        {t(`category.${category}`, category.replace('_', ' '))}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-muted-foreground">{count}</span>
                      <Badge variant="outline" className="text-xs">
                        {percentage}%
                      </Badge>
                    </div>
                  </div>
                  <Progress 
                    value={percentage} 
                    className={`h-2 ${getCategoryColor(category)}`}
                  />
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Top Applications */}
      {stats.byApp && Object.keys(stats.byApp).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Icon name="Activity" size={20} />
              <span>{t('analytics.topApps', 'Top Applications')}</span>
            </CardTitle>
            <CardDescription>
              {t('analytics.topAppsDescription', 'Applications generating the most audit logs')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(stats.byApp)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 9)
                .map(([app, count]) => {
                  const percentage = calculatePercentage(count, totalLogs);
                  return (
                    <div key={app} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium truncate" title={app}>
                          {app}
                        </span>
                        <Badge variant="secondary" className="text-xs">
                          {count}
                        </Badge>
                      </div>
                      <Progress value={percentage} className="h-2" />
                      <div className="mt-1 text-xs text-muted-foreground text-right">
                        {percentage}% of total
                      </div>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top Users */}
      {stats.topUsers && stats.topUsers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Icon name="Users" size={20} />
              <span>{t('analytics.topUsers', 'Most Active Users')}</span>
            </CardTitle>
            <CardDescription>
              {t('analytics.topUsersDescription', 'Users with the most activity in the selected period')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.topUsers.slice(0, 10).map(({ user, count }, index) => {
                const percentage = calculatePercentage(count, totalLogs);
                return (
                  <div key={user} className="flex items-center space-x-4">
                    <div className="flex items-center justify-center w-6 h-6 bg-muted rounded-full text-xs font-semibold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{user}</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-muted-foreground">{count}</span>
                          <Badge variant="outline" className="text-xs">
                            {percentage}%
                          </Badge>
                        </div>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default StatsOverview;
