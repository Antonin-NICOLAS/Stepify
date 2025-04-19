import { BrowserRouter } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from './store/CheckAuth.js';
import { useThemeStore } from './store/Theme.js';
import axios from 'axios';
import { Toaster } from 'react-hot-toast';
import AppRoutes from './routes/AppRoutes.jsx';
import './App.css';
import './index.css';

axios.defaults.baseURL = process.env.NODE_ENV === "production" ? '' : process.env.BACKEND_SERVER;
axios.defaults.withCredentials = true;

function App() {
  const { checkAuth } = useAuthStore();
  const { theme, setTheme } = useThemeStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    setTheme(theme);
  }, []);

  return (
    <div className="App">
      <BrowserRouter>
        <Toaster
          position="top-right"
          reverseOrder={false}
          toastOptions={{
            duration: 3000,
            style: {
              background: 'var(--bleu)',
              color: '#fff',
            },
          }}
        />
        <AppRoutes />
      </BrowserRouter>
    </div>
  );
}

export default App;