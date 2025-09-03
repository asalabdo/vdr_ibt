import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import Icon from '../../../components/AppIcon';

const SegmentedAnalytics = () => {
  const { t } = useTranslation('deal-analytics-dashboard');
  const { t: tCommon } = useTranslation('common');
  const [activeTab, setActiveTab] = useState('documents');

  const documentAnalytics = {
    accessFrequency: [
      { name: t('sample_data.documents.financial_statements'), accesses: 1247, unique_users: 89, avg_time: 12.4 },
      { name: t('sample_data.documents.legal_documents'), accesses: 892, unique_users: 67, avg_time: 18.7 },
      { name: t('sample_data.documents.technical_specs'), accesses: 634, unique_users: 45, avg_time: 8.9 },
      { name: t('sample_data.documents.market_analysis'), accesses: 567, unique_users: 78, avg_time: 15.2 },
      { name: t('sample_data.documents.due_diligence'), accesses: 445, unique_users: 34, avg_time: 22.1 },
      { name: t('sample_data.documents.compliance_reports'), accesses: 334, unique_users: 23, avg_time: 9.8 }
    ],
    storageUtilization: [
      { category: t('sample_data.categories.financial'), value: 35, size: '2.4 GB', color: '#1e40af' },
      { category: t('sample_data.categories.legal'), value: 28, size: '1.9 GB', color: '#059669' },
      { category: t('sample_data.categories.technical'), value: 18, size: '1.2 GB', color: '#d97706' },
      { category: t('sample_data.categories.marketing'), value: 12, size: '0.8 GB', color: '#dc2626' },
      { category: t('sample_data.categories.other'), value: 7, size: '0.5 GB', color: '#6b7280' }
    ],
    versionControl: [
      { document: t('sample_data.documents.merger_agreement'), versions: 12, last_updated: '2 hours ago', status: tCommon('status_values.active') },
      { document: t('sample_data.documents.financial_model'), versions: 8, last_updated: '5 hours ago', status: tCommon('status_values.review') },
      { document: t('sample_data.documents.legal_opinion'), versions: 15, last_updated: '1 day ago', status: tCommon('status_values.final') },
      { document: t('sample_data.documents.market_research'), versions: 6, last_updated: '3 days ago', status: tCommon('status_values.active') }
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
      { type: t('sample_data.user_types.buyers'), count: 45, engagement: 87, color: '#1e40af' },
      { type: t('sample_data.user_types.sellers'), count: 23, engagement: 92, color: '#059669' },
      { type: t('sample_data.user_types.advisors'), count: 34, engagement: 78, color: '#d97706' },
      { type: t('sample_data.user_types.legal_teams'), count: 18, engagement: 85, color: '#dc2626' },
      { type: t('sample_data.user_types.finance_teams'), count: 29, engagement: 90, color: '#7c3aed' }
    ],
    activityFlow: [
      { step: t('sample_data.activity_steps.login'), users: 149, conversion: 100 },
      { step: t('sample_data.activity_steps.browse_documents'), users: 142, conversion: 95.3 },
      { step: t('sample_data.activity_steps.download_files'), users: 118, conversion: 79.2 },
      { step: t('sample_data.activity_steps.submit_qa'), users: 89, conversion: 59.7 },
      { step: t('sample_data.activity_steps.complete_review'), users: 67, conversion: 45.0 }
    ]
  };

  const complianceMetrics = {
    auditTrail: [
      { action: 'Document Access', count: 2847, compliance: 98.5, risk: tCommon('status_values.low') },
      { action: 'User Authentication', count: 1923, compliance: 99.2, risk: tCommon('status_values.low') },
      { action: 'Data Export', count: 456, compliance: 94.7, risk: tCommon('status_values.medium') },
      { action: 'Permission Changes', count: 234, compliance: 97.8, risk: tCommon('status_values.low') },
      { action: 'System Access', count: 189, compliance: 91.5, risk: tCommon('status_values.high') }
    ],
    securityScore: {
      overall: 94.2,
      categories: [
        { name: t('sample_data.security_categories.access_control'), score: 96.8, trend: 'up' },
        { name: t('sample_data.security_categories.data_encryption'), score: 98.5, trend: 'stable' },
        { name: t('sample_data.security_categories.audit_logging'), score: 92.1, trend: 'up' },
        { name: t('sample_data.security_categories.user_management'), score: 89.7, trend: 'down' },
        { name: t('sample_data.security_categories.compliance_checks'), score: 95.3, trend: 'up' }
      ]
    },
    regulatoryAdherence: [
      { regulation: t('sample_data.regulations.gdpr'), status: tCommon('status_values.compliant'), score: 96.2, last_audit: '15 days ago' },
      { regulation: t('sample_data.regulations.sox'), status: tCommon('status_values.compliant'), score: 94.8, last_audit: '22 days ago' },
      { regulation: t('sample_data.regulations.hipaa'), status: tCommon('status_values.review'), score: 87.3, last_audit: '45 days ago' },
      { regulation: t('sample_data.regulations.pci_dss'), status: tCommon('status_values.compliant'), score: 92.1, last_audit: '8 days ago' }
    ]
  };

  const tabs = [
    { id: 'documents', label: t('charts.segments.tabs.documents'), icon: 'FileText' },
    { id: 'behavior', label: t('charts.segments.tabs.behavior'), icon: 'Users' },
    { id: 'compliance', label: t('charts.segments.tabs.compliance'), icon: 'Shield' }
  ];

  const renderDocumentAnalytics = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Access Frequency Chart */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h4 className="text-lg font-semibold text-foreground mb-4">{t('charts.segments.document_analytics.access_frequency')}</h4>
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
          <h4 className="text-lg font-semibold text-foreground mb-4">{t('charts.segments.document_analytics.storage_utilization')}</h4>
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
        <h4 className="text-lg font-semibold text-foreground mb-4">{t('charts.segments.document_analytics.version_control')}</h4>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">{t('charts.segments.document_analytics.headers.document')}</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">{t('charts.segments.document_analytics.headers.versions')}</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">{t('charts.segments.document_analytics.headers.last_updated')}</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">{t('charts.segments.document_analytics.headers.status')}</th>
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
          <h4 className="text-lg font-semibold text-foreground mb-4">{t('charts.segments.user_behavior.session_patterns')}</h4>
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
          <h4 className="text-lg font-semibold text-foreground mb-4">{t('charts.segments.user_behavior.user_types')}</h4>
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
        <h4 className="text-lg font-semibold text-foreground mb-4">{t('charts.segments.user_behavior.activity_flow')}</h4>
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
          <h4 className="text-lg font-semibold text-foreground mb-4">{t('charts.segments.compliance.security_score')}</h4>
          <div className="text-center mb-6">
            <div className="text-4xl font-bold text-primary mb-2">{complianceMetrics?.securityScore?.overall}</div>
            <div className="text-sm text-muted-foreground">{t('charts.segments.compliance.overall_score')}</div>
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
          <h4 className="text-lg font-semibold text-foreground mb-4">{t('charts.segments.compliance.regulatory_adherence')}</h4>
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
        <h4 className="text-lg font-semibold text-foreground mb-4">{t('charts.segments.compliance.audit_trail')}</h4>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">{t('charts.segments.compliance.headers.action_type')}</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">{t('charts.segments.compliance.headers.count')}</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">{t('charts.segments.compliance.headers.compliance')}</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">{t('charts.segments.compliance.headers.risk_level')}</th>
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
        <h3 className="text-lg font-semibold text-foreground">{t('charts.segments.title')}</h3>
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <Icon name="BarChart3" size={16} className="text-muted-foreground" />
          <span className="text-sm text-muted-foreground">{t('charts.segments.subtitle')}</span>
        </div>
      </div>
      {/* Tab Navigation */}
      <div className="flex space-x-1 rtl:space-x-reverse mb-6 bg-muted/20 p-1 rounded-lg">
        {tabs?.map((tab) => (
          <button
            key={tab?.id}
            onClick={() => setActiveTab(tab?.id)}
            className={`
              flex items-center space-x-2 rtl:space-x-reverse px-4 py-2 rounded-md text-sm font-medium transition-all duration-200
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