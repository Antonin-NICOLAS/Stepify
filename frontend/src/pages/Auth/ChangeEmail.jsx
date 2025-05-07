import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
//context
import { useAuth } from '../../context/AuthContext';
//icons
import { Mail, Send } from 'lucide-react';
//CSS
import "./Forgot-pwd.css"

function ChangeEmail() {
  const navigate = useNavigate()
  const { ChangeVerificationEmail, isLoading } = useAuth();

  const [email, setEmail] = useState("")

  const handleChangeVerificationEmail = (e) => {
    e.preventDefault();
    ChangeVerificationEmail(email, () => {
      setEmail("")
      navigate("/email-verification")
    });
  };

  return (
    <div className="forgotpwd-body">
      <div className="forgotpwd-container">
        <form className="forgotpwd-form" onSubmit={handleChangeVerificationEmail}>
          <h2>Mauvais email ?</h2>
          <p className="subtitle">Entrez votre nouvel email pour le vérifier</p>

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
            {isLoading ? "Envoi en cours..." : "Envoyer le code"} <Send />
          </button>

          <div className="form-footer">
            <span>Vous aviez renseigné le bon email ?</span>
            <Link to="/email-verification">Retour</Link>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ChangeEmail