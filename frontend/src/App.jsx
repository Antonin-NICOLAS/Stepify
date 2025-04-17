import { BrowserRouter, Routes, Route } from 'react-router-dom';
import axios from 'axios';
import { Toaster } from "react-hot-toast"
//layouts
import MainLayout from './MainLayout.jsx';
//context
import { UserProvider } from './context/UserContext.jsx';
//pages
import Login from './components/Auth/Login.jsx';
import Home from './pages/Home.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Challenges from './pages/Challenges.jsx';
import Activities from './pages/Activities.jsx';
import Leaderboard from './pages/Leaderboard.jsx';
import Statistics from './pages/Statistics.jsx';
import Settings from './pages/Settings.jsx';
import About from './pages/About.jsx';
//CSS
import './App.css';
import './index.css';

{/*TODO https://step-ify.vercel.app/privacy-policy et https://step-ify.vercel.app/settings*/ }

axios.defaults.baseURL = process.env.NODE_ENV === "production" ? '' : process.env.BACKEND_SERVER,
  axios.defaults.withCredentials = true

function App() {
  return (
    <div className="App">
      <UserProvider>
        <BrowserRouter>
          <Toaster
            position="top-right"
            reverseOrder={false}
            toastOptions={{
              className: '',
              duration: 3000,
              style: {
                background: 'var(--body-color)',
                color: '#000',
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
            <Route path="/login" element={<Login />} />
          </Routes>
        </BrowserRouter>
      </UserProvider>
    </div>
  );
}

export default App;