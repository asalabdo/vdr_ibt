import React, { useState } from 'react';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const NotificationSettings = () => {
  const [settings, setSettings] = useState({
    emailNotifications: {
      newQuestions: true,
      documentUploads: true,
      systemAlerts: true,
      weeklyDigest: false,
      loginAlerts: true
    },
    pushNotifications: {
      newQuestions: false,
      documentUploads: false,
      systemAlerts: true,
      urgentAlerts: true
    },
    frequency: 'immediate'
  });

  const handleSettingChange = (category, setting, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev?.[category],
        [setting]: value
      }
    }));
  };

  const handleSave = () => {
    console.log('Saving notification settings:', settings);
  };

  const notificationTypes = [
    {
      category: 'emailNotifications',
      title: 'Email Notifications',
      description: 'Receive notifications via email',
      icon: 'Mail',
      options: [
        { key: 'newQuestions', label: 'New Questions', description: 'When new questions are posted' },
        { key: 'documentUploads', label: 'Document Uploads', description: 'When documents are uploaded' },
        { key: 'systemAlerts', label: 'System Alerts', description: 'Important system notifications' },
        { key: 'weeklyDigest', label: 'Weekly Digest', description: 'Weekly summary of activities' },
        { key: 'loginAlerts', label: 'Login Alerts', description: 'Security-related login notifications' }
      ]
    },
    {
      category: 'pushNotifications',
      title: 'Push Notifications',
      description: 'Browser and mobile push notifications',
      icon: 'Smartphone',
      options: [
        { key: 'newQuestions', label: 'New Questions', description: 'Instant alerts for new questions' },
        { key: 'documentUploads', label: 'Document Uploads', description: 'When documents are uploaded' },
        { key: 'systemAlerts', label: 'System Alerts', description: 'Critical system notifications' },
        { key: 'urgentAlerts', label: 'Urgent Alerts', description: 'High-priority alerts only' }
      ]
    }
  ];

  return (
    <div className="space-y-6">
      {/* Notification Categories */}
      {notificationTypes?.map((category) => (
        <div key={category?.category} className="bg-card rounded-xl shadow-sm border border-border p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Icon name={category?.icon} size={20} className="text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">{category?.title}</h3>
              <p className="text-sm text-muted-foreground">{category?.description}</p>
            </div>
          </div>

          <div className="space-y-4">
            {category?.options?.map((option) => (
              <div key={option?.key} className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-foreground">{option?.label}</div>
                  <div className="text-xs text-muted-foreground">{option?.description}</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings?.[category?.category]?.[option?.key] || false}
                  onChange={(e) => handleSettingChange(category?.category, option?.key, e?.target?.checked)}
                  className="rounded border-border h-4 w-4"
                />
              </div>
            ))}
          </div>
        </div>
      ))}
      {/* Notification Frequency */}
      <div className="bg-card rounded-xl shadow-sm border border-border p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center">
            <Icon name="Clock" size={20} className="text-warning" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Notification Frequency</h3>
            <p className="text-sm text-muted-foreground">How often you receive notifications</p>
          </div>
        </div>

        <div className="space-y-3">
          {[
            { value: 'immediate', label: 'Immediate', description: 'Receive notifications as they happen' },
            { value: 'hourly', label: 'Hourly Digest', description: 'Bundled notifications every hour' },
            { value: 'daily', label: 'Daily Digest', description: 'Summary of notifications once per day' },
            { value: 'weekly', label: 'Weekly Digest', description: 'Weekly summary of all notifications' }
          ]?.map((option) => (
            <div key={option?.value} className="flex items-center space-x-3">
              <input
                type="radio"
                name="frequency"
                value={option?.value}
                checked={settings?.frequency === option?.value}
                onChange={(e) => setSettings(prev => ({ ...prev, frequency: e?.target?.value }))}
                className="rounded-full border-border"
              />
              <div>
                <div className="text-sm font-medium text-foreground">{option?.label}</div>
                <div className="text-xs text-muted-foreground">{option?.description}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Save Button */}
      <div className="flex items-center justify-end space-x-3 pt-6 border-t border-border">
        <Button onClick={handleSave} variant="default" iconName="Save">
          Save Changes
        </Button>
      </div>
    </div>
  );
};

export default NotificationSettings;