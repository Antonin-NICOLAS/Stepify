import { BrowserRouter, Routes, Route } from 'react-router-dom'
//pages
import Navbar from './components/header.jsx';
import Home from './pages/home.jsx';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Navbar/>
        <div className="pages">
          <Routes>
            <Route path="/" element={<Home />} />
          </Routes>
        </div>
      </BrowserRouter>
    </div>
  );
}

export default App;
