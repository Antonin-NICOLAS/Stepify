import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from './store/CheckAuth.js';
import axios from 'axios';
import { Toaster } from "react-hot-toast"
//layouts
import MainLayout from './MainLayout.jsx';
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
import ForgotPassword from './components/Auth/Forgot-pwd.jsx';
import EmailSent from './components/Auth/EmailSent.jsx';
import ResetPassword from './components/Auth/Reset-pwd.jsx';
//CSS
import './App.css';
import './index.css';

{/*TODO https://step-ify.vercel.app/privacy-policy et https://step-ify.vercel.app/settings*/ }

axios.defaults.baseURL = process.env.NODE_ENV === "production" ? '' : process.env.BACKEND_SERVER,
  axios.defaults.withCredentials = true

//Authentification
const ProtectRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const AuthenticatedUserRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();
  if (isAuthenticated && user) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

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
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/challenges" element={<Challenges />} />
            <Route path="/activities" element={<Activities />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/statistics" element={<Statistics />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/about" element={<About />} />
          </Route>

          {/* Pages sans header/sidebar */}
          <Route path="/login" element={<AuthenticatedUserRoute><Login /></AuthenticatedUserRoute>} />
          <Route path="/forgot-password" element={<ProtectRoute><ForgotPassword /></ProtectRoute>} />
          <Route path="/email-sent" element={<ProtectRoute><EmailSent /></ProtectRoute>} />
          <Route path="/reset-password/:token" element={<ProtectRoute><ResetPassword /></ProtectRoute>} />
          {/* <Route path="/privacy-policy" element={<PrivacyPolicy />} /> */}
          {/* <Route path="/terms-of-service" element={<TermsOfService />} /> */}
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;