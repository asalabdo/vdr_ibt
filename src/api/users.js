import apiClient, { adminApiClient } from './client';
import { endpoints, withJsonFormat } from './endpoints';

/**
 * Users Management API functions for Nextcloud
 * Modern functional approach with comprehensive user management capabilities
 */

// ===== PURE UTILITY FUNCTIONS =====

/**
 * Transform raw Nextcloud user list data into application format
 * @param {Array} usersArray - Raw users array from Nextcloud
 * @returns {Array} Formatted users array
 */
const formatUsersList = (usersArray) => {
  if (!Array.isArray(usersArray)) return [];
  
  return usersArray.map(username => ({
    id: username,
    username: username,
    displayname: username, // Will be fetched separately if needed
    email: '',
    groups: [],
    isAdmin: false,
    enabled: true,
    lastLogin: null,
  }));
};

/**
 * Transform detailed user data from Nextcloud API
 * @param {Object} userData - Raw user data from Nextcloud
 * @param {string} userId - User ID
 * @returns {Object} Formatted user data
 */
const formatUserDetails = (userData, userId) => ({
  id: userData.id || userId,
  username: userId,
  displayname: userData.displayname || userData['display-name'] || userId,
  email: userData.email || '',
  groups: userData.groups || [],
  quota: userData.quota || {},
  isAdmin: (userData.groups || []).includes('admin'),
  enabled: userData.enabled !== false,
  language: userData.language || 'en',
  locale: userData.locale || 'en',
  lastLogin: userData.lastLogin || null,
  backend: userData.backend || '',
  storageLocation: userData.storageLocation || '',
  phone: userData.phone || '',
  address: userData.address || '',
  website: userData.website || '',
  twitter: userData.twitter || '',
  fediverse: userData.fediverse || '',
  organisation: userData.organisation || '',
  role: userData.role || '',
  headline: userData.headline || '',
  biography: userData.biography || '',
});

// ===== API FUNCTIONS =====

/**
 * Get list of all users
 * @param {Object} options - Query options
 * @param {string} [options.search] - Search term to filter users
 * @param {number} [options.limit] - Limit number of results
 * @param {number} [options.offset] - Offset for pagination
 * @returns {Object} Users list and metadata
 */
const getUsers = async (options = {}) => {
  try {
    const { search, limit, offset } = options;
    
    // Build query parameters
    const params = new URLSearchParams();
    params.append('format', 'json');
    
    if (search) params.append('search', search);
    if (limit) params.append('limit', limit.toString());
    if (offset) params.append('offset', offset.toString());
    
    const url = `${endpoints.users.list}?${params.toString()}`;
    const response = await adminApiClient.get(url);
    
     if (response.data?.ocs?.meta?.statuscode === 100) {
      const usersData = response.data.ocs.data?.users || [];
      
      return {
        success: true,
        users: formatUsersList(usersData),
        total: usersData.length,
        hasMore: false, // Nextcloud doesn't provide pagination info in this endpoint
      };
    }
    
    throw new Error('Failed to fetch users');
    
  } catch (error) {
    console.error('❌ Failed to get users:', error.message);
    
    // Handle permission errors with user-friendly messages
    if (error.isPermissionError || error.response?.status === 403) {
      throw new Error('You need subadmin or admin privileges to access user management. Please contact your administrator.');
    }
    
    throw new Error(error.response?.data?.ocs?.meta?.message || error.message || 'Failed to get users');
  }
};

/**
 * Get detailed information for a specific user
 * @param {string} userId - User ID to fetch details for
 * @returns {Object} Detailed user information
 */
const getUserDetails = async (userId) => {
  try {
    const response = await adminApiClient.get(withJsonFormat(endpoints.users.details(userId)));
    
     if (response.data?.ocs?.meta?.statuscode === 100) {
      const userData = response.data.ocs.data;
      
      return {
        success: true,
        user: formatUserDetails(userData, userId),
      };
    }
    
    throw new Error('Failed to fetch user details');
    
  } catch (error) {
    console.error(`❌ Failed to get user details for ${userId}:`, error.message);
    throw new Error(error.response?.data?.ocs?.meta?.message || error.message || 'Failed to get user details');
  }
};

/**
 * Search users by name or username
 * @param {string} searchTerm - Search term
 * @param {Object} options - Search options
 * @returns {Object} Search results
 */
