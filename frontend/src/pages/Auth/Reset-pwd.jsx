import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
//loader
import GlobalLoader from '../../utils/GlobalLoader'
//context
import { useAuth } from '../../context/AuthContext'
import { useTranslation } from 'react-i18next'
//icons
import {
  Eye,
  EyeOff,
  Check,
  LockKeyhole,
  KeyRound,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react'
//CSS
import './Reset-pwd.css'
import toast from 'react-hot-toast'

function ResetPassword() {
  const { t } = useTranslation()
  const { resetPassword } = useAuth()

  const { token } = useParams()
  const [isLoading, setIsLoading] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleResetPwd = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await resetPassword(token, password, confirmPassword, () => {
        setPassword('')
        setConfirmPassword('')
        setIsSuccess(true)
      })
    } catch (error) {
      console.error('Error during password reset:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="reset-password-page">
        {isLoading && <GlobalLoader />}
        <div className="auth-container">
          <div className="auth-visual-section">
            <div className="auth-visual-content">
              <div className="auth-logo">
                <span>Stepify</span>
              </div>
              <div className="auth-stats">
                <div className="auth-stat-item">
                  <h3>{t('auth.resetpassword.success.visualtitle')}</h3>
                  <p>{t('auth.resetpassword.success.visualdescription')}</p>
                </div>
                <div className="auth-stat-item">
                  <div className="auth-stat-icon success">
                    <Check />
                  </div>
                  <div className="auth-stat-info">
                    <h4>{t('auth.resetpassword.success.visualstep1')}</h4>
                    <p>
                      {t('auth.resetpassword.success.visualstep1description')}
                    </p>
                  </div>
                </div>
                <div className="auth-stat-item">
                  <div className="auth-stat-icon success">
                    <ShieldCheck />
                  </div>
                  <div className="auth-stat-info">
                    <h4>{t('auth.resetpassword.success.visualstep2')}</h4>
                    <p>
                      {t('auth.resetpassword.success.visualstep2description')}
                    </p>
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
                <h2>{t('auth.resetpassword.success.title')}</h2>
                <p className="auth-subtitle">
                  {t('auth.resetpassword.success.description')}
                </p>
              </div>

              <div className="auth-form-content">
                <div className="success-message">
                  <p>{t('auth.resetpassword.success.message')}</p>
                </div>

                <Link to="/login" className="auth-button auth-button-primary">
                  <LockKeyhole />
                  <span>{t('auth.resetpassword.success.button')}</span>
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
      {isLoading && <GlobalLoader />}
      <div className="auth-container">
        <div className="auth-visual-section">
          <div className="auth-visual-content">
            <div className="auth-logo">
              <span>Stepify</span>
            </div>
            <div className="auth-stats">
              <div
                className="auth-stat-item"
                style={{ flexDirection: 'column' }}
              >
                <h3>{t('auth.resetpassword.visual.title')}</h3>
                <p>{t('auth.resetpassword.visual.description')}</p>
              </div>
              <div className="auth-stat-item">
                <div className="auth-stat-icon">
                  <KeyRound />
                </div>
                <div className="auth-stat-info">
                  <h4>{t('account.password.new')}</h4>
                  <p>{t('auth.resetpassword.visual.step1description')}</p>
                </div>
              </div>
              <div className="auth-stat-item">
                <div className="auth-stat-icon">
                  <ShieldCheck />
                </div>
                <div className="auth-stat-info">
                  <h4>{t('auth.resetpassword.visual.step2')}</h4>
                  <p>{t('auth.resetpassword.visual.step2description')}</p>
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
                <h2>{t('auth.resetpassword.form.title')}</h2>
                <p className="auth-subtitle">
                  {t('auth.resetpassword.form.subtitle')}
                </p>
              </div>

              <div className="auth-form-content">
                {!token && (
                  <div className="auth-alert auth-alert-error">
                    <AlertCircle />
                    <p>{t('auth.resetpassword.form.invalidlink')}</p>
                  </div>
                )}

                <div className="auth-input-group">
                  <label htmlFor="password">{t('account.password.new')}</label>
                  <div className="auth-input-wrapper">
                    <LockKeyhole className="auth-input-icon" />
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder={t('auth.resetpassword.form.enterpassword')}
                      autoComplete="new-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={!token}
                    />
                    <button
                      type="button"
                      className="auth-input-action"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={
                        showPassword
                          ? t('auth.resetpassword.form.hidepassword')
                          : t('auth.resetpassword.form.showpassword')
                      }
                    >
                      {showPassword ? <EyeOff /> : <Eye />}
                    </button>
                  </div>
                  <p className="password-hint">
                    {t('auth.resetpassword.form.passwordhint')}
                  </p>
                </div>

                <div className="auth-input-group">
                  <label htmlFor="confirmPassword">
                    {t('auth.resetpassword.form.confirmpassword')}
                  </label>
                  <div className="auth-input-wrapper">
                    <LockKeyhole className="auth-input-icon" />
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder={t(
                        'auth.resetpassword.form.confirmyourpassword'
                      )}
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      disabled={!token}
                    />
                    <button
                      type="button"
                      className="auth-input-action"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      aria-label={
                        showConfirmPassword
                          ? t('auth.resetpassword.form.hidepassword')
                          : t('auth.resetpassword.form.showpassword')
                      }
                    >
                      {showConfirmPassword ? <EyeOff /> : <Eye />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="auth-button auth-button-primary"
                  disabled={isLoading || !token}
                >
                  <LockKeyhole />
                  <span>
                    {isLoading
                      ? t('auth.resetpassword.form.loading')
                      : t('auth.resetpassword.form.submit')}
                  </span>
                </button>
              </div>

              <div className="auth-form-footer">
                <span>{t('auth.resetpassword.footer.question')}</span>
                <Link to="/login">{t('auth.resetpassword.footer.button')}</Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ResetPassword
