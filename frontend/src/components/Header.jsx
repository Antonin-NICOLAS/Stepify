import React, { useState, useEffect, useRef } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
//context
import { useTheme } from '../context/ThemeContext'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'
//images
import Account from '../assets/account.png'
import Logo from '../assets/icon.png'
//icons
import {
  LayoutDashboard,
  Award,
  Footprints,
  ChevronsLeft,
  AlignStartVertical,
  Menu,
  Dumbbell,
  Moon,
  Sun,
  Settings,
  Info,
  LogIn,
  LogOut,
  Users,
} from 'lucide-react'
//CSS
import './Header.css'

function Header() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { user, isAuthenticated, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isMobileView, setIsMobileView] = useState(false)
  const closeMenuRef = useRef(null)
  const sidebarRef = useRef(null)

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev)
  }

  const handleLogout = () => {
    logout(() => {
      navigate('/login')
      setSidebarOpen(false)
    })
  }

  const handleNavClick = () => {
    if (isMobileView) {
      setSidebarOpen(false)
    }
  }

  // Vérifie si la vue est mobile (< 1150px)
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobileView(window.innerWidth < 1150)
    }

    // Vérifie au chargement
    checkScreenSize()

    // Écoute les changements de taille
    window.addEventListener('resize', checkScreenSize)

    return () => {
      window.removeEventListener('resize', checkScreenSize)
    }
  }, [])

  // Gestion du clic en dehors de la sidebar
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Si on est en vue mobile ET la sidebar est ouverte ET le clic n'est pas dans la sidebar
      if (
        isMobileView &&
        sidebarOpen &&
        sidebarRef.current &&
        closeMenuRef.current &&
        !sidebarRef.current.contains(event.target) &&
        !closeMenuRef.current.contains(event.target)
      ) {
        setSidebarOpen(false)
      }
    }

    // Ajoute l'écouteur seulement en vue mobile
    if (isMobileView) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isMobileView, sidebarOpen])

  return (
    <>
      <header className={`header ${sidebarOpen ? 'left-pd' : ''}`} id="header">
        <div className="header__container">
          <NavLink
            to={user ? '/dashboard' : '/'}
            onClick={handleNavClick}
            className="header__logo"
          >
            <img src={Logo} alt="Logo" className="logo" />
            <span>Stepify</span>
          </NavLink>

          <div className="header__actions" ref={closeMenuRef}>
            <button className="header__toggle" onClick={toggleSidebar}>
              <Menu />
            </button>
          </div>
        </div>
      </header>

      <nav
        className={`sidebar ${sidebarOpen ? 'hide-sidebar' : ''}`}
        id="sidebar"
        ref={sidebarRef}
      >
        <div className="sidebar__container">
          <div className="sidebar__user">
            <div className={user ? 'sidebar__img user' : 'sidebar__img'}>
              {user ? (
                <img src={user.avatarUrl} className="userimg" alt="profile" />
              ) : (
                <img src={Account} className="imgaccount" alt="profile" />
              )}
            </div>
            {user ? (
              <NavLink to="/profile" className="sidebar__info">
                <h3>{user && user.fullName}</h3>
                <span>{user && user.email}</span>
              </NavLink>
            ) : (
              <div className="sidebar__info">
                <h3>{user ? `${user.fullName}` : t('common.header.guest')}</h3>
                <span>{user && user.email}</span>
              </div>
            )}
          </div>
          <div className="sidebar__close">
            <button
              className="hide__sidebar sidebar__link"
              onClick={toggleSidebar}
            >
              <ChevronsLeft />
              <span>{t('common.header.close')}</span>
            </button>
          </div>

          <div className="sidebar__content">
            <div>
              <h3 className="sidebar__title nav">
                {t('common.header.title1')}
              </h3>
              <div className="sidebar__list">
                <NavLink
                  to="/dashboard"
                  onClick={handleNavClick}
                  className={({ isActive }) =>
                    `sidebar__link ${isActive ? 'active' : ''}`
                  }
                >
                  <LayoutDashboard />
                  <span>{t('common.header.dashboard')}</span>
                </NavLink>
                <NavLink
                  to="/steps"
                  onClick={handleNavClick}
                  className={({ isActive }) =>
                    `sidebar__link ${isActive ? 'active' : ''}`
                  }
                >
                  <Footprints />
                  <span>{t('common.header.steps')}</span>
                </NavLink>
                <NavLink
                  to="/challenges"
                  onClick={handleNavClick}
                  className={({ isActive }) =>
                    `sidebar__link ${isActive ? 'active' : ''}`
                  }
                >
                  <Dumbbell />
                  <span>{t('common.header.challenges')}</span>
                </NavLink>
                <NavLink
                  to="/rewards"
                  onClick={handleNavClick}
                  className={({ isActive }) =>
                    `sidebar__link ${isActive ? 'active' : ''}`
                  }
                >
                  <Award />
                  <span>{t('common.header.rewards')}</span>
                </NavLink>
                <NavLink
                  to="/leaderboard"
                  onClick={handleNavClick}
                  className={({ isActive }) =>
                    `sidebar__link ${isActive ? 'active' : ''}`
                  }
                >
                  <AlignStartVertical />
                  <span>{t('common.header.leaderboard')}</span>
                </NavLink>
                <NavLink
                  to="/friends"
                  onClick={handleNavClick}
                  className={({ isActive }) =>
                    `sidebar__link ${isActive ? 'active' : ''}`
                  }
                >
                  <Users />
                  <span>{t('common.header.friends')}</span>
                </NavLink>
              </div>
            </div>

            <div>
              <h3 className="sidebar__title">{t('common.header.title2')}</h3>
              <div className="sidebar__list">
                {user && (
                  <NavLink
                    to="/settings"
                    onClick={handleNavClick}
                    className={({ isActive }) =>
                      `sidebar__link ${isActive ? 'active' : ''}`
                    }
                  >
                    <Settings />
                    <span>{t('common.header.settings')}</span>
                  </NavLink>
                )}
                <NavLink
                  to="/about"
                  onClick={handleNavClick}
                  className={({ isActive }) =>
                    `sidebar__link ${isActive ? 'active' : ''}`
                  }
                >
                  <Info />
                  <span>{t('common.header.about')}</span>
                </NavLink>
              </div>
            </div>
          </div>

          <div className="sidebar__actions">
            <div className="sidebar__link sidebar__theme" onClick={toggleTheme}>
              {theme === 'dark' ? <Sun /> : <Moon />}
              <span>{t('common.header.theme')}</span>
            </div>
            {isAuthenticated ? (
              <button className="sidebar__link" onClick={handleLogout}>
                <LogOut />
                <span>{t('common.header.logout')}</span>
              </button>
            ) : (
              <NavLink
                to="/login"
                onClick={handleNavClick}
                className="sidebar__link"
              >
                <LogIn />
                <span>{t('common.header.login')}</span>
              </NavLink>
            )}
          </div>
        </div>
      </nav>
    </>
  )
}

export default Header
