import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { groupsAPI } from '../../api/groups';

/**
 * Groups Management Hooks for React Query Integration
 * 
 * This module provides React hooks for group management operations using React Query.
 * All hooks are optimized for server state management with proper caching,
 * error handling, and loading states.
 * 
 * Key Features:
 * - Automatic cache invalidation and updates
 * - Optimistic updates for better UX
 * - Comprehensive error handling
 * - Loading state management
 * - Background data synchronization
 * - Search and pagination support
 * 
 * @module useGroups
 */

// Query keys for consistent caching
const QUERY_KEYS = {
  groups: ['groups'],
  groupsList: (options) => ['groups', 'list', options],
  groupDetails: (groupId) => ['groups', 'details', groupId],
  groupMembers: (groupId) => ['groups', 'members', groupId],
  groupSubadmins: (groupId) => ['groups', 'subadmins', groupId],
  searchGroups: (searchTerm, options) => ['groups', 'search', searchTerm, options],
};

/**
 * Get list of groups with optional filtering and pagination
 * @param {Object} options - Query options
 * @param {string} [options.search] - Search term
 * @param {number} [options.limit] - Limit number of results
 * @param {number} [options.offset] - Offset for pagination
 * @param {boolean} [options.enabled=true] - Whether to enable the query
 * @returns {Object} React Query result object
 */
export const useGroups = (options = {}) => {
  const { enabled = true, ...queryOptions } = options;
  
  return useQuery({
    queryKey: QUERY_KEYS.groupsList(queryOptions),
    queryFn: () => groupsAPI.getGroups(queryOptions),
    enabled,
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
    select: (data) => ({
      ...data,
      groups: data.groups || [],
    }),
  });
};

/**
 * Get detailed information for a specific group including members
 * @param {string} groupId - Group ID
 * @param {Object} options - Query options
 * @param {boolean} [options.enabled=true] - Whether to enable the query
 * @returns {Object} React Query result object
 */
export const useGroupDetails = (groupId, options = {}) => {
  const { enabled = true } = options;
  
  return useQuery({
    queryKey: QUERY_KEYS.groupDetails(groupId),
    queryFn: () => groupsAPI.getGroupDetails(groupId),
    enabled: enabled && !!groupId,
    staleTime: 1000 * 60 * 1, // 1 minute
    gcTime: 1000 * 60 * 3, // 3 minutes
    retry: (failureCount, error) => {
      // Don't retry if group doesn't exist
      if (error?.message?.includes('not found')) {
        return false;
      }
      return failureCount < 2;
    },
    select: (data) => ({
      ...data,
      group: data.group || null,
    }),
  });
};

/**
 * Get subadmins for a specific group
 * @param {string} groupId - Group ID
 * @param {Object} options - Query options
 * @param {boolean} [options.enabled=true] - Whether to enable the query
 * @returns {Object} React Query result object
 */
export const useGroupSubadmins = (groupId, options = {}) => {
  const { enabled = true } = options;
  
  return useQuery({
    queryKey: QUERY_KEYS.groupSubadmins(groupId),
    queryFn: () => groupsAPI.getGroupSubadmins(groupId),
    enabled: enabled && !!groupId,
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
    select: (data) => ({
      ...data,
      subadmins: data.subadmins || [],
    }),
  });
};

/**
 * Search groups with debounced queries
 * @param {string} searchTerm - Search term
 * @param {Object} options - Query options
 * @param {number} [options.limit] - Limit number of results
 * @param {boolean} [options.enabled=true] - Whether to enable the query
 * @returns {Object} React Query result object
 */
export const useSearchGroups = (searchTerm, options = {}) => {
  const { enabled = true, ...queryOptions } = options;
  
  return useQuery({
    queryKey: QUERY_KEYS.searchGroups(searchTerm, queryOptions),
    queryFn: () => groupsAPI.searchGroups(searchTerm, queryOptions),
    enabled: enabled && !!searchTerm?.trim(),
    staleTime: 1000 * 30, // 30 seconds
    gcTime: 1000 * 60 * 2, // 2 minutes
    retry: 1,
    select: (data) => ({
      ...data,
      groups: data.groups || [],
    }),
  });
};

/**
 * Hook for available groups (optimized for data room assignment)
 * This is used specifically in data rooms management for group selection
 * @param {Object} options - Query options
 * @param {string} [options.search] - Search term
 * @param {boolean} [options.enabled=true] - Whether to enable the query
 * @returns {Object} React Query result object
 */
export const useAvailableGroups = (options = {}) => {
  const { enabled = true, search } = options;
  
  return useQuery({
    queryKey: ['availableGroups', { search }],
    queryFn: () => groupsAPI.getGroups({ search }),
    enabled,
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
    select: (data) => ({
      ...data,
      groups: data.groups || [],
    }),
  });
};

/**
 * Hook to get member counts for multiple groups
 * @param {Array} groupIds - Array of group IDs to fetch member counts for
 * @param {Object} options - Query options
 * @param {boolean} [options.enabled=true] - Whether to enable the query
 * @returns {Object} React Query result object
 */
