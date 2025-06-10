import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Spline from "@splinetool/react-spline";
//loader
import GlobalLoader from "../../utils/GlobalLoader";
//context
import { useAuth } from "../../context/AuthContext";
import { useTranslation } from "react-i18next";
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
  Fingerprint,
  AlertTriangle,
} from "lucide-react";
//CSS
import "./Login.css";

function Auth() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login, register, authenticateWithWebAuthn, resendVerificationCode } =
    useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
    stayLoggedIn: false,
  });

  const [registerData, setRegisterData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    username: "",
    stayLoggedIn: false,
  });

  const [isLogin, setIsLogin] = useState(true);
  const [showLPassword, setShowLPassword] = useState(false);
  const [showRPassword, setShowRPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formError, setFormError] = useState("");
  const [showWebAuthnPrompt, setShowWebAuthnPrompt] = useState(false);
  const [webauthnError, setWebauthnError] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setFormError("");
    setIsLoading(true);
    try {
      const response = await login(loginData);

      // Si l'authentification à deux facteurs est requise
      if (response?.requiresTwoFactor) {
        // Si WebAuthn est la méthode préférée et disponible
        if (
          response.preferredMethod === "webauthn" &&
          response.availableMethods.includes("webauthn")
        ) {
          setShowWebAuthnPrompt(true);
          return;
        }

        // Si l'email est la méthode préférée et disponible
        if (
          response.preferredMethod === "email" &&
          response.availableMethods.includes("email")
        ) {
          navigate("/2fa-verification", {
            state: {
              email: response.email,
              method: "email",
              stayLoggedIn: loginData.stayLoggedIn,
            },
          });
          return;
        }

        // Si l'application est la méthode préférée et disponible
        if (
          response.preferredMethod === "app" &&
          response.availableMethods.includes("app")
        ) {
          navigate("/2fa-verification", {
            state: {
              email: response.email,
              method: "app",
              stayLoggedIn: loginData.stayLoggedIn,
            },
          });
          return;
        }
      }

      // Si l'utilisateur n'est pas vérifié
      if (!response.isVerified) {
        await resendVerificationCode(
          () => {
            toast.error(t("common.authcontext.login.notverifiederror"));
          },
          () => {
            toast.success(t("common.authcontext.login.notverifiedsuccess"));
          },
        );
        navigate("/email-verification");
        return;
      }

      // Si tout est OK, rediriger vers le dashboard
      navigate("/dashboard");
      setLoginData({ email: "", password: "", stayLoggedIn: false });
    } catch (error) {
      setFormError(error.message || t("common.error"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleWebAuthnAuth = async () => {
    try {
      setIsLoading(true);
      setWebauthnError(null);

      await authenticateWithWebAuthn(loginData.email, loginData.stayLoggedIn);
      setShowWebAuthnPrompt(false);
      setLoginData({ email: "", password: "", stayLoggedIn: false });
    } catch (error) {
      setWebauthnError(error.message || t("common.error"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setFormError("");

    if (registerData.password !== registerData.confirmPassword) {
      setFormError(t("auth.login.form.error.passwordmismatch"));
      return;
    }

    setIsLoading(true);
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
        });
        navigate("/email-verification");
      });
    } catch (error) {
      setFormError(error.message || t("common.error"));
      console.error("Registration error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      {isLoading && <GlobalLoader />}
      <div className="auth-header">
        <button className="back-button" onClick={() => navigate("/")}>
          <ChevronLeft size={20} />
          <span>{t("auth.login.back")}</span>
        </button>
        <h1>Stepify</h1>
      </div>

      <div className="auth-content">
        <div className="auth-visual">
          <div className="spline-container">
            <Spline scene="https://prod.spline.design/mXCYrxjtEUkHhzFi/scene.splinecode" />
          </div>
          <div className="auth-info">
            <h2>{t("auth.login.visual.title")}</h2>
            <p>{t("auth.login.visual.description")}</p>
            <div className="auth-stats">
              <div className="stat-item">
                <span className="stat-value">10K+</span>
                <span className="stat-label">
                  {t("auth.login.visual.stat1")}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-value">500+</span>
                <span className="stat-label">
                  {t("auth.login.visual.stat2")}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-value">1M+</span>
                <span className="stat-label">
                  {t("auth.login.visual.stat3")}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="auth-form-container">
          <div className="auth-tabs">
            <button
              className={`auth-tab ${isLogin ? "active" : ""}`}
              onClick={() => setIsLogin(true)}
            >
              <LogIn size={18} />
              <span>{t("auth.login.tabs.login")}</span>
            </button>
            <button
              className={`auth-tab ${!isLogin ? "active" : ""}`}
              onClick={() => setIsLogin(false)}
            >
              <UserPlus size={18} />
              <span>{t("auth.login.tabs.register")}</span>
            </button>
          </div>

          {formError && (
            <div className="form-error">
              <AlertCircle size={16} />
              <span>{formError}</span>
            </div>
          )}

          {showWebAuthnPrompt ? (
            <div className="webauthn-prompt">
              <div className="prompt-header">
                <Fingerprint size={24} />
                <h3>{t("auth.login.form.accesskey.title")}</h3>
                <p>{t("auth.login.form.accesskey.description")}</p>
              </div>

              {webauthnError && (
                <div className="error-message">
                  <AlertTriangle size={16} />
                  {webauthnError}
                </div>
              )}

              <div className="prompt-actions">
                <button
                  className="primary-btn"
                  onClick={handleWebAuthnAuth}
                  disabled={isLoading}
                >
                  <Fingerprint size={16} />
                  {isLoading
                    ? t("auth.login.form.accesskey.verification")
                    : t("auth.login.form.accesskey.usekey")}
                </button>
                <button
                  className="secondary-btn"
                  onClick={() => setShowWebAuthnPrompt(false)}
                >
                  {t("common.cancel")}
                </button>
              </div>
            </div>
          ) : (
            <div
              className={`auth-forms ${
                isLogin ? "show-login" : "show-register"
              }`}
            >
              <form className="login-form" onSubmit={handleLogin}>
                <h2>{t("auth.login.form.login.title")}</h2>
                <p className="form-subtitle">
                  {t("auth.login.form.login.subtitle")}
                </p>

                <div className="form-group">
                  <label htmlFor="login-email">
                    <Mail size={16} />
                    <span>{t("common.email")}</span>
                  </label>
                  <div className="input-container">
                    <input
                      id="login-email"
                      type="email"
                      placeholder={t("auth.login.form.login.enteremail")}
                      autoComplete="email"
                      value={loginData.email}
                      onChange={(e) =>
                        setLoginData({ ...loginData, email: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="login-password">
                    <Lock size={16} />
                    <span>{t("common.password")}</span>
                  </label>
                  <div className="input-container">
                    <input
                      id="login-password"
                      type={showLPassword ? "text" : "password"}
                      placeholder={t("auth.login.form.login.enterpassword")}
                      autoComplete="password"
                      value={loginData.password}
                      onChange={(e) =>
                        setLoginData({ ...loginData, password: e.target.value })
                      }
                      required
                    />
                    <button
                      type="button"
                      className="toggle-password"
                      onClick={() => setShowLPassword(!showLPassword)}
                      aria-label={
                        showLPassword
                          ? t("auth.login.form.login.showpassword")
                          : t("auth.login.form.login.hidepassword")
                      }
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
                      onChange={() =>
                        setLoginData({
                          ...loginData,
                          stayLoggedIn: !loginData.stayLoggedIn,
                        })
                      }
                    />
                    <span className="checkmark"></span>
                    <span>{t("auth.login.form.login.stayconnected")}</span>
                  </label>
                  <Link to="/forgot-password" className="forgot-password">
                    {t("auth.login.form.login.forgotpassword")}
                  </Link>
                </div>

                <button
                  type="submit"
                  className="submit-button"
                  disabled={isLoading}
                >
                  <span>
                    {isLoading
                      ? t("auth.login.form.login.loading")
                      : t("auth.login.form.login.submit")}
                  </span>
                  <ArrowRight size={18} />
                </button>

                <div className="form-footer">
                  <span>{t("auth.login.form.login.noaccount")}</span>
                  <button
                    type="button"
                    className="switch-form"
                    onClick={() => setIsLogin(false)}
                  >
                    {t("auth.login.form.login.registernow")}
                  </button>
                </div>
              </form>

              <form className="register-form" onSubmit={handleRegister}>
                <h2>{t("auth.login.form.register.title")}</h2>
                <p className="form-subtitle">
                  {t("auth.login.form.register.subtitle")}
                </p>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="register-firstname">
                      <User size={16} />
                      <span>{t("auth.login.form.register.firstname")}</span>
                    </label>
                    <div className="input-container">
                      <input
                        id="register-firstname"
                        type="text"
                        placeholder={t(
                          "auth.login.form.register.enterfirstname",
                        )}
                        autoComplete="given-name"
                        value={registerData.firstName}
                        onChange={(e) =>
                          setRegisterData({
                            ...registerData,
                            firstName: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="register-lastname">
                      <User size={16} />
                      <span>{t("auth.login.form.register.lastname")}</span>
                    </label>
                    <div className="input-container">
                      <input
                        id="register-lastname"
                        type="text"
                        placeholder={t(
                          "auth.login.form.register.enterlastname",
                        )}
                        autoComplete="family-name"
                        value={registerData.lastName}
                        onChange={(e) =>
                          setRegisterData({
                            ...registerData,
                            lastName: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="register-username">
                    <IdCard size={16} />
                    <span>{t("auth.login.form.register.username")}</span>
                  </label>
                  <div className="input-container">
                    <input
                      id="register-username"
                      type="text"
                      placeholder={t("auth.login.form.register.enterusername")}
                      value={registerData.username}
                      onChange={(e) =>
                        setRegisterData({
                          ...registerData,
                          username: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="register-email">
                    <Mail size={16} />
                    <span>{t("common.email")}</span>
                  </label>
                  <div className="input-container">
                    <input
                      id="register-email"
                      type="email"
                      placeholder={t("auth.login.form.register.enteremail")}
                      autoComplete="email"
                      value={registerData.email}
                      onChange={(e) =>
                        setRegisterData({
                          ...registerData,
                          email: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="register-password">
                    <Lock size={16} />
                    <span>{t("common.password")}</span>
                  </label>
                  <div className="input-container">
                    <input
                      id="register-password"
                      type={showRPassword ? "text" : "password"}
                      placeholder={t("auth.login.form.register.createpassword")}
                      autoComplete="new-password"
                      value={registerData.password}
                      onChange={(e) =>
                        setRegisterData({
                          ...registerData,
                          password: e.target.value,
                        })
                      }
                      required
                    />
                    <button
                      type="button"
                      className="toggle-password"
                      onClick={() => setShowRPassword(!showRPassword)}
                      aria-label={
                        showRPassword
                          ? t("auth.login.form.login.hidepassword")
                          : t("auth.login.form.login.showpassword")
                      }
                    >
                      {showRPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="register-confirm-password">
                    <Lock size={16} />
                    <span></span>
                  </label>
                  <div className="input-container">
                    <input
                      id="register-confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder={t(
                        "auth.login.form.register.confirmyourpassword",
                      )}
                      autoComplete="new-password"
                      value={registerData.confirmPassword}
                      onChange={(e) =>
                        setRegisterData({
                          ...registerData,
                          confirmPassword: e.target.value,
                        })
                      }
                      required
                    />
                    <button
                      type="button"
                      className="toggle-password"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      aria-label={
                        showConfirmPassword
                          ? t("auth.login.form.register.showpassword")
                          : t("auth.login.form.register.showpassword")
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>
                </div>

                <div className="form-agreements">
                  <label className="checkbox-container">
                    <input type="checkbox" required />
                    <span className="checkmark"></span>
                    <span>
                      {t("auth.login.form.register.tos")}{" "}
                      <Link
                        to="/terms-of-service"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {t("auth.login.form.register.toslink")}
                      </Link>
                    </span>
                  </label>

                  <label className="checkbox-container">
                    <input
                      type="checkbox"
                      checked={registerData.stayLoggedIn}
                      onChange={() =>
                        setRegisterData({
                          ...registerData,
                          stayLoggedIn: !registerData.stayLoggedIn,
                        })
                      }
                    />
                    <span className="checkmark"></span>
                    <span>{t("auth.login.form.register.stayconnected")}</span>
                  </label>
                </div>

                <button
                  type="submit"
                  className="submit-button"
                  disabled={isLoading}
                >
                  <span>
                    {isLoading
                      ? t("auth.login.form.register.loading")
                      : t("auth.login.form.register.submit")}
                  </span>
                  <ArrowRight size={18} />
                </button>

                <div className="form-footer">
                  <span>{t("auth.login.form.register.alreadyaccount")}</span>
                  <button
                    type="button"
                    className="switch-form"
                    onClick={() => setIsLogin(true)}
                  >
                    {t("auth.login.form.register.signin")}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>

      <div className="auth-footer">
        <div className="footer-links">
          <Link to="#">{t("auth.login.footer.help")}</Link>
          <Link to="#">{t("auth.login.footer.privacy")}</Link>{" "}
          {/*TODO: privacy and help pages */}
          <Link to="/terms-of-service">{t("auth.login.footer.terms")}</Link>
        </div>
        <p>
          © {new Date().getFullYear()} {t("auth.login.footer.copyright")}
        </p>
      </div>
    </div>
  );
}

export default Auth;
