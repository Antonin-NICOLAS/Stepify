import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from 'react'
import { useAuth } from './AuthContext'

const ThemeContext = createContext()

const getSystemTheme = () => {
  if (
    window.matchMedia &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
  ) {
    return 'dark'
  }
  return 'light'
}

const getAutoTheme = () => {
  const hour = new Date().getHours()
  return hour >= 19 || hour < 7 ? 'dark' : 'light'
}

const resolveAutoTheme = () => {
  return window.matchMedia ? getSystemTheme() : getAutoTheme()
}

export const ThemeProvider = ({ children }) => {
  const { user } = useAuth()
  const [theme, setTheme] = useState('light')

  // Initialisation du thème
  useEffect(() => {
    if (user) {
      const pref = user.themePreference || 'auto'
      setTheme(pref === 'auto' ? resolveAutoTheme() : pref)
    } else {
      const stored = localStorage.getItem('theme')
      if (stored === 'dark' || stored === 'light') {
        setTheme(stored)
      } else {
        setTheme(resolveAutoTheme())
      }
    }
  }, [user])

  // Appliquer la classe sur le body
  useEffect(() => {
    document.body.classList.toggle('dark-theme', theme === 'dark')
  }, [theme])

  // Function Sidebar
  const toggleTheme = useCallback(() => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
    document.body.classList.toggle('dark-theme', newTheme === 'dark')

    // Si non connecté, on garde la préférence en local
    if (!user) {
      localStorage.setItem('theme', newTheme)
    }
  }, [theme, user])

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) throw new Error('useTheme must be used within a ThemeProvider')
  return context
}
