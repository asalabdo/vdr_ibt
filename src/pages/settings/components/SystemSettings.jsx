import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/Input';
import Icon from '../../../components/AppIcon';

const SystemSettings = () => {
  const { t } = useTranslation('settings');
  const [systemSettings, setSystemSettings] = useState({
    companyName: 'VDR',
    supportEmail: 'support@vdranalytics.com',
    timezone: 'America/New_York',
    dateFormat: 'MM/DD/YYYY',
    language: 'en',
    maintenanceMode: false,
    allowGuestAccess: false,
    maxFileSize: 100,
    sessionTimeout: 60,
    enableAuditLogs: true,
    logRetentionDays: 90
  });

  const handleSettingChange = (setting, value) => {
    setSystemSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const handleSave = () => {
    console.log('Saving system settings:', systemSettings);
  };

  const timezones = [
    'America/New_York',
    'America/Chicago', 
    'America/Denver',
    'America/Los_Angeles',
    'Europe/London',
    'Europe/Paris',
    'Asia/Tokyo',
    'Asia/Shanghai'
  ];

  const languagesData = [
    { code: 'en', nameKey: 'system.languages.en' },
    { code: 'es', nameKey: 'system.languages.es' },
    { code: 'fr', nameKey: 'system.languages.fr' },
    { code: 'de', nameKey: 'system.languages.de' },
    { code: 'ja', nameKey: 'system.languages.ja' },
    { code: 'ar', nameKey: 'system.languages.ar' }
  ];

  // Transform keys to actual translated text
  const languages = languagesData.map(lang => ({
    ...lang,
    name: t(lang.nameKey)
  }));

  return (
    <div className="space-y-6">
      {/* General Settings */}
      <div className="bg-card rounded-xl shadow-sm border border-border p-6">
        <div className="flex items-center space-x-3 rtl:space-x-reverse mb-4">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <Icon name="Building" size={20} className="text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">{t('system.general.title')}</h3>
            <p className="text-sm text-muted-foreground">{t('system.general.description')}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              {t('system.general.company_name')}
            </label>
            <Input
              type="text"
              value={systemSettings?.companyName}
              onChange={(e) => handleSettingChange('companyName', e?.target?.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              {t('system.general.support_email')}
            </label>
            <Input
              type="email"
              value={systemSettings?.supportEmail}
              onChange={(e) => handleSettingChange('supportEmail', e?.target?.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              {t('system.general.timezone')}
            </label>
            <select
              value={systemSettings?.timezone}
              onChange={(e) => handleSettingChange('timezone', e?.target?.value)}
              className="w-full border border-input rounded-lg px-3 py-2 bg-background text-foreground focus:ring-2 focus:ring-ring focus:border-transparent"
            >
              {timezones?.map((tz) => (
                <option key={tz} value={tz}>{tz}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              {t('system.general.language')}
            </label>
            <select
              value={systemSettings?.language}
              onChange={(e) => handleSettingChange('language', e?.target?.value)}
              className="w-full border border-input rounded-lg px-3 py-2 bg-background text-foreground focus:ring-2 focus:ring-ring focus:border-transparent"
            >
              {languages?.map((lang) => (
                <option key={lang?.code} value={lang?.code}>{lang?.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      {/* File Management */}
      <div className="bg-card rounded-xl shadow-sm border border-border p-6">
        <div className="flex items-center space-x-3 rtl:space-x-reverse mb-4">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Icon name="File" size={20} className="text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">{t('system.file_management.title')}</h3>
            <p className="text-sm text-muted-foreground">{t('system.file_management.description')}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              {t('system.file_management.max_file_size')}
            </label>
            <Input
              type="number"
              value={systemSettings?.maxFileSize}
              onChange={(e) => handleSettingChange('maxFileSize', parseInt(e?.target?.value) || 100)}
              min="1"
              max="1000"
              className="w-32"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {t('system.file_management.max_file_size_description')}
            </p>
          </div>
        </div>
      </div>
      {/* Security & Access */}
      <div className="bg-card rounded-xl shadow-sm border border-border p-6">
        <div className="flex items-center space-x-3 rtl:space-x-reverse mb-4">
          <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center">
            <Icon name="Shield" size={20} className="text-warning" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">{t('system.security_access.title')}</h3>
            <p className="text-sm text-muted-foreground">{t('system.security_access.description')}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-foreground">{t('system.security_access.maintenance_mode')}</div>
              <div className="text-xs text-muted-foreground">{t('system.security_access.maintenance_mode_description')}</div>
            </div>
            <input
              type="checkbox"
              checked={systemSettings?.maintenanceMode}
              onChange={(e) => handleSettingChange('maintenanceMode', e?.target?.checked)}
              className="rounded border-border h-4 w-4"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-foreground">{t('system.security_access.guest_access')}</div>
              <div className="text-xs text-muted-foreground">{t('system.security_access.guest_access_description')}</div>
            </div>
            <input
              type="checkbox"
              checked={systemSettings?.allowGuestAccess}
              onChange={(e) => handleSettingChange('allowGuestAccess', e?.target?.checked)}
              className="rounded border-border h-4 w-4"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              {t('system.security_access.default_session_timeout')}
            </label>
            <Input
              type="number"
              value={systemSettings?.sessionTimeout}
              onChange={(e) => handleSettingChange('sessionTimeout', parseInt(e?.target?.value) || 60)}
              min="5"
              max="480"
              className="w-32"
            />
          </div>
        </div>
      </div>
      {/* Audit & Logging */}
      <div className="bg-card rounded-xl shadow-sm border border-border p-6">
        <div className="flex items-center space-x-3 rtl:space-x-reverse mb-4">
          <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
            <Icon name="FileText" size={20} className="text-success" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">{t('system.audit_logging.title')}</h3>
            <p className="text-sm text-muted-foreground">{t('system.audit_logging.description')}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-foreground">{t('system.audit_logging.enable_audit_logs')}</div>
              <div className="text-xs text-muted-foreground">{t('system.audit_logging.enable_audit_logs_description')}</div>
            </div>
            <input
              type="checkbox"
              checked={systemSettings?.enableAuditLogs}
              onChange={(e) => handleSettingChange('enableAuditLogs', e?.target?.checked)}
              className="rounded border-border h-4 w-4"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              {t('system.audit_logging.log_retention')}
            </label>
            <Input
              type="number"
              value={systemSettings?.logRetentionDays}
              onChange={(e) => handleSettingChange('logRetentionDays', parseInt(e?.target?.value) || 90)}
              min="7"
              max="365"
              className="w-32"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {t('system.audit_logging.log_retention_description')}
            </p>
          </div>
        </div>
      </div>
      {/* System Status */}
      <div className="bg-card rounded-xl shadow-sm border border-border p-6">
        <div className="flex items-center space-x-3 rtl:space-x-reverse mb-4">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <Icon name="Activity" size={20} className="text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">{t('system.system_status.title')}</h3>
            <p className="text-sm text-muted-foreground">{t('system.system_status.description')}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('system.system_status.system_version')}:</span>
              <span className="text-foreground">{t('sample_data.system_info.version')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('system.system_status.database_status')}:</span>
              <span className="text-success">{t('system.system_status.healthy')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('system.system_status.storage_usage')}:</span>
              <span className="text-foreground">{t('sample_data.system_info.storage')}</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('system.system_status.active_users')}:</span>
              <span className="text-foreground">{t('sample_data.system_info.active_users_count')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('system.system_status.total_documents')}:</span>
              <span className="text-foreground">{t('sample_data.system_info.total_documents_count')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('system.system_status.last_backup')}:</span>
              <span className="text-foreground">{t('sample_data.system_info.last_backup_time')}</span>
            </div>
          </div>
        </div>
      </div>
      {/* Save Button */}
      <div className="flex items-center justify-end space-x-3 rtl:space-x-reverse pt-6 border-t border-border">
        <Button variant="outline">
          {t('actions.reset_to_defaults')}
        </Button>
        <Button onClick={handleSave} variant="default" iconName="Save">
          {t('actions.save_changes')}
        </Button>
      </div>
    </div>
  );
};

export default SystemSettings;
