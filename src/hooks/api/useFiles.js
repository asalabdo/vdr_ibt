import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { filesAPI } from '../../api/files';

/**
 * Files Management Hooks for React Query Integration
 * 
 * This module provides React hooks for file management operations using React Query.
 * All hooks are optimized for server state management with proper caching,
 * error handling, and loading states.
 * 
 * Key Features:
 * - Automatic cache invalidation and updates
 * - Optimistic updates for better UX
 * - Comprehensive error handling
 * - Loading state management
 * - Progress tracking for uploads
 * - WebDAV integration
 * 
 * @module useFiles
 */

// Query keys for consistent caching
const QUERY_KEYS = {
  files: ['files'],
  filesList: (username, path) => ['files', 'list', username, path],
  fileProperties: (username, path) => ['files', 'properties', username, path],
};

/**
 * List files and folders in a directory
 * @param {string} username - Username
 * @param {string} path - Directory path
 * @param {Object} options - Query options
 * @param {boolean} [options.enabled=true] - Whether to enable the query
 * @param {number} [options.depth=1] - WebDAV depth
 * @returns {Object} React Query result object
 */
export const useListFiles = (username, path = '', options = {}) => {
  const { enabled = true, depth = 1, ...queryOptions } = options;
  
  return useQuery({
    queryKey: QUERY_KEYS.filesList(username, path),
    queryFn: () => filesAPI.listFiles(username, path, { depth }),
    enabled: enabled && !!username,
    staleTime: 1000 * 30, // 30 seconds
    gcTime: 1000 * 60 * 2, // 2 minutes
    retry: 2,
    select: (data) => ({
      ...data,
      files: data.files || [],
    }),
    ...queryOptions,
  });
};

/**
 * Get file or folder properties
 * @param {string} username - Username
 * @param {string} itemPath - Item path
 * @param {Object} options - Query options
 * @param {boolean} [options.enabled=true] - Whether to enable the query
 * @returns {Object} React Query result object
 */
export const useFileProperties = (username, itemPath, options = {}) => {
  const { enabled = true, ...queryOptions } = options;
  
  return useQuery({
    queryKey: QUERY_KEYS.fileProperties(username, itemPath),
    queryFn: () => filesAPI.getItemProperties(username, itemPath),
    enabled: enabled && !!username && !!itemPath,
    staleTime: 1000 * 60, // 1 minute
    gcTime: 1000 * 60 * 3, // 3 minutes
    retry: 2,
    select: (data) => data.item,
    ...queryOptions,
  });
};

/**
 * Create a new folder
 * @param {Object} options - Mutation options
 * @returns {Object} React Query mutation object
 */
export const useCreateFolder = (options = {}) => {
  const queryClient = useQueryClient();
  
  // Extract callbacks from options to handle chaining properly
  const { onSuccess: customOnSuccess, onError: customOnError, ...restOptions } = options;
  
  return useMutation({
    mutationFn: ({ username, folderPath }) => filesAPI.createFolder(username, folderPath),
    onSuccess: (data, variables) => {
      const { username, folderPath } = variables;
      
      // Get parent directory path
      const pathParts = folderPath.split('/').filter(Boolean);
      const parentPath = pathParts.length > 1 ? pathParts.slice(0, -1).join('/') : '';
      
      // Invalidate parent directory listing
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.filesList(username, parentPath),
        exact: false 
      });
      
      // Invalidate all file queries for this user
      queryClient.invalidateQueries({ queryKey: ['files', 'list', username] });
      
      if (customOnSuccess) {
        customOnSuccess(data, variables);
      }
    },
    onError: (error, variables) => {
      console.error('❌ Failed to create folder:', error.message);
      
      if (customOnError) {
        customOnError(error, variables);
      }
    },
    ...restOptions,
  });
};

/**
 * Delete a file or folder
 * @param {Object} options - Mutation options
 * @returns {Object} React Query mutation object
 */
