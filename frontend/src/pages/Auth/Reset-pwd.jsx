import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
//loader
import GlobalLoader from '../../components/GlobalLoader'
//context
import { useAuth } from '../../context/AuthContext'
import { useTranslation } from 'react-i18next'
// Components
import InputField from '../../components/InputField'
import PrimaryButton from '../../components/buttons/primaryBtn'
import PasswordStrengthMeter from '../../components/PasswordStrengthMeter'
//icons
import {
  Check,
  LockKeyhole,
  KeyRound,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react'
//CSS
import './Reset-pwd.css'

function ResetPassword() {
  const { t } = useTranslation()
  const { resetPassword } = useAuth()
  const { token } = useParams()

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordStrength, setPasswordStrength] = useState({ score: 0 })
  const [formError, setFormError] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleResetPwd = async (e) => {
    setFormError('')
    e.preventDefault()
    if (!token)
      return setFormError(t('common.authcontext.resetpassword.validtoken'))
    if (password.length < 8)
      return setFormError(t('common.authcontext.resetpassword.validpassword'))
    if (passwordStrength.score < 80) {
      setFormError(t('account.password.weak'))
      return
    }
    if (password !== confirmPassword)
      return setFormError(
        t('common.authcontext.resetpassword.passwordmismatch'),
      )
    setIsLoading(true)
    try {
      await resetPassword(token, password, () => {
        setPassword('')
        setConfirmPassword('')
        setIsSuccess(true)
      })
    } catch (error) {
      console.error('Error during password reset:', error)
      setFormError(t('common.authcontext.resetpassword.error'))
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
                {formError && (
                  <div className="form-error">
                    <AlertCircle size={16} />
                    <span>{formError}</span>
                  </div>
                )}
                {!token && (
                  <div className="form-error">
                    <AlertCircle />
                    <span>{t('auth.resetpassword.form.invalidlink')}</span>
                  </div>
                )}

                <InputField
                  id="password"
                  type="password"
                  className="without-margin"
                  label={t('account.password.new')}
                  placeholder={t('auth.resetpassword.form.enterpassword')}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  icon={LockKeyhole}
                  autoComplete="new-password"
                  required={true}
                  disabled={!token}
                  style={{ backgroundColor: 'transparent' }}
                />
                <PasswordStrengthMeter
                  password={password}
                  onStrengthChange={setPasswordStrength}
                  showScore={true}
                  showRequirements={true}
                  style={{ marginTop: '0px', marginBottom: '0px' }}
                />

                <InputField
                  id="confirmpassword"
                  type="password"
                  className="without-margin"
                  label={t('auth.resetpassword.form.confirmpassword')}
                  placeholder={t('auth.resetpassword.form.confirmyourpassword')}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  icon={LockKeyhole}
                  autoComplete="new-password"
                  required={true}
                  disabled={!token}
                  style={{ backgroundColor: 'transparent' }}
                />

                <PrimaryButton type="submit" disabled={isLoading || !token}>
                  <LockKeyhole />
                  <span>
                    {isLoading
                      ? t('auth.resetpassword.form.loading')
                      : t('auth.resetpassword.form.submit')}
                  </span>
                </PrimaryButton>
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
