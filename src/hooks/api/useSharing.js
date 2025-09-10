import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { sharingAPI } from '../../api/sharing';
import { shareTypes } from '../../api/endpoints';

/**
 * Sharing Management Hooks for React Query Integration
 * 
 * This module provides React hooks for sharing operations using React Query.
 * All hooks are optimized for server state management with proper caching,
 * error handling, and loading states.
 * 
 * Key Features:
 * - Automatic cache invalidation and updates
 * - Optimistic updates for better UX
 * - Comprehensive error handling
 * - Loading state management
 * - Public link and email share helpers
 * 
 * @module useSharing
 */

// Query keys for consistent caching
const QUERY_KEYS = {
  shares: ['shares'],
  sharesList: (options) => ['shares', 'list', options],
  shareDetails: (shareId) => ['shares', 'details', shareId],
  sharesByPath: (path) => ['shares', 'path', path],
};

/**
 * Get all shares for the current user
 * @param {Object} options - Query options
 * @param {string} [options.path] - Filter by path
 * @param {boolean} [options.reshares=false] - Include reshares
 * @param {boolean} [options.subfiles=false] - Include subfiles
 * @param {boolean} [options.enabled=true] - Whether to enable the query
 * @returns {Object} React Query result object
 */
export const useShares = (options = {}) => {
  const { enabled = true, ...queryOptions } = options;
  
  return useQuery({
    queryKey: QUERY_KEYS.sharesList(queryOptions),
    queryFn: () => sharingAPI.getShares(queryOptions),
    enabled,
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
    select: (data) => ({
      ...data,
      shares: data.shares || [],
    }),
  });
};

/**
 * Get shares for a specific path
 * @param {string} path - File/folder path
 * @param {Object} options - Query options
 * @param {boolean} [options.enabled=true] - Whether to enable the query
 * @param {boolean} [options.subfiles=false] - Include subfiles
 * @returns {Object} React Query result object
 */
export const useSharesByPath = (path, options = {}) => {
  const { enabled = true, subfiles = false, ...queryOptions } = options;
  
  return useQuery({
    queryKey: QUERY_KEYS.sharesByPath(path),
    queryFn: () => sharingAPI.getShares({ path, subfiles }),
    enabled: enabled && !!path,
    staleTime: 1000 * 60, // 1 minute
    gcTime: 1000 * 60 * 3, // 3 minutes
    retry: 2,
    select: (data) => ({
      ...data,
      shares: data.shares || [],
      publicLinks: data.shares?.filter(share => share.isPublicLink) || [],
      emailShares: data.shares?.filter(share => share.isEmailShare) || [],
      userShares: data.shares?.filter(share => share.isUserShare) || [],
      groupShares: data.shares?.filter(share => share.isGroupShare) || [],
    }),
    ...queryOptions,
  });
};

/**
 * Get detailed information for a specific share
 * @param {string|number} shareId - Share ID
 * @param {Object} options - Query options
 * @param {boolean} [options.enabled=true] - Whether to enable the query
 * @returns {Object} React Query result object
 */
export const useShareDetails = (shareId, options = {}) => {
  const { enabled = true, ...queryOptions } = options;
  
  return useQuery({
    queryKey: QUERY_KEYS.shareDetails(shareId),
    queryFn: () => sharingAPI.getShareDetails(shareId),
    enabled: enabled && !!shareId,
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 5, // 5 minutes
    retry: (failureCount, error) => {
      // Don't retry if share doesn't exist
      if (error?.message?.includes('not found')) {
        return false;
      }
      return failureCount < 2;
    },
    select: (data) => data.share,
    ...queryOptions,
  });
};

/**
 * Create a new share
 * @param {Object} options - Mutation options
 * @returns {Object} React Query mutation object
 */