export const useGroupMemberCounts = (groupIds = [], options = {}) => {
  const { enabled = true, ...queryOptions } = options;
  
  return useQuery({
    queryKey: ['groupMemberCounts', { groupIds: groupIds?.sort() }],
    queryFn: () => groupsAPI.getGroupMemberCounts(groupIds),
    enabled: enabled && Array.isArray(groupIds) && groupIds.length > 0,
    staleTime: 1000 * 60, // 1 minute (shorter than basic groups list)
    gcTime: 1000 * 60 * 3, // 3 minutes
    retry: 1,
    select: (data) => data?.memberCounts || {},
  });
};

/**
 * Create a new group
 * @param {Object} options - Mutation options
 * @param {Function} [options.onSuccess] - Success callback
 * @param {Function} [options.onError] - Error callback
 * @returns {Object} React Query mutation object
 */
export const useCreateGroup = (options = {}) => {
  const queryClient = useQueryClient();
  const { onSuccess, onError, ...mutationOptions } = options;
  
  return useMutation({
    mutationFn: groupsAPI.createGroup,
    onSuccess: (data, variables) => {
      console.log('✅ Group created successfully:', data.group.id);
      
      // Invalidate and refetch groups list
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.groups });
      queryClient.invalidateQueries({ queryKey: ['availableGroups'] });
      
      // Set new group data in cache
      queryClient.setQueryData(
        QUERY_KEYS.groupDetails(data.group.id),
        { success: true, group: data.group }
      );
      
      // Call custom success callback
      onSuccess?.(data, variables);
    },
    onError: (error, variables) => {
      console.error('❌ Failed to create group:', error.message);
      
      // Call custom error callback
      onError?.(error, variables);
    },
    ...mutationOptions,
  });
};

/**
 * Update group properties
 * @param {Object} options - Mutation options
 * @param {Function} [options.onSuccess] - Success callback
 * @param {Function} [options.onError] - Error callback
 * @returns {Object} React Query mutation object
 */
export const useUpdateGroup = (options = {}) => {
  const queryClient = useQueryClient();
  const { onSuccess, onError, ...mutationOptions } = options;
  
  return useMutation({
    mutationFn: ({ groupId, updates }) => groupsAPI.updateGroup(groupId, updates),
    onMutate: async ({ groupId, updates }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.groupDetails(groupId) });
      
      // Snapshot the previous value
      const previousGroup = queryClient.getQueryData(QUERY_KEYS.groupDetails(groupId));
      
      // Optimistically update to the new value
      if (previousGroup?.group) {
        queryClient.setQueryData(QUERY_KEYS.groupDetails(groupId), {
          ...previousGroup,
          group: {
            ...previousGroup.group,
            ...updates,
          },
        });
      }
      
      // Return a context object with the snapshotted value
      return { previousGroup, groupId };
    },
    onSuccess: (data, variables) => {
      console.log('✅ Group updated successfully:', variables.groupId);
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.groups });
      queryClient.invalidateQueries({ queryKey: ['availableGroups'] });
      
      // Update specific group data
      queryClient.setQueryData(
        QUERY_KEYS.groupDetails(variables.groupId),
        { success: true, group: data.group }
      );
      
      // Call custom success callback
      onSuccess?.(data, variables);
    },
    onError: (error, variables, context) => {
      console.error('❌ Failed to update group:', error.message);
      
      // Revert optimistic update on error
      if (context?.previousGroup && context?.groupId) {
        queryClient.setQueryData(QUERY_KEYS.groupDetails(context.groupId), context.previousGroup);
      }
      
      // Call custom error callback
      onError?.(error, variables, context);
    },
    ...mutationOptions,
  });
};

/**
 * Delete a group
 * @param {Object} options - Mutation options
 * @param {Function} [options.onSuccess] - Success callback
 * @param {Function} [options.onError] - Error callback
 * @returns {Object} React Query mutation object
 */
