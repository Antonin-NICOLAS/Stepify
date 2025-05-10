import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useUser } from './UserContext';

const ThemeContext = createContext();

const getAutoTheme = () => {
  const hour = new Date().getHours();
  return (hour >= 19 || hour < 7) ? 'dark' : 'light';
};

export const ThemeProvider = ({ children }) => {
  const { user, setUser } = useAuth();
  const { updateThemePreference } = useUser();
  const [theme, setTheme] = useState('light');

  // Appliquer le thème basé sur la préférence utilisateur
  useEffect(() => {
    if (!user) return;

    const preferred = user.themePreference;
    const resolvedTheme = preferred === 'auto' ? getAutoTheme() : preferred;
    setTheme(resolvedTheme);
  }, [user]);

  // Appliquer la classe CSS à <body>
  useEffect(() => {
    document.body.classList.toggle('dark-theme', theme === 'dark');
  }, [theme]);

  // Changer le thème (toggle uniquement entre dark et light)
  const toggleTheme = useCallback(() => {
    if (user) {
      let newPreference;
      if (user.themePreference === 'auto') {
        newPreference = getAutoTheme() === 'dark' ? 'light' : 'dark';
      } else {
        newPreference = user.themePreference === 'dark' ? 'light' : 'dark';
      }

      // Update user preference both locally and in DB
      setUser({ ...user, themePreference: newPreference });
      updateThemePreference(user?._id, newPreference);

      setTheme(newPreference);
    } else {
      const current = document.body.classList.contains('dark-theme') ? 'dark' : 'light';
      const newTheme = current === 'dark' ? 'light' : 'dark';

      // Applique le thème au body
      document.body.classList.toggle('dark-theme');

      // Met à jour le state global du thème
      setTheme(newTheme);

      // (Facultatif) sauvegarder dans localStorage
      localStorage.setItem('theme', newTheme);
    }
  }, [user, setUser, setTheme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};