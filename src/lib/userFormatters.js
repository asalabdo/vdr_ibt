/**
 * Centralized User Data Formatters
 * Eliminates duplication between auth.js and users.js
 */

import { getUserRole, calculateUserPermissions } from './userRoles';

/**
 * Base user data formatter - used by all other formatters
 * @param {Object} userData - Raw user data from Nextcloud
 * @param {string} userId - User ID/username
 * @param {Object} options - Formatting options
 * @returns {Object} Formatted user data
 */
export const formatUserBase = (userData, userId, options = {}) => {
  const {
    includeRoleInfo = true,
    includePermissions = true,
    includeStatus = true
  } = options;
  
  const roleInfo = includeRoleInfo ? getUserRole(userData) : null;
  
  return {
    id: userData.id || userId,
    username: userId,
    displayname: userData.displayname || userData['display-name'] || userId,
    email: userData.email || '',
    groups: userData.groups || [],
    subadmin: userData.subadmin || [],
    quota: userData.quota || {},
    
    // Role information (optional)
    ...(includeRoleInfo && {
      role: roleInfo.role,
      roleLevel: roleInfo.level,
      managedGroups: roleInfo.managedGroups,
      
      // Role flags
      isAdmin: roleInfo.role === 'admin',
      isSubadmin: roleInfo.role === 'subadmin',
      canManageUsers: roleInfo.canManageUsers,
      canManageAllGroups: roleInfo.canManageAllGroups,
      canViewGroups: roleInfo.canViewGroups,
      canAccessSystemSettings: roleInfo.canAccessSystemSettings,
    }),
    
    // Permissions (optional)
    ...(includePermissions && {
      permissions: calculateUserPermissions(userData),
    }),
    
    // Status information (optional)
    ...(includeStatus && {
      enabled: userData.enabled !== false,
      language: userData.language || 'en',
      locale: userData.locale || 'en',
      lastLogin: userData.lastLogin || new Date().toISOString(),
      backend: userData.backend || '',
      storageLocation: userData.storageLocation || '',
    }),
  };
};

/**
 * Format user data for authentication (full details)
 * @param {Object} userData - Raw user data from Nextcloud
 * @param {string} username - Username used for login
 * @returns {Object} Formatted user data
 */
export const formatAuthUser = (userData, username) => {
  return formatUserBase(userData, username, {
    includeRoleInfo: true,
    includePermissions: true,
    includeStatus: true
  });
};

/**
 * Format user data for user lists (minimal data)
 * @param {Array} usersArray - Raw users array from Nextcloud
 * @returns {Array} Formatted users array
 */
export const formatUsersList = (usersArray) => {
  if (!Array.isArray(usersArray)) return [];
  
  return usersArray.map(username => 
    formatUserBase({ id: username }, username, {
      includeRoleInfo: false,
      includePermissions: false,
      includeStatus: false
    })
  );
};

/**
 * Format detailed user data (for user details views)
 * @param {Object} userData - Raw user data from Nextcloud
 * @param {string} userId - User ID
 * @returns {Object} Formatted user data
 */
export const formatUserDetails = (userData, userId) => {
  return {
    ...formatUserBase(userData, userId),
    // Additional fields specific to user details
    phone: userData.phone || '',
    address: userData.address || '',
    website: userData.website || '',
    twitter: userData.twitter || '',
    fediverse: userData.fediverse || '',
    organisation: userData.organisation || '',
    role: userData.role || '',
    headline: userData.headline || '',
    biography: userData.biography || '',
  };
};

/**
 * Get user initials for avatar display
 * @param {Object} userData - User data
 * @returns {string} User initials
 */
export const getUserInitials = (userData) => {
  if (!userData) return '?';
  const name = userData.displayname || userData.username || '';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};