export const useDeleteItem = (options = {}) => {
  const queryClient = useQueryClient();
  
  // Extract callbacks from options to handle chaining properly
  const { onSuccess: customOnSuccess, onError: customOnError, ...restOptions } = options;
  
  return useMutation({
    mutationFn: ({ username, itemPath }) => filesAPI.deleteItem(username, itemPath),
    onSuccess: (data, variables) => {
      const { username, itemPath } = variables;
      
      // Get parent directory path
      const pathParts = itemPath.split('/').filter(Boolean);
      const parentPath = pathParts.length > 1 ? pathParts.slice(0, -1).join('/') : '';
      
      // Remove item from cache
      queryClient.removeQueries({ 
        queryKey: QUERY_KEYS.fileProperties(username, itemPath) 
      });
      
      // Invalidate parent directory listing
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.filesList(username, parentPath),
        exact: false 
      });
      
      // Invalidate all file queries for this user
      queryClient.invalidateQueries({ queryKey: ['files', 'list', username] });
      
      if (customOnSuccess) {
        customOnSuccess(data, variables);
      }
    },
    onError: (error, variables) => {
      console.error('❌ Failed to delete item:', error.message);
      
      if (customOnError) {
        customOnError(error, variables);
      }
    },
    ...restOptions,
  });
};

/**
 * Move or rename a file/folder
 * @param {Object} options - Mutation options
 * @returns {Object} React Query mutation object
 */
export const useMoveItem = (options = {}) => {
  const queryClient = useQueryClient();
  
  // Extract callbacks from options to handle chaining properly
  const { onSuccess: customOnSuccess, onError: customOnError, ...restOptions } = options;
  
  return useMutation({
    mutationFn: ({ username, sourcePath, destinationPath, overwrite }) => 
      filesAPI.moveItem(username, sourcePath, destinationPath, { overwrite }),
    onSuccess: (data, variables) => {
      const { username, sourcePath, destinationPath } = variables;
      
      // Get parent directories for both source and destination
      const sourceParent = sourcePath.split('/').slice(0, -1).join('/');
      const destParent = destinationPath.split('/').slice(0, -1).join('/');
      
      // Remove old item from cache
      queryClient.removeQueries({ 
        queryKey: QUERY_KEYS.fileProperties(username, sourcePath) 
      });
      
      // Invalidate parent directories
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.filesList(username, sourceParent) 
      });
      
      if (sourceParent !== destParent) {
        queryClient.invalidateQueries({ 
          queryKey: QUERY_KEYS.filesList(username, destParent) 
        });
      }
      
      // Invalidate all file queries for this user
      queryClient.invalidateQueries({ queryKey: ['files', 'list', username] });
      
      if (customOnSuccess) {
        customOnSuccess(data, variables);
      }
    },
    onError: (error, variables) => {
      console.error('❌ Failed to move item:', error.message);
      
      if (customOnError) {
        customOnError(error, variables);
      }
    },
    ...restOptions,
  });
};

/**
 * Copy a file/folder
 * @param {Object} options - Mutation options
 * @returns {Object} React Query mutation object
 */
export const useCopyItem = (options = {}) => {
  const queryClient = useQueryClient();
  
  // Extract callbacks from options to handle chaining properly
  const { onSuccess: customOnSuccess, onError: customOnError, ...restOptions } = options;
  
  return useMutation({
    mutationFn: ({ username, sourcePath, destinationPath, overwrite }) => 
      filesAPI.copyItem(username, sourcePath, destinationPath, { overwrite }),
    onSuccess: (data, variables) => {
      const { username, destinationPath } = variables;
      
      // Get parent directory for destination
      const destParent = destinationPath.split('/').slice(0, -1).join('/');
      
      // Invalidate destination parent directory
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.filesList(username, destParent) 
      });
      
      // Invalidate all file queries for this user
      queryClient.invalidateQueries({ queryKey: ['files', 'list', username] });
      
      if (customOnSuccess) {
        customOnSuccess(data, variables);
      }
    },
    onError: (error, variables) => {
      console.error('❌ Failed to copy item:', error.message);
      
      if (customOnError) {
        customOnError(error, variables);
      }
    },
    ...restOptions,
  });
};

