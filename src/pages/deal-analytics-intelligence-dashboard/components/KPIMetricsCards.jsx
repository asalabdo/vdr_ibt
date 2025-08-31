import React from 'react';
import Icon from '../../../components/AppIcon';

const KPIMetricsCards = () => {
  const kpiMetrics = [
    {
      id: 'deal_velocity',
      title: 'Deal Velocity',
      value: '42.3',
      unit: 'days',
      change: -8.2,
      changeLabel: 'vs last period',
      icon: 'Clock',
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      description: 'Average time to close',
      confidence: 94,
      historical: [38, 45, 41, 39, 42, 44, 42]
    },
    {
      id: 'user_engagement',
      title: 'User Engagement Score',
      value: '87.6',
      unit: '%',
      change: 12.4,
      changeLabel: 'vs last period',
      icon: 'Users',
      color: 'text-success',
      bgColor: 'bg-success/10',
      description: 'Active participation rate',
      confidence: 91,
      historical: [82, 79, 85, 88, 86, 89, 88]
    },
    {
      id: 'document_utilization',
      title: 'Document Utilization',
      value: '73.2',
      unit: '%',
      change: 5.8,
      changeLabel: 'vs last period',
      icon: 'FileText',
      color: 'text-accent',
      bgColor: 'bg-accent/10',
      description: 'Documents accessed rate',
      confidence: 88,
      historical: [68, 71, 69, 75, 72, 74, 73]
    },
    {
      id: 'qa_efficiency',
      title: 'Q&A Efficiency',
      value: '2.1',
      unit: 'hrs',
      change: -15.3,
      changeLabel: 'response time',
      icon: 'MessageSquare',
      color: 'text-warning',
      bgColor: 'bg-warning/10',
      description: 'Average response time',
      confidence: 96,
      historical: [2.8, 2.5, 2.3, 2.0, 2.2, 2.4, 2.1]
    },
    {
      id: 'success_probability',
      title: 'AI Success Probability',
      value: '78.9',
      unit: '%',
      change: 3.2,
      changeLabel: 'confidence increase',
      icon: 'Brain',
      color: 'text-purple-400',
      bgColor: 'bg-purple-400/10',
      description: 'Predicted deal success',
      confidence: 92,
      historical: [75, 76, 74, 79, 77, 80, 79]
    }
  ];

  const renderMiniChart = (data) => {
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min;
    
    return (
      <div className="flex items-end space-x-1 h-8">
        {data?.map((value, index) => {
          const height = range === 0 ? 50 : ((value - min) / range) * 100;
          return (
            <div
              key={index}
              className="bg-current opacity-30 rounded-sm flex-1"
              style={{ height: `${Math.max(height, 10)}%` }}
            />
          );
        })}
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6 mb-8">
      {kpiMetrics?.map((metric) => (
        <div key={metric?.id} className="bg-card border border-border rounded-lg p-6 hover:shadow-elevation-1 transition-shadow duration-200">
          <div className="flex items-start justify-between mb-4">
            <div className={`p-3 rounded-lg ${metric?.bgColor}`}>
              <Icon name={metric?.icon} size={24} className={metric?.color} />
            </div>
            <div className="text-right">
              <div className="text-xs text-muted-foreground">Confidence</div>
              <div className="text-sm font-medium text-foreground">{metric?.confidence}%</div>
            </div>
          </div>

          <div className="mb-3">
            <h3 className="text-sm font-medium text-muted-foreground mb-1">{metric?.title}</h3>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-bold text-foreground">{metric?.value}</span>
              <span className="text-sm text-muted-foreground">{metric?.unit}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">{metric?.description}</p>
          </div>

          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-1">
              <Icon 
                name={metric?.change >= 0 ? 'TrendingUp' : 'TrendingDown'} 
                size={14} 
                className={metric?.change >= 0 ? 'text-success' : 'text-error'}
              />
              <span className={`text-sm font-medium ${metric?.change >= 0 ? 'text-success' : 'text-error'}`}>
                {Math.abs(metric?.change)}%
              </span>
            </div>
            <span className="text-xs text-muted-foreground">{metric?.changeLabel}</span>
          </div>

          <div className={`${metric?.color} opacity-60`}>
            {renderMiniChart(metric?.historical)}
          </div>
        </div>
      ))}
    </div>
  );
};

export default KPIMetricsCards;