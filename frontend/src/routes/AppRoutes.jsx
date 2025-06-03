import { Routes, Route } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout.jsx';

// Route guards
import {
    ProtectRoute,
    AuthenticatedUserRoute,
    RequireEmailVerification,
    RequireAdmin
} from './RoutesGuards.jsx';

// Pages
import Home from '../pages/Home.jsx';
import Dashboard from '../pages/Dashboard.jsx';
import Challenges from '../pages/Challenges.jsx';
import Steps from '../pages/Steps.jsx';
import Leaderboard from '../pages/Leaderboard.jsx';
import Rewards from '../pages/Rewards.jsx';
import Friends from '../pages/Friends.jsx';
import Settings from '../pages/Settings.jsx';
import About from '../pages/About.jsx';
//loader
import GlobalLoader from '../utils/GlobalLoader.jsx';
//terms of services
import TermsOfService from '../pages/Documents/TermsOfService.jsx'
//AUTH
import Login from '../pages/Auth/Login.jsx';
import EmailVerification from '../pages/Auth/EmailVerification.jsx';
import ChangeVerificationEmail from '../pages/Auth/ChangeEmail.jsx';
import ForgotPassword from '../pages/Auth/Forgot-pwd.jsx';
import EmailSent from '../pages/Auth/EmailSent.jsx';
import ResetPassword from '../pages/Auth/Reset-pwd.jsx';
//OTHERS
import NotFound from '../components/NotFound.jsx';

export default function AppRoutes() {
    return (
        <Routes>
                {/* Pages avec header et sidebar */}
                <Route element={<MainLayout />}>
                    <Route path="/" element={<RequireEmailVerification><Home /></RequireEmailVerification>} />
                    <Route path="/dashboard" element={<RequireEmailVerification><Dashboard /></RequireEmailVerification>} />
                    <Route path="/steps" element={<RequireEmailVerification><Steps /></RequireEmailVerification>} />
                    <Route path="/challenges" element={<RequireEmailVerification><Challenges /></RequireEmailVerification>} />
                    <Route path="/rewards" element={<RequireEmailVerification><Rewards /></RequireEmailVerification>} />
                    <Route path="/leaderboard" element={<RequireEmailVerification><Leaderboard /></RequireEmailVerification>} />
                    <Route path="/friends" element={<RequireEmailVerification><Friends /></RequireEmailVerification>} />
                    <Route path="/settings" element={<ProtectRoute><RequireEmailVerification><Settings /></RequireEmailVerification></ProtectRoute>} />
                    <Route path="/about" element={<RequireEmailVerification><About /></RequireEmailVerification>} />
                    <Route path="/admin" element={<RequireAdmin><Dashboard /></RequireAdmin>} /> {/* TODO : admin page */}
                    <Route path="*" element={<NotFound />} />
                    <Route path="/terms-of-service" element={<TermsOfService />} />
                </Route>

                {/* Pages sans header/sidebar */}
                <Route path="/login" element={<AuthenticatedUserRoute><Login /></AuthenticatedUserRoute>} />
                <Route path="/change-email" element={<ProtectRoute><ChangeVerificationEmail /></ProtectRoute>} />
                <Route path="/email-verification" element={<ProtectRoute><EmailVerification /></ProtectRoute>} />
                <Route path="/forgot-password" element={<RequireEmailVerification><ForgotPassword /></RequireEmailVerification>} />
                <Route path="/email-sent" element={<RequireEmailVerification><EmailSent /></RequireEmailVerification>} />
                <Route path="/reset-password/:token" element={<RequireEmailVerification><ResetPassword /></RequireEmailVerification>} />
                {/* TODO : <Route path="/privacy-policy" element={<PrivacyPolicy />} /> */}
        </Routes>
    );
}