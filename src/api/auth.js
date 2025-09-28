import apiClient, { adminApiClient, getCredentials } from './client';
import { endpoints, withJsonFormat } from './endpoints';
import { getUserRole, calculateUserPermissions } from '../lib/userRoles';
import { formatAuthUser } from '../lib/userFormatters';

/**
 * Authentication API functions for Nextcloud
 * Modern functional approach with pure functions and clear composition
 */

// ===== PURE UTILITY FUNCTIONS =====

// formatUserData function moved to ../lib/userFormatters.js
// Using formatAuthUser from centralized formatters

/**
 * Store authentication data in localStorage
 * @param {string} username - Username
 * @param {string} token - Authentication token
 * @param {Object} userData - User data to store
 */
const storeAuthData = (username, token, userData) => {
  localStorage.setItem('nextcloud_username', username);
  localStorage.setItem('nextcloud_token', token);
  localStorage.setItem('user_data', JSON.stringify(userData));
};

/**
 * Clear all authentication data from localStorage
 */
const clearAuthData = () => {
  // Clear all stored authentication data
  localStorage.removeItem('nextcloud_username');
  localStorage.removeItem('nextcloud_token');
  localStorage.removeItem('user_data');
  
  // Clear any other app-specific data
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.startsWith('nextcloud_') || key.startsWith('vdr_'))) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach(key => localStorage.removeItem(key));
};

/**
 * Get stored user data from localStorage
 * @returns {Object|null} Stored user data or null
 */
const getStoredUser = () => {
  try {
    const userData = localStorage.getItem('user_data');
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('❌ Failed to parse stored user data:', error.message);
    return null;
  }
};

/**
 * Check if user is currently authenticated
 * @returns {boolean} Authentication status
 */
const isAuthenticated = () => {
  const username = localStorage.getItem('nextcloud_username');
  const token = localStorage.getItem('nextcloud_token');
  return !!(username && token);
};

/**
 * Check if current user has specific permission
 * @param {string} permission - Permission to check
 * @returns {boolean} Permission status
 */
const hasPermission = (permission) => {
  try {
    const userData = getStoredUser();
    if (!userData) return false;
    
    const permissions = calculateUserPermissions(userData);
    return permissions.includes(permission);
  } catch (error) {
    console.error('❌ Permission check failed:', error.message);
    return false;
  }
};

// ===== API FUNCTIONS =====
/**
 * Login user with credentials
 * @param {Object} credentials - Username and password/app-password
 * @param {string} credentials.username - Username
 * @param {string} credentials.password - Password or app password
 * @returns {Object} User data and authentication info
 */
const login = async (credentials) => {
  try {
    const { username, password } = credentials;
    
    // Test authentication by getting current user info
    const response = await apiClient.get(withJsonFormat(endpoints.auth.currentUser), {
      auth: { username, password }
    });

    // Check if response is successful
    if (response.data?.ocs?.meta?.statuscode === 200) {
      const userData = response.data.ocs.data;
      
      // Format user data using centralized formatter
      const formattedUser = formatAuthUser(userData, username);
      
      // Store authentication data using pure function
      storeAuthData(username, password, userData);
      
      return {
        success: true,
        user: formattedUser,
        token: password,
        sessionExpiry: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(), // 8 hours
      };
    }
    
    throw new Error('Invalid credentials or server error');
    
  } catch (error) {
    console.error('❌ Login failed:', error.message);
    
    // Clear any stored credentials on login failure using pure function
    clearAuthData();
    
    throw new Error(error.response?.data?.ocs?.meta?.message || error.message || 'Login failed');
  }
};

/**
 * Get current authenticated user information
 * @returns {Object} Current user data
 */
const getCurrentUser = async () => {
  try {
    const response = await apiClient.get(withJsonFormat(endpoints.auth.currentUser));
    
    if (response.data?.ocs?.meta?.statuscode === 200) {
      const userData = response.data.ocs.data;
      
      // Update stored user data using pure function
      localStorage.setItem('user_data', JSON.stringify(userData));
      
      // Format user data using centralized formatter (use id as username for current user)
      const formattedUser = formatAuthUser(userData, userData.id);
      
      return {
        ...formattedUser,
        storageLocation: userData.storageLocation || '',
        backend: userData.backend || '',
      };
    }
    
    throw new Error('Failed to get user information');
    
  } catch (error) {
    console.error('❌ Failed to get current user:', error.message);
    throw error;
  }
};

/**
 * Check server status and capabilities
 * @returns {Object} Server information
 */
const getServerInfo = async () => {
  try {
    // Get basic server status (no auth required)
    const statusResponse = await apiClient.get(endpoints.auth.serverStatus);
    
    // Get server capabilities (requires auth)
    const capabilitiesResponse = await apiClient.get(withJsonFormat(endpoints.auth.capabilities));
    
    return {
      status: {
        installed: statusResponse.data?.installed || false,
        maintenance: statusResponse.data?.maintenance || false,
        needsDbUpgrade: statusResponse.data?.needsDbUpgrade || false,
        version: statusResponse.data?.version || 'unknown',
        versionstring: statusResponse.data?.versionstring || 'unknown',
        edition: statusResponse.data?.edition || '',
      },
      capabilities: capabilitiesResponse.data?.ocs?.data?.capabilities || {},
    };
  } catch (error) {
    console.error('❌ Failed to get server info:', error.message);
    throw error;
  }
};

/**
 * Test authentication with current credentials
 * @returns {boolean} Authentication status
 */
const testAuthentication = async () => {
  try {
    const response = await apiClient.get(withJsonFormat(endpoints.auth.testAuth));
    return response.data?.ocs?.meta?.statuscode === 200;
  } catch (error) {
    console.error('❌ Authentication test failed:', error.message);
    return false;
  }
};

/**
 * Logout user and clear stored data
 * @returns {Object} Logout result
 */
const logout = () => {
  try {
    // Clear all authentication data using pure function
    clearAuthData();
    
    console.log('✅ User logged out successfully');
    return { success: true, message: 'Logged out successfully' };
    
  } catch (error) {
    console.error('❌ Logout error:', error.message);
    return { success: false, message: error.message };
  }
};

/**
 * Refresh current session
 * @returns {Object} Updated user data
 */
const refreshSession = async () => {
  try {
    const credentials = getCredentials();
    
    if (!credentials) {
      throw new Error('No active session found');
    }
    
    // Get fresh user data
    return await getCurrentUser();
    
  } catch (error) {
    console.error('❌ Session refresh failed:', error.message);
    
    // Clear invalid session
    logout();
    throw error;
  }
};

// ===== EXPORTS =====

/**
 * Authentication API object with all functions
 * Modern functional approach - all functions are pure and composable
 */
export const authAPI = {
  // Authentication operations
  login,
  logout,
  getCurrentUser,
  refreshSession,
  testAuthentication,
  
  // Server information
  getServerInfo,
  
  // User state utilities
  isAuthenticated,
  getStoredUser,
  hasPermission,
  
  // Pure utility functions (exposed for testing and flexibility)
  storeAuthData,
  clearAuthData,
};
