import { useState } from 'react';
import { Button, Layout, theme } from "antd";
import { MenuUnfoldOutlined, MenuFoldOutlined } from "@ant-design/icons"
//pages
import Logo from './logo.jsx'
import MenuList from './menulist.jsx';
import ToggleThemeButton from './toggletheme.jsx';
//CSS
import './header.css';

const { Header, Sider } = Layout

function Navbar() {
  const [darkTheme, setdarkTheme] = useState(true)
  const [collapsed, setcollapsed] = useState(false)
  const ToggleTheme = () => {
    setdarkTheme(!darkTheme);
  }
  const {token: {colorBgContainer}} = theme.useToken()

  return (
    <>
      <Sider collapsed={collapsed} collapsible trigger={null} className="sidebar" theme={darkTheme ? 'dark' : 'light'}>
        <Logo />
        <MenuList darkTheme={darkTheme} />
        <ToggleThemeButton darkTheme={darkTheme} ChangeTheme={ToggleTheme} />
      </Sider>
      <Layout>
        <Header style={{padding: 0, background: colorBgContainer}}>
          <Button type='text' className='toggle' onClick={() => setcollapsed(!collapsed)} icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}>
          </Button>
          </Header>
      </Layout>
    </>
  );
}

export default Navbar;