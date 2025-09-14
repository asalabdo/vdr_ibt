import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authAPI } from '../../api/auth';

/**
 * Authentication Hooks for React Query Integration
 * 
 * This module provides React hooks for authentication operations using React Query.
 * All hooks are optimized for server state management with proper caching,
 * error handling, and loading states.
 * 
 * Key Features:
 * - Automatic cache invalidation and updates
 * - Optimistic updates for better UX
 * - Comprehensive error handling
 * - Loading state management
 * - Background data synchronization
 * 
 * @module useAuth
 */

// Query keys for consistent caching
const QUERY_KEYS = {
  currentUser: ['auth', 'currentUser'],
  serverInfo: ['auth', 'serverInfo'],
  authStatus: ['auth', 'status'],
};

/**
 * Main authentication hook
 * Provides authentication state and operations
 */
export const useAuth = () => {
  const queryClient = useQueryClient();

  // Query for current user data
  const {
    data: user,
    isLoading: isLoadingUser,
    error: userError,
    refetch: refetchUser,
  } = useQuery({
    queryKey: QUERY_KEYS.currentUser,
    queryFn: authAPI.getCurrentUser,
    enabled: authAPI.isAuthenticated(), // Only run if authenticated
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
    retry: (failureCount, error) => {
      // Don't retry authentication failures
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        return false;
      }
      return failureCount < 2;
    },
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: authAPI.login,
    onSuccess: (data) => {
      console.log('✅ Login successful:', data.user.displayname);
      
      // Set user data in cache
      queryClient.setQueryData(QUERY_KEYS.currentUser, data.user);
      
      // Invalidate and refetch related queries
      queryClient.invalidateQueries({ queryKey: ['auth'] });
      queryClient.invalidateQueries({ queryKey: ['user'] });
      
      // Prefetch some common data after login
      queryClient.prefetchQuery({
        queryKey: ['dataRooms'],
        staleTime: 1000 * 60 * 2, // 2 minutes
      });
    },
    onError: (error) => {
      console.error('❌ Login failed:', error.message);
      
      // Clear any stale authentication data
      queryClient.removeQueries({ queryKey: QUERY_KEYS.currentUser });
      queryClient.invalidateQueries({ queryKey: ['auth'] });
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: authAPI.logout,
    onSuccess: () => {
      console.log('✅ Logout successful');
      
      // Clear all cached data
      queryClient.clear();
      
      // Redirect to login page after successful logout
      window.location.href = '/login';
    },
    onError: (error) => {
      console.error('❌ Logout error:', error.message);
      
      // Even if logout fails, clear local data and redirect to login
      queryClient.clear();
      window.location.href = '/login';
    },
  });

  // Session refresh mutation
  const refreshSessionMutation = useMutation({
    mutationFn: authAPI.refreshSession,
    onSuccess: (userData) => {
      console.log('✅ Session refreshed for:', userData.displayname);
      
      // Update user data in cache
      queryClient.setQueryData(QUERY_KEYS.currentUser, userData);
      queryClient.invalidateQueries({ queryKey: ['auth'] });
    },
    onError: (error) => {
      console.error('❌ Session refresh failed:', error.message);
      
      // Clear authentication data on refresh failure
      queryClient.removeQueries({ queryKey: QUERY_KEYS.currentUser });
      authAPI.logout();
    },
  });

  // Authentication test mutation
  const testAuthMutation = useMutation({
    mutationFn: authAPI.testAuthentication,
    onSuccess: (isValid) => {
      if (!isValid) {
        console.warn('⚠️ Authentication test failed - clearing session');
        queryClient.removeQueries({ queryKey: QUERY_KEYS.currentUser });
        authAPI.logout();
      }
    },
  });

  return {
    // Authentication state
    user,
    isAuthenticated: authAPI.isAuthenticated(),
    isLoading: isLoadingUser,
    error: userError,

    // Permission checking
    hasPermission: authAPI.hasPermission,
    isAdmin: user?.isAdmin || false,
    isSubadmin: user?.isSubadmin || false,
    permissions: user?.permissions || [],
    
    // Role information
    role: user?.role || 'user',
    roleLevel: user?.roleLevel || 'standard',
    managedGroups: user?.managedGroups || [],
    
    // Capability flags
    canManageUsers: user?.canManageUsers || false,
    canManageAllGroups: user?.canManageAllGroups || false,
    canAccessSystemSettings: user?.canAccessSystemSettings || false,

    // Authentication operations
    login: loginMutation.mutate,
    loginAsync: loginMutation.mutateAsync,
    logout: logoutMutation.mutate,
    refreshSession: refreshSessionMutation.mutate,
    testAuth: testAuthMutation.mutate,

    // Operation states
    isLoggingIn: loginMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
    isRefreshing: refreshSessionMutation.isPending,
    isTesting: testAuthMutation.isPending,

    // Errors
    loginError: loginMutation.error,
    logoutError: logoutMutation.error,
    refreshError: refreshSessionMutation.error,
    testError: testAuthMutation.error,

    // Utilities
    refetchUser,
    getStoredUser: authAPI.getStoredUser,
  };
};

