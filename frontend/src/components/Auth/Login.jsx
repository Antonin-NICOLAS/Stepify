import React, { useState } from "react";
import { useAuthStore } from "../../store/CheckAuth";
import { useNavigate, Link } from "react-router-dom";
import Spline from "@splinetool/react-spline";
//icons
import {
  RiMailLine, RiEyeFill, RiEyeOffFill,
  RiIdCardLine, RiUser3Line
} from "react-icons/ri";
import { LuLogIn } from "react-icons/lu";
//CSS
import "./Login.css";

function Auth() {
  const navigate = useNavigate();
  const { login, register, isLoading } = useAuthStore();

  const [Logindata, setLoginData] = useState({
    email: "",
    password: "",
    stayLoggedIn: false
  });

  const [Registerdata, setRegisterData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    username: "",
    stayLoggedIn: false
  });

  const [isLogin, setIsLogin] = useState(true);
  const [showLPassword, setShowLPassword] = useState(false);
  const [showRPassword, setShowRPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    login(Logindata, () => {
      setLoginData({
        email: "",
        password: "",
        stayLoggedIn: false
      }),
        navigate;
    });
  };

  const handleRegister = (e) => {
    e.preventDefault();
    register(Registerdata, () => {
      setRegisterData({
        email: "",
        password: "",
        confirmPassword: "",
        firstName: "",
        lastName: "",
        username: "",
        stayLoggedIn: false
      }),
        navigate("/email-verification");
    });
  };

  return (
    <div className="auth-body">
      <div className="auth-container">
        <div className="auth-col col-spline">
          <Spline scene="https://prod.spline.design/mXCYrxjtEUkHhzFi/scene.splinecode" />
        </div>

        <div className="auth-col col-form">
          <div className="auth-toggle-buttons">
            <button className={`form-switch ${isLogin ? "active" : ""}`} onClick={() => setIsLogin(true)}>Sign In</button>
            <button className={`form-switch ${!isLogin ? "active" : ""}`} onClick={() => setIsLogin(false)}>Register</button>
          </div>

          <div className={`form-slide ${isLogin ? "slide-login" : "slide-register"}`}>
            <form className="auth-form" onSubmit={handleLogin}>
              <h2>Welcome Back 👋</h2>
              <p className="subtitle">Log in to your Stepify account</p>

              <div className="input-group">
                <label>Email</label>
                <div className="input-wrapper">
                  <input type="email" placeholder="Enter your email" value={Logindata.email} onChange={(e) => setLoginData({ ...Logindata, email: e.target.value })} required />
                  <RiMailLine />
                </div>
              </div>

              <div className="input-group">
                <label>Password</label>
                <div className="input-wrapper">
                  <input type={showLPassword ? "text" : "password"} placeholder="Enter your password" value={Logindata.password} onChange={(e) => setLoginData({ ...Logindata, password: e.target.value })} required />
                  <button type="button" onClick={() => setShowLPassword(!showLPassword)}>
                    {showLPassword ? <RiEyeOffFill /> : <RiEyeFill />}
                  </button>
                </div>
              </div>

              <div className="form-options">
                <label><input type="checkbox" checked={Logindata.stayLoggedIn} onChange={() => setLoginData({ ...Logindata, stayLoggedIn: !Logindata.stayLoggedIn })} /> Stay connected</label>
                <Link to="/forgot-password">Forgot password?</Link>
              </div>

              <button type="submit" className="submit-btn" disabled={isLoading}>Log In <LuLogIn /></button>
              <div className="form-footer">
                <span>Pas de compte ?</span>
                <button onClick={() => setIsLogin(false)}>Register</button>
              </div>
            </form>
            <form className="auth-form" onSubmit={handleRegister}>
              <h2>Nice to meet you 👋</h2>
              <p className="subtitle">Create your Stepify account</p>

              <div className="input-group">
                <label>Prénom</label>
                <div className="input-wrapper">
                  <input type="text" placeholder="Your firstname" value={Registerdata.firstName} onChange={(e) => setRegisterData({ ...Registerdata, firstName: e.target.value })} required />
                  <RiIdCardLine />
                </div>
              </div>
              <div className="input-group">
                <label>Nom</label>
                <div className="input-wrapper">
                  <input type="text" placeholder="Your lastname" value={Registerdata.lastName} onChange={(e) => setRegisterData({ ...Registerdata, lastName: e.target.value })} required />
                  <RiIdCardLine />
                </div>
              </div>
              <div className="input-group">
                <label>Username</label>
                <div className="input-wrapper">
                  <input type="text" placeholder="Your username" value={Registerdata.username} onChange={(e) => setRegisterData({ ...Registerdata, username: e.target.value })} required />
                  <RiUser3Line />
                </div>
              </div>
              <div className="input-group">
                <label>Email</label>
                <div className="input-wrapper">
                  <input type="email" placeholder="Your email" value={Registerdata.email} onChange={(e) => setRegisterData({ ...Registerdata, email: e.target.value })} required />
                  <RiMailLine />
                </div>
              </div>
              <div className="input-group">
                <label>Password</label>
                <div className="input-wrapper">
                  <input type={showRPassword ? "text" : "password"} placeholder="Your password" value={Registerdata.password} onChange={(e) => setRegisterData({ ...Registerdata, password: e.target.value })} required />
                  <button type="button" onClick={() => setShowRPassword(!showRPassword)}>
                    {showRPassword ? <RiEyeOffFill /> : <RiEyeFill />}
                  </button>
                </div>
              </div>
              <div className="input-group">
                <label>Confirm your Password</label>
                <div className="input-wrapper">
                  <input type={showConfirmPassword ? "text" : "password"} placeholder="Confirm your password" value={Registerdata.confirmPassword} onChange={(e) => setRegisterData({ ...Registerdata, confirmPassword: e.target.value })} required />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                    {showConfirmPassword ? <RiEyeOffFill /> : <RiEyeFill />}
                  </button>
                </div>
              </div>
              <div className="register-form-options">
                <label><input type="checkbox" required /><Link to="/terms-of-service" target="_blank" rel="noopener noreferrer">Accepter les conditions d'utilisation</Link></label> {/*TODO conditions d'utilisation*/}
                <label><input type="checkbox" checked={Registerdata.stayLoggedIn} onChange={() => setRegisterData({ ...Registerdata, stayLoggedIn: !Registerdata.stayLoggedIn })} />Rester connecté</label>
              </div>

              <button type="submit" className="submit-btn" disabled={isLoading}>Register <LuLogIn /></button>
              <div className="form-footer">
                <span>Déjà un compte ?</span>
                <button onClick={() => setIsLogin(true)}>Login</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Auth;