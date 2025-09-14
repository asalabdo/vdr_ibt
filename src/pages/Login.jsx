import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/Checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/AppIcon';
import LanguageToggle from '@/components/ui/LanguageToggle';
import DarkModeToggle from '@/components/ui/DarkModeToggle';

/**
 * Login Page Component
 * 
 * Features:
 * - Fully responsive design
 * - Arabic/English language support
 * - Form validation
 * - Loading states
 * - Error handling
 * - Integration with existing authentication system
 * - Dark/Light mode support
 * - Redirect after successful login
 */
const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation('login');
  const { t: tCommon } = useTranslation('common');
  
  const { login, isLoggingIn, loginError, isAuthenticated } = useAuth();
  
  // Form state
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  // Form validation
  const [errors, setErrors] = useState({});
  
  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location.state]);

  // Handle input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.username.trim()) {
      newErrors.username = t('validation.username_required');
    }
    
    if (!formData.password.trim()) {
      newErrors.password = t('validation.password_required');
    } else if (formData.password.length < 6) {
      newErrors.password = t('validation.password_min_length');
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      await login({
        username: formData.username.trim(),
        password: formData.password
      });
      
      // Successful login - redirect will be handled by useEffect
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
      
    } catch (error) {
      // Error is already handled by the useAuth hook
      console.error('Login failed:', error);
    }
  };

  // Handle demo login
  const handleDemoLogin = async () => {
    const demoCredentials = {
      username: import.meta.env.VITE_DEV_USERNAME,
      password: import.meta.env.VITE_DEV_APP_PASSWORD
    };
    
    if (demoCredentials.username && demoCredentials.password) {
      console.log('🚀 Demo login initiated');
      
      // Update form to show demo credentials
      setFormData(demoCredentials);
      
      try {
        // Login with demo credentials
        await login(demoCredentials);
        
        // Successful login - redirect will be handled by useEffect
        const from = location.state?.from?.pathname || '/';
        navigate(from, { replace: true });
        
      } catch (error) {
        console.error('Demo login failed:', error);
      }
    } else {
      console.warn('⚠️ Demo credentials not configured in environment variables');
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Language and Theme Controls */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <LanguageToggle />
            <DarkModeToggle />
          </div>
          
          {/* Logo/Brand */}
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <Icon name="Database" size={20} className="text-primary" />
            <span className="font-bold text-foreground">VDR</span>
            <span className="text-xs text-muted-foreground">IBTIKARYA</span>
          </div>
        </div>

        <Card className="shadow-md">
          <CardHeader className="space-y-1 text-center pb-6">
            <CardTitle className="text-2xl font-bold text-foreground">
              {t('title')}
            </CardTitle>
            <p className="text-muted-foreground">
              {t('subtitle')}
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Login Error Alert */}
            {loginError && (
              <Alert className="border-destructive/50 text-destructive dark:border-destructive">
                <Icon name="AlertCircle" size={16} />
                <AlertDescription>
                  {t('errors.login_failed', { message: loginError.message })}
                </AlertDescription>
              </Alert>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username Field */}
              <div className="space-y-2">
                <Label htmlFor="username">
                  {t('fields.username.label')}
                </Label>
                <div className="relative">
                  <Icon 
                    name="User" 
                    size={18} 
                    className="absolute left-3 rtl:right-3 rtl:left-auto top-1/2 transform -translate-y-1/2 text-muted-foreground" 
                  />
                  <Input
                    id="username"
                    type="text"
                    value={formData.username}
                    onChange={(e) => handleInputChange('username', e.target.value)}
                    placeholder={t('fields.username.placeholder')}
                    className={`pl-10 rtl:pr-10 rtl:pl-3 ${errors.username ? 'border-destructive' : ''}`}
                    disabled={isLoggingIn}
                    autoComplete="username"
                    autoFocus
                  />
                </div>
                {errors.username && (
                  <p className="text-sm text-destructive">{errors.username}</p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password">
                  {t('fields.password.label')}
                </Label>
                <div className="relative">
                  <Icon 
                    name="Lock" 
                    size={18} 
                    className="absolute left-3 rtl:right-3 rtl:left-auto top-1/2 transform -translate-y-1/2 text-muted-foreground" 
                  />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    placeholder={t('fields.password.placeholder')}
                    className={`pl-10 pr-10 rtl:pr-10 rtl:pl-10 ${errors.password ? 'border-destructive' : ''}`}
                    disabled={isLoggingIn}
                    autoComplete="current-password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-1 rtl:left-1 rtl:right-auto top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-transparent"
                    disabled={isLoggingIn}
                  >
                    <Icon 
                      name={showPassword ? 'EyeOff' : 'Eye'} 
                      size={16} 
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    />
                  </Button>
                </div>
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password}</p>
                )}
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={setRememberMe}
                    disabled={isLoggingIn}
                  />
                  <Label 
                    htmlFor="remember" 
                    className="text-sm cursor-pointer"
                  >
                    {t('fields.remember_me')}
                  </Label>
                </div>
                
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  className="h-auto p-0 text-sm"
                  disabled={isLoggingIn}
                >
                  {t('links.forgot_password')}
                </Button>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full"
                disabled={isLoggingIn}
                size="lg"
              >
                {isLoggingIn ? (
                  <>
                    <Icon name="Loader2" size={18} className="animate-spin mr-2" />
                    {t('buttons.signing_in')}
                  </>
                ) : (
                  <>
                    <Icon name="LogIn" size={18} className="mr-2" />
                    {t('buttons.sign_in')}
                  </>
                )}
              </Button>
            </form>

            {/* Demo Login Section */}
            {(import.meta.env.VITE_DEV_USERNAME && import.meta.env.VITE_DEV_APP_PASSWORD) && (
              <>
                <div className="relative">
                  <Separator className="my-6" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Badge variant="secondary" className="text-xs px-3 py-1">
                      {t('sections.demo_access')}
                    </Badge>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleDemoLogin}
                  disabled={isLoggingIn}
                >
                  {isLoggingIn ? (
                    <>
                      <Icon name="Loader2" size={18} className="animate-spin mr-2" />
                      {t('buttons.signing_in')}
                    </>
                  ) : (
                    <>
                      <Icon name="Zap" size={18} className="mr-2" />
                      {t('buttons.demo_login')}
                    </>
                  )}
                </Button>
              </>
            )}

            {/* Help Links */}
            <div className="text-center space-y-2 pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground">
                {t('help.need_help')}
              </p>
              <div className="flex items-center justify-center space-x-4 rtl:space-x-reverse">
                <Button 
                  variant="link" 
                  size="sm"
                  className="h-auto p-0 text-xs"
                >
                  {t('help.contact_support')}
                </Button>
                <span className="text-xs text-muted-foreground">•</span>
                <Button 
                  variant="link" 
                  size="sm"
                  className="h-auto p-0 text-xs"
                >
                  {t('help.documentation')}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-muted-foreground">
            © 2025 {t('footer.company')} • {t('footer.all_rights_reserved')}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {t('footer.version')} 1.0.0
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
