import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
//loader
import GlobalLoader from "../../utils/GlobalLoader"
//context
import { useAuth } from "../../context/AuthContext"
//icons
import { Mail, Send, ArrowLeft, AtSign, CheckCircle2 } from "lucide-react"
//CSS
import "./ChangeEmail.css"

function ChangeEmail() {
  const navigate = useNavigate()
  const { changeVerificationEmail } = useAuth()
  const [isLoading, setIsLoading] = useState(false)

  const [email, setEmail] = useState("")

  const handleChangeVerificationEmail = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await changeVerificationEmail(email, () => {
        setEmail("")
        navigate("/email-verification")
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="change-email-page">
      {isLoading && <GlobalLoader/>}
      <div className="auth-container">
        <div className="auth-visual-section">
          <div className="auth-visual-content">
            <div className="auth-logo">
              <span>Stepify</span>
            </div>
            <div className="auth-stats">
              <div className="auth-stat-item">
                <h3>Changer d'email</h3>
                <p>Mettez à jour votre adresse email pour la vérification</p>
              </div>
              <div className="auth-stat-item">
                <div className="auth-stat-icon">
                  <Mail />
                </div>
                <div className="auth-stat-info">
                  <h4>Nouvel email</h4>
                  <p>Entrez votre nouvelle adresse email</p>
                </div>
              </div>
              <div className="auth-stat-item">
                <div className="auth-stat-icon">
                  <CheckCircle2 />
                </div>
                <div className="auth-stat-info">
                  <h4>Vérification</h4>
                  <p>Vous recevrez un nouveau code de vérification</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="auth-form-section">
          <div className="auth-form-container">
            <form className="auth-form" onSubmit={handleChangeVerificationEmail}>
              <div className="auth-form-header">
                <div className="auth-icon-container">
                  <div className="auth-icon">
                    <AtSign />
                  </div>
                </div>
                <h2>Mauvais email ?</h2>
                <p className="auth-subtitle">Entrez votre nouvel email pour le vérifier</p>
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
                  <span>{isLoading ? "Envoi en cours..." : "Envoyer le code"}</span>
                </button>

                <Link to="/email-verification" className="auth-button auth-button-secondary">
                  <ArrowLeft />
                  <span>Retour</span>
                </Link>
              </div>

              <div className="auth-form-footer">
                <span>Vous aviez renseigné le bon email ?</span>
                <Link to="/email-verification">Retour à la vérification</Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChangeEmail
