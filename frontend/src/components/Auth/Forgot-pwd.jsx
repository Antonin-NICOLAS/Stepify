import { useState } from "react"
import { useAuthStore } from "../../store/CheckAuth";
import { useNavigate, Link } from "react-router-dom"
//icons
import { RiMailLine } from "react-icons/ri"
import { LuSend } from "react-icons/lu"
//CSS
import "./Pwd-manage.css"

function ForgotPassword() {
  const navigate = useNavigate()
  const { forgotPassword, isLoading } = useAuthStore();
  const [email, setEmail] = useState("")

  const handleForgotPwd = (e) => {
    e.preventDefault();
    forgotPassword(email, () => navigate("/email-sent"));
  };

  return (
    <div className="auth-body">
      <div className="auth-container reset-container">
        <div className="auth-col col-form reset-form-col">
          <div className="form-slide">
            <form className="auth-form reset-form" onSubmit={handleForgotPwd}>
              <h2>Mot de passe oublié? 🔑</h2>
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
                  <RiMailLine />
                </div>
              </div>

              <button type="submit" className="submit-btn" disabled={isLoading}>
                {isLoading ? "Envoi en cours..." : "Envoyer le lien"} <LuSend />
              </button>

              <div className="form-footer">
                <span>Vous vous souvenez de votre mot de passe?</span>
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