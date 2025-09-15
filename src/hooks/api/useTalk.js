import React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { talkAPI, ROOM_TYPES } from '../../api/talk';

/**
 * Talk Message Management Hooks
 * 
 * Clean, focused React hooks for Nextcloud Talk integration.
 * Only includes functions that are actually used in the application.
 */

// Query keys for consistent caching
const QUERY_KEYS = {
  talk: ['talk'],
  rooms: ['talk', 'rooms'],
  qaMessages: (token) => ['talk', 'qaMessages', token],
};

/**
 * Get list of Talk rooms
 */
export const useRooms = (options = {}) => {
  const { enabled = true, includeStatus = false, ...queryOptions } = options;
  
  return useQuery({
    queryKey: QUERY_KEYS.rooms,
    queryFn: () => talkAPI.getRooms({ includeStatus }),
    enabled,
    staleTime: 1000 * 30, // 30 seconds
    retry: 2,
    select: (data) => ({
      ...data,
      rooms: data.rooms || [],
    }),
    ...queryOptions,
  });
};

/**
 * Get messages with threading support
 */
export const useQAMessages = (roomToken, options = {}) => {
  const { enabled = true, limit = 100, refetchInterval = 30000, ...queryOptions } = options;
  
  return useQuery({
    queryKey: QUERY_KEYS.qaMessages(roomToken),
    queryFn: () => talkAPI.getQAMessages(roomToken, { limit }),
    enabled: enabled && !!roomToken,
    staleTime: 1000 * 15, // 15 seconds
    retry: 2,
    refetchInterval,
    select: (data) => ({
      ...data,
      questions: data.questions || [],
    }),
    ...queryOptions,
  });
};

/**
 * Send a message
 */
export const useSendQuestion = (options = {}) => {
  const queryClient = useQueryClient();
  const { onSuccess: customOnSuccess, onError: customOnError, ...restOptions } = options;
  
  return useMutation({
    mutationFn: ({ roomToken, question, referenceId }) => 
      talkAPI.sendQuestion(roomToken, question, { referenceId }),
    onSuccess: (data, variables) => {
      const { roomToken } = variables;
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.qaMessages(roomToken) });
      
      if (customOnSuccess) {
        customOnSuccess(data, variables);
      }
    },
    onError: (error, variables) => {
      console.error(`❌ Failed to send message to room ${variables.roomToken}:`, error.message);
      
      if (customOnError) {
        customOnError(error, variables);
      }
    },
    ...restOptions,
  });
};

/**
 * Send a reply to a message
 */
export const useSendAnswer = (options = {}) => {
  const queryClient = useQueryClient();
  const { onSuccess: customOnSuccess, onError: customOnError, ...restOptions } = options;
  
  return useMutation({
    mutationFn: ({ roomToken, questionId, answer, referenceId }) => 
      talkAPI.sendAnswer(roomToken, questionId, answer, { referenceId }),
    onSuccess: (data, variables) => {
      const { roomToken } = variables;
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.qaMessages(roomToken) });
      
      if (customOnSuccess) {
        customOnSuccess(data, variables);
      }
    },
    onError: (error, variables) => {
      console.error(`❌ Failed to send reply to message ${variables.questionId}:`, error.message);
      
      if (customOnError) {
        customOnError(error, variables);
      }
    },
    ...restOptions,
  });
};

/**
 * Get room permission status
 */
export const useRoomPermissions = (room) => {
  return React.useMemo(() => {
    if (!room) return null;
    return talkAPI.getRoomPermissionStatus(room);
  }, [room]);
};

/**
 * Get permissions for multiple rooms
 */
export const useRoomsPermissions = (rooms) => {
  return React.useMemo(() => {
    if (!rooms || !Array.isArray(rooms)) return {};
    
    const permissionsMap = {};
    rooms.forEach(room => {
      if (room?.token) {
        permissionsMap[room.token] = talkAPI.getRoomPermissionStatus(room);
      }
    });
    
    return permissionsMap;
  }, [rooms]);
};

/**
 * Create a new Talk room
 */
export const useCreateRoom = (options = {}) => {
  const queryClient = useQueryClient();
  
  // Extract callbacks from options to handle chaining properly
  const { onSuccess: customOnSuccess, onError: customOnError, ...restOptions } = options;
  
  return useMutation({
    mutationFn: (roomData) => talkAPI.createRoom(roomData),
    onSuccess: (data) => {
      // Invalidate rooms cache to show new room
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.rooms });
      console.log('🎉 Room created successfully:', data);
      
      // Call custom callback AFTER cache invalidation
      if (customOnSuccess) {
        customOnSuccess(data);
      }
    },
    onError: (error) => {
      console.error('❌ Failed to create room:', error.message);
      
      if (customOnError) {
        customOnError(error);
      }
    },
    ...restOptions,
  });
};

