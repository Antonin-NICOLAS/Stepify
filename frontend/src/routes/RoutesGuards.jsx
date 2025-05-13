import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const ProtectRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (!isLoading) {
    return isAuthenticated ? children : <Navigate to="/login" replace />;
  }
};

export const AuthenticatedUserRoute = ({ children }) => {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (!isLoading) {
    return isAuthenticated && user ? <Navigate to="/dashboard" replace /> : children;
  }
};

export const RequireEmailVerification = ({ children }) => {
  const { user, isLoading } = useAuth();
  const isOnVerificationPage = window.location.pathname === "/email-verification";

  if (!isLoading && !isOnVerificationPage) {
    return user && !user.isVerified ? 
      <Navigate to="/email-verification" replace state={{ showToast: true }} /> : 
      children;
  }
};

export const RequireAdmin = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (!isLoading) {
    return user && user.isAdmin ? 
      children : 
      <Navigate to="/dashboard" replace />;
  }
};