import React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { talkAPI } from '../../api/talk';

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
