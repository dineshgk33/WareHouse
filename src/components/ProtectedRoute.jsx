import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ pageId }) => {
  const { user, selectedWarehouse, selectedRole, canView, isLoadingPermissions } = useAuth();
  const location = useLocation();

  // 1. Not logged in
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. Logged in, but hasn't selected workspace (unless going to workspace selection)
  if (!selectedWarehouse || !selectedRole) {
    if (location.pathname !== '/workspace-selection') {
      return <Navigate to="/workspace-selection" replace />;
    }
  }

  // 3. Needs page permission check
  if (pageId) {
    if (isLoadingPermissions) {
      return <div>Loading permissions...</div>; // Could be a better skeleton loader
    }

    if (!canView(pageId)) {
      return <Navigate to="/403" replace />;
    }
  }

  return <Outlet />;
};

export default ProtectedRoute;
