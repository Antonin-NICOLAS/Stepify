import { useState, useRef, useEffect } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
// Context
import { use2FA } from '../../context/2FA'
import { useTranslation } from 'react-i18next'
// Icons
import {
  Shield,
  ShieldCheck,
  Key,
  RefreshCw,
  CheckCircle2,
  Smartphone,
  ClockIcon as ClockFading,
} from 'lucide-react'
import './TwoFactorVerification.css'

function TwoFactorVerification() {
  const navigate = useNavigate()
  const location = useLocation()
  const { verifyLoginTwoFactor } = use2FA()
  const { t } = useTranslation()

  // State variables
  const [isLoading, setIsLoading] = useState(false)
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [resendDisabled, setResendDisabled] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [isVerified, setIsVerified] = useState(false)
  const [showBackupCode, setShowBackupCode] = useState(false)
  const [backupCode, setBackupCode] = useState('')
  const inputRefs = useRef([])

  // Récupérer les paramètres de navigation
  const { email, method, stayLoggedIn } = location.state || {}

  // Rediriger si les paramètres sont manquants
  useEffect(() => {
    if (!email || !method) {
      navigate('/login')
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
      (!showBackupCode && otpCode.length !== 6) ||
      (showBackupCode && !backupCode.trim())
    ) {
      return
    }

    setIsLoading(true)
    try {
      await verifyLoginTwoFactor(email, stayLoggedIn, otpCode, () => {
        setIsVerified(true)
        setTimeout(() => {
          navigate('/dashboard')
        }, 2000)
      })
    } catch (error) {
      console.error('Error during verification:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Handle resend code
  const handleResend = async () => {
    if (resendDisabled) return

    setResendDisabled(true)
    setCountdown(60)
    setOtp(['', '', '', '', '', ''])
    setBackupCode('')
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
                  <Smartphone />
                </div>
                <div className="auth-stat-info">
                  <h4>{t('auth.2fa.visual.step1')}</h4>
                  <p>
                    {method === 'email'
                      ? t('auth.2fa.visual.step1description-mail')
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
                        : t('auth.2fa.process.app-message')}
                  </p>
                </div>

                {!showBackupCode ? (
                  <div className="otp-container">
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        type="text"
                        maxLength={1}
                        value={digit}
                        autoComplete="one-time-code"
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

                <button
                  type="submit"
                  className="auth-button auth-button-primary"
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
                </button>

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
                            : t('auth.2fa.process.use-app-code')}
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
                      <p>
                        {method === 'email'
                          ? t('auth.2fa.process.resend-email')
                          : t('auth.2fa.process.resend-app')}
                      </p>
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
                <Link to="/support">{t('common.contact-support')}</Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TwoFactorVerification
