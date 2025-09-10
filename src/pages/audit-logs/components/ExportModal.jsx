import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Icon from '@/components/AppIcon';

// Hooks
import { useExportAuditLogs } from '@/hooks/api/useAuditLogs';

const ExportModal = ({ isOpen, onClose, filters }) => {
  const { t } = useTranslation('audit-logs');
  
  // Export state
  const [exportFormat, setExportFormat] = useState('csv');
  const [dateRange, setDateRange] = useState({
    since: '',
    until: ''
  });
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedSeverities, setSelectedSeverities] = useState([]);
  const [includeRawData, setIncludeRawData] = useState(false);
  
  // Export mutation
  const exportMutation = useExportAuditLogs({
    onSuccess: () => {
      // Export successful, file should be downloading
      setExportFormat('csv');
      setDateRange({ since: '', until: '' });
      setSelectedCategories([]);
      setSelectedSeverities([]);
      setIncludeRawData(false);
      onClose();
    },
    onError: (error) => {
      console.error('Export failed:', error);
    }
  });

  // Available options
  const categories = [
    { value: 'security', label: t('category.security', 'Security'), color: 'bg-red-100 text-red-800' },
    { value: 'files', label: t('category.files', 'Files'), color: 'bg-blue-100 text-blue-800' },
    { value: 'users', label: t('category.users', 'Users'), color: 'bg-green-100 text-green-800' },
    { value: 'data_rooms', label: t('category.data_rooms', 'Data Rooms'), color: 'bg-purple-100 text-purple-800' },
    { value: 'system', label: t('category.system', 'System'), color: 'bg-gray-100 text-gray-800' },
    { value: 'apps', label: t('category.apps', 'Applications'), color: 'bg-indigo-100 text-indigo-800' },
    { value: 'general', label: t('category.general', 'General'), color: 'bg-gray-100 text-gray-800' }
  ];

  const severities = [
    { value: 'critical', label: t('severity.critical', 'Critical'), color: 'bg-red-100 text-red-800' },
    { value: 'high', label: t('severity.high', 'High'), color: 'bg-orange-100 text-orange-800' },
    { value: 'medium', label: t('severity.medium', 'Medium'), color: 'bg-yellow-100 text-yellow-800' },
    { value: 'low', label: t('severity.low', 'Low'), color: 'bg-blue-100 text-blue-800' }
  ];

  const handleCategoryChange = (category, checked) => {
    setSelectedCategories(prev => 
      checked ? [...prev, category] : prev.filter(c => c !== category)
    );
  };

  const handleSeverityChange = (severity, checked) => {
    setSelectedSeverities(prev => 
      checked ? [...prev, severity] : prev.filter(s => s !== severity)
    );
  };

  const handleDateChange = (field, value) => {
    setDateRange(prev => ({ ...prev, [field]: value }));
  };

  const handleExport = () => {
    const exportOptions = {
      format: exportFormat,
      since: dateRange.since || undefined,
      until: dateRange.until || undefined,
      categories: selectedCategories.length > 0 ? selectedCategories : undefined,
      severities: selectedSeverities.length > 0 ? selectedSeverities : undefined,
      includeRawData
    };

    exportMutation.mutate(exportOptions);
  };

  const resetForm = () => {
    setExportFormat('csv');
    setDateRange({ since: '', until: '' });
    setSelectedCategories([]);
    setSelectedSeverities([]);
    setIncludeRawData(false);
  };

  const getFilterSummary = () => {
    const summary = [];
    
    if (dateRange.since || dateRange.until) {
      summary.push(t('export.dateRangeApplied', 'Date range filter applied'));
    }
    
    if (selectedCategories.length > 0) {
      summary.push(t('export.categoriesSelected', '{{count}} categories selected', { 
        count: selectedCategories.length 
      }));
    }
    
    if (selectedSeverities.length > 0) {
      summary.push(t('export.severitiesSelected', '{{count}} severities selected', { 
        count: selectedSeverities.length 
      }));
    }
    
    return summary;
  };

  const isFormValid = () => {
    // Basic validation - at least format should be selected
    return exportFormat;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Icon name="Download" size={20} />
            <span>{t('export.title', 'Export Audit Logs')}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Export Format */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center space-x-2">
                <Icon name="FileText" size={16} />
                <span>{t('export.format', 'Export Format')}</span>
              </CardTitle>
              <CardDescription>
                {t('export.formatDescription', 'Choose the format for your exported data')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={exportFormat} onValueChange={setExportFormat}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">
                    CSV - {t('export.csvDescription', 'Comma-separated values (recommended for Excel)')}
                  </SelectItem>
                  <SelectItem value="json">
                    JSON - {t('export.jsonDescription', 'JavaScript Object Notation (for developers)')}
                  </SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Date Range */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center space-x-2">
                <Icon name="Calendar" size={16} />
                <span>{t('export.dateRange', 'Date Range')}</span>
              </CardTitle>
              <CardDescription>
                {t('export.dateRangeDescription', 'Limit export to specific time period (optional)')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">
                    {t('export.since', 'Since')}
                  </Label>
                  <Input
                    type="datetime-local"
                    value={dateRange.since}
                    onChange={(e) => handleDateChange('since', e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium">
                    {t('export.until', 'Until')}
                  </Label>
                  <Input
                    type="datetime-local"
                    value={dateRange.until}
                    onChange={(e) => handleDateChange('until', e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Category Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center space-x-2">
                <Icon name="Filter" size={16} />
                <span>{t('export.categories', 'Categories')}</span>
              </CardTitle>
              <CardDescription>
                {t('export.categoriesDescription', 'Select specific categories to include (optional)')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {categories.map(category => (
                  <div key={category.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`category-${category.value}`}
                      checked={selectedCategories.includes(category.value)}
                      onCheckedChange={(checked) => handleCategoryChange(category.value, checked)}
                    />
                    <Label 
                      htmlFor={`category-${category.value}`}
                      className="flex items-center space-x-2 cursor-pointer"
                    >
                      <Badge variant="outline" className={`text-xs ${category.color}`}>
                        {category.label}
                      </Badge>
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Severity Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center space-x-2">
                <Icon name="Filter" size={16} />
                <span>{t('export.severities', 'Severities')}</span>
              </CardTitle>
              <CardDescription>
                {t('export.severitiesDescription', 'Select specific severities to include (optional)')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {severities.map(severity => (
                  <div key={severity.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`severity-${severity.value}`}
                      checked={selectedSeverities.includes(severity.value)}
                      onCheckedChange={(checked) => handleSeverityChange(severity.value, checked)}
                    />
                    <Label 
                      htmlFor={`severity-${severity.value}`}
                      className="flex items-center space-x-2 cursor-pointer"
                    >
                      <Badge variant="outline" className={`text-xs ${severity.color}`}>
                        {severity.label}
                      </Badge>
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Additional Options */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {t('export.additionalOptions', 'Additional Options')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="include-raw-data"
                  checked={includeRawData}
                  onCheckedChange={setIncludeRawData}
                />
                <Label htmlFor="include-raw-data" className="cursor-pointer">
                  {t('export.includeRawData', 'Include raw log data (for detailed analysis)')}
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* Filter Summary */}
          {getFilterSummary().length > 0 && (
            <Alert>
              <Icon name="AlertCircle" size={16} />
              <AlertDescription>
                <div className="font-medium mb-1">
                  {t('export.activeFilters', 'Active Filters:')}
                </div>
                <ul className="text-sm space-y-1">
                  {getFilterSummary().map((filter, index) => (
                    <li key={index}>• {filter}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {/* Error Display */}
          {exportMutation.isError && (
            <Alert variant="destructive">
              <Icon name="AlertCircle" size={16} />
              <AlertDescription>
                {t('export.error', 'Export failed: {{error}}', { 
                  error: exportMutation.error?.message || 'Unknown error' 
                })}
              </AlertDescription>
            </Alert>
          )}

          {/* Success Display */}
          {exportMutation.isSuccess && (
            <Alert className="border-green-200 bg-green-50">
              <Icon name="CheckCircle" size={16} className="text-green-600" />
              <AlertDescription className="text-green-800">
                {t('export.success', 'Export completed successfully! Your file should start downloading.')}
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-between pt-4 border-t">
          <Button variant="outline" onClick={resetForm}>
            {t('export.reset', 'Reset Form')}
          </Button>
          
          <div className="flex space-x-2">
            <Button variant="outline" onClick={onClose}>
              {t('cancel', 'Cancel')}
            </Button>
            <Button 
              onClick={handleExport}
              disabled={!isFormValid() || exportMutation.isPending}
            >
              {exportMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {t('export.exporting', 'Exporting...')}
                </>
              ) : (
                <>
                  <Icon name="Download" size={16} className="mr-2" />
                  {t('export.export', 'Export')}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExportModal;
