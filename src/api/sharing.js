import apiClient from './client';
import { shareTypes, permissions, withJsonFormat } from './endpoints';

/**
 * Sharing API functions for Nextcloud
 * Modern functional approach with comprehensive sharing capabilities
 * Based on OCS Share API v1 documentation
 */

// ===== CONSTANTS =====

/** Share expiration defaults (in days) */
const EXPIRATION_DEFAULTS = {
  PUBLIC_LINK: 30,   // 30 days for public links
  EMAIL: 7,          // 7 days for email shares
  FEDERATED: 90,     // 90 days for federated shares
};

// ===== PURE UTILITY FUNCTIONS =====

/**
 * Format raw share data from Nextcloud API into application format
 * @param {Object} shareData - Raw share data from API
 * @returns {Object} Formatted share data
 */
const formatShareData = (shareData) => {
  return {
    id: shareData.id,
    shareType: shareData.share_type,
    shareTypeName: getShareTypeName(shareData.share_type),
    shareWith: shareData.share_with,
    shareWithDisplayname: shareData.share_with_displayname,
    permissions: shareData.permissions,
    permissionsList: parsePermissions(shareData.permissions),
    state: shareData.state,
    path: shareData.path,
    itemType: shareData.item_type,
    mimeType: shareData.mimetype,
    storageId: shareData.storage_id,
    storage: shareData.storage,
    itemSource: shareData.item_source,
    fileSource: shareData.file_source,
    fileTarget: shareData.file_target,
    fileParent: shareData.file_parent,
    token: shareData.token,
    expiration: shareData.expiration ? new Date(shareData.expiration) : null,
    dateFormatted: shareData.expiration 
      ? new Date(shareData.expiration).toLocaleDateString()
      : null,
    url: shareData.url,
    mailSend: shareData.mail_send === '1' || shareData.mail_send === 1,
    hideDownload: shareData.hide_download === '1' || shareData.hide_download === 1,
    password: shareData.password ? '••••••••' : null, // Don't expose actual password
    passwordProtected: !!shareData.password,
    sendPasswordByTalk: shareData.send_password_by_talk === '1',
    note: shareData.note,
    label: shareData.label,
    attributes: shareData.attributes ? JSON.parse(shareData.attributes) : null,
    stime: shareData.stime,
    uid_owner: shareData.uid_owner,
    uid_file_owner: shareData.uid_file_owner,
    displayname_owner: shareData.displayname_owner,
    displayname_file_owner: shareData.displayname_file_owner,
    additional_info_owner: shareData.additional_info_owner,
    additional_info_file_owner: shareData.additional_info_file_owner,
    can_edit: shareData.can_edit === '1' || shareData.can_edit === 1,
    can_delete: shareData.can_delete === '1' || shareData.can_delete === 1,
    // Computed fields
    isPublicLink: shareData.share_type === shareTypes.PUBLIC_LINK,
    isEmailShare: shareData.share_type === shareTypes.EMAIL,
    isGroupShare: shareData.share_type === shareTypes.GROUP,
    isUserShare: shareData.share_type === shareTypes.USER,
    isFederatedShare: shareData.share_type === shareTypes.FEDERATED,
    isExpired: shareData.expiration && new Date(shareData.expiration) < new Date(),
  };
};

/**
 * Get human-readable share type name
 * @param {number} shareType - Share type number
 * @returns {string} Human-readable name
 */
const getShareTypeName = (shareType) => {
  const typeMap = {
    [shareTypes.USER]: 'User',
    [shareTypes.GROUP]: 'Group', 
    [shareTypes.PUBLIC_LINK]: 'Public Link',
    [shareTypes.EMAIL]: 'Email',
    [shareTypes.FEDERATED]: 'Federated',
  };
  
  return typeMap[shareType] || 'Unknown';
};

/**
 * Parse permission bits into readable permissions list
 * @param {number} permissionBits - Permission bits
 * @returns {Array} Array of permission strings
 */
const parsePermissions = (permissionBits) => {
  const perms = [];
  
  if (permissionBits & permissions.READ) perms.push('read');
  if (permissionBits & permissions.UPDATE) perms.push('update');
  if (permissionBits & permissions.CREATE) perms.push('create');
  if (permissionBits & permissions.DELETE) perms.push('delete');
  if (permissionBits & permissions.SHARE) perms.push('share');
  
  return perms;
};

/**
 * Build permission bits from permission names
 * @param {Array} permissionNames - Array of permission names
 * @returns {number} Permission bits
 */
