/**
 * Groups Management API
 * Handles all group-related operations using Nextcloud OCS API v2
 * Based on official Nextcloud documentation from Context7
 */

import apiClient, { adminApiClient } from './client';
import { endpoints, withJsonFormat } from './endpoints';

// ===== UTILITY FUNCTIONS =====

/**
 * Formats raw group data from API response
 * @param {Array} groups - Raw groups array from API
 * @returns {Array} Formatted groups list
 */
const formatGroupsList = (groups = []) => {
  return groups.map(groupId => ({
    id: groupId,
    displayName: groupId, // Will be enhanced when display names are fetched
    memberCount: 0 // Requires separate API call
  }));
};

/**
 * Formats single group details
 * @param {Object} groupData - Raw group data from API
 * @param {string} groupId - Group ID
 * @returns {Object} Formatted group details
 */
const formatGroupDetails = (groupData, groupId) => {
  const members = groupData?.users || [];
  return {
    id: groupId,
    displayName: groupId, // Enhanced with actual display name if available
    members: members.map(memberId => ({
      id: memberId,
      displayName: memberId,
      type: 'user'
    })),
    memberCount: members.length,
    subadmins: [], // Will be populated if fetched
    createdAt: null, // Not available in basic API
    updatedAt: null, // Not available in basic API
  };
};

// ===== CORE API FUNCTIONS =====

/**
 * Get all groups with optional search and pagination
 * @param {Object} options - Query options
 * @param {string} [options.search] - Search term
 * @param {number} [options.limit] - Maximum number of results
 * @param {number} [options.offset] - Offset for pagination
 * @returns {Object} Groups list with metadata
 */
const getGroups = async (options = {}) => {
  try {
    const { search, limit, offset } = options;
    
    let url = withJsonFormat(endpoints.groups.list);
    const params = new URLSearchParams();
    
    if (search) {
      params.append('search', search);
    }
    if (limit) {
      params.append('limit', limit.toString());
    }
    if (offset) {
      params.append('offset', offset.toString());
    }
    
    if (params.toString()) {
      url += `&${params.toString()}`;
    }
    
    const response = await adminApiClient.get(url);
    
    if (response.data?.ocs?.meta?.statuscode === 200) {
      const groups = response.data.ocs.data?.groups || [];
      
      return {
        success: true,
        groups: formatGroupsList(groups),
        total: groups.length,
        hasMore: limit && groups.length >= limit,
        offset: offset || 0
      };
    }
    
    throw new Error('Failed to fetch groups');
    
  } catch (error) {
    console.error('❌ Failed to get groups:', error.message);
    throw new Error(error.response?.data?.ocs?.meta?.message || error.message || 'Failed to get groups');
  }
};

/**
 * Get detailed information about a specific group including members
 * @param {string} groupId - Group identifier
 * @returns {Object} Detailed group information
 */
const getGroupDetails = async (groupId) => {
  try {
    if (!groupId?.trim()) {
      throw new Error('Group ID is required');
    }
    
    const response = await adminApiClient.get(withJsonFormat(endpoints.groups.members(groupId)));
    
    if (response.data?.ocs?.meta?.statuscode === 200) {
      const groupData = response.data.ocs.data || {};
      return {
        success: true,
        group: formatGroupDetails(groupData, groupId)
      };
    }
    
    throw new Error('Group not found or access denied');
    
  } catch (error) {
    console.error(`❌ Failed to get group details for ${groupId}:`, error.message);
    
    if (error.response?.status === 404) {
      throw new Error(`Group '${groupId}' not found`);
    }
    
    throw new Error(error.response?.data?.ocs?.meta?.message || error.message || 'Failed to get group details');
  }
};

/**
 * Get member counts for multiple groups efficiently
 * @param {Array} groupIds - Array of group IDs
 * @returns {Object} Object with groupId as key and member count as value
 */
