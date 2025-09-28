import React from 'react';
import { Navigate } from 'react-router-dom';
import { usePermissions } from '../hooks/api/useAuth';
import { PERMISSIONS } from '../lib/permissions';
import AccessDeniedPage from './AccessDeniedPage';

/**
 * PermissionGuard Component
 * 
 * Protects routes and components based on user permissions and roles.
 * Can be used to wrap entire pages or individual components.
 * 
 * Features:
 * - Permission-based access control
 * - Role-based access control
 * - Custom fallback components
 * - Loading states
 * - Accessible error messages
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Content to render if user has permission
 * @param {string|Array} [props.permission] - Required permission(s)
 * @param {string|Array} [props.role] - Required role(s)
 * @param {boolean} [props.requireAdmin=false] - Require admin role
 * @param {boolean} [props.requireSubadmin=false] - Require subadmin+ role  
 * @param {React.ReactNode} [props.fallback] - Custom fallback component
 * @param {string} [props.redirectTo] - Redirect path for unauthorized users
 * @param {boolean} [props.showError=true] - Show error message for unauthorized
 * @param {string} [props.errorTitle] - Custom error title
 * @param {string} [props.errorMessage] - Custom error message
 */
const PermissionGuard = ({
  children,
  permission,
  role,
  requireAdmin = false,
  requireSubadmin = false,
  fallback = null,
  redirectTo = null,
  showError = true,
  errorTitle = "Access Denied",
  errorMessage = "You don't have permission to access this resource.",
  ...props
}) => {
  const {
    isAdmin,
    isSubadmin,
    role: userRole,
    hasPermission,
    canManageUsers,
    canManageAllGroups,
    canAccessSystemSettings
  } = usePermissions();

  // Check if user meets admin requirement
  if (requireAdmin && !isAdmin) {
    return handleUnauthorized();
  }

  // Check if user meets subadmin+ requirement
  if (requireSubadmin && !isSubadmin && !isAdmin) {
    return handleUnauthorized();
  }

  // Check role-based access
  if (role) {
    const requiredRoles = Array.isArray(role) ? role : [role];
    if (!requiredRoles.includes(userRole)) {
      return handleUnauthorized();
    }
  }

  // Check permission-based access
  if (permission) {
    const requiredPermissions = Array.isArray(permission) ? permission : [permission];
    const hasRequiredPermission = requiredPermissions.some(perm => hasPermission(perm));
    
    if (!hasRequiredPermission) {
      return handleUnauthorized();
    }
  }

  // Handle unauthorized access
  function handleUnauthorized() {
    // Custom fallback component
    if (fallback) {
      return fallback;
    }

    // Redirect if specified
    if (redirectTo) {
      return <Navigate to={redirectTo} replace />;
    }

    // Don't show error (render nothing)
    if (!showError) {
      return null;
    }

    // Determine resource type for better messaging
    let resourceType = 'resource';
    if (permission) {
      const permissionString = Array.isArray(permission) ? permission[0] : permission;
      if (permissionString.includes('groups')) resourceType = 'groups';
      else if (permissionString.includes('users')) resourceType = 'users';
      else if (permissionString.includes('audit')) resourceType = 'audit';
      else if (permissionString.includes('data_rooms')) resourceType = 'data rooms';
      else if (permissionString.includes('documents')) resourceType = 'documents';
    }

    // Determine required role for display
    let requiredRole = null;
    if (requireAdmin) requiredRole = 'admin';
    else if (requireSubadmin) requiredRole = 'subadmin';

    // Enhanced error UI using AccessDeniedPage
    return (
      <AccessDeniedPage
        title={errorTitle}
        message={errorMessage}
        userRole={userRole}
        requiredPermissions={permission}
        requiredRole={requiredRole}
        requireAdmin={requireAdmin}
        requireSubadmin={requireSubadmin}
        resourceType={resourceType}
        showContactSupport={true}
        {...props}
      />
    );
  }

  // User has required permissions - render children
  return <>{children}</>;
};

/**
 * AdminGuard - Shorthand for admin-only access
 */
export const AdminGuard = ({ children, ...props }) => (
  <PermissionGuard requireAdmin={true} {...props}>
    {children}
  </PermissionGuard>
);

/**
 * SubadminGuard - Shorthand for subadmin+ access
 */
export const SubadminGuard = ({ children, ...props }) => (
  <PermissionGuard requireSubadmin={true} {...props}>
    {children}
  </PermissionGuard>
);

/**
 * UsersManagementGuard - Guard for users management access
 */
export const UsersManagementGuard = ({ children, ...props }) => (
  <PermissionGuard permission={PERMISSIONS.USERS_MANAGE} {...props}>
    {children}
  </PermissionGuard>
);

/**
 * GroupsManagementGuard - Guard for groups management access
 * Admins can create/manage all groups, subadmins can view/manage their assigned groups only
 */
export const GroupsManagementGuard = ({ children, ...props }) => (
  <PermissionGuard requireSubadmin={true} {...props}>
    {children}
  </PermissionGuard>
);

/**
 * AuditLogsGuard - Guard for audit logs access
 */
export const AuditLogsGuard = ({ children, ...props }) => (
  <PermissionGuard permission={PERMISSIONS.AUDIT_VIEW} {...props}>
    {children}
  </PermissionGuard>
);

/**
 * SystemSettingsGuard - Guard for system settings access (admin only)
 */
export const SystemSettingsGuard = ({ children, ...props }) => (
  <PermissionGuard requireAdmin={true} {...props}>
    {children}
  </PermissionGuard>
);

export default PermissionGuard;
