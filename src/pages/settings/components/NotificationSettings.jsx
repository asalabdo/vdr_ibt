import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import Icon from '../../../components/AppIcon';

const NotificationSettings = () => {
  const { t } = useTranslation('settings');
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

  const notificationTypesData = [
    {
      category: 'emailNotifications',
      titleKey: 'notifications.email_notifications.title',
      descriptionKey: 'notifications.email_notifications.description',
      icon: 'Mail',
      options: [
        { key: 'newQuestions', labelKey: 'notifications.email_notifications.options.new_questions.label', descriptionKey: 'notifications.email_notifications.options.new_questions.description' },
        { key: 'documentUploads', labelKey: 'notifications.email_notifications.options.document_uploads.label', descriptionKey: 'notifications.email_notifications.options.document_uploads.description' },
        { key: 'systemAlerts', labelKey: 'notifications.email_notifications.options.system_alerts.label', descriptionKey: 'notifications.email_notifications.options.system_alerts.description' },
        { key: 'weeklyDigest', labelKey: 'notifications.email_notifications.options.weekly_digest.label', descriptionKey: 'notifications.email_notifications.options.weekly_digest.description' },
        { key: 'loginAlerts', labelKey: 'notifications.email_notifications.options.login_alerts.label', descriptionKey: 'notifications.email_notifications.options.login_alerts.description' }
      ]
    },
    {
      category: 'pushNotifications',
      titleKey: 'notifications.push_notifications.title',
      descriptionKey: 'notifications.push_notifications.description',
      icon: 'Smartphone',
      options: [
        { key: 'newQuestions', labelKey: 'notifications.push_notifications.options.new_questions.label', descriptionKey: 'notifications.push_notifications.options.new_questions.description' },
        { key: 'documentUploads', labelKey: 'notifications.push_notifications.options.document_uploads.label', descriptionKey: 'notifications.push_notifications.options.document_uploads.description' },
        { key: 'systemAlerts', labelKey: 'notifications.push_notifications.options.system_alerts.label', descriptionKey: 'notifications.push_notifications.options.system_alerts.description' },
        { key: 'urgentAlerts', labelKey: 'notifications.push_notifications.options.urgent_alerts.label', descriptionKey: 'notifications.push_notifications.options.urgent_alerts.description' }
      ]
    }
  ];

  // Transform keys to actual translated text
  const notificationTypes = notificationTypesData.map(typeData => ({
    ...typeData,
    title: t(typeData.titleKey),
    description: t(typeData.descriptionKey),
    options: typeData.options.map(option => ({
      ...option,
      label: t(option.labelKey),
      description: t(option.descriptionKey)
    }))
  }));

  return (
    <div className="space-y-6">
      {/* Notification Categories */}
      {notificationTypes?.map((category) => (
        <div key={category?.category} className="bg-card rounded-xl shadow-sm border border-border p-6">
          <div className="flex items-center space-x-3 rtl:space-x-reverse mb-4">
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
        <div className="flex items-center space-x-3 rtl:space-x-reverse mb-4">
          <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center">
            <Icon name="Clock" size={20} className="text-warning" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">{t('notifications.frequency.title')}</h3>
            <p className="text-sm text-muted-foreground">{t('notifications.frequency.description')}</p>
          </div>
        </div>

        <div className="space-y-3">
          {[
            { value: 'immediate', labelKey: 'notifications.frequency.options.immediate.label', descriptionKey: 'notifications.frequency.options.immediate.description' },
            { value: 'hourly', labelKey: 'notifications.frequency.options.hourly.label', descriptionKey: 'notifications.frequency.options.hourly.description' },
            { value: 'daily', labelKey: 'notifications.frequency.options.daily.label', descriptionKey: 'notifications.frequency.options.daily.description' },
            { value: 'weekly', labelKey: 'notifications.frequency.options.weekly.label', descriptionKey: 'notifications.frequency.options.weekly.description' }
          ]?.map((option) => (
            <div key={option?.value} className="flex items-center space-x-3 rtl:space-x-reverse">
              <input
                type="radio"
                name="frequency"
                value={option?.value}
                checked={settings?.frequency === option?.value}
                onChange={(e) => setSettings(prev => ({ ...prev, frequency: e?.target?.value }))}
                className="rounded-full border-border"
              />
              <div>
                <div className="text-sm font-medium text-foreground">{t(option?.labelKey)}</div>
                <div className="text-xs text-muted-foreground">{t(option?.descriptionKey)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Save Button */}
      <div className="flex items-center justify-end space-x-3 rtl:space-x-reverse pt-6 border-t border-border">
        <Button onClick={handleSave} variant="default" className="gap-2">
          <Icon name="Save" size={16} />
          {t('actions.save_changes')}
        </Button>
      </div>
    </div>
  );
};

export default NotificationSettings;
