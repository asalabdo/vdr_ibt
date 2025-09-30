/**
 * Centralized User Role Utilities
 * Consolidates all role-related logic to eliminate duplication
 */

import { PERMISSIONS, PERMISSION_GROUPS } from './permissions';

/**
 * User role constants
 */
export const USER_ROLES = {
  ADMIN: 'admin',
  SUBADMIN: 'subadmin', 
  USER: 'user'
};

/**
 * Determine user role based on groups and subadmin status
 * 
 * IMPORTANT: Based on verified Nextcloud architecture
 * 
 * ADMIN (member of 'admin' group):
 * - Full system access
 * - Can CREATE and MANAGE all users, groups, and Group Folders
 * 
 * SUBADMIN (assigned to specific groups via subadmin API):
 * - LIMITED scope to assigned groups only
 * - canManageUsers: true means they can EDIT existing users, NOT create new ones
 * - Cannot create new users, groups, or Group Folders
 * - Can only add/remove existing users to/from their managed groups
 * 
 * @param {Object} userData - User data from Nextcloud
 * @param {Array} subadminGroups - Array of subadmin groups (optional)
 * @returns {Object} User role information
 * 
 * Reference: Docs/nextcloud-admin-subadmin-guide.md (Verified: Sept 30, 2025)
 */
export const getUserRole = (userData, subadminGroups = null) => {
  if (!userData) {
    return {
      role: USER_ROLES.USER,
      level: 'standard',
      canManageUsers: false,
      canManageAllGroups: false,
      canViewGroups: false,
      canAccessSystemSettings: false,
      managedGroups: []
    };
  }
  
  const { groups = [], subadmin = [] } = userData;
  
  // Check if user is admin
  if (groups.includes('admin')) {
    return {
      role: USER_ROLES.ADMIN,
      level: 'full',
      canManageUsers: true,        // ✅ Can CREATE and EDIT all users
      canManageAllGroups: true,    // ✅ Can CREATE and EDIT all groups
      canViewGroups: true,
      canAccessSystemSettings: true,
      managedGroups: 'all'
    };
  }
  
  // Check if user is subadmin (use provided subadminGroups or fallback to subadmin property)
  const userSubadminGroups = subadminGroups || subadmin;
  if (userSubadminGroups && userSubadminGroups.length > 0) {
    return {
      role: USER_ROLES.SUBADMIN,
      level: 'limited',
      canManageUsers: true,        // ⚠️ LIMITED: Can only EDIT existing users in managed groups
                                   //    ❌ CANNOT create new users
                                   //    ❌ CANNOT delete users
      canManageAllGroups: false,   // ❌ Can only view/manage assigned groups
      canViewGroups: true,         // ✅ Can view managed groups
      canAccessSystemSettings: false, // ❌ No system settings access
      managedGroups: userSubadminGroups  // Limited to these groups only
    };
  }
  
  // Regular user
  return {
    role: USER_ROLES.USER,
    level: 'standard',
    canManageUsers: false,
    canManageAllGroups: false,
    canViewGroups: false,
    canAccessSystemSettings: false,
    managedGroups: []
  };
};

/**
 * Check if user is admin
 * @param {Object} userData - User data
 * @returns {boolean}
 */
export const isUserAdmin = (userData) => {
  return userData?.groups?.includes('admin') || false;
};

/**
 * Check if user is subadmin
 * @param {Object} userData - User data
 * @param {Array} subadminGroups - Array of subadmin groups
 * @returns {boolean}
 */
export const isUserSubadmin = (userData, subadminGroups = null) => {
  const userSubadminGroups = subadminGroups || userData?.subadmin;
  return userSubadminGroups && userSubadminGroups.length > 0;
};

/**
 * Get user role display information
 * @param {Object} userData - User data
 * @param {Array} subadminGroups - Array of subadmin groups
 * @returns {Object} Role display info
 */
export const getUserRoleDisplay = (userData, subadminGroups = null) => {
  const roleInfo = getUserRole(userData, subadminGroups);
  
  const roleDisplayMap = {
    [USER_ROLES.ADMIN]: {
      label: 'Administrator',
      variant: 'default',
      icon: 'ShieldCheck',
      color: 'amber'
    },
    [USER_ROLES.SUBADMIN]: {
      label: 'Company Administrator', 
      variant: 'secondary',
      icon: 'Shield',
      color: 'blue'
    },
    [USER_ROLES.USER]: {
      label: 'Regular User',
      variant: 'outline', 
      icon: 'User',
      color: 'gray'
    }
  };
  
  return {
    ...roleInfo,
    display: roleDisplayMap[roleInfo.role]
  };
};

/**
 * Calculate user permissions based on role
 * @param {Object} userData - User data
 * @param {Array} subadminGroups - Array of subadmin groups
 * @returns {Array} Array of permission strings
 */
export const calculateUserPermissions = (userData, subadminGroups = null) => {
  const permissions = ['user']; // Base permission
  const roleInfo = getUserRole(userData, subadminGroups);
  const { groups = [] } = userData;
  
  // Admin permissions
  if (roleInfo.role === USER_ROLES.ADMIN) {
    permissions.push(...PERMISSION_GROUPS.ADMIN);
  }
  
  // Subadmin permissions
  if (roleInfo.role === USER_ROLES.SUBADMIN) {
    permissions.push(...PERMISSION_GROUPS.SUBADMIN);
  }
  
  // Group-based permissions
  if (groups.includes('managers')) {
    permissions.push(...PERMISSION_GROUPS.MANAGER);
  }
  
  // Standard user permissions
  permissions.push(...PERMISSION_GROUPS.USER);
  
  // Additional group-based permissions
  if (groups.includes('editors')) {
    permissions.push(PERMISSIONS.DOCUMENTS_EDIT, PERMISSIONS.DOCUMENTS_UPLOAD);
  }
  
  if (groups.includes('viewers')) {
    permissions.push(PERMISSIONS.DOCUMENTS_VIEW);
  }
  
  return [...new Set(permissions)]; // Remove duplicates
};
