import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/api';
import AuthLoadingSpinner from './AuthLoadingSpinner';

/**
 * Public Route Guard Component
 * 
 * For routes that should only be accessible when NOT authenticated (like login page).
 * Redirects authenticated users to the main dashboard.
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render if not authenticated
 * @param {string} [props.redirectTo="/"] - Where to redirect if already authenticated
 * @returns {React.ReactElement} Public content or redirect
 * 
 * @example
 * <Route path="/login" element={
 *   <PublicRoute>
 *     <Login />
 *   </PublicRoute>
 * } />
 */
const PublicRoute = ({ children, redirectTo = "/" }) => {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return <AuthLoadingSpinner />;
  }

  // Redirect to dashboard if already authenticated
  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  // User is not authenticated, render public content (login page)
  return children;
};

export default PublicRoute;
