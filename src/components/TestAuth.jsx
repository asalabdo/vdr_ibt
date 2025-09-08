import React from 'react';
import { useAuth, useServerInfo } from '@/hooks/api';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from './AppIcon';

/**
 * Temporary component to test authentication integration
 * This will validate that our React Query + Nextcloud setup works correctly
 */
const TestAuth = () => {
  const { 
    user, 
    isAuthenticated, 
    isLoading, 
    login,
    logout,
    isLoggingIn,
    isLoggingOut,
    loginError,
    hasPermission,
    testAuth
  } = useAuth();

  const { 
    data: serverInfo, 
    isLoading: isLoadingServer, 
    error: serverError 
  } = useServerInfo();

  // Test login with environment credentials
  const handleTestLogin = () => {
    const devCredentials = {
      username: import.meta.env.VITE_DEV_USERNAME,
      password: import.meta.env.VITE_DEV_APP_PASSWORD
    };
    
    if (devCredentials.username && devCredentials.password) {
      login(devCredentials);
    } else {
      console.error('No development credentials found in environment');
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="TestTube" size={20} />
            Authentication Integration Test
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Authentication Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">Authentication Status</h4>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant={isAuthenticated ? "default" : "secondary"}>
                    {isAuthenticated ? "Authenticated" : "Not Authenticated"}
                  </Badge>
                  {isLoading && (
                    <Icon name="Loader2" size={16} className="animate-spin" />
                  )}
                </div>
                
                {user && (
                  <div className="text-sm space-y-1">
                    <p><strong>User:</strong> {user.displayname || user.username}</p>
                    <p><strong>Email:</strong> {user.email || 'Not provided'}</p>
                    <p><strong>Admin:</strong> {user.isAdmin ? 'Yes' : 'No'}</p>
                    <p><strong>Groups:</strong> {user.groups?.join(', ') || 'None'}</p>
                  </div>
                )}
                
                {loginError && (
                  <div className="text-sm text-destructive">
                    <strong>Login Error:</strong> {loginError.message}
                  </div>
                )}
              </div>
            </div>

            {/* Server Information */}
            <div className="space-y-2">
              <h4 className="font-medium">Server Information</h4>
              {isLoadingServer ? (
                <div className="flex items-center gap-2">
                  <Icon name="Loader2" size={16} className="animate-spin" />
                  <span className="text-sm">Loading server info...</span>
                </div>
              ) : serverError ? (
                <div className="text-sm text-destructive">
                  <strong>Error:</strong> {serverError.message}
                </div>
              ) : serverInfo ? (
                <div className="text-sm space-y-1">
                  <p><strong>Version:</strong> {serverInfo.status?.versionstring || 'Unknown'}</p>
                  <p><strong>Installed:</strong> {serverInfo.status?.installed ? 'Yes' : 'No'}</p>
                  <p><strong>Maintenance:</strong> {serverInfo.status?.maintenance ? 'Yes' : 'No'}</p>
                </div>
              ) : null}
            </div>
          </div>

          {/* Environment Check */}
          <div className="space-y-2">
            <h4 className="font-medium">Environment Configuration</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Nextcloud URL:</strong><br />
                <code className="bg-muted px-2 py-1 rounded">
                  {import.meta.env.VITE_NEXTCLOUD_URL || 'Not configured'}
                </code>
              </div>
              <div>
                <strong>Dev Username:</strong><br />
                <code className="bg-muted px-2 py-1 rounded">
                  {import.meta.env.VITE_DEV_USERNAME || 'Not configured'}
                </code>
              </div>
            </div>
          </div>

          {/* Permissions Test */}
          {isAuthenticated && user && (
            <div className="space-y-2">
              <h4 className="font-medium">Permission Tests</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <Badge variant={hasPermission('data_rooms.read') ? "default" : "secondary"} className="text-xs">
                    Data Rooms Read: {hasPermission('data_rooms.read') ? 'Yes' : 'No'}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={hasPermission('data_rooms.create') ? "default" : "secondary"} className="text-xs">
                    Data Rooms Create: {hasPermission('data_rooms.create') ? 'Yes' : 'No'}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={hasPermission('users.manage') ? "default" : "secondary"} className="text-xs">
                    User Management: {hasPermission('users.manage') ? 'Yes' : 'No'}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={hasPermission('audit.view') ? "default" : "secondary"} className="text-xs">
                    Audit Logs: {hasPermission('audit.view') ? 'Yes' : 'No'}
                  </Badge>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            {!isAuthenticated ? (
              <Button 
                onClick={handleTestLogin}
                disabled={isLoggingIn}
                className="flex items-center gap-2"
              >
                {isLoggingIn ? (
                  <Icon name="Loader2" size={16} className="animate-spin" />
                ) : (
                  <Icon name="LogIn" size={16} />
                )}
                Test Login with Dev Credentials
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  onClick={() => testAuth()}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Icon name="CheckCircle" size={16} />
                  Test Authentication
                </Button>
                <Button
                  onClick={logout}
                  disabled={isLoggingOut}
                  variant="destructive"
                  className="flex items-center gap-2"
                >
                  {isLoggingOut ? (
                    <Icon name="Loader2" size={16} className="animate-spin" />
                  ) : (
                    <Icon name="LogOut" size={16} />
                  )}
                  Logout
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TestAuth;
