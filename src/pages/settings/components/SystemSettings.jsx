import React, { useState } from 'react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Icon from '../../../components/AppIcon';

const SystemSettings = () => {
  const [systemSettings, setSystemSettings] = useState({
    companyName: 'VDR Analytics Corp',
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

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'ja', name: 'Japanese' }
  ];

  return (
    <div className="space-y-6">
      {/* General Settings */}
      <div className="bg-card rounded-xl shadow-sm border border-border p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <Icon name="Building" size={20} className="text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">General Settings</h3>
            <p className="text-sm text-muted-foreground">Basic system configuration</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Company Name
            </label>
            <Input
              type="text"
              value={systemSettings?.companyName}
              onChange={(e) => handleSettingChange('companyName', e?.target?.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Support Email
            </label>
            <Input
              type="email"
              value={systemSettings?.supportEmail}
              onChange={(e) => handleSettingChange('supportEmail', e?.target?.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Timezone
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
              Language
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
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Icon name="File" size={20} className="text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">File Management</h3>
            <p className="text-sm text-muted-foreground">File upload and storage settings</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Maximum File Size (MB)
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
              Maximum file size for uploads
            </p>
          </div>
        </div>
      </div>
      {/* Security & Access */}
      <div className="bg-card rounded-xl shadow-sm border border-border p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center">
            <Icon name="Shield" size={20} className="text-warning" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Security & Access</h3>
            <p className="text-sm text-muted-foreground">Access control and security settings</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-foreground">Maintenance Mode</div>
              <div className="text-xs text-muted-foreground">Temporarily disable user access</div>
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
              <div className="text-sm font-medium text-foreground">Allow Guest Access</div>
              <div className="text-xs text-muted-foreground">Enable limited access without login</div>
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
              Default Session Timeout (minutes)
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
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
            <Icon name="FileText" size={20} className="text-success" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Audit & Logging</h3>
            <p className="text-sm text-muted-foreground">System logging and audit trail settings</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-foreground">Enable Audit Logs</div>
              <div className="text-xs text-muted-foreground">Log user activities and system events</div>
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
              Log Retention (days)
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
              How long to keep audit logs
            </p>
          </div>
        </div>
      </div>
      {/* System Status */}
      <div className="bg-card rounded-xl shadow-sm border border-border p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <Icon name="Activity" size={20} className="text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">System Status</h3>
            <p className="text-sm text-muted-foreground">Current system information</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">System Version:</span>
              <span className="text-foreground">v2.1.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Database Status:</span>
              <span className="text-success">✓ Healthy</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Storage Usage:</span>
              <span className="text-foreground">2.1 GB / 100 GB</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Active Users:</span>
              <span className="text-foreground">5</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Documents:</span>
              <span className="text-foreground">245</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Last Backup:</span>
              <span className="text-foreground">2 hours ago</span>
            </div>
          </div>
        </div>
      </div>
      {/* Save Button */}
      <div className="flex items-center justify-end space-x-3 pt-6 border-t border-border">
        <Button variant="outline">
          Reset to Defaults
        </Button>
        <Button onClick={handleSave} variant="default" iconName="Save">
          Save Changes
        </Button>
      </div>
    </div>
  );
};

export default SystemSettings;