const buildPermissionBits = (permissionNames = []) => {
  let bits = 0;
  
  if (permissionNames.includes('read')) bits |= permissions.READ;
  if (permissionNames.includes('update')) bits |= permissions.UPDATE;
  if (permissionNames.includes('create')) bits |= permissions.CREATE;
  if (permissionNames.includes('delete')) bits |= permissions.DELETE;
  if (permissionNames.includes('share')) bits |= permissions.SHARE;
  
  return bits || permissions.READ; // Default to read if no permissions specified
};

/**
 * Format expiration date for API
 * @param {Date|string|number} date - Date to format
 * @returns {string} Formatted date string (YYYY-MM-DD)
 */
const formatExpirationDate = (date) => {
  if (!date) return null;
  
  let dateObj;
  if (date instanceof Date) {
    dateObj = date;
  } else if (typeof date === 'number') {
    dateObj = new Date(Date.now() + (date * 24 * 60 * 60 * 1000)); // days from now
  } else {
    dateObj = new Date(date);
  }
  
  return dateObj.toISOString().split('T')[0]; // YYYY-MM-DD format
};

// ===== API FUNCTIONS =====

/**
 * Extract relative path from full WebDAV path for OCS APIs
 * @param {string} path - Path (can be full WebDAV path or relative)
 * @returns {string} Relative path for OCS APIs
 */
const extractOCSPath = (path) => {
  if (!path) return '';
  
  // If it's a full WebDAV path, extract the relative part
  if (path.includes('/remote.php/dav/files/')) {
    const webdavPrefixRegex = /^\/remote\.php\/dav\/files\/[^/]+/;
    return path.replace(webdavPrefixRegex, '') || '/';
  }
  
  // Already a relative path
  return path;
};

/**
 * Get all shares for the current user
 * @param {Object} options - Query options
 * @param {string} [options.path] - Filter by path (can be full WebDAV or relative)
 * @param {boolean} [options.reshares=false] - Include reshares
 * @param {boolean} [options.subfiles=false] - Include subfiles
 * @returns {Object} Shares list
 */
const getShares = async (options = {}) => {
  try {
    const { path, reshares = false, subfiles = false } = options;
    
    const params = new URLSearchParams();
    params.append('format', 'json');
    
    if (path) {
      // Convert to OCS-compatible relative path
      const ocsPath = extractOCSPath(path);
      params.append('path', ocsPath);
    }
    if (reshares) params.append('reshares', 'true');
    if (subfiles) params.append('subfiles', 'true');
    
    const url = `/ocs/v2.php/apps/files_sharing/api/v1/shares?${params.toString()}`;
    const response = await apiClient.get(url, {
      headers: { 'OCS-APIRequest': 'true' }
    });
    
    // Log the response structure for development debugging
    console.log('🔍 Shares API response - Status:', response.data?.ocs?.meta?.statuscode, 'Data count:', response.data?.ocs?.data?.length || 0);
    
    // Accept both traditional OCS success (100) and HTTP success (200)
    const ocsStatusCode = response.data?.ocs?.meta?.statuscode;
    if (ocsStatusCode === 100 || ocsStatusCode === 200) {
      const sharesData = response.data.ocs.data || [];
      
      console.log('✅ Successfully parsed shares:', sharesData.length, 'shares found');
      
      return {
        success: true,
        shares: sharesData.map(formatShareData),
        total: sharesData.length,
      };
    }
    
    // Handle case where we get a successful HTTP response but different OCS status
    if (response.data?.ocs) {
      const statusCode = response.data.ocs.meta?.statuscode;
      const message = response.data.ocs.meta?.message || 'Unknown OCS error';
      throw new Error(`OCS API returned unexpected status ${statusCode}: ${message}`);
    }
    
    throw new Error('Failed to fetch shares - invalid response structure');
    
  } catch (error) {
    console.error('❌ Failed to get shares:', error.message);
    throw new Error(error.response?.data?.ocs?.meta?.message || error.message || 'Failed to get shares');
  }
};

/**
 * Create a new share
 * @param {Object} shareData - Share data
 * @param {string} shareData.path - Path to file/folder to share (required)
 * @param {number} shareData.shareType - Share type (required)
 * @param {string} [shareData.shareWith] - User/group to share with (required for user/group shares)
 * @param {Array} [shareData.permissions] - Permission names array
 * @param {string} [shareData.password] - Password for public link
 * @param {Date|string|number} [shareData.expireDate] - Expiration date
 * @param {string} [shareData.note] - Note for the recipient
 * @param {string} [shareData.label] - Label for the share
 * @param {boolean} [shareData.publicUpload] - Allow public upload (for folders)
 * @param {boolean} [shareData.sendMail] - Send notification email
 * @returns {Object} Created share data
 */
