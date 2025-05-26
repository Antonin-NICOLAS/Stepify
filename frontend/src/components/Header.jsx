import React, { useState, useEffect, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
//context
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
//images
import Account from "../assets/account.jpeg";
import Logo from "../assets/icon.png";
//icons
import {
  LayoutDashboard,
  Award,
  Footprints,
  ChevronsLeft,
  AlignStartVertical,
  Menu,
  CircleGauge,
  Moon,
  Sun,
  Settings,
  Info,
  LogIn,
  LogOut,
  Users
} from 'lucide-react';
//CSS
import "./Header.css";

function Header() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  const sidebarRef = useRef(null);

  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev);
  };

  const handleLogout = () => {
    logout(() => {
      navigate("/login");
      setSidebarOpen(false);
    });
  };

  // Vérifie si la vue est mobile (< 1150px)
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobileView(window.innerWidth < 1150);
    };

    // Vérifie au chargement
    checkScreenSize();

    // Écoute les changements de taille
    window.addEventListener('resize', checkScreenSize);

    return () => {
      window.removeEventListener('resize', checkScreenSize);
    };
  }, []);

  // Gestion du clic en dehors de la sidebar
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Si on est en vue mobile ET la sidebar est ouverte ET le clic n'est pas dans la sidebar
      if (isMobileView && sidebarOpen && sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setSidebarOpen(false);
      }
    };

    // Ajoute l'écouteur seulement en vue mobile
    if (isMobileView) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobileView, sidebarOpen]);

  return (
    <>
      <header className={`header ${sidebarOpen ? "left-pd" : ""}`} id="header">
        <div className="header__container">
          <NavLink to="/" className="header__logo">
            <img src={Logo} alt="Logo" className="logo" />
            <span>Stepify</span>
          </NavLink>

          <div className="header__actions">
            <button className="header__toggle" onClick={toggleSidebar}>
              <Menu />
            </button>
          </div>
        </div>
      </header>

      <nav 
        className={`sidebar ${sidebarOpen ? "hide-sidebar" : ""}`} 
        id="sidebar"
        ref={sidebarRef}
      >
        <div className="sidebar__container">
          <div className="sidebar__user">
            <div className={user ? "sidebar__img user" : "sidebar__img"}>
              {user ? (
                <img src={user.avatarUrl} className="userimg" alt="profile" />
              ) : (
                <img src={Account} className="imgaccount" alt="profile" />
              )}
            </div>
            <div className="sidebar__info">
              <h3>{user ? (`${user.fullName}`) : ("Guest")}</h3>
              <span>{user && user.email}</span>
            </div>
          </div>
          <div className="sidebar__close">
            <button className="hide__sidebar sidebar__link" onClick={toggleSidebar}>
              <ChevronsLeft />
              <span>Fermer le menu</span>
            </button>
          </div>

          <div className="sidebar__content">
            <div>
              <h3 className="sidebar__title nav">NAVIGATION</h3>
              <div className="sidebar__list">
                <NavLink to="/dashboard" className="sidebar__link"><LayoutDashboard /><span>Dashboard</span></NavLink>
                <NavLink to="/steps" className="sidebar__link"><Footprints /><span>Mes pas</span></NavLink>
                <NavLink to="/challenges" className="sidebar__link"><CircleGauge /><span>Défis</span></NavLink>
                <NavLink to="/rewards" className="sidebar__link"><Award /><span>Récompenses</span></NavLink>
                <NavLink to="/leaderboard" className="sidebar__link"><AlignStartVertical /><span>Classement</span></NavLink>
                <NavLink to="/friends" className="sidebar__link"><Users /><span>Amis</span></NavLink>
              </div>
            </div>

            <div>
              <h3 className="sidebar__title">GENERAL</h3>
              <div className="sidebar__list">
                {user && (
                  <NavLink to="/settings" className="sidebar__link"><Settings /><span>Settings</span></NavLink>
                )}
                <NavLink to="/about" className="sidebar__link"><Info /><span>About</span></NavLink>
              </div>
            </div>
          </div>

          <div className="sidebar__actions">
            <button className="sidebar__link sidebar__theme" onClick={toggleTheme}>
              {theme === "dark" ? <Sun /> : <Moon />}
              <span>Theme</span>
            </button>
            {isAuthenticated ? (
              <button className="sidebar__link" onClick={handleLogout}><LogOut /><span>Log Out</span></button>
            ) : (
              <NavLink to="/login" className="sidebar__link"><LogIn /><span>Log In</span></NavLink>
            )}
          </div>
        </div>
      </nav>
    </>
  );
}

export default Header;