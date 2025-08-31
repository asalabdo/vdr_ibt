import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';
import t from '../../utils/i18n';
import Button from './Button';

const Header = ({ onToggleSidebar }) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [lastDataRefresh, setLastDataRefresh] = useState(new Date());
  const userMenuRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Theme (dark/light) and language (en/ar) state
  const [isDark, setIsDark] = useState(() => {
    try {
      const stored = localStorage.getItem('theme');
      if (stored) return stored === 'dark';
      return document?.documentElement?.classList?.contains('dark');
    } catch (e) {
      return false;
    }
  });

  const [isRTL, setIsRTL] = useState(() => {
    try {
      const stored = localStorage.getItem('lang');
      if (stored) return stored === 'ar';
      return document?.documentElement?.dir === 'rtl';
    } catch (e) {
      return false;
    }
  });

  useEffect(() => {
    try {
      if (isDark) {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
      } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
      }
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
    } catch (e) {
      // ignore
    }
  }, [isDark]);

  useEffect(() => {
    try {
      document.documentElement.lang = isRTL ? 'ar' : 'en';
      document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
      localStorage.setItem('lang', isRTL ? 'ar' : 'en');
    } catch (e) {
      // ignore
    }
  }, [isRTL]);

  const toggleTheme = () => setIsDark((s) => !s);
  const toggleLang = () => setIsRTL((s) => !s);

  const navigationItems = [
    {
      label: t('routes.executive_overview'),
      path: '/executive-deal-flow-dashboard',
      icon: 'BarChart3',
      tooltip: t('header.toggle_theme')
    },
    {
      label: t('routes.deal_intelligence'),
      path: '/deal-analytics-intelligence-dashboard',
      icon: 'TrendingUp',
      tooltip: t('header.toggle_theme')
    },
    {
      label: t('routes.operations_center'),
      path: '/vdr-operations-command-center',
      icon: 'Monitor',
      tooltip: t('header.toggle_theme')
    },
    {
      label: t('routes.compliance_security'),
      path: '/compliance-security-monitoring-dashboard',
      icon: 'Shield',
      tooltip: t('header.toggle_theme')
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
    if (diff < 60) return t('misc.just_now');
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
  };

  const getCurrentPageTitle = () => {
    const currentItem = navigationItems?.find(item => item?.path === location?.pathname);
    return currentItem ? currentItem?.label : 'VDR';
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
              <span className="text-lg font-semibold text-foreground"> VDR </span>
              <span className="text-xs text-muted-foreground -mt-1">IBTIKARYA</span>
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
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            title="Toggle theme"
            aria-label="Toggle theme"
            className="p-2 rounded-lg hover:bg-muted/50 transition-colors"
          >
            <Icon name={isDark ? 'Sun' : 'Moon'} size={18} />
          </button>

          {/* Language/RTL toggle */}
          <button
            onClick={toggleLang}
            title="Toggle language"
            aria-label="Toggle language"
            className="p-2 rounded-lg hover:bg-muted/50 transition-colors"
          >
            <Icon name={isRTL ? 'Globe' : 'Globe'} size={18} />
          </button>
          {/* Data Status Indicator */}
          <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 bg-muted/30 rounded-lg">
            <div className="w-2 h-2 bg-success rounded-full animate-pulse-subtle"></div>
            <span className="text-xs text-muted-foreground">
              {t('header.updated')} {formatLastRefresh(lastDataRefresh)}
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
                    <span>{t('user.profile_settings')}</span>
                  </button>
                  <button className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-popover-foreground hover:bg-muted/50 transition-colors">
                    <Icon name="Settings" size={16} />
                    <span>{t('user.dashboard_preferences')}</span>
                  </button>
                  <button className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-popover-foreground hover:bg-muted/50 transition-colors">
                    <Icon name="Bell" size={16} />
                    <span>{t('user.notification_settings')}</span>
                  </button>
                  <button className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-popover-foreground hover:bg-muted/50 transition-colors">
                    <Icon name="HelpCircle" size={16} />
                    <span>{t('user.help_support')}</span>
                  </button>
                </div>
                
                <div className="border-t border-border pt-4">
                  <button className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-error hover:bg-error/10 transition-colors">
                    <Icon name="LogOut" size={16} />
                    <span>{t('user.sign_out')}</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Menu Button (visible on all sizes) */}
          <div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onToggleSidebar && onToggleSidebar()}
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