export const useCreateShare = (options = {}) => {
  const queryClient = useQueryClient();
  
  // Extract callbacks from options to handle chaining properly
  const { onSuccess: customOnSuccess, onError: customOnError, ...restOptions } = options;
  
  return useMutation({
    mutationFn: sharingAPI.createShare,
    onSuccess: (data, variables) => {
      console.log('✅ Share created successfully:', data.share.id);
      
      // Invalidate shares lists
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.shares });
      
      // Invalidate shares for the specific path
      if (variables.path) {
        queryClient.invalidateQueries({ 
          queryKey: QUERY_KEYS.sharesByPath(variables.path) 
        });
      }
      
      // Set the new share data in cache
      queryClient.setQueryData(
        QUERY_KEYS.shareDetails(data.share.id),
        data.share
      );
      
      if (customOnSuccess) {
        customOnSuccess(data, variables);
      }
    },
    onError: (error, variables) => {
      console.error('❌ Failed to create share:', error.message);
      
      if (customOnError) {
        customOnError(error, variables);
      }
    },
    ...restOptions,
  });
};

/**
 * Update share settings
 * @param {Object} options - Mutation options
 * @returns {Object} React Query mutation object
 */
export const useUpdateShare = (options = {}) => {
  const queryClient = useQueryClient();
  
  // Extract callbacks from options to handle chaining properly
  const { onSuccess: customOnSuccess, onError: customOnError, ...restOptions } = options;
  
  return useMutation({
    mutationFn: ({ shareId, updates }) => sharingAPI.updateShare(shareId, updates),
    onMutate: async ({ shareId, updates }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.shareDetails(shareId) });
      
      // Snapshot the previous value
      const previousShare = queryClient.getQueryData(QUERY_KEYS.shareDetails(shareId));
      
      // Optimistically update to the new value
      if (previousShare) {
        queryClient.setQueryData(QUERY_KEYS.shareDetails(shareId), {
          ...previousShare,
          ...updates,
        });
      }
      
      // Return a context object with the snapshotted value
      return { previousShare, shareId };
    },
    onSuccess: (data, variables) => {
      console.log('✅ Share updated successfully:', variables.shareId);
      
      // Invalidate shares lists
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.shares });
      
      // Update specific share data
      queryClient.setQueryData(
        QUERY_KEYS.shareDetails(variables.shareId),
        data.share
      );
      
      // Invalidate path-specific shares
      if (data.share.path) {
        queryClient.invalidateQueries({ 
          queryKey: QUERY_KEYS.sharesByPath(data.share.path) 
        });
      }
      
      if (customOnSuccess) {
        customOnSuccess(data, variables);
      }
    },
    onError: (error, variables, context) => {
      console.error('❌ Failed to update share:', error.message);
      
      // Revert optimistic update on error
      if (context?.previousShare && context?.shareId) {
        queryClient.setQueryData(QUERY_KEYS.shareDetails(context.shareId), context.previousShare);
      }
      
      if (customOnError) {
        customOnError(error, variables, context);
      }
    },
    ...restOptions,
  });
};

/**
 * Delete a share
 * @param {Object} options - Mutation options
 * @returns {Object} React Query mutation object
 */
export const useDeleteShare = (options = {}) => {
  const queryClient = useQueryClient();
  
  // Extract callbacks from options to handle chaining properly
  const { onSuccess: customOnSuccess, onError: customOnError, ...restOptions } = options;
  
  return useMutation({
    mutationFn: (shareId) => sharingAPI.deleteShare(shareId),
    onSuccess: (data, shareId) => {
      console.log('✅ Share deleted successfully:', shareId);
      
      // Remove share from cache
      queryClient.removeQueries({ queryKey: QUERY_KEYS.shareDetails(shareId) });
      
      // Invalidate shares lists
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.shares });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.sharesByPath });
      
      if (customOnSuccess) {
        customOnSuccess(data, shareId);
      }
    },
    onError: (error, shareId) => {
      console.error('❌ Failed to delete share:', error.message);
      
      if (customOnError) {
        customOnError(error, shareId);
      }
    },
    ...restOptions,
  });
};

/**
 * Create a public link share (helper hook)
 * @param {Object} options - Mutation options
 * @returns {Object} React Query mutation object
 */
export const useCreatePublicLink = (options = {}) => {
  const createShareMutation = useCreateShare(options);
  
  return {
    ...createShareMutation,
    createPublicLink: (linkData) => createShareMutation.mutate({
      ...linkData,
      shareType: shareTypes.PUBLIC_LINK,
    }),
    createPublicLinkAsync: (linkData) => createShareMutation.mutateAsync({
      ...linkData,
      shareType: shareTypes.PUBLIC_LINK,
    }),
  };
};

