import React from 'react';
import { useTranslation } from 'react-i18next';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const BulkActionToolbar = ({ selectedCount, onClearSelection }) => {
  const { t } = useTranslation('document-management-console');
  const handleBulkDownload = () => {
    console.log('Bulk download initiated');
  };

  const handleBulkDelete = () => {
    console.log('Bulk delete initiated');
  };

  const handleBulkApprove = () => {
    console.log('Bulk approve initiated');
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
          <Button onClick={handleBulkDownload} iconName="Download" variant="outline" size="sm">
            {t('actions.download_all')}
          </Button>
          <Button onClick={handleBulkApprove} iconName="CheckCircle" variant="outline" size="sm">
            {t('actions.approve')}
          </Button>
          <Button onClick={handleBulkDelete} iconName="Trash2" variant="destructive" size="sm">
            {t('actions.delete')}
          </Button>
          <button
            onClick={onClearSelection}
            className="p-2 text-muted-foreground hover:text-foreground transition-colors"
            title={t('actions.clear_selection')}
          >
            <Icon name="X" size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default BulkActionToolbar;