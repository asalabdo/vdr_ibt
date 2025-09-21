import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Icon from '../../../components/AppIcon';

const SecuritySettings = () => {
  const { t } = useTranslation('settings');
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
        <div className="flex items-center space-x-3 rtl:space-x-reverse mb-4">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <Icon name="Lock" size={20} className="text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">{t('security.change_password.title')}</h3>
            <p className="text-sm text-muted-foreground">{t('security.change_password.description')}</p>
          </div>
        </div>

        <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              {t('security.change_password.current_password')}
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
              {t('security.change_password.new_password')}
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
              {t('security.change_password.confirm_password')}
            </label>
            <Input
              type="password"
              value={passwordForm?.confirmPassword}
              onChange={(e) => handlePasswordChange('confirmPassword', e?.target?.value)}
              required
            />
          </div>

          <Button type="submit" variant="default" iconName="Key">
            {t('actions.update_password')}
          </Button>
        </form>
      </div>
      {/* Two-Factor Authentication */}
      <div className="bg-card rounded-xl shadow-sm border border-border p-6">
        <div className="flex items-center space-x-3 rtl:space-x-reverse mb-4">
          <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
            <Icon name="Shield" size={20} className="text-success" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">{t('security.two_factor_auth.title')}</h3>
            <p className="text-sm text-muted-foreground">{t('security.two_factor_auth.description')}</p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-foreground">{t('security.two_factor_auth.enable_2fa')}</div>
            <div className="text-xs text-muted-foreground">{t('security.two_factor_auth.enable_description')}</div>
          </div>
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <input
              type="checkbox"
              checked={securitySettings?.twoFactorAuth}
              onChange={(e) => handleSettingChange('twoFactorAuth', e?.target?.checked)}
              className="rounded border-border h-4 w-4"
            />
            {securitySettings?.twoFactorAuth && (
              <Button variant="outline" size="sm">
                {t('actions.configure')}
              </Button>
            )}
          </div>
        </div>
      </div>
      {/* Session Security */}
      <div className="bg-card rounded-xl shadow-sm border border-border p-6">
        <div className="flex items-center space-x-3 rtl:space-x-reverse mb-4">
          <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center">
            <Icon name="Clock" size={20} className="text-warning" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">{t('security.session_security.title')}</h3>
            <p className="text-sm text-muted-foreground">{t('security.session_security.description')}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              {t('security.session_security.session_timeout')}
            </label>
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              <Input
                type="number"
                value={securitySettings?.sessionTimeout}
                onChange={(e) => handleSettingChange('sessionTimeout', parseInt(e?.target?.value) || 60)}
                min="5"
                max="480"
                className="w-32"
              />
              <span className="text-sm text-muted-foreground">
                {t('security.session_security.session_timeout_description')}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-foreground">{t('security.session_security.login_notifications')}</div>
              <div className="text-xs text-muted-foreground">{t('security.session_security.login_notifications_description')}</div>
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
              <div className="text-sm font-medium text-foreground">{t('security.session_security.suspicious_activity')}</div>
              <div className="text-xs text-muted-foreground">{t('security.session_security.suspicious_activity_description')}</div>
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
        <div className="flex items-center space-x-3 rtl:space-x-reverse mb-4">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Icon name="Monitor" size={20} className="text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">{t('security.active_sessions.title')}</h3>
            <p className="text-sm text-muted-foreground">{t('security.active_sessions.description')}</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <Icon name="Monitor" size={16} className="text-muted-foreground" />
              <div>
                <div className="text-sm font-medium text-foreground">{t('security.active_sessions.current_session')}</div>
                <div className="text-xs text-muted-foreground">{t('sample_data.devices.chrome_macos')}</div>
              </div>
            </div>
            <span className="text-xs px-2 py-1 bg-success/10 text-success rounded-full">
              {t('security.active_sessions.active')}
            </span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-muted/10 rounded-lg">
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <Icon name="Smartphone" size={16} className="text-muted-foreground" />
              <div>
                <div className="text-sm font-medium text-foreground">{t('security.active_sessions.mobile_device')}</div>
                <div className="text-xs text-muted-foreground">{t('sample_data.devices.iphone_safari')} • {t('security.active_sessions.last_seen', { time: '2h' })}</div>
              </div>
            </div>
            <Button variant="outline" size="sm">
              {t('actions.revoke')}
            </Button>
          </div>
        </div>
      </div>
      {/* Save Button */}
      <div className="flex items-center justify-end space-x-3 rtl:space-x-reverse pt-6 border-t border-border">
        <Button onClick={handleSave} variant="default" iconName="Save">
          {t('actions.save_changes')}
        </Button>
      </div>
    </div>
  );
};

export default SecuritySettings;
