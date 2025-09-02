import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Icon from '../AppIcon';
import Button from './Button';
import LanguageToggle from './LanguageToggle';
import DarkModeToggle from './DarkModeToggle';

const Header = ({ onToggleSidebar }) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [lastDataRefresh, setLastDataRefresh] = useState(new Date());
  const userMenuRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();



  const navigationItems = [
    {
      label: t('navigation:routes.executive_overview'),
      path: '/executive-deal-flow-dashboard',
      icon: 'BarChart3',
      tooltip: t('header.toggle_theme')
    },
    {
      label: t('navigation:routes.deal_intelligence'),
      path: '/deal-analytics-intelligence-dashboard',
      icon: 'TrendingUp',
      tooltip: t('header.toggle_theme')
    },
    {
      label: t('navigation:routes.operations_center'),
      path: '/vdr-operations-command-center',
      icon: 'Monitor',
      tooltip: t('header.toggle_theme')
    },
    {
      label: t('navigation:routes.compliance_security'),
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
    
    if (diff < 60) return t('misc.just_now');
    if (diff < 3600) {
      const minutes = Math.floor(diff / 60);
      return `${minutes}${t('misc.minutes_ago')}`;
    }
    const hours = Math.floor(diff / 3600);
    return `${hours}${t('misc.hours_ago')}`;
  };

  const getCurrentPageTitle = () => {
    const currentItem = navigationItems?.find(item => item?.path === location?.pathname);
    return currentItem ? currentItem?.label : 'VDR';
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-card border-b border-border">
      <div className="flex items-center justify-between h-16 px-6">
        {/* Logo Section */}
        <div className="flex items-center space-x-8 rtl:space-x-reverse">
          <div 
            className="flex items-center space-x-3 rtl:space-x-reverse cursor-pointer"
            onClick={() => navigate('/')}
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
          <nav className="hidden lg:flex items-center space-x-1 rtl:space-x-reverse">
            {navigationItems?.map((item) => {
              const isActive = location?.pathname === item?.path;
              return (
                <button
                  key={item?.path}
                  onClick={() => handleNavigation(item?.path)}
                                     className={`
                     flex items-center space-x-2 rtl:space-x-reverse px-4 py-2 rounded-lg text-sm font-medium
                     transition-all duration-200 relative group
                     ${isActive 
                       ? 'bg-primary text-primary-foreground shadow-md ring-1 ring-primary/10 font-semibold' 
                       : 'text-muted-foreground hover:text-foreground hover:bg-muted/60 hover:shadow-sm'
                     }
                   `}
                  title={item?.tooltip}
                >
                  <Icon name={item?.icon} size={16} />
                  <span>{item?.label}</span>
                  {/* Active indicator */}
                  {isActive && (
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-6 h-0.5 bg-primary-foreground/40 rounded-full"></div>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-1 rtl:space-x-reverse">
          {/* Theme Controls */}
          <div className="flex items-center space-x-1 rtl:space-x-reverse">
            {/* Language Toggle */}
            <LanguageToggle />

            {/* Dark Mode Toggle */}
            <DarkModeToggle />
          </div>

          {/* Divider */}
          <div className="h-5 w-px bg-border/60 mx-3"></div>

          {/* Data Status Indicator */}
          <div className="hidden md:flex items-center space-x-2 rtl:space-x-reverse px-3 py-1.5 bg-muted/20 rounded-md">
            <div className="w-1.5 h-1.5 bg-success rounded-full animate-pulse"></div>
            <span className="text-xs text-muted-foreground font-medium">
              {t('header.updated')} {formatLastRefresh(lastDataRefresh)}
            </span>
          </div>

          {/* User Menu */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center space-x-2 rtl:space-x-reverse px-2 py-1.5 rounded-lg hover:bg-muted/50 transition-all duration-200 group"
            >
              <div className="w-7 h-7 bg-primary rounded-full flex items-center justify-center ring-2 ring-background shadow-sm">
                <Icon name="User" size={14} color="var(--color-primary-foreground)" />
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">John Executive</div>
                <div className="text-xs text-muted-foreground">Senior Analyst</div>
              </div>
              <Icon 
                name="ChevronDown" 
                size={14} 
                className={`text-muted-foreground group-hover:text-foreground transition-all duration-200 ${
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
                  <button className="w-full flex items-center space-x-3 rtl:space-x-reverse px-4 py-2 text-sm text-popover-foreground hover:bg-muted/50 transition-colors">
                    <Icon name="User" size={16} />
                    <span>{t('user.profile_settings')}</span>
                  </button>
                  <button className="w-full flex items-center space-x-3 rtl:space-x-reverse px-4 py-2 text-sm text-popover-foreground hover:bg-muted/50 transition-colors">
                    <Icon name="Settings" size={16} />
                    <span>{t('user.dashboard_preferences')}</span>
                  </button>
                  <button className="w-full flex items-center space-x-3 rtl:space-x-reverse px-4 py-2 text-sm text-popover-foreground hover:bg-muted/50 transition-colors">
                    <Icon name="Bell" size={16} />
                    <span>{t('user.notification_settings')}</span>
                  </button>
                  <button className="w-full flex items-center space-x-3 rtl:space-x-reverse px-4 py-2 text-sm text-popover-foreground hover:bg-muted/50 transition-colors">
                    <Icon name="HelpCircle" size={16} />
                    <span>{t('user.help_support')}</span>
                  </button>
                </div>
                
                <div className="border-t border-border pt-4">
                  <button className="w-full flex items-center space-x-3 rtl:space-x-reverse px-4 py-2 text-sm text-error hover:bg-error/10 transition-colors">
                    <Icon name="LogOut" size={16} />
                    <span>{t('user.sign_out')}</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Menu Button (visible on all sizes) */}
          <button
            onClick={() => onToggleSidebar && onToggleSidebar()}
            className="p-2 rounded-lg hover:bg-muted/50 transition-all duration-200 group ml-2"
            aria-label="Toggle sidebar"
          >
            <div className="flex items-center justify-center w-5 h-5">
              <Icon 
                name="Menu" 
                size={18} 
                className="text-muted-foreground group-hover:text-foreground transition-colors" 
              />
            </div>
          </button>
        </div>
      </div>
      {/* Mobile Navigation */}
      <div className="lg:hidden border-t border-border bg-card">
        <nav className="flex overflow-x-auto py-2 px-4 space-x-1 rtl:space-x-reverse">
          {navigationItems?.map((item) => {
            const isActive = location?.pathname === item?.path;
            return (
              <button
                key={item?.path}
                onClick={() => handleNavigation(item?.path)}
                                 className={`
                   flex flex-col items-center space-y-1 px-3 py-2 rounded-lg text-xs font-medium
                   transition-all duration-200 whitespace-nowrap min-w-fit relative
                   ${isActive 
                     ? 'bg-primary text-primary-foreground shadow-md ring-1 ring-primary/10 font-semibold' 
                     : 'text-muted-foreground hover:text-foreground hover:bg-muted/60 hover:shadow-sm'
                   }
                 `}
              >
                <Icon name={item?.icon} size={16} />
                <span>{item?.label}</span>
                {/* Active indicator for mobile */}
                {isActive && (
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-4 h-0.5 bg-primary-foreground/40 rounded-full"></div>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};

export default Header;