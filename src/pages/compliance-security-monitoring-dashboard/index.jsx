import React, { useState, useEffect } from 'react';
import Header from '../../components/ui/Header';
import SecurityScoreCard from './components/SecurityScoreCard';
import CompliancePeriodSelector from './components/CompliancePeriodSelector';
import SecurityTimeline from './components/SecurityTimeline';
import CompliancePanel from './components/CompliancePanel';
import AuditTable from './components/AuditTable';
import SecurityAlerts from './components/SecurityAlerts';

const ComplianceSecurityMonitoringDashboard = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('last_30_days');
  const [selectedFramework, setSelectedFramework] = useState('all');
  const [securityLevel, setSecurityLevel] = useState('all');
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdated(new Date());
    }, 300000); // Update every 5 minutes

    return () => clearInterval(interval);
  }, []);

  const securityMetrics = [
    {
      title: 'Overall Security Score',
      value: '94/100',
      change: '+2.3%',
      changeType: 'increase',
      icon: 'Shield',
      color: 'success',
      description: 'Comprehensive security posture rating'
    },
    {
      title: 'Active Compliance Violations',
      value: '3',
      change: '-2',
      changeType: 'decrease',
      icon: 'AlertTriangle',
      color: 'warning',
      description: 'Current regulatory compliance issues'
    },
    {
      title: 'Audit Trail Completeness',
      value: '99.8%',
      change: '+0.1%',
      changeType: 'increase',
      icon: 'FileText',
      color: 'success',
      description: 'Percentage of logged activities'
    },
    {
      title: 'Access Anomaly Count',
      value: '7',
      change: '+3',
      changeType: 'increase',
      icon: 'Zap',
      color: 'error',
      description: 'Unusual access patterns detected'
    }
  ];

  const formatLastUpdated = (date) => {
    return date?.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Header Section */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
            <div className="mb-4 lg:mb-0">
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Compliance & Security Monitoring
              </h1>
              <p className="text-muted-foreground">
                Comprehensive security metrics, audit trails, and regulatory compliance tracking
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Last updated: {formatLastUpdated(lastUpdated)}
              </p>
            </div>
            
            <CompliancePeriodSelector
              selectedPeriod={selectedPeriod}
              onPeriodChange={setSelectedPeriod}
              selectedFramework={selectedFramework}
              onFrameworkChange={setSelectedFramework}
              securityLevel={securityLevel}
              onSecurityLevelChange={setSecurityLevel}
            />
          </div>

          {/* Security Scorecard */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {securityMetrics?.map((metric, index) => (
              <SecurityScoreCard
                key={index}
                title={metric?.title}
                value={metric?.value}
                change={metric?.change}
                changeType={metric?.changeType}
                icon={metric?.icon}
                color={metric?.color}
                description={metric?.description}
              />
            ))}
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
            {/* Security Timeline - 8 columns */}
            <div className="lg:col-span-8">
              <SecurityTimeline />
            </div>
            
            {/* Compliance Panel - 4 columns */}
            <div className="lg:col-span-4">
              <CompliancePanel />
            </div>
          </div>

          {/* Security Alerts Section */}
          <div className="mb-8">
            <SecurityAlerts />
          </div>

          {/* Comprehensive Audit Table */}
          <div>
            <AuditTable />
          </div>
        </div>
      </main>
    </div>
  );
};

export default ComplianceSecurityMonitoringDashboard;