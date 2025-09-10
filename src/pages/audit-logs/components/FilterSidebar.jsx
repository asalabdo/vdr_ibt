import React from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/AppIcon';

const FilterSidebar = ({ isOpen, onClose, filters, onFilterChange, logs = [] }) => {
  const { t } = useTranslation('audit-logs');

  // Calculate filter counts from logs data
  const getCategoryCounts = () => {
    const counts = {
      security: logs.filter(log => log.category === 'security').length,
      files: logs.filter(log => log.category === 'files').length,
      users: logs.filter(log => log.category === 'users').length,
      data_rooms: logs.filter(log => log.category === 'data_rooms').length,
      system: logs.filter(log => log.category === 'system').length,
      apps: logs.filter(log => log.category === 'apps').length,
      general: logs.filter(log => log.category === 'general').length,
    };
    return counts;
  };

  const getSeverityCounts = () => {
    const counts = {
      critical: logs.filter(log => log.severity === 'critical').length,
      high: logs.filter(log => log.severity === 'high').length,
      medium: logs.filter(log => log.severity === 'medium').length,
      low: logs.filter(log => log.severity === 'low').length,
    };
    return counts;
  };

  const getAppCounts = () => {
    const appCounts = {};
    logs.forEach(log => {
      if (log.app && log.app !== 'no app in context') {
        appCounts[log.app] = (appCounts[log.app] || 0) + 1;
      }
    });
    // Return top 10 apps by count
    return Object.entries(appCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .reduce((obj, [app, count]) => {
        obj[app] = count;
        return obj;
      }, {});
  };

  const getUserCounts = () => {
    const userCounts = {};
    logs.forEach(log => {
      if (log.user && log.user !== 'system') {
        userCounts[log.user] = (userCounts[log.user] || 0) + 1;
      }
    });
    // Return top 10 users by count
    return Object.entries(userCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .reduce((obj, [user, count]) => {
        obj[user] = count;
        return obj;
      }, {});
  };

  const categoryCounts = getCategoryCounts();
  const severityCounts = getSeverityCounts();
  const appCounts = getAppCounts();
  const userCounts = getUserCounts();

  const handleFilterChange = (filterType, value, checked) => {
    const currentValues = filters[filterType] || [];
    const newValues = checked
      ? [...currentValues, value]
      : currentValues.filter(v => v !== value);
    
    onFilterChange({ [filterType]: newValues });
  };

  const handleDateRangeChange = (field, value) => {
    onFilterChange({ [field]: value || null });
  };

  const clearAllFilters = () => {
    onFilterChange({
      categories: [],
      severities: [],
      apps: [],
      users: [],
      since: null,
      until: null,
    });
  };

  const getActiveFilterCount = () => {
    return (filters.categories?.length || 0) +
           (filters.severities?.length || 0) +
           (filters.apps?.length || 0) +
           (filters.users?.length || 0) +
           (filters.since ? 1 : 0) +
           (filters.until ? 1 : 0);
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'security': return <Icon name="Shield" size={16} />;
      case 'files': return <Icon name="FileText" size={16} />;
      case 'users': return <Icon name="Users" size={16} />;
      case 'data_rooms': return <Icon name="Folder" size={16} />;
      case 'system': return <Icon name="Settings" size={16} />;
      case 'apps': return <Icon name="Activity" size={16} />;
      default: return <Icon name="Info" size={16} />;
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'critical': return <Icon name="AlertTriangle" size={16} />;
      case 'high': return <Icon name="Shield" size={16} />;
      case 'medium': return <Icon name="Info" size={16} />;
      case 'low': return <Icon name="Activity" size={16} />;
      default: return <Icon name="Info" size={16} />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex">
      {/* Backdrop */}
      <div className="flex-1" onClick={onClose} />
      
      {/* Sidebar */}
      <div className="w-80 bg-white h-full overflow-y-auto shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-2">
            <Icon name="Filter" size={20} />
            <h2 className="text-lg font-semibold">
              {t('filter.title', 'Filter Logs')}
            </h2>
            {getActiveFilterCount() > 0 && (
              <Badge variant="secondary" className="ml-2">
                {getActiveFilterCount()}
              </Badge>
            )}
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <Icon name="X" size={20} />
          </Button>
        </div>

        <div className="p-4 space-y-6">
          {/* Clear All Filters */}
          {getActiveFilterCount() > 0 && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={clearAllFilters}
              className="w-full"
            >
              {t('filter.clearAll', 'Clear All Filters')}
            </Button>
          )}

          {/* Date Range */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center space-x-2">
                <Icon name="Calendar" size={16} />
                <span>{t('filter.dateRange', 'Date Range')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-xs text-gray-600">
                  {t('filter.since', 'Since')}
                </Label>
                <Input
                  type="datetime-local"
                  value={filters.since ? new Date(filters.since).toISOString().slice(0, 16) : ''}
                  onChange={(e) => handleDateRangeChange('since', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs text-gray-600">
                  {t('filter.until', 'Until')}
                </Label>
                <Input
                  type="datetime-local"
                  value={filters.until ? new Date(filters.until).toISOString().slice(0, 16) : ''}
                  onChange={(e) => handleDateRangeChange('until', e.target.value)}
                  className="mt-1"
                />
              </div>
            </CardContent>
          </Card>

          {/* Severity Filter */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center space-x-2">
                <Icon name="AlertTriangle" size={16} />
                <span>{t('filter.severity', 'Severity')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {Object.entries(severityCounts).map(([severity, count]) => (
                <div key={severity} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`severity-${severity}`}
                      checked={filters.severities?.includes(severity) || false}
                      onCheckedChange={(checked) => handleFilterChange('severities', severity, checked)}
                    />
                    <Label 
                      htmlFor={`severity-${severity}`}
                      className="flex items-center space-x-2 text-sm capitalize cursor-pointer"
                    >
                      {getSeverityIcon(severity)}
                      <span>{t(`severity.${severity}`, severity)}</span>
                    </Label>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {count}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Category Filter */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center space-x-2">
                <Icon name="FileText" size={16} />
                <span>{t('filter.category', 'Category')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {Object.entries(categoryCounts)
                .filter(([, count]) => count > 0)
                .map(([category, count]) => (
                <div key={category} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`category-${category}`}
                      checked={filters.categories?.includes(category) || false}
                      onCheckedChange={(checked) => handleFilterChange('categories', category, checked)}
                    />
                    <Label 
                      htmlFor={`category-${category}`}
                      className="flex items-center space-x-2 text-sm cursor-pointer"
                    >
                      {getCategoryIcon(category)}
                      <span>{t(`category.${category}`, category.replace('_', ' '))}</span>
                    </Label>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {count}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* App Filter */}
          {Object.keys(appCounts).length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center space-x-2">
                  <Icon name="Activity" size={16} />
                  <span>{t('filter.apps', 'Applications')}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {Object.entries(appCounts).map(([app, count]) => (
                  <div key={app} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`app-${app}`}
                        checked={filters.apps?.includes(app) || false}
                        onCheckedChange={(checked) => handleFilterChange('apps', app, checked)}
                      />
                      <Label 
                        htmlFor={`app-${app}`}
                        className="text-sm cursor-pointer truncate"
                        title={app}
                      >
                        {app}
                      </Label>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {count}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* User Filter */}
          {Object.keys(userCounts).length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center space-x-2">
                  <Icon name="Users" size={16} />
                  <span>{t('filter.users', 'Users')}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {Object.entries(userCounts).map(([user, count]) => (
                  <div key={user} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`user-${user}`}
                        checked={filters.users?.includes(user) || false}
                        onCheckedChange={(checked) => handleFilterChange('users', user, checked)}
                      />
                      <Label 
                        htmlFor={`user-${user}`}
                        className="text-sm cursor-pointer truncate"
                        title={user}
                      >
                        {user}
                      </Label>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {count}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default FilterSidebar;