import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
//loader
import GlobalLoader from "../../utils/GlobalLoader";
//context
import { useAuth } from "../../context/AuthContext";
import { useTranslation } from "react-i18next";
//icons
import { Mail, Send, ArrowLeft, AtSign, CheckCircle2 } from "lucide-react";
//CSS
import "./ChangeEmail.css";

function ChangeEmail() {
  const { t } = useTranslation(["auth"]);
  const navigate = useNavigate();
  const { changeVerificationEmail } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const [email, setEmail] = useState("");

  const handleChangeVerificationEmail = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await changeVerificationEmail(email, () => {
        setEmail("");
        navigate("/email-verification");
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="change-email-page">
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
                <h3>{t("auth:auth.changeemail.visual.title")}</h3>
                <p>{t("auth:auth.changeemail.visual.description")}n</p>
              </div>
              <div className="auth-stat-item">
                <div className="auth-stat-icon">
                  <Mail />
                </div>
                <div className="auth-stat-info">
                  <h4>{t("auth:auth.changeemail.visual.newemail")}</h4>
                  <p>{t("auth:auth.changeemail.visual.enternewemail")}</p>
                </div>
              </div>
              <div className="auth-stat-item">
                <div className="auth-stat-icon">
                  <CheckCircle2 />
                </div>
                <div className="auth-stat-info">
                  <h4>{t("auth:auth.changeemail.visual.verification")}</h4>
                  <p>{t("auth:auth.changeemail.visual.receiveverification")}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="auth-form-section">
          <div className="auth-form-container">
            <form
              className="auth-form"
              onSubmit={handleChangeVerificationEmail}
            >
              <div className="auth-form-header">
                <div className="auth-icon-container">
                  <div className="auth-icon">
                    <AtSign />
                  </div>
                </div>
                <h2>{t("auth:auth.changeemail.form.title")}</h2>
                <p className="auth-subtitle">
                  {t("auth:auth.changeemail.form.description")}
                </p>
              </div>

              <div className="auth-form-content">
                <div className="auth-input-group">
                  <label htmlFor="email">
                    {t("auth:auth.changeemail.form.email")}
                  </label>
                  <div className="auth-input-wrapper">
                    <Mail className="auth-input-icon" />
                    <input
                      id="email"
                      type="email"
                      placeholder={t("auth:auth.changeemail.form.enteremail")}
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
                      ? t("auth:auth.changeemail.form.sendinprocess")
                      : t("auth:auth.changeemail.form.send")}
                  </span>
                </button>

                <Link
                  to="/email-verification"
                  className="auth-button auth-button-secondary"
                >
                  <ArrowLeft />
                  <span>{t("auth:auth.changeemail.form.return")}</span>
                </Link>
              </div>

              <div className="auth-form-footer">
                <span>{t("auth:auth.changeemail.footer.question")}</span>
                <Link to="/email-verification">{t("auth:auth.changeemail.footer.button")}</Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChangeEmail;
