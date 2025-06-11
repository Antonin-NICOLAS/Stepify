import { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
//loader
import GlobalLoader from '../../utils/GlobalLoader'
//context
import { useAuth } from '../../context/AuthContext'
import { toast } from 'react-hot-toast'
//icons
import {
  MailCheck,
  ClockIcon as ClockFading,
  ShieldCheck,
  RefreshCcw,
  Mail,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'
//CSS
import './EmailVerification.css'

function EmailVerification() {
  const navigate = useNavigate()
  const { user, verifyEmail, resendVerificationCode } = useAuth()
  const [isLoading, setIsLoading] = useState(false)

  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [resendDisabled, setResendDisabled] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [isVerified, setIsVerified] = useState(false)
  const inputRefs = useRef([])
  const location = useLocation()

  //add toast notification if redirected
  useEffect(() => {
    if (location.state?.showToast) {
      toast(t('auth.emailverification.redirect'))
      navigate(location.pathname, { replace: true })
    }
  }, [location.state, location.pathname, navigate])

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
      // If pasting multiple digits, only take the first one
      value = value.slice(0, 1)
    }

    // Only allow numbers
    if (value && !/^\d+$/.test(value)) {
      return
    }

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    // Auto focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1].focus()
    }
  }

  // Handle backspace key
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      // Focus previous input when backspace is pressed on empty input
      inputRefs.current[index - 1].focus()
    }
  }

  // Handle paste event
  const handlePaste = (e) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text')
    if (!/^\d+$/.test(pastedData)) return // Only allow numbers

    const digits = pastedData.slice(0, 6).split('')
    const newOtp = [...otp]

    digits.forEach((digit, index) => {
      if (index < 6) {
        newOtp[index] = digit
      }
    })

    setOtp(newOtp)

    // Focus the appropriate input after paste
    if (digits.length < 6) {
      inputRefs.current[digits.length].focus()
    }
  }
  // Focus the first input on mount
  useEffect(() => {
    if (inputRefs.current[0]) inputRefs.current[0].focus()
  }, [])

  // Handle code submission
  const handleVerificationCode = async (e) => {
    e.preventDefault()
    const otpCode = otp.join('')
    setIsLoading(true)
    try {
      await verifyEmail(otpCode, () => {
        setIsVerified(true)
        setTimeout(() => {
          navigate('/dashboard')
        }, 3000)
      })
    } catch (error) {
      console.error('Error during email verification:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Handle resend code
  const handleResend = async () => {
    if (resendDisabled) return
    setIsLoading(true)
    try {
      await resendVerificationCode(
        // onError
        () => {
          setResendDisabled(true)
          setCountdown(60)
          setOtp(['', '', '', '', '', ''])
        },
        // onSuccess
        () => {
          setResendDisabled(false)
          setCountdown(0)
          setOtp(['', '', '', '', '', ''])
        },
      )
    } catch (error) {
      console.error('Error during resend verification code:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isVerified) {
    return (
      <div className="verification-page">
        {isLoading && <GlobalLoader />}
        <div className="auth-container">
          <div className="auth-visual-section">
            <div className="auth-visual-content">
              <div className="auth-logo">
                <span>Stepify</span>
              </div>
              <div className="auth-stats">
                <div className="auth-stat-item">
                  <h3>{t('auth.emailverification.success.visual.title')}</h3>
                  <p>
                    {t('auth.emailverification.success.visual.description')}
                  </p>
                </div>
                <div className="auth-stat-item">
                  <div className="auth-stat-icon success">
                    <CheckCircle2 />
                  </div>
                  <div className="auth-stat-info">
                    <h4>{t('auth.emailverification.success.visual.step1')}</h4>
                    <p>
                      {t(
                        'auth.emailverification.success.visual.step1description',
                      )}
                    </p>
                  </div>
                </div>
                <div className="auth-stat-item">
                  <div className="auth-stat-icon success">
                    <CheckCircle2 />
                  </div>
                  <div className="auth-stat-info">
                    <h4>{t('auth.emailverification.success.visual.step2')}</h4>
                    <p>
                      {t(
                        'auth.emailverification.success.visual.step2description',
                      )}
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
                    <CheckCircle2 />
                  </div>
                </div>
                <h2>{t('auth.emailverification.success.content.title')}</h2>
                <p className="auth-subtitle">
                  {t('auth.emailverification.success.content.description')}
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
    <div className="verification-page">
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
                <h3>{t('auth.emailverification.process.visual.title')}</h3>
                <p>{t('auth.emailverification.process.visual.description')}</p>
              </div>
              <div className="auth-stat-item">
                <div className="auth-stat-icon">
                  <Mail />
                </div>
                <div className="auth-stat-info">
                  <h4>{t('auth.emailverification.process.visual.step1')}</h4>
                  <p>
                    {t(
                      'auth.emailverification.process.visual.step1description',
                    )}
                  </p>
                </div>
              </div>
              <div className="auth-stat-item">
                <div className="auth-stat-icon">
                  <AlertCircle />
                </div>
                <div className="auth-stat-info">
                  <h4>{t('auth.emailsent.visual.step2')}</h4>
                  <p>
                    {t(
                      'auth.emailverification.process.visual.step2description',
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="auth-form-section">
          <div className="auth-form-container">
            <form className="auth-form" onSubmit={handleVerificationCode}>
              <div className="auth-form-header">
                <div className="auth-icon-container">
                  <div className="auth-icon">
                    <MailCheck />
                  </div>
                </div>
                <h2>{t('auth.emailverification.process.form.title')}</h2>
                <p className="auth-subtitle">
                  {t('auth.emailverification.process.form.description')}{' '}
                  {user?.email ||
                    t('auth.emailverification.process.form.descrption2')}
                </p>
              </div>

              <div className="auth-form-content">
                <div className="verification-message">
                  <p>{t('auth.emailverification.process.form.message')}</p>
                </div>

                <div className="otp-container">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      onPaste={index === 0 ? handlePaste : null}
                      ref={(el) => (inputRefs.current[index] = el)}
                      className="otp-input"
                      required
                      aria-label={`Digit ${index + 1}`}
                    />
                  ))}
                </div>

                <button
                  type="submit"
                  className="auth-button auth-button-primary"
                  disabled={isLoading || otp.join('').length !== 6}
                >
                  <ShieldCheck />
                  <span>
                    {isLoading
                      ? t('auth.login.form.accesskey.verification')
                      : t('auth.emailverification.process.form.verify')}
                  </span>
                </button>

                <div className="resend-container">
                  <p>{t('auth.emailverification.process.form.resend')}</p>
                  <button
                    type="button"
                    className={`resend-btn ${resendDisabled ? 'disabled' : ''}`}
                    onClick={handleResend}
                    disabled={resendDisabled}
                  >
                    {resendDisabled ? (
                      <>
                        <ClockFading />
                        <span>
                          {t('auth.emailverification.process.form.countdown')}{' '}
                          {countdown}s
                        </span>
                      </>
                    ) : (
                      <>
                        <RefreshCcw />
                        <span>
                          {t('auth.emailverification.process.form.button')}
                        </span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="auth-form-footer">
                <span>
                  {t('auth.emailverification.process.footer.question')}
                </span>
                <Link to="/change-email">
                  t("auth.changeemail.visual.title')
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EmailVerification