export const useDeleteGroup = (options = {}) => {
  const queryClient = useQueryClient();
  const { onSuccess, onError, ...mutationOptions } = options;
  
  return useMutation({
    mutationFn: groupsAPI.deleteGroup,
    onMutate: async (groupId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.groups });
      
      // Snapshot the previous groups list
      const previousGroups = queryClient.getQueryData(QUERY_KEYS.groups);
      
      // Optimistically remove the group from all lists
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.groups,
        exact: false,
      });
      
      // Return a context object with the snapshotted value
      return { previousGroups, groupId };
    },
    onSuccess: (data, groupId) => {
      console.log('✅ Group deleted successfully:', groupId);
      
      // Remove specific group data from cache
      queryClient.removeQueries({ queryKey: QUERY_KEYS.groupDetails(groupId) });
      queryClient.removeQueries({ queryKey: QUERY_KEYS.groupSubadmins(groupId) });
      queryClient.removeQueries({ queryKey: QUERY_KEYS.groupMembers(groupId) });
      
      // Remove from search cache (any search that might have included this group)
      queryClient.removeQueries({ queryKey: ['groups', 'search'], exact: false });
      queryClient.removeQueries({ queryKey: ['groupMemberCounts'], exact: false });
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.groups });
      queryClient.invalidateQueries({ queryKey: ['availableGroups'] });
      queryClient.invalidateQueries({ queryKey: ['dataRooms'] }); // Groups are used in data rooms
      queryClient.invalidateQueries({ queryKey: ['users'] }); // User lists might show group memberships
      
      // Update any existing groups lists to remove the deleted group
      queryClient.setQueriesData({ queryKey: ['groups'] }, (oldData) => {
        if (!oldData?.groups) return oldData;
        
        return {
          ...oldData,
          groups: oldData.groups.filter(group => group.id !== groupId),
          total: Math.max(0, (oldData.total || oldData.groups.length) - 1)
        };
      });
      
      // Call custom success callback
      onSuccess?.(data, groupId);
    },
    onError: (error, groupId, context) => {
      console.error('❌ Failed to delete group:', error.message);
      
      // Revert optimistic update on error
      if (context?.previousGroups) {
        queryClient.setQueryData(QUERY_KEYS.groups, context.previousGroups);
      }
      
      // Call custom error callback
      onError?.(error, groupId, context);
    },
    ...mutationOptions,
  });
};

/**
 * Promote user to subadmin of a group
 * @param {Object} options - Mutation options
 * @param {Function} [options.onSuccess] - Success callback
 * @param {Function} [options.onError] - Error callback
 * @returns {Object} React Query mutation object
 */
export const usePromoteUserToSubadmin = (options = {}) => {
  const queryClient = useQueryClient();
  const { onSuccess, onError, ...mutationOptions } = options;
  
  return useMutation({
    mutationFn: ({ userId, groupId }) => groupsAPI.promoteUserToSubadmin(userId, groupId),
    onSuccess: (data, variables) => {
      console.log('✅ User promoted to subadmin successfully:', variables.userId, 'in group', variables.groupId);
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.groupSubadmins(variables.groupId) });
      queryClient.invalidateQueries({ queryKey: ['userSubadminGroups', variables.userId] });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.groups });
      
      // Call custom success callback
      onSuccess?.(data, variables);
    },
    onError: (error, variables) => {
      console.error('❌ Failed to promote user to subadmin:', error.message);
      
      // Call custom error callback
      onError?.(error, variables);
    },
    ...mutationOptions,
  });
};

/**
 * Demote user from subadmin of a group
 * @param {Object} options - Mutation options
 * @param {Function} [options.onSuccess] - Success callback
 * @param {Function} [options.onError] - Error callback
 * @returns {Object} React Query mutation object
 */
export const useDemoteUserFromSubadmin = (options = {}) => {
  const queryClient = useQueryClient();
  const { onSuccess, onError, ...mutationOptions } = options;
  
  return useMutation({
    mutationFn: ({ userId, groupId }) => groupsAPI.demoteUserFromSubadmin(userId, groupId),
    onSuccess: (data, variables) => {
      console.log('✅ User demoted from subadmin successfully:', variables.userId, 'from group', variables.groupId);
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.groupSubadmins(variables.groupId) });
      queryClient.invalidateQueries({ queryKey: ['userSubadminGroups', variables.userId] });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.groups });
      
      // Call custom success callback
      onSuccess?.(data, variables);
    },
    onError: (error, variables) => {
      console.error('❌ Failed to demote user from subadmin:', error.message);
      
      // Call custom error callback
      onError?.(error, variables);
    },
    ...mutationOptions,
  });
};

/**
 * Get user subadmin groups
 * @param {string} userId - User ID
 * @param {Object} options - Query options
 * @param {boolean} [options.enabled=true] - Whether to enable the query
 * @returns {Object} React Query result object
 */
export const useUserSubadminGroups = (userId, options = {}) => {
  const { enabled = true, ...queryOptions } = options;
  
  return useQuery({
    queryKey: ['userSubadminGroups', userId],
    queryFn: () => groupsAPI.getUserSubadminGroups(userId),
    enabled: enabled && !!userId,
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 5, // 5 minutes
    retry: (failureCount, error) => {
      // Don't retry if user doesn't exist
      if (error?.message?.includes('does not exist')) {
        return false;
      }
      return failureCount < 2;
    },
    select: (data) => ({
      ...data,
      groups: data.groups || [],
    }),
    ...queryOptions,
  });
};

/**
 * Combined hook for group management operations
 * Provides all common group operations in a single hook
 * @returns {Object} All group management hooks and utilities
 */
export const useGroupManagement = () => {
  return {
    // Queries
    useGroups,
    useGroupDetails,
    useGroupSubadmins,
    useSearchGroups,
    useAvailableGroups,
    useGroupMemberCounts,
    useUserSubadminGroups,
    
    // Mutations
    useCreateGroup,
    useUpdateGroup,
    useDeleteGroup,
    usePromoteUserToSubadmin,
    useDemoteUserFromSubadmin,
    
    // Query keys (for manual cache operations)
    queryKeys: QUERY_KEYS,
  };
};
