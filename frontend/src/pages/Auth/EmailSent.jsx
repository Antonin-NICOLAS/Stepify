import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
//icons
import {
  MailCheck,
  CornerDownLeft,
  Mail,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
//CSS
import "./EmailSent.css";

function EmailSent() {
  const { t } = useTranslation(["auth"]);
  return (
    <div className="email-sent-page">
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
                <h3>{t("auth:auth.emailsent.visual.title")}</h3>
                <p>{t("auth:auth.emailsent.visual.description")}</p>
              </div>
              <div className="auth-stat-item">
                <div className="auth-stat-icon">
                  <Mail />
                </div>
                <div className="auth-stat-info">
                  <h4>{t("auth:auth.emailsent.visual.step1")}</h4>
                  <p>{t("auth:auth.emailsent.visual.step1description")}</p>
                </div>
              </div>
              <div className="auth-stat-item">
                <div className="auth-stat-icon">
                  <AlertCircle />
                </div>
                <div className="auth-stat-info">
                  <h4>{t("auth:auth.emailsent.visual.step2")}</h4>
                  <p>{t("auth:auth.emailsent.visual.step2description")}</p>
                </div>
              </div>
              <div className="auth-stat-item">
                <div className="auth-stat-icon">
                  <CheckCircle2 />
                </div>
                <div className="auth-stat-info">
                  <h4>{t("auth:auth.emailsent.visual.step3")}</h4>
                  <p>{t("auth:auth.emailsent.visual.step3description")}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="auth-form-section">
          <div className="auth-form-container">
            <div className="auth-form-header">
              <div className="auth-icon-container">
                <div className="auth-icon">
                  <MailCheck />
                </div>
              </div>
              <h2>{t("auth:auth.emailsent.content.title")}</h2>
              <p className="auth-subtitle">{t("auth:auth.emailsent.content.description")}</p>
            </div>

            <div className="auth-form-content">
              <div className="email-sent-message">
                <p>
                  {t("auth:auth.emailsent.content.message1")}
                </p>
                <p>
                  {t("auth:auth.emailsent.content.message2")}
                </p>
              </div>

              <div className="email-sent-info">
                <p>{t("auth:auth.emailsent.content.infotitle")}</p>
                <ul>
                  <li>{t("auth:auth.emailsent.content.infodescription")}</li>
                  <li>{t("auth:auth.emailsent.content.correctemail")}</li>
                </ul>
              </div>

              <Link
                to="/forgot-password"
                className="auth-button auth-button-secondary"
              >
                <CornerDownLeft />
                <span>{t("auth:auth.emailsent.content.return")}</span>
              </Link>
            </div>

            <div className="auth-form-footer">
              <span>{t("auth:auth.emailsent.footer.question")}</span>
              <a href="mailto:stepify.contact@gmail.com">{t("auth:auth.emailsent.footer.button")}</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EmailSent;
