import { Link } from "react-router-dom";
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
                <h3>Vérification</h3>
                <p>Nous prenons la sécurité de votre compte au sérieux</p>
              </div>
              <div className="auth-stat-item">
                <div className="auth-stat-icon">
                  <Mail />
                </div>
                <div className="auth-stat-info">
                  <h4>Email envoyé</h4>
                  <p>Vérifiez votre boîte de réception</p>
                </div>
              </div>
              <div className="auth-stat-item">
                <div className="auth-stat-icon">
                  <AlertCircle />
                </div>
                <div className="auth-stat-info">
                  <h4>Pas reçu?</h4>
                  <p>Vérifiez vos spams ou demandez un nouvel envoi</p>
                </div>
              </div>
              <div className="auth-stat-item">
                <div className="auth-stat-icon">
                  <CheckCircle2 />
                </div>
                <div className="auth-stat-info">
                  <h4>Prochaine étape</h4>
                  <p>Cliquez sur le lien dans l'email pour continuer</p>
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
              <h2>Email envoyé!</h2>
              <p className="auth-subtitle">Vérifiez votre boîte de réception</p>
            </div>

            <div className="auth-form-content">
              <div className="email-sent-message">
                <p>
                  Nous avons envoyé un lien de réinitialisation à votre adresse
                  email.
                </p>
                <p>
                  Cliquez sur le lien dans l'email pour réinitialiser votre mot
                  de passe.
                </p>
              </div>

              <div className="email-sent-info">
                <p>Vous n'avez pas reçu l'email?</p>
                <ul>
                  <li>Vérifiez votre dossier spam ou courrier indésirable</li>
                  <li>Assurez-vous que l'adresse email est correcte</li>
                </ul>
              </div>

              <Link
                to="/forgot-password"
                className="auth-button auth-button-secondary"
              >
                <CornerDownLeft />
                <span>Retour</span>
              </Link>
            </div>

            <div className="auth-form-footer">
              <span>Besoin d'aide?</span>
              <a href="mailto:stepify.contact@gmail.com">Contactez-nous</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EmailSent;
