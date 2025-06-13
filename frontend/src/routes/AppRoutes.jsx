import { Routes, Route } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout.jsx'

// Route guards
import {
  ProtectRoute,
  AuthenticatedUserRoute,
  RequireEmailVerification,
  RequireAdmin,
} from './RoutesGuards.jsx'

// Pages
import Home from '../pages/App/Home.jsx'
import Dashboard from '../pages/App/Dashboard.jsx'
import Challenges from '../pages/Challenges/Challenges.jsx'
import Steps from '../pages/App/Steps.jsx'
import Leaderboard from '../pages/App/Leaderboard.jsx'
import Rewards from '../pages/App/Rewards.jsx'
import Friends from '../pages/App/Friends.jsx'
import Profile from '../pages/App/Profile.jsx'
import Settings from '../pages/Settings/Settings.jsx'
import About from '../pages/App/About.jsx'
//terms of services
import TermsOfService from '../pages/Documents/TermsOfService.jsx'
//AUTH
import Login from '../pages/Auth/Login.jsx'
import EmailVerification from '../pages/Auth/EmailVerification.jsx'
import ChangeVerificationEmail from '../pages/Auth/ChangeEmail.jsx'
import ForgotPassword from '../pages/Auth/Forgot-pwd.jsx'
import EmailSent from '../pages/Auth/EmailSent.jsx'
import ResetPassword from '../pages/Auth/Reset-pwd.jsx'
import TwoFactorVerification from '../pages/Auth/TwoFactorVerification.jsx'
import TwoFactorSetup from '../pages/Settings/TwoFactorSetup.jsx'
//OTHERS
import NotFound from '../components/NotFound.jsx'

export default function AppRoutes() {
  return (
    <Routes>
      {/* Pages avec header et sidebar */}
      <Route element={<MainLayout />}>
        <Route
          path="/"
          element={
            <RequireEmailVerification>
              <Home />
            </RequireEmailVerification>
          }
        />
        <Route
          path="/dashboard"
          element={
            <RequireEmailVerification>
              <Dashboard />
            </RequireEmailVerification>
          }
        />
        <Route
          path="/steps"
          element={
            <RequireEmailVerification>
              <Steps />
            </RequireEmailVerification>
          }
        />
        <Route
          path="/challenges"
          element={
            <RequireEmailVerification>
              <Challenges />
            </RequireEmailVerification>
          }
        />
        <Route
          path="/rewards"
          element={
            <RequireEmailVerification>
              <Rewards />
            </RequireEmailVerification>
          }
        />
        <Route
          path="/leaderboard"
          element={
            <RequireEmailVerification>
              <Leaderboard />
            </RequireEmailVerification>
          }
        />
        <Route
          path="/friends"
          element={
            <RequireEmailVerification>
              <Friends />
            </RequireEmailVerification>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectRoute>
              <RequireEmailVerification>
                <Settings />
              </RequireEmailVerification>
            </ProtectRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectRoute>
              <RequireEmailVerification>
                <Profile />
              </RequireEmailVerification>
            </ProtectRoute>
          }
        />
        <Route
          path="/about"
          element={
            <RequireEmailVerification>
              <About />
            </RequireEmailVerification>
          }
        />
        <Route
          path="/admin"
          element={
            <RequireAdmin>
              <Dashboard />
            </RequireAdmin>
          }
        />{' '}
        {/* TODO : admin page */}
        <Route path="*" element={<NotFound />} />
        <Route path="/terms-of-service" element={<TermsOfService />} />
      </Route>

      {/* Pages sans header/sidebar */}
      <Route
        path="/login"
        element={
          <AuthenticatedUserRoute>
            <Login />
          </AuthenticatedUserRoute>
        }
      />
      <Route
        path="/change-email"
        element={
          <ProtectRoute>
            <ChangeVerificationEmail />
          </ProtectRoute>
        }
      />
      <Route
        path="/email-verification"
        element={
          <ProtectRoute>
            <EmailVerification />
          </ProtectRoute>
        }
      />
      <Route
        path="/forgot-password"
        element={
          <RequireEmailVerification>
            <ForgotPassword />
          </RequireEmailVerification>
        }
      />
      <Route
        path="/email-sent"
        element={
          <RequireEmailVerification>
            <EmailSent />
          </RequireEmailVerification>
        }
      />
      <Route
        path="/reset-password/:token"
        element={
          <RequireEmailVerification>
            <ResetPassword />
          </RequireEmailVerification>
        }
      />
      <Route
        path="/settings/2fa"
        element={
          <ProtectRoute>
            <RequireEmailVerification>
              <TwoFactorSetup />
            </RequireEmailVerification>
          </ProtectRoute>
        }
      />
      <Route
        path="/2fa-verification"
        element={
          <AuthenticatedUserRoute>
            <TwoFactorVerification />
          </AuthenticatedUserRoute>
        }
      />
      {/* TODO : <Route path="/privacy-policy" element={<PrivacyPolicy />} /> */}
    </Routes>
  )
}
