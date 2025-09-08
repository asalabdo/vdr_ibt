import React from 'react';
import Icon from '../AppIcon';

/**
 * Loading spinner component for authentication checks
 * Shows while determining user authentication status
 */
const AuthLoadingSpinner = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="mb-4">
          <Icon 
            name="Loader2" 
            size={32} 
            className="text-primary animate-spin mx-auto" 
          />
        </div>
        <p className="text-sm text-muted-foreground">
          Checking authentication...
        </p>
      </div>
    </div>
  );
};

export default AuthLoadingSpinner;
