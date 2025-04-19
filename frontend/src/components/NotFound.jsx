import "./NotFound.css"

const NotFound = () => {
  return (
    <div className="not-found-container">
      <div className="not-found-content">
        <div className="error-code">404</div>
        <h1 className="error-title">Page Not Found</h1>
        <p className="error-message">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        <div className="error-illustration">
          <div className="planet"></div>
          <div className="astronaut">
            <div className="astronaut-body"></div>
            <div className="astronaut-head"></div>
            <div className="astronaut-arm left"></div>
            <div className="astronaut-arm right"></div>
            <div className="astronaut-leg left"></div>
            <div className="astronaut-leg right"></div>
          </div>
        </div>
        <button className="home-button" onClick={() => (window.location.href = "/")}>
          Return Home
        </button>
      </div>
    </div>
  )
}

export default NotFound
