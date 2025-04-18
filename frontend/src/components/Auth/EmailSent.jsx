import { Link } from "react-router-dom"
//icons
import { RiMailCheckLine } from "react-icons/ri"
import { LuArrowLeft } from "react-icons/lu"
//CSS
import "./Pwd-manage.css"

function EmailSent() {
  return (
    <div className="auth-body">
      <div className="auth-container reset-container">
        <div className="auth-col col-form reset-form-col">
          <div className="form-slide">
            <div className="auth-form reset-form email-sent-form">
              <div className="email-icon">
                <RiMailCheckLine />
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
                <LuArrowLeft /> Retour
              </Link>

              <div className="form-footer">
                <span>Besoin d'aide?</span>
                <Link to="/contact">Contactez-nous</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EmailSent