import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { usersAPI } from '../../api/users';

/**
 * Users Management Hooks for React Query Integration
 * 
 * This module provides React hooks for user management operations using React Query.
 * All hooks are optimized for server state management with proper caching,
 * error handling, and loading states.
 * 
 * Key Features:
 * - Automatic cache invalidation and updates
 * - Optimistic updates for better UX
 * - Comprehensive error handling
 * - Loading state management
 * - Background data synchronization
 * - Pagination support
 * 
 * @module useUsers
 */

// Query keys for consistent caching
const QUERY_KEYS = {
  users: ['users'],
  usersList: (options) => ['users', 'list', options],
  userDetails: (userId) => ['users', 'details', userId],
  userGroups: (userId) => ['users', 'groups', userId],
  searchUsers: (searchTerm, options) => ['users', 'search', searchTerm, options],
};

/**
 * Get list of users with optional filtering and pagination
 * @param {Object} options - Query options
 * @param {string} [options.search] - Search term
 * @param {number} [options.limit] - Limit number of results
 * @param {number} [options.offset] - Offset for pagination
 * @param {boolean} [options.enabled=true] - Whether to enable the query
 * @returns {Object} React Query result object
 */
export const useUsers = (options = {}) => {
  const { enabled = true, ...queryOptions } = options;
  
  return useQuery({
    queryKey: QUERY_KEYS.usersList(queryOptions),
    queryFn: () => usersAPI.getUsers(queryOptions),
    enabled,
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
    select: (data) => ({
      ...data,
      users: data.users || [],
    }),
  });
};

/**
 * Get detailed information for a specific user
 * @param {string} userId - User ID
 * @param {Object} options - Query options
 * @param {boolean} [options.enabled=true] - Whether to enable the query
 * @returns {Object} React Query result object
 */
export const useUserDetails = (userId, options = {}) => {
  const { enabled = true, ...queryOptions } = options;
  
  return useQuery({
    queryKey: QUERY_KEYS.userDetails(userId),
    queryFn: () => usersAPI.getUserDetails(userId),
    enabled: enabled && !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
    retry: 2,
    select: (data) => data.user,
    ...queryOptions,
  });
};

/**
 * Search users by name or username
 * @param {string} searchTerm - Search term
 * @param {Object} options - Query options
 * @param {number} [options.limit=25] - Limit number of results
 * @param {number} [options.offset=0] - Offset for pagination
 * @param {boolean} [options.enabled=true] - Whether to enable the query
 * @returns {Object} React Query result object
 */
export const useSearchUsers = (searchTerm, options = {}) => {
  const { enabled = true, limit = 25, offset = 0, ...queryOptions } = options;
  
  return useQuery({
    queryKey: QUERY_KEYS.searchUsers(searchTerm, { limit, offset }),
    queryFn: () => usersAPI.searchUsers(searchTerm, { limit, offset }),
    enabled: enabled && !!searchTerm && searchTerm.trim().length > 0,
    staleTime: 1000 * 30, // 30 seconds
    gcTime: 1000 * 60 * 2, // 2 minutes
    retry: 2,
    select: (data) => ({
      ...data,
      users: data.users || [],
    }),
    ...queryOptions,
  });
};

/**
 * Get user groups
 * @param {string} userId - User ID
 * @param {Object} options - Query options
 * @param {boolean} [options.enabled=true] - Whether to enable the query
 * @returns {Object} React Query result object
 */
export const useUserGroups = (userId, options = {}) => {
  const { enabled = true, ...queryOptions } = options;
  
  return useQuery({
    queryKey: QUERY_KEYS.userGroups(userId),
    queryFn: () => usersAPI.getUserGroups(userId),
    enabled: enabled && !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
    retry: 2,
    select: (data) => data.groups || [],
    ...queryOptions,
  });
};

/**
 * Create a new user
 * @param {Object} options - Mutation options
 * @returns {Object} React Query mutation object
 */
