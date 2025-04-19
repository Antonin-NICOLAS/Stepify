// routes/AppRoutes.jsx
import { Routes, Route } from 'react-router-dom';
import MainLayout from '../MainLayout.jsx';

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
import Activities from '../pages/Activities.jsx';
import Leaderboard from '../pages/Leaderboard.jsx';
import Statistics from '../pages/Statistics.jsx';
import Settings from '../pages/Settings.jsx';
import About from '../pages/About.jsx';
import Login from '../pages/Auth/Login.jsx';
import EmailVerification from '../pages/Auth/EmailVerification.jsx';
import ForgotPassword from '../pages/Auth/Forgot-pwd.jsx';
import EmailSent from '../pages/Auth/EmailSent.jsx';
import ResetPassword from '../pages/Auth/Reset-pwd.jsx';

export default function AppRoutes() {
    return (
        <Routes>
            {/* Pages avec layout */}
            <Route element={<MainLayout />}>
                <Route path="/" element={<RequireEmailVerification><Home /></RequireEmailVerification>} />
                <Route path="/dashboard" element={<RequireEmailVerification><Dashboard /></RequireEmailVerification>} />
                <Route path="/challenges" element={<RequireEmailVerification><Challenges /></RequireEmailVerification>} />
                <Route path="/activities" element={<RequireEmailVerification><Activities /></RequireEmailVerification>} />
                <Route path="/leaderboard" element={<RequireEmailVerification><Leaderboard /></RequireEmailVerification>} />
                <Route path="/statistics" element={<RequireEmailVerification><Statistics /></RequireEmailVerification>} />
                <Route path="/settings" element={<RequireEmailVerification><Settings /></RequireEmailVerification>} />
                <Route path="/about" element={<RequireEmailVerification><About /></RequireEmailVerification>} />
                <Route path="/admin" element={<RequireAdmin><Dashboard /></RequireAdmin>} /> {/* TODO : admin page */}
                {/* TODO : not found page <Route path="*" element={<NotFound />} /> */}
            </Route>

            {/* Pages sans header/sidebar */}
            <Route path="/login" element={<AuthenticatedUserRoute><Login /></AuthenticatedUserRoute>} />
            <Route path="/register" element={<AuthenticatedUserRoute><Login /></AuthenticatedUserRoute>} /> {/* TODO : dans email-verification je ne peux pas changer d'email car je suis considéré comme authentifié */}
            <Route path="/email-verification" element={<ProtectRoute><EmailVerification /></ProtectRoute>} />
            <Route path="/forgot-password" element={<RequireEmailVerification><ForgotPassword /></RequireEmailVerification>} />
            <Route path="/email-sent" element={<RequireEmailVerification><EmailSent /></RequireEmailVerification>} />
            <Route path="/reset-password/:token" element={<RequireEmailVerification><ResetPassword /></RequireEmailVerification>} />
            {/* TODO : <Route path="/privacy-policy" element={<PrivacyPolicy />} /> */}
            {/* TODO : <Route path="/terms-of-service" element={<TermsOfService />} /> */}
        </Routes>
    );
}