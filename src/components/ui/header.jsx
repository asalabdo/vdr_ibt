import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Icon from '../AppIcon';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import LanguageToggle from './language-toggle';
import DarkModeToggle from './dark-mode-toggle';
import NotificationBell from './notification-bell';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useAuth } from '@/hooks/api';
import { getUserInitials } from '@/lib/userFormatters';

const Header = () => {
  const [lastDataRefresh, setLastDataRefresh] = useState(new Date());
  const location = useLocation();
  const navigate = useNavigate();
  const { t: tNav } = useTranslation('navigation');
  const { t: tCommon } = useTranslation('common');
  
  // Authentication state
  const { 
    user, 
    isAuthenticated, 
    isLoading, 
    logout, 
    isLoggingOut,
    hasPermission 
  } = useAuth();

  // Helper function to get user role display
  const getUserRole = (user) => {
    if (!user) return 'User';
    if (user.isAdmin) return 'Administrator';
    if (user.groups?.includes('managers')) return 'Manager';
    if (user.groups?.includes('editors')) return 'Editor';
    return 'User';
  };

  // Handle logout
  const handleLogout = () => {
    logout();
    // Force redirect to login page and refresh to ensure clean state
    window.location.href = '/login';
  };




  const navigationItems = [
    {
      label: tNav('routes.executive_overview'),
      path: '/executive-deal-flow-dashboard',
      icon: 'BarChart3',
      tooltip: tCommon('header.toggle_theme')
    },
    {
      label: tNav('routes.deal_intelligence'),
      path: '/deal-analytics-intelligence-dashboard',
      icon: 'TrendingUp',
      tooltip: tCommon('header.toggle_theme')
    },
    {
      label: tNav('routes.operations_center'),
      path: '/vdr-operations-command-center',
      icon: 'Monitor',
      tooltip: tCommon('header.toggle_theme')
    },
    {
      label: tNav('routes.compliance_security'),
      path: '/compliance-security-monitoring-dashboard',
      icon: 'Shield',
      tooltip: tCommon('header.toggle_theme')
    }
  ];

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
    
    if (diff < 60) return tCommon('time_ago.just_now');
    if (diff < 3600) {
      const minutes = Math.floor(diff / 60);
      return tCommon('time_ago.minutes_ago', { count: minutes });
    }
    const hours = Math.floor(diff / 3600);
    return tCommon('time_ago.hours_ago', { count: hours });
  };

  const getCurrentPageTitle = () => {
    const currentItem = navigationItems?.find(item => item?.path === location?.pathname);
    return currentItem ? currentItem?.label : 'VDR';
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/40 shadow-sm">
      <div className="flex items-center justify-between h-16 px-6">
        {/* Logo Section */}
        <div className="flex items-center space-x-8 rtl:space-x-reverse">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <SidebarTrigger className="h-10 w-10 rounded-lg hover:bg-muted/80 transition-all duration-200" />
            <div 
              className="flex items-center space-x-3 rtl:space-x-reverse cursor-pointer group transition-all duration-200 hover:scale-105"
              onClick={() => navigate('/')}
            >
              <div className="w-10 h-10 flex items-center justify-center transition-all duration-300">
                <Icon name="Database" size={24} className="text-primary group-hover:text-primary/80 transition-colors duration-300" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-foreground group-hover:text-primary transition-colors"> VDR </span>
                <span className="text-xs text-muted-foreground font-medium">IBTIKARYA</span>
              </div>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="hidden lg:flex items-center space-x-2 rtl:space-x-reverse">
            {navigationItems?.map((item) => {
              const isActive = location?.pathname === item?.path;
              return (
                <Button
                  key={item?.path}
                  variant="ghost"
                  size="sm"
                  onClick={() => handleNavigation(item?.path)}
                  className={`
                    relative group transition-all duration-300 h-10
                    ${isActive 
                      ? 'text-primary hover:text-primary/80' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/80 hover:shadow-md'
                    }
                  `}
                  title={item?.tooltip}
                >
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <Icon name={item?.icon} size={16} />
                    <span className="font-medium">{item?.label}</span>
                  </div>
                  {/* Active indicator */}
                  {isActive && (
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-primary rounded-full shadow-sm"></div>
                  )}
                </Button>
              );
            })}
          </nav>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-4 rtl:space-x-reverse">
          {/* Theme Controls */}
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            {/* Language Toggle */}
            <LanguageToggle />

            {/* Dark Mode Toggle */}
            <DarkModeToggle />
            
            {/* Notifications Bell */}
            {isAuthenticated && <NotificationBell />}
          </div>

          {/* Divider */}
          <Separator orientation="vertical" className="h-6" />

          {/* Data Status Indicator */}
          <Badge className="hidden md:flex items-center space-x-2 rtl:space-x-reverse bg-success/10 text-success border-success/30 hover:bg-success/20 transition-all duration-200">
            <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
            <span className="text-xs font-semibold">
              {tCommon('header.updated')} {formatLastRefresh(lastDataRefresh)}
            </span>
          </Badge>

          {/* User Menu */}
          {isAuthenticated ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="relative h-10 rounded-lg px-3 hover:bg-muted/80 transition-all duration-200 group"
              >
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  <Avatar className="h-8 w-8 ring-2 ring-primary/20 shadow-sm">
                    <AvatarImage src="" alt={user?.displayname || 'User'} />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-semibold text-sm">
                      {isLoading ? '...' : getUserInitials(user)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden sm:flex flex-col text-left">
                    <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                      {isLoading ? 'Loading...' : (user?.displayname || user?.username || 'User')}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {isLoading ? '...' : getUserRole(user)}
                    </span>
                  </div>
                  <Icon 
                    name="ChevronDown" 
                    size={14} 
                    className="text-muted-foreground group-hover:text-foreground transition-all duration-200"
                  />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {isLoading ? 'Loading...' : (user?.displayname || user?.username || 'User')}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {isLoading ? '...' : (user?.email || 'No email provided')}
                  </p>
                  <Badge variant="secondary" className="w-fit mt-1 text-xs">
                    {isLoading ? '...' : (user?.isAdmin ? 'Admin Access' : `${getUserRole(user)} Access`)}
                  </Badge>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer">
                <Icon name="User" size={16} className="mr-2" />
                <span>{tCommon('user.profile_settings', 'Profile Settings')}</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                <Icon name="Settings" size={16} className="mr-2" />
                <span>{tCommon('user.dashboard_preferences', 'Dashboard Preferences')}</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                <Icon name="Bell" size={16} className="mr-2" />
                <span>{tCommon('user.notification_settings', 'Notification Settings')}</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                <Icon name="HelpCircle" size={16} className="mr-2" />
                <span>{tCommon('user.help_support', 'Help & Support')}</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="cursor-pointer text-error focus:text-error focus:bg-error/10"
                onClick={handleLogout}
                disabled={isLoggingOut}
              >
                <Icon name={isLoggingOut ? "Loader2" : "LogOut"} size={16} className={`mr-2 ${isLoggingOut ? 'animate-spin' : ''}`} />
                <span>{isLoggingOut ? 'Signing Out...' : tCommon('user.sign_out', 'Sign Out')}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          ) : (
            /* Show login button when not authenticated */
            <Button 
              onClick={() => navigate('/login')} // You can create a login page
              variant="default"
              size="sm"
              className="h-9"
            >
              <Icon name="LogIn" size={16} className="mr-2" />
              Sign In
            </Button>
          )}

        </div>
      </div>
      {/* Mobile Navigation */}
      <div className="lg:hidden border-t border-border/50 bg-background/95 backdrop-blur-sm">
        <nav className="flex overflow-x-auto py-3 px-4 space-x-2 rtl:space-x-reverse">
          {navigationItems?.map((item) => {
            const isActive = location?.pathname === item?.path;
            return (
              <Button
                key={item?.path}
                variant="ghost"
                size="sm"
                onClick={() => handleNavigation(item?.path)}
                 className={`
                    flex flex-col items-center space-y-1 px-4 py-3 min-w-fit relative h-auto
                    transition-all duration-300 whitespace-nowrap
                    ${isActive 
                      ? 'text-primary hover:text-primary/80' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/80 hover:shadow-sm'
                    }
                `}
              >
                <Icon name={item?.icon} size={16} />
                <span className="text-xs font-medium">{item?.label}</span>
                {/* Active indicator for mobile */}
                {isActive && (
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-6 h-1 bg-primary rounded-full shadow-sm"></div>
                )}
              </Button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};

export default Header;