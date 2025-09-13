import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useFileUpload } from '@/hooks/api';
import { useAuthStatus } from '@/hooks/api';
import { Button } from '@/components/ui/Button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Icon from '../../../components/AppIcon';

const FileUploadModal = ({ isOpen, onClose, currentPath = '', onUploadComplete }) => {
  const { t } = useTranslation('document-management-console');
  
  // Get current username from auth context or fallback to environment
  const { username: authUsername } = useAuthStatus();
  const currentUsername = authUsername || import.meta.env.VITE_DEV_USERNAME || 'eslam';
  
  // State management
  const [files, setFiles] = useState([]);
  const [uploadQueue, setUploadQueue] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [completedUploads, setCompletedUploads] = useState([]);
  const [failedUploads, setFailedUploads] = useState([]);
  const [isDragOver, setIsDragOver] = useState(false);
  
  const fileInputRef = useRef(null);
  const dragCounter = useRef(0);

  // File upload hook with progress tracking
  const {
    upload,
    uploadAsync,
    isUploading: hookIsUploading,
    error: uploadError,
    reset: resetUpload,
    uploadMultiple
  } = useFileUpload({
    onProgress: (percent, loaded, total) => {
      setUploadProgress(prev => ({
        ...prev,
        current: { percent, loaded, total }
      }));
    }
  });

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setFiles([]);
      setUploadQueue([]);
      setIsUploading(false);
      setUploadProgress({});
      setCompletedUploads([]);
      setFailedUploads([]);
      resetUpload();
    }
  }, [isOpen, resetUpload]);

  // File validation
  const validateFile = (file) => {
    const maxSize = 500 * 1024 * 1024; // 500MB - increased limit
    const allowedTypes = [
      // Documents
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      // Text files
      'text/plain',
      'text/csv',
      'application/json',
      'text/markdown',
      'text/html',
      'text/css',
      'application/javascript',
      'application/xml',
      // Images
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml',
      'image/bmp',
      // Videos
      'video/mp4',
      'video/webm',
      'video/ogg',
      'video/avi',
      'video/mov',
      // Audio
      'audio/mp3',
      'audio/wav',
      'audio/ogg',
      'audio/m4a',
      // Archives
      'application/zip',
      'application/x-rar-compressed',
      'application/x-7z-compressed',
      'application/gzip'
    ];

    if ((file.size || 0) > maxSize) {
      return {
        valid: false,
        error: t('upload.error_file_too_large', { 
          defaultValue: 'File size exceeds 500MB limit',
          fileName: file.name,
          size: formatFileSize(file.size || 0)
        })
      };
    }

    // Warn about large files that will use chunked upload
    const chunkThreshold = 50 * 1024 * 1024; // 50MB
    if ((file.size || 0) > chunkThreshold) {
      console.log(`📦 Large file detected: ${file.name} (${formatFileSize(file.size || 0)}) - will use chunked upload`);
    }

    // Allow all file types for now, but warn about potentially unsupported types
    if (!allowedTypes.includes(file.type) && file.type) {
      console.warn(`File type ${file.type} may not be supported for preview:`, file.name);
    }

    return { valid: true };
  };

  // Format file size helper
  const formatFileSize = (bytes) => {
    // Handle invalid input
    if (!bytes || bytes === 0 || isNaN(bytes)) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    // Ensure i is within valid range
    const sizeIndex = Math.min(i, sizes.length - 1);
    const formattedSize = parseFloat((bytes / Math.pow(k, sizeIndex)).toFixed(2));
    
    return formattedSize + ' ' + sizes[sizeIndex];
  };

  // Handle file selection
  const handleFileSelection = (selectedFiles) => {
    const fileList = Array.from(selectedFiles);
    const validFiles = [];
    const invalidFiles = [];

      fileList.forEach(file => {
        const validation = validateFile(file);
        if (validation.valid) {
          // Add metadata properties to the File object without destroying the file data
          // We need to preserve the original File object to maintain binary data
          file.uploadId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          file.status = 'pending';
          
          validFiles.push(file);
        } else {
          invalidFiles.push({ file, error: validation.error });
        }
      });

    // Show errors for invalid files
    invalidFiles.forEach(({ file, error }) => {
      toast.error(error);
    });

    // Add valid files to the list
    setFiles(prev => [...prev, ...validFiles]);
  };

  // Drag and drop handlers
  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragOver(true);
    }
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsDragOver(false);
    }
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    dragCounter.current = 0;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelection(e.dataTransfer.files);
    }
  }, []);

  // File input click handler
  const handleFileInputClick = () => {
    fileInputRef.current?.click();
  };

  // File input change handler
  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelection(e.target.files);
    }
    // Reset file input
    e.target.value = '';
  };

  // Remove file from list
  const removeFile = (uploadId) => {
    setFiles(prev => prev.filter(file => file.uploadId !== uploadId));
  };

  // Clear all files
  const clearAllFiles = () => {
    setFiles([]);
    setCompletedUploads([]);
    setFailedUploads([]);
    setUploadProgress({});
  };

  // Start upload process
  const startUpload = async () => {
    if (files.length === 0) return;

    setIsUploading(true);
    setUploadProgress({ total: files.length, current: 0 });
    
    try {
      // Use the uploadMultiple function from the hook
      // Handle root path correctly - if currentPath is '/', pass empty string as basePath
      const uploadBasePath = currentPath === '/' ? '' : currentPath.replace(/^\/+/, '');
      const results = await uploadMultiple(files, currentUsername, uploadBasePath);
      
      // Process results
      const successful = results.filter(result => result.success);
      const failed = results.filter(result => !result.success);
      
      setCompletedUploads(successful);
      setFailedUploads(failed);
      
      // Show success message
      if (successful.length > 0) {
        toast.success(t('upload.success_multiple', {
          defaultValue: `Successfully uploaded ${successful.length} file(s)`,
          count: successful.length
        }));
      }
      
      // Show error messages for failed uploads
      if (failed.length > 0) {
        failed.forEach(result => {
          toast.error(t('upload.error_single', {
            defaultValue: `Failed to upload ${result.file}: ${result.error}`,
            fileName: result.file,
            error: result.error
          }));
        });
      }
      
      // Notify parent component to refresh file list
      if (successful.length > 0 && onUploadComplete) {
        onUploadComplete();
      }
      
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(t('upload.error_general', {
        defaultValue: 'Upload failed',
        error: error.message
      }));
      setFailedUploads(files.map(file => ({ 
        file: file.name, 
        error: error.message, 
        success: false 
      })));
    } finally {
      setIsUploading(false);
      setUploadProgress({});
    }
  };

  // Close modal and cleanup
  const handleClose = () => {
    if (!isUploading) {
      clearAllFiles();
      onClose();
    }
  };

  if (!isOpen) return null;

  const hasFiles = files.length > 0;
  const hasCompletedUploads = completedUploads.length > 0;
  const hasFailedUploads = failedUploads.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-card rounded-xl shadow-lg border border-border max-w-2xl w-full max-h-[90vh] mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <Icon name="Upload" size={24} className="text-primary" />
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                {t('upload.title', { defaultValue: 'Upload Files' })}
              </h3>
              <p className="text-sm text-muted-foreground">
                {currentPath 
                  ? t('upload.upload_to', { defaultValue: `Upload to: ${currentPath}`, path: currentPath })
                  : t('upload.upload_to_root', { defaultValue: 'Upload to root directory' })
                }
              </p>
            </div>
          </div>
          <Button
            onClick={handleClose}
            variant="ghost"
            size="sm"
            disabled={isUploading}
          >
            <Icon name="X" size={20} />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Drop Zone */}
          <div
            className={`relative border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
              isDragOver
                ? 'border-primary bg-primary/10'
                : 'border-border hover:border-primary/50 hover:bg-muted/30'
            }`}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <Icon 
              name="Upload" 
              size={32} 
              className={`mx-auto mb-3 ${isDragOver ? 'text-primary' : 'text-muted-foreground'}`} 
            />
            <h4 className="text-base font-medium text-foreground mb-2">
              {isDragOver
                ? t('upload.drop_files', { defaultValue: 'Drop files here' })
                : t('upload.drag_drop', { defaultValue: 'Drag & drop files' })
              }
            </h4>
            <p className="text-sm text-muted-foreground mb-3">
              {t('upload.or_click', { defaultValue: 'or click to browse' })}
            </p>
            <Button
              onClick={handleFileInputClick}
              variant="outline"
              size="sm"
              disabled={isUploading}
              className="mb-3"
            >
              <Icon name="FolderOpen" className="w-4 h-4 mr-2" />
              {t('upload.select_files', { defaultValue: 'Select Files' })}
            </Button>
            <div className="text-xs text-muted-foreground bg-muted/20 rounded px-3 py-1">
              <Icon name="Info" size={10} className="inline mr-1" />
              {t('upload.size_info_short', { 
                defaultValue: 'Up to 500MB • Large files use chunked upload' 
              })}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileInputChange}
              className="hidden"
              accept="*/*"
            />
          </div>

          {/* Upload Progress */}
          {isUploading && uploadProgress.total && (
            <div className="mt-6 p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">
                  {t('upload.uploading', { defaultValue: 'Uploading files...' })}
                </span>
                <span className="text-sm text-muted-foreground">
                  {typeof uploadProgress.current === 'object' 
                    ? `${Math.round(uploadProgress.current?.percent || 0)}%`
                    : `${uploadProgress.current || 0} / ${uploadProgress.total || 0}`
                  }
                </span>
              </div>
              <Progress 
                value={typeof uploadProgress.current === 'object' 
                  ? Math.min(100, Math.max(0, uploadProgress.current?.percent || 0))
                  : Math.min(100, Math.max(0, ((uploadProgress.current || 0) / (uploadProgress.total || 1)) * 100))
                } 
                className="h-2" 
              />
            </div>
          )}

          {/* File List */}
          {hasFiles && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-4">
                <h5 className="text-sm font-medium text-foreground">
                  {t('upload.files_to_upload', { 
                    defaultValue: `Files to upload (${files.length})`,
                    count: files.length 
                  })}
                </h5>
                <Button
                  onClick={clearAllFiles}
                  variant="ghost"
                  size="sm"
                  disabled={isUploading}
                >
                  <Icon name="X" className="w-4 h-4 mr-1" />
                  {t('upload.clear_all', { defaultValue: 'Clear All' })}
                </Button>
              </div>
              
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {files.map((file) => (
                  <div
                    key={file.uploadId}
                    className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                  >
                    <div className="flex items-center space-x-3 rtl:space-x-reverse flex-1 min-w-0">
                      <Icon name="File" size={16} className="text-muted-foreground flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-foreground truncate">
                          {file.name}
                        </p>
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-muted-foreground">
                            {formatFileSize(file.size || 0)}
                          </p>
                          {(file.size || 0) > 50 * 1024 * 1024 && (
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                              {t('upload.chunked_upload', { defaultValue: 'Chunked Upload' })}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button
                      onClick={() => removeFile(file.uploadId)}
                      variant="ghost"
                      size="sm"
                      disabled={isUploading}
                      className="flex-shrink-0"
                    >
                      <Icon name="X" size={14} />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upload Results */}
          {hasCompletedUploads && (
            <Alert className="mt-4 border-green-500/20 bg-green-500/10 dark:border-green-400/30 dark:bg-green-400/10">
              <Icon name="CheckCircle" className="text-green-600 dark:text-green-400" size={16} />
              <AlertDescription className="text-green-700 dark:text-green-300 font-medium">
                {t('upload.completed_uploads', {
                  defaultValue: `Successfully uploaded ${completedUploads.length} file(s)`,
                  count: completedUploads.length
                })}
              </AlertDescription>
            </Alert>
          )}

          {hasFailedUploads && (
            <Alert variant="destructive" className="mt-4">
              <Icon name="AlertCircle" size={16} />
              <AlertDescription>
                {t('upload.failed_uploads', {
                  defaultValue: `Failed to upload ${failedUploads.length} file(s)`,
                  count: failedUploads.length
                })}
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-border">
          <div className="text-sm text-muted-foreground">
            {hasFiles && (
              <span>
                {t('upload.files_ready', {
                  defaultValue: `${files.length} file(s) ready`,
                  count: files.length
                })}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <Button
              onClick={handleClose}
              variant="outline"
              disabled={isUploading}
            >
              {isUploading 
                ? t('actions.uploading', { defaultValue: 'Uploading...' })
                : t('actions.cancel', { defaultValue: 'Cancel' })
              }
            </Button>
            <Button
              onClick={startUpload}
              disabled={!hasFiles || isUploading}
              className="min-w-[100px]"
            >
              {isUploading ? (
                <>
                  <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                  {t('actions.uploading', { defaultValue: 'Uploading...' })}
                </>
              ) : (
                <>
                  <Icon name="Upload" size={16} className="mr-2" />
                  {t('actions.upload', { defaultValue: 'Upload' })}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileUploadModal;
