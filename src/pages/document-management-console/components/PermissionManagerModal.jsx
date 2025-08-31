import React, { useState } from 'react';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const PermissionManagerModal = ({ isOpen, onClose, document }) => {
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
    { key: 'read', label: 'Read', description: 'View document content' },
    { key: 'download', label: 'Download', description: 'Download document files' },
    { key: 'edit', label: 'Edit', description: 'Modify document content' },
    { key: 'delete', label: 'Delete', description: 'Remove document from system' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-card rounded-xl shadow-lg border border-border max-w-lg w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Manage Permissions</h3>
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
            <h4 className="text-sm font-medium text-foreground mb-3">Document Permissions</h4>
            <div className="space-y-3">
              {permissionOptions?.map((option) => (
                <div key={option?.key} className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-foreground">{option?.label}</div>
                    <div className="text-xs text-muted-foreground">{option?.description}</div>
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
            <div className="text-sm font-medium text-foreground mb-2">Current Access</div>
            <div className="text-xs text-muted-foreground space-y-1">
              <div>Owner: {document?.owner?.name}</div>
              <div>Room: {document?.room}</div>
              <div>Status: {document?.status}</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-border">
          <Button onClick={onClose} variant="outline">
            Cancel
          </Button>
          <Button onClick={handleSave} variant="default">
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PermissionManagerModal;