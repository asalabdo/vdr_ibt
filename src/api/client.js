import axios from 'axios';

/**
 * HTTP Client Configuration for Nextcloud API Integration
 * 
 * Features:
 * - Environment-aware proxy routing for CORS-free development
 * - Automatic authentication injection via interceptors
 * - Comprehensive error handling and logging
 * - Support for both regular and admin API operations
 */

// ===== CONSTANTS =====

/** Default fallback URL for Nextcloud server */
const DEFAULT_NEXTCLOUD_URL = 'https://ibtikarya.sa';

/** Default request timeout in milliseconds */
const DEFAULT_TIMEOUT = 30000;

/** Proxy path for development CORS bypass */
const DEV_PROXY_PATH = '/api/nextcloud';

// ===== UTILITY FUNCTIONS =====

/**
 * Determine the appropriate base URL for API requests based on environment
 * 
 * @returns {string} Base URL - proxy path in development, direct URL in production
 * 
 * @example
 * // Development
 * getBaseURL() // returns '/api/nextcloud'
 * 
 * // Production  
 * getBaseURL() // returns 'https://ibtikarya.sa'
 */
const getBaseURL = () => {
  // Check explicit environment first, fallback to Vite's built-in detection
  const isDevEnvironment = 
    import.meta.env.VITE_ENVIRONMENT === 'development' || 
    import.meta.env.DEV;
  
  // In development, use proxy to avoid CORS issues
  if (isDevEnvironment) {
    return DEV_PROXY_PATH;
  }
  
  // In production/staging, use direct URL
  return import.meta.env.VITE_NEXTCLOUD_URL || DEFAULT_NEXTCLOUD_URL;
};

// ===== HTTP CLIENT CONFIGURATION =====

/**
 * Main API client instance for Nextcloud operations
 * 
 * Features:
 * - Automatic environment-based routing
 * - Built-in authentication via interceptors
 * - Comprehensive error handling
 * - Request/response logging in debug mode
 */
const apiClient = axios.create({
  baseURL: getBaseURL(),
  timeout: parseInt(import.meta.env.VITE_REQUEST_TIMEOUT) || DEFAULT_TIMEOUT,
  headers: {
    'OCS-APIRequest': 'true', // Required for Nextcloud OCS API
    'Content-Type': 'application/json',
  },
});

/**
 * Get current user credentials from localStorage or environment fallback
 * 
 * Priority order:
 * 1. Stored user credentials (from successful login)
 * 2. Development environment credentials
 * 
 * @returns {{username: string, password: string} | null} Credentials object or null if none found
 * 
 * @example
 * const creds = getCredentials();
 * if (creds) {
 *   console.log(`Authenticating as: ${creds.username}`);
 * }
 */
const getCredentials = () => {
  // First try localStorage (user logged in)
  const storedUsername = localStorage.getItem('nextcloud_username');
  const storedToken = localStorage.getItem('nextcloud_token');
  
  if (storedUsername && storedToken) {
    return { username: storedUsername, password: storedToken };
  }
  
  // Fallback to development environment credentials
  const devUsername = import.meta.env.VITE_DEV_USERNAME;
  const devToken = import.meta.env.VITE_DEV_APP_PASSWORD;
  
  if (devUsername && devToken) {
    return { username: devUsername, password: devToken };
  }
  
  return null;
};

/**
 * Get admin credentials from environment variables
 * 
 * Used for administrative operations that require elevated privileges
 * 
 * @returns {{username: string, password: string} | null} Admin credentials or null if not configured
 * 
 * @example
 * const adminCreds = getAdminCredentials();
 * if (adminCreds) {
 *   // Perform admin operation
 * }
 */
const getAdminCredentials = () => {
  const adminUsername = import.meta.env.VITE_ADMIN_USERNAME;
  const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD;
  
  if (adminUsername && adminPassword) {
    return { username: adminUsername, password: adminPassword };
  }
  
  return null;
};

// ===== REQUEST/RESPONSE INTERCEPTORS =====

/**
 * Request interceptor: Automatically inject authentication credentials
 * 
 * Features:
 * - Adds Basic Authentication headers to all requests
 * - Provides debug logging in development mode
 * - Graceful handling when no credentials are available
 */