export const useCreateUser = (options = {}) => {
  const queryClient = useQueryClient();
  
  // Extract callbacks from options to handle chaining properly
  const { onSuccess: customOnSuccess, onError: customOnError, ...restOptions } = options;
  
  return useMutation({
    mutationFn: usersAPI.createUser,
    onSuccess: (data) => {
      // Invalidate and refetch users list
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.users });
      
      // Add the new user to the cache optimistically
      queryClient.setQueryData(QUERY_KEYS.userDetails(data.user.id), data.user);
      
      // Call custom callback AFTER cache invalidation
      if (customOnSuccess) {
        customOnSuccess(data);
      }
    },
    onError: (error) => {
      console.error('❌ Failed to create user:', error.message);
      
      if (customOnError) {
        customOnError(error);
      }
    },
    ...restOptions,
  });
};

/**
 * Update user display name
 * @param {Object} options - Mutation options
 * @returns {Object} React Query mutation object
 */
export const useUpdateUserDisplayName = (options = {}) => {
  const queryClient = useQueryClient();
  
  // Extract callbacks from options to handle chaining properly
  const { onSuccess: customOnSuccess, onError: customOnError, ...restOptions } = options;
  
  return useMutation({
    mutationFn: ({ userId, displayName }) => usersAPI.updateUserDisplayName(userId, displayName),
    onSuccess: (data, variables) => {
      const { userId } = variables;
      
      // Invalidate user details and list
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.userDetails(userId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.users });
      
      if (customOnSuccess) {
        customOnSuccess(data, variables);
      }
    },
    onError: (error) => {
      console.error('❌ Failed to update display name:', error.message);
      
      if (customOnError) {
        customOnError(error);
      }
    },
    ...restOptions,
  });
};

/**
 * Update user email
 * @param {Object} options - Mutation options
 * @returns {Object} React Query mutation object
 */
export const useUpdateUserEmail = (options = {}) => {
  const queryClient = useQueryClient();
  
  // Extract callbacks from options to handle chaining properly
  const { onSuccess: customOnSuccess, onError: customOnError, ...restOptions } = options;
  
  return useMutation({
    mutationFn: ({ userId, email }) => usersAPI.updateUserEmail(userId, email),
    onSuccess: (data, variables) => {
      const { userId } = variables;
      
      // Invalidate user details and list
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.userDetails(userId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.users });
      
      if (customOnSuccess) {
        customOnSuccess(data, variables);
      }
    },
    onError: (error) => {
      console.error('❌ Failed to update email:', error.message);
      
      if (customOnError) {
        customOnError(error);
      }
    },
    ...restOptions,
  });
};

/**
 * Update user password
 * @param {Object} options - Mutation options
 * @returns {Object} React Query mutation object
 */
export const useUpdateUserPassword = (options = {}) => {
  const queryClient = useQueryClient();
  
  // Extract callbacks from options to handle chaining properly
  const { onSuccess: customOnSuccess, onError: customOnError, ...restOptions } = options;
  
  return useMutation({
    mutationFn: ({ userId, password }) => usersAPI.updateUserPassword(userId, password),
    onSuccess: (data, variables) => {
      const { userId } = variables;
      
      // Invalidate user details
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.userDetails(userId) });
      
      if (customOnSuccess) {
        customOnSuccess(data, variables);
      }
    },
    onError: (error) => {
      console.error('❌ Failed to update password:', error.message);
      
      if (customOnError) {
        customOnError(error);
      }
    },
    ...restOptions,
  });
};

/**
 * Enable user account
 * @param {Object} options - Mutation options
 * @returns {Object} React Query mutation object
 */
export const useEnableUser = (options = {}) => {
  const queryClient = useQueryClient();
  
  // Extract callbacks from options to handle chaining properly
  const { onSuccess: customOnSuccess, onError: customOnError, ...restOptions } = options;
  
  return useMutation({
    mutationFn: (userId) => usersAPI.enableUser(userId),
    onSuccess: (data, userId) => {
      // Invalidate user details and list
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.userDetails(userId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.users });
      
      if (customOnSuccess) {
        customOnSuccess(data, userId);
      }
    },
    onError: (error) => {
      console.error('❌ Failed to enable user:', error.message);
      
      if (customOnError) {
        customOnError(error);
      }
    },
    ...restOptions,
  });
};

/**
 * Disable user account
 * @param {Object} options - Mutation options
 * @returns {Object} React Query mutation object
 */
