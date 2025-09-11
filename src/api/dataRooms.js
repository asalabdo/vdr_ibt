import { adminApiClient } from './client';
import { endpoints, withJsonFormat } from './endpoints';

/**
 * Data Rooms (Group Folders) Management API functions for Nextcloud
 * Modern functional approach with comprehensive data room management capabilities
 */

// ===== PURE UTILITY FUNCTIONS =====

/**
 * Transform raw Nextcloud group folders data into application format
 * @param {Object} foldersObject - Raw folders object from Nextcloud (with numeric keys)
 * @returns {Array} Formatted data rooms array
 */
const formatDataRoomsList = (foldersObject) => {
  if (!foldersObject || typeof foldersObject !== 'object') return [];
  
  // Convert object with numeric keys to array
  return Object.values(foldersObject).map(folder => {
    // Handle groups - can be object or empty array
    const groups = folder.groups && typeof folder.groups === 'object' && !Array.isArray(folder.groups) 
      ? folder.groups 
      : {};
    
    // Handle group_details - can be object or empty array  
    const groupDetails = folder.group_details && typeof folder.group_details === 'object' && !Array.isArray(folder.group_details)
      ? folder.group_details
      : {};
    
    // Handle managers - array of objects
    const managers = Array.isArray(folder.manage) ? folder.manage : [];
    
    return {
      id: folder.id,
      roomId: folder.id.toString(),
      roomName: folder.mount_point,
      mountPoint: folder.mount_point,
      assignedGroups: groups,
      storageQuota: folder.quota || -1,
      currentSize: folder.size || 0,
      aclEnabled: folder.acl || false,
      managers: managers,
      groupPermissions: groupDetails,
      // Additional computed fields
      hasGroups: Object.keys(groups).length > 0,
      hasManagers: managers.length > 0,
      isActive: Object.keys(groups).length > 0, // Active = has groups assigned
      isUnlimitedQuota: folder.quota === -3,
      formattedSize: formatBytes(folder.size || 0),
      formattedQuota: folder.quota === -3 ? 'Unlimited' : formatBytes(folder.quota || 0),
      // Group-related computed fields
      groupsList: Object.keys(groups),
      groupsCount: Object.keys(groups).length,
      managersCount: managers.length,
      // Permissions summary
      totalPermissions: Object.values(groups).reduce((sum, perm) => sum + (perm || 0), 0),
    };
  });
};

/**
 * Transform detailed data room data from Nextcloud API
 * @param {Object} folderData - Raw folder data from Nextcloud
 * @param {string} folderId - Folder ID
 * @returns {Object} Formatted data room data
 */
const formatDataRoomDetails = (folderData, folderId) => {
  // Handle groups - can be object or empty array
  const groups = folderData.groups && typeof folderData.groups === 'object' && !Array.isArray(folderData.groups) 
    ? folderData.groups 
    : {};
  
  // Handle group_details - can be object or empty array  
  const groupDetails = folderData.group_details && typeof folderData.group_details === 'object' && !Array.isArray(folderData.group_details)
    ? folderData.group_details
    : {};
  
  // Handle managers - array of objects
  const managers = Array.isArray(folderData.manage) ? folderData.manage : [];
  
  return {
    id: folderData.id || folderId,
    roomId: (folderData.id || folderId).toString(),
    roomName: folderData.mount_point || '',
    mountPoint: folderData.mount_point || '',
    assignedGroups: groups,
    storageQuota: folderData.quota || -1,
    currentSize: folderData.size || 0,
    aclEnabled: folderData.acl || false,
    managers: managers,
    groupPermissions: groupDetails,
    
    // Additional computed fields
    hasGroups: Object.keys(groups).length > 0,
    hasManagers: managers.length > 0,
    isActive: Object.keys(groups).length > 0, // Active = has groups assigned
    isUnlimitedQuota: folderData.quota === -3,
    formattedSize: formatBytes(folderData.size || 0),
    formattedQuota: folderData.quota === -3 ? 'Unlimited' : formatBytes(folderData.quota || 0),
    
    // Group details
    groupsList: Object.keys(groups),
    groupsCount: Object.keys(groups).length,
    managersCount: managers.length,
    
    // Permissions summary
    totalPermissions: Object.values(groups).reduce((sum, perm) => sum + (perm || 0), 0),
  };
};

