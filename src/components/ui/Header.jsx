import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';
import Button from './Button';

const Header = () => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [lastDataRefresh, setLastDataRefresh] = useState(new Date());
  const userMenuRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  const navigationItems = [
    {
      label: 'Executive Overview',
      path: '/executive-deal-flow-dashboard',
      icon: 'BarChart3',
      tooltip: 'Strategic deal flow and ROI metrics'
    },
    {
      label: 'Deal Intelligence',
      path: '/deal-analytics-intelligence-dashboard',
      icon: 'TrendingUp',
      tooltip: 'Comprehensive transaction analytics'
    },
    {
      label: 'Operations Center',
      path: '/vdr-operations-command-center',
      icon: 'Monitor',
      tooltip: 'Real-time system monitoring'
    },
    {
      label: 'Compliance & Security',
      path: '/compliance-security-monitoring-dashboard',
      icon: 'Shield',
      tooltip: 'Regulatory monitoring and audit trails'
    }
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef?.current && !userMenuRef?.current?.contains(event?.target)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setLastDataRefresh(new Date());
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const handleNavigation = (path) => {
    navigate(path);
  };

  const formatLastRefresh = (date) => {
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);
    
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
  };

  const getCurrentPageTitle = () => {
    const currentItem = navigationItems?.find(item => item?.path === location?.pathname);
    return currentItem ? currentItem?.label : 'VDR Analytics Dashboard';
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-card border-b border-border">
      <div className="flex items-center justify-between h-16 px-6">
        {/* Logo Section */}
        <div className="flex items-center space-x-8">
          <div 
            className="flex items-center space-x-3 cursor-pointer"
            onClick={() => navigate('/executive-deal-flow-dashboard')}
          >
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Icon name="Database" size={20} color="var(--color-primary-foreground)" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-semibold text-foreground">VDR Analytics</span>
              <span className="text-xs text-muted-foreground -mt-1">Dashboard</span>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navigationItems?.map((item) => {
              const isActive = location?.pathname === item?.path;
              return (
                <button
                  key={item?.path}
                  onClick={() => handleNavigation(item?.path)}
                  className={`
                    flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium
                    transition-all duration-200 hover:bg-muted/50
                    ${isActive 
                      ? 'bg-primary/10 text-primary border border-primary/20' :'text-muted-foreground hover:text-foreground'
                    }
                  `}
                  title={item?.tooltip}
                >
                  <Icon name={item?.icon} size={16} />
                  <span>{item?.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-4">
          {/* Data Status Indicator */}
          <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 bg-muted/30 rounded-lg">
            <div className="w-2 h-2 bg-success rounded-full animate-pulse-subtle"></div>
            <span className="text-xs text-muted-foreground">
              Updated {formatLastRefresh(lastDataRefresh)}
            </span>
          </div>

          {/* User Menu */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center space-x-2 p-2 rounded-lg hover:bg-muted/50 transition-colors duration-200"
            >
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <Icon name="User" size={16} color="var(--color-primary-foreground)" />
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-sm font-medium text-foreground">John Executive</div>
                <div className="text-xs text-muted-foreground">Senior Analyst</div>
              </div>
              <Icon 
                name="ChevronDown" 
                size={16} 
                className={`text-muted-foreground transition-transform duration-200 ${
                  isUserMenuOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* User Dropdown */}
            {isUserMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-popover border border-border rounded-lg shadow-elevation-2 py-2">
                <div className="px-4 py-3 border-b border-border">
                  <div className="text-sm font-medium text-popover-foreground">John Executive</div>
                  <div className="text-xs text-muted-foreground">john.executive@company.com</div>
                  <div className="text-xs text-muted-foreground mt-1">Senior Analyst • Executive Access</div>
                </div>
                
                <div className="py-2">
                  <button className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-popover-foreground hover:bg-muted/50 transition-colors">
                    <Icon name="User" size={16} />
                    <span>Profile Settings</span>
                  </button>
                  <button className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-popover-foreground hover:bg-muted/50 transition-colors">
                    <Icon name="Settings" size={16} />
                    <span>Dashboard Preferences</span>
                  </button>
                  <button className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-popover-foreground hover:bg-muted/50 transition-colors">
                    <Icon name="Bell" size={16} />
                    <span>Notification Settings</span>
                  </button>
                  <button className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-popover-foreground hover:bg-muted/50 transition-colors">
                    <Icon name="HelpCircle" size={16} />
                    <span>Help & Support</span>
                  </button>
                </div>
                
                <div className="border-t border-border pt-2">
                  <button className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-error hover:bg-error/10 transition-colors">
                    <Icon name="LogOut" size={16} />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {/* Mobile menu toggle logic */}}
            >
              <Icon name="Menu" size={20} />
            </Button>
          </div>
        </div>
      </div>
      {/* Mobile Navigation */}
      <div className="lg:hidden border-t border-border bg-card">
        <nav className="flex overflow-x-auto py-2 px-4 space-x-1">
          {navigationItems?.map((item) => {
            const isActive = location?.pathname === item?.path;
            return (
              <button
                key={item?.path}
                onClick={() => handleNavigation(item?.path)}
                className={`
                  flex flex-col items-center space-y-1 px-3 py-2 rounded-lg text-xs font-medium
                  transition-all duration-200 whitespace-nowrap min-w-fit
                  ${isActive 
                    ? 'bg-primary/10 text-primary' :'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }
                `}
              >
                <Icon name={item?.icon} size={16} />
                <span>{item?.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};

export default Header;