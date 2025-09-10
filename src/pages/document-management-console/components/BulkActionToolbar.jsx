import React from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useDeleteItem, useDownloadFile } from '@/hooks/api';
import { useAuthStatus } from '@/hooks/api';
import { Button } from '@/components/ui/Button';
import Icon from '../../../components/AppIcon';

const BulkActionToolbar = ({ selectedCount, selectedFiles, onClearSelection }) => {
  const { t } = useTranslation('document-management-console');
  
  // Get current username from auth context or fallback to environment
  const { username: authUsername } = useAuthStatus();
  const currentUsername = authUsername || import.meta.env.VITE_DEV_USERNAME || 'eslam';
  
  // Bulk delete mutation
  const deleteItemMutation = useDeleteItem({
    onSuccess: () => {
      toast.success(t('bulk_actions.delete_success', { 
        defaultValue: 'Files deleted successfully!',
        count: selectedCount 
      }));
      onClearSelection();
    },
    onError: (error) => {
      toast.error(t('bulk_actions.delete_error', { defaultValue: 'Failed to delete files' }), {
        description: error.message,
      });
    }
  });

  // Bulk download mutation
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
      
      toast.success(t('bulk_actions.download_success', { 
        defaultValue: 'File downloaded successfully!',
        count: 1
      }));
    },
    onError: (error) => {
      toast.error(t('bulk_actions.download_error', { 
        defaultValue: 'Failed to download file' 
      }), {
        description: error.message,
      });
    }
  });

  const handleBulkDownload = async () => {
    if (!selectedFiles || selectedFiles.length === 0) return;

    try {
      // For now, download files individually
      // TODO: Implement ZIP bulk download for multiple files
      if (selectedFiles.length === 1) {
        const filePath = selectedFiles[0];
        // Extract relative path from full WebDAV path
        const relativePath = filePath.replace(/^\/remote\.php\/dav\/files\/[^/]+/, '') || filePath;
        
        downloadFileMutation.mutate({
          username: currentUsername,
          filePath: relativePath,
          responseType: 'blob'
        });
      } else {
        toast.info(t('bulk_actions.multiple_download_info', { 
          defaultValue: 'Multiple file download as ZIP will be implemented soon',
          count: selectedCount 
        }));
      }
    } catch (error) {
      console.error('Bulk download error:', error);
      toast.error(t('bulk_actions.download_error', { 
        defaultValue: 'Failed to download files' 
      }));
    }
  };

  const handleBulkDelete = () => {
    if (!selectedFiles || selectedFiles.length === 0) return;
    
    // Show confirmation
    if (window.confirm(t('bulk_actions.delete_confirm', { 
      defaultValue: 'Are you sure you want to delete {{count}} selected files? This action cannot be undone.',
      count: selectedCount 
    }))) {
      // For now, delete the first file as an example
      // TODO: Implement actual bulk delete
      deleteItemMutation.mutate({
        username: currentUsername,
        path: selectedFiles[0]
      });
    }
  };

  const handleBulkMove = () => {
    toast.info(t('bulk_actions.move_info', { 
      defaultValue: 'Bulk move functionality will be implemented',
      count: selectedCount 
    }));
    console.log('Bulk move initiated for:', selectedFiles);
  };

  return (
    <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <Icon name="CheckCircle" size={20} className="text-primary" />
          <span className="text-sm font-medium text-primary">
            {selectedCount === 1 
              ? t('bulk_actions.selected_singular', { count: selectedCount })
              : t('bulk_actions.selected_plural', { count: selectedCount })
            }
          </span>
        </div>
        
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <Button 
            onClick={handleBulkDownload} 
            variant="outline" 
            size="sm"
            disabled={deleteItemMutation.isPending || downloadFileMutation.isPending}
          >
            <Icon name="Download" className="w-4 h-4 mr-2" />
            {downloadFileMutation.isPending && (
              <Icon name="Loader2" size={14} className="animate-spin mr-1" />
            )}
            {t('actions.download_all', { defaultValue: 'Download All' })}
          </Button>
          <Button 
            onClick={handleBulkMove} 
            variant="outline" 
            size="sm"
            disabled={deleteItemMutation.isPending}
          >
            <Icon name="Move" className="w-4 h-4 mr-2" />
            {t('actions.move', { defaultValue: 'Move' })}
          </Button>
          <Button 
            onClick={handleBulkDelete} 
            variant="destructive" 
            size="sm"
            disabled={deleteItemMutation.isPending}
            className="gap-2"
          >
            <Icon name="Trash2" className="w-4 h-4" />
            {deleteItemMutation.isPending && (
              <Icon name="Loader2" size={14} className="animate-spin" />
            )}
            {t('actions.delete', { defaultValue: 'Delete' })}
          </Button>
          <button
            onClick={onClearSelection}
            className="p-2 text-muted-foreground hover:text-foreground transition-colors"
            title={t('actions.clear_selection', { defaultValue: 'Clear selection' })}
            disabled={deleteItemMutation.isPending}
          >
            <Icon name="X" size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default BulkActionToolbar;