const searchUsers = async (searchTerm, options = {}) => {
  try {
    const { limit = 25, offset = 0 } = options;
    
    const params = new URLSearchParams();
    params.append('search', searchTerm);
    params.append('format', 'json');
    if (limit) params.append('limit', limit.toString());
    if (offset) params.append('offset', offset.toString());
    
    const url = `${endpoints.users.search}?${params.toString()}`;
    const response = await adminApiClient.get(url);
    
     if (response.data?.ocs?.meta?.statuscode === 100) {
      const usersData = response.data.ocs.data?.users || [];
      
      return {
        success: true,
        users: formatUsersList(usersData),
        searchTerm,
        total: usersData.length,
      };
    }
    
    throw new Error('Search failed');
    
  } catch (error) {
    console.error('❌ Failed to search users:', error.message);
    throw new Error(error.response?.data?.ocs?.meta?.message || error.message || 'Search failed');
  }
};

/**
 * Create a new user
 * @param {Object} userData - User data for creation
 * @param {string} userData.userid - Username (required)
 * @param {string} userData.password - Password (required)
 * @param {string} [userData.displayName] - Display name
 * @param {string} [userData.email] - Email address
 * @param {Array} [userData.groups] - Groups to add user to
 * @returns {Object} Creation result
 */
const createUser = async (userData) => {
  try {
    const { userid, password, displayName, email, groups = [] } = userData;
    
    if (!userid || !password) {
      throw new Error('Username and password are required');
    }
    
    // Create user
    const formData = new URLSearchParams();
    formData.append('userid', userid);
    formData.append('password', password);
    if (displayName) formData.append('displayName', displayName);
    if (email) formData.append('email', email);
    
    const response = await adminApiClient.post(endpoints.users.create, formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    
     if (response.data?.ocs?.meta?.statuscode === 100) {
      // Add user to groups if specified (handle failures gracefully)
      const groupResults = [];
      const failedGroups = [];
      
      if (groups.length > 0) {
        for (const groupId of groups) {
          try {
            await addUserToGroup(userid, groupId);
            groupResults.push(groupId);
          } catch (error) {
            console.warn(`⚠️ Failed to add user ${userid} to group ${groupId}:`, error.message);
            failedGroups.push(groupId);
          }
        }
      }
      
      return {
        success: true,
        user: {
          id: userid,
          username: userid,
          displayname: displayName || userid,
          email: email || '',
          groups: groupResults, // Only successful groups
        },
        message: 'User created successfully',
        warnings: failedGroups.length > 0 ? [`Failed to assign groups: ${failedGroups.join(', ')}`] : []
      };
    }
    
    throw new Error('Failed to create user');
    
  } catch (error) {
    console.error('❌ Failed to create user:', error.message);
    throw new Error(error.response?.data?.ocs?.meta?.message || error.message || 'Failed to create user');
  }
};

/**
 * Update user display name
 * @param {string} userId - User ID
 * @param {string} displayName - New display name
 * @returns {Object} Update result
 */
const updateUserDisplayName = async (userId, displayName) => {
  try {
    const formData = new URLSearchParams();
    formData.append('value', displayName);
    
    const response = await adminApiClient.put(endpoints.users.updateDisplayName(userId), formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    
     if (response.data?.ocs?.meta?.statuscode === 100) {
      return {
        success: true,
        message: 'Display name updated successfully'
      };
    }
    
    throw new Error('Failed to update display name');
    
  } catch (error) {
    console.error(`❌ Failed to update display name for ${userId}:`, error.message);
    throw new Error(error.response?.data?.ocs?.meta?.message || error.message || 'Failed to update display name');
  }
};

/**
 * Update user email
 * @param {string} userId - User ID
 * @param {string} email - New email address
 * @returns {Object} Update result
 */
const updateUserEmail = async (userId, email) => {
  try {
    const formData = new URLSearchParams();
    formData.append('value', email);
    
    const response = await adminApiClient.put(endpoints.users.updateEmail(userId), formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    
     if (response.data?.ocs?.meta?.statuscode === 100) {
      return {
        success: true,
        message: 'Email updated successfully'
      };
    }
    
    throw new Error('Failed to update email');
    
  } catch (error) {
    console.error(`❌ Failed to update email for ${userId}:`, error.message);
    throw new Error(error.response?.data?.ocs?.meta?.message || error.message || 'Failed to update email');
  }
};

/**
 * Update user password
 * @param {string} userId - User ID
 * @param {string} password - New password
 * @returns {Object} Update result
 */
const updateUserPassword = async (userId, password) => {
  try {
    const formData = new URLSearchParams();
    formData.append('value', password);
    
    const response = await adminApiClient.put(endpoints.users.updatePassword(userId), formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    
     if (response.data?.ocs?.meta?.statuscode === 100) {
      return {
        success: true,
        message: 'Password updated successfully'
      };
    }
    
    throw new Error('Failed to update password');
    
  } catch (error) {
    console.error(`❌ Failed to update password for ${userId}:`, error.message);
    throw new Error(error.response?.data?.ocs?.meta?.message || error.message || 'Failed to update password');
  }
};

/**
 * Enable user account
 * @param {string} userId - User ID
 * @returns {Object} Operation result
 */
const enableUser = async (userId) => {
  try {
    const response = await adminApiClient.put(endpoints.users.enable(userId));
    
     if (response.data?.ocs?.meta?.statuscode === 100) {
      return {
        success: true,
        message: 'User enabled successfully'
      };
    }
    
    throw new Error('Failed to enable user');
    
  } catch (error) {
    console.error(`❌ Failed to enable user ${userId}:`, error.message);
    throw new Error(error.response?.data?.ocs?.meta?.message || error.message || 'Failed to enable user');
  }
};

/**
 * Disable user account
 * @param {string} userId - User ID
 * @returns {Object} Operation result
 */
const disableUser = async (userId) => {
  try {
    const response = await adminApiClient.put(endpoints.users.disable(userId));
    
     if (response.data?.ocs?.meta?.statuscode === 100) {
      return {
        success: true,
        message: 'User disabled successfully'
      };
    }
    
    throw new Error('Failed to disable user');
    
  } catch (error) {
    console.error(`❌ Failed to disable user ${userId}:`, error.message);
    throw new Error(error.response?.data?.ocs?.meta?.message || error.message || 'Failed to disable user');
  }
};

/**
 * Delete user account
 * @param {string} userId - User ID
 * @returns {Object} Operation result
 */
const deleteUser = async (userId) => {
  try {
    const response = await adminApiClient.delete(endpoints.users.delete(userId));
    
     if (response.data?.ocs?.meta?.statuscode === 100) {
      return {
        success: true,
        message: 'User deleted successfully'
      };
    }
    
    throw new Error('Failed to delete user');
    
  } catch (error) {
    console.error(`❌ Failed to delete user ${userId}:`, error.message);
    throw new Error(error.response?.data?.ocs?.meta?.message || error.message || 'Failed to delete user');
  }
};

/**
 * Get user groups
 * @param {string} userId - User ID
 * @returns {Object} User groups
 */
const getUserGroups = async (userId) => {
  try {
    const response = await adminApiClient.get(withJsonFormat(endpoints.users.groups(userId)));
    
     if (response.data?.ocs?.meta?.statuscode === 100) {
      const groups = response.data.ocs.data?.groups || [];
      
      return {
        success: true,
        groups: groups,
        user: userId
      };
    }
    
    throw new Error('Failed to get user groups');
    
  } catch (error) {
    console.error(`❌ Failed to get groups for user ${userId}:`, error.message);
    throw new Error(error.response?.data?.ocs?.meta?.message || error.message || 'Failed to get user groups');
  }
};

/**
 * Add user to group
 * @param {string} userId - User ID
 * @param {string} groupId - Group ID
 * @returns {Object} Operation result
 */
const addUserToGroup = async (userId, groupId) => {
  try {
    const formData = new URLSearchParams();
    formData.append('groupid', groupId);
    
    const response = await adminApiClient.post(endpoints.users.addToGroup(userId), formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    
     if (response.data?.ocs?.meta?.statuscode === 100) {
      return {
        success: true,
        message: `User added to group ${groupId} successfully`
      };
    }
    
    throw new Error('Failed to add user to group');
    
  } catch (error) {
    console.error(`❌ Failed to add user ${userId} to group ${groupId}:`, error.message);
    throw new Error(error.response?.data?.ocs?.meta?.message || error.message || 'Failed to add user to group');
  }
};

/**
 * Remove user from group
 * @param {string} userId - User ID
 * @param {string} groupId - Group ID
 * @returns {Object} Operation result
 */
const removeUserFromGroup = async (userId, groupId) => {
  try {
    const formData = new URLSearchParams();
    formData.append('groupid', groupId);
    
    const response = await adminApiClient.delete(endpoints.users.removeFromGroup(userId), {
      data: formData,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    
     if (response.data?.ocs?.meta?.statuscode === 100) {
      return {
        success: true,
        message: `User removed from group ${groupId} successfully`
      };
    }
    
    throw new Error('Failed to remove user from group');
    
  } catch (error) {
    console.error(`❌ Failed to remove user ${userId} from group ${groupId}:`, error.message);
    throw new Error(error.response?.data?.ocs?.meta?.message || error.message || 'Failed to remove user from group');
  }
};

// ===== EXPORTS =====

/**
 * Users Management API object with all functions
 * Modern functional approach - all functions are pure and composable
 */
export const usersAPI = {
  // User list and search
  getUsers,
  getUserDetails,
  searchUsers,
  
  // User management
  createUser,
  updateUserDisplayName,
  updateUserEmail,
  updateUserPassword,
  enableUser,
  disableUser,
  deleteUser,
  
  // Group management
  getUserGroups,
  addUserToGroup,
  removeUserFromGroup,
  
  // Pure utility functions (exposed for testing and flexibility)
  formatUsersList,
  formatUserDetails,
};