apiClient.interceptors.request.use(
  (config) => {
    const credentials = getCredentials();
    
    if (credentials) {
      // Add Basic Authentication header
      config.auth = {
        username: credentials.username,
        password: credentials.password
      };
      
      // Log request for debugging (only in development)
      if (import.meta.env.VITE_LOG_LEVEL === 'debug') {
        const env = import.meta.env.VITE_ENVIRONMENT || import.meta.env.MODE || 'unknown';
        console.log(`🔗 [${env.toUpperCase()}] API Request: ${config.method?.toUpperCase()} ${config.url}`);
      }
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

/**
 * Response interceptor: Handle API responses and errors
 * 
 * Features:
 * - Comprehensive error handling for different HTTP status codes
 * - Automatic session cleanup on authentication failures
 * - OCS API error transformation for better error messages
 * - Debug logging for successful responses
 */
apiClient.interceptors.response.use(
  (response) => {
    // Log successful response for debugging (only in development)
    if (import.meta.env.VITE_LOG_LEVEL === 'debug') {
      console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`);
    }
    
    return response;
  },
  (error) => {
    // Handle common errors
    if (error.response) {
      const { status, data } = error.response;
      
      // Authentication error - clear stored credentials and redirect to login
      if (status === 401 || status === 403) {
        console.warn('🔒 Authentication failed - clearing stored credentials');
        localStorage.removeItem('nextcloud_username');
        localStorage.removeItem('nextcloud_token');
        localStorage.removeItem('user_data');
        
        // Don't redirect if we're already on login page
        if (!window.location.pathname.includes('/login')) {
          // In a real app, you might use your router here
          console.warn('🔒 Redirecting to login page');
          // window.location.href = '/login';
        }
      }
      
      // Log error for debugging
      if (import.meta.env.VITE_LOG_LEVEL === 'debug') {
        console.error(`❌ API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url} - ${status}`, data);
      }
      
      // Transform Nextcloud OCS API errors
      if (data?.ocs?.meta) {
        const ocsError = new Error(data.ocs.meta.message || `Request failed with status ${status}`);
        ocsError.statuscode = data.ocs.meta.statuscode;
        ocsError.status = status;
        ocsError.response = error.response;
        return Promise.reject(ocsError);
      }
    } else if (error.request) {
      // Network error
      console.error('🌐 Network error:', error.message);
      const networkError = new Error('Network error - please check your connection');
      networkError.isNetworkError = true;
      return Promise.reject(networkError);
    }
    
    return Promise.reject(error);
  }
);

// ===== ADMIN API CLIENT =====

/**
 * Administrative API client for operations requiring elevated privileges
 * 
 * Features:
 * - Uses admin credentials from environment variables
 * - Same base configuration as regular client
 * - Shares response interceptor for consistent error handling
 * - Debug logging with admin-specific indicators
 */
const adminApiClient = axios.create({
  baseURL: getBaseURL(),
  timeout: parseInt(import.meta.env.VITE_REQUEST_TIMEOUT) || DEFAULT_TIMEOUT,
  headers: {
    'OCS-APIRequest': 'true',
    'Content-Type': 'application/json',
  },
});

/**
 * Admin request interceptor: Inject admin credentials for privileged operations
 */
adminApiClient.interceptors.request.use((config) => {
  const credentials = getAdminCredentials();
  
  if (credentials) {
    config.auth = {
      username: credentials.username,
      password: credentials.password
    };
    
    if (import.meta.env.VITE_LOG_LEVEL === 'debug') {
      console.log(`🔗 Admin API Request: ${config.method?.toUpperCase()} ${config.url}`);
    }
  }
  
  return config;
});

/**
 * Admin response interceptor: Reuse main client's error handling logic
 */
adminApiClient.interceptors.response.use(
  apiClient.interceptors.response.handlers[0].fulfilled,
  apiClient.interceptors.response.handlers[0].rejected
);

// ===== EXPORTS =====

/**
 * Default export: Main API client for regular Nextcloud operations
 */
export default apiClient;

/**
 * Admin API client for operations requiring administrative privileges
 */
export { adminApiClient };

/**
 * Utility functions for credential management
 */
export { getCredentials, getAdminCredentials };
