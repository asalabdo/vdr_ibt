import React, { useState, useEffect } from 'react';
import Header from '../../components/ui/Header';
import ControlBar from './components/ControlBar';
import MetricCard from './components/MetricCard';
import AlertFeed from './components/AlertFeed';
import UserActivityHeatmap from './components/UserActivityHeatmap';
import SystemPerformanceChart from './components/SystemPerformanceChart';
import ActiveDataRoomsGrid from './components/ActiveDataRoomsGrid';
import RecentUserSessions from './components/RecentUserSessions';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';



const VDROperationsCommandCenter = () => {
  const [selectedEnvironment, setSelectedEnvironment] = useState('production');
  const [refreshInterval, setRefreshInterval] = useState('30');
  const [connectionStatus, setConnectionStatus] = useState('connected');
  const [activeTab, setActiveTab] = useState('heatmap');
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // Mock system metrics data
  const systemMetrics = [
    {
      title: 'System Uptime',
      value: '99.8',
      unit: '%',
      change: 0.2,
      changeType: 'positive',
      icon: 'Server',
      status: 'success',
      sparklineData: [99.5, 99.6, 99.7, 99.8, 99.9, 99.8, 99.8]
    },
    {
      title: 'Active Users',
      value: '247',
      unit: '',
      change: 12,
      changeType: 'positive',
      icon: 'Users',
      status: 'success',
      sparklineData: [220, 235, 240, 245, 250, 247, 247]
    },
    {
      title: 'Storage Used',
      value: '68.4',
      unit: '%',
      change: 3.2,
      changeType: 'positive',
      icon: 'HardDrive',
      status: 'warning',
      sparklineData: [65, 66, 67, 68, 69, 68.5, 68.4]
    },
    {
      title: 'Avg Response',
      value: '145',
      unit: 'ms',
      change: 8,
      changeType: 'negative',
      icon: 'Zap',
      status: 'success',
      sparklineData: [120, 130, 135, 140, 150, 148, 145]
    },
    {
      title: 'Security Incidents',
      value: '0',
      unit: '',
      change: 0,
      changeType: 'stable',
      icon: 'Shield',
      status: 'success',
      sparklineData: [0, 0, 1, 0, 0, 0, 0]
    },
    {
      title: 'Q&A Resolution',
      value: '94.2',
      unit: '%',
      change: 2.1,
      changeType: 'positive',
      icon: 'MessageSquare',
      status: 'success',
      sparklineData: [90, 91, 92, 93, 94, 94.5, 94.2]
    }
  ];

  // Mock alerts data
  const systemAlerts = [
    {
      id: 'alert-001',
      title: 'High Storage Usage Warning',
      message: 'Storage utilization has reached 68.4% on primary server cluster. Consider archiving older documents or expanding storage capacity.',
      severity: 'warning',
      timestamp: new Date(Date.now() - 300000),
      source: 'Storage Monitor',
      actions: [
        { label: 'View Details', onClick: () => {} },
        { label: 'Archive Old Files', onClick: () => {} }
      ]
    },
    {
      id: 'alert-002',
      title: 'User Session Anomaly Detected',
      message: 'Unusual login pattern detected for user john.doe@company.com from multiple geographic locations within 30 minutes.',
      severity: 'critical',
      timestamp: new Date(Date.now() - 600000),
      source: 'Security Monitor',
      actions: [
        { label: 'Investigate', onClick: () => {} },
        { label: 'Block User', onClick: () => {} }
      ]
    },
    {
      id: 'alert-003',
      title: 'Backup Completed Successfully',
      message: 'Daily backup process completed successfully. All data rooms backed up to secondary storage.',
      severity: 'info',
      timestamp: new Date(Date.now() - 1800000),
      source: 'Backup Service'
    },
    {
      id: 'alert-004',
      title: 'API Rate Limit Approaching',
      message: 'Document API rate limit at 85% for TechCorp Acquisition data room. Consider optimizing client requests.',
      severity: 'warning',
      timestamp: new Date(Date.now() - 2400000),
      source: 'API Gateway'
    }
  ];

  // Auto-refresh functionality
  useEffect(() => {
    const interval = setInterval(() => {
      setLastRefresh(new Date());
      // Simulate connection status changes
      const statuses = ['connected', 'connecting', 'disconnected'];
      const randomStatus = statuses?.[Math.floor(Math.random() * statuses?.length)];
      if (Math.random() > 0.9) { // 10% chance to change status
        setConnectionStatus(randomStatus);
      }
    }, parseInt(refreshInterval) * 1000);

    return () => clearInterval(interval);
  }, [refreshInterval]);

  const handleGlobalSearch = (query) => {
    console.log('Global search:', query);
    // Implement global search functionality
  };

  const handleMetricClick = (metric) => {
    console.log('Metric clicked:', metric);
    // Implement drill-down functionality
  };

  const tabOptions = [
    { key: 'heatmap', label: 'User Activity', icon: 'Activity' },
    { key: 'performance', label: 'System Performance', icon: 'TrendingUp' },
    { key: 'documents', label: 'Document Access', icon: 'FileText' }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="pt-7">
        {/* Control Bar */}
        <ControlBar
          selectedEnvironment={selectedEnvironment}
          onEnvironmentChange={setSelectedEnvironment}
          refreshInterval={refreshInterval}
          onRefreshIntervalChange={setRefreshInterval}
          onGlobalSearch={handleGlobalSearch}
          connectionStatus={connectionStatus}
        />

        <div className="p-6 space-y-6">
          {/* System Metrics Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {systemMetrics?.map((metric, index) => (
              <MetricCard
                key={index}
                {...metric}
                onClick={() => handleMetricClick(metric)}
              />
            ))}
          </div>

          {/* Main Content Area */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Main Monitoring Panel */}
            <div className="xl:col-span-2 space-y-6">
              {/* Tabbed Interface */}
              <div className="bg-card border border-border rounded-lg">
                {/* Tab Headers */}
                <div className="border-b border-border p-4">
                  <div className="flex space-x-1">
                    {tabOptions?.map(tab => (
                      <button
                        key={tab?.key}
                        onClick={() => setActiveTab(tab?.key)}
                        className={`
                          flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium
                          transition-colors duration-200
                          ${activeTab === tab?.key
                            ? 'bg-primary text-primary-foreground'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                          }
                        `}
                      >
                        <Icon name={tab?.icon} size={16} />
                        <span>{tab?.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tab Content */}
                <div className="p-4 h-96">
                  {activeTab === 'heatmap' && <UserActivityHeatmap />}
                  {activeTab === 'performance' && <SystemPerformanceChart />}
                  {activeTab === 'documents' && (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      <div className="text-center">
                        <Icon name="FileText" size={48} className="mx-auto mb-4 opacity-50" />
                        <p className="text-lg font-medium mb-2">Document Access Patterns</p>
                        <p className="text-sm">Real-time document access analytics coming soon</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Active Data Rooms Grid */}
              <ActiveDataRoomsGrid />
            </div>

            {/* Right Sidebar */}
            <div className="space-y-6">
              {/* Alert Feed */}
              <div className="h-96">
                <AlertFeed alerts={systemAlerts} />
              </div>

              {/* Recent User Sessions */}
              <div className="h-96">
                <RecentUserSessions />
              </div>

              {/* Quick Actions */}
              <div className="bg-card border border-border rounded-lg p-4">
                <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  <Button variant="outline" fullWidth iconName="Plus" iconPosition="left">
                    Create New Data Room
                  </Button>
                  <Button variant="outline" fullWidth iconName="UserPlus" iconPosition="left">
                    Invite Users
                  </Button>
                  <Button variant="outline" fullWidth iconName="Download" iconPosition="left">
                    Export System Report
                  </Button>
                  <Button variant="outline" fullWidth iconName="Settings" iconPosition="left">
                    System Configuration
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Status Footer */}
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <div className="flex items-center space-x-4">
                <span>Last updated: {lastRefresh?.toLocaleTimeString()}</span>
                <span>•</span>
                <span>Environment: {selectedEnvironment}</span>
                <span>•</span>
                <span>Refresh: Every {refreshInterval}s</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${
                  connectionStatus === 'connected' ? 'bg-success' :
                  connectionStatus === 'connecting' ? 'bg-warning' : 'bg-error'
                } ${connectionStatus === 'connecting' ? 'animate-pulse-subtle' : ''}`}></div>
                <span className="capitalize">{connectionStatus}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VDROperationsCommandCenter;