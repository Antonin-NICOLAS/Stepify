import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import { Layout } from "antd";
//pages
import './app.css';
import Navbar from './components/header.jsx';
import Home from './pages/home.jsx';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Layout>
          <Navbar/>
          <div className="pages">
            <Routes>
              <Route path="/" element={<Home />} />
            </Routes>
          </div>
        </Layout>
      </BrowserRouter>
    </div>
  );
}

export default App;
