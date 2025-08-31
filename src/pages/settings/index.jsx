import React, { useState } from 'react';
import Header from '../../components/ui/Header';
import Button from '../../components/ui/Button';

import Icon from '../../components/AppIcon';
import NotificationSettings from './components/NotificationSettings';
import SecuritySettings from './components/SecuritySettings';
import SystemSettings from './components/SystemSettings';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('notifications');

  const settingsTabs = [
    {
      id: 'notifications',
      label: 'Notifications',
      icon: 'Bell',
      description: 'Email and system notification preferences'
    },
    {
      id: 'security',
      label: 'Security',
      icon: 'Shield',
      description: 'Password, authentication, and security settings'
    },
    {
      id: 'system',
      label: 'System',
      icon: 'Settings',
      description: 'General system configuration and preferences'
    },
    {
      id: 'data',
      label: 'Data & Privacy',
      icon: 'Database',
      description: 'Data retention, backup, and privacy settings'
    },
    {
      id: 'integration',
      label: 'Integrations',
      icon: 'Link',
      description: 'Third-party integrations and API settings'
    }
  ];

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
            <h1 className="text-3xl font-bold text-foreground mb-2">Settings</h1>
            <p className="text-muted-foreground">
              Manage your account and system preferences
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
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
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
const DataPrivacySettings = () => (
  <div className="bg-card rounded-xl shadow-sm border border-border p-6">
    <h2 className="text-xl font-semibold text-foreground mb-4">Data & Privacy Settings</h2>
    <p className="text-muted-foreground">Data retention, backup, and privacy configuration options.</p>
    <div className="mt-6">
      <Button variant="outline">Configure Data Settings</Button>
    </div>
  </div>
);

const IntegrationSettings = () => (
  <div className="bg-card rounded-xl shadow-sm border border-border p-6">
    <h2 className="text-xl font-semibold text-foreground mb-4">Integration Settings</h2>
    <p className="text-muted-foreground">Manage third-party integrations and API configurations.</p>
    <div className="mt-6">
      <Button variant="outline">Manage Integrations</Button>
    </div>
  </div>
);

export default Settings;