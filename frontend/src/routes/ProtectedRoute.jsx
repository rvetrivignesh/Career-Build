import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@contexts/AuthContext";
import { PageLoader } from "@components/Loader";

export const ProtectedRoute = ({ children, requiresProfileSetup = true }) => {
  const { isAuthenticated, profileComplete, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <PageLoader text="Verifying session..." />;
  }

  if (!isAuthenticated) {
    // Redirect to login but save the current location they were trying to access
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // User is logged in. Now check profile completeness
  if (!profileComplete && requiresProfileSetup && location.pathname !== "/profile-setup") {
    // Force onboarding
    return <Navigate to="/profile-setup" replace />;
  }

  if (profileComplete && location.pathname === "/profile-setup" && !location.state?.edit) {
    // Already onboarded, no need to redo setup
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
