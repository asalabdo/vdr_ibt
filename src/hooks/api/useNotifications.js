import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/api';

const NOTIFICATIONS_ENDPOINTS = {
  LIST: '/ocs/v2.php/apps/notifications/api/v2/notifications',
  DELETE: '/ocs/v2.php/apps/notifications/api/v2/notifications',
  DELETE_SINGLE: (id) => `/ocs/v2.php/apps/notifications/api/v2/notifications/${id}`,
  ACTION: (id, actionIndex) => `/ocs/v2.php/apps/notifications/api/v2/notifications/${id}/action/${actionIndex}`,
};

// Get all notifications
export const useNotifications = (options = {}) => {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const response = await apiClient.get(NOTIFICATIONS_ENDPOINTS.LIST, {
        params: { format: 'json' },
        headers: { 'OCS-APIRequest': 'true' }
      });
      return response.data?.ocs?.data || [];
    },
    refetchInterval: 30000, // Refetch every 30 seconds
    ...options
  });
};

// Delete single notification
export const useDeleteNotification = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (notificationId) => {
      const response = await apiClient.delete(
        NOTIFICATIONS_ENDPOINTS.DELETE_SINGLE(notificationId),
        { headers: { 'OCS-APIRequest': 'true' } }
      );
      return response.data;
    },
    onSuccess: () => {
      // Invalidate notifications query to refetch
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (error) => {
      console.error('Failed to delete notification:', error);
    }
  });
};

// Clear all notifications
export const useClearAllNotifications = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      const response = await apiClient.delete(NOTIFICATIONS_ENDPOINTS.DELETE, {
        headers: { 'OCS-APIRequest': 'true' }
      });
      return response.data;
    },
    onSuccess: () => {
      // Invalidate notifications query to refetch
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (error) => {
      console.error('Failed to clear all notifications:', error);
    }
  });
};

// Execute notification action
export const useNotificationAction = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ notificationId, actionIndex, actionData }) => {
      const action = actionData;
      const method = action.type.toLowerCase();
      
      let response;
      if (method === 'post') {
        response = await apiClient.post(action.link, {}, {
          headers: { 'OCS-APIRequest': 'true' }
        });
      } else if (method === 'delete') {
        response = await apiClient.delete(action.link, {
          headers: { 'OCS-APIRequest': 'true' }
        });
      } else {
        response = await apiClient.get(action.link, {
          headers: { 'OCS-APIRequest': 'true' }
        });
      }
      
      return response.data;
    },
    onSuccess: () => {
      // Invalidate notifications query to refetch
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (error) => {
      console.error('Failed to execute notification action:', error);
    }
  });
};

// Send custom notification (for VDR app)
export const useSendNotification = () => {
  return useMutation({
    mutationFn: async (notificationData) => {
      const response = await apiClient.post(
        '/apps/app_api/api/v1/notification',
        notificationData,
        { headers: { 'OCS-APIRequest': 'true' } }
      );
      return response.data;
    },
    onError: (error) => {
      console.error('Failed to send notification:', error);
    }
  });
};

export default {
  useNotifications,
  useDeleteNotification,
  useClearAllNotifications,
  useNotificationAction,
  useSendNotification
};
