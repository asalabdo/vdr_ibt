import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from '@/components/ui/sidebar';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import AppIcon from '@/components/AppIcon';
import { usePermissions } from '@/hooks/api/useAuth';

export function AppSidebar() {
  const location = useLocation();
  const { t, i18n } = useTranslation('navigation');
  const [openSections, setOpenSections] = useState({ 
    dashboard: false, 
    workspace: true 
  });
  
  // Determine sidebar side based on language direction
  const isRTL = i18n.language === 'ar';
  const sidebarSide = isRTL ? 'right' : 'left';
  
  // Get user permissions
  const {
    canAccessUsersManagement,
    canAccessGroupsManagement,
    canAccessAuditLogs,
    canAccessRolesPermissions,
    canManageDataRooms,
    isAdmin,
    isSubadmin,
    role
  } = usePermissions();

  // Define route sections with permission requirements
  const allRouteSections = [
    {
      id: 'dashboard',
      section: t('sections.dashboard'),
      icon: 'BarChart3',
      items: [
        { 
          label: t('routes.executive_overview'), 
          path: '/executive-deal-flow-dashboard', 
          icon: 'BarChart3', 
          requiresPermission: 'data_rooms.read' 
        },
        { 
          label: t('routes.deal_intelligence'), 
          path: '/deal-analytics-intelligence-dashboard', 
          icon: 'TrendingUp', 
          requiresPermission: 'audit.view' 
        },
        { 
          label: t('routes.operations_center'), 
          path: '/vdr-operations-command-center', 
          icon: 'Monitor', 
          requiresPermission: 'data_rooms.manage' 
        },
        { 
          label: t('routes.compliance_security'), 
          path: '/compliance-security-monitoring-dashboard', 
          icon: 'Shield', 
          requiresPermission: 'audit.view' 
        },
      ]
    },
    {
      id: 'workspace',
      section: t('sections.workspace'),
      icon: 'Layers',
      items: [
        { 
          label: t('routes.home'), 
          path: '/', 
          icon: 'Home', 
          requiresPermission: null 
        },
        { 
          label: t('routes.data_rooms'), 
          path: '/data-rooms-management', 
          icon: 'Folder', 
          requiresPermission: 'data_rooms.read' 
        },
        { 
          label: t('routes.groups'), 
          path: '/groups-management', 
          icon: 'Users', 
          requiresPermission: 'groups.manage' 
        },
        { 
          label: t('routes.q_a_center'), 
          path: '/q-a-management-center', 
          icon: 'MessageSquare', 
          requiresPermission: 'data_rooms.read' 
        },
        { 
          label: t('routes.document_console'), 
          path: '/document-management-console', 
          icon: 'FileText', 
          requiresPermission: 'documents.view' 
        },
        { 
          label: t('routes.users'), 
          path: '/users-management', 
          icon: 'UserCog', 
          requiresPermission: 'users.manage' 
        },
        { 
          label: t('routes.roles_permissions'), 
          path: '/roles-permissions', 
          icon: 'Key', 
          requiresAdmin: true 
        },
        { 
          label: t('routes.audit_logs'), 
          path: '/audit-logs', 
          icon: 'Clipboard', 
          requiresPermission: 'audit.view' 
        },
        { 
          label: t('routes.notifications'), 
          path: '/notifications', 
          icon: 'Bell', 
          requiresPermission: null 
        },
        { 
          label: t('routes.settings'), 
          path: '/settings', 
          icon: 'Settings', 
          requiresPermission: null 
        }
      ]
    }
  ];

  // Filter items based on permissions
  const checkPermission = (item) => {
    // Always show items with no permission requirements
    if (!item.requiresPermission && !item.requiresAdmin && !item.requiresSubadmin) {
      return true;
    }
    
    // Check admin requirement
    if (item.requiresAdmin && !isAdmin) {
      return false;
    }
    
    // Check subadmin requirement
    if (item.requiresSubadmin && !isSubadmin && !isAdmin) {
      return false;
    }
    
    // Check specific permission requirements
    if (item.requiresPermission) {
      switch (item.requiresPermission) {
        case 'users.manage':
          return canAccessUsersManagement;
        case 'groups.manage':
          return canAccessGroupsManagement;
        case 'audit.view':
          return canAccessAuditLogs;
        case 'data_rooms.manage':
          return canManageDataRooms;
        case 'data_rooms.read':
          return true; // Most users should have read access
        case 'documents.view':
          return true; // Most users should have document view access
        default:
          return true;
      }
    }
    
    return true;
  };

  // Filter route sections based on user permissions
  const routeSections = allRouteSections.map(section => ({
    ...section,
    items: section.items.filter(checkPermission)
  })).filter(section => section.items.length > 0);

  const toggleSection = (sectionId) => {
    setOpenSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const isActivePath = (path) => {
    return location.pathname === path;
  };

  return (
    <Sidebar variant="inset" side={sidebarSide} className={isRTL ? "border-l" : "border-r"}>
      <SidebarHeader className="border-b px-6 py-4">
        <div className="flex items-center gap-2 rtl:space-x-reverse">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <AppIcon name="Building2" size={18} />
          </div>
          <div className="grid flex-1 text-left rtl:text-right text-sm leading-tight">
            <span className="truncate font-semibold">VDR Platform</span>
            <span className="truncate text-xs text-muted-foreground">
              {role === 'admin' ? 'Administrator' : role === 'subadmin' ? 'Sub Admin' : 'User'}
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {routeSections.map((section) => (
          <Collapsible
            key={section.id}
            open={openSections[section.id]}
            onOpenChange={() => toggleSection(section.id)}
            className="group/collapsible"
          >
            <SidebarGroup>
              <SidebarGroupLabel asChild>
                <CollapsibleTrigger className="flex w-full items-center gap-2 rtl:space-x-reverse px-2 py-2 text-left rtl:text-right text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground [&[data-state=open]>svg]:rotate-90">
                  <AppIcon name={section.icon} size={16} />
                  <span className="flex-1">{section.section}</span>
                  <AppIcon 
                    name="ChevronRight" 
                    size={16} 
                    className={`transition-transform duration-200 ${isRTL ? 'rotate-180' : ''}`}
                  />
                </CollapsibleTrigger>
              </SidebarGroupLabel>
              
              <CollapsibleContent>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {section.items.map((item) => {
                      const isActive = isActivePath(item.path);
                      return (
                        <SidebarMenuItem key={item.path}>
                          <SidebarMenuButton 
                            asChild 
                            isActive={isActive}
                            className="w-full"
                          >
                            <Link to={item.path} className="flex items-center gap-3 rtl:space-x-reverse">
                              <AppIcon name={item.icon} size={18} />
                              <span className="flex-1 truncate text-left rtl:text-right">{item.label}</span>
                              {/* Show admin badge for admin-only features */}
                              {item.requiresAdmin && (
                                <Badge variant="secondary" className="text-xs">
                                  Admin
                                </Badge>
                              )}
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      );
                    })}
                  </SidebarMenu>
                </SidebarGroupContent>
              </CollapsibleContent>
            </SidebarGroup>
          </Collapsible>
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t p-4">
        <div className="text-xs text-muted-foreground text-center">
          © {new Date().getFullYear()} Ibtikarya VDR
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
