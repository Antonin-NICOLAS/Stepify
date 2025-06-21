import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Spline from '@splinetool/react-spline'
//loader
import GlobalLoader from '../../components/GlobalLoader'
//context
import { useAuth } from '../../context/AuthContext'
import { useTranslation } from 'react-i18next'
// Components
import PrimaryBtn from '../../components/buttons/primaryBtn'
import InputField from '../../components/InputField'
import PasswordStrengthMeter from '../../components/PasswordStrengthMeter'
//icons
import {
  Mail,
  BadgeIcon as IdCard,
  User,
  LogIn,
  Lock,
  ArrowRight,
  UserPlus,
  AlertCircle,
  ChevronLeft,
} from 'lucide-react'
//CSS
import './Login.css'

function Auth() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { login, register, resendVerificationCode } = useAuth()
  const [isLoading, setIsLoading] = useState(false)

  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
    stayLoggedIn: false,
  })

  const [registerData, setRegisterData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    username: '',
    stayLoggedIn: false,
  })

  const [isLogin, setIsLogin] = useState(true)
  const [passwordStrength, setPasswordStrength] = useState({ score: 0 })
  const [formError, setFormError] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    setFormError('')
    if (!loginData.email || !loginData.password) {
      setFormError(t('common.authcontext.login.fillallfields'))
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginData.email)) {
      setFormError(t('common.authcontext.login.validemail'))
      return
    }
    setIsLoading(true)
    try {
      const response = await login(loginData)

      // Si l'authentification à deux facteurs est requise
      if (response?.requiresTwoFactor) {
        // Si WebAuthn est la méthode préférée et disponible
        if (
          response.preferredMethod === 'webauthn' &&
          response.availableMethods.includes('webauthn')
        ) {
          navigate('/2fa-verification', {
            state: {
              email: response.email,
              method: 'webauthn',
              stayLoggedIn: loginData.stayLoggedIn,
              availableMethods: response.availableMethods,
            },
          })
          return
        }

        // Si l'email est la méthode préférée et disponible
        if (
          response.preferredMethod === 'email' &&
          response.availableMethods.includes('email')
        ) {
          navigate('/2fa-verification', {
            state: {
              email: response.email,
              method: 'email',
              stayLoggedIn: loginData.stayLoggedIn,
              availableMethods: response.availableMethods,
            },
          })
          return
        }

        // Si l'application est la méthode préférée et disponible
        if (
          response.preferredMethod === 'app' &&
          response.availableMethods.includes('app')
        ) {
          navigate('/2fa-verification', {
            state: {
              email: response.email,
              method: 'app',
              stayLoggedIn: loginData.stayLoggedIn,
              availableMethods: response.availableMethods,
            },
          })
          return
        }
      }

      // Si l'utilisateur n'est pas vérifié
      if (!response.isVerified) {
        await resendVerificationCode(
          () => {
            toast.error(t('common.authcontext.login.notverifiederror'))
          },
          () => {
            toast.success(t('common.authcontext.login.notverifiedsuccess'))
          },
        )
        navigate('/email-verification')
        return
      }

      // Si tout est OK, rediriger vers le dashboard
      navigate('/dashboard')
      setLoginData({ email: '', password: '', stayLoggedIn: false })
    } catch (error) {
      setFormError(error.message || t('common.error'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setFormError('')
    if (!registerData.firstName || registerData.firstName.length < 2) {
      setFormError(t('common.authcontext.register.validfirstname'))
      return
    }
    if (!registerData.lastName || registerData.lastName.length < 2) {
      setFormError(t('common.authcontext.register.validlastname'))
      return
    }
    if (
      !registerData.email ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registerData.email)
    ) {
      setFormError(t('common.authcontext.register.validemail'))
      return
    }
    if (!/^[a-zA-Z0-9_]{3,30}$/.test(registerData.username)) {
      setFormError(t('common.authcontext.register.validusername'))
      return
    }
    if (registerData.password.length < 8) {
      setFormError(t('common.authcontext.register.validpassword'))
      return
    }
    if (passwordStrength.score < 80) {
      setFormError(t('account.password.weak'))
      return
    }
    if (registerData.password !== registerData.confirmPassword) {
      setFormError(t('auth.login.form.error.passwordmismatch'))
      return
    }

    setIsLoading(true)
    try {
      await register(registerData, () => {
        setRegisterData({
          email: '',
          password: '',
          confirmPassword: '',
          firstName: '',
          lastName: '',
          username: '',
          stayLoggedIn: false,
        })
        navigate('/email-verification')
      })
    } catch (error) {
      setFormError(error.message || t('common.error'))
      console.error('Registration error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="login-container">
      {isLoading && <GlobalLoader />}
      <div className="auth-header">
        <button className="back-button" onClick={() => navigate('/')}>
          <ChevronLeft size={20} />
          <span>{t('auth.login.back')}</span>
        </button>
        <h1>Stepify</h1>
      </div>

      <div className="auth-content">
        <div className="auth-visual">
          <div className="spline-container">
            <Spline scene="https://prod.spline.design/mXCYrxjtEUkHhzFi/scene.splinecode" />
          </div>
          <div className="auth-info">
            <h2>{t('auth.login.visual.title')}</h2>
            <p>{t('auth.login.visual.description')}</p>
            <div className="auth-stats">
              <div className="stat-item">
                <span className="stat-value">10K+</span>
                <span className="stat-label">
                  {t('auth.login.visual.stat1')}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-value">500+</span>
                <span className="stat-label">
                  {t('auth.login.visual.stat2')}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-value">1M+</span>
                <span className="stat-label">
                  {t('auth.login.visual.stat3')}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="auth-form-container">
          <div className="auth-tabs">
            <button
              className={`auth-tab ${isLogin ? 'active' : ''}`}
              onClick={() => {
                setIsLogin(true)
                setFormError('')
              }}
            >
              <LogIn size={18} />
              <span>{t('auth.login.tabs.login')}</span>
            </button>
            <button
              className={`auth-tab ${!isLogin ? 'active' : ''}`}
              onClick={() => {
                setIsLogin(false)
                setFormError('')
              }}
            >
              <UserPlus size={18} />
              <span>{t('auth.login.tabs.register')}</span>
            </button>
          </div>
          <div
            className={`auth-forms ${isLogin ? 'show-login' : 'show-register'}`}
          >
            <form className="login-form" onSubmit={handleLogin}>
              <h2>{t('auth.login.form.login.title')}</h2>
              <p className="form-subtitle">
                {t('auth.login.form.login.subtitle')}
              </p>
              {formError && (
                <div className="form-error" style={{ marginBottom: '1rem' }}>
                  <AlertCircle size={16} />
                  <span>{formError}</span>
                </div>
              )}
              <InputField
                id="login-email"
                type="email"
                label={t('common.email')}
                placeholder={t('auth.login.form.login.enteremail')}
                value={loginData.email}
                onChange={(e) =>
                  setLoginData({ ...loginData, email: e.target.value })
                }
                icon={Mail}
                autoComplete="email"
                required={true}
              />
              <InputField
                id="login-password"
                type="password"
                label={t('common.password')}
                placeholder={t('auth.login.form.login.enterpassword')}
                value={loginData.password}
                onChange={(e) =>
                  setLoginData({ ...loginData, password: e.target.value })
                }
                icon={Lock}
                autoComplete="current-password"
                required={true}
              />

              <div className="form-options">
                <label className="checkbox-container">
                  <input
                    type="checkbox"
                    name="stayLoggedIn"
                    id="login-stay-logged-in"
                    tabIndex={isLogin ? '0' : '-1'}
                    checked={loginData.stayLoggedIn}
                    onChange={() =>
                      setLoginData({
                        ...loginData,
                        stayLoggedIn: !loginData.stayLoggedIn,
                      })
                    }
                  />
                  <span className="checkmark"></span>
                  <span>{t('auth.login.form.login.stayconnected')}</span>
                </label>
                <Link
                  to="/forgot-password"
                  tabIndex={isLogin ? '0' : '-1'}
                  className="forgot-password"
                >
                  {t('auth.login.form.login.forgotpassword')}
                </Link>
              </div>

              <PrimaryBtn
                type="submit"
                style={{
                  width: '-webkit-fill-available',
                  marginBottom: '1.5rem',
                }}
                width="-moz-available"
                tabIndex={isLogin ? '0' : '-1'}
                disabled={isLoading}
              >
                <span>
                  {isLoading
                    ? t('auth.login.form.login.loading')
                    : t('auth.login.form.login.submit')}
                </span>
                <ArrowRight size={18} />
              </PrimaryBtn>

              <div className="form-footer">
                <span>{t('auth.login.form.login.noaccount')}</span>
                <button
                  type="button"
                  className="switch-form"
                  tabIndex={isLogin ? '0' : '-1'}
                  onClick={() => setIsLogin(false)}
                >
                  {t('auth.login.form.login.registernow')}
                </button>
              </div>
            </form>

            <form className="register-form" onSubmit={handleRegister}>
              <h2>{t('auth.login.form.register.title')}</h2>
              <p className="form-subtitle">
                {t('auth.login.form.register.subtitle')}
              </p>
              {formError && (
                <div className="form-error" style={{ marginBottom: '1rem' }}>
                  <AlertCircle size={16} />
                  <span>{formError}</span>
                </div>
              )}
              <div className="form-row">
                <InputField
                  id="register-firstname"
                  type="text"
                  label={t('auth.login.form.register.firstname')}
                  placeholder={t('auth.login.form.register.enterfirstname')}
                  value={registerData.firstName}
                  onChange={(e) =>
                    setRegisterData({
                      ...registerData,
                      firstName: e.target.value,
                    })
                  }
                  icon={User}
                  autoComplete="given-name"
                  required={true}
                />
                <InputField
                  id="register-lastname"
                  type="text"
                  label={t('auth.login.form.register.lastname')}
                  placeholder={t('auth.login.form.register.enterlastname')}
                  value={registerData.lastName}
                  onChange={(e) =>
                    setRegisterData({
                      ...registerData,
                      firstName: e.target.value,
                    })
                  }
                  icon={User}
                  autoComplete="family-name"
                  required={true}
                />
              </div>
              <InputField
                id="register-username"
                type="text"
                label={t('auth.login.form.register.username')}
                placeholder={t('auth.login.form.register.enterusername')}
                value={registerData.username}
                onChange={(e) =>
                  setRegisterData({
                    ...registerData,
                    username: e.target.value,
                  })
                }
                icon={IdCard}
                required={true}
              />
              <InputField
                id="register-email"
                type="text"
                label={t('common.email')}
                placeholder={t('auth.login.form.register.enteremail')}
                value={registerData.email}
                onChange={(e) =>
                  setRegisterData({
                    ...registerData,
                    email: e.target.value,
                  })
                }
                icon={Mail}
                autoComplete="email"
                required={true}
              />
              <InputField
                id="register-password"
                type="password"
                label={t('common.password')}
                placeholder={t('auth.login.form.register.createpassword')}
                value={registerData.password}
                onChange={(e) =>
                  setRegisterData({
                    ...registerData,
                    password: e.target.value,
                  })
                }
                icon={Lock}
                autoComplete="new-password"
                required={true}
              />
              <PasswordStrengthMeter
                password={registerData.password}
                onStrengthChange={setPasswordStrength}
                showScore={true}
                showRequirements={true}
              />
              <InputField
                id="register-confirm-password"
                type="password"
                label={t('common.password')}
                placeholder={t('auth.login.form.register.confirmyourpassword')}
                value={registerData.confirmPassword}
                onChange={(e) =>
                  setRegisterData({
                    ...registerData,
                    confirmPassword: e.target.value,
                  })
                }
                icon={Lock}
                autoComplete="new-password"
                required={true}
              />
              <div className="form-agreements">
                <label className="checkbox-container">
                  <input
                    type="checkbox"
                    name="tos"
                    tabIndex={isLogin ? '-1' : '0'}
                    id="tos"
                    required
                  />
                  <span className="checkmark"></span>
                  <span>
                    {t('auth.login.form.register.tos')}{' '}
                    <Link
                      to="/terms-of-service"
                      target="_blank"
                      tabIndex={isLogin ? '-1' : '0'}
                      rel="noopener noreferrer"
                    >
                      {t('auth.login.form.register.toslink')}
                    </Link>
                  </span>
                </label>

                <label className="checkbox-container">
                  <input
                    type="checkbox"
                    checked={registerData.stayLoggedIn}
                    tabIndex={isLogin ? '-1' : '0'}
                    name="stayLoggedIn"
                    id="register-stay-logged-in"
                    onChange={() =>
                      setRegisterData({
                        ...registerData,
                        stayLoggedIn: !registerData.stayLoggedIn,
                      })
                    }
                  />
                  <span className="checkmark"></span>
                  <span>{t('auth.login.form.register.stayconnected')}</span>
                </label>
              </div>

              <PrimaryBtn
                type="submit"
                tabIndex={isLogin ? '-1' : '0'}
                style={{
                  width: '-webkit-fill-available',
                  marginBottom: '1.5rem',
                }}
                width="-moz-available"
                disabled={isLoading}
              >
                <span>
                  {isLoading
                    ? t('auth.login.form.register.loading')
                    : t('auth.login.form.register.submit')}
                </span>
                <ArrowRight size={18} />
              </PrimaryBtn>

              <div className="form-footer">
                <span>{t('auth.login.form.register.alreadyaccount')}</span>
                <button
                  type="button"
                  className="switch-form"
                  tabIndex={isLogin ? '-1' : '0'}
                  onClick={() => setIsLogin(true)}
                >
                  {t('auth.login.form.register.signin')}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div className="auth-footer">
        <div className="footer-links">
          <Link tabIndex="-1" to="#">
            {t('auth.login.footer.help')}
          </Link>
          <Link tabIndex="-1" to="#">
            {t('auth.login.footer.privacy')}
          </Link>{' '}
          {/*TODO: privacy and help pages */}
          <Link tabIndex="-1" to="/terms-of-service">
            {t('auth.login.footer.terms')}
          </Link>
        </div>
        <p>
          © {new Date().getFullYear()} {t('auth.login.footer.copyright')}
        </p>
      </div>
    </div>
  )
}

export default Auth
