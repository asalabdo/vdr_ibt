import apiClient from './client';

/**
 * Files and WebDAV API functions for Nextcloud
 * Modern functional approach with comprehensive file management capabilities
 */

// ===== CONSTANTS =====

/** Default chunk size for file uploads (in bytes) */
const DEFAULT_CHUNK_SIZE = 1024 * 1024; // 1MB

/** Supported WebDAV methods */
const WEBDAV_METHODS = {
  PROPFIND: 'PROPFIND',
  MKCOL: 'MKCOL',
  DELETE: 'DELETE',
  MOVE: 'MOVE',
  COPY: 'COPY'
};

// ===== PURE UTILITY FUNCTIONS =====

/**
 * Format file size to human readable string
 * @param {number} bytes - Bytes to format
 * @returns {string} Formatted string
 */
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Parse WebDAV XML response to extract file properties
 * @param {string} xmlString - XML response from WebDAV
 * @returns {Array} Array of file objects
 */
const parseWebDAVResponse = (xmlString) => {
  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, 'text/xml');
    const responses = xmlDoc.querySelectorAll('d\\:response, response');
    
    const files = [];
    
    responses.forEach(response => {
      const href = response.querySelector('d\\:href, href')?.textContent;
      const propstat = response.querySelector('d\\:propstat, propstat');
      
      if (href && propstat) {
        const props = propstat.querySelector('d\\:prop, prop');
        if (props) {
          const isCollection = props.querySelector('d\\:resourcetype d\\:collection, resourcetype collection');
          const size = props.querySelector('d\\:getcontentlength, getcontentlength')?.textContent;
          const lastModified = props.querySelector('d\\:getlastmodified, getlastmodified')?.textContent;
          const contentType = props.querySelector('d\\:getcontenttype, getcontenttype')?.textContent;
          const displayName = props.querySelector('d\\:displayname, displayname')?.textContent;
          
          // Extract file name from href
          const pathParts = decodeURIComponent(href).split('/').filter(Boolean);
          const name = pathParts[pathParts.length - 1] || displayName || 'Unknown';
          
          files.push({
            name: name,
            path: decodeURIComponent(href),
            isDirectory: !!isCollection,
            size: size ? parseInt(size, 10) : 0,
            formattedSize: size ? formatFileSize(parseInt(size, 10)) : '0 Bytes',
            lastModified: lastModified ? new Date(lastModified) : null,
            contentType: contentType || (isCollection ? 'httpd/unix-directory' : 'application/octet-stream'),
            displayName: displayName || name
          });
        }
      }
    });
    
    return files;
  } catch (error) {
    console.error('❌ Failed to parse WebDAV response:', error.message);
    return [];
  }
};

/**
 * Extract relative path from full WebDAV path
 * @param {string} fullWebDAVPath - Full WebDAV path like "/remote.php/dav/files/username/file.txt"
 * @returns {string} Relative path like "/file.txt" or "file.txt"
 */
const extractRelativePath = (fullWebDAVPath) => {
  // Remove WebDAV prefix: /remote.php/dav/files/username
  const webdavPrefixRegex = /^\/remote\.php\/dav\/files\/[^/]+/;
  return fullWebDAVPath.replace(webdavPrefixRegex, '') || '/';
};

/**
 * Build WebDAV URL for a user and path
 * @param {string} username - Username
 * @param {string} path - File/folder path (can be full WebDAV path or relative)
 * @returns {string} WebDAV URL
 */
const buildWebDAVUrl = (username, path = '') => {
  // If path is already a full WebDAV path, return it as-is
  if (path.includes('/remote.php/dav/files/')) {
    return path;
  }
  
  // Clean up path and build WebDAV URL
  const cleanPath = path.replace(/^\/+|\/+$/g, '');
  return `/remote.php/dav/files/${username}/${cleanPath}`;
};

// ===== API FUNCTIONS =====

/**
 * List files and folders in a directory
 * @param {string} username - Username
 * @param {string} [path=''] - Directory path
 * @param {Object} [options={}] - Additional options
 * @param {number} [options.depth=1] - WebDAV depth (0=folder only, 1=folder+contents)
 * @returns {Object} Directory listing
 */
const listFiles = async (username, path = '', options = {}) => {
  try {
    const { depth = 1 } = options;
    
    if (!username?.trim()) {
      throw new Error('Username is required');
    }
    
    const webdavUrl = buildWebDAVUrl(username, path);
    
    const response = await apiClient({
      method: WEBDAV_METHODS.PROPFIND,
      url: webdavUrl,
      headers: {
        'Depth': depth.toString(),
        'Content-Type': 'application/xml',
      },
    });
    
    const files = parseWebDAVResponse(response.data);
    
    // Filter out the current directory from results when depth > 0
    const filteredFiles = depth > 0 
      ? files.filter((file, index) => index > 0) // First entry is usually the current dir
      : files;
    
    return {
      success: true,
      files: filteredFiles,
      path: path,
      total: filteredFiles.length,
    };
    
  } catch (error) {
    console.error(`❌ Failed to list files in ${path}:`, error.message);
    throw new Error(error.response?.data?.message || error.message || 'Failed to list files');
  }
};

