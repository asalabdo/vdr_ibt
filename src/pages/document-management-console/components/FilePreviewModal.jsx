import React from 'react';
import { useTranslation } from 'react-i18next';
import { useFileProperties, useDownloadFile } from '@/hooks/api';
import { useAuthStatus } from '@/hooks/api';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Icon from '../../../components/AppIcon';

const FilePreviewModal = ({ isOpen, onClose, file }) => {
  const { t } = useTranslation('document-management-console');
  
  // Get current username from auth context or fallback to environment
  const { username: authUsername } = useAuthStatus();
  const currentUsername = authUsername || import.meta.env.VITE_DEV_USERNAME || 'eslam';
  
  // Fetch file properties when modal is open
  const { 
    data: fileProperties, 
    isLoading, 
    error 
  } = useFileProperties(currentUsername, file?.path, {
    enabled: isOpen && !!file?.path 
  });

  // Download file mutation - MUST be before any early returns!
  const downloadFileMutation = useDownloadFile({
    onSuccess: (data, variables) => {
      // Create blob and download
      const blob = new Blob([data.data], { 
        type: data.headers['content-type'] || 'application/octet-stream' 
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = variables.filePath.split('/').pop() || 'download';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    },
    onError: (error) => {
      console.error('Download failed:', error);
    }
  });
  
  if (!isOpen || !file) return null;

  const handleDownload = () => {
    if (file?.isDirectory) return;

    // Extract relative path from full WebDAV path for download
    const relativePath = file.path.replace(/^\/remote\.php\/dav\/files\/[^/]+/, '') || `/${file.name}`;
    
    downloadFileMutation.mutate({
      username: currentUsername,
      filePath: relativePath,
      responseType: 'blob'
    });
  };

  const getFileIcon = (contentType, isDirectory) => {
    if (isDirectory) return '📁';
    if (contentType?.includes('pdf')) return '📄';
    if (contentType?.includes('word')) return '📝';
    if (contentType?.includes('sheet')) return '📊';
    if (contentType?.includes('presentation')) return '📊';
    if (contentType?.includes('image')) return '🖼️';
    if (contentType?.includes('video')) return '🎥';
    if (contentType?.includes('audio')) return '🎵';
    if (contentType?.includes('markdown')) return '📝';
    if (contentType?.includes('text')) return '📄';
    return '📄';
  };

  const getHumanReadableFileType = (contentType, fileName) => {
    if (!contentType) {
      // Fallback to file extension if no MIME type
      const extension = fileName?.split('.').pop()?.toLowerCase();
      return extension ? extension.toUpperCase() : 'Unknown';
    }

    // Map common MIME types to human-readable names
    const typeMap = {
      'text/markdown': 'Markdown',
      'text/plain': 'Text',
      'text/html': 'HTML',
      'text/css': 'CSS',
      'application/pdf': 'PDF',
      'application/json': 'JSON',
      'application/xml': 'XML',
      'application/javascript': 'JavaScript',
      'application/typescript': 'TypeScript',
      'image/jpeg': 'JPEG Image',
      'image/jpg': 'JPG Image', 
      'image/png': 'PNG Image',
      'image/gif': 'GIF Image',
      'image/svg+xml': 'SVG Image',
      'image/webp': 'WebP Image',
      'video/mp4': 'MP4 Video',
      'audio/mp3': 'MP3 Audio',
      'application/zip': 'ZIP Archive',
      'application/msword': 'Word Document',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Word Document',
      'application/vnd.ms-excel': 'Excel Spreadsheet',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'Excel Spreadsheet',
    };

    // Check for exact match
    if (typeMap[contentType]) {
      return typeMap[contentType];
    }

    // Check for partial matches
    if (contentType.startsWith('text/')) return 'Text';
    if (contentType.startsWith('image/')) return 'Image';
    if (contentType.startsWith('video/')) return 'Video';
    if (contentType.startsWith('audio/')) return 'Audio';
    if (contentType.startsWith('application/')) return 'Application';

    // Return the MIME type as-is if no mapping found
    return contentType;
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const isPreviewable = (contentType) => {
    if (!contentType) return false;
    const previewableTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/bmp',
      'text/plain', 'text/markdown', 'text/csv',
      'application/pdf'
    ];
    return previewableTypes.includes(contentType.toLowerCase());
  };

  const buildPreviewUrl = (filePath, contentType) => {
    if (!filePath || !isPreviewable(contentType)) return null;
    
    // For images, we can use the WebDAV endpoint directly
    if (contentType?.startsWith('image/')) {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
      return `${baseUrl}${filePath}`;
    }
    
    // For other previewable files, you could use Nextcloud's preview API
    // This would need additional implementation for file ID retrieval
    return null;
  };

  const renderPreview = () => {
    if (!file || file.isDirectory) {
      return (
        <div className="bg-muted/30 rounded-lg border-2 border-dashed border-border flex items-center justify-center py-8">
          <div className="text-center">
            <Icon name="Folder" size={48} className="text-muted-foreground mx-auto mb-3" />
            <h4 className="text-base font-medium text-foreground mb-2">
              {t('preview_modal.folder_preview', { defaultValue: 'Folder Preview' })}
            </h4>
            <p className="text-muted-foreground text-sm">
              {t('preview_modal.folder_description', { defaultValue: 'This is a folder containing other files and folders.' })}
            </p>
          </div>
        </div>
      );
    }

    const previewUrl = buildPreviewUrl(file.path, file.contentType);
    
    if (previewUrl && file.contentType?.startsWith('image/')) {
      return (
        <div className="bg-muted/30 rounded-lg border border-border overflow-hidden">
          <img 
            src={previewUrl}
            alt={file.name}
            className="w-full h-auto max-h-[500px] object-contain"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
          <div className="hidden items-center justify-center py-8">
            <div className="text-center">
              <Icon name="AlertCircle" size={40} className="text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">
                {t('preview_modal.image_load_failed', { defaultValue: 'Failed to load image preview' })}
              </p>
            </div>
          </div>
        </div>
      );
    }

    // Compact fallback for non-previewable files
    return (
      <div className="bg-muted/30 rounded-lg border-2 border-dashed border-border flex items-center justify-center py-6">
        <div className="text-center">
          <Icon name="FileText" size={48} className="text-muted-foreground mx-auto mb-3" />
          <h4 className="text-base font-medium text-foreground mb-2">
            {t('preview_modal.title', { defaultValue: 'File Preview' })}
          </h4>
          <p className="text-muted-foreground text-sm mb-0">
            {t('preview_modal.file_description', { 
              defaultValue: 'Preview for {{fileType}} files is not available yet.',
              fileType: getHumanReadableFileType(file?.contentType, file?.name)
            })}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-card rounded-xl shadow-lg border border-border max-w-4xl w-full max-h-[90vh] mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <span className="text-2xl">{getFileIcon(file?.contentType, file?.isDirectory)}</span>
            <div>
              <h3 className="text-lg font-semibold text-foreground">{file?.name}</h3>
              <p className="text-sm text-muted-foreground">
                {file?.isDirectory ? 'Folder' : getHumanReadableFileType(file?.contentType, file?.name)} • {file?.path}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            {!file?.isDirectory && (
            <Button 
              onClick={handleDownload} 
              variant="outline" 
              size="sm"
              disabled={downloadFileMutation.isPending}
            >
              <Icon name="Download" className="w-4 h-4 mr-2" />
              {downloadFileMutation.isPending && (
                <Icon name="Loader2" size={14} className="animate-spin mr-1" />
              )}
              {t('actions.download', { defaultValue: 'Download' })}
            </Button>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <Icon name="X" size={20} className="text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Preview Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {isLoading && (
            <div className="space-y-4">
              <Skeleton className="h-8 w-64" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-28" />
              </div>
            </div>
          )}
          
          {error && (
            <Alert variant="destructive">
              <Icon name="AlertCircle" size={16} />
              <AlertDescription>
                {t('preview_modal.error_loading', { defaultValue: 'Failed to load file properties' })}: {error.message}
              </AlertDescription>
            </Alert>
          )}
          
          {!isLoading && !error && (
            <div className="space-y-6">
              {/* File Preview */}
              {renderPreview()}
              
              {/* File Details */}
              <div className="bg-muted/30 rounded-lg p-4 space-y-2 text-sm text-muted-foreground">
                <h5 className="font-medium text-foreground mb-3">
                  {t('preview_modal.file_details', { defaultValue: 'File Details' })}
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <p><span className="font-medium">{t('preview_modal.file_size', { defaultValue: 'Size' })}:</span> {formatFileSize(file?.size)}</p>
                  <p><span className="font-medium">{t('preview_modal.file_type', { defaultValue: 'Type' })}:</span> {getHumanReadableFileType(file?.contentType, file?.name)}</p>
                  <p className="col-span-full"><span className="font-medium">{t('preview_modal.file_path', { defaultValue: 'Path' })}:</span> {file?.path}</p>
                  {file?.lastModified && (
                    <p className="col-span-full"><span className="font-medium">{t('preview_modal.last_modified', { defaultValue: 'Modified' })}:</span> {new Date(file?.lastModified).toLocaleString()}</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FilePreviewModal;