/**
 * Create an email share (helper hook)
 * @param {Object} options - Mutation options
 * @returns {Object} React Query mutation object
 */
export const useCreateEmailShare = (options = {}) => {
  const createShareMutation = useCreateShare(options);
  
  return {
    ...createShareMutation,
    createEmailShare: (emailData) => createShareMutation.mutate({
      ...emailData,
      shareType: shareTypes.EMAIL,
      shareWith: emailData.email,
      sendMail: true,
    }),
    createEmailShareAsync: (emailData) => createShareMutation.mutateAsync({
      ...emailData,
      shareType: shareTypes.EMAIL,
      shareWith: emailData.email,
      sendMail: true,
    }),
  };
};

/**
 * Create a group share (helper hook)
 * @param {Object} options - Mutation options
 * @returns {Object} React Query mutation object
 */
export const useCreateGroupShare = (options = {}) => {
  const createShareMutation = useCreateShare(options);
  
  return {
    ...createShareMutation,
    createGroupShare: (groupData) => createShareMutation.mutate({
      ...groupData,
      shareType: shareTypes.GROUP,
    }),
    createGroupShareAsync: (groupData) => createShareMutation.mutateAsync({
      ...groupData,
      shareType: shareTypes.GROUP,
    }),
  };
};

/**
 * Comprehensive sharing management hook
 * Provides all sharing operations in one hook
 * @returns {Object} All sharing management functions and utilities
 */
export const useSharingManagement = () => {
  return {
    // Queries
    useShares,
    useSharesByPath,
    useShareDetails,
    
    // Mutations
    useCreateShare,
    useUpdateShare,
    useDeleteShare,
    
    // Helper hooks
    useCreatePublicLink,
    useCreateEmailShare,
    useCreateGroupShare,
    
    // Query keys (for manual cache operations)
    queryKeys: QUERY_KEYS,
  };
};

/**
 * Advanced sharing hook with helper functions
 * @param {string} path - File/folder path
 * @returns {Object} Advanced sharing utilities for a specific path
 */
export const useAdvancedSharing = (path) => {
  const { data: sharesData, isLoading, error, refetch } = useSharesByPath(path, {
    enabled: !!path
  });
  
  const createPublicLinkMutation = useCreatePublicLink();
  const createEmailShareMutation = useCreateEmailShare();
  const updateShareMutation = useUpdateShare();
  const deleteShareMutation = useDeleteShare();
  
  return {
    // Data
    shares: sharesData?.shares || [],
    publicLinks: sharesData?.publicLinks || [],
    emailShares: sharesData?.emailShares || [],
    userShares: sharesData?.userShares || [],
    groupShares: sharesData?.groupShares || [],
    
    // State
    isLoading,
    error,
    refetch,
    
    // Quick actions
    createPublicLink: (linkData) => createPublicLinkMutation.createPublicLink({
      ...linkData,
      path
    }),
    
    createEmailShare: (emailData) => createEmailShareMutation.createEmailShare({
      ...emailData,
      path
    }),
    
    updateShare: (shareId, updates) => updateShareMutation.mutate({ shareId, updates }),
    
    deleteShare: (shareId) => deleteShareMutation.mutate(shareId),
    
    // Bulk operations
    deleteAllShares: async () => {
      const shares = sharesData?.shares || [];
      for (const share of shares) {
        try {
          await deleteShareMutation.mutateAsync(share.id);
        } catch (error) {
          console.error(`Failed to delete share ${share.id}:`, error.message);
        }
      }
    },
    
    // Computed properties
    hasPublicLinks: (sharesData?.publicLinks?.length || 0) > 0,
    hasPasswordProtectedLinks: (sharesData?.publicLinks?.filter(link => link.passwordProtected).length || 0) > 0,
    hasExpiredShares: (sharesData?.shares?.filter(share => share.isExpired).length || 0) > 0,
    
    // Mutation states
    isCreatingPublicLink: createPublicLinkMutation.isPending,
    isCreatingEmailShare: createEmailShareMutation.isPending,
    isUpdating: updateShareMutation.isPending,
    isDeleting: deleteShareMutation.isPending,
    
    // Errors
    createError: createPublicLinkMutation.error || createEmailShareMutation.error,
    updateError: updateShareMutation.error,
    deleteError: deleteShareMutation.error,
  };
};
