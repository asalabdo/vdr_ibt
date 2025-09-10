import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { auditLogsAPI } from '../../api/auditLogs';

/**
 * React Query hooks for Audit Logs Management
 * Modern functional approach with comprehensive error handling and caching
 */

// ===== QUERY KEY FACTORIES =====

/**
 * Query key factory for audit logs (simplified)
 */
const auditLogsQueryKeys = {
  all: ['auditLogs'],
  stats: (options) => [...auditLogsQueryKeys.all, 'stats', options],
};

// ===== QUERY HOOKS =====

// useAuditLogs hook removed - we now use useAuditLogStats for everything

/**
 * Hook to fetch audit log statistics
 * @param {Object} options - Query options
 * @param {Object} [queryOptions] - React Query options
 * @returns {Object} Query result with statistics data
 */
export const useAuditLogStats = (options = {}, queryOptions = {}) => {
  const {
    enabled = true,
    staleTime = 60000, // 1 minute
    refetchInterval = 300000, // 5 minutes
    ...restOptions
  } = queryOptions;

  return useQuery({
    queryKey: auditLogsQueryKeys.stats(options),
    queryFn: () => auditLogsAPI.getAuditLogStats(options),
    enabled,
    staleTime,
    refetchInterval,
    ...restOptions,
  });
};

// useAuditLogFilters hook removed - not used anymore

// ===== MUTATION HOOKS =====

/**
 * Hook to export audit logs
 * @param {Object} [options] - Mutation options
 * @returns {Object} Mutation object with export functionality
 */
export const useExportAuditLogs = (options = {}) => {
  const { onSuccess, onError, ...restOptions } = options;

  return useMutation({
    mutationFn: (exportOptions) => auditLogsAPI.exportAuditLogs(exportOptions),
    onSuccess: (data, variables, context) => {
      // Trigger download
      if (data.success && data.data) {
        const blob = new Blob([data.data], { type: data.mimeType });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = data.filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }
      
      onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      console.error('❌ Export audit logs failed:', error.message);
      onError?.(error, variables, context);
    },
    ...restOptions,
  });
};

// ===== ADVANCED HOOKS REMOVED =====
// useRealTimeAuditLogs, useAuditLogDashboard, usePaginatedAuditLogs removed
// We now use simple client-side pagination with useAuditLogStats

/**
 * Simplified audit logs management hook
 * @returns {Object} Basic audit log management functions
 */
export const useAuditLogsManagement = () => {
  const queryClient = useQueryClient();

  // Utility functions
  const refreshAllData = () => {
    queryClient.invalidateQueries({ queryKey: auditLogsQueryKeys.all });
  };

  const clearCache = () => {
    queryClient.removeQueries({ queryKey: auditLogsQueryKeys.all });
  };

  return {
    // Utilities
    refreshAllData,
    clearCache,
    
    // Query keys (for external cache management)
    queryKeys: auditLogsQueryKeys,
  };
};
