import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import GlobalLoader from "../utils/GlobalLoader";

// Protected route for authenticated users
export const ProtectRoute = ({ children }) => {
  const { isAuthenticated, checkAuth } = useAuth();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const verifyAuth = async () => {
      await checkAuth();
      setIsCheckingAuth(false);
    };
    verifyAuth();
  }, [checkAuth]);

  if (isCheckingAuth) return <GlobalLoader />;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Route for already authenticated users (login/register pages)
export const AuthenticatedUserRoute = ({ children }) => {
  const { isAuthenticated, user, checkAuth } = useAuth();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  const isAdmin = user?.role === "admin";

  useEffect(() => {
    const verifyAuth = async () => {
      await checkAuth();
      setIsCheckingAuth(false);
    };
    verifyAuth();
  }, [checkAuth]);

  if (isCheckingAuth) return <GlobalLoader />;
  return !isAdmin && isAuthenticated && user ? (
    <Navigate to="/dashboard" replace />
  ) : (
    children
  );
};

// Route that requires email verification
export const RequireEmailVerification = ({ children }) => {
  const { user, checkAuth } = useAuth();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const isOnVerificationPage =
    window.location.pathname === "/email-verification";

  useEffect(() => {
    const verifyAuth = async () => {
      await checkAuth();
      setIsCheckingAuth(false);
    };
    verifyAuth();
  }, [checkAuth]);

  if (isCheckingAuth) return <GlobalLoader />;
  if (!isOnVerificationPage && user && !user.isVerified) {
    return (
      <Navigate to="/email-verification" replace state={{ showToast: true }} />
    );
  }
  return children;
};

// Admin-only route
export const RequireAdmin = ({ children }) => {
  const { user, checkAuth } = useAuth();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const verifyAuth = async () => {
      await checkAuth();
      setIsCheckingAuth(false);
    };
    verifyAuth();
  }, [checkAuth]);

  if (isCheckingAuth) return <GlobalLoader />;
  return user?.role === "admin" ? (
    children
  ) : (
    <Navigate to="/dashboard" replace />
  );
};
