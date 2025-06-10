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
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { forgotPassword } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");

  const handleForgotPwd = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await forgotPassword(email, () => navigate("/email-sent"));
    } catch (error) {
      console.error("Error during password reset:", error);
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
                <h3>{t("auth.forgotpassword.visual.title")}</h3>
                <p>{t("auth.forgotpassword.visual.description")}</p>
              </div>
              <div className="auth-stat-item">
                <div className="auth-stat-icon">
                  <Mail />
                </div>
                <div className="auth-stat-info">
                  <h4>{t("auth.forgotpassword.visual.step1")}</h4>
                  <p>{t("auth.forgotpassword.visual.step1description")}</p>
                </div>
              </div>
              <div className="auth-stat-item">
                <div className="auth-stat-icon">
                  <KeyRound />
                </div>
                <div className="auth-stat-info">
                  <h4>{t("account.password.new")}</h4>
                  <p>{t("auth.forgotpassword.visual.step2description")}</p>
                </div>
              </div>
              <div className="auth-stat-item">
                <div className="auth-stat-icon">
                  <HelpCircle />
                </div>
                <div className="auth-stat-info">
                  <h4>{t("auth.forgotpassword.visual.step3")}</h4>
                  <p>{t("auth.forgotpassword.visual.step3description")}</p>
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
                <h2>{t("auth.forgotpassword.form.title")}</h2>
                <p className="auth-subtitle">
                  {t("auth.forgotpassword.form.description")}
                </p>
              </div>

              <div className="auth-form-content">
                <div className="auth-input-group">
                  <label htmlFor="email">{t("common.email")}</label>
                  <div className="auth-input-wrapper">
                    <Mail className="auth-input-icon" />
                    <input
                      id="email"
                      type="email"
                      autoComplete="email"
                      placeholder={t("auth.forgotpassword.form.enteremail")}
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
                      ? t("auth.forgotpassword.form.sendinprocess")
                      : t("auth.forgotpassword.form.send")}
                  </span>
                </button>

                <Link to="/login" className="auth-button auth-button-secondary">
                  <ArrowLeft />
                  <span>{t("auth.forgotpassword.form.return")}</span>
                </Link>
              </div>

              <div className="auth-form-footer">
                <span>{t("auth.forgotpassword.footer.question")}</span>
                <Link to="/login">
                  {t("auth.forgotpassword.footer.button")}
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
