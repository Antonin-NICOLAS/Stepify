import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
// components
import GlobalLoader from '../../utils/GlobalLoader'
import InputField from '../../components/InputField'
import PrimaryBtn from '../../components/buttons/primaryBtn'
import SecondaryBtn from '../../components/buttons/secondaryBtn'
//context
import { useAuth } from '../../context/AuthContext'
import { useTranslation } from 'react-i18next'
//icons
import {
  Mail,
  Send,
  ArrowLeft,
  AtSign,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'
//CSS
import './ChangeEmail.css'

function ChangeEmail() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { changeVerificationEmail } = useAuth()
  const [formError, setFormError] = useState('')
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleChangeVerificationEmail = async (e) => {
    e.preventDefault()
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return setFormError(
        t('common.authcontext.changeverificationemail.validemail'),
      )
    }
    setIsLoading(true)
    try {
      await changeVerificationEmail(email, () => {
        setEmail('')
        navigate('/email-verification')
      })
    } catch (error) {
      console.error('Error changing verification email:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="change-email-page">
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
                <h3>{t('auth.changeemail.visual.title')}</h3>
                <p>{t('auth.changeemail.visual.description')}n</p>
              </div>
              <div className="auth-stat-item">
                <div className="auth-stat-icon">
                  <Mail />
                </div>
                <div className="auth-stat-info">
                  <h4>{t('auth.changeemail.visual.newemail')}</h4>
                  <p>{t('auth.changeemail.visual.enternewemail')}</p>
                </div>
              </div>
              <div className="auth-stat-item">
                <div className="auth-stat-icon">
                  <CheckCircle2 />
                </div>
                <div className="auth-stat-info">
                  <h4>{t('auth.changeemail.visual.verification')}</h4>
                  <p>{t('auth.changeemail.visual.receiveverification')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="auth-form-section">
          <div className="auth-form-container">
            <form
              className="auth-form"
              onSubmit={handleChangeVerificationEmail}
            >
              <div className="auth-form-header">
                <div className="auth-icon-container">
                  <div className="auth-icon">
                    <AtSign />
                  </div>
                </div>
                <h2>{t('auth.changeemail.form.title')}</h2>
                <p className="auth-subtitle">
                  {t('auth.changeemail.form.description')}
                </p>
              </div>

              <div className="auth-form-content">
                {formError && (
                  <div className="form-error">
                    <AlertCircle size={16} />
                    <span>{formError}</span>
                  </div>
                )}
                <InputField
                  id="email"
                  type="email"
                  className="without-margin"
                  label={t('common.email')}
                  placeholder={t('auth.login.form.login.enteremail')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  icon={Mail}
                  autoComplete="email"
                  required={true}
                  style={{ backgroundColor: 'transparent' }}
                />

                <PrimaryBtn type="submit" disabled={isLoading}>
                  <Send />
                  <span>
                    {isLoading
                      ? t('auth.changeemail.form.sendinprocess')
                      : t('auth.changeemail.form.send')}
                  </span>
                </PrimaryBtn>

                <SecondaryBtn onClick={() => navigate('/email-verification')}>
                  <ArrowLeft />
                  <span>{t('common.back')}</span>
                </SecondaryBtn>
              </div>

              <div className="auth-form-footer">
                <span>{t('auth.changeemail.footer.question')}</span>
                <Link to="/email-verification">
                  {t('auth.changeemail.footer.button')}
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChangeEmail
