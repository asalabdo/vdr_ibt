import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { useListFiles, useDownloadFile, useDeleteItem } from '@/hooks/api';
import { useAuthStatus, usePermissions } from '@/hooks/api';
import Header from '../../components/ui/header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import Icon from '../../components/AppIcon';
import FilePreviewModal from './components/FilePreviewModal';
import PermissionManagerModal from './components/PermissionManagerModal';
import FileUploadModal from './components/FileUploadModal';

const FilesManagementConsole = () => {
  const { t } = useTranslation('document-management-console');
  const location = useLocation();
  
  // Get user permissions for document operations
  const {
    canUploadDocuments,
    canDeleteDocuments,
    hasPermission
  } = usePermissions();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [sortConfig, setSortConfig] = useState({ key: 'lastModified', direction: 'desc' });
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [currentPath, setCurrentPath] = useState('/');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Read initial path from React Router state or URL parameters (for data room navigation)
  useEffect(() => {
    // First check if we have room data from navigation state (clean URL approach)
    if (location.state?.roomPath) {
      setCurrentPath(`/${location.state.roomPath}`);
      return;
    }
    
    // Fallback to URL parameters for backward compatibility
    const searchParams = new URLSearchParams(location.search);
    const pathParam = searchParams.get('path');
    if (pathParam) {
      try {
        const decodedPath = decodeURIComponent(pathParam);
        setCurrentPath(decodedPath);
      } catch (error) {
        console.warn('Failed to decode path parameter:', pathParam);
        setCurrentPath('/');
      }
    }
  }, [location.search, location.state]);

  // Fetch files using the API (following the pattern from other pages)
  // Get current username from auth context or fallback to environment
  const { username: authUsername } = useAuthStatus();
  const currentUsername = authUsername || import.meta.env.VITE_DEV_USERNAME || 'eslam';

  const {
    data: filesData, 
    isLoading, 
    error, 
    refetch 
  } = useListFiles(currentUsername, currentPath, {
    search: searchQuery 
  });

  // Download file mutation
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
      
      toast.success(t('actions.download_success', { 
        defaultValue: 'File downloaded successfully!' 
      }));
    },
    onError: (error) => {
      toast.error(t('actions.download_error', { 
        defaultValue: 'Failed to download file' 
      }), {
        description: error.message,
      });
    }
  });

  // Delete file mutation
  const deleteFileMutation = useDeleteItem({
    onSuccess: (data, variables) => {
      toast.success(t('actions.delete_success', { 
        defaultValue: 'File deleted successfully!' 
      }));
      // Refresh the file list
      refetch();
    },
    onError: (error) => {
      toast.error(t('actions.delete_error', { 
        defaultValue: 'Failed to delete file' 
      }), {
        description: error.message,
      });
    }
  });

  // Get files from API response
  const files = filesData?.files || [];

  // Utility functions
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i))?.toFixed(2)) + ' ' + sizes?.[i];
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

  const getFileStatus = (file) => {
    // For now, we'll consider all files as approved since Nextcloud doesn't have built-in approval workflow
    // This can be extended with custom metadata or external systems
    return 'approved';
  };

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diff = Math.floor((now - date) / 1000);

    if (diff < 60) return t('time.just_now');
    if (diff < 3600) return t('time.minutes_ago', { count: Math.floor(diff / 60) });
    if (diff < 86400) return t('time.hours_ago', { count: Math.floor(diff / 3600) });
    return t('time.days_ago', { count: Math.floor(diff / 86400) });
  };

  // Filter files based on search and filters (API already handles search partially)
  const filteredFiles = files?.filter(file => {
    const matchesSearch = !searchQuery || 
      file?.name?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
      file?.path?.toLowerCase()?.includes(searchQuery?.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || 
      (selectedFilter === 'approved' && getFileStatus(file) === 'approved') ||
      (selectedFilter === 'folders' && file?.isDirectory) ||
      (selectedFilter === 'files' && !file?.isDirectory);
    
    return matchesSearch && matchesFilter;
  });

  // Sort files
  const sortedFiles = [...(filteredFiles || [])]?.sort((a, b) => {
    let aValue, bValue;
    
    switch (sortConfig?.key) {
      case 'name':
        aValue = a?.name?.toLowerCase();
        bValue = b?.name?.toLowerCase();
        break;
      case 'size':
        aValue = a?.size || 0;
        bValue = b?.size || 0;
        break;
      case 'lastModified':
        aValue = new Date(a?.lastModified || 0);
        bValue = new Date(b?.lastModified || 0);
        break;
      default:
        aValue = a?.name?.toLowerCase();
        bValue = b?.name?.toLowerCase();
    }
    
    if (sortConfig?.direction === 'asc') {
      return aValue > bValue ? 1 : -1;
    }
    return aValue < bValue ? 1 : -1;
  });

  // Calculate stats from real file data
  const stats = {
    total: files?.length || 0,
    folders: files?.filter(file => file?.isDirectory)?.length || 0,
    files: files?.filter(file => !file?.isDirectory)?.length || 0,
    totalSize: files?.reduce((sum, file) => sum + (file?.size || 0), 0) || 0,
  };

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev?.key === key && prev?.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleFilePreview = (file) => {
    setSelectedFile(file);
    setIsPreviewModalOpen(true);
  };

  const handlePermissionManager = (file) => {
    setSelectedFile(file);
    setIsPermissionModalOpen(true);
  };

  const handleFileDownload = (file) => {
    if (file?.isDirectory) {
      toast.info(t('actions.folder_download_info', { 
        defaultValue: 'Folder download as ZIP will be implemented soon' 
      }));
      return;
    }

    // Extract relative path from full WebDAV path for download
    const relativePath = file.path.replace(/^\/remote\.php\/dav\/files\/[^/]+/, '') || `/${file.name}`;
    
    downloadFileMutation.mutate({
      username: currentUsername,
      filePath: relativePath,
      responseType: 'blob'
    });
  };

  const handleFileDelete = (file) => {
    setDeleteTarget({ file });
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      // Single file/folder deletion
      const file = deleteTarget.file;
      const relativePath = file.path.replace(/^\/remote\.php\/dav\/files\/[^/]+/, '') || `/${file.name}`;
      
      await deleteFileMutation.mutateAsync({
        username: currentUsername,
        itemPath: relativePath
      });
    } catch (error) {
      // Error handling is managed by the mutation's onError
    } finally {
      setIsDeleteDialogOpen(false);
      setDeleteTarget(null);
    }
  };

  const cancelDelete = () => {
    setIsDeleteDialogOpen(false);
    setDeleteTarget(null);
  };

  // Folder navigation handlers
  const handleFolderNavigation = (folder) => {
    if (!folder?.isDirectory) return;
    
    // Extract the relative path from the WebDAV path
    const relativePath = folder.path.replace(/^\/remote\.php\/dav\/files\/[^/]+/, '') || `/${folder.name}`;
    const cleanPath = relativePath.replace(/\/+/g, '/'); // Clean up multiple slashes
    
    setCurrentPath(cleanPath);
    setSearchQuery(''); // Clear search when navigating
  };

  const handleNavigateUp = () => {
    const pathParts = currentPath.split('/').filter(Boolean);
    if (pathParts.length > 0) {
      pathParts.pop(); // Remove last directory
      const newPath = '/' + pathParts.join('/');
      setCurrentPath(newPath === '/' ? '/' : newPath);
      setSearchQuery('');
    }
  };

  const handleNavigateHome = () => {
    setCurrentPath('/');
    setSearchQuery('');
  };

  const handleNavigateToPath = (targetPath) => {
    setCurrentPath(targetPath || '/');
    setSearchQuery('');
  };

  const handleDragOver = (e) => {
    e?.preventDefault();
    // Only allow drag over if user has upload permission
    if (canUploadDocuments) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e) => {
    e?.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    setIsDragOver(false);
    
    // Only handle file drops if user has upload permission
    if (!canUploadDocuments) {
      return;
    }
    
    // Handle file drop for upload
    const files = Array.from(e?.dataTransfer?.files || []);
    if (files.length > 0) {
      // Open upload modal with dropped files
      setIsUploadModalOpen(true);
      console.log('Files dropped:', files);
    }
  };

  // Upload modal handlers
  const handleUploadModalOpen = () => {
    setIsUploadModalOpen(true);
  };

  const handleUploadModalClose = () => {
    setIsUploadModalOpen(false);
  };

  const handleUploadComplete = () => {
    // Refresh the file list after successful uploads
    refetch();
  };

  // Loading state (following the pattern from other pages)
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-4">
          <div className="max-w-full mx-auto px-6 py-8">
            {/* Header Skeleton */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
              <div className="mb-4 lg:mb-0">
                <Skeleton className="h-9 w-64 mb-2" />
                <Skeleton className="h-5 w-48" />
              </div>
              <div className="flex items-center space-x-2">
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-10 w-32" />
              </div>
            </div>
            
            <Separator className="my-8" />
            
            {/* Stats Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-card rounded-lg shadow-sm border border-border p-4">
                  <div className="flex items-center space-x-3">
                    <Skeleton className="w-10 h-10 rounded-lg" />
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-6 w-8" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Table Skeleton */}
            <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
              <div className="p-4 border-b">
                <Skeleton className="h-8 w-full" />
              </div>
              <div className="divide-y">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="p-4 flex items-center space-x-4">
                    <Skeleton className="w-4 h-4" />
                    <Skeleton className="w-8 h-8" />
                    <div className="flex-1 space-y-1">
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-8 w-20" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Error state (following the pattern from other pages)
  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-4">
          <div className="max-w-full mx-auto px-6 py-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
              <div className="mb-4 lg:mb-0">
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  {t('title')}
                </h1>
                <p className="text-muted-foreground">
                  {t('subtitle')}
                </p>
              </div>
            </div>
            
            <Separator className="my-8" />
            
            <Alert variant="destructive">
              <Icon name="AlertCircle" size={16} />
              <AlertDescription className="flex items-center justify-between">
                <span>{t('errors.loading_failed', { defaultValue: 'Failed to load files' })}: {error.message}</span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => refetch()}
                  className="ml-4 gap-1"
                >
                  <Icon name="RefreshCw" size={14} />
                  {t('actions.retry', { defaultValue: 'Retry' })}
                </Button>
              </AlertDescription>
            </Alert>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-4">
        <div className="max-w-full mx-auto px-6 py-8">
          {/* Header Section */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
            <div className="mb-4 lg:mb-0">
              <h1 className="text-3xl font-bold text-foreground mb-2">
                {t('title')}
              </h1>
              <p className="text-muted-foreground">
                {t('subtitle')}
              </p>
            </div>
            
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              {/* Upload button - Only show if user has upload permission */}
              {canUploadDocuments && (
                <Button 
                  onClick={handleUploadModalOpen}
                  variant="default"
                  className="gap-2"
                >
                  <Icon name="Upload" className="w-4 h-4" />
                  {t('actions.upload_files', { defaultValue: 'Upload Files' })}
                </Button>
              )}
            </div>
          </div>

          {/* Breadcrumb Navigation */}
          <div className="mb-4">
            <nav className="flex items-center space-x-2 rtl:space-x-reverse text-sm">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleNavigateHome}
                className="text-muted-foreground hover:text-foreground p-1 h-8"
              >
                <Icon name="Home" size={16} />
              </Button>
              
              {currentPath !== '/' && (
                <>
                  <Icon name="ChevronRight" size={14} className="text-muted-foreground rtl:rotate-180" />
                  
                  {currentPath.split('/').filter(Boolean).map((segment, index, array) => {
                    const isLast = index === array.length - 1;
                    const segmentPath = '/' + array.slice(0, index + 1).join('/');
                    
                    return (
                      <div key={segmentPath} className="flex items-center space-x-2 rtl:space-x-reverse">
                        {isLast ? (
                          <span className="text-foreground font-medium">{segment}</span>
                        ) : (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleNavigateToPath(segmentPath)}
                              className="text-muted-foreground hover:text-foreground p-1 h-8 text-sm"
                            >
                              {segment}
                            </Button>
                            <Icon name="ChevronRight" size={14} className="text-muted-foreground rtl:rotate-180" />
                          </>
                        )}
                      </div>
                    );
                  })}
                </>
              )}
              
              {/* Back Button */}
              {currentPath !== '/' && (
                <div className="flex-1 flex justify-end">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleNavigateUp}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <Icon name="ArrowLeft" size={16} className="rtl:rotate-180" />
                    <span className="ml-1 rtl:ml-0 rtl:mr-1">
                      {t('navigation.back', { defaultValue: 'Back' })}
                    </span>
                  </Button>
                </div>
              )}
            </nav>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-card rounded-lg shadow-sm border border-border p-4">
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Icon name="FileText" size={20} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {t('stats.total_files', { defaultValue: 'Total Items' })}
                  </p>
                  <p className="text-2xl font-bold text-foreground">{stats?.total}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-card rounded-lg shadow-sm border border-border p-4">
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Icon name="FileText" size={20} className="text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {t('stats.files', { defaultValue: 'Files' })}
                  </p>
                  <p className="text-2xl font-bold text-foreground">{stats?.files}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-card rounded-lg shadow-sm border border-border p-4">
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center">
                  <Icon name="Folder" size={20} className="text-warning" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {t('stats.folders', { defaultValue: 'Folders' })}
                  </p>
                  <p className="text-2xl font-bold text-foreground">{stats?.folders}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-card rounded-lg shadow-sm border border-border p-4">
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Icon name="HardDrive" size={20} className="text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {t('stats.total_size', { defaultValue: 'Total Size' })}
                  </p>
                  <p className="text-2xl font-bold text-foreground">{formatFileSize(stats?.totalSize)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filter Controls */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Icon name="Search" size={20} className="absolute left-3 rtl:right-3 rtl:left-auto top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder={t('search.placeholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e?.target?.value || '')}
                className="pl-10 rtl:pr-10 rtl:pl-3"
              />
            </div>
            
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <Icon name="Filter" size={16} className="text-muted-foreground" />
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e?.target?.value)}
                className="border border-input rounded-lg px-3 py-2 bg-background text-foreground focus:ring-2 focus:ring-ring focus:border-transparent"
              >
                <option value="all">{t('filters.all_items', { defaultValue: 'All Items' })}</option>
                <option value="files">{t('filters.files_only', { defaultValue: 'Files Only' })}</option>
                <option value="folders">{t('filters.folders_only', { defaultValue: 'Folders Only' })}</option>
              </select>
            </div>
          </div>

          {/* Document Table */}
          <div 
            className={`bg-card rounded-xl shadow-sm border border-border overflow-hidden ${
              isDragOver ? 'border-primary border-2 bg-primary/5' : ''
            }`}
            // Only enable drag and drop if user has upload permission
            {...(canUploadDocuments && {
              onDragOver: handleDragOver,
              onDragLeave: handleDragLeave,
              onDrop: handleDrop
            })}
          >
            {isDragOver && (
              <div className="absolute inset-0 bg-primary/10 flex items-center justify-center z-10">
                <div className="text-center">
                  <Icon name="Upload" size={48} className="text-primary mx-auto mb-4" />
                  <p className="text-lg font-medium text-primary">{t('drag_drop.title')}</p>
                </div>
              </div>
            )}
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50 border-b border-border">
                  <tr>
                    <th 
                      className="text-left py-3 px-4 font-medium text-foreground cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => handleSort('name')}
                    >
                      <div className="flex items-center space-x-1 rtl:space-x-reverse">
                        <span>{t('table.headers.name', { defaultValue: 'Name' })}</span>
                        {sortConfig?.key === 'name' && (
                          <Icon 
                            name={sortConfig?.direction === 'asc' ? 'ChevronUp' : 'ChevronDown'} 
                            size={16} 
                            className="text-muted-foreground"
                          />
                        )}
                      </div>
                    </th>
                    <th 
                      className="text-left py-3 px-4 font-medium text-foreground cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => handleSort('type')}
                    >
                      <div className="flex items-center space-x-1 rtl:space-x-reverse">
                        <span>{t('table.headers.type', { defaultValue: 'Type' })}</span>
                        {sortConfig?.key === 'type' && (
                          <Icon 
                            name={sortConfig?.direction === 'asc' ? 'ChevronUp' : 'ChevronDown'} 
                            size={16} 
                            className="text-muted-foreground"
                          />
                        )}
                      </div>
                    </th>
                    <th 
                      className="text-left py-3 px-4 font-medium text-foreground cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => handleSort('size')}
                    >
                      <div className="flex items-center space-x-1 rtl:space-x-reverse">
                        <span>{t('table.headers.size')}</span>
                        {sortConfig?.key === 'size' && (
                          <Icon 
                            name={sortConfig?.direction === 'asc' ? 'ChevronUp' : 'ChevronDown'} 
                            size={16} 
                            className="text-muted-foreground"
                          />
                        )}
                      </div>
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-foreground">
                      {t('table.headers.path', { defaultValue: 'Path' })}
                    </th>
                    <th 
                      className="text-left py-3 px-4 font-medium text-foreground cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => handleSort('lastModified')}
                    >
                      <div className="flex items-center space-x-1 rtl:space-x-reverse">
                        <span>{t('table.headers.modified', { defaultValue: 'Modified' })}</span>
                        {sortConfig?.key === 'lastModified' && (
                          <Icon 
                            name={sortConfig?.direction === 'asc' ? 'ChevronUp' : 'ChevronDown'} 
                            size={16} 
                            className="text-muted-foreground"
                          />
                        )}
                      </div>
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-foreground">
                      {t('table.headers.actions', { defaultValue: 'Actions' })}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {sortedFiles?.map((file) => (
                    <tr key={file?.path} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4">
                        <div 
                          className={`flex items-center space-x-3 rtl:space-x-reverse ${
                            file?.isDirectory 
                              ? 'cursor-pointer hover:bg-muted/30 rounded-md p-2 -m-2 transition-colors' 
                              : ''
                          }`}
                          onClick={file?.isDirectory ? () => handleFolderNavigation(file) : undefined}
                        >
                          <span className="text-2xl">{getFileIcon(file?.contentType, file?.isDirectory)}</span>
                          <div>
                            <p className={`font-medium ${
                              file?.isDirectory 
                                ? 'text-primary hover:text-primary/80' 
                                : 'text-foreground'
                            }`}>
                              {file?.name}
                              {file?.isDirectory && (
                                <Icon name="ChevronRight" size={14} className="inline ml-1 rtl:ml-0 rtl:mr-1 rtl:rotate-180" />
                              )}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {file?.isDirectory ? t('file_types.folder', { defaultValue: 'Folder' }) : 
                               file?.contentType?.split('/')?.pop()?.toUpperCase() || t('file_types.file', { defaultValue: 'File' })}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-foreground">
                          {file?.isDirectory ? t('file_types.folder', { defaultValue: 'Folder' }) : t('file_types.file', { defaultValue: 'File' })}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-muted-foreground">
                          {file?.isDirectory ? '-' : formatFileSize(file?.size || 0)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm text-foreground">
                          <span className="font-mono text-xs bg-muted px-2 py-1 rounded">
                            {file?.path?.length > 30 ? '...' + file?.path.slice(-30) : file?.path}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-muted-foreground">
                          {file?.lastModified ? formatTimeAgo(file?.lastModified) : '-'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2 rtl:space-x-reverse">
                          {/* Preview - Available to all users with document view access */}
                          {!file?.isDirectory && hasPermission('documents.view') && (
                            <button
                              onClick={() => handleFilePreview(file)}
                              className="p-1 text-muted-foreground hover:text-primary transition-colors"
                              title={t('tooltips.preview_file', { defaultValue: 'Preview file' })}
                            >
                              <Icon name="Eye" size={16} />
                            </button>
                          )}
                          
                          {/* Download - Available to users with download permission */}
                          {hasPermission('documents.download') && (
                            <button
                              onClick={() => handleFileDownload(file)}
                              className="p-1 text-muted-foreground hover:text-success transition-colors"
                              title={t('tooltips.download_file', { defaultValue: 'Download file' })}
                            >
                              <Icon name="Download" size={16} />
                            </button>
                          )}
                          
                          {/* Manage Permissions - Only for users with edit/admin permissions */}
                          {(hasPermission('documents.edit') || hasPermission('data_rooms.manage')) && (
                            <button
                              onClick={() => handlePermissionManager(file)}
                              className="p-1 text-muted-foreground hover:text-warning transition-colors"
                              title={t('tooltips.manage_permissions', { defaultValue: 'Manage permissions' })}
                            >
                              <Icon name="Share" size={16} />
                            </button>
                          )}
                          
                          {/* Delete - Only for users with delete permission */}
                          {canDeleteDocuments && (
                            <button
                              onClick={() => handleFileDelete(file)}
                              className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                              title={file?.isDirectory 
                                ? t('tooltips.delete_folder', { defaultValue: 'Delete folder' })
                                : t('tooltips.delete_file', { defaultValue: 'Delete file' })
                              }
                              disabled={deleteFileMutation.isPending}
                            >
                              {deleteFileMutation.isPending ? (
                                <Icon name="Loader2" size={16} className="animate-spin" />
                              ) : (
                                <Icon name="Trash2" size={16} />
                              )}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Empty State */}
            {sortedFiles?.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon name="FileText" size={32} className="text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">
                  {t('search.no_results_title', { defaultValue: 'No files found' })}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery || selectedFilter !== 'all' 
                    ? t('search.no_results_description', { defaultValue: 'No files match your search criteria. Try adjusting your search terms or filters.' })
                    : t('search.empty_state_description', { defaultValue: 'This directory is empty. Upload files or create folders to get started.' })
                  }
                </p>
                {/* Upload button - Only show if user has upload permission */}
                {canUploadDocuments && (
                  <Button variant="default" onClick={handleUploadModalOpen}>
                    <Icon name="Upload" className="w-4 h-4 mr-2" />
                    {t('actions.upload_file', { defaultValue: 'Upload Files' })}
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
      {/* Modals */}
      <FilePreviewModal
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        file={selectedFile}
      />
      <PermissionManagerModal
        isOpen={isPermissionModalOpen}
        onClose={() => setIsPermissionModalOpen(false)}
        file={selectedFile}
      />
      <FileUploadModal
        isOpen={isUploadModalOpen}
        onClose={handleUploadModalClose}
        currentPath={currentPath}
        onUploadComplete={handleUploadComplete}
      />
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Icon name="AlertTriangle" size={20} className="text-destructive" />
              {deleteTarget?.file?.isDirectory 
                ? t('actions.delete_folder_title', { defaultValue: 'Delete Folder' })
                : t('actions.delete_file_title', { defaultValue: 'Delete File' })
              }
            </AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget?.file?.isDirectory ? (
                <span>
                  {t('actions.delete_folder_confirm', { 
                    defaultValue: 'Are you sure you want to delete the folder "{{folderName}}" and all its contents? This action cannot be undone.',
                    folderName: deleteTarget?.file?.name
                  })}
                </span>
              ) : (
                <span>
                  {t('actions.delete_file_confirm', { 
                    defaultValue: 'Are you sure you want to delete "{{fileName}}"? This action cannot be undone.',
                    fileName: deleteTarget?.file?.name
                  })}
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelDelete}>
              {t('actions.cancel', { defaultValue: 'Cancel' })}
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteFileMutation.isPending}
            >
              {deleteFileMutation.isPending ? (
                <>
                  <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                  {t('actions.deleting', { defaultValue: 'Deleting...' })}
                </>
              ) : (
                <>
                  <Icon name="Trash2" size={16} className="mr-2" />
                  {t('actions.delete', { defaultValue: 'Delete' })}
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default FilesManagementConsole;
