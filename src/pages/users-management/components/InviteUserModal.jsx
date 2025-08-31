import React, { useState } from 'react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Icon from '../../../components/AppIcon';

const InviteUserModal = ({ isOpen, onClose, availableRoles }) => {
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

  const mockDataRooms = [
    'Project Alpha',
    'Legal Documents', 
    'Financial Reports',
    'Marketing Materials'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-card rounded-xl shadow-lg border border-border max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h3 className="text-lg font-semibold text-foreground">Invite User</h3>
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
                Full Name
              </label>
              <Input
                type="text"
                value={formData?.name}
                onChange={(e) => handleInputChange('name', e?.target?.value)}
                placeholder="Enter full name"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Email Address
              </label>
              <Input
                type="email"
                value={formData?.email}
                onChange={(e) => handleInputChange('email', e?.target?.value)}
                placeholder="Enter email address"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Role
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
                Data Room Access
              </label>
              <div className="space-y-2 max-h-32 overflow-y-auto border border-input rounded-lg p-3">
                {mockDataRooms?.map((room) => (
                  <div key={room} className="flex items-center space-x-2">
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
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="sendWelcomeEmail"
                checked={formData?.sendWelcomeEmail}
                onChange={(e) => handleInputChange('sendWelcomeEmail', e?.target?.checked)}
                className="rounded border-border"
              />
              <label htmlFor="sendWelcomeEmail" className="text-sm text-foreground">
                Send welcome email
              </label>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-border">
            <Button onClick={onClose} variant="outline" disabled={isLoading}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="default" 
              disabled={isLoading}
              iconName={isLoading ? 'Loader2' : 'Send'}
            >
              {isLoading ? 'Sending...' : 'Send Invitation'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InviteUserModal;