/**
 * Create a new folder
 * @param {string} username - Username
 * @param {string} folderPath - Path for new folder
 * @returns {Object} Creation result
 */
const createFolder = async (username, folderPath) => {
  try {
    if (!username?.trim() || !folderPath?.trim()) {
      throw new Error('Username and folder path are required');
    }
    
    const webdavUrl = buildWebDAVUrl(username, folderPath);
    
    await apiClient({
      method: WEBDAV_METHODS.MKCOL,
      url: webdavUrl,
    });
    
    return {
      success: true,
      message: `Folder "${folderPath}" created successfully`,
      path: folderPath,
    };
    
  } catch (error) {
    console.error(`❌ Failed to create folder ${folderPath}:`, error.message);
    
    if (error.response?.status === 405) {
      throw new Error('Folder already exists or parent directory does not exist');
    }
    
    throw new Error(error.response?.data?.message || error.message || 'Failed to create folder');
  }
};

/**
 * Delete a file or folder
 * @param {string} username - Username
 * @param {string} itemPath - Path of item to delete
 * @returns {Object} Deletion result
 */
const deleteItem = async (username, itemPath) => {
  try {
    if (!username?.trim() || !itemPath?.trim()) {
      throw new Error('Username and item path are required');
    }
    
    const webdavUrl = buildWebDAVUrl(username, itemPath);
    
    await apiClient({
      method: WEBDAV_METHODS.DELETE,
      url: webdavUrl,
    });
    
    return {
      success: true,
      message: `Item "${itemPath}" deleted successfully`,
      path: itemPath,
    };
    
  } catch (error) {
    console.error(`❌ Failed to delete item ${itemPath}:`, error.message);
    
    if (error.response?.status === 404) {
      throw new Error('File or folder not found');
    }
    
    throw new Error(error.response?.data?.message || error.message || 'Failed to delete item');
  }
};

/**
 * Move or rename a file/folder
 * @param {string} username - Username
 * @param {string} sourcePath - Current path
 * @param {string} destinationPath - New path
 * @param {Object} [options={}] - Move options
 * @param {boolean} [options.overwrite=false] - Whether to overwrite destination
 * @returns {Object} Move result
 */
const moveItem = async (username, sourcePath, destinationPath, options = {}) => {
  try {
    if (!username?.trim() || !sourcePath?.trim() || !destinationPath?.trim()) {
      throw new Error('Username, source path, and destination path are required');
    }
    
    const { overwrite = false } = options;
    
    const sourceUrl = buildWebDAVUrl(username, sourcePath);
    const destinationUrl = buildWebDAVUrl(username, destinationPath);
    
    // Get the full destination URL for the header
    const fullDestinationUrl = apiClient.defaults.baseURL + destinationUrl;
    
    await apiClient({
      method: WEBDAV_METHODS.MOVE,
      url: sourceUrl,
      headers: {
        'Destination': fullDestinationUrl,
        'Overwrite': overwrite ? 'T' : 'F',
      },
    });
    
    return {
      success: true,
      message: `Item moved from "${sourcePath}" to "${destinationPath}" successfully`,
      sourcePath: sourcePath,
      destinationPath: destinationPath,
    };
    
  } catch (error) {
    console.error(`❌ Failed to move item from ${sourcePath} to ${destinationPath}:`, error.message);
    
    if (error.response?.status === 404) {
      throw new Error('Source file or folder not found');
    } else if (error.response?.status === 412) {
      throw new Error('Destination already exists and overwrite is disabled');
    }
    
    throw new Error(error.response?.data?.message || error.message || 'Failed to move item');
  }
};

/**
 * Copy a file/folder
 * @param {string} username - Username
 * @param {string} sourcePath - Source path
 * @param {string} destinationPath - Destination path
 * @param {Object} [options={}] - Copy options
 * @param {boolean} [options.overwrite=false] - Whether to overwrite destination
 * @returns {Object} Copy result
 */
