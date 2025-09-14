import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Card, 
  CardContent, 
  CardDescription,
  CardFooter,
  CardHeader, 
  CardTitle 
} from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Alert, AlertDescription } from './ui/alert';
import { 
  ShieldAlert, 
  Lock, 
  User, 
  ArrowLeft, 
  Home,
  Settings,
  Mail,
  InfoIcon
} from 'lucide-react';

/**
 * AccessDeniedPage Component
 * 
 * A comprehensive and user-friendly access denied page that provides:
 * - Clear explanation of why access was denied
 * - User's current role and permissions
 * - Helpful suggestions for next steps
 * - Contact information for support
 * - Navigation options
 * 
 * @param {Object} props
 * @param {string} props.title - Custom title for the error
 * @param {string} props.message - Custom message explaining the denial
 * @param {string} props.userRole - Current user's role
 * @param {Array|string} props.requiredPermissions - Permissions required for access
 * @param {string} props.requiredRole - Role required for access
 * @param {boolean} props.requireAdmin - Whether admin access is required
 * @param {boolean} props.requireSubadmin - Whether subadmin access is required
 * @param {string} props.resourceType - Type of resource being accessed
 * @param {Function} props.onGoBack - Custom back navigation handler
 * @param {Function} props.onGoHome - Custom home navigation handler
 * @param {boolean} props.showContactSupport - Whether to show contact support option
 */
const AccessDeniedPage = ({
  title = "Access Denied",
  message = "You don't have the required permissions to access this resource.",
  userRole = "user",
  requiredPermissions = [],
  requiredRole = null,
  requireAdmin = false,
  requireSubadmin = false,
  resourceType = "resource",
  onGoBack,
  onGoHome,
  showContactSupport = true,
  ...props
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation('common');

  // Handle back navigation
  const handleGoBack = () => {
    if (onGoBack) {
      onGoBack();
    } else if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  // Handle home navigation
  const handleGoHome = () => {
    if (onGoHome) {
      onGoHome();
    } else {
      navigate('/');
    }
  };

  // Get role badge color
  const getRoleBadgeVariant = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return 'default';
      case 'subadmin':
        return 'secondary';
      case 'manager':
        return 'outline';
      default:
        return 'outline';
    }
  };

  // Generate helpful suggestions based on context
  const getSuggestions = () => {
    const suggestions = [];

    if (requireAdmin) {
      suggestions.push("This feature requires administrator privileges");
      suggestions.push("Contact your system administrator to request access");
    } else if (requireSubadmin) {
      suggestions.push("This feature requires subadmin or administrator privileges");
      suggestions.push("Contact your administrator to upgrade your account");
    } else if (requiredPermissions?.length > 0) {
      suggestions.push("Your account needs additional permissions");
      suggestions.push("Contact your team lead or administrator");
    }

    if (resourceType === 'groups') {
      suggestions.push("Group management requires special privileges");
    } else if (resourceType === 'users') {
      suggestions.push("User management is restricted to administrators");
    } else if (resourceType === 'audit') {
      suggestions.push("Audit logs access requires compliance permissions");
    }

    return suggestions;
  };

  const suggestions = getSuggestions();

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-lg border-destructive/20 shadow-lg">
        {/* Compact Header */}
        <CardHeader className="text-center pb-3">
          <div className="flex justify-center mb-3">
            <div className="relative">
              <div className="p-2 bg-destructive/10 rounded-full">
                <ShieldAlert className="h-8 w-8 text-destructive" />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 p-0.5 bg-background border rounded-full">
                <Lock className="h-3 w-3 text-muted-foreground" />
              </div>
            </div>
          </div>
          <CardTitle className="text-xl font-bold text-destructive mb-1">
            {title}
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            {message}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Compact Account Info */}
          <div className="bg-muted/20 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Your Role</span>
              </div>
              <Badge variant={getRoleBadgeVariant(userRole)} className="capitalize text-xs">
                {userRole}
              </Badge>
            </div>
            
            {requiredRole && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Required:</span>
                <Badge variant="destructive" className="capitalize text-xs">
                  {requiredRole}
                </Badge>
              </div>
            )}
          </div>

          {/* Compact Required Permissions */}
          {requiredPermissions?.length > 0 && (
            <div className="bg-muted/20 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <Settings className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Required Permissions</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {(Array.isArray(requiredPermissions) ? requiredPermissions : [requiredPermissions])
                  .map((permission, index) => (
                    <Badge key={index} variant="outline" className="text-xs py-0 px-2">
                      {permission}
                    </Badge>
                  ))}
              </div>
            </div>
          )}

          {/* Compact Help Section */}
          {suggestions.length > 0 && (
            <Alert className="py-3">
              <InfoIcon className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-1">
                  <p className="text-sm font-medium mb-1">Next Steps:</p>
                  <ul className="text-xs space-y-0.5">
                    {suggestions.slice(0, 2).map((suggestion, index) => (
                      <li key={index} className="flex items-start gap-1">
                        <span className="text-muted-foreground mt-1">•</span>
                        <span>{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>

        {/* Compact Footer */}
        <CardFooter className="flex flex-wrap gap-2 pt-4">
          <Button 
            onClick={handleGoBack}
            variant="outline" 
            size="sm"
            className="flex-1 min-w-[90px]"
          >
            <ArrowLeft className="h-3 w-3 mr-1" />
            Back
          </Button>
          
          <Button 
            onClick={handleGoHome}
            variant="default"
            size="sm"
            className="flex-1 min-w-[90px]"
          >
            <Home className="h-3 w-3 mr-1" />
            Dashboard
          </Button>
          
          {showContactSupport && (
            <Button 
              variant="ghost"
              size="sm"
              className="flex-1 min-w-[90px]"
              onClick={() => {
                window.open('mailto:support@company.com?subject=Access Request', '_blank');
              }}
            >
              <Mail className="h-3 w-3 mr-1" />
              Support
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default AccessDeniedPage;
