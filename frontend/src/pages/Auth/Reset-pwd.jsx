import { useState } from "react"
import { useParams, Link } from "react-router-dom"
//context
import { useAuth } from "../../context/AuthContext"
//icons
import { Eye, EyeOff, Check, LockKeyhole, KeyRound, ShieldCheck, AlertCircle } from "lucide-react"
//CSS
import "./Reset-pwd.css"

function ResetPassword() {
  const { resetPassword, isLoading } = useAuth()

  const { token } = useParams()
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleResetPwd = (e) => {
    e.preventDefault()
    resetPassword(token, password, confirmPassword, () => {
      setPassword("")
      setConfirmPassword("")
      setIsSuccess(true)
    })
  }

  if (isSuccess) {
    return (
      <div className="reset-password-page">
        <div className="auth-container">
          <div className="auth-visual-section">
            <div className="auth-visual-content">
              <div className="auth-logo">
                <span>Stepify</span>
              </div>
              <div className="auth-stats">
                <div className="auth-stat-item">
                  <h3>Réinitialisation réussie</h3>
                  <p>Votre mot de passe a été mis à jour avec succès</p>
                </div>
                <div className="auth-stat-item">
                  <div className="auth-stat-icon success">
                    <Check />
                  </div>
                  <div className="auth-stat-info">
                    <h4>Mot de passe mis à jour</h4>
                    <p>Votre nouveau mot de passe est actif</p>
                  </div>
                </div>
                <div className="auth-stat-item">
                  <div className="auth-stat-icon success">
                    <ShieldCheck />
                  </div>
                  <div className="auth-stat-info">
                    <h4>Compte sécurisé</h4>
                    <p>Votre compte est maintenant protégé</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="auth-form-section">
            <div className="auth-form-container">
              <div className="auth-form-header">
                <div className="auth-icon-container success">
                  <div className="auth-icon">
                    <Check />
                  </div>
                </div>
                <h2>Réinitialisation réussie! 🎉</h2>
                <p className="auth-subtitle">Votre mot de passe a été mis à jour</p>
              </div>

              <div className="auth-form-content">
                <div className="success-message">
                  <p>Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.</p>
                </div>

                <Link to="/login" className="auth-button auth-button-primary">
                  <LockKeyhole />
                  <span>Se connecter</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="reset-password-page">
      <div className="auth-container">
        <div className="auth-visual-section">
          <div className="auth-visual-content">
            <div className="auth-logo">
              <span>Stepify</span>
            </div>
            <div className="auth-stats">
              <div className="auth-stat-item" style={{flexDirection: "column"}}>
                <h3>Réinitialisation du mot de passe</h3>
                <p>Créez un nouveau mot de passe sécurisé</p>
              </div>
              <div className="auth-stat-item">
                <div className="auth-stat-icon">
                  <KeyRound />
                </div>
                <div className="auth-stat-info">
                  <h4>Nouveau mot de passe</h4>
                  <p>Choisissez un mot de passe fort</p>
                </div>
              </div>
              <div className="auth-stat-item">
                <div className="auth-stat-icon">
                  <ShieldCheck />
                </div>
                <div className="auth-stat-info">
                  <h4>Sécurité</h4>
                  <p>Utilisez au moins 8 caractères</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="auth-form-section">
          <div className="auth-form-container">
            <form className="auth-form" onSubmit={handleResetPwd}>
              <div className="auth-form-header">
                <div className="auth-icon-container">
                  <div className="auth-icon">
                    <LockKeyhole />
                  </div>
                </div>
                <h2>Réinitialiser le mot de passe 🔒</h2>
                <p className="auth-subtitle">Créez un nouveau mot de passe pour votre compte</p>
              </div>

              <div className="auth-form-content">
                {!token && (
                  <div className="auth-alert auth-alert-error">
                    <AlertCircle />
                    <p>Lien de réinitialisation invalide ou expiré. Veuillez demander un nouveau lien.</p>
                  </div>
                )}

                <div className="auth-input-group">
                  <label htmlFor="password">Nouveau mot de passe</label>
                  <div className="auth-input-wrapper">
                    <LockKeyhole className="auth-input-icon" />
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Entrez votre nouveau mot de passe"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={!token}
                    />
                    <button
                      type="button"
                      className="auth-input-action"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                    >
                      {showPassword ? <EyeOff /> : <Eye />}
                    </button>
                  </div>
                  <p className="password-hint">Le mot de passe doit contenir au moins 8 caractères</p>
                </div>

                <div className="auth-input-group">
                  <label htmlFor="confirmPassword">Confirmer le mot de passe</label>
                  <div className="auth-input-wrapper">
                    <LockKeyhole className="auth-input-icon" />
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirmez votre mot de passe"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      disabled={!token}
                    />
                    <button
                      type="button"
                      className="auth-input-action"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      aria-label={showConfirmPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                    >
                      {showConfirmPassword ? <EyeOff /> : <Eye />}
                    </button>
                  </div>
                </div>

                <button type="submit" className="auth-button auth-button-primary" disabled={isLoading || !token}>
                  <LockKeyhole />
                  <span>{isLoading ? "Réinitialisation..." : "Réinitialiser le mot de passe"}</span>
                </button>
              </div>

              <div className="auth-form-footer">
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