/**
 * Format bytes to human readable string
 * @param {number} bytes - Bytes to format
 * @returns {string} Formatted string
 */
const formatBytes = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  if (bytes === -1) return 'No Limit';
  if (bytes === -3) return 'Unlimited';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// ===== API FUNCTIONS =====

/**
 * Get list of all data rooms (group folders)
 * @param {Object} options - Query options
 * @param {string} [options.search] - Search term to filter rooms
 * @returns {Object} Data rooms list and metadata
 */
const getDataRooms = async (options = {}) => {
  try {
    const { search } = options;
    
    const url = withJsonFormat(endpoints.groupFolders.list);
    const response = await adminApiClient.get(url);
    
    if (response.data?.ocs?.meta?.statuscode === 100) {
      const foldersData = response.data.ocs.data || {};
      let formattedRooms = formatDataRoomsList(foldersData);
      
      // Apply search filter if provided
      if (search) {
        const searchLower = search.toLowerCase();
        formattedRooms = formattedRooms.filter(room => 
          room.roomName.toLowerCase().includes(searchLower) ||
          room.mountPoint.toLowerCase().includes(searchLower)
        );
      }
      
      return {
        success: true,
        dataRooms: formattedRooms,
        total: formattedRooms.length,
        hasMore: false, // Group Folders API doesn't provide pagination
      };
    }
    
    throw new Error('Failed to fetch data rooms');
    
  } catch (error) {
    console.error('❌ Failed to get data rooms:', error.message);
    throw new Error(error.response?.data?.ocs?.meta?.message || error.message || 'Failed to get data rooms');
  }
};

/**
 * Get detailed information for a specific data room
 * @param {string} roomId - Room ID to fetch details for
 * @returns {Object} Detailed data room information
 */
const getDataRoomDetails = async (roomId) => {
  try {
    const response = await adminApiClient.get(withJsonFormat(endpoints.groupFolders.details(roomId)));
    
    if (response.data?.ocs?.meta?.statuscode === 100) {
      const folderData = response.data.ocs.data;
      
      return {
        success: true,
        dataRoom: formatDataRoomDetails(folderData, roomId),
      };
    }
    
    throw new Error('Failed to fetch data room details');
    
  } catch (error) {
    console.error(`❌ Failed to get data room details for ${roomId}:`, error.message);
    throw new Error(error.response?.data?.ocs?.meta?.message || error.message || 'Failed to get data room details');
  }
};

/**
 * Create a new data room (group folder)
 * @param {Object} roomData - Room data for creation
 * @param {string} roomData.mountpoint - Mount point name (required)
 * @param {Array} [roomData.groups] - Groups to add to room
 * @returns {Object} Creation result
 */