const createShare = async (shareData) => {
  try {
    const {
      path,
      shareType,
      shareWith,
      permissions: permissionNames = ['read'],
      password,
      expireDate,
      note,
      label,
      publicUpload = false,
      sendMail = false
    } = shareData;
    
    if (!path?.trim()) {
      throw new Error('Path is required');
    }
    
    if (shareType === undefined || shareType === null) {
      throw new Error('Share type is required');
    }
    
    if ((shareType === shareTypes.USER || shareType === shareTypes.GROUP) && !shareWith?.trim()) {
      throw new Error('shareWith is required for user and group shares');
    }
    
    const formData = new URLSearchParams();
    formData.append('path', extractOCSPath(path.trim()));
    formData.append('shareType', shareType.toString());
    
    if (shareWith?.trim()) {
      formData.append('shareWith', shareWith.trim());
    }
    
    // Set permissions
    const permissionBits = buildPermissionBits(permissionNames);
    formData.append('permissions', permissionBits.toString());
    
    // Optional parameters
    if (password?.trim()) {
      formData.append('password', password);
    }
    
    if (expireDate) {
      const formattedDate = formatExpirationDate(expireDate);
      if (formattedDate) {
        formData.append('expireDate', formattedDate);
      }
    }
    
    if (note?.trim()) {
      formData.append('note', note.trim());
    }
    
    if (label?.trim()) {
      formData.append('label', label.trim());
    }
    
    if (publicUpload && shareType === shareTypes.PUBLIC_LINK) {
      formData.append('publicUpload', 'true');
    }
    
    if (sendMail) {
      formData.append('sendMail', 'true');
    }
    
    const response = await apiClient.post('/ocs/v2.php/apps/files_sharing/api/v1/shares', formData, {
      headers: { 
        'OCS-APIRequest': 'true',
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    
    if (response.data?.ocs?.meta?.statuscode === 100) {
      const shareData = response.data.ocs.data;
      
      return {
        success: true,
        share: formatShareData(shareData),
        message: 'Share created successfully'
      };
    }
    
    throw new Error('Failed to create share');
    
  } catch (error) {
    console.error('❌ Failed to create share:', error.message);
    throw new Error(error.response?.data?.ocs?.meta?.message || error.message || 'Failed to create share');
  }
};

/**
 * Get share details by ID
 * @param {string|number} shareId - Share ID
 * @returns {Object} Share details
 */
const getShareDetails = async (shareId) => {
  try {
    if (!shareId) {
      throw new Error('Share ID is required');
    }
    
    const response = await apiClient.get(withJsonFormat(`/ocs/v2.php/apps/files_sharing/api/v1/shares/${shareId}`), {
      headers: { 'OCS-APIRequest': 'true' }
    });
    
    if (response.data?.ocs?.meta?.statuscode === 100) {
      const shareData = response.data.ocs.data;
      
      return {
        success: true,
        share: formatShareData(shareData),
      };
    }
    
    throw new Error('Share not found');
    
  } catch (error) {
    console.error(`❌ Failed to get share details for ${shareId}:`, error.message);
    
    if (error.response?.status === 404) {
      throw new Error('Share not found');
    }
    
    throw new Error(error.response?.data?.ocs?.meta?.message || error.message || 'Failed to get share details');
  }
};

/**
 * Update share settings
 * @param {string|number} shareId - Share ID
 * @param {Object} updates - Updates to apply
 * @param {Array} [updates.permissions] - Permission names array
 * @param {string} [updates.password] - New password
 * @param {Date|string|number} [updates.expireDate] - New expiration date
 * @param {string} [updates.note] - New note
 * @param {string} [updates.label] - New label
 * @param {boolean} [updates.publicUpload] - Allow public upload
 * @param {boolean} [updates.hideDownload] - Hide download button
 * @returns {Object} Updated share data
 */
const updateShare = async (shareId, updates) => {
  try {
    if (!shareId) {
      throw new Error('Share ID is required');
    }
    
    const {
      permissions: permissionNames,
      password,
      expireDate,
      note,
      label,
      publicUpload,
      hideDownload
    } = updates;
    
    const formData = new URLSearchParams();
    
    if (permissionNames && Array.isArray(permissionNames)) {
      const permissionBits = buildPermissionBits(permissionNames);
      formData.append('permissions', permissionBits.toString());
    }
    
    if (password !== undefined) {
      if (password === null || password === '') {
        formData.append('password', ''); // Remove password
      } else {
        formData.append('password', password);
      }
    }
    
    if (expireDate !== undefined) {
      if (expireDate === null) {
        formData.append('expireDate', ''); // Remove expiration
      } else {
        const formattedDate = formatExpirationDate(expireDate);
        if (formattedDate) {
          formData.append('expireDate', formattedDate);
        }
      }
    }
    
    if (note !== undefined) {
      formData.append('note', note || '');
    }
    
    if (label !== undefined) {
      formData.append('label', label || '');
    }
    
    if (publicUpload !== undefined) {
      formData.append('publicUpload', publicUpload ? 'true' : 'false');
    }
    
    if (hideDownload !== undefined) {
      formData.append('hideDownload', hideDownload ? 'true' : 'false');
    }
    
    const response = await apiClient.put(`/ocs/v2.php/apps/files_sharing/api/v1/shares/${shareId}`, formData, {
      headers: { 
        'OCS-APIRequest': 'true',
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    
    if (response.data?.ocs?.meta?.statuscode === 100) {
      const shareData = response.data.ocs.data;
      
      return {
        success: true,
        share: formatShareData(shareData),
        message: 'Share updated successfully'
      };
    }
    
    throw new Error('Failed to update share');
    
  } catch (error) {
    console.error(`❌ Failed to update share ${shareId}:`, error.message);
    throw new Error(error.response?.data?.ocs?.meta?.message || error.message || 'Failed to update share');
  }
};

/**
 * Delete a share
 * @param {string|number} shareId - Share ID
 * @returns {Object} Deletion result
 */
const deleteShare = async (shareId) => {
  try {
    if (!shareId) {
      throw new Error('Share ID is required');
    }
    
    const response = await apiClient.delete(`/ocs/v2.php/apps/files_sharing/api/v1/shares/${shareId}`, {
      headers: { 'OCS-APIRequest': 'true' }
    });
    
    if (response.data?.ocs?.meta?.statuscode === 100) {
      return {
        success: true,
        message: 'Share deleted successfully'
      };
    }
    
    throw new Error('Failed to delete share');
    
  } catch (error) {
    console.error(`❌ Failed to delete share ${shareId}:`, error.message);
    
    if (error.response?.status === 404) {
      throw new Error('Share not found');
    }
    
    throw new Error(error.response?.data?.ocs?.meta?.message || error.message || 'Failed to delete share');
  }
};

/**
 * Create a public link share (helper function)
 * @param {Object} linkData - Public link data
 * @param {string} linkData.path - Path to share
 * @param {string} [linkData.password] - Optional password
 * @param {Date|string|number} [linkData.expireDate] - Optional expiration
 * @param {Array} [linkData.permissions] - Permissions (default: ['read'])
 * @param {boolean} [linkData.publicUpload] - Allow public upload for folders
 * @param {string} [linkData.label] - Link label
 * @returns {Object} Created public link share
 */
const createPublicLink = async (linkData) => {
  return createShare({
    ...linkData,
    shareType: shareTypes.PUBLIC_LINK,
    expireDate: linkData.expireDate || EXPIRATION_DEFAULTS.PUBLIC_LINK
  });
};

/**
 * Create an email share (helper function)
 * @param {Object} emailData - Email share data
 * @param {string} emailData.path - Path to share
 * @param {string} emailData.email - Email address
 * @param {string} [emailData.password] - Optional password
 * @param {Date|string|number} [emailData.expireDate] - Optional expiration
 * @param {Array} [emailData.permissions] - Permissions (default: ['read'])
 * @param {string} [emailData.note] - Note for recipient
 * @returns {Object} Created email share
 */
const createEmailShare = async (emailData) => {
  return createShare({
    ...emailData,
    shareType: shareTypes.EMAIL,
    shareWith: emailData.email,
    expireDate: emailData.expireDate || EXPIRATION_DEFAULTS.EMAIL,
    sendMail: true
  });
};

// ===== EXPORTS =====

/**
 * Sharing Management API object with all functions
 * Modern functional approach - all functions are pure and composable
 */
export const sharingAPI = {
  // Share operations
  getShares,
  createShare,
  getShareDetails,
  updateShare,
  deleteShare,
  
  // Helper functions
  createPublicLink,
  createEmailShare,
  
  // Pure utility functions (exposed for testing and flexibility)
  formatShareData,
  getShareTypeName,
  parsePermissions,
  buildPermissionBits,
  formatExpirationDate,
  extractOCSPath,
  
  // Constants
  EXPIRATION_DEFAULTS,
};

export default sharingAPI;
