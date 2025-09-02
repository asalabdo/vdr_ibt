import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Header from '../../components/ui/Header';
import KPICard from './components/KPICard';
import DealVolumeChart from './components/DealVolumeChart';
import DealPipelineFunnel from './components/DealPipelineFunnel';
import TopPerformingRooms from './components/TopPerformingRooms';
import ExecutiveSummaryTable from './components/ExecutiveSummaryTable';
import GlobalControls from './components/GlobalControls';

const ExecutiveDealFlowDashboard = () => {
  const { t, i18n } = useTranslation('dashboard');
  const [filters, setFilters] = useState({
    dateRange: 'Q4 2024',
    stage: 'all',
    region: 'global'
  });

  // Mock KPI data
  const kpiData = [
    {
      title: t('kpi.total_deal_value', 'Total Deal Value'),
      value: '$847.2M',
      change: '+12.4%',
      changeType: 'positive',
      icon: 'DollarSign',
      subtitle: t('kpi.descriptions.active_pipeline', 'Active pipeline'),
      trend: [65, 78, 82, 88, 92, 85, 90, 95]
    },
    {
      title: t('kpi.average_time_to_close', 'Average Time to Close'),
      value: `18.5 ${t('kpi.units.days', 'days')}`,
      change: `-2.1 ${t('kpi.units.days', 'days')}`,
      changeType: 'positive',
      icon: 'Clock',
      subtitle: t('kpi.descriptions.faster_than_target', 'Faster than target'),
      trend: [45, 52, 48, 42, 38, 35, 32, 30]
    },
    {
      title: t('kpi.active_transactions', 'Active Transactions'),
      value: '142',
      change: '+8',
      changeType: 'positive',
      icon: 'Activity',
      subtitle: t('kpi.descriptions.in_progress', 'In progress'),
      trend: [70, 75, 72, 78, 82, 85, 88, 90]
    },
    {
      title: t('kpi.success_rate', 'Success Rate'),
      value: '94.2%',
      change: '+1.8%',
      changeType: 'positive',
      icon: 'TrendingUp',
      subtitle: t('kpi.descriptions.above_benchmark', 'Above benchmark'),
      trend: [88, 89, 91, 92, 93, 94, 95, 94]
    }
  ];

  // Mock chart data
  const chartData = [
    { month: 'Jul', dealVolume: 24, avgDealSize: 12.5 },
    { month: 'Aug', dealVolume: 28, avgDealSize: 15.2 },
    { month: 'Sep', dealVolume: 32, avgDealSize: 18.7 },
    { month: 'Oct', dealVolume: 35, avgDealSize: 22.1 },
    { month: 'Nov', dealVolume: 38, avgDealSize: 24.8 },
    { month: 'Dec', dealVolume: 42, avgDealSize: 26.3 }
  ];

  // Mock pipeline data
  const pipelineStages = [
    { name: t('pipeline.stages.prospecting', 'Prospecting'), count: 156, value: 425.8, conversionRate: 68 },
    { name: t('pipeline.stages.qualification', 'Qualification'), count: 106, value: 312.4, conversionRate: 72 },
    { name: t('pipeline.stages.proposal', 'Proposal'), count: 76, value: 245.6, conversionRate: 78 },
    { name: t('pipeline.stages.negotiation', 'Negotiation'), count: 59, value: 198.2, conversionRate: 85 },
    { name: t('pipeline.stages.closing', 'Closing'), count: 50, value: 168.9, conversionRate: 94 }
  ];

  // Mock top performing rooms
  const topRooms = [
    {
      id: 1,
      name: 'TechCorp Acquisition',
      dealValue: '$125.4M',
      participants: 28,
      activeUsers: 12,
      avgTime: '8.2d',
      score: 96
    },
    {
      id: 2,
      name: 'Global Merger Project',
      dealValue: '$89.7M',
      participants: 35,
      activeUsers: 18,
      avgTime: '12.1d',
      score: 94
    },
    {
      id: 3,
      name: 'Strategic Partnership',
      dealValue: '$67.2M',
      participants: 22,
      activeUsers: 9,
      avgTime: '15.8d',
      score: 91
    },
    {
      id: 4,
      name: 'Asset Divestiture',
      dealValue: '$54.8M',
      participants: 19,
      activeUsers: 7,
      avgTime: '18.4d',
      score: 88
    },
    {
      id: 5,
      name: 'Joint Venture Setup',
      dealValue: '$42.1M',
      participants: 16,
      activeUsers: 5,
      avgTime: '22.7d',
      score: 85
    }
  ];

  // Mock executive summary deals
  const executiveDeals = [
    {
      id: 1,
      name: 'MegaCorp Acquisition',
      company: 'MegaCorp Industries',
      value: '$245.8M',
      type: t('executive_summary.deal_types.ma', 'M&A'),
      status: t('status.critical', 'Critical'),
      priority: t('executive_summary.priority_levels.high', 'High'),
      projectedClose: '2024-12-15',
      daysRemaining: 14,
      progress: 78
    },
    {
      id: 2,
      name: 'European Expansion',
      company: 'EuroTech Solutions',
      value: '$156.2M',
      type: t('executive_summary.deal_types.strategic', 'Strategic'),
      status: t('status.attention', 'Attention'),
      priority: t('executive_summary.priority_levels.high', 'High'),
      projectedClose: '2024-12-28',
      daysRemaining: 27,
      progress: 65
    },
    {
      id: 3,
      name: 'Digital Transformation',
      company: 'CloudFirst Inc',
      value: '$89.4M',
      type: t('executive_summary.deal_types.partnership', 'Partnership'),
      status: t('status.on_track', 'On-Track'),
      priority: t('executive_summary.priority_levels.medium', 'Medium'),
      projectedClose: '2025-01-10',
      daysRemaining: 40,
      progress: 82
    },
    {
      id: 4,
      name: 'Supply Chain Optimization',
      company: 'LogiFlow Systems',
      value: '$67.8M',
      type: t('executive_summary.deal_types.acquisition', 'Acquisition'),
      status: t('status.on_track', 'On-Track'),
      priority: t('executive_summary.priority_levels.medium', 'Medium'),
      projectedClose: '2025-01-22',
      daysRemaining: 52,
      progress: 71
    }
  ];

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
    // In a real app, this would trigger data refetch
    console.log('Filters changed:', newFilters);
  };

  const handleChartDrillDown = () => {
    // In a real app, this would navigate to quarterly view
    console.log('Drilling down to quarterly view');
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-4">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2 rtl:text-right">
              {t('title', 'Executive Deal Flow Dashboard')}
            </h1>
            <p className="text-muted-foreground rtl:text-right">
              {t('subtitle', 'Real-time insights into deal performance and pipeline health')}
            </p>
          </div>

          {/* Global Controls */}
          <GlobalControls onFiltersChange={handleFiltersChange} />

          {/* KPI Cards Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
            {kpiData?.map((kpi, index) => (
              <KPICard key={index} {...kpi} />
            ))}
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 mb-8">
            {/* Deal Volume Chart - 8 columns */}
            <div className="xl:col-span-8">
              <DealVolumeChart 
                data={chartData} 
                onDrillDown={handleChartDrillDown}
              />
            </div>

            {/* Right Sidebar - 4 columns */}
            <div className="xl:col-span-4 space-y-6">
              <DealPipelineFunnel stages={pipelineStages} />
              <TopPerformingRooms rooms={topRooms} />
            </div>
          </div>

          {/* Executive Summary Table */}
          <ExecutiveSummaryTable deals={executiveDeals} />
        </div>
      </main>
    </div>
  );
};

export default ExecutiveDealFlowDashboard;