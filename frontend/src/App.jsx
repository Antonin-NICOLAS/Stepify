import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Layout, Button } from "antd";
import { MenuUnfoldOutlined, MenuFoldOutlined } from "@ant-design/icons";
import './app.css';
import Navbar from './components/header.jsx';
import Home from './pages/home.jsx';

const { Header, Content } = Layout;

function App() {
  const [darkTheme, setDarkTheme] = useState(true);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkTheme ? 'dark' : 'light');
  }, [darkTheme]);

  return (
    <div className="App">
      <BrowserRouter>
        <Layout style={{ minHeight: '100vh' }}>
          <Navbar darkTheme={darkTheme} setDarkTheme={setDarkTheme} collapsed={collapsed} />
          <Layout className="site-layout" style={{ marginLeft: collapsed ? 80 : 200 }}>
            <Header className="site-header" style={{ background: 'var(--Couleur1)', padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Button
                type="text"
                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                onClick={() => setCollapsed(!collapsed)}
                style={{ fontSize: '1.2rem', color: 'var(--Couleur)' }}
              />
              <h2 style={{ margin: 0, color: 'var(--Couleur)', fontFamily: "zafino" }}>Stepify</h2>
            </Header>
            <Content className="site-content">
              <Routes>
                <Route path="/" element={<Home />} />
              </Routes>
            </Content>
          </Layout>
        </Layout>
      </BrowserRouter>
    </div>
  );
}

export default App;