import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import Icon from '../../../components/AppIcon';

const SegmentedAnalytics = () => {
  const [activeTab, setActiveTab] = useState('documents');

  const documentAnalytics = {
    accessFrequency: [
      { name: 'Financial Statements', accesses: 1247, unique_users: 89, avg_time: 12.4 },
      { name: 'Legal Documents', accesses: 892, unique_users: 67, avg_time: 18.7 },
      { name: 'Technical Specs', accesses: 634, unique_users: 45, avg_time: 8.9 },
      { name: 'Market Analysis', accesses: 567, unique_users: 78, avg_time: 15.2 },
      { name: 'Due Diligence', accesses: 445, unique_users: 34, avg_time: 22.1 },
      { name: 'Compliance Reports', accesses: 334, unique_users: 23, avg_time: 9.8 }
    ],
    storageUtilization: [
      { category: 'Financial', value: 35, size: '2.4 GB', color: '#1e40af' },
      { category: 'Legal', value: 28, size: '1.9 GB', color: '#059669' },
      { category: 'Technical', value: 18, size: '1.2 GB', color: '#d97706' },
      { category: 'Marketing', value: 12, size: '0.8 GB', color: '#dc2626' },
      { category: 'Other', value: 7, size: '0.5 GB', color: '#6b7280' }
    ],
    versionControl: [
      { document: 'Merger Agreement', versions: 12, last_updated: '2 hours ago', status: 'active' },
      { document: 'Financial Model', versions: 8, last_updated: '5 hours ago', status: 'review' },
      { document: 'Legal Opinion', versions: 15, last_updated: '1 day ago', status: 'final' },
      { document: 'Market Research', versions: 6, last_updated: '3 days ago', status: 'active' }
    ]
  };

  const userBehaviorData = {
    sessionPatterns: [
      { time: '00:00', sessions: 12, duration: 45 },
      { time: '04:00', sessions: 8, duration: 38 },
      { time: '08:00', sessions: 89, duration: 67 },
      { time: '12:00', sessions: 156, duration: 78 },
      { time: '16:00', sessions: 134, duration: 82 },
      { time: '20:00', sessions: 67, duration: 56 }
    ],
    userTypes: [
      { type: 'Buyers', count: 45, engagement: 87, color: '#1e40af' },
      { type: 'Sellers', count: 23, engagement: 92, color: '#059669' },
      { type: 'Advisors', count: 34, engagement: 78, color: '#d97706' },
      { type: 'Legal', count: 18, engagement: 85, color: '#dc2626' },
      { type: 'Finance', count: 29, engagement: 90, color: '#7c3aed' }
    ],
    activityFlow: [
      { step: 'Login', users: 149, conversion: 100 },
      { step: 'Browse Documents', users: 142, conversion: 95.3 },
      { step: 'Download Files', users: 118, conversion: 79.2 },
      { step: 'Submit Q&A', users: 89, conversion: 59.7 },
      { step: 'Complete Review', users: 67, conversion: 45.0 }
    ]
  };

  const complianceMetrics = {
    auditTrail: [
      { action: 'Document Access', count: 2847, compliance: 98.5, risk: 'low' },
      { action: 'User Authentication', count: 1923, compliance: 99.2, risk: 'low' },
      { action: 'Data Export', count: 456, compliance: 94.7, risk: 'medium' },
      { action: 'Permission Changes', count: 234, compliance: 97.8, risk: 'low' },
      { action: 'System Access', count: 189, compliance: 91.5, risk: 'high' }
    ],
    securityScore: {
      overall: 94.2,
      categories: [
        { name: 'Access Control', score: 96.8, trend: 'up' },
        { name: 'Data Encryption', score: 98.5, trend: 'stable' },
        { name: 'Audit Logging', score: 92.1, trend: 'up' },
        { name: 'User Management', score: 89.7, trend: 'down' },
        { name: 'Compliance Checks', score: 95.3, trend: 'up' }
      ]
    },
    regulatoryAdherence: [
      { regulation: 'GDPR', status: 'compliant', score: 96.2, last_audit: '15 days ago' },
      { regulation: 'SOX', status: 'compliant', score: 94.8, last_audit: '22 days ago' },
      { regulation: 'HIPAA', status: 'review', score: 87.3, last_audit: '45 days ago' },
      { regulation: 'PCI DSS', status: 'compliant', score: 92.1, last_audit: '8 days ago' }
    ]
  };

  const tabs = [
    { id: 'documents', label: 'Document Analytics', icon: 'FileText' },
    { id: 'behavior', label: 'User Behavior', icon: 'Users' },
    { id: 'compliance', label: 'Compliance Metrics', icon: 'Shield' }
  ];

  const renderDocumentAnalytics = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Access Frequency Chart */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h4 className="text-lg font-semibold text-foreground mb-4">Document Access Frequency</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={documentAnalytics?.accessFrequency}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="name" stroke="var(--color-muted-foreground)" fontSize={12} angle={-45} textAnchor="end" height={80} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--color-popover)', 
                    border: '1px solid var(--color-border)',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="accesses" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Storage Utilization */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h4 className="text-lg font-semibold text-foreground mb-4">Storage Utilization</h4>
          <div className="h-64 flex items-center">
            <div className="w-1/2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={documentAnalytics?.storageUtilization}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    dataKey="value"
                  >
                    {documentAnalytics?.storageUtilization?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry?.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-1/2 space-y-2">
              {documentAnalytics?.storageUtilization?.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item?.color }}></div>
                    <span className="text-sm text-foreground">{item?.category}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-foreground">{item?.value}%</div>
                    <div className="text-xs text-muted-foreground">{item?.size}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Version Control Table */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h4 className="text-lg font-semibold text-foreground mb-4">Version Control Activity</h4>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Document</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Versions</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Last Updated</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {documentAnalytics?.versionControl?.map((doc, index) => (
                <tr key={index} className="border-b border-border/50">
                  <td className="py-3 px-4 text-foreground">{doc?.document}</td>
                  <td className="py-3 px-4 text-foreground">{doc?.versions}</td>
                  <td className="py-3 px-4 text-muted-foreground">{doc?.last_updated}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      doc?.status === 'active' ? 'bg-success/20 text-success' :
                      doc?.status === 'review'? 'bg-warning/20 text-warning' : 'bg-primary/20 text-primary'
                    }`}>
                      {doc?.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderUserBehavior = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Session Patterns */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h4 className="text-lg font-semibold text-foreground mb-4">Session Patterns</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={userBehaviorData?.sessionPatterns}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="time" stroke="var(--color-muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--color-popover)', 
                    border: '1px solid var(--color-border)',
                    borderRadius: '8px'
                  }}
                />
                <Line type="monotone" dataKey="sessions" stroke="var(--color-primary)" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* User Types */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h4 className="text-lg font-semibold text-foreground mb-4">User Type Distribution</h4>
          <div className="space-y-4">
            {userBehaviorData?.userTypes?.map((type, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted/10 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: type?.color }}></div>
                  <span className="font-medium text-foreground">{type?.type}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-foreground">{type?.count} users</div>
                  <div className="text-xs text-muted-foreground">{type?.engagement}% engagement</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Activity Flow */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h4 className="text-lg font-semibold text-foreground mb-4">User Activity Flow</h4>
        <div className="space-y-4">
          {userBehaviorData?.activityFlow?.map((step, index) => (
            <div key={index} className="flex items-center space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-medium">
                {index + 1}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-foreground">{step?.step}</span>
                  <span className="text-sm text-muted-foreground">{step?.users} users ({step?.conversion}%)</span>
                </div>
                <div className="w-full bg-muted/20 rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-500"
                    style={{ width: `${step?.conversion}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderComplianceMetrics = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Security Score */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h4 className="text-lg font-semibold text-foreground mb-4">Security Score</h4>
          <div className="text-center mb-6">
            <div className="text-4xl font-bold text-primary mb-2">{complianceMetrics?.securityScore?.overall}</div>
            <div className="text-sm text-muted-foreground">Overall Security Score</div>
          </div>
          <div className="space-y-3">
            {complianceMetrics?.securityScore?.categories?.map((category, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-foreground">{category?.name}</span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-foreground">{category?.score}</span>
                  <Icon 
                    name={category?.trend === 'up' ? 'TrendingUp' : category?.trend === 'down' ? 'TrendingDown' : 'Minus'} 
                    size={14} 
                    className={
                      category?.trend === 'up' ? 'text-success' : 
                      category?.trend === 'down' ? 'text-error' : 'text-muted-foreground'
                    }
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Regulatory Adherence */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h4 className="text-lg font-semibold text-foreground mb-4">Regulatory Adherence</h4>
          <div className="space-y-4">
            {complianceMetrics?.regulatoryAdherence?.map((reg, index) => (
              <div key={index} className="p-3 border border-border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-foreground">{reg?.regulation}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    reg?.status === 'compliant' ? 'bg-success/20 text-success' : 'bg-warning/20 text-warning'
                  }`}>
                    {reg?.status}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Score: {reg?.score}%</span>
                  <span className="text-muted-foreground">Last audit: {reg?.last_audit}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Audit Trail */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h4 className="text-lg font-semibold text-foreground mb-4">Audit Trail Summary</h4>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Action Type</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Count</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Compliance</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Risk Level</th>
              </tr>
            </thead>
            <tbody>
              {complianceMetrics?.auditTrail?.map((action, index) => (
                <tr key={index} className="border-b border-border/50">
                  <td className="py-3 px-4 text-foreground">{action?.action}</td>
                  <td className="py-3 px-4 text-foreground">{action?.count?.toLocaleString()}</td>
                  <td className="py-3 px-4 text-foreground">{action?.compliance}%</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      action?.risk === 'low' ? 'bg-success/20 text-success' :
                      action?.risk === 'medium'? 'bg-warning/20 text-warning' : 'bg-error/20 text-error'
                    }`}>
                      {action?.risk}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'documents':
        return renderDocumentAnalytics();
      case 'behavior':
        return renderUserBehavior();
      case 'compliance':
        return renderComplianceMetrics();
      default:
        return renderDocumentAnalytics();
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">Segmented Analytics</h3>
        <div className="flex items-center space-x-2">
          <Icon name="BarChart3" size={16} className="text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Detailed Insights</span>
        </div>
      </div>
      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 bg-muted/20 p-1 rounded-lg">
        {tabs?.map((tab) => (
          <button
            key={tab?.id}
            onClick={() => setActiveTab(tab?.id)}
            className={`
              flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200
              ${activeTab === tab?.id 
                ? 'bg-primary text-primary-foreground shadow-sm' 
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }
            `}
          >
            <Icon name={tab?.icon} size={16} />
            <span>{tab?.label}</span>
          </button>
        ))}
      </div>
      {/* Tab Content */}
      {renderTabContent()}
    </div>
  );
};

export default SegmentedAnalytics;