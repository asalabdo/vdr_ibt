import { useMutation, useQueryClient } from '@tanstack/react-query';
import { usersAPI } from '../../api/users';
import { groupsAPI } from '../../api/groups';
import { getUserRole, isUserAdmin, isUserSubadmin, getUserRoleDisplay } from '../../lib/userRoles';
import { useUserSubadminGroups } from './useGroups';
import { useAuth } from './useAuth';

/**
 * User Role Management Hooks
 * Centralized hooks for all user role operations
 */

// Query keys
const ROLE_QUERY_KEYS = {
  userSubadminGroups: (userId) => ['users', 'subadminGroups', userId],
};

// Note: useUserSubadminGroups is defined in useGroups.js - import it from there if needed

/**
 * Make user admin
 * @param {Object} options - Mutation options
 * @returns {Object} React Query mutation
 */
export const useMakeUserAdmin = (options = {}) => {
  const queryClient = useQueryClient();
  const { onSuccess: customOnSuccess, onError: customOnError, ...restOptions } = options;
  
  return useMutation({
    mutationFn: (userId) => usersAPI.makeUserAdmin(userId),
    onSuccess: (data, userId) => {
      // Invalidate all user-related queries
      queryClient.invalidateQueries({ queryKey: ['users', 'details', userId] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      
      if (customOnSuccess) {
        customOnSuccess(data, userId);
      }
    },
    onError: (error) => {
      console.error('❌ Failed to make user admin:', error.message);
      if (customOnError) {
        customOnError(error);
      }
    },
    ...restOptions,
  });
};

/**
 * Remove admin privileges
 * @param {Object} options - Mutation options
 * @returns {Object} React Query mutation
 */
export const useRemoveAdminPrivileges = (options = {}) => {
  const queryClient = useQueryClient();
  const { onSuccess: customOnSuccess, onError: customOnError, ...restOptions } = options;
  
  return useMutation({
    mutationFn: (userId) => usersAPI.removeAdminPrivileges(userId),
    onSuccess: (data, userId) => {
      queryClient.invalidateQueries({ queryKey: ['users', 'details', userId] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      
      if (customOnSuccess) {
        customOnSuccess(data, userId);
      }
    },
    onError: (error) => {
      console.error('❌ Failed to remove admin privileges:', error.message);
      if (customOnError) {
        customOnError(error);
      }
    },
    ...restOptions,
  });
};

/**
 * Promote user to subadmin
 * @param {Object} options - Mutation options
 * @returns {Object} React Query mutation
 */
export const usePromoteUserToSubadmin = (options = {}) => {
  const queryClient = useQueryClient();
  const { onSuccess: customOnSuccess, onError: customOnError, ...restOptions } = options;
  
  return useMutation({
    mutationFn: ({ userId, groupId }) => groupsAPI.promoteUserToSubadmin(userId, groupId),
    onSuccess: (data, variables) => {
      const { userId, groupId } = variables;
      
      // Invalidate user and group related queries
      queryClient.invalidateQueries({ queryKey: ['users', 'details', userId] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['groups', 'details', groupId] });
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      queryClient.invalidateQueries({ queryKey: ROLE_QUERY_KEYS.userSubadminGroups(userId) });
      
      if (customOnSuccess) {
        customOnSuccess(data, variables);
      }
    },
    onError: (error) => {
      console.error('❌ Failed to promote user to subadmin:', error.message);
      if (customOnError) {
        customOnError(error);
      }
    },
    ...restOptions,
  });
};

/**
 * Demote user from subadmin
 * @param {Object} options - Mutation options
 * @returns {Object} React Query mutation
 */
export const useDemoteUserFromSubadmin = (options = {}) => {
  const queryClient = useQueryClient();
  const { onSuccess: customOnSuccess, onError: customOnError, ...restOptions } = options;
  
  return useMutation({
    mutationFn: ({ userId, groupId }) => groupsAPI.demoteUserFromSubadmin(userId, groupId),
    onSuccess: (data, variables) => {
      const { userId, groupId } = variables;
      
      queryClient.invalidateQueries({ queryKey: ['users', 'details', userId] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['groups', 'details', groupId] });
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      queryClient.invalidateQueries({ queryKey: ROLE_QUERY_KEYS.userSubadminGroups(userId) });
      
      if (customOnSuccess) {
        customOnSuccess(data, variables);
      }
    },
    onError: (error) => {
      console.error('❌ Failed to demote user from subadmin:', error.message);
      if (customOnError) {
        customOnError(error);
      }
    },
    ...restOptions,
  });
};

/**
 * Hook to get user role information with utilities
 * @param {Object} userData - User data
 * @param {string} userId - User ID (for subadmin groups lookup)
 * @returns {Object} Role information and utilities
 */
export const useUserRole = (userData, userId = null) => {
  const { user: currentUser } = useAuth();
  
  // Only fetch subadmin groups if:
  // 1. userId is provided
  // 2. Current user is admin OR it's the current user's own data
  // 3. Target user is not already an admin
  const canFetchSubadminGroups = !!userId && 
    (currentUser?.isAdmin || currentUser?.id === userId) && 
    !isUserAdmin(userData);
  
  const { data: subadminGroups } = useUserSubadminGroups(userId, { 
    enabled: canFetchSubadminGroups
  });
  
  if (!userData) {
    return {
      role: 'user',
      isAdmin: false,
      isSubadmin: false,
      roleInfo: null,
      display: null
    };
  }
  
  const roleInfo = getUserRole(userData, subadminGroups);
  const displayInfo = getUserRoleDisplay(userData, subadminGroups);
  
  return {
    role: roleInfo.role,
    isAdmin: roleInfo.role === 'admin',
    isSubadmin: roleInfo.role === 'subadmin',
    roleInfo,
    display: displayInfo.display, // Extract the display object correctly
    subadminGroups: subadminGroups || [],
    canManageUsers: roleInfo.canManageUsers,
    canManageAllGroups: roleInfo.canManageAllGroups,
    canViewGroups: roleInfo.canViewGroups,
    canAccessSystemSettings: roleInfo.canAccessSystemSettings,
    managedGroups: roleInfo.managedGroups
  };
};

/**
 * Comprehensive role management hook
 * Provides all role-related operations
 * @returns {Object} All role management functions
 */
export const useRoleManagement = () => {
  return {
    // Queries
    useUserRole,
    
    // Mutations
    useMakeUserAdmin,
    useRemoveAdminPrivileges,
    usePromoteUserToSubadmin,
    useDemoteUserFromSubadmin,
    
    // Utilities
    getUserRole,
    isUserAdmin,
    isUserSubadmin,
    getUserRoleDisplay,
  };
};
