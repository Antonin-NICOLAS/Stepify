import { useState, useRef, useEffect } from "react"
import { useNavigate, useLocation, Link } from "react-router-dom"
//context
import { useAuthStore } from "../../store/CheckAuth";
import { useLoaderStore } from "../../store/Loading";
//icons
import { RiMailCheckLine, RiTimerLine, RiArrowRightLine } from "react-icons/ri"
import { LuRefreshCw } from "react-icons/lu"
//CSS
import "./EmailVerification.css"

function EmailVerification() {
    const navigate = useNavigate()
    const { user, verifyEmail, resendVerificationCode } = useAuthStore();
    const { isLoading } = useLoaderStore()
    const [otp, setOtp] = useState(["", "", "", "", "", ""])
    const [resendDisabled, setResendDisabled] = useState(false)
    const [countdown, setCountdown] = useState(0)
    const [isVerified, setIsVerified] = useState(false)
    const inputRefs = useRef([])
    const location = useLocation();

    //add toast notification if redirected
    useEffect(() => {
        if (location.state?.showToast) {
            toast('Veuillez vérifier votre adresse email pour continuer.');
            navigate(location.pathname, { replace: true });
        }
    }, [location.state, location.pathname, navigate]);

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
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            // Focus previous input when backspace is pressed on empty input
            inputRefs.current[index - 1].focus()
        }
    }

    // Handle paste event
    const handlePaste = (e) => {
        e.preventDefault()
        const pastedData = e.clipboardData.getData("text")
        if (!/^\d+$/.test(pastedData)) return // Only allow numbers

        const digits = pastedData.slice(0, 6).split("")
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
        if (inputRefs.current[0]) inputRefs.current[0].focus();
    }, []);

    // Handle code submission
    const handleVerificationCode = async (e) => {
        e.preventDefault()
        const otpCode = otp.join("")
        verifyEmail(otpCode, () => {
            setIsVerified(true)
            setTimeout(() => {
                navigate("/dashboard")
            }, 3000)
        })
    }

    // Handle resend code
    const handleResend = async () => {
        if (resendDisabled) return;

        resendVerificationCode(
            // onError
            () => {
                setResendDisabled(false);
                setCountdown(0);
                setOtp(["", "", "", "", "", ""]);
            },
            // onSuccess
            () => {
                setResendDisabled(true);
                setCountdown(60);
                setOtp(["", "", "", "", "", ""]);
            }
        );
    };

    if (isVerified) {
        return (
            <div className="verificationcode-body">
                <div className="verificationcode-container">
                    <div className="form-slide">
                        <div className="verificationcode-form success-form">
                            <div className="success-icon">
                                <RiMailCheckLine />
                            </div>

                            <h2>Email Vérifié ! 🎉</h2>
                            <p className="subtitle">Votre adresse email a été confirmée avec succès</p>

                            <div className="success-message">
                                <p>Vous allez être redirigé vers votre tableau de bord...</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="verificationcode-body">
            <div className="verificationcode-container">
                <form className="verificationcode-form" onSubmit={handleVerificationCode}>
                    <div className="email-icon-container">
                        <div className="email-icon">
                            <RiMailCheckLine />
                        </div>
                    </div>

                    <h2>Vérifiez votre email</h2>
                    <p className="subtitle">Nous avons envoyé un code à {user?.email || "votre adresse email"}</p>

                    <div className="verification-message">
                        <p>Veuillez entrer le code à 6 chiffres envoyé à votre adresse email pour vérifier votre compte.</p>
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
                            />
                        ))}
                    </div>

                    <button type="submit" className="submit-btn" disabled={isLoading || otp.join("").length !== 6}>
                        {isLoading ? "Vérification..." : "Vérifier"} <RiArrowRightLine />
                    </button>

                    <div className="resend-container">
                        <p>Vous n'avez pas reçu de code?</p>
                        <button
                            type="button"
                            className={`resend-btn ${resendDisabled ? "disabled" : ""}`}
                            onClick={handleResend}
                            disabled={resendDisabled}
                        >
                            {resendDisabled ? (
                                <>
                                    <RiTimerLine /> Renvoyer dans {countdown}s
                                </>
                            ) : (
                                <>
                                    <LuRefreshCw /> Renvoyer le code
                                </>
                            )}
                        </button>
                    </div>

                    <div className="form-footer">
                        <span>Mauvaise adresse email?</span>
                        <Link to="/change-email">Changer d'email</Link>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default EmailVerification