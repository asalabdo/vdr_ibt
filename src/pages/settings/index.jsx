import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Header from '../../components/ui/Header';
import { Button } from '@/components/ui/Button';
import Icon from '../../components/AppIcon';
import NotificationSettings from './components/NotificationSettings';
import SecuritySettings from './components/SecuritySettings';
import SystemSettings from './components/SystemSettings';

const Settings = () => {
  const { t } = useTranslation('settings');
  const [activeTab, setActiveTab] = useState('notifications');

  const settingsTabsData = [
    {
      id: 'notifications',
      labelKey: 'tabs.notifications.label',
      icon: 'Bell',
      descriptionKey: 'tabs.notifications.description'
    },
    {
      id: 'security',
      labelKey: 'tabs.security.label',
      icon: 'Shield',
      descriptionKey: 'tabs.security.description'
    },
    {
      id: 'system',
      labelKey: 'tabs.system.label',
      icon: 'Settings',
      descriptionKey: 'tabs.system.description'
    },
    {
      id: 'data',
      labelKey: 'tabs.data.label',
      icon: 'Database',
      descriptionKey: 'tabs.data.description'
    },
    {
      id: 'integration',
      labelKey: 'tabs.integration.label',
      icon: 'Link',
      descriptionKey: 'tabs.integration.description'
    }
  ];

  // Transform keys to actual translated text
  const settingsTabs = settingsTabsData.map(tabData => ({
    ...tabData,
    label: t(tabData.labelKey),
    description: t(tabData.descriptionKey)
  }));

  const renderTabContent = () => {
    switch (activeTab) {
      case 'notifications':
        return <NotificationSettings />;
      case 'security':
        return <SecuritySettings />;
      case 'system':
        return <SystemSettings />;
      case 'data':
        return <DataPrivacySettings />;
      case 'integration':
        return <IntegrationSettings />;
      default:
        return <NotificationSettings />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-4">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {t('title')}
            </h1>
            <p className="text-muted-foreground">
              {t('subtitle')}
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-6">
            {/* Sidebar Navigation */}
            <div className="lg:w-64">
              <nav className="space-y-1">
                {settingsTabs?.map((tab) => (
                  <button
                    key={tab?.id}
                    onClick={() => setActiveTab(tab?.id)}
                    className={`w-full flex items-center space-x-3 rtl:space-x-reverse px-3 py-2 rounded-lg text-left rtl:text-right transition-colors ${
                      activeTab === tab?.id
                        ? 'bg-primary/10 text-primary border border-primary/20' :'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                    }`}
                  >
                    <Icon name={tab?.icon} size={20} />
                    <div>
                      <div className="font-medium">{tab?.label}</div>
                      <div className="text-xs opacity-70">{tab?.description}</div>
                    </div>
                  </button>
                ))}
              </nav>
            </div>

            {/* Content Area */}
            <div className="flex-1">
              {renderTabContent()}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

// Placeholder components for other settings tabs
const DataPrivacySettings = () => {
  const { t } = useTranslation('settings');
  return (
    <div className="bg-card rounded-xl shadow-sm border border-border p-6">
      <h2 className="text-xl font-semibold text-foreground mb-4">{t('data_privacy.title')}</h2>
      <p className="text-muted-foreground">{t('data_privacy.description')}</p>
      <div className="mt-6">
        <Button variant="outline">{t('actions.configure_data_settings')}</Button>
      </div>
    </div>
  );
};

const IntegrationSettings = () => {
  const { t } = useTranslation('settings');
  return (
    <div className="bg-card rounded-xl shadow-sm border border-border p-6">
      <h2 className="text-xl font-semibold text-foreground mb-4">{t('integrations.title')}</h2>
      <p className="text-muted-foreground">{t('integrations.description')}</p>
      <div className="mt-6">
        <Button variant="outline">{t('actions.manage_integrations')}</Button>
      </div>
    </div>
  );
};

export default Settings;
