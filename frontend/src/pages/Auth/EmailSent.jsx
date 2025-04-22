import { Link } from "react-router-dom"
//icons
import { MailCheck } from 'lucide-react';
import { CornerDownLeft } from 'lucide-react';
//CSS
import "./EmailSent.css"

function EmailSent() {
  return (
    <div className="emailsent-body">
      <div className="emailsent-container">
        <div className="emailsent-form">
          <div className="email-icon-container">
            <div className="email-icon">
              <MailCheck />
            </div>
          </div>

          <h2>Email envoyé!</h2>
          <p className="subtitle">Vérifiez votre boîte de réception</p>

          <div className="email-sent-message">
            <p>Nous avons envoyé un lien de réinitialisation à votre adresse email.</p>
            <p>Cliquez sur le lien dans l'email pour réinitialiser votre mot de passe.</p>
          </div>

          <div className="email-sent-info">
            <p>Vous n'avez pas reçu l'email?</p>
            <ul>
              <li>Vérifiez votre dossier spam ou courrier indésirable</li>
              <li>Assurez-vous que l'adresse email est correcte</li>
            </ul>
          </div>

          <Link to="/forgot-password" className="secondary-btn">
            Retour <CornerDownLeft />
          </Link>

          <div className="form-footer">
            <span>Besoin d'aide?</span>
            <Link to="/contact">Contactez-nous</Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EmailSent