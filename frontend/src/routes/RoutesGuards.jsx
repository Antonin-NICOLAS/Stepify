import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLoadingState } from "../context/LoadingContext";

export const ProtectRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const { isLoading } = useLoadingState();

  if (!isLoading) {
    return isAuthenticated ? children : <Navigate to="/login" replace />;
  }
};

export const AuthenticatedUserRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const { isLoading } = useLoadingState();

  if (!isLoading) {
    return isAuthenticated && user ? <Navigate to="/dashboard" replace /> : children;
  }
};

export const RequireEmailVerification = ({ children }) => {
  const { user } = useAuth();
  const { isLoading } = useLoadingState();

  if (!isLoading) {
    return user && !user.isVerified ? 
      <Navigate to="/email-verification" replace state={{ showToast: true }} /> : 
      children;
  }
};

export const RequireAdmin = ({ children }) => {
  const { user } = useAuth();
  const { isLoading } = useLoadingState();

  if (!isLoading) {
    return user && user.isAdmin ? 
      children : 
      <Navigate to="/dashboard" replace />;
  }
};