const copyItem = async (username, sourcePath, destinationPath, options = {}) => {
  try {
    if (!username?.trim() || !sourcePath?.trim() || !destinationPath?.trim()) {
      throw new Error('Username, source path, and destination path are required');
    }
    
    const { overwrite = false } = options;
    
    const sourceUrl = buildWebDAVUrl(username, sourcePath);
    const destinationUrl = buildWebDAVUrl(username, destinationPath);
    
    // Get the full destination URL for the header
    const fullDestinationUrl = apiClient.defaults.baseURL + destinationUrl;
    
    await apiClient({
      method: WEBDAV_METHODS.COPY,
      url: sourceUrl,
      headers: {
        'Destination': fullDestinationUrl,
        'Overwrite': overwrite ? 'T' : 'F',
      },
    });
    
    return {
      success: true,
      message: `Item copied from "${sourcePath}" to "${destinationPath}" successfully`,
      sourcePath: sourcePath,
      destinationPath: destinationPath,
    };
    
  } catch (error) {
    console.error(`❌ Failed to copy item from ${sourcePath} to ${destinationPath}:`, error.message);
    
    if (error.response?.status === 404) {
      throw new Error('Source file or folder not found');
    } else if (error.response?.status === 412) {
      throw new Error('Destination already exists and overwrite is disabled');
    }
    
    throw new Error(error.response?.data?.message || error.message || 'Failed to copy item');
  }
};

/**
 * Calculate appropriate timeout for file upload based on file size
 * @param {number} fileSize - File size in bytes
 * @returns {number} Timeout in milliseconds
 */
const calculateUploadTimeout = (fileSize) => {
  // Base timeout of 60 seconds
  const baseTimeout = 60000;
  
  // Add 30 seconds per 10MB
  const additionalTimeout = Math.ceil(fileSize / (10 * 1024 * 1024)) * 30000;
  
  // Maximum timeout of 10 minutes
  const maxTimeout = 600000;
  
  return Math.min(baseTimeout + additionalTimeout, maxTimeout);
};

/**
 * Upload file in chunks for better handling of large files
 * @param {string} username - Username
 * @param {string} filePath - Destination file path
 * @param {File|Blob} fileData - File data to upload
 * @param {Object} options - Upload options
 * @returns {Object} Upload result
 */
const uploadFileChunked = async (username, filePath, fileData, options = {}) => {
  const { onProgress } = options;
  const chunkSize = 5 * 1024 * 1024; // 5MB chunks
  const totalChunks = Math.ceil(fileData.size / chunkSize);
  let uploadedBytes = 0;

  try {
    for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
      const start = chunkIndex * chunkSize;
      const end = Math.min(start + chunkSize, fileData.size);
      const chunk = fileData.slice(start, end);
      
      const webdavUrl = buildWebDAVUrl(username, filePath);
      
      const config = {
        method: 'PUT',
        url: webdavUrl,
        data: chunk,
        headers: {
          'Content-Type': 'application/octet-stream',
          'Content-Range': `bytes ${start}-${end - 1}/${fileData.size}`,
          'X-Upload-Chunk': chunkIndex.toString(),
          'X-Upload-Total-Chunks': totalChunks.toString(),
        },
        timeout: 120000, // 2 minutes per chunk
      };

      // For multi-chunk uploads, use PATCH for intermediate chunks
      if (totalChunks > 1 && chunkIndex < totalChunks - 1) {
        config.method = 'PATCH';
      }

      await apiClient(config);
      
      uploadedBytes += chunk.size;
      
      // Report progress
      if (onProgress && typeof onProgress === 'function') {
        const percentCompleted = Math.round((uploadedBytes * 100) / fileData.size);
        onProgress(percentCompleted, uploadedBytes, fileData.size);
      }
    }

    return {
      success: true,
      message: `File "${filePath}" uploaded successfully`,
      path: filePath,
      method: 'chunked',
    };
    
  } catch (error) {
    console.error(`❌ Failed to upload file chunks for ${filePath}:`, error.message);
    throw error;
  }
};

/**
 * Upload a file with intelligent size-based strategy
 * @param {string} username - Username
 * @param {string} filePath - Destination file path
 * @param {File|Blob|ArrayBuffer} fileData - File data to upload
 * @param {Object} [options={}] - Upload options
 * @param {Function} [options.onProgress] - Progress callback
 * @param {boolean} [options.overwrite=true] - Whether to overwrite existing file
 * @returns {Object} Upload result
 */
