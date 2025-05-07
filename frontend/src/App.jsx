import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { UserProvider } from './context/UserContext';
import { ThemeProvider } from './context/ThemeContext';
import axios from 'axios';
import { Toaster } from 'react-hot-toast';
import AppRoutes from './routes/AppRoutes.jsx';
import './App.css';
import './index.css';

axios.defaults.baseURL = process.env.NODE_ENV === "production" ? '' : process.env.BACKEND_SERVER;
axios.defaults.withCredentials = true;

function App() {

  return (
    <div className="App">
        <AuthProvider>
          <UserProvider>
            <ThemeProvider>
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
            </ThemeProvider>
          </UserProvider>
        </AuthProvider>
    </div>
  );
}

export default App;