const getGroupMemberCounts = async (groupIds = []) => {
  try {
    if (!Array.isArray(groupIds) || groupIds.length === 0) {
      return { success: true, memberCounts: {} };
    }

    // Filter out empty/invalid group IDs
    const validGroupIds = groupIds.filter(id => id && typeof id === 'string' && id.trim());
    
    if (validGroupIds.length === 0) {
      return { success: true, memberCounts: {} };
    }

    // Make parallel requests for all groups
    const memberPromises = validGroupIds.map(async (groupId) => {
      try {
        const response = await adminApiClient.get(withJsonFormat(endpoints.groups.members(groupId)));
        
        if (response.data?.ocs?.meta?.statuscode === 200) {
          const users = response.data.ocs.data?.users || [];
          return { 
            groupId, 
            count: users.length, 
            users: users.slice(0, 5).map(userId => ({
              id: userId,
              displayName: userId // We only have user IDs from this endpoint
            }))
          };
        }
        
        // If group doesn't exist or no access, return 0
        return { groupId, count: 0, users: [] };
      } catch (error) {
        // Log the error but don't fail the entire request
        console.warn(`⚠️ Failed to get members for group ${groupId}:`, error.message);
        return { groupId, count: 0, users: [] };
      }
    });

    // Wait for all requests to complete
    const results = await Promise.all(memberPromises);
    
    // Convert to object format
    const memberCounts = {};
    results.forEach(({ groupId, count, users }) => {
      memberCounts[groupId] = {
        count,
        users
      };
    });

    return {
      success: true,
      memberCounts
    };

  } catch (error) {
    console.error('❌ Failed to get group member counts:', error.message);
    throw new Error(error.response?.data?.ocs?.meta?.message || error.message || 'Failed to get member counts');
  }
};

/**
 * Create a new group
 * @param {Object} groupData - Group creation data
 * @param {string} groupData.groupId - Unique group identifier
 * @param {string} [groupData.displayName] - Human-readable group name
 * @returns {Object} Created group information
 */
