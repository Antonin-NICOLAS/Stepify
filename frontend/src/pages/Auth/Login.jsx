import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import Spline from "@splinetool/react-spline"
//loader
import GlobalLoader from "../../utils/GlobalLoader"
//context
import { useAuth } from "../../context/AuthContext"
//icons
import {
  Mail,
  Eye,
  EyeOff,
  BadgeIcon as IdCard,
  User,
  LogIn,
  Lock,
  ArrowRight,
  UserPlus,
  AlertCircle,
  ChevronLeft,
} from "lucide-react"
//CSS
import "./Login.css"

function Auth() {
  const navigate = useNavigate()
  const { login, register } = useAuth()
  const [isLoading, setIsLoading] = useState(false)

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
    stayLoggedIn: false,
  })

  const [registerData, setRegisterData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    username: "",
    stayLoggedIn: false,
  })

  const [isLogin, setIsLogin] = useState(true)
  const [showLPassword, setShowLPassword] = useState(false)
  const [showRPassword, setShowRPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formError, setFormError] = useState("")

  const handleLogin = async (e) => {
    e.preventDefault()
    setFormError("")
    setIsLoading(true)
    try {
      await login(loginData, () => setLoginData({ email: "", password: "", stayLoggedIn: false }), navigate)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setFormError("")

    if (registerData.password !== registerData.confirmPassword) {
      setFormError("Passwords do not match")
      return
    }

    setIsLoading(true)
    try {
      await register(registerData, () => {
        setRegisterData({
          email: "",
          password: "",
          confirmPassword: "",
          firstName: "",
          lastName: "",
          username: "",
          stayLoggedIn: false,
        })
        navigate("/email-verification")
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="login-container">
      {isLoading && <GlobalLoader />}
      <div className="auth-header">
        <button className="back-button" onClick={() => navigate("/")}>
          <ChevronLeft size={20} />
          <span>Back to Home</span>
        </button>
        <h1>Stepify</h1>
      </div>

      <div className="auth-content">
        <div className="auth-visual">
          <div className="spline-container">
            <Spline scene="https://prod.spline.design/mXCYrxjtEUkHhzFi/scene.splinecode" />
          </div>
          <div className="auth-info">
            <h2>Track Your Progress</h2>
            <p>Join thousands of users improving their fitness with Stepify</p>
            <div className="auth-stats">
              <div className="stat-item">
                <span className="stat-value">10K+</span>
                <span className="stat-label">Active Users</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">500+</span>
                <span className="stat-label">Défis</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">1M+</span>
                <span className="stat-label">Steps Tracked</span>
              </div>
            </div>
          </div>
        </div>

        <div className="auth-form-container">
          <div className="auth-tabs">
            <button className={`auth-tab ${isLogin ? "active" : ""}`} onClick={() => setIsLogin(true)}>
              <LogIn size={18} />
              <span>Sign In</span>
            </button>
            <button className={`auth-tab ${!isLogin ? "active" : ""}`} onClick={() => setIsLogin(false)}>
              <UserPlus size={18} />
              <span>Register</span>
            </button>
          </div>

          {formError && (
            <div className="form-error">
              <AlertCircle size={16} />
              <span>{formError}</span>
            </div>
          )}

          <div className={`auth-forms ${isLogin ? "show-login" : "show-register"}`}>
            <form className="login-form" onSubmit={handleLogin}>
              <h2>Welcome Back</h2>
              <p className="form-subtitle">Log in to your Stepify account</p>

              <div className="form-group">
                <label htmlFor="login-email">
                  <Mail size={16} />
                  <span>Email</span>
                </label>
                <div className="input-container">
                  <input
                    id="login-email"
                    type="email"
                    placeholder="Enter your email"
                    autoComplete="email"
                    value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="login-password">
                  <Lock size={16} />
                  <span>Password</span>
                </label>
                <div className="input-container">
                  <input
                    id="login-password"
                    type={showLPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    autoComplete="password"
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    required
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowLPassword(!showLPassword)}
                    aria-label={showLPassword ? "Hide password" : "Show password"}
                  >
                    {showLPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="form-options">
                <label className="checkbox-container">
                  <input
                    type="checkbox"
                    checked={loginData.stayLoggedIn}
                    onChange={() => setLoginData({ ...loginData, stayLoggedIn: !loginData.stayLoggedIn })}
                  />
                  <span className="checkmark"></span>
                  <span>Stay connected</span>
                </label>
                <Link to="/forgot-password" className="forgot-password">
                  Forgot password?
                </Link>
              </div>

              <button type="submit" className="submit-button" disabled={isLoading}>
                <span>Sign In</span>
                <ArrowRight size={18} />
              </button>

              <div className="form-footer">
                <span>Don't have an account?</span>
                <button type="button" className="switch-form" onClick={() => setIsLogin(false)}>
                  Register now
                </button>
              </div>
            </form>

            <form className="register-form" onSubmit={handleRegister}>
              <h2>Create Account</h2>
              <p className="form-subtitle">Join Stepify and start tracking your progress</p>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="register-firstname">
                    <User size={16} />
                    <span>First Name</span>
                  </label>
                  <div className="input-container">
                    <input
                      id="register-firstname"
                      type="text"
                      placeholder="Your first name"
                      autoComplete="given-name"
                      value={registerData.firstName}
                      onChange={(e) => setRegisterData({ ...registerData, firstName: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="register-lastname">
                    <User size={16} />
                    <span>Last Name</span>
                  </label>
                  <div className="input-container">
                    <input
                      id="register-lastname"
                      type="text"
                      placeholder="Your last name"
                      autoComplete="family-name"
                      value={registerData.lastName}
                      onChange={(e) => setRegisterData({ ...registerData, lastName: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="register-username">
                  <IdCard size={16} />
                  <span>Username</span>
                </label>
                <div className="input-container">
                  <input
                    id="register-username"
                    type="text"
                    placeholder="Choose a username"
                    value={registerData.username}
                    onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="register-email">
                  <Mail size={16} />
                  <span>Email</span>
                </label>
                <div className="input-container">
                  <input
                    id="register-email"
                    type="email"
                    placeholder="Your email address"
                    autoComplete="email"
                    value={registerData.email}
                    onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="register-password">
                  <Lock size={16} />
                  <span>Password</span>
                </label>
                <div className="input-container">
                  <input
                    id="register-password"
                    type={showRPassword ? "text" : "password"}
                    placeholder="Create a password"
                    autoComplete="new-password"
                    value={registerData.password}
                    onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                    required
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowRPassword(!showRPassword)}
                    aria-label={showRPassword ? "Hide password" : "Show password"}
                  >
                    {showRPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="register-confirm-password">
                  <Lock size={16} />
                  <span>Confirm Password</span>
                </label>
                <div className="input-container">
                  <input
                    id="register-confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    autoComplete="new-password"
                    value={registerData.confirmPassword}
                    onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                    required
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="form-agreements">
                <label className="checkbox-container">
                  <input type="checkbox" required />
                  <span className="checkmark"></span>
                  <span>
                    I agree to the{" "}
                    <Link to="/terms-of-service" target="_blank" rel="noopener noreferrer">
                      Terms of Service
                    </Link>
                  </span>
                </label>

                <label className="checkbox-container">
                  <input
                    type="checkbox"
                    checked={registerData.stayLoggedIn}
                    onChange={() => setRegisterData({ ...registerData, stayLoggedIn: !registerData.stayLoggedIn })}
                  />
                  <span className="checkmark"></span>
                  <span>Stay connected after registration</span>
                </label>
              </div>

              <button type="submit" className="submit-button" disabled={isLoading}>
                <span>Create Account</span>
                <ArrowRight size={18} />
              </button>

              <div className="form-footer">
                <span>Already have an account?</span>
                <button type="button" className="switch-form" onClick={() => setIsLogin(true)}>
                  Sign in
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div className="auth-footer">
        <div className="footer-links">
          <Link to="#">Help</Link>
          <Link to="#">Privacy</Link> {/*TODO: privacy and help pages */}
          <Link to="/terms-of-service">Terms</Link>
        </div>
        <p>© {new Date().getFullYear()} Stepify. All rights reserved.</p>
      </div>
    </div>
  )
}

export default Auth