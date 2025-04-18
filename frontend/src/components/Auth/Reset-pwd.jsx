import { useState } from "react"
import { useAuthStore } from "../../store/CheckAuth"
import { useParams, Link } from "react-router-dom"
//icons
import { RiEyeFill, RiEyeOffFill, RiCheckLine } from "react-icons/ri"
import { LuSave } from "react-icons/lu"
//CSS
import "./Pwd-manage.css"

function ResetPassword() {
  const { token } = useParams();
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const { resetPassword, isLoading } = useAuthStore();

  const handleResetPwd = (e) => {
    e.preventDefault();
    resetPassword(token, password, confirmPassword, () => {
      setPassword("");
      setConfirmPassword("");
      setIsSuccess(true);
    });
  };

  if (isSuccess) {
    return (
      <div className="auth-body">
        <div className="auth-container reset-container">
          <div className="auth-col col-form reset-form-col">
            <div className="form-slide">
              <div className="auth-form reset-form success-form">
                <div className="success-icon">
                  <RiCheckLine />
                </div>

                <h2>Réinitialisation réussie! 🎉</h2>
                <p className="subtitle">Votre mot de passe a été mis à jour</p>

                <div className="success-message">
                  <p>Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.</p>
                </div>

                <Link to="/login" className="submit-btn">
                  Se connecter <LuSave />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-body">
      <div className="auth-container reset-container">
        <div className="auth-col col-form reset-form-col">
          <div className="form-slide">
            <form className="auth-form reset-form" onSubmit={handleResetPwd}>
              <h2>Réinitialiser le mot de passe 🔒</h2>
              <p className="subtitle">Créez un nouveau mot de passe pour votre compte</p>

              {!token && (
                <div className="error-message">
                  Lien de réinitialisation invalide ou expiré. Veuillez demander un nouveau lien.
                </div>
              )}

              <div className="input-group">
                <label>Nouveau mot de passe</label>
                <div className="input-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Entrez votre nouveau mot de passe"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={!token}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <RiEyeOffFill /> : <RiEyeFill />}
                  </button>
                </div>
                <p className="password-hint">Le mot de passe doit contenir au moins 6 caractères</p>
              </div>

              <div className="input-group">
                <label>Confirmer le mot de passe</label>
                <div className="input-wrapper">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirmez votre mot de passe"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={!token}
                  />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                    {showConfirmPassword ? <RiEyeOffFill /> : <RiEyeFill />}
                  </button>
                </div>
              </div>

              <button type="submit" className="submit-btn" disabled={isLoading || !token}>
                {isLoading ? "Réinitialisation..." : "Réinitialiser le mot de passe"} <LuSave />
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

export default ResetPassword