const createDataRoom = async (roomData) => {
  try {
    const { mountpoint, groups = [] } = roomData;
    
    if (!mountpoint) {
      throw new Error('Mount point name is required');
    }
    
    // Create room with only mountpoint (quota setting not supported in creation API)
    const formData = new URLSearchParams();
    formData.append('mountpoint', mountpoint);
    
    const response = await adminApiClient.post(endpoints.groupFolders.create, formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    
    if (response.data?.ocs?.meta?.statuscode === 100) {
      const createdRoomId = response.data.ocs.data.id;
      
      // Add groups if specified (handle failures gracefully)
      const groupResults = [];
      const failedGroups = [];
      
      if (groups.length > 0) {
        for (const groupInfo of groups) {
          try {
            const { groupId, permissions = 31 } = groupInfo; // Default to full permissions
            await addGroupToDataRoom(createdRoomId, groupId, permissions);
            groupResults.push(groupId);
          } catch (error) {
            console.warn(`⚠️ Failed to add group ${groupInfo.groupId} to room ${createdRoomId}:`, error.message);
            failedGroups.push(groupInfo.groupId);
          }
        }
      }
      
      // Get the created room details
      const roomDetails = await getDataRoomDetails(createdRoomId);
      
      return {
        success: true,
        dataRoom: roomDetails.dataRoom,
        message: 'Data room created successfully',
        warnings: failedGroups.length > 0 ? [`Failed to assign groups: ${failedGroups.join(', ')}`] : []
      };
    }
    
    throw new Error('Failed to create data room');
    
  } catch (error) {
    console.error('❌ Failed to create data room:', error.message);
    throw new Error(error.response?.data?.ocs?.meta?.message || error.message || 'Failed to create data room');
  }
};

/**
 * Delete data room
 * @param {string} roomId - Room ID
 * @returns {Object} Operation result
 */
const deleteDataRoom = async (roomId) => {
  try {
    const response = await adminApiClient.delete(endpoints.groupFolders.delete(roomId));
    
    if (response.data?.ocs?.meta?.statuscode === 100) {
      return {
        success: true,
        message: 'Data room deleted successfully'
      };
    }
    
    throw new Error('Failed to delete data room');
    
  } catch (error) {
    console.error(`❌ Failed to delete data room ${roomId}:`, error.message);
    throw new Error(error.response?.data?.ocs?.meta?.message || error.message || 'Failed to delete data room');
  }
};

/**
 * Add group to data room
 * @param {string} roomId - Room ID
 * @param {string} groupId - Group ID
 * @param {number} [permissions=31] - Permission level (default: full permissions)
 * @returns {Object} Operation result
 */
const addGroupToDataRoom = async (roomId, groupId, permissions = 31) => {
  try {
    const formData = new URLSearchParams();
    formData.append('group', groupId);
    
    const response = await adminApiClient.post(endpoints.groupFolders.addGroup(roomId), formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    
    if (response.data?.ocs?.meta?.statuscode === 100) {
      // Set permissions for the group
      await setGroupPermissions(roomId, groupId, permissions);
      
      return {
        success: true,
        message: `Group ${groupId} added to data room successfully`
      };
    }
    
    throw new Error('Failed to add group to data room');
    
  } catch (error) {
    console.error(`❌ Failed to add group ${groupId} to data room ${roomId}:`, error.message);
    throw new Error(error.response?.data?.ocs?.meta?.message || error.message || 'Failed to add group to data room');
  }
};

/**
 * Set group permissions for data room
 * @param {string} roomId - Room ID
 * @param {string} groupId - Group ID
 * @param {number} permissions - Permission level (1=read, 31=full, etc.)
 * @returns {Object} Operation result
 */
const setGroupPermissions = async (roomId, groupId, permissions) => {
  try {
    const formData = new URLSearchParams();
    formData.append('permissions', permissions.toString());
    
    const response = await adminApiClient.post(endpoints.groupFolders.setPermissions(roomId, groupId), formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    
    if (response.data?.ocs?.meta?.statuscode === 100) {
      return {
        success: true,
        message: `Permissions updated for group ${groupId} in data room ${roomId}`
      };
    }
    
    throw new Error('Failed to set group permissions');
    
  } catch (error) {
    console.error(`❌ Failed to set permissions for group ${groupId} in room ${roomId}:`, error.message);
    throw new Error(error.response?.data?.ocs?.meta?.message || error.message || 'Failed to set group permissions');
  }
};

/**
 * Remove group from data room
 * @param {string} roomId - Room ID
 * @param {string} groupId - Group ID
 * @returns {Object} Operation result
 */
const removeGroupFromDataRoom = async (roomId, groupId) => {
  try {
    const response = await adminApiClient.delete(endpoints.groupFolders.setPermissions(roomId, groupId));
    
    if (response.data?.ocs?.meta?.statuscode === 100) {
      return {
        success: true,
        message: `Group ${groupId} removed from data room successfully`
      };
    }
    
    throw new Error('Failed to remove group from data room');
    
  } catch (error) {
    console.error(`❌ Failed to remove group ${groupId} from data room ${roomId}:`, error.message);
    throw new Error(error.response?.data?.ocs?.meta?.message || error.message || 'Failed to remove group from data room');
  }
};

/**
 * Update data room settings
 * @param {string} roomId - Room ID
 * @param {Object} updates - Update data
 * @param {number} [updates.quota] - Storage quota in bytes (-3 for unlimited)
 * @param {boolean} [updates.acl] - Enable/disable ACL
 * @returns {Object} Operation result
 */
const updateDataRoom = async (roomId, updates) => {
  try {
    const { quota, acl } = updates;
    const updatePromises = [];
    
    // Update quota if specified
    if (quota !== undefined) {
      const quotaFormData = new URLSearchParams();
      quotaFormData.append('quota', quota.toString());
      
      updatePromises.push(
        adminApiClient.post(`${endpoints.groupFolders.details(roomId)}/quota`, quotaFormData, {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        })
      );
    }
    
    // Update ACL if specified
    if (acl !== undefined) {
      const aclFormData = new URLSearchParams();
      aclFormData.append('acl', acl ? '1' : '0');
      
      updatePromises.push(
        adminApiClient.post(`${endpoints.groupFolders.details(roomId)}/acl`, aclFormData, {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        })
      );
    }
    
    // Execute all updates
    const results = await Promise.allSettled(updatePromises);
    const failures = results.filter(r => r.status === 'rejected');
    
    if (failures.length === 0) {
      // Get updated room details
      const roomDetails = await getDataRoomDetails(roomId);
      
      return {
        success: true,
        dataRoom: roomDetails.dataRoom,
        message: 'Data room updated successfully'
      };
    } else {
      const errorMessages = failures.map(f => f.reason?.message || 'Unknown error');
      throw new Error(`Some updates failed: ${errorMessages.join(', ')}`);
    }
    
  } catch (error) {
    console.error(`❌ Failed to update data room ${roomId}:`, error.message);
    throw new Error(error.response?.data?.ocs?.meta?.message || error.message || 'Failed to update data room');
  }
};

/**
 * Get available groups for data room assignment
 * @param {Object} options - Query options
 * @param {string} [options.search] - Search term
 * @returns {Object} Available groups list
 */
const getAvailableGroups = async (options = {}) => {
  try {
    const { search } = options;
    
    let url = withJsonFormat(endpoints.groups.list);
    if (search) {
      url += `&search=${encodeURIComponent(search)}`;
    }
    
    const response = await adminApiClient.get(url);
    
    if (response.data?.ocs?.meta?.statuscode === 200) {
      const groups = response.data.ocs.data?.groups || [];
      
      return {
        success: true,
        groups: groups.map(groupId => ({
          id: groupId,
          displayName: groupId, // Group Folders API doesn't provide display names
          memberCount: 0 // Would need separate API call to get member count
        })),
        total: groups.length
      };
    }
    
    throw new Error('Failed to fetch available groups');
    
  } catch (error) {
    console.error('❌ Failed to get available groups:', error.message);
    throw new Error(error.response?.data?.ocs?.meta?.message || error.message || 'Failed to get available groups');
  }
};

// ===== EXPORTS =====

/**
 * Data Rooms Management API object with all functions
 * Modern functional approach - all functions are pure and composable
 */
export const dataRoomsAPI = {
  // Data room list and details
  getDataRooms,
  getDataRoomDetails,
  
  // Data room management
  createDataRoom,
  updateDataRoom,
  deleteDataRoom,
  
  // Group management
  addGroupToDataRoom,
  setGroupPermissions,
  removeGroupFromDataRoom,
  getAvailableGroups,
  
  // Pure utility functions (exposed for testing and flexibility)
  formatDataRoomsList,
  formatDataRoomDetails,
  formatBytes,
};