/**
 * Upload a file with progress tracking
 * @param {Object} options - Mutation options
 * @returns {Object} React Query mutation object with progress tracking
 */
export const useUploadFile = (options = {}) => {
  const queryClient = useQueryClient();
  
  // Extract callbacks from options to handle chaining properly
  const { onSuccess: customOnSuccess, onError: customOnError, onProgress, ...restOptions } = options;
  
  return useMutation({
    mutationFn: ({ username, filePath, fileData, overwrite }) => 
      filesAPI.uploadFile(username, filePath, fileData, { 
        overwrite,
        onProgress 
      }),
    onSuccess: (data, variables) => {
      const { username, filePath } = variables;
      
      // Get parent directory path
      const parentPath = filePath.split('/').slice(0, -1).join('/');
      
      // Invalidate parent directory listing
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.filesList(username, parentPath) 
      });
      
      // Invalidate file properties if they exist
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.fileProperties(username, filePath) 
      });
      
      // Invalidate all file queries for this user
      queryClient.invalidateQueries({ queryKey: ['files', 'list', username] });
      
      if (customOnSuccess) {
        customOnSuccess(data, variables);
      }
    },
    onError: (error, variables) => {
      console.error('❌ Failed to upload file:', error.message);
      
      if (customOnError) {
        customOnError(error, variables);
      }
    },
    ...restOptions,
  });
};

/**
 * Download a file
 * @param {Object} options - Mutation options
 * @returns {Object} React Query mutation object
 */
export const useDownloadFile = (options = {}) => {
  // Extract callbacks from options to handle chaining properly
  const { onSuccess: customOnSuccess, onError: customOnError, ...restOptions } = options;
  
  return useMutation({
    mutationFn: ({ username, filePath, responseType }) => 
      filesAPI.downloadFile(username, filePath, { responseType }),
    onSuccess: (data, variables) => {
      console.log('✅ File downloaded successfully:', variables.filePath);
      
      if (customOnSuccess) {
        customOnSuccess(data, variables);
      }
    },
    onError: (error, variables) => {
      console.error('❌ Failed to download file:', error.message);
      
      if (customOnError) {
        customOnError(error, variables);
      }
    },
    ...restOptions,
  });
};

/**
 * Comprehensive files management hook
 * Provides all file management operations in one hook
 * @returns {Object} All file management functions and utilities
 */
export const useFilesManagement = () => {
  return {
    // Queries
    useListFiles,
    useFileProperties,
    
    // Mutations
    useCreateFolder,
    useDeleteItem,
    useMoveItem,
    useCopyItem,
    useUploadFile,
    useDownloadFile,
    
    // Query keys (for manual cache operations)
    queryKeys: QUERY_KEYS,
  };
};

/**
 * Helper hook for handling file uploads with progress
 * @param {Object} options - Hook options
 * @param {Function} [options.onProgress] - Progress callback
 * @returns {Object} Upload utilities and state
 */
export const useFileUpload = (options = {}) => {
  const { onProgress } = options;
  
  const uploadMutation = useUploadFile({
    onProgress,
  });
  
  return {
    upload: uploadMutation.mutate,
    uploadAsync: uploadMutation.mutateAsync,
    isUploading: uploadMutation.isPending,
    error: uploadMutation.error,
    reset: uploadMutation.reset,
    
    // Helper for multiple file uploads
    uploadMultiple: async (files, username, basePath = '') => {
      const results = [];
      
      for (const file of files) {
        try {
          const filePath = basePath ? `${basePath}/${file.name}` : file.name;
          const result = await uploadMutation.mutateAsync({
            username,
            filePath,
            fileData: file,
            overwrite: true
          });
          results.push({ success: true, file: file.name, ...result });
        } catch (error) {
          results.push({ success: false, file: file.name, error: error.message });
        }
      }
      
      return results;
    },
  };
};
