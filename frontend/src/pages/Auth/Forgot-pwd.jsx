import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
//context
import { useAuth } from '../../context/AuthContext';
//icons
import { Mail, Send } from "lucide-react"
//CSS
import "./Forgot-pwd.css"

function ForgotPassword() {
  const navigate = useNavigate()
  const { forgotPassword, isLoading } = useAuth();
  const [email, setEmail] = useState("")

  const handleForgotPwd = (e) => {
    e.preventDefault();
    forgotPassword(email, () => navigate("/email-sent"));
  };

  return (
    <div className="forgotpwd-body">
      <div className="forgotpwd-container">
        <form className="forgotpwd-form" onSubmit={handleForgotPwd}>
          <h2>Mot de passe oublié ? 🔑</h2>
          <p className="subtitle">Entrez votre email pour réinitialiser votre mot de passe</p>

          <div className="input-group">
            <label>Email</label>
            <div className="input-wrapper">
              <input
                type="email"
                placeholder="Entrez votre email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Mail />
            </div>
          </div>

          <button type="submit" className="submit-btn" disabled={isLoading}>
            {isLoading ? "Envoi en cours..." : "Envoyer le lien"} <Send />
          </button>

          <div className="form-footer">
            <span>Vous vous souvenez de votre mot de passe ?</span>
            <Link to="/login">Se connecter</Link>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ForgotPassword