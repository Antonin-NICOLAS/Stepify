import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/CheckAuth";
import { useLoaderStore } from "../store/Loading";

export const ProtectRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  const { isLoading } = useLoaderStore();

  if (!isLoading) {
    return isAuthenticated ? children : <Navigate to="/login" replace />;
  }
};

export const AuthenticatedUserRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();
  const { isLoading } = useLoaderStore();

  if (!isLoading) {
    return isAuthenticated && user ? <Navigate to="/dashboard" replace /> : children;
  }
};

export const RequireEmailVerification = ({ children }) => {
  const { user } = useAuthStore();
  const { isLoading } = useLoaderStore();

  if (!isLoading) {
    return user && !user.isVerified ? <Navigate to="/email-verification" replace /> : children;
  }
};

export const RequireAdmin = ({ children }) => {
  const { user } = useAuthStore();
  const { isLoading } = useLoaderStore();

  if (!isLoading) {
    return user && user.isAdmin ? children : <Navigate to="/dashboard" replace />; {/* TODO : rediriger vers la page admin quand elle sera créée */ }
  }
};