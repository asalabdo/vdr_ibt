import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useFileUpload, useGroups, useDataRooms, useCreateShare } from '@/hooks/api';
import { useAuthStatus } from '@/hooks/api';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { shareTypes } from '../../../api/endpoints';
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
  
  // New state for upload destination and sharing
  const [uploadDestination, setUploadDestination] = useState('personal'); // 'personal' or 'dataroom'
  const [selectedDataRoom, setSelectedDataRoom] = useState('');
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [isSharing, setIsSharing] = useState(false);
  
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
  
  // Data rooms and groups hooks
  const { data: dataRoomsData, isLoading: isLoadingDataRooms } = useDataRooms({
    enabled: uploadDestination === 'dataroom'
  });
  const { data: groupsData, isLoading: isLoadingGroups } = useGroups({
    enabled: uploadDestination === 'personal'
  });
  
  // Create share mutation for automatic sharing
  const createShareMutation = useCreateShare({
    onSuccess: (data) => {
      console.log('✅ File shared successfully with group:', data.share.shareWith);
    },
    onError: (error) => {
      console.error('❌ Failed to share file:', error.message);
      toast.error(`Failed to share file: ${error.message}`);
    }
  });
  
  // Extract data with fallbacks
  const dataRooms = dataRoomsData?.dataRooms || [];
  const groups = groupsData?.groups || [];

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setFiles([]);
      setUploadQueue([]);
      setIsUploading(false);
      setUploadProgress({});
      setCompletedUploads([]);
      setFailedUploads([]);
      setUploadDestination('personal');
      setSelectedDataRoom('');
      setSelectedGroups([]);
      setIsSharing(false);
      resetUpload();
    }
  }, [isOpen, resetUpload]);
  
  // Helper functions
  const toggleGroupSelection = (groupId, checked) => {
    setSelectedGroups(prev => 
      checked 
        ? [...prev, groupId]
        : prev.filter(id => id !== groupId)
    );
  };
  
  const getGroupName = (groupId) => {
    const group = groups.find(g => g.id === groupId);
    return group?.displayName || groupId;
  };
  
  const getDataRoomGroups = (dataRoomId) => {
    const room = dataRooms.find(r => r.id === dataRoomId);
    return room?.groupsList?.join(', ') || '';
  };
  
  const getSelectedDataRoom = () => {
    return dataRooms.find(r => r.id === selectedDataRoom);
  };

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

  // Start upload process with enhanced destination and sharing logic
  const startUpload = async () => {
    if (files.length === 0) return;
    
    // Validation
    if (uploadDestination === 'dataroom' && !selectedDataRoom) {
      toast.error('Please select a data room for upload');
      return;
    }

    setIsUploading(true);
    setUploadProgress({ total: files.length, current: 0 });
    
    try {
      let uploadBasePath;
      let uploadResults;
      
      if (uploadDestination === 'dataroom') {
        // Upload to Data Room (Group Folder)
        const selectedRoom = getSelectedDataRoom();
        if (!selectedRoom) {
          throw new Error('Selected data room not found');
        }
        
        // Group Folders are mounted directly with their mount point name
        // The mount point is the folder name that appears in the user's directory
        uploadBasePath = selectedRoom.mountPoint || selectedRoom.roomName;
        toast.info(`Uploading to data room: ${selectedRoom.roomName}`);
        
      } else {
        // Upload to Personal directory (current behavior)
        uploadBasePath = currentPath === '/' ? '' : currentPath.replace(/^\/+/, '');
      }
      
      // Use the uploadMultiple function from the hook
      uploadResults = await uploadMultiple(files, currentUsername, uploadBasePath);
      
      // Process upload results
      const successful = uploadResults.filter(result => result.success);
      const failed = uploadResults.filter(result => !result.success);
      
      setCompletedUploads(successful);
      setFailedUploads(failed);
      
      // Handle sharing for personal uploads
      if (uploadDestination === 'personal' && selectedGroups.length > 0 && successful.length > 0) {
        setIsSharing(true);
        
        // Share each successfully uploaded file with selected groups
        const sharingPromises = [];
        
        for (const uploadResult of successful) {
          const filePath = uploadBasePath ? `/${uploadBasePath}/${uploadResult.file}` : `/${uploadResult.file}`;
          
          for (const groupId of selectedGroups) {
            sharingPromises.push(
              createShareMutation.mutateAsync({
                path: filePath,
                shareType: shareTypes.GROUP, // shareType: 1
                shareWith: groupId,
                permissions: ['read', 'update', 'create', 'delete', 'share'] // Full permissions
              }).catch(error => {
                console.error(`Failed to share ${uploadResult.file} with group ${groupId}:`, error);
                return { error: error.message, file: uploadResult.file, group: groupId };
              })
            );
          }
        }
        
        // Wait for all sharing operations to complete
        const sharingResults = await Promise.all(sharingPromises);
        const sharingErrors = sharingResults.filter(result => result?.error);
        
        if (sharingErrors.length > 0) {
          toast.warning(`Files uploaded but some sharing failed: ${sharingErrors.length} errors`);
        } else {
          toast.success(`Files uploaded and shared with ${selectedGroups.length} group(s)`);
        }
        
        setIsSharing(false);
      }
      
      // Show success message
      if (successful.length > 0) {
        if (uploadDestination === 'dataroom') {
          const room = getSelectedDataRoom();
          toast.success(t('upload.success_dataroom', {
            defaultValue: `Successfully uploaded ${successful.length} file(s) to ${room?.roomName}`,
            count: successful.length,
            roomName: room?.roomName
          }));
        } else {
          toast.success(t('upload.success_multiple', {
            defaultValue: `Successfully uploaded ${successful.length} file(s)`,
            count: successful.length
          }));
        }
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
      setIsSharing(false);
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
      <div className="bg-card rounded-xl shadow-lg border border-border max-w-2xl w-full max-h-[90vh] mx-4 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border flex-shrink-0">
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

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6">
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

          {/* Upload Destination and Sharing Options */}
          <div className="mt-6 space-y-4">
            {/* Upload Destination Selector */}
            <div className="p-4 bg-muted/20 rounded-lg border border-border">
              <Label className="text-sm font-medium mb-3 block">
                {t('upload.destination_title', { defaultValue: 'Where do you want to upload these files?' })}
              </Label>
              
              <RadioGroup value={uploadDestination} onValueChange={setUploadDestination} className="space-y-3">
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value="personal" id="personal" />
                  <Label htmlFor="personal" className="flex items-center gap-2 cursor-pointer">
                    <Icon name="User" size={16} className="text-muted-foreground" />
                    <div>
                      <div className="font-medium">{t('upload.personal_files', { defaultValue: 'Personal Files' })}</div>
                      <div className="text-xs text-muted-foreground">
                        {t('upload.personal_description', { defaultValue: 'Upload to your personal directory (can share with groups later)' })}
                      </div>
                    </div>
                  </Label>
                </div>
                
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value="dataroom" id="dataroom" />
                  <Label htmlFor="dataroom" className="flex items-center gap-2 cursor-pointer">
                    <Icon name="Users" size={16} className="text-muted-foreground" />
                    <div>
                      <div className="font-medium">{t('upload.team_dataroom', { defaultValue: 'Team Data Room' })}</div>
                      <div className="text-xs text-muted-foreground">
                        {t('upload.dataroom_description', { defaultValue: 'Upload to a shared team folder (automatically accessible to team members)' })}
                      </div>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Data Room Selector */}
            {uploadDestination === 'dataroom' && (
              <div className="p-4 border border-border rounded-lg">
                <Label className="text-sm font-medium mb-2 block">
                  {t('upload.select_dataroom', { defaultValue: 'Select Team Data Room' })}
                </Label>
                
                {isLoadingDataRooms ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Icon name="Loader2" size={16} className="animate-spin" />
                    {t('upload.loading_datarooms', { defaultValue: 'Loading data rooms...' })}
                  </div>
                ) : dataRooms.length > 0 ? (
                  <>
                    <Select value={selectedDataRoom} onValueChange={setSelectedDataRoom}>
                      <SelectTrigger>
                        <SelectValue placeholder={t('upload.choose_dataroom', { defaultValue: 'Choose a data room...' })} />
                      </SelectTrigger>
                      <SelectContent>
                        {dataRooms.map(room => (
                          <SelectItem key={room.id} value={room.id}>
                            <div className="flex items-center justify-between w-full">
                              <span>{room.roomName}</span>
                              {room.groupsList.length > 0 && (
                                <Badge variant="outline" className="ml-2 text-xs">
                                  {room.groupsList.join(', ')}
                                </Badge>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    {selectedDataRoom && (
                      <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-950/20 rounded text-xs text-blue-700 dark:text-blue-300">
                        <Icon name="Info" size={12} className="inline mr-1" />
                        {t('upload.dataroom_access_info', { 
                          defaultValue: 'Files will be accessible to groups: {{groups}}',
                          groups: getDataRoomGroups(selectedDataRoom)
                        })}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-sm text-muted-foreground">
                    {t('upload.no_datarooms', { defaultValue: 'No data rooms available. Contact your administrator to create team data rooms.' })}
                  </div>
                )}
              </div>
            )}

            {/* Group Sharing Options for Personal Files */}
            {uploadDestination === 'personal' && (
              <div className="p-4 border border-border rounded-lg">
                <Label className="text-sm font-medium mb-3 block">
                  {t('upload.share_with_groups', { defaultValue: 'Share with Groups (Optional)' })}
                </Label>
                
                {isLoadingGroups ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Icon name="Loader2" size={16} className="animate-spin" />
                    {t('upload.loading_groups', { defaultValue: 'Loading groups...' })}
                  </div>
                ) : groups.length > 0 ? (
                  <>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {groups.map(group => (
                        <div key={group.id} className="flex items-center space-x-2">
                          <Checkbox 
                            id={group.id}
                            checked={selectedGroups.includes(group.id)}
                            onCheckedChange={(checked) => toggleGroupSelection(group.id, checked)}
                          />
                          <Label htmlFor={group.id} className="text-sm flex-1 cursor-pointer">
                            {group.displayName}
                            <span className="text-muted-foreground ml-1">
                              ({group.memberCount || 0} members)
                            </span>
                          </Label>
                        </div>
                      ))}
                    </div>
                    
                    {selectedGroups.length > 0 && (
                      <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-950/20 rounded text-xs text-blue-700 dark:text-blue-300">
                        <Icon name="Share" size={12} className="inline mr-1" />
                        {t('upload.sharing_preview', {
                          defaultValue: 'Files will be shared with: {{groups}}',
                          groups: selectedGroups.map(id => getGroupName(id)).join(', ')
                        })}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-sm text-muted-foreground">
                    {t('upload.no_groups', { defaultValue: 'No groups available for sharing.' })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Upload Progress */}
          {(isUploading || isSharing) && (
            <div className="mt-6">
              {/* Upload Progress */}
              {isUploading && uploadProgress.total && (
                <div className="p-4 bg-muted/30 rounded-lg mb-4">
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
              
              {/* Sharing Progress */}
              {isSharing && (
                <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300">
                    <Icon name="Share" size={16} className="animate-pulse" />
                    {t('upload.sharing_files', { defaultValue: 'Sharing files with selected groups...' })}
                  </div>
                </div>
              )}
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

        {/* Footer - Fixed at bottom */}
        <div className="flex-shrink-0 flex items-center justify-between p-6 border-t border-border bg-card">
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
              disabled={
                !hasFiles || 
                isUploading || 
                isSharing ||
                (uploadDestination === 'dataroom' && !selectedDataRoom)
              }
              className="min-w-[100px]"
            >
              {isUploading ? (
                <>
                  <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                  {t('actions.uploading', { defaultValue: 'Uploading...' })}
                </>
              ) : isSharing ? (
                <>
                  <Icon name="Share" size={16} className="mr-2 animate-pulse" />
                  {t('actions.sharing', { defaultValue: 'Sharing...' })}
                </>
              ) : (
                <>
                  <Icon name="Upload" size={16} className="mr-2" />
                  {uploadDestination === 'dataroom' 
                    ? t('actions.upload_to_dataroom', { defaultValue: 'Upload to Data Room' })
                    : selectedGroups.length > 0
                      ? t('actions.upload_and_share', { defaultValue: 'Upload & Share' })
                      : t('actions.upload', { defaultValue: 'Upload' })
                  }
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