const createGroup = async (groupData) => {
  try {
    const { groupId, displayName } = groupData;
    
    if (!groupId?.trim()) {
      throw new Error('Group ID is required');
    }
    
    // Validate group ID format (alphanumeric, hyphens, underscores)
    if (!/^[a-zA-Z0-9_-]+$/.test(groupId)) {
      throw new Error('Group ID can only contain letters, numbers, hyphens, and underscores');
    }
    
    const formData = new FormData();
    formData.append('groupid', groupId.trim());
    
    if (displayName?.trim()) {
      formData.append('displayname', displayName.trim());
    }
    
    const response = await adminApiClient.post(endpoints.groups.create, formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    
    if (response.data?.ocs?.meta?.statuscode === 200) {
      // If display name was provided, update it separately
      if (displayName?.trim() && displayName !== groupId) {
        try {
          await updateGroup(groupId, { displayName: displayName.trim() });
        } catch (updateError) {
          console.warn('⚠️ Group created but failed to set display name:', updateError.message);
        }
      }
      
      return {
        success: true,
        group: {
          id: groupId,
          displayName: displayName || groupId,
          memberCount: 0,
          members: []
        }
      };
    }
    
    // Handle specific error codes
    const statusCode = response.data?.ocs?.meta?.statuscode;
    if (statusCode === 102) {
      throw new Error(`Group '${groupId}' already exists`);
    } else if (statusCode === 101) {
      throw new Error('Invalid group data provided');
    }
    
    throw new Error('Failed to create group');
    
  } catch (error) {
    console.error('❌ Failed to create group:', error.message);
    
    if (error.response?.status === 409) {
      throw new Error(`Group '${groupData.groupId}' already exists`);
    }
    
    throw new Error(error.response?.data?.ocs?.meta?.message || error.message || 'Failed to create group');
  }
};

/**
 * Update group properties (display name, etc.)
 * @param {string} groupId - Group identifier
 * @param {Object} updates - Properties to update
 * @param {string} [updates.displayName] - New display name
 * @returns {Object} Updated group information
 */
const updateGroup = async (groupId, updates) => {
  try {
    if (!groupId?.trim()) {
      throw new Error('Group ID is required');
    }
    
    const { displayName } = updates;
    
    if (!displayName?.trim()) {
      throw new Error('Display name is required for update');
    }
    
    const formData = new FormData();
    formData.append('key', 'displayname');
    formData.append('value', displayName.trim());
    
    const response = await adminApiClient.put(endpoints.groups.update(groupId), formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    
    if (response.data?.ocs?.meta?.statuscode === 200) {
      return {
        success: true,
        group: {
          id: groupId,
          displayName: displayName.trim()
        }
      };
    }
    
    // Handle specific error codes
    const statusCode = response.data?.ocs?.meta?.statuscode;
    if (statusCode === 101) {
      throw new Error('Update not supported by the backend');
    }
    
    throw new Error('Failed to update group');
    
  } catch (error) {
    console.error(`❌ Failed to update group ${groupId}:`, error.message);
    
    if (error.response?.status === 404) {
      throw new Error(`Group '${groupId}' not found`);
    }
    
    throw new Error(error.response?.data?.ocs?.meta?.message || error.message || 'Failed to update group');
  }
};

/**
 * Delete a group
 * @param {string} groupId - Group identifier
 * @returns {Object} Deletion result
 */
const deleteGroup = async (groupId) => {
  try {
    if (!groupId?.trim()) {
      throw new Error('Group ID is required');
    }
    
    const response = await adminApiClient.delete(withJsonFormat(endpoints.groups.delete(groupId)));
    
    if (response.data?.ocs?.meta?.statuscode === 200) {
      return {
        success: true,
        message: `Group '${groupId}' has been deleted successfully`
      };
    }
    
    // Handle specific error codes
    const statusCode = response.data?.ocs?.meta?.statuscode;
    if (statusCode === 101) {
      throw new Error(`Group '${groupId}' does not exist`);
    } else if (statusCode === 102) {
      throw new Error(`Failed to delete group '${groupId}'`);
    }
    
    throw new Error('Failed to delete group');
    
  } catch (error) {
    console.error(`❌ Failed to delete group ${groupId}:`, error.message);
    
    if (error.response?.status === 404) {
      throw new Error(`Group '${groupId}' not found`);
    }
    
    throw new Error(error.response?.data?.ocs?.meta?.message || error.message || 'Failed to delete group');
  }
};

/**
 * Get subadmins of a group
 * @param {string} groupId - Group identifier
 * @returns {Object} Subadmins list
 */
const getGroupSubadmins = async (groupId) => {
  try {
    if (!groupId?.trim()) {
      throw new Error('Group ID is required');
    }
    
    const response = await adminApiClient.get(withJsonFormat(endpoints.groups.subadmins(groupId)));
    
    if (response.data?.ocs?.meta?.statuscode === 200) {
      const subadmins = response.data.ocs.data || [];
      
      return {
        success: true,
        subadmins: subadmins.map(userId => ({
          id: userId,
          displayName: userId,
          type: 'subadmin'
        })),
        count: subadmins.length
      };
    }
    
    // Handle specific error codes
    const statusCode = response.data?.ocs?.meta?.statuscode;
    if (statusCode === 101) {
      throw new Error(`Group '${groupId}' does not exist`);
    }
    
    throw new Error('Failed to fetch group subadmins');
    
  } catch (error) {
    console.error(`❌ Failed to get subadmins for group ${groupId}:`, error.message);
    
    if (error.response?.status === 404) {
      throw new Error(`Group '${groupId}' not found`);
    }
    
    throw new Error(error.response?.data?.ocs?.meta?.message || error.message || 'Failed to get group subadmins');
  }
};

/**
 * Search groups by name or display name
 * @param {string} searchTerm - Search query
 * @param {Object} options - Additional options
 * @param {number} [options.limit] - Maximum results
 * @returns {Object} Search results
 */
const searchGroups = async (searchTerm, options = {}) => {
  try {
    if (!searchTerm?.trim()) {
      // If no search term, return all groups
      return getGroups(options);
    }
    
    return getGroups({
      search: searchTerm.trim(),
      ...options
    });
    
  } catch (error) {
    console.error(`❌ Failed to search groups with term "${searchTerm}":`, error.message);
    throw new Error(error.message || 'Failed to search groups');
  }
};

/**
 * Promote user to subadmin of a group
 * @param {string} userId - User ID
 * @param {string} groupId - Group ID
 * @returns {Object} Operation result
 */
const promoteUserToSubadmin = async (userId, groupId) => {
  try {
    if (!userId?.trim() || !groupId?.trim()) {
      throw new Error('User ID and Group ID are required');
    }
    
    const formData = new FormData();
    formData.append('groupid', groupId.trim());
    
    const response = await adminApiClient.post(`/ocs/v1.php/cloud/users/${userId}/subadmins`, formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'OCS-APIRequest': 'true'
      },
    });
    
    if (response.data?.ocs?.meta?.statuscode === 100) {
      return {
        success: true,
        message: `User ${userId} promoted to subadmin of group ${groupId} successfully`
      };
    }
    
    // Handle specific error codes
    const statusCode = response.data?.ocs?.meta?.statuscode;
    if (statusCode === 101) {
      throw new Error(`User '${userId}' does not exist`);
    } else if (statusCode === 102) {
      throw new Error(`Group '${groupId}' does not exist`);
    } else if (statusCode === 103) {
      throw new Error('Unknown failure occurred');
    }
    
    throw new Error('Failed to promote user to subadmin');
    
  } catch (error) {
    console.error(`❌ Failed to promote user ${userId} to subadmin of group ${groupId}:`, error.message);
    throw new Error(error.response?.data?.ocs?.meta?.message || error.message || 'Failed to promote user to subadmin');
  }
};

