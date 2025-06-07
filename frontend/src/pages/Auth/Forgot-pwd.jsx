import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
//loader
import GlobalLoader from "../../utils/GlobalLoader";
//context
import { useAuth } from "../../context/AuthContext";
import { useTranslation } from "react-i18next";
//icons
import {
  Mail,
  Send,
  ArrowLeft,
  KeyRound,
  LockKeyhole,
  HelpCircle,
} from "lucide-react";
//CSS
import "./Forgot-pwd.css";

function ForgotPassword() {
  const { t } = useTranslation(["auth"]);
  const navigate = useNavigate();
  const { forgotPassword } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");

  const handleForgotPwd = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await forgotPassword(email, () => navigate("/email-sent"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="forgot-password-page">
      {isLoading && <GlobalLoader />}
      <div className="auth-container">
        <div className="auth-visual-section">
          <div className="auth-visual-content">
            <div className="auth-logo">
              <span>Stepify</span>
            </div>
            <div className="auth-stats">
              <div
                className="auth-stat-item"
                style={{ flexDirection: "column" }}
              >
                <h3>{t("auth:auth.forgotpassword.visual.title")}</h3>
                <p>{t("auth:auth.forgotpassword.visual.description")}</p>
              </div>
              <div className="auth-stat-item">
                <div className="auth-stat-icon">
                  <Mail />
                </div>
                <div className="auth-stat-info">
                  <h4>{t("auth:auth.forgotpassword.visual.step1")}</h4>
                  <p>{t("auth:auth.forgotpassword.visual.step1description")}</p>
                </div>
              </div>
              <div className="auth-stat-item">
                <div className="auth-stat-icon">
                  <KeyRound />
                </div>
                <div className="auth-stat-info">
                  <h4>{t("auth:auth.forgotpassword.visual.step2")}</h4>
                  <p>{t("auth:auth.forgotpassword.visual.step2description")}</p>
                </div>
              </div>
              <div className="auth-stat-item">
                <div className="auth-stat-icon">
                  <HelpCircle />
                </div>
                <div className="auth-stat-info">
                  <h4>{t("auth:auth.forgotpassword.visual.step3")}</h4>
                  <p>{t("auth:auth.forgotpassword.visual.step3descrption")}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="auth-form-section">
          <div className="auth-form-container">
            <form className="auth-form" onSubmit={handleForgotPwd}>
              <div className="auth-form-header">
                <div className="auth-icon-container">
                  <div className="auth-icon">
                    <LockKeyhole />
                  </div>
                </div>
                <h2>{t("auth:auth.forgotpassword.form.title")}</h2>
                <p className="auth-subtitle">
                  {t("auth:auth.forgotpassword.form.description")}
                </p>
              </div>

              <div className="auth-form-content">
                <div className="auth-input-group">
                  <label htmlFor="email">
                    {t("auth:auth.forgotpassword.form.email")}
                  </label>
                  <div className="auth-input-wrapper">
                    <Mail className="auth-input-icon" />
                    <input
                      id="email"
                      type="email"
                      placeholder="Entrez votre email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="auth-button auth-button-primary"
                  disabled={isLoading}
                >
                  <Send />
                  <span>
                    {isLoading
                      ? t("auth:auth.forgotpassword.form.sendinprogress")
                      : t("auth:auth.forgotpassword.form.send")}
                  </span>
                </button>

                <Link to="/login" className="auth-button auth-button-secondary">
                  <ArrowLeft />
                  <span>{t("auth:auth.forgotpassword.form.return")}</span>
                </Link>
              </div>

              <div className="auth-form-footer">
                <span>{t("auth:auth.forgotpassword.footer.question")}</span>
                <Link to="/login">
                  {t("auth:auth.forgotpassword.footer.button")}
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
