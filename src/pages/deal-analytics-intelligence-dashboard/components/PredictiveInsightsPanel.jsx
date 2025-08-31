import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const PredictiveInsightsPanel = () => {
  const [selectedDeal, setSelectedDeal] = useState('techcorp_acquisition');

  const dealInsights = {
    techcorp_acquisition: {
      name: 'TechCorp Acquisition',
      successProbability: 78.9,
      confidenceLevel: 92,
      riskFactors: [
        { factor: 'Regulatory Approval', risk: 'medium', impact: 15, description: 'Antitrust review pending in 2 jurisdictions' },
        { factor: 'Due Diligence Completion', risk: 'low', impact: 8, description: 'Financial review 85% complete' },
        { factor: 'Stakeholder Alignment', risk: 'high', impact: 22, description: 'Board approval required from 3 entities' }
      ],
      bottlenecks: [
        { area: 'Legal Documentation', severity: 'high', delay: '5-7 days', description: 'Contract amendments pending' },
        { area: 'Financial Verification', severity: 'medium', delay: '2-3 days', description: 'Audit trail completion' }
      ],
      recommendations: [
        { priority: 'high', action: 'Accelerate regulatory filing', impact: '+12% success rate' },
        { priority: 'medium', action: 'Schedule stakeholder alignment meeting', impact: '+8% success rate' },
        { priority: 'low', action: 'Prepare contingency documentation', impact: '+3% success rate' }
      ],
      timeline: {
        estimated: '42 days',
        optimistic: '35 days',
        pessimistic: '58 days'
      },
      keyMetrics: {
        userEngagement: 87,
        documentCompletion: 73,
        qaResolution: 91,
        complianceScore: 94
      }
    }
  };

  const currentDeal = dealInsights?.[selectedDeal];

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'low': return 'text-success bg-success/10';
      case 'medium': return 'text-warning bg-warning/10';
      case 'high': return 'text-error bg-error/10';
      default: return 'text-muted-foreground bg-muted/10';
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'low': return 'text-success bg-success/10';
      case 'medium': return 'text-warning bg-warning/10';
      case 'high': return 'text-error bg-error/10';
      default: return 'text-muted-foreground bg-muted/10';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'low': return 'text-muted-foreground bg-muted/10';
      case 'medium': return 'text-warning bg-warning/10';
      case 'high': return 'text-error bg-error/10';
      default: return 'text-muted-foreground bg-muted/10';
    }
  };

  return (
    <div className="space-y-6">
      {/* Success Probability Card */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">AI Success Prediction</h3>
          <div className="flex items-center space-x-2">
            <Icon name="Brain" size={16} className="text-primary" />
            <span className="text-sm text-muted-foreground">ML Model v2.1</span>
          </div>
        </div>

        <div className="text-center mb-6">
          <div className="relative inline-flex items-center justify-center w-32 h-32 mb-4">
            <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
              <circle
                cx="60"
                cy="60"
                r="50"
                stroke="var(--color-muted)"
                strokeWidth="8"
                fill="none"
                opacity="0.2"
              />
              <circle
                cx="60"
                cy="60"
                r="50"
                stroke="var(--color-primary)"
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 50}`}
                strokeDashoffset={`${2 * Math.PI * 50 * (1 - currentDeal?.successProbability / 100)}`}
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-primary">{currentDeal?.successProbability}%</span>
              <span className="text-xs text-muted-foreground">Success Rate</span>
            </div>
          </div>
          
          <div className="flex items-center justify-center space-x-4 text-sm">
            <div className="flex items-center space-x-1">
              <Icon name="Target" size={14} className="text-success" />
              <span className="text-muted-foreground">Confidence: {currentDeal?.confidenceLevel}%</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="text-center p-3 bg-muted/20 rounded-lg">
            <div className="text-lg font-semibold text-success">{currentDeal?.timeline?.optimistic}</div>
            <div className="text-xs text-muted-foreground">Best Case</div>
          </div>
          <div className="text-center p-3 bg-muted/20 rounded-lg">
            <div className="text-lg font-semibold text-error">{currentDeal?.timeline?.pessimistic}</div>
            <div className="text-xs text-muted-foreground">Worst Case</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {Object.entries(currentDeal?.keyMetrics)?.map(([key, value]) => (
            <div key={key} className="flex items-center justify-between p-2 bg-muted/10 rounded">
              <span className="text-xs text-muted-foreground capitalize">{key?.replace(/([A-Z])/g, ' $1')}</span>
              <span className="text-sm font-medium text-foreground">{value}%</span>
            </div>
          ))}
        </div>
      </div>
      {/* Risk Factors */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Risk Analysis</h3>
          <Icon name="AlertTriangle" size={16} className="text-warning" />
        </div>

        <div className="space-y-3">
          {currentDeal?.riskFactors?.map((risk, index) => (
            <div key={index} className="p-3 border border-border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-foreground">{risk?.factor}</span>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(risk?.risk)}`}>
                    {risk?.risk}
                  </span>
                  <span className="text-sm text-muted-foreground">{risk?.impact}% impact</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{risk?.description}</p>
            </div>
          ))}
        </div>
      </div>
      {/* Bottlenecks */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Current Bottlenecks</h3>
          <Icon name="Clock" size={16} className="text-error" />
        </div>

        <div className="space-y-3">
          {currentDeal?.bottlenecks?.map((bottleneck, index) => (
            <div key={index} className="p-3 border border-border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-foreground">{bottleneck?.area}</span>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(bottleneck?.severity)}`}>
                    {bottleneck?.severity}
                  </span>
                  <span className="text-sm text-muted-foreground">{bottleneck?.delay}</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{bottleneck?.description}</p>
            </div>
          ))}
        </div>
      </div>
      {/* Recommendations */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">AI Recommendations</h3>
          <Icon name="Lightbulb" size={16} className="text-accent" />
        </div>

        <div className="space-y-3">
          {currentDeal?.recommendations?.map((rec, index) => (
            <div key={index} className="p-3 border border-border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(rec?.priority)}`}>
                    {rec?.priority}
                  </span>
                  <span className="font-medium text-foreground">{rec?.action}</span>
                </div>
                <span className="text-sm text-success">{rec?.impact}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-border">
          <Button variant="primary" fullWidth iconName="ArrowRight" iconPosition="right">
            Apply All Recommendations
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PredictiveInsightsPanel;