import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import GlobalLoader from '../components/GlobalLoader'

// Protected route for authenticated users
export const ProtectRoute = ({ children }) => {
  const { isAuthenticated, isCheckingAuth } = useAuth()

  if (isCheckingAuth) return <GlobalLoader />
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

// Route for already authenticated users (login/register pages)
export const AuthenticatedUserRoute = ({ children }) => {
  const { isAuthenticated, user, isCheckingAuth } = useAuth()

  const isAdmin = user?.role === 'admin'

  if (isCheckingAuth) return <GlobalLoader />
  return !isAdmin && isAuthenticated && user ? (
    <Navigate to="/dashboard" replace />
  ) : (
    children
  )
}

// Route that requires email verification
export const RequireEmailVerification = ({ children }) => {
  const { user, isCheckingAuth } = useAuth()
  const isOnVerificationPage =
    window.location.pathname === '/email-verification'

  if (isCheckingAuth) return <GlobalLoader />
  if (!isOnVerificationPage && user && !user.isVerified) {
    return (
      <Navigate to="/email-verification" replace state={{ showToast: true }} />
    )
  }
  return children
}

// Admin-only route
export const RequireAdmin = ({ children }) => {
  const { user, isCheckingAuth } = useAuth()

  if (isCheckingAuth) return <GlobalLoader />
  return user?.role === 'admin' ? (
    children
  ) : (
    <Navigate to="/dashboard" replace />
  )
}
