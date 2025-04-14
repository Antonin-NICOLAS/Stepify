import { useState } from 'react';
import { Button, Layout } from "antd";
import { MenuUnfoldOutlined, MenuFoldOutlined } from "@ant-design/icons";
import Logo from './logo.jsx';
import MenuList from './menulist.jsx';
import ToggleThemeButton from './toggletheme.jsx';
import './header.css';

const { Sider } = Layout;

function Navbar({ darkTheme, setDarkTheme, collapsed }) {
  const ToggleTheme = () => setDarkTheme(!darkTheme);

  return (
    <Sider
      trigger={null}
      collapsible
      collapsed={collapsed}
      className="sidebar"
      theme={darkTheme ? 'dark' : 'light'}
      style={{ height: '100vh', position: 'fixed', left: 0, top: 0, zIndex: 1000 }}
    >
      <Logo />
      <MenuList />
      <ToggleThemeButton darkTheme={darkTheme} ChangeTheme={ToggleTheme} />
    </Sider>
  );
}

export default Navbar;