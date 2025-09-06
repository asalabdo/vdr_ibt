import React from 'react';
import { useTranslation } from 'react-i18next';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const DocumentPreviewModal = ({ isOpen, onClose, document }) => {
  const { t } = useTranslation('document-management-console');
  if (!isOpen || !document) return null;

  const handleDownload = () => {
    // Handle download logic
    console.log('Downloading document:', document?.filename);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-card rounded-xl shadow-lg border border-border max-w-4xl w-full max-h-[90vh] mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <span className="text-2xl">{document?.thumbnail}</span>
            <div>
              <h3 className="text-lg font-semibold text-foreground">{document?.filename}</h3>
              <p className="text-sm text-muted-foreground">
                {document?.fileType?.split('/')?.pop()?.toUpperCase()} • {document?.room}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <Button onClick={handleDownload} iconName="Download" variant="outline" size="sm">
              {t('actions.download')}
            </Button>
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
          <div className="bg-muted/30 rounded-lg border-2 border-dashed border-border flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Icon name="FileText" size={64} className="text-muted-foreground mx-auto mb-4" />
              <h4 className="text-lg font-medium text-foreground mb-2">{t('preview_modal.title')}</h4>
              <p className="text-muted-foreground mb-4">
                {t('preview_modal.description', { fileType: document?.fileType?.split('/')?.pop()?.toUpperCase() })}
              </p>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>{t('preview_modal.file_size')} {Math.round(document?.size / 1024 / 1024 * 100) / 100} MB</p>
                <p>{t('preview_modal.version')} {document?.version}</p>
                <p>{t('preview_modal.downloads')} {document?.downloadCount}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentPreviewModal;