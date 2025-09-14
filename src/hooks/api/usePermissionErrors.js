import { useCallback } from 'react';
import { toast } from 'sonner';
import { usePermissions } from './useAuth';

/**
 * Hook for handling permission-related errors in API calls
 * 
 * Provides utilities for:
 * - Displaying user-friendly error messages
 * - Logging permission errors
 * - Providing action suggestions
 * - Handling different error types
 * 
 * @returns {Object} Permission error handling utilities
 */
export const usePermissionErrors = () => {
  const { role, isAdmin, isSubadmin } = usePermissions();

  /**
   * Handle permission errors from API calls
   * @param {Error} error - The error object from API call
   * @param {Object} [options] - Error handling options
   * @param {boolean} [options.showToast=true] - Show toast notification
   * @param {string} [options.context] - Context for the error (e.g., 'accessing groups')
   * @param {Function} [options.onError] - Custom error callback
   */
  const handlePermissionError = useCallback((error, options = {}) => {
    const {
      showToast = true,
      context = 'performing this action',
      onError
    } = options;

    // Check if this is a permission-related error
    const isPermissionError = 
      error?.isPermissionError || 
      error?.response?.status === 403 ||
      error?.statusCode === 403 ||
      error?.message?.toLowerCase().includes('permission') ||
      error?.message?.toLowerCase().includes('access denied') ||
      error?.message?.toLowerCase().includes('forbidden');

    if (!isPermissionError) {
      // Not a permission error, handle normally
      if (showToast) {
        toast.error(error?.message || 'An error occurred');
      }
      onError?.(error);
      return false;
    }

    // This is a permission error
    console.warn('🚫 Permission error detected:', {
      error: error.message,
      userRole: role,
      context,
      url: error?.config?.url || error?.originalError?.config?.url
    });

    // Generate user-friendly error message based on role
    let message = 'Access denied.';
    let suggestion = '';

    if (role === 'user') {
      message = `You don't have permission for ${context}.`;
      suggestion = 'You may need subadmin or admin privileges. Contact your administrator for access.';
    } else if (isSubadmin) {
      message = `Limited access for ${context}.`;
      suggestion = 'This action may require admin privileges or access to different groups.';
    } else {
      message = error?.message || `Permission denied for ${context}.`;
      suggestion = 'Please check your permissions or contact support.';
    }

    // Show toast notification if requested
    if (showToast) {
      toast.error(message, {
        description: suggestion,
        duration: 6000, // Show longer for permission errors
        action: {
          label: 'Understood',
          onClick: () => toast.dismiss(),
        },
      });
    }

    // Call custom error handler if provided
    onError?.(error, { message, suggestion, isPermissionError: true });

    return true; // Indicates this was a permission error
  }, [role, isAdmin, isSubadmin]);

  /**
   * Create an error handler for React Query mutations
   * @param {string} [context] - Context for the error
   * @param {Object} [options] - Additional options
   * @returns {Function} Error handler function for React Query
   */
  const createMutationErrorHandler = useCallback((context, options = {}) => {
    return (error) => {
      handlePermissionError(error, {
        context,
        ...options
      });
    };
  }, [handlePermissionError]);

  /**
   * Create an error handler for React Query queries
   * @param {string} [context] - Context for the error
   * @param {Object} [options] - Additional options
   * @returns {Function} Error handler function for React Query
   */
  const createQueryErrorHandler = useCallback((context, options = {}) => {
    return (error) => {
      // For queries, we might want to be less intrusive
      handlePermissionError(error, {
        showToast: false, // Don't show toast for query errors by default
        context,
        ...options
      });
    };
  }, [handlePermissionError]);

  /**
   * Check if an error is permission-related
   * @param {Error} error - Error to check
   * @returns {boolean} True if permission error
   */
  const isPermissionError = useCallback((error) => {
    return !!(
      error?.isPermissionError || 
      error?.response?.status === 403 ||
      error?.statusCode === 403 ||
      error?.message?.toLowerCase().includes('permission') ||
      error?.message?.toLowerCase().includes('access denied') ||
      error?.message?.toLowerCase().includes('forbidden')
    );
  }, []);

  /**
   * Get suggested actions for permission errors based on user role
   * @param {string} [action] - The action that failed
   * @returns {Array} Array of suggestion objects
   */
  const getPermissionSuggestions = useCallback((action = 'this action') => {
    const suggestions = [];

    if (role === 'user') {
      suggestions.push({
        title: 'Request Access',
        description: `Contact your administrator to request permissions for ${action}`,
        action: 'contact_admin'
      });
      
      suggestions.push({
        title: 'Check Available Features',
        description: 'Review what features are available with your current permissions',
        action: 'view_permissions'
      });
    } else if (isSubadmin) {
      suggestions.push({
        title: 'Check Group Access',
        description: 'Ensure you have management rights for the relevant groups',
        action: 'check_groups'
      });
      
      suggestions.push({
        title: 'Contact Admin',
        description: 'This action may require full admin privileges',
        action: 'contact_admin'
      });
    } else {
      suggestions.push({
        title: 'Refresh Session',
        description: 'Try refreshing your session or logging in again',
        action: 'refresh_session'
      });
      
      suggestions.push({
        title: 'Check System Status',
        description: 'Verify that the system is functioning normally',
        action: 'check_system'
      });
    }

    return suggestions;
  }, [role, isSubadmin]);

  return {
    handlePermissionError,
    createMutationErrorHandler,
    createQueryErrorHandler,
    isPermissionError,
    getPermissionSuggestions,
    
    // User context for error handling
    userContext: {
      role,
      isAdmin,
      isSubadmin
    }
  };
};

export default usePermissionErrors;
