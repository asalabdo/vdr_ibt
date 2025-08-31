import React, { useState } from 'react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Icon from '../../../components/AppIcon';

const SecuritySettings = () => {
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    sessionTimeout: 60,
    loginNotifications: true,
    suspiciousActivityAlerts: true
  });

  const handlePasswordChange = (field, value) => {
    setPasswordForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSettingChange = (setting, value) => {
    setSecuritySettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const handlePasswordSubmit = (e) => {
    e?.preventDefault();
    console.log('Changing password...');
    setPasswordForm({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  };

  const handleSave = () => {
    console.log('Saving security settings:', securitySettings);
  };

  return (
    <div className="space-y-6">
      {/* Password Change */}
      <div className="bg-card rounded-xl shadow-sm border border-border p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <Icon name="Lock" size={20} className="text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Change Password</h3>
            <p className="text-sm text-muted-foreground">Update your account password</p>
          </div>
        </div>

        <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Current Password
            </label>
            <Input
              type="password"
              value={passwordForm?.currentPassword}
              onChange={(e) => handlePasswordChange('currentPassword', e?.target?.value)}
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              New Password
            </label>
            <Input
              type="password"
              value={passwordForm?.newPassword}
              onChange={(e) => handlePasswordChange('newPassword', e?.target?.value)}
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Confirm New Password
            </label>
            <Input
              type="password"
              value={passwordForm?.confirmPassword}
              onChange={(e) => handlePasswordChange('confirmPassword', e?.target?.value)}
              required
            />
          </div>

          <Button type="submit" variant="default" iconName="Key">
            Update Password
          </Button>
        </form>
      </div>
      {/* Two-Factor Authentication */}
      <div className="bg-card rounded-xl shadow-sm border border-border p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
            <Icon name="Shield" size={20} className="text-success" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Two-Factor Authentication</h3>
            <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-foreground">Enable 2FA</div>
            <div className="text-xs text-muted-foreground">Require authentication code in addition to password</div>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={securitySettings?.twoFactorAuth}
              onChange={(e) => handleSettingChange('twoFactorAuth', e?.target?.checked)}
              className="rounded border-border h-4 w-4"
            />
            {securitySettings?.twoFactorAuth && (
              <Button variant="outline" size="sm">
                Configure
              </Button>
            )}
          </div>
        </div>
      </div>
      {/* Session Security */}
      <div className="bg-card rounded-xl shadow-sm border border-border p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center">
            <Icon name="Clock" size={20} className="text-warning" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Session Security</h3>
            <p className="text-sm text-muted-foreground">Manage session timeout and activity monitoring</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Session Timeout (minutes)
            </label>
            <div className="flex items-center space-x-4">
              <Input
                type="number"
                value={securitySettings?.sessionTimeout}
                onChange={(e) => handleSettingChange('sessionTimeout', parseInt(e?.target?.value) || 60)}
                min="5"
                max="480"
                className="w-32"
              />
              <span className="text-sm text-muted-foreground">
                Automatically log out after inactivity
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-foreground">Login Notifications</div>
              <div className="text-xs text-muted-foreground">Get notified of new login attempts</div>
            </div>
            <input
              type="checkbox"
              checked={securitySettings?.loginNotifications}
              onChange={(e) => handleSettingChange('loginNotifications', e?.target?.checked)}
              className="rounded border-border h-4 w-4"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-foreground">Suspicious Activity Alerts</div>
              <div className="text-xs text-muted-foreground">Alert on unusual account activity</div>
            </div>
            <input
              type="checkbox"
              checked={securitySettings?.suspiciousActivityAlerts}
              onChange={(e) => handleSettingChange('suspiciousActivityAlerts', e?.target?.checked)}
              className="rounded border-border h-4 w-4"
            />
          </div>
        </div>
      </div>
      {/* Active Sessions */}
      <div className="bg-card rounded-xl shadow-sm border border-border p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Icon name="Monitor" size={20} className="text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Active Sessions</h3>
            <p className="text-sm text-muted-foreground">Manage your active login sessions</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
            <div className="flex items-center space-x-3">
              <Icon name="Monitor" size={16} className="text-muted-foreground" />
              <div>
                <div className="text-sm font-medium text-foreground">Current Session</div>
                <div className="text-xs text-muted-foreground">Chrome on macOS • San Francisco, US</div>
              </div>
            </div>
            <span className="text-xs px-2 py-1 bg-success/10 text-success rounded-full">
              Active
            </span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-muted/10 rounded-lg">
            <div className="flex items-center space-x-3">
              <Icon name="Smartphone" size={16} className="text-muted-foreground" />
              <div>
                <div className="text-sm font-medium text-foreground">Mobile Device</div>
                <div className="text-xs text-muted-foreground">iPhone Safari • Last seen 2h ago</div>
              </div>
            </div>
            <Button variant="outline" size="sm">
              Revoke
            </Button>
          </div>
        </div>
      </div>
      {/* Save Button */}
      <div className="flex items-center justify-end space-x-3 pt-6 border-t border-border">
        <Button onClick={handleSave} variant="default" iconName="Save">
          Save Changes
        </Button>
      </div>
    </div>
  );
};

export default SecuritySettings;