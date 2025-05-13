import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
//loader
import GlobalLoader from "../../utils/GlobalLoader"
//context
import { useAuth } from "../../context/AuthContext"
//icons
import { Mail, Send, ArrowLeft, KeyRound, LockKeyhole, HelpCircle } from "lucide-react"
//CSS
import "./Forgot-pwd.css"

function ForgotPassword() {
  const navigate = useNavigate()
  const { forgotPassword } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("")

  const handleForgotPwd = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await forgotPassword(email, () => navigate("/email-sent"))
    } finally {
      setIsLoading(false)
    }
  }

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
              <div className="auth-stat-item" style={{ flexDirection: 'column' }}>
                <h3>Mot de passe oublié</h3>
                <p>Nous vous aiderons à récupérer votre compte</p>
              </div>
              <div className="auth-stat-item">
                <div className="auth-stat-icon">
                  <Mail />
                </div>
                <div className="auth-stat-info">
                  <h4>Email de récupération</h4>
                  <p>Nous vous enverrons un lien de réinitialisation</p>
                </div>
              </div>
              <div className="auth-stat-item">
                <div className="auth-stat-icon">
                  <KeyRound />
                </div>
                <div className="auth-stat-info">
                  <h4>Nouveau mot de passe</h4>
                  <p>Créez un mot de passe sécurisé</p>
                </div>
              </div>
              <div className="auth-stat-item">
                <div className="auth-stat-icon">
                  <HelpCircle />
                </div>
                <div className="auth-stat-info">
                  <h4>Besoin d'aide?</h4>
                  <p>Notre équipe de support est disponible</p>
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
                <h2>Mot de passe oublié ? 🔑</h2>
                <p className="auth-subtitle">Entrez votre email pour réinitialiser votre mot de passe</p>
              </div>

              <div className="auth-form-content">
                <div className="auth-input-group">
                  <label htmlFor="email">Email</label>
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

                <button type="submit" className="auth-button auth-button-primary" disabled={isLoading}>
                  <Send />
                  <span>{isLoading ? "Envoi en cours..." : "Envoyer le lien"}</span>
                </button>

                <Link to="/login" className="auth-button auth-button-secondary">
                  <ArrowLeft />
                  <span>Retour à la connexion</span>
                </Link>
              </div>

              <div className="auth-form-footer">
                <span>Vous vous souvenez de votre mot de passe ?</span>
                <Link to="/login">Se connecter</Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword