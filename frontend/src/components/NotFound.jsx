import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./NotFound.css";
import { Home, ArrowLeft, Search } from "lucide-react";

const NotFoundPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const goBack = () => {
    navigate(-1);
  };

  const goHome = () => {
    navigate("/");
  };

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

          <h1 className="error-title">{t("common.notfound.title")}</h1>
          <p className="error-message">{t("common.notfound.message")}</p>

          <div className="illustration">
            <div className="map">
              <div className="map-marker pulse"></div>
              <div className="map-path"></div>
            </div>
          </div>

          <div className="action-buttons">
            <button className="action-btn back-btn" onClick={goBack}>
              <ArrowLeft size={18} />
              <span>{t("common.back")}</span>
            </button>
            <button className="action-btn home-btn" onClick={goHome}>
              <Home size={18} />
              <span>{t("common.notfound.home")}</span>
            </button>
          </div>

          <div className="search-container">
            <div className="search-label">{t("common.notfound.search")}</div>
            <div className="search-box">
              <input
                type="text"
                placeholder={t("common.notfound.searchplaceholder")}
              />{" "}
              {/* TODO: search function + french version */}
              <button className="search-btn">
                <Search size={18} />
              </button>
            </div>
          </div>
        </div>

        <div className="suggestions-card">
          <h3>{t("common.notfound.suggestions")}</h3>
          <ul className="suggestion-links">
            <li>
              <Link to="/dashboard">{t("common.header.dashboard")}</Link>
            </li>
            <li>
              <Link to="/steps">{t("common.header.steps")}</Link>
            </li>
            <li>
              <Link to="/challenges">{t("common.header.challenges")}</Link>
            </li>
            <li>
              <Link to="/settings">{t("common.header.settings")}</Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
