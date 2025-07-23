// src/components/common/PrivateRoute.tsx
import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom'; // <--- Import Navigate and Outlet
import type { RootState } from '../../store'; // Adjust path if necessary

interface PrivateRouteProps {
  allowedRoles?: string[]; // Optional array of roles that can access this route
  children?: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, allowedRoles }) => {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  if (!isAuthenticated) {
    // Not authenticated, redirect to login page by RETURNING the Navigate component
    return <Navigate to="/login" replace />;
  }

  // If roles are specified, check if the user has any of the allowed roles
  if (allowedRoles && user && !allowedRoles.some(role => user.roles.includes(role))) {
    // User does not have the required role, redirect to a forbidden or home page
    console.warn(`Access Denied: User ${user.userName} (Roles: ${user.roles.join(', ')}) attempted to access a page requiring roles: ${allowedRoles.join(', ')}`);
    // Redirect to home or a dedicated /forbidden page by RETURNING the Navigate component
    return <Navigate to="/" replace />;
  }

  // Authenticated and authorized, render the child routes or component
  // If `children` are provided, render them. Otherwise, render the `Outlet` for nested routes.
  return children ? <>{children}</> : <Outlet />;
};

export default PrivateRoute;