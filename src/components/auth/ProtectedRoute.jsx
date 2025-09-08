import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/api';
import AuthLoadingSpinner from './AuthLoadingSpinner';

/**
 * Protected Route Guard Component
 * 
 * Protects routes that require authentication.
 * Redirects to /login if user is not authenticated.
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render if authenticated
 * @param {string} [props.redirectTo="/login"] - Where to redirect if not authenticated
 * @returns {React.ReactElement} Protected content or redirect
 * 
 * @example
 * <Route path="/dashboard" element={
 *   <ProtectedRoute>
 *     <Dashboard />
 *   </ProtectedRoute>
 * } />
 */
const ProtectedRoute = ({ children, redirectTo = "/login" }) => {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return <AuthLoadingSpinner />;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  // User is authenticated, render protected content
  return children;
};

export default ProtectedRoute;
