import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
//loader
import GlobalLoader from "../../utils/GlobalLoader";
//context
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-hot-toast";
//icons
import {
  MailCheck,
  ClockIcon as ClockFading,
  ShieldCheck,
  RefreshCcw,
  Mail,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
//CSS
import "./EmailVerification.css";

function EmailVerification() {
  const navigate = useNavigate();
  const { user, verifyEmail, resendVerificationCode } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [isVerified, setIsVerified] = useState(false);
  const inputRefs = useRef([]);
  const location = useLocation();

  //add toast notification if redirected
  useEffect(() => {
    if (location.state?.showToast) {
      toast("Veuillez vérifier votre adresse email pour continuer.");
      navigate(location.pathname, { replace: true });
    }
  }, [location.state, location.pathname, navigate]);

  // Handle countdown for resend button
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && resendDisabled) {
      setResendDisabled(false);
    }
  }, [countdown, resendDisabled]);

  // Handle input change and auto-focus next input
  const handleChange = (index, value) => {
    if (value.length > 1) {
      // If pasting multiple digits, only take the first one
      value = value.slice(0, 1);
    }

    // Only allow numbers
    if (value && !/^\d+$/.test(value)) {
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  // Handle backspace key
  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      // Focus previous input when backspace is pressed on empty input
      inputRefs.current[index - 1].focus();
    }
  };

  // Handle paste event
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text");
    if (!/^\d+$/.test(pastedData)) return; // Only allow numbers

    const digits = pastedData.slice(0, 6).split("");
    const newOtp = [...otp];

    digits.forEach((digit, index) => {
      if (index < 6) {
        newOtp[index] = digit;
      }
    });

    setOtp(newOtp);

    // Focus the appropriate input after paste
    if (digits.length < 6) {
      inputRefs.current[digits.length].focus();
    }
  };
  // Focus the first input on mount
  useEffect(() => {
    if (inputRefs.current[0]) inputRefs.current[0].focus();
  }, []);

  // Handle code submission
  const handleVerificationCode = async (e) => {
    e.preventDefault();
    const otpCode = otp.join("");
    setIsLoading(true);
    try {
      await verifyEmail(otpCode, () => {
        setIsVerified(true);
        setTimeout(() => {
          navigate("/dashboard");
        }, 3000);
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle resend code
  const handleResend = async () => {
    if (resendDisabled) return;

    resendVerificationCode(
      // onError
      () => {
        setResendDisabled(true);
        setCountdown(60);
        setOtp(["", "", "", "", "", ""]);
      },
      // onSuccess
      () => {
        setResendDisabled(false);
        setCountdown(0);
        setOtp(["", "", "", "", "", ""]);
      }
    );
  };

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
                  <h3>Vérification réussie!</h3>
                  <p>Votre compte est maintenant vérifié</p>
                </div>
                <div className="auth-stat-item">
                  <div className="auth-stat-icon success">
                    <CheckCircle2 />
                  </div>
                  <div className="auth-stat-info">
                    <h4>Email vérifié</h4>
                    <p>Votre adresse email a été confirmée</p>
                  </div>
                </div>
                <div className="auth-stat-item">
                  <div className="auth-stat-icon success">
                    <CheckCircle2 />
                  </div>
                  <div className="auth-stat-info">
                    <h4>Compte activé</h4>
                    <p>Votre compte est maintenant actif</p>
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
                <h2>Email Vérifié ! 🎉</h2>
                <p className="auth-subtitle">
                  Votre adresse email a été confirmée avec succès
                </p>
              </div>

              <div className="auth-form-content">
                <div className="success-message">
                  <p>Vous allez être redirigé vers votre tableau de bord...</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
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
                style={{ flexDirection: "column" }}
              >
                <h3>Vérification</h3>
                <p>Nous prenons la sécurité de votre compte au sérieux</p>
              </div>
              <div className="auth-stat-item">
                <div className="auth-stat-icon">
                  <Mail />
                </div>
                <div className="auth-stat-info">
                  <h4>Code envoyé</h4>
                  <p>Vérifiez votre boîte de réception</p>
                </div>
              </div>
              <div className="auth-stat-item">
                <div className="auth-stat-icon">
                  <AlertCircle />
                </div>
                <div className="auth-stat-info">
                  <h4>Pas reçu ?</h4>
                  <p>Vous pouvez demander un nouveau code</p>
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
                <h2>Vérifiez votre email</h2>
                <p className="auth-subtitle">
                  Nous avons envoyé un code à{" "}
                  {user?.email || "votre adresse email"}
                </p>
              </div>

              <div className="auth-form-content">
                <div className="verification-message">
                  <p>
                    Veuillez entrer le code à 6 chiffres envoyé à votre adresse
                    email pour vérifier votre compte.
                  </p>
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
                  disabled={isLoading || otp.join("").length !== 6}
                >
                  <ShieldCheck />
                  <span>{isLoading ? "Vérification..." : "Vérifier"}</span>
                </button>

                <div className="resend-container">
                  <p>Vous n'avez pas reçu de code ?</p>
                  <button
                    type="button"
                    className={`resend-btn ${resendDisabled ? "disabled" : ""}`}
                    onClick={handleResend}
                    disabled={resendDisabled}
                  >
                    {resendDisabled ? (
                      <>
                        <ClockFading />
                        <span>Renvoyer dans {countdown}s</span>
                      </>
                    ) : (
                      <>
                        <RefreshCcw />
                        <span>Renvoyer le code</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="auth-form-footer">
                <span>Mauvaise adresse email ?</span>
                <Link to="/change-email">Changer d'email</Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EmailVerification;