export const useDisableUser = (options = {}) => {
  const queryClient = useQueryClient();
  
  // Extract callbacks from options to handle chaining properly
  const { onSuccess: customOnSuccess, onError: customOnError, ...restOptions } = options;
  
  return useMutation({
    mutationFn: (userId) => usersAPI.disableUser(userId),
    onSuccess: (data, userId) => {
      // Invalidate user details and list
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.userDetails(userId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.users });
      
      if (customOnSuccess) {
        customOnSuccess(data, userId);
      }
    },
    onError: (error) => {
      console.error('❌ Failed to disable user:', error.message);
      
      if (customOnError) {
        customOnError(error);
      }
    },
    ...restOptions,
  });
};

/**
 * Delete user account
 * @param {Object} options - Mutation options
 * @returns {Object} React Query mutation object
 */
export const useDeleteUser = (options = {}) => {
  const queryClient = useQueryClient();
  
  // Extract callbacks from options to handle chaining properly
  const { onSuccess: customOnSuccess, onError: customOnError, ...restOptions } = options;
  
  return useMutation({
    mutationFn: (userId) => usersAPI.deleteUser(userId),
    onSuccess: (data, userId) => {
      // Remove user from cache and invalidate lists
      queryClient.removeQueries({ queryKey: QUERY_KEYS.userDetails(userId) });
      queryClient.removeQueries({ queryKey: QUERY_KEYS.userGroups(userId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.users });
      
      // Call custom callback AFTER cache invalidation
      if (customOnSuccess) {
        customOnSuccess(data, userId);
      }
    },
    onError: (error) => {
      console.error('❌ Failed to delete user:', error.message);
      
      if (customOnError) {
        customOnError(error);
      }
    },
    ...restOptions, // Spread the rest of options (excluding onSuccess/onError)
  });
};

/**
 * Add user to group
 * @param {Object} options - Mutation options
 * @returns {Object} React Query mutation object
 */
export const useAddUserToGroup = (options = {}) => {
  const queryClient = useQueryClient();
  
  // Extract callbacks from options to handle chaining properly
  const { onSuccess: customOnSuccess, onError: customOnError, ...restOptions } = options;
  
  return useMutation({
    mutationFn: ({ userId, groupId }) => usersAPI.addUserToGroup(userId, groupId),
    onSuccess: (data, variables) => {
      const { userId } = variables;
      
      // Invalidate user details, groups, and lists
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.userDetails(userId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.userGroups(userId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.users });
      
      if (customOnSuccess) {
        customOnSuccess(data, variables);
      }
    },
    onError: (error) => {
      console.error('❌ Failed to add user to group:', error.message);
      
      if (customOnError) {
        customOnError(error);
      }
    },
    ...restOptions,
  });
};

/**
 * Remove user from group
 * @param {Object} options - Mutation options
 * @returns {Object} React Query mutation object
 */
export const useRemoveUserFromGroup = (options = {}) => {
  const queryClient = useQueryClient();
  
  // Extract callbacks from options to handle chaining properly
  const { onSuccess: customOnSuccess, onError: customOnError, ...restOptions } = options;
  
  return useMutation({
    mutationFn: ({ userId, groupId }) => usersAPI.removeUserFromGroup(userId, groupId),
    onSuccess: (data, variables) => {
      const { userId } = variables;
      
      // Invalidate user details, groups, and lists
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.userDetails(userId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.userGroups(userId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.users });
      
      if (customOnSuccess) {
        customOnSuccess(data, variables);
      }
    },
    onError: (error) => {
      console.error('❌ Failed to remove user from group:', error.message);
      
      if (customOnError) {
        customOnError(error);
      }
    },
    ...restOptions,
  });
};


/**
 * Comprehensive users management hook
 * Provides all user management operations in one hook
 * @returns {Object} All user management functions and data
 */
export const useUsersManagement = () => {
  return {
    // Queries
    useUsers,
    useUserDetails,
    useSearchUsers,
    useUserGroups,
    
    // Mutations
    useCreateUser,
    useUpdateUserDisplayName,
    useUpdateUserEmail,
    useUpdateUserPassword,
    useEnableUser,
    useDisableUser,
    useDeleteUser,
    useAddUserToGroup,
    useRemoveUserFromGroup,
  };
};
