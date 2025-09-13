import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { useFileProperties, useDownloadFile } from '@/hooks/api';
import { useAuthStatus } from '@/hooks/api';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Icon from '../../../components/AppIcon';

// Set up PDF.js worker - Recommended approach for Vite with CDN fallback
try {
  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url,
  ).toString();
} catch (error) {
  // Fallback to CDN with dynamic version matching
  pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
}

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


  // ===== AUTHENTICATED FILE VIEWER COMPONENT =====
  const AuthenticatedFileViewer = ({ file, currentUsername }) => {
    const [blobUrl, setBlobUrl] = useState(null);
    const [isLoadingPreview, setIsLoadingPreview] = useState(false);
    const [previewError, setPreviewError] = useState(null);
    const [numPages, setNumPages] = useState(null);
    const [pageNumber, setPageNumber] = useState(1);
    const [scale, setScale] = useState(1.0);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [imageScale, setImageScale] = useState(1.0);
    const pdfContainerRef = useRef(null);
    const imageContainerRef = useRef(null);

    // Create a separate download mutation for preview
    const previewDownloadMutation = useDownloadFile({
      onSuccess: (data) => {
        try {
          const blob = new Blob([data.data], { 
            type: data.headers['content-type'] || 'application/octet-stream' 
          });
          const url = URL.createObjectURL(blob);
          setBlobUrl(url);
          setIsLoadingPreview(false);
          setPreviewError(null);
        } catch (error) {
          console.error('❌ Failed to create blob URL:', error);
          setPreviewError('Failed to create file preview');
          setIsLoadingPreview(false);
        }
      },
      onError: (error) => {
        console.error('❌ Preview download failed:', error);
        setPreviewError(error.message || 'Failed to load file for preview');
        setIsLoadingPreview(false);
      }
    });

    // Get file type
    const getFileType = (fileName, contentType) => {
      const extension = fileName?.split('.').pop()?.toLowerCase();
      if (contentType?.includes('pdf') || extension === 'pdf') return 'pdf';
      if (contentType?.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'].includes(extension)) return 'image';
      if (contentType?.startsWith('video/') || ['mp4', 'webm', 'ogg', 'avi', 'mov'].includes(extension)) return 'video';
      return 'unsupported';
    };

    // Full-screen functionality
    const enterFullScreen = async () => {
      const container = fileType === 'pdf' ? pdfContainerRef.current : imageContainerRef.current;
      if (container && container.requestFullscreen) {
        try {
          await container.requestFullscreen();
        } catch (error) {
          console.error('Error entering full-screen:', error);
        }
      }
    };

    const exitFullScreen = async () => {
      if (document.fullscreenElement) {
        try {
          await document.exitFullscreen();
        } catch (error) {
          console.error('Error exiting full-screen:', error);
        }
      }
    };

    const toggleFullScreen = () => {
      if (isFullScreen) {
        exitFullScreen();
      } else {
        enterFullScreen();
      }
    };

    // Load file when component mounts
    useEffect(() => {
      if (!file || !currentUsername || file.isDirectory) return;

      const fileType = getFileType(file.name, file.contentType);
      if (fileType === 'unsupported') return;

      // Clean up previous blob URL
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
        setBlobUrl(null);
      }

      setIsLoadingPreview(true);
      setPreviewError(null);

      const relativePath = file.path.replace(/^\/remote\.php\/dav\/files\/[^/]+/, '') || `/${file.name}`;
      
      previewDownloadMutation.mutate({
        username: currentUsername,
        filePath: relativePath,
        responseType: 'blob'
      });

      return () => {
        if (blobUrl) URL.revokeObjectURL(blobUrl);
      };
    }, [file?.path, currentUsername]);

    // Cleanup on unmount
    useEffect(() => {
      return () => {
        if (blobUrl) URL.revokeObjectURL(blobUrl);
      };
    }, [blobUrl]);

    const fileType = getFileType(file?.name, file?.contentType);

    // Listen for full-screen changes and keyboard shortcuts
    useEffect(() => {
      const handleFullScreenChange = () => {
        setIsFullScreen(!!document.fullscreenElement);
      };

      const handleKeyDown = (event) => {
        if (isFullScreen) {
          switch (event.key) {
            case 'Escape':
              exitFullScreen();
              break;
            case '+':
            case '=':
              if (fileType === 'pdf') {
                setScale(prev => Math.min(3.0, prev + 0.2));
              } else if (fileType === 'image') {
                setImageScale(prev => Math.min(3.0, prev + 0.2));
              }
              break;
            case '-':
              if (fileType === 'pdf') {
                setScale(prev => Math.max(0.5, prev - 0.2));
              } else if (fileType === 'image') {
                setImageScale(prev => Math.max(0.5, prev - 0.2));
              }
              break;
            case 'ArrowLeft':
              if (fileType === 'pdf' && numPages > 1) {
                setPageNumber(prev => Math.max(1, prev - 1));
              }
              break;
            case 'ArrowRight':
              if (fileType === 'pdf' && numPages > 1) {
                setPageNumber(prev => Math.min(numPages, prev + 1));
              }
              break;
          }
        }
      };

      document.addEventListener('fullscreenchange', handleFullScreenChange);
      document.addEventListener('webkitfullscreenchange', handleFullScreenChange);
      document.addEventListener('mozfullscreenchange', handleFullScreenChange);
      document.addEventListener('MSFullscreenChange', handleFullScreenChange);
      document.addEventListener('keydown', handleKeyDown);

      return () => {
        document.removeEventListener('fullscreenchange', handleFullScreenChange);
        document.removeEventListener('webkitfullscreenchange', handleFullScreenChange);
        document.removeEventListener('mozfullscreenchange', handleFullScreenChange);
        document.removeEventListener('MSFullscreenChange', handleFullScreenChange);
        document.removeEventListener('keydown', handleKeyDown);
      };
    }, [isFullScreen, numPages, fileType]);

    // Show loading state
    if (isLoadingPreview) {
      return (
        <div className="bg-muted/30 rounded-lg border border-border flex items-center justify-center py-12">
          <div className="text-center">
            <Icon name="Loader2" size={48} className="text-primary mx-auto mb-3 animate-spin" />
            <h4 className="text-base font-medium text-foreground mb-2">Loading Preview...</h4>
            <p className="text-muted-foreground text-sm">Preparing secure file preview...</p>
          </div>
        </div>
      );
    }

    // Show error state
    if (previewError) {
      return (
        <div className="bg-muted/30 rounded-lg border border-border flex items-center justify-center py-8">
          <div className="text-center">
            <Icon name="AlertCircle" size={48} className="text-destructive mx-auto mb-3" />
            <h4 className="text-base font-medium text-foreground mb-2">Preview Error</h4>
            <p className="text-muted-foreground text-sm">{previewError}</p>
          </div>
        </div>
      );
    }

    if (!blobUrl) return null;

    // PDF Viewer
    if (fileType === 'pdf') {
      return (
        <div className="bg-muted/30 rounded-lg border border-border overflow-hidden">
          <div className="p-4 bg-background/50 border-b border-border flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Icon name="Eye" size={16} className="text-primary" />
              <span className="text-sm font-medium text-foreground">PDF Preview</span>
            </div>
            <div className="flex items-center space-x-2">
              {numPages > 1 && (
                <>
                  <Button variant="outline" size="sm" onClick={() => setPageNumber(prev => Math.max(1, prev - 1))} disabled={pageNumber <= 1}>
                    <Icon name="ChevronLeft" size={14} />
                  </Button>
                  <span className="text-sm text-foreground px-2">{pageNumber} of {numPages}</span>
                  <Button variant="outline" size="sm" onClick={() => setPageNumber(prev => Math.min(numPages, prev + 1))} disabled={pageNumber >= numPages}>
                    <Icon name="ChevronRight" size={14} />
                  </Button>
                </>
              )}
              <Button variant="outline" size="sm" onClick={() => setScale(prev => Math.max(0.5, prev - 0.2))}>
                <Icon name="ZoomOut" size={14} />
              </Button>
              <span className="text-xs text-muted-foreground">{Math.round(scale * 100)}%</span>
              <Button variant="outline" size="sm" onClick={() => setScale(prev => Math.min(2.0, prev + 0.2))}>
                <Icon name="ZoomIn" size={14} />
              </Button>
              <Button variant="outline" size="sm" onClick={toggleFullScreen} title={isFullScreen ? 'Exit Full Screen' : 'Full Screen'}>
                <Icon name={isFullScreen ? "Minimize2" : "Maximize2"} size={14} />
              </Button>
            </div>
          </div>
          <div 
            ref={pdfContainerRef}
            className={`p-4 flex justify-center bg-gray-100 overflow-auto ${
              isFullScreen ? 'fixed inset-0 z-50 bg-black flex-col justify-center items-center' : 'max-h-96'
            }`}
          >
            {/* Full-screen controls */}
            {isFullScreen && (
              <div className="absolute top-4 right-4 z-10 flex items-center space-x-2 bg-black/50 rounded-lg p-2">
                {numPages > 1 && (
                  <>
                    <Button variant="outline" size="sm" onClick={() => setPageNumber(prev => Math.max(1, prev - 1))} disabled={pageNumber <= 1}>
                      <Icon name="ChevronLeft" size={14} />
                    </Button>
                    <span className="text-sm text-white px-2">{pageNumber} of {numPages}</span>
                    <Button variant="outline" size="sm" onClick={() => setPageNumber(prev => Math.min(numPages, prev + 1))} disabled={pageNumber >= numPages}>
                      <Icon name="ChevronRight" size={14} />
                    </Button>
                  </>
                )}
                <Button variant="outline" size="sm" onClick={() => setScale(prev => Math.max(0.5, prev - 0.2))}>
                  <Icon name="ZoomOut" size={14} />
                </Button>
                <span className="text-xs text-white">{Math.round(scale * 100)}%</span>
                <Button variant="outline" size="sm" onClick={() => setScale(prev => Math.min(3.0, prev + 0.2))}>
                  <Icon name="ZoomIn" size={14} />
                </Button>
                <Button variant="outline" size="sm" onClick={toggleFullScreen} title="Exit Full Screen">
                  <Icon name="Minimize2" size={14} />
                </Button>
              </div>
            )}
            
            <Document
              file={blobUrl}
              onLoadSuccess={({ numPages }) => setNumPages(numPages)}
              loading={<Icon name="Loader2" size={32} className="animate-spin text-primary" />}
              error={<div className="text-sm text-destructive">Failed to load PDF</div>}
            >
              <Page 
                pageNumber={pageNumber} 
                scale={isFullScreen ? Math.max(scale, 1.2) : scale} 
                renderTextLayer={false} 
                renderAnnotationLayer={false} 
              />
            </Document>
          </div>
        </div>
      );
    }

    // Image Viewer
    if (fileType === 'image') {
      return (
        <div className="bg-muted/30 rounded-lg border border-border overflow-hidden">
          <div className="p-4 bg-background/50 border-b border-border flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Icon name="Eye" size={16} className="text-primary" />
              <span className="text-sm font-medium text-foreground">Image Preview</span>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={() => setImageScale(prev => Math.max(0.5, prev - 0.2))}>
                <Icon name="ZoomOut" size={14} />
              </Button>
              <span className="text-xs text-muted-foreground">{Math.round(imageScale * 100)}%</span>
              <Button variant="outline" size="sm" onClick={() => setImageScale(prev => Math.min(3.0, prev + 0.2))}>
                <Icon name="ZoomIn" size={14} />
              </Button>
              <Button variant="outline" size="sm" onClick={toggleFullScreen} title={isFullScreen ? 'Exit Full Screen' : 'Full Screen'}>
                <Icon name={isFullScreen ? "Minimize2" : "Maximize2"} size={14} />
              </Button>
            </div>
          </div>
          <div 
            ref={imageContainerRef}
            className={`p-4 flex justify-center bg-gray-50 overflow-auto ${
              isFullScreen ? 'fixed inset-0 z-50 bg-black flex-col justify-center items-center' : 'max-h-96'
            }`}
          >
            {/* Full-screen controls for images */}
            {isFullScreen && (
              <div className="absolute top-4 right-4 z-10 flex items-center space-x-2 bg-black/50 rounded-lg p-2">
                <Button variant="outline" size="sm" onClick={() => setImageScale(prev => Math.max(0.5, prev - 0.2))}>
                  <Icon name="ZoomOut" size={14} />
                </Button>
                <span className="text-xs text-white">{Math.round(imageScale * 100)}%</span>
                <Button variant="outline" size="sm" onClick={() => setImageScale(prev => Math.min(3.0, prev + 0.2))}>
                  <Icon name="ZoomIn" size={14} />
                </Button>
                <Button variant="outline" size="sm" onClick={toggleFullScreen} title="Exit Full Screen">
                  <Icon name="Minimize2" size={14} />
                </Button>
              </div>
            )}
            
            <img 
              src={blobUrl} 
              alt={file.name}
              className="object-contain rounded border shadow-sm"
              style={{
                transform: `scale(${isFullScreen ? Math.max(imageScale, 1.2) : imageScale})`,
                maxWidth: isFullScreen ? 'none' : '100%',
                maxHeight: isFullScreen ? '90vh' : '24rem',
                transition: 'transform 0.2s ease-in-out'
              }}
            />
          </div>
        </div>
      );
    }

    // Video Viewer
    if (fileType === 'video') {
      return (
        <div className="bg-muted/30 rounded-lg border border-border overflow-hidden">
          <div className="p-4 bg-background/50 border-b border-border flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Icon name="Eye" size={16} className="text-primary" />
              <span className="text-sm font-medium text-foreground">Video Preview</span>
            </div>
            <span className="text-xs text-muted-foreground">{file.name.split('.').pop()?.toUpperCase()}</span>
          </div>
          <div className="p-4">
            <video 
              controls 
              className="w-full max-h-96 bg-black rounded border shadow-sm"
              preload="metadata"
            >
              <source src={blobUrl} type={file.contentType || 'video/mp4'} />
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      );
    }

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

    const fileType = file ? getFileType(file.name, file.contentType) : 'unsupported';
    
    if (['pdf', 'image', 'video'].includes(fileType)) {
      return <AuthenticatedFileViewer file={file} currentUsername={currentUsername} />;
    }

    // Helper function for file type detection (moved outside component)
    function getFileType(fileName, contentType) {
      const extension = fileName?.split('.').pop()?.toLowerCase();
      if (contentType?.includes('pdf') || extension === 'pdf') return 'pdf';
      if (contentType?.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'].includes(extension)) return 'image';
      if (contentType?.startsWith('video/') || ['mp4', 'webm', 'ogg', 'avi', 'mov'].includes(extension)) return 'video';
      return 'unsupported';
    }

    // Fallback for unsupported files
    return (
      <div className="bg-muted/30 rounded-lg border-2 border-dashed border-border flex items-center justify-center py-6">
        <div className="text-center">
          <Icon name="FileText" size={48} className="text-muted-foreground mx-auto mb-3" />
          <h4 className="text-base font-medium text-foreground mb-2">Preview Not Available</h4>
          <p className="text-muted-foreground text-sm mb-4">
            Preview for {getHumanReadableFileType(file?.contentType, file?.name)} files is not supported yet.
          </p>
          <Button onClick={handleDownload} variant="outline">
            <Icon name="Download" size={16} className="mr-2" />
            Download File
          </Button>
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
