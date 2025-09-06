import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Icon from '../../../components/AppIcon';

const InviteUserModal = ({ isOpen, onClose, availableRoles }) => {
  const { t } = useTranslation('users-management');
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    role: availableRoles?.[0] || '',
    dataRooms: [],
    sendWelcomeEmail: true
  });
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('Inviting user:', formData);
    setIsLoading(false);
    onClose();
  };

  const mockDataRoomsKeys = [
    'mock_data.data_rooms.project_alpha',
    'mock_data.data_rooms.legal_documents', 
    'mock_data.data_rooms.financial_reports',
    'mock_data.data_rooms.marketing_materials'
  ];

  const mockDataRooms = mockDataRoomsKeys.map(key => t(key));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-card rounded-xl shadow-lg border border-border max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h3 className="text-lg font-semibold text-foreground">{t('invite_modal.title')}</h3>
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
                {t('invite_modal.full_name_label')}
              </label>
              <Input
                type="text"
                value={formData?.name}
                onChange={(e) => handleInputChange('name', e?.target?.value)}
                placeholder={t('invite_modal.full_name_placeholder')}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                {t('invite_modal.email_label')}
              </label>
              <Input
                type="email"
                value={formData?.email}
                onChange={(e) => handleInputChange('email', e?.target?.value)}
                placeholder={t('invite_modal.email_placeholder')}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                {t('invite_modal.role_label')}
              </label>
              <select
                value={formData?.role}
                onChange={(e) => handleInputChange('role', e?.target?.value)}
                className="w-full border border-input rounded-lg px-3 py-2 bg-background text-foreground focus:ring-2 focus:ring-ring focus:border-transparent"
                required
              >
                {availableRoles?.map((role) => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                {t('invite_modal.data_room_access_label')}
              </label>
              <div className="space-y-2 max-h-32 overflow-y-auto border border-input rounded-lg p-3">
                {mockDataRooms?.map((room) => (
                  <div key={room} className="flex items-center space-x-2 rtl:space-x-reverse">
                    <input
                      type="checkbox"
                      id={room}
                      checked={formData?.dataRooms?.includes(room)}
                      onChange={(e) => {
                        if (e?.target?.checked) {
                          handleInputChange('dataRooms', [...formData?.dataRooms, room]);
                        } else {
                          handleInputChange('dataRooms', formData?.dataRooms?.filter(r => r !== room));
                        }
                      }}
                      className="rounded border-border"
                    />
                    <label htmlFor={room} className="text-sm text-foreground">{room}</label>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <input
                type="checkbox"
                id="sendWelcomeEmail"
                checked={formData?.sendWelcomeEmail}
                onChange={(e) => handleInputChange('sendWelcomeEmail', e?.target?.checked)}
                className="rounded border-border"
              />
              <label htmlFor="sendWelcomeEmail" className="text-sm text-foreground">
                {t('invite_modal.send_welcome_email')}
              </label>
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
              iconName={isLoading ? 'Loader2' : 'Send'}
            >
              {isLoading ? t('actions.sending') : t('actions.send_invitation')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InviteUserModal;