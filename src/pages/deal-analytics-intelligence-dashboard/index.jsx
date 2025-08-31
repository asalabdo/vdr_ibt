import React, { useState, useEffect } from 'react';
import Header from '../../components/ui/Header';
import FilterControls from './components/FilterControls';
import KPIMetricsCards from './components/KPIMetricsCards';
import DealTimelineChart from './components/DealTimelineChart';
import UserEngagementHeatmap from './components/UserEngagementHeatmap';
import PredictiveInsightsPanel from './components/PredictiveInsightsPanel';
import SegmentedAnalytics from './components/SegmentedAnalytics';

import Button from '../../components/ui/Button';

const DealAnalyticsIntelligenceDashboard = () => {
  const [filters, setFilters] = useState({
    dealTypes: [],
    dateRange: 'last30days',
    userRoles: [],
    comparisonMode: false
  });
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Auto-refresh data every 15 minutes
    const interval = setInterval(() => {
      setLastRefresh(new Date());
    }, 15 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
    // Trigger data refresh with new filters
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1000); // Simulate API call
  };

  const handleRefreshData = () => {
    setIsLoading(true);
    setLastRefresh(new Date());
    setTimeout(() => setIsLoading(false), 1500); // Simulate API call
  };

  const formatLastRefresh = (date) => {
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);
    
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Page Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Deal Analytics & Intelligence Dashboard
              </h1>
              <p className="text-muted-foreground">
                Comprehensive transaction insights and predictive analytics for optimizing due diligence workflows
              </p>
            </div>
            
            <div className="flex items-center space-x-4 mt-4 lg:mt-0">
              <div className="flex items-center space-x-2 px-3 py-2 bg-muted/20 rounded-lg">
                <div className="w-2 h-2 bg-success rounded-full animate-pulse-subtle"></div>
                <span className="text-sm text-muted-foreground">
                  Updated {formatLastRefresh(lastRefresh)}
                </span>
              </div>
              
              <Button
                variant="outline"
                iconName="RefreshCw"
                iconPosition="left"
                onClick={handleRefreshData}
                loading={isLoading}
                disabled={isLoading}
              >
                Refresh Data
              </Button>
              
              <Button
                variant="default"
                iconName="BookmarkPlus"
                iconPosition="left"
              >
                Save Analysis
              </Button>
            </div>
          </div>

          {/* Filter Controls */}
          <FilterControls onFiltersChange={handleFiltersChange} />

          {/* KPI Metrics Cards */}
          <KPIMetricsCards />

          {/* Main Analytics Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-8 mb-8">
            {/* Primary Analysis Area (12 cols equivalent) */}
            <div className="xl:col-span-3 space-y-8">
              {/* Deal Timeline Chart */}
              <DealTimelineChart />
              
              {/* User Engagement Heatmap */}
              <UserEngagementHeatmap />
            </div>

            {/* Right Analytics Panel (4 cols equivalent) */}
            <div className="xl:col-span-1">
              <PredictiveInsightsPanel />
            </div>
          </div>

          {/* Segmented Analytics */}
          <SegmentedAnalytics />

          {/* Quick Actions Footer */}
          <div className="mt-8 p-6 bg-card border border-border rounded-lg">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-1">Quick Actions</h3>
                <p className="text-sm text-muted-foreground">
                  Common tasks and shortcuts for deal analysis
                </p>
              </div>
              
              <div className="flex flex-wrap gap-3 mt-4 sm:mt-0">
                <Button
                  variant="outline"
                  size="sm"
                  iconName="Download"
                  iconPosition="left"
                >
                  Export Report
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  iconName="Share"
                  iconPosition="left"
                >
                  Share Dashboard
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  iconName="Calendar"
                  iconPosition="left"
                >
                  Schedule Report
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  iconName="Settings"
                  iconPosition="left"
                >
                  Customize View
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DealAnalyticsIntelligenceDashboard;