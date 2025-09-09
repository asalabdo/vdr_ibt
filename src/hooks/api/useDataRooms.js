import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { dataRoomsAPI } from '../../api/dataRooms';

/**
 * Data Rooms Management Hooks for React Query Integration
 * 
 * This module provides React hooks for data room management operations using React Query.
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
 * @module useDataRooms
 */

// Query keys for consistent caching
const QUERY_KEYS = {
  dataRooms: ['dataRooms'],
  dataRoomsList: (options) => ['dataRooms', 'list', options],
  dataRoomDetails: (roomId) => ['dataRooms', 'details', roomId],
};

/**
 * Get list of data rooms with optional filtering
 * @param {Object} options - Query options
 * @param {string} [options.search] - Search term
 * @param {boolean} [options.enabled=true] - Whether to enable the query
 * @returns {Object} React Query result object
 */
export const useDataRooms = (options = {}) => {
  const { enabled = true, ...queryOptions } = options;
  
  return useQuery({
    queryKey: QUERY_KEYS.dataRoomsList(queryOptions),
    queryFn: () => dataRoomsAPI.getDataRooms(queryOptions),
    enabled,
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
    select: (data) => ({
      ...data,
      dataRooms: data.dataRooms || [],
    }),
  });
};

/**
 * Get detailed information for a specific data room
 * @param {string} roomId - Room ID
 * @param {Object} options - Query options
 * @param {boolean} [options.enabled=true] - Whether to enable the query
 * @returns {Object} React Query result object
 */
export const useDataRoomDetails = (roomId, options = {}) => {
  const { enabled = true, ...queryOptions } = options;
  
  return useQuery({
    queryKey: QUERY_KEYS.dataRoomDetails(roomId),
    queryFn: () => dataRoomsAPI.getDataRoomDetails(roomId),
    enabled: enabled && !!roomId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
    retry: 2,
    select: (data) => data.dataRoom,
    ...queryOptions,
  });
};

/**
 * Create a new data room
 * @param {Object} options - Mutation options
 * @returns {Object} React Query mutation object
 */
export const useCreateDataRoom = (options = {}) => {
  const queryClient = useQueryClient();
  
  // Extract callbacks from options to handle chaining properly
  const { onSuccess: customOnSuccess, onError: customOnError, ...restOptions } = options;
  
  return useMutation({
    mutationFn: dataRoomsAPI.createDataRoom,
    onSuccess: (data) => {
      // Invalidate and refetch data rooms list
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dataRooms });
      
      // Add the new data room to the cache optimistically
      queryClient.setQueryData(QUERY_KEYS.dataRoomDetails(data.dataRoom.id), data.dataRoom);
      
      // Call custom callback AFTER cache invalidation
      if (customOnSuccess) {
        customOnSuccess(data);
      }
    },
    onError: (error) => {
      console.error('❌ Failed to create data room:', error.message);
      
      if (customOnError) {
        customOnError(error);
      }
    },
    ...restOptions,
  });
};

/**
 * Delete data room
 * @param {Object} options - Mutation options
 * @returns {Object} React Query mutation object
 */
export const useDeleteDataRoom = (options = {}) => {
  const queryClient = useQueryClient();
  
  // Extract callbacks from options to handle chaining properly
  const { onSuccess: customOnSuccess, onError: customOnError, ...restOptions } = options;
  
  return useMutation({
    mutationFn: (roomId) => dataRoomsAPI.deleteDataRoom(roomId),
    onSuccess: (data, roomId) => {
      // Remove data room from cache and invalidate lists
      queryClient.removeQueries({ queryKey: QUERY_KEYS.dataRoomDetails(roomId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dataRooms });
      
      // Call custom callback AFTER cache invalidation
      if (customOnSuccess) {
        customOnSuccess(data, roomId);
      }
    },
    onError: (error) => {
      console.error('❌ Failed to delete data room:', error.message);
      
      if (customOnError) {
        customOnError(error);
      }
    },
    ...restOptions, // Spread the rest of options (excluding onSuccess/onError)
  });
};

/**
 * Add group to data room
 * @param {Object} options - Mutation options
 * @returns {Object} React Query mutation object
 */
export const useAddGroupToDataRoom = (options = {}) => {
  const queryClient = useQueryClient();
  
  // Extract callbacks from options to handle chaining properly
  const { onSuccess: customOnSuccess, onError: customOnError, ...restOptions } = options;
  
  return useMutation({
    mutationFn: ({ roomId, groupId, permissions }) => dataRoomsAPI.addGroupToDataRoom(roomId, groupId, permissions),
    onSuccess: (data, variables) => {
      const { roomId } = variables;
      
      // Invalidate data room details and lists
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dataRoomDetails(roomId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dataRooms });
      
      if (customOnSuccess) {
        customOnSuccess(data, variables);
      }
    },
    onError: (error) => {
      console.error('❌ Failed to add group to data room:', error.message);
      
      if (customOnError) {
        customOnError(error);
      }
    },
    ...restOptions,
  });
};

