import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const PermissionManagerModal = ({ isOpen, onClose, document }) => {
  const { t } = useTranslation('document-management-console');
  const [permissions, setPermissions] = useState({
    read: true,
    download: true,
    edit: false,
    delete: false
  });

  if (!isOpen || !document) return null;

  const handlePermissionChange = (permission) => {
    setPermissions(prev => ({
      ...prev,
      [permission]: !prev?.[permission]
    }));
  };

  const handleSave = () => {
    // Handle save permissions logic
    console.log('Saving permissions:', permissions);
    onClose();
  };

  const permissionOptions = [
    { key: 'read', labelKey: 'permissions_modal.permissions.read.label', descriptionKey: 'permissions_modal.permissions.read.description' },
    { key: 'download', labelKey: 'permissions_modal.permissions.download.label', descriptionKey: 'permissions_modal.permissions.download.description' },
    { key: 'edit', labelKey: 'permissions_modal.permissions.edit.label', descriptionKey: 'permissions_modal.permissions.edit.description' },
    { key: 'delete', labelKey: 'permissions_modal.permissions.delete.label', descriptionKey: 'permissions_modal.permissions.delete.description' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-card rounded-xl shadow-lg border border-border max-w-lg w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h3 className="text-lg font-semibold text-foreground">{t('permissions_modal.title')}</h3>
            <p className="text-sm text-muted-foreground">{document?.filename}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <Icon name="X" size={20} className="text-muted-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <div>
            <h4 className="text-sm font-medium text-foreground mb-3">{t('permissions_modal.subtitle')}</h4>
            <div className="space-y-3">
              {permissionOptions?.map((option) => (
                <div key={option?.key} className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-foreground">{t(option?.labelKey)}</div>
                    <div className="text-xs text-muted-foreground">{t(option?.descriptionKey)}</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={permissions?.[option?.key]}
                    onChange={() => handlePermissionChange(option?.key)}
                    className="rounded border-border h-4 w-4"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="bg-muted/30 rounded-lg p-4">
            <div className="text-sm font-medium text-foreground mb-2">{t('permissions_modal.current_access')}</div>
            <div className="text-xs text-muted-foreground space-y-1">
              <div>{t('permissions_modal.owner')} {document?.owner?.name}</div>
              <div>{t('permissions_modal.room')} {document?.room}</div>
              <div>{t('permissions_modal.status')} {document?.status}</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 rtl:space-x-reverse p-6 border-t border-border">
          <Button onClick={onClose} variant="outline">
            {t('actions.cancel')}
          </Button>
          <Button onClick={handleSave} variant="default">
            {t('actions.save_changes')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PermissionManagerModal;