import { useNavigate, useLocation, Link } from "react-router-dom"
import "./NotFound.css"
import { Home, ArrowLeft, Search } from "lucide-react"

const NotFoundPage = () => {
  const navigate = useNavigate();

  const goBack = () => {
      navigate(-1);
  }

  const goHome = () => {
    navigate("/");
  }

  return (
    <div className="not-found-container">
      <div className="not-found-content">
        <div className="not-found-card">
          <div className="error-code">
            <div className="digit">4</div>
            <div className="digit-animation">
              <div className="circle"></div>
              <div className="circle"></div>
              <div className="circle"></div>
            </div>
            <div className="digit">4</div>
          </div>

          <h1 className="error-title">Page Not Found</h1>
          <p className="error-message">
            Oops! The page you're looking for seems to have wandered off on its own adventure.
          </p>

          <div className="illustration">
            <div className="map">
              <div className="map-marker pulse"></div>
              <div className="map-path"></div>
            </div>
          </div>

          <div className="action-buttons">
            <button className="action-btn back-btn" onClick={goBack}>
              <ArrowLeft size={18} />
              <span>Go Back</span>
            </button>
            <button className="action-btn home-btn" onClick={goHome}>
              <Home size={18} />
              <span>Home Page</span>
            </button>
          </div>

          <div className="search-container">
            <div className="search-label">Or try searching for something else:</div>
            <div className="search-box">
              <input type="text" placeholder="Search..." /> {/* TODO: search function + french version */}
              <button className="search-btn">
                <Search size={18} />
              </button>
            </div>
          </div>
        </div>

        <div className="suggestions-card">
          <h3>You might be looking for:</h3>
          <ul className="suggestion-links">
            <li>
              <Link to="/dashboard">Dashboard</Link>
            </li>
            <li>
              <Link to="/steps">Mes pas</Link>
            </li>
            <li>
              <Link to="/challenges">Challenges</Link>
            </li>
            <li>
              <Link to="/settings">Réglages</Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default NotFoundPage
