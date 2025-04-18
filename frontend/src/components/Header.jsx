import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
//context
import { useUser } from "../context/UserContext.jsx";
//images
import Account from "../assets/account.png";
import Logo from "../assets/icon.png";
//icons
import {
  RiPieChart2Fill,
  RiBarChartBoxFill,
  RiSettings3Fill,
  RiLoginBoxLine,
  RiLogoutBoxRFill,
  RiMoonFill,
  RiCalendarFill,
  RiTrophyFill,
  RiGroupFill,
  RiInformationFill
} from "react-icons/ri";
import { GiHamburgerMenu } from "react-icons/gi";
//CSS
import "./Header.css";

function Header() {
  const { user, loading } = useUser();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkTheme, setDarkTheme] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("selected-theme");
    if (savedTheme === "dark") {
      document.body.classList.add("dark-theme");
      setDarkTheme(true);
    }
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev);
  };

  const toggleTheme = () => {
    const newTheme = !darkTheme;
    setDarkTheme(newTheme);
    document.body.classList.toggle("dark-theme");
    localStorage.setItem("selected-theme", newTheme ? "dark" : "light");
  };

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
              <GiHamburgerMenu />
            </button>
          </div>
        </div>
      </header>

      <nav className={`sidebar ${sidebarOpen ? "hide-sidebar" : ""}`} id="sidebar">
        <div className="sidebar__container">
          <div className="sidebar__user">
            <div className="sidebar__img">
              <img src={Account} alt="profile" />
            </div>
            <div className="sidebar__info">
              <h3>John Doe</h3>
              <span>john@example.com</span>
            </div>
          </div>

          <div className="sidebar__content">
            <div>
              <h3 className="sidebar__title nav">NAVIGATION</h3>
              <div className="sidebar__list">
                <NavLink to="/dashboard" className="sidebar__link"><RiPieChart2Fill /><span>Dashboard</span></NavLink>
                <NavLink to="/challenges" className="sidebar__link"><RiTrophyFill /><span>Challenges</span></NavLink>
                <NavLink to="/activities" className="sidebar__link"><RiCalendarFill /><span>Activities</span></NavLink>
                <NavLink to="/leaderboard" className="sidebar__link"><RiGroupFill /><span>Leaderboard</span></NavLink>
                <NavLink to="/statistics" className="sidebar__link"><RiBarChartBoxFill /><span>Statistics</span></NavLink>
              </div>
            </div>

            <div>
              <h3 className="sidebar__title">GENERAL</h3>
              <div className="sidebar__list">
                {user ? (
                  <NavLink to="/settings" className="sidebar__link"><RiSettings3Fill /><span>Settings</span></NavLink>
                ) : (<></>)}
                <NavLink to="/about" className="sidebar__link"><RiInformationFill /><span>About</span></NavLink>
              </div>
            </div>
          </div>

          <div className="sidebar__actions">
            <button className="sidebar__link sidebar__theme" onClick={toggleTheme}>
              <RiMoonFill />
              <span>Theme</span>
            </button>
            {user ? (
              <button className="sidebar__link"><RiLogoutBoxRFill /><span>Log Out</span></button>
            ) : (
              <NavLink to="/login" className="sidebar__link"><RiLoginBoxLine /><span>Log In</span></NavLink>
            )}
          </div>
        </div>
      </nav>
    </>
  );
}

export default Header;
