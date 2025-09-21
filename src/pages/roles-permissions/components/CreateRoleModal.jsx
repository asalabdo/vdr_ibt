import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Icon from '../../../components/AppIcon';

const CreateRoleModal = ({ isOpen, onClose, availablePermissions }) => {
  const { t } = useTranslation('roles-permissions');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: {}
  });
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePermissionChange = (permission) => {
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev?.permissions,
        [permission]: !prev?.permissions?.[permission]
      }
    }));
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('Creating role:', formData);
    setIsLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-card rounded-xl shadow-lg border border-border max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h3 className="text-lg font-semibold text-foreground">{t('create_modal.title')}</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <Icon name="X" size={20} className="text-muted-foreground" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                {t('create_modal.role_name_label')}
              </label>
              <Input
                type="text"
                value={formData?.name}
                onChange={(e) => handleInputChange('name', e?.target?.value)}
                placeholder={t('create_modal.role_name_placeholder')}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                {t('create_modal.description_label')}
              </label>
              <textarea
                value={formData?.description}
                onChange={(e) => handleInputChange('description', e?.target?.value)}
                placeholder={t('create_modal.description_placeholder')}
                className="w-full border border-input rounded-lg px-3 py-2 bg-background text-foreground focus:ring-2 focus:ring-ring focus:border-transparent resize-none"
                rows={3}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-3">
                {t('create_modal.permissions_label')}
              </label>
              <div className="space-y-3 max-h-64 overflow-y-auto border border-input rounded-lg p-4">
                {availablePermissions?.map((permission) => (
                  <div key={permission?.name} className="flex items-start space-x-3 rtl:space-x-reverse">
                    <input
                      type="checkbox"
                      id={permission?.name}
                      checked={formData?.permissions?.[permission?.name] || false}
                      onChange={() => handlePermissionChange(permission?.name)}
                      className="rounded border-border mt-1"
                    />
                    <div className="flex-1">
                      <label 
                        htmlFor={permission?.name} 
                        className="text-sm font-medium text-foreground cursor-pointer"
                      >
                        {permission?.label}
                      </label>
                      <p className="text-xs text-muted-foreground">
                        {permission?.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 rtl:space-x-reverse pt-6 border-t border-border">
            <Button onClick={onClose} variant="outline" disabled={isLoading}>
              {t('actions.cancel')}
            </Button>
            <Button 
              type="submit" 
              variant="default" 
              disabled={isLoading}
              iconName={isLoading ? 'Loader2' : 'Plus'}
            >
              {isLoading ? t('actions.creating') : t('actions.create')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateRoleModal;
