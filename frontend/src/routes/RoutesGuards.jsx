import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/CheckAuth";

export const ProtectRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

export const AuthenticatedUserRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();
  return isAuthenticated && user ? <Navigate to="/dashboard" replace /> : children;
};

export const RequireEmailVerification = ({ children }) => {
  const { user } = useAuthStore();
  return user && !user.isVerified ? <Navigate to="/email-verification" replace /> : children;
};

export const RequireAdmin = ({ children }) => {
  const { user } = useAuthStore();
  return user?.isAdmin ? children : <Navigate to="/" replace />;
};