/**
 * Server information hook
 * Gets Nextcloud server status and capabilities
 */
export const useServerInfo = () => {
  return useQuery({
    queryKey: QUERY_KEYS.serverInfo,
    queryFn: authAPI.getServerInfo,
    staleTime: 1000 * 60 * 10, // 10 minutes - server info doesn't change often
    gcTime: 1000 * 60 * 30, // 30 minutes
    retry: 2,
  });
};

/**
 * Authentication status hook (lightweight)
 * For components that only need to know if user is authenticated
 */
export const useAuthStatus = () => {
  const queryClient = useQueryClient();
  const isAuthenticated = authAPI.isAuthenticated();
  const cachedUser = queryClient.getQueryData(QUERY_KEYS.currentUser);

  return {
    isAuthenticated,
    hasUser: !!cachedUser,
    username: cachedUser?.username || cachedUser?.displayname || null,
    isAdmin: cachedUser?.isAdmin || false,
    isSubadmin: cachedUser?.isSubadmin || false,
    role: cachedUser?.role || 'user',
    canManageUsers: cachedUser?.canManageUsers || false,
    canManageAllGroups: cachedUser?.canManageAllGroups || false,
  };
};

/**
 * Permission hook
 * For components that need to check specific permissions
 */
export const usePermissions = () => {
  const { user, hasPermission } = useAuth();

  return {
    permissions: user?.permissions || [],
    isAdmin: user?.isAdmin || false,
    isSubadmin: user?.isSubadmin || false,
    role: user?.role || 'user',
    managedGroups: user?.managedGroups || [],
    hasPermission,
    
    // Role-based capability checks
    canManageUsers: user?.canManageUsers || false,
    canManageAllGroups: user?.canManageAllGroups || false,
    canAccessSystemSettings: user?.canAccessSystemSettings || false,
    
    // Common permission checks
    canManageDataRooms: hasPermission('data_rooms.manage'),
    canCreateDataRooms: hasPermission('data_rooms.create'),
    canViewAuditLogs: hasPermission('audit.view'),
    canExportAuditLogs: hasPermission('audit.export'),
    canUploadDocuments: hasPermission('documents.upload'),
    canDeleteDocuments: hasPermission('documents.delete'),
    canManageGroups: hasPermission('groups.manage'),
    canManageRoles: hasPermission('roles.manage'),
    
    // UI/Navigation permissions
    canAccessUsersManagement: hasPermission('users.manage'),
    canAccessGroupsManagement: hasPermission('groups.manage'),
    canAccessAuditLogs: hasPermission('audit.view'),
    canAccessRolesPermissions: user?.isAdmin || false, // Admin only
  };
};

/**
 * Login form hook
 * Specialized hook for login forms with form state management
 */
export const useLoginForm = () => {
  const { login, isLoggingIn, loginError } = useAuth();
  
  return {
    login,
    isLoading: isLoggingIn,
    error: loginError,
    
    // Helper for form submission
    handleLogin: async (credentials) => {
      try {
        await login(credentials);
        return { success: true };
      } catch (error) {
        return { success: false, error: error.message };
      }
    },
  };
};