/**
 * Set group permissions for data room
 * @param {Object} options - Mutation options
 * @returns {Object} React Query mutation object
 */
export const useSetGroupPermissions = (options = {}) => {
  const queryClient = useQueryClient();
  
  // Extract callbacks from options to handle chaining properly
  const { onSuccess: customOnSuccess, onError: customOnError, ...restOptions } = options;
  
  return useMutation({
    mutationFn: ({ roomId, groupId, permissions }) => dataRoomsAPI.setGroupPermissions(roomId, groupId, permissions),
    onSuccess: (data, variables) => {
      const { roomId } = variables;
      
      // Invalidate data room details and lists
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dataRoomDetails(roomId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dataRooms });
      
      if (customOnSuccess) {
        customOnSuccess(data, variables);
      }
    },
    onError: (error) => {
      console.error('❌ Failed to set group permissions:', error.message);
      
      if (customOnError) {
        customOnError(error);
      }
    },
    ...restOptions,
  });
};

/**
 * Remove group from data room
 * @param {Object} options - Mutation options
 * @returns {Object} React Query mutation object
 */
export const useRemoveGroupFromDataRoom = (options = {}) => {
  const queryClient = useQueryClient();
  
  // Extract callbacks from options to handle chaining properly
  const { onSuccess: customOnSuccess, onError: customOnError, ...restOptions } = options;
  
  return useMutation({
    mutationFn: ({ roomId, groupId }) => dataRoomsAPI.removeGroupFromDataRoom(roomId, groupId),
    onSuccess: (data, variables) => {
      const { roomId } = variables;
      
      // Invalidate data room details and lists
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dataRoomDetails(roomId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dataRooms });
      
      if (customOnSuccess) {
        customOnSuccess(data, variables);
      }
    },
    onError: (error) => {
      console.error('❌ Failed to remove group from data room:', error.message);
      
      if (customOnError) {
        customOnError(error);
      }
    },
    ...restOptions,
  });
};

/**
 * Update data room settings
 * @param {Object} options - Mutation options
 * @returns {Object} React Query mutation object
 */
export const useUpdateDataRoom = (options = {}) => {
  const queryClient = useQueryClient();
  
  // Extract callbacks from options to handle chaining properly
  const { onSuccess: customOnSuccess, onError: customOnError, ...restOptions } = options;
  
  return useMutation({
    mutationFn: ({ roomId, updates }) => dataRoomsAPI.updateDataRoom(roomId, updates),
    onSuccess: (data, variables) => {
      const { roomId } = variables;
      
      // Update cached data room details
      if (data.dataRoom) {
        queryClient.setQueryData(QUERY_KEYS.dataRoomDetails(roomId), data.dataRoom);
      }
      
      // Invalidate data room lists to reflect changes
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dataRooms });
      
      if (customOnSuccess) {
        customOnSuccess(data, variables);
      }
    },
    onError: (error) => {
      console.error('❌ Failed to update data room:', error.message);
      
      if (customOnError) {
        customOnError(error);
      }
    },
    ...restOptions,
  });
};

/**
 * Get available groups for data room assignment
 * @param {Object} options - Query options
 * @param {string} [options.search] - Search term
 * @param {boolean} [options.enabled=true] - Whether to enable the query
 * @returns {Object} React Query result object
 */
export const useAvailableGroups = (options = {}) => {
  const { enabled = true, search, ...queryOptions } = options;
  
  return useQuery({
    queryKey: ['availableGroups', 'list', { search }],
    queryFn: () => dataRoomsAPI.getAvailableGroups({ search }),
    enabled,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
    retry: 2,
    select: (data) => ({
      ...data,
      groups: data.groups || [],
    }),
    ...queryOptions,
  });
};

/**
 * Comprehensive data rooms management hook
 * Provides all data room management operations in one hook
 * @returns {Object} All data room management functions and data
 */
export const useDataRoomsManagement = () => {
  return {
    // Queries
    useDataRooms,
    useDataRoomDetails,
    useAvailableGroups,
    
    // Mutations
    useCreateDataRoom,
    useUpdateDataRoom,
    useDeleteDataRoom,
    useAddGroupToDataRoom,
    useSetGroupPermissions,
    useRemoveGroupFromDataRoom,
  };
};
