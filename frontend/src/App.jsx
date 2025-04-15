import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './app.css';
import Header from './components/Header.jsx';
import Home from './pages/Home.jsx';

function App() {

  return (
    <div className="App">
      <BrowserRouter>
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;