/**
 * Demote user from subadmin of a group
 * @param {string} userId - User ID
 * @param {string} groupId - Group ID
 * @returns {Object} Operation result
 */
const demoteUserFromSubadmin = async (userId, groupId) => {
  try {
    if (!userId?.trim() || !groupId?.trim()) {
      throw new Error('User ID and Group ID are required');
    }
    
    const formData = new FormData();
    formData.append('groupid', groupId.trim());
    
    const response = await adminApiClient.delete(`/ocs/v1.php/cloud/users/${userId}/subadmins`, {
      data: formData,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'OCS-APIRequest': 'true'
      },
    });
    
    if (response.data?.ocs?.meta?.statuscode === 100) {
      return {
        success: true,
        message: `User ${userId} demoted from subadmin of group ${groupId} successfully`
      };
    }
    
    // Handle specific error codes
    const statusCode = response.data?.ocs?.meta?.statuscode;
    if (statusCode === 101) {
      throw new Error(`User '${userId}' does not exist`);
    } else if (statusCode === 102) {
      throw new Error(`User is not a subadmin of the group or group does not exist`);
    } else if (statusCode === 103) {
      throw new Error('Unknown failure occurred');
    }
    
    throw new Error('Failed to demote user from subadmin');
    
  } catch (error) {
    console.error(`❌ Failed to demote user ${userId} from subadmin of group ${groupId}:`, error.message);
    throw new Error(error.response?.data?.ocs?.meta?.message || error.message || 'Failed to demote user from subadmin');
  }
};

/**
 * Get subadmins for a user
 * @param {string} userId - User ID
 * @returns {Object} User subadmin groups
 */
const getUserSubadminGroups = async (userId) => {
  try {
    if (!userId?.trim()) {
      throw new Error('User ID is required');
    }
    
    const response = await adminApiClient.get(withJsonFormat(`/ocs/v1.php/cloud/users/${userId}/subadmins`));
    
    if (response.data?.ocs?.meta?.statuscode === 100) {
      const subadminGroups = response.data.ocs.data || [];
      
      return {
        success: true,
        groups: subadminGroups.map(groupId => ({
          id: groupId,
          displayName: groupId,
          type: 'subadmin'
        })),
        count: subadminGroups.length
      };
    }
    
    // Handle specific error codes
    const statusCode = response.data?.ocs?.meta?.statuscode;
    if (statusCode === 101) {
      throw new Error(`User '${userId}' does not exist`);
    } else if (statusCode === 102) {
      throw new Error('Unknown failure occurred');
    }
    
    throw new Error('Failed to fetch user subadmin groups');
    
  } catch (error) {
    console.error(`❌ Failed to get subadmin groups for user ${userId}:`, error.message);
    throw new Error(error.response?.data?.ocs?.meta?.message || error.message || 'Failed to get user subadmin groups');
  }
};

// ===== EXPORTS =====

/**
 * Groups Management API object with all functions
 * Modern functional approach - all functions are pure and composable
 */
export const groupsAPI = {
  // Group list and search
  getGroups,
  getGroupDetails,
  getGroupMemberCounts,
  searchGroups,
  
  // Group management
  createGroup,
  updateGroup,
  deleteGroup,
  
  // Group subadmins
  getGroupSubadmins,
  promoteUserToSubadmin,
  demoteUserFromSubadmin,
  getUserSubadminGroups,
  
  // Pure utility functions (exposed for testing and flexibility)
  formatGroupsList,
  formatGroupDetails,
};

// Default export for convenience
export default groupsAPI;