const uploadFile = async (username, filePath, fileData, options = {}) => {
  try {
    if (!username?.trim() || !filePath?.trim() || !fileData) {
      throw new Error('Username, file path, and file data are required');
    }
    
    const { onProgress, overwrite = true } = options;
    const fileSize = fileData.size || fileData.byteLength || 0;
    
    // Check if file exists if overwrite is disabled
    if (!overwrite) {
      try {
        const webdavUrl = buildWebDAVUrl(username, filePath);
        await apiClient.head(webdavUrl);
        throw new Error('File already exists and overwrite is disabled');
      } catch (error) {
        // If HEAD request fails (404), file doesn't exist, which is what we want
        if (error.response?.status !== 404) {
          throw error;
        }
      }
    }
    
    // Use chunked upload for files larger than 50MB
    const chunkThreshold = 50 * 1024 * 1024; // 50MB
    
    if (fileSize > chunkThreshold && (fileData instanceof File || fileData instanceof Blob)) {
      console.log(`📦 Using chunked upload for large file: ${filePath} (${formatFileSize(fileSize)})`);
      return await uploadFileChunked(username, filePath, fileData, options);
    }
    
    // Standard upload for smaller files
    const webdavUrl = buildWebDAVUrl(username, filePath);
    const timeout = calculateUploadTimeout(fileSize);
    
    console.log(`📤 Uploading file: ${filePath} (${formatFileSize(fileSize)}) with ${timeout/1000}s timeout`);
    
    const config = {
      method: 'PUT',
      url: webdavUrl,
      data: fileData,
      timeout: timeout,
      headers: {
        'Content-Type': 'application/octet-stream',
      },
    };
    
    // Add progress tracking if callback provided
    if (onProgress && typeof onProgress === 'function') {
      config.onUploadProgress = (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(percentCompleted, progressEvent.loaded, progressEvent.total);
      };
    }
    
    const response = await apiClient(config);
    
    return {
      success: true,
      message: `File "${filePath}" uploaded successfully`,
      path: filePath,
      status: response.status,
      method: 'standard',
    };
    
  } catch (error) {
    console.error(`❌ Failed to upload file ${filePath}:`, error.message);
    
    // Provide more specific error messages
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      throw new Error('Upload timeout - file may be too large or connection is slow');
    } else if (error.response?.status === 507) {
      throw new Error('Not enough storage space available');
    } else if (error.response?.status === 413) {
      throw new Error('File too large - exceeds server limits');
    } else if (error.response?.status === 401) {
      throw new Error('Authentication failed - please check your credentials');
    } else if (error.response?.status === 403) {
      throw new Error('Permission denied - you may not have write access to this location');
    }
    
    throw new Error(error.response?.data?.message || error.message || 'Failed to upload file');
  }
};

/**
 * Download a file
 * @param {string} username - Username
 * @param {string} filePath - File path to download
 * @param {Object} [options={}] - Download options
 * @param {string} [options.responseType='blob'] - Response type
 * @returns {Object} Download result with file data
 */
const downloadFile = async (username, filePath, options = {}) => {
  try {
    if (!username?.trim() || !filePath?.trim()) {
      throw new Error('Username and file path are required');
    }
    
    const { responseType = 'blob' } = options;
    
    const webdavUrl = buildWebDAVUrl(username, filePath);
    
    const response = await apiClient({
      method: 'GET',
      url: webdavUrl,
      responseType: responseType,
    });
    
    return {
      success: true,
      data: response.data,
      path: filePath,
      headers: response.headers,
    };
    
  } catch (error) {
    console.error(`❌ Failed to download file ${filePath}:`, error.message);
    
    if (error.response?.status === 404) {
      throw new Error('File not found');
    }
    
    throw new Error(error.response?.data?.message || error.message || 'Failed to download file');
  }
};

/**
 * Get file/folder properties
 * @param {string} username - Username
 * @param {string} itemPath - Path of item
 * @returns {Object} Item properties
 */
const getItemProperties = async (username, itemPath) => {
  try {
    if (!username?.trim() || !itemPath?.trim()) {
      throw new Error('Username and item path are required');
    }
    
    const webdavUrl = buildWebDAVUrl(username, itemPath);
    
    const response = await apiClient({
      method: WEBDAV_METHODS.PROPFIND,
      url: webdavUrl,
      headers: {
        'Depth': '0',
        'Content-Type': 'application/xml',
      },
    });
    
    const files = parseWebDAVResponse(response.data);
    const item = files[0];
    
    if (!item) {
      throw new Error('Item not found');
    }
    
    return {
      success: true,
      item: item,
    };
    
  } catch (error) {
    console.error(`❌ Failed to get properties for ${itemPath}:`, error.message);
    
    if (error.response?.status === 404) {
      throw new Error('Item not found');
    }
    
    throw new Error(error.response?.data?.message || error.message || 'Failed to get item properties');
  }
};

// ===== EXPORTS =====

/**
 * Files and WebDAV Management API object with all functions
 * Modern functional approach - all functions are pure and composable
 */
export const filesAPI = {
  // Directory operations
  listFiles,
  createFolder,
  
  // File operations
  uploadFile,
  downloadFile,
  
  // Item operations
  deleteItem,
  moveItem,
  copyItem,
  getItemProperties,
  
  // Pure utility functions (exposed for testing and flexibility)
  formatFileSize,
  parseWebDAVResponse,
  buildWebDAVUrl,
  extractRelativePath,
  
  // Constants
  WEBDAV_METHODS,
  DEFAULT_CHUNK_SIZE,
};

export default filesAPI;
