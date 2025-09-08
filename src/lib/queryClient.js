import { QueryClient } from '@tanstack/react-query';

/**
 * React Query Client Configuration
 * 
 * Optimized for Nextcloud API integration with:
 * - Smart retry logic that avoids retrying auth failures
 * - Balanced cache timing for performance and data freshness
 * - Network-aware refetch behavior
 */

// ===== CACHE TIMING CONSTANTS =====

/** How long data stays fresh before requiring background refetch (5 minutes) */
const STALE_TIME = 1000 * 60 * 5;

/** How long data stays in cache before garbage collection (10 minutes) */
const GC_TIME = 1000 * 60 * 10;

// ===== RETRY CONFIGURATION CONSTANTS =====

/** Maximum retry attempts for queries */
const MAX_QUERY_RETRIES = 3;

/** Maximum retry attempts for mutations */
const MAX_MUTATION_RETRIES = 1;

/** HTTP status codes that indicate authentication failure */
const AUTH_ERROR_CODES = [401, 403];

/** Range for client errors (4xx) that should not be retried */
const CLIENT_ERROR_START = 400;
const CLIENT_ERROR_END = 500;

// ===== QUERY CLIENT CONFIGURATION =====

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: STALE_TIME,
      gcTime: GC_TIME,
      retry: (failureCount, error) => {
        // Don't retry on authentication errors
        if (AUTH_ERROR_CODES.includes(error?.response?.status)) {
          return false;
        }
        // Retry up to configured maximum for other errors
        return failureCount < MAX_QUERY_RETRIES;
      },
      refetchOnWindowFocus: false,    // Prevent excessive refetching
      refetchOnReconnect: 'always',   // Always refetch when reconnecting
    },
    mutations: {
      retry: (failureCount, error) => {
        // Don't retry mutations on client errors (4xx)
        const status = error?.response?.status;
        if (status >= CLIENT_ERROR_START && status < CLIENT_ERROR_END) {
          return false;
        }
        // Retry once for server errors (5xx) or network errors
        return failureCount < MAX_MUTATION_RETRIES;
      },
    },
  },
});

// ===== UTILITY FUNCTIONS =====

/**
 * Invalidate all queries to trigger refetch
 * 
 * Useful for scenarios like:
 * - After user login to refresh all data
 * - When data changes that might affect multiple queries
 * - Manual refresh operations
 * 
 * @example
 * // After successful login
 * invalidateAllQueries();
 */
export const invalidateAllQueries = () => {
  queryClient.invalidateQueries();
};

/**
 * Clear all cached data and remove from memory
 * 
 * More aggressive than invalidation - actually removes data from cache.
 * Useful for:
 * - User logout (complete data cleanup)
 * - Memory optimization
 * - Fresh start scenarios
 * 
 * @example
 * // On user logout
 * clearAllCaches();
 */
export const clearAllCaches = () => {
  queryClient.clear();
};