/**
 * Update an existing Talk room
 */
export const useUpdateRoom = (options = {}) => {
  const queryClient = useQueryClient();
  
  // Extract callbacks from options to handle chaining properly
  const { onSuccess: customOnSuccess, onError: customOnError, ...restOptions } = options;
  
  return useMutation({
    mutationFn: ({ roomToken, updateData }) => talkAPI.updateRoom(roomToken, updateData),
    onSuccess: (data, variables) => {
      // Invalidate specific room and rooms list cache
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.rooms });
      queryClient.invalidateQueries({ queryKey: ['talk', 'room', variables.roomToken] });
      console.log('🎉 Room updated successfully:', data);
      
      // Call custom callback AFTER cache invalidation
      if (customOnSuccess) {
        customOnSuccess(data, variables);
      }
    },
    onError: (error) => {
      console.error('❌ Failed to update room:', error.message);
      
      if (customOnError) {
        customOnError(error);
      }
    },
    ...restOptions,
  });
};

/**
 * Delete a Talk room
 */
export const useDeleteRoom = (options = {}) => {
  const queryClient = useQueryClient();
  
  // Extract callbacks from options to handle chaining properly
  const { onSuccess: customOnSuccess, onError: customOnError, ...restOptions } = options;
  
  return useMutation({
    mutationFn: (roomToken) => talkAPI.deleteRoom(roomToken),
    onSuccess: (data, roomToken) => {
      // Invalidate rooms cache to remove deleted room
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.rooms });
      queryClient.removeQueries({ queryKey: ['talk', 'room', roomToken] });
      queryClient.removeQueries({ queryKey: ['talk', 'messages', roomToken] });
      console.log('🎉 Room deleted successfully');
      
      // Call custom callback AFTER cache invalidation
      if (customOnSuccess) {
        customOnSuccess(data, roomToken);
      }
    },
    onError: (error) => {
      console.error('❌ Failed to delete room:', error.message);
      
      if (customOnError) {
        customOnError(error);
      }
    },
    ...restOptions,
  });
};

/**
 * Get participants of a Talk room
 */
export const useParticipants = (roomToken, options = {}) => {
  const { enabled = true, ...queryOptions } = options;
  
  return useQuery({
    queryKey: ['talk', 'participants', roomToken],
    queryFn: () => talkAPI.getParticipants(roomToken),
    enabled: enabled && !!roomToken,
    staleTime: 1000 * 30, // 30 seconds
    retry: 2,
    select: (data) => ({
      ...data,
      participants: data.participants || [],
    }),
    ...queryOptions,
  });
};

/**
 * Add participant to a Talk room
 */
export const useAddParticipant = (options = {}) => {
  const queryClient = useQueryClient();
  
  // Extract callbacks from options to handle chaining properly
  const { onSuccess: customOnSuccess, onError: customOnError, ...restOptions } = options;
  
  return useMutation({
    mutationFn: ({ roomToken, newParticipant }) => talkAPI.addParticipant(roomToken, newParticipant),
    onSuccess: (data, variables) => {
      // Invalidate room data and participants to show new participant
      queryClient.invalidateQueries({ queryKey: ['talk', 'room', variables.roomToken] });
      queryClient.invalidateQueries({ queryKey: ['talk', 'participants', variables.roomToken] });
      console.log('🎉 Participant added successfully');
      
      // Call custom callback AFTER cache invalidation
      if (customOnSuccess) {
        customOnSuccess(data, variables);
      }
    },
    onError: (error) => {
      console.error('❌ Failed to add participant:', error.message);
      
      if (customOnError) {
        customOnError(error);
      }
    },
    ...restOptions,
  });
};

/**
 * Remove participant from a Talk room
 */
export const useRemoveParticipant = (options = {}) => {
  const queryClient = useQueryClient();
  
  // Extract callbacks from options to handle chaining properly
  const { onSuccess: customOnSuccess, onError: customOnError, ...restOptions } = options;
  
  return useMutation({
    mutationFn: ({ roomToken, participant }) => talkAPI.removeParticipant(roomToken, participant),
    onSuccess: (data, variables) => {
      // Invalidate room data and participants to show updated participant list
      queryClient.invalidateQueries({ queryKey: ['talk', 'room', variables.roomToken] });
      queryClient.invalidateQueries({ queryKey: ['talk', 'participants', variables.roomToken] });
      console.log('🎉 Participant removed successfully');
      
      // Call custom callback AFTER cache invalidation
      if (customOnSuccess) {
        customOnSuccess(data, variables);
      }
    },
    onError: (error) => {
      console.error('❌ Failed to remove participant:', error.message);
      
      if (customOnError) {
        customOnError(error);
      }
    },
    ...restOptions,
  });
};

// Export constants
export { ROOM_TYPES };