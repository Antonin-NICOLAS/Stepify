import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from './store/CheckAuth.js';
import axios from 'axios';
import { Toaster } from "react-hot-toast"
//layouts
import MainLayout from './MainLayout.jsx';
// routes
import {
  ProtectRoute,
  AuthenticatedUserRoute,
  RequireEmailVerification,
  RequireAdmin
} from './routes/RoutesGuards.jsx';
//context
//pages
import Home from './pages/Home.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Challenges from './pages/Challenges.jsx';
import Activities from './pages/Activities.jsx';
import Leaderboard from './pages/Leaderboard.jsx';
import Statistics from './pages/Statistics.jsx';
import Settings from './pages/Settings.jsx';
import About from './pages/About.jsx';
//components
import Login from './components/Auth/Login.jsx';
import EmailVerification from './components/Auth/EmailVerification.jsx';
import ForgotPassword from './components/Auth/Forgot-pwd.jsx';
import EmailSent from './components/Auth/EmailSent.jsx';
import ResetPassword from './components/Auth/Reset-pwd.jsx';
//CSS
import './App.css';
import './index.css';

{/*TODO https://step-ify.vercel.app/privacy-policy et https://step-ify.vercel.app/settings*/ }

axios.defaults.baseURL = process.env.NODE_ENV === "production" ? '' : process.env.BACKEND_SERVER,
  axios.defaults.withCredentials = true

function App() {
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);
  console.log("check-auth OK");

  return (
    <div className="App">
      <BrowserRouter>
        <Toaster
          position="top-right"
          reverseOrder={false}
          toastOptions={{
            className: '',
            duration: 3000,
            style: {
              background: 'var(--bleu)',
              color: '#fff',
            },
          }}
        />
        <Routes>
          {/* Pages avec layout principal */}
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
          </Route>

          {/* Pages sans header/sidebar */}
          <Route path="/login" element={<AuthenticatedUserRoute><Login /></AuthenticatedUserRoute>} />
          <Route path="/register" element={<AuthenticatedUserRoute><Login /></AuthenticatedUserRoute>} />
          <Route path="/email-verification" element={<ProtectRoute><EmailVerification /></ProtectRoute>} />
          <Route path="/forgot-password" element={<ProtectRoute><RequireEmailVerification><ForgotPassword /></RequireEmailVerification></ProtectRoute>} />
          <Route path="/email-sent" element={<ProtectRoute><RequireEmailVerification><EmailSent /></RequireEmailVerification></ProtectRoute>} />
          <Route path="/reset-password/:token" element={<ProtectRoute><RequireEmailVerification><ResetPassword /></RequireEmailVerification></ProtectRoute>} />
          {/* <Route path="/privacy-policy" element={<PrivacyPolicy />} /> */}
          {/* <Route path="/terms-of-service" element={<TermsOfService />} /> */}
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;