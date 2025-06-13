import { useState, useRef, useEffect } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
// Context
import { use2FA } from '../../context/2FA'
import { useTranslation } from 'react-i18next'
// Components
import PrimaryBtn from '../../components/buttons/primaryBtn'
import { toast } from 'react-hot-toast'
// Icons
import {
  Shield,
  ShieldCheck,
  Key,
  RefreshCw,
  CheckCircle2,
  Smartphone,
  ClockIcon as ClockFading,
  Mail,
  Fingerprint,
  AlertTriangle,
} from 'lucide-react'
import './TwoFactorVerification.css'

function TwoFactorVerification() {
  const navigate = useNavigate()
  const location = useLocation()
  const {
    verifyLoginTwoFactor,
    useBackupCode,
    resendEmail2FACode,
    authenticateWithWebAuthn,
  } = use2FA()
  const { t } = useTranslation()

  // State variables
  const [isLoading, setIsLoading] = useState(false)
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [resendDisabled, setResendDisabled] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [isVerified, setIsVerified] = useState(false)
  const [showBackupCode, setShowBackupCode] = useState(false)
  const [backupCode, setBackupCode] = useState('')
  const [webauthnError, setWebauthnError] = useState(null)
  const inputRefs = useRef([])

  // Récupérer les paramètres de navigation
  const { email, method, stayLoggedIn, availableMethods } = location.state || {}

  // Rediriger si les paramètres sont manquants
  useEffect(() => {
    if (!email || !method) {
      navigate('/login')
      toast.error(t('common.error'))
    }
  }, [email, method, navigate])

  // Handle countdown for resend button
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    } else if (countdown === 0 && resendDisabled) {
      setResendDisabled(false)
    }
  }, [countdown, resendDisabled])

  // Handle input change and auto-focus next input
  const handleChange = (index, value) => {
    if (value.length > 1) {
      value = value.slice(0, 1)
    }

    if (value && !/^\d+$/.test(value)) {
      return
    }

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  // Handle backspace key
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  // Handle paste event
  const handlePaste = (e) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text')
    if (!/^\d+$/.test(pastedData)) return

    const digits = pastedData.slice(0, 6).split('')
    const newOtp = [...otp]

    digits.forEach((digit, index) => {
      if (index < 6) {
        newOtp[index] = digit
      }
    })

    setOtp(newOtp)

    if (digits.length < 6) {
      inputRefs.current[digits.length]?.focus()
    }
  }

  // Focus the first input on mount
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus()
    }
  }, [])

  // Handle code submission
  const handleVerification = async (e) => {
    e.preventDefault()
    const otpCode = showBackupCode ? backupCode : otp.join('')

    if (
      ((method === 'email' || method === 'app') &&
        !showBackupCode &&
        otpCode.length !== 6) ||
      (showBackupCode && !backupCode.trim())
    ) {
      return
    }

    setIsLoading(true)
    try {
      if (showBackupCode) {
        useBackupCode(email, stayLoggedIn, backupCode, () => {
          setIsVerified(true)
          setTimeout(() => {
            navigate('/dashboard')
          }, 2000)
        })
      } else if (method === 'email' || method === 'app') {
        await verifyLoginTwoFactor(email, stayLoggedIn, otpCode, method, () => {
          setIsVerified(true)
          setTimeout(() => {
            navigate('/dashboard')
          }, 2000)
        })
      } else if (method === 'webauthn') {
        try {
          setWebauthnError(null)
          await authenticateWithWebAuthn(email, stayLoggedIn)
          setIsVerified(true)
          setTimeout(() => {
            navigate('/dashboard')
          }, 2000)
        } catch (error) {
          setWebauthnError(error.message || t('common.error'))
        }
      }
    } catch (error) {
      console.error('Error during verification:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Handle resend code
  const handleResend = async () => {
    if (resendDisabled) return
    setIsLoading(true)
    try {
      if (method === 'email') {
        await resendEmail2FACode(email)
        setResendDisabled(true)
        setCountdown(60)
        setOtp(['', '', '', '', '', ''])
        setBackupCode('')
      }
    } catch (error) {
      console.error('Error resending code:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Handle method switch
  const handleMethodSwitch = async (newMethod) => {
    navigate('/2fa-verification', {
      state: {
        email,
        method: newMethod,
        stayLoggedIn,
        availableMethods,
      },
    })
    if (newMethod === 'email') {
      await resendEmail2FACode(email)
      setResendDisabled(true)
      setCountdown(60)
      setOtp(['', '', '', '', '', ''])
      setBackupCode('')
    }
  }

  // Render alternative method buttons
  const renderAlternativeMethods = () => {
    const alternativeMethods = availableMethods.filter((m) => m !== method)
    if (alternativeMethods.length === 0) return null

    return (
      <div className="alternative-methods">
        <p>
          {method === 'email'
            ? t('auth.2fa.process.alternative-methods-email')
            : method === 'app'
            ? t('auth.2fa.process.alternative-methods-app')
            : t('auth.2fa.process.alternative-methods-webauthn')}
        </p>
        <div className="alternative-methods-buttons">
          {alternativeMethods.includes('app') && (
            <button
              type="button"
              className="method-button"
              onClick={() => handleMethodSwitch('app')}
            >
              <Smartphone size={20} />
              <span>{t('auth.2fa.process.use-app')}</span>
            </button>
          )}
          {alternativeMethods.includes('email') && (
            <button
              type="button"
              className="method-button"
              onClick={() => handleMethodSwitch('email')}
              disabled={resendDisabled}
            >
              <Mail size={20} />
              <span>
                {resendDisabled
                  ? `${t('auth.2fa.process.retry-in')} ${countdown}s`
                  : t('auth.2fa.process.use-email')}
              </span>
            </button>
          )}
          {alternativeMethods.includes('webauthn') && (
            <button
              type="button"
              className="method-button"
              onClick={() => handleMethodSwitch('webauthn')}
            >
              <Fingerprint size={20} />
              <span>{t('auth.2fa.process.use-webauthn')}</span>
            </button>
          )}
        </div>
      </div>
    )
  }

  if (isVerified) {
    return (
      <div className="twofactor-verification-page">
        <div className="auth-container">
          <div className="auth-visual-section">
            <div className="auth-visual-content">
              <div className="auth-logo">
                <span>Stepify</span>
              </div>
              <div className="auth-stats">
                <div className="auth-stat-item">
                  <h3>{t('auth.2fa.success.title')}</h3>
                  <p>{t('auth.2fa.success.description')}</p>
                </div>
                <div className="auth-stat-item">
                  <div className="auth-stat-icon success">
                    <CheckCircle2 />
                  </div>
                  <div className="auth-stat-info">
                    <h4>{t('auth.2fa.success.step1')}</h4>
                    <p>{t('auth.2fa.success.step1description')}</p>
                  </div>
                </div>
                <div className="auth-stat-item">
                  <div className="auth-stat-icon success">
                    <CheckCircle2 />
                  </div>
                  <div className="auth-stat-info">
                    <h4>{t('auth.2fa.success.step2')}</h4>
                    <p>{t('auth.2fa.success.step2description')}</p>
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
                    <CheckCircle2 />
                  </div>
                </div>
                <h2>{t('auth.2fa.success.title')}</h2>
                <p className="auth-subtitle">
                  {t('auth.2fa.success.subtitle')}
                </p>
              </div>

              <div className="auth-form-content">
                <div className="success-message">
                  <p>{t('auth.emailverification.success.content.redirect')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="twofactor-verification-page">
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
                <h3>{t('auth.2fa.visual.title')}</h3>
                <p>{t('auth.2fa.visual.description')}</p>
              </div>
              <div className="auth-stat-item">
                <div className="auth-stat-icon">
                  {method === 'webauthn' ? <Fingerprint /> : <Smartphone />}
                </div>
                <div className="auth-stat-info">
                  <h4>
                    {method === 'webauthn'
                      ? t('auth.2fa.visual.step1-webauthn')
                      : t('auth.2fa.visual.step1')}
                  </h4>
                  <p>
                    {method === 'email'
                      ? t('auth.2fa.visual.step1description-mail')
                      : method === 'webauthn'
                      ? t('auth.2fa.visual.step1description-webauthn')
                      : t('auth.2fa.visual.step1description-app')}
                  </p>
                </div>
              </div>
              <div className="auth-stat-item">
                <div className="auth-stat-icon">
                  <Key />
                </div>
                <div className="auth-stat-info">
                  <h4>{t('auth.2fa.visual.step2')}</h4>
                  <p>{t('auth.2fa.visual.step2description')}</p>
                </div>
              </div>
            </div>
            {renderAlternativeMethods()}
          </div>
        </div>

        <div className="auth-form-section">
          <div className="auth-form-container">
            <form className="auth-form" onSubmit={handleVerification}>
              <div className="auth-form-header">
                <div className="auth-icon-container">
                  <div className="auth-icon">
                    <Shield />
                  </div>
                </div>
                <h2>{t('account.security.2fa')}</h2>
                <p className="auth-subtitle">
                  {method === 'email'
                    ? t('auth.2fa.process.subtitle-email')
                    : method === 'webauthn'
                    ? t('auth.2fa.process.subtitle-webauthn')
                    : t('auth.2fa.process.subtitle-app')}
                </p>
              </div>

              <div className="auth-form-content">
                <div className="verification-message">
                  <p>
                    {showBackupCode
                      ? t('auth.2fa.process.backup-message')
                      : method === 'email'
                      ? t('auth.2fa.process.email-message')
                      : method === 'webauthn'
                      ? t('auth.2fa.process.webauthn-message')
                      : t('auth.2fa.process.app-message')}
                  </p>
                </div>

                {method === 'webauthn' ? (
                  <>
                    {webauthnError && (
                      <div className="error-message">
                        <AlertTriangle size={16} />
                        <span>{webauthnError}</span>
                      </div>
                    )}
                    <PrimaryBtn
                      onClick={handleVerification}
                      disabled={isLoading}
                    >
                      <Fingerprint size={20} />
                      <span>
                        {isLoading
                          ? t('auth.login.form.accesskey.verification')
                          : t('auth.2fa.process.use-webauthn')}
                      </span>
                    </PrimaryBtn>
                  </>
                ) : !showBackupCode ? (
                  <div className="otp-container">
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        type="text"
                        maxLength={1}
                        value={digit}
                        autoComplete={
                          showBackupCode
                            ? 'off'
                            : method === 'app'
                            ? 'one-time-code'
                            : 'off'
                        }
                        onChange={(e) => handleChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        onPaste={index === 0 ? handlePaste : undefined}
                        ref={(el) => (inputRefs.current[index] = el)}
                        className="otp-input"
                        required
                        aria-label={`Digit ${index + 1}`}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="auth-input-group">
                    <label htmlFor="backupCode">
                      {t('auth.2fa.visual.step2')}
                    </label>
                    <div className="auth-input-wrapper">
                      <div className="auth-input-icon">
                        <Key />
                      </div>
                      <input
                        type="text"
                        id="backupCode"
                        value={backupCode}
                        onChange={(e) =>
                          setBackupCode(e.target.value.toUpperCase())
                        }
                        placeholder="XXXXXX"
                        maxLength={8}
                      />
                    </div>
                  </div>
                )}

                {method !== 'webauthn' && (
                  <PrimaryBtn
                    type="submit"
                    disabled={
                      isLoading ||
                      (!showBackupCode && otp.join('').length !== 6) ||
                      (showBackupCode && !backupCode.trim())
                    }
                  >
                    <ShieldCheck />
                    <span>
                      {isLoading
                        ? t('auth.login.form.accesskey.verification')
                        : t('auth.emailverification.process.form.verify')}
                    </span>
                  </PrimaryBtn>
                )}

                <div className="auth-options">
                  <button
                    type="button"
                    className="toggle-backup-btn"
                    onClick={() => {
                      setShowBackupCode(!showBackupCode)
                      setOtp(['', '', '', '', '', ''])
                      setBackupCode('')
                    }}
                  >
                    {showBackupCode ? (
                      <>
                        <Smartphone />
                        <span>
                          {method === 'email'
                            ? t('auth.2fa.process.use-email-code')
                            : method === 'app'
                            ? t('auth.2fa.process.use-app-code')
                            : t('auth.2fa.process.use-webauthn-code')}
                        </span>
                      </>
                    ) : (
                      <>
                        <Key />
                        <span>{t('auth.2fa.process.use-backup-code')}</span>
                      </>
                    )}
                  </button>

                  {!showBackupCode && method === 'email' && (
                    <div className="resend-container">
                      <p>{t('auth.2fa.process.resend-email')}</p>
                      <button
                        type="button"
                        className={`resend-btn ${
                          resendDisabled ? 'disabled' : ''
                        }`}
                        onClick={handleResend}
                        disabled={resendDisabled}
                      >
                        {resendDisabled ? (
                          <>
                            <ClockFading />
                            <span>
                              {t('auth.2fa.process.retry-in')} {countdown}s
                            </span>
                          </>
                        ) : (
                          <>
                            <RefreshCw />
                            <span>
                              {t('auth.emailverification.process.form.button')}
                            </span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="auth-form-footer">
                <span>{t('auth.2fa.process.question')}</span>
                <Link to="#">{t('common.contact-support')}</Link>{' '}
                {/* TODO: support link */}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TwoFactorVerification
