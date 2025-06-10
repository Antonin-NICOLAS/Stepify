import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import { useTranslation } from "react-i18next";
import {
  Shield,
  ShieldCheck,
  ShieldX,
  Copy,
  Download,
  Key,
  Smartphone,
  CheckCircle2,
  AlertTriangle,
  Mail,
  ArrowLeft,
  Fingerprint,
} from "lucide-react";
import "./TwoFactorSetup.css";

function TwoFactorSettings() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const {
    TwoFactorStatus,
    enableTwoFactor,
    enableEmail2FA,
    verifyTwoFactor,
    verifyEmail2FA,
    verifyWebAuthnRegistration,
    disableTwoFactor,
    disableEmail2FA,
    removeWebAuthnCredential,
    registerWebAuthnCredential,
  } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [twoFactorStatus, setTwoFactorStatus] = useState({
    app: false,
    email: false,
    webauthn: false,
  });
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [backupCodes, setBackupCodes] = useState([]);
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [password, setPassword] = useState("");
  const [step, setStep] = useState("main");
  const [currentMethod, setCurrentMethod] = useState("");
  const [webauthnCredentials, setWebauthnCredentials] = useState([]);
  const [webauthnError, setWebauthnError] = useState(null);

  useEffect(() => {
    const checkTwoFactorStatus = async () => {
      try {
        const status = await TwoFactorStatus();
        setTwoFactorStatus({
          app: status.appEnabled || false,
          email: status.emailEnabled || false,
          webauthn: status.webauthnEnabled || false,
        });
        if (status) {
          setBackupCodes(status.backupCodes || []);
          setWebauthnCredentials(status.webauthnCredentials || []);
        }
      } catch (error) {
        console.error("Erreur lors de la vérification du statut 2FA:", error);
        toast.error("Erreur lors de la vérification du statut 2FA");
        navigate("/settings");
      }
    };

    checkTwoFactorStatus();
  }, []);

  const handleEnable2FA = async (method) => {
    setIsLoading(true);
    setCurrentMethod(method);
    setWebauthnError(null);

    try {
      if (method === "app") {
        const response = await enableTwoFactor();
        setQrCodeUrl(response.qrCode);
        setSecretKey(response.secret);
        setStep("setup-app");
      } else if (method === "email") {
        await enableEmail2FA();
        setStep("verify-email");
      } else if (method === "webauthn") {
        try {
          await registerWebAuthnCredential();
          setStep("success");
          setTwoFactorStatus((prev) => ({
            ...prev,
            webauthn: true,
          }));
          toast.success("Clé de sécurité enregistrée avec succès");
        } catch (error) {
          setWebauthnError(error.message);
          setStep("main");
        }
      }
    } catch (error) {
      toast.error(error.message || "Erreur lors de l'activation de la 2FA");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify2FA = async (e) => {
    if (verificationCode.length !== 6) return;

    e.preventDefault();
    setIsLoading(true);

    try {
      let codes;
      if (currentMethod === "app") {
        codes = await verifyTwoFactor(verificationCode);
        setBackupCodes(codes);
        setStep("backup");
      } else if (currentMethod === "email") {
        await verifyEmail2FA(verificationCode);
        setStep("success");
      } else if (currentMethod === "webauthn") {
        await verifyWebAuthnRegistration(webauthnCredentials[0].credentialId);
        setStep("success");
      }

      // Update status
      setTwoFactorStatus((prev) => ({
        ...prev,
        [currentMethod]: true,
      }));

      setVerificationCode("");
      toast.success("2FA activée avec succès!");
    } catch (error) {
      toast.error(error.message || "Code de vérification incorrect");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisable2FA = async (method) => {
    setCurrentMethod(method);
    if (method === "app") {
      setStep("disable-app");
    } else if (method === "webauthn") {
      try {
        await removeWebAuthnCredential(webauthnCredentials[0].credentialId);
        setTwoFactorStatus((prev) => ({
          ...prev,
          webauthn: false,
        }));
        setStep("main");
        toast.success("Clé de sécurité supprimée avec succès");
      } catch (error) {
        toast.error(
          error.message ||
            "Erreur lors de la suppression de la clé de sécurité",
        );
      }
    } else {
      setStep("disable-email");
    }
  };

  const handleVerifyDisable2FA = async () => {
    setIsLoading(true);
    try {
      if (currentMethod === "app") {
        await disableTwoFactor(verificationCode);
      } else if (currentMethod === "email") {
        await disableEmail2FA(password);
      } else if (currentMethod === "webauthn") {
        await removeWebAuthnCredential(webauthnCredentials[0].credentialId);
      }

      setTwoFactorStatus((prev) => ({
        ...prev,
        [currentMethod]: false,
      }));

      if (currentMethod === "app") {
        setSecretKey(null);
        setQrCodeUrl("");
        setBackupCodes([]);
      }

      setStep("main");
      setVerificationCode("");
      toast.success("2FA désactivée avec succès");
    } catch (error) {
      toast.error("Erreur lors de la désactivation");
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (secret) => {
    navigator.clipboard.writeText(secret);
    toast.success("Clé copiée dans le presse-papiers !");
  };

  const downloadBackupCodes = () => {
    const content = `Codes de sauvegarde 2FA\n\n${backupCodes
      .map((item) => item.code)
      .join("\n")}\n\nConservez ces codes en sécurité.`;

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Stepify-recovery.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const renderMethodCard = (method, icon, title, description, enabled) => (
    <div className={`method-card ${enabled ? "enabled" : ""}`}>
      <div className="method-icon">{icon}</div>
      <div className="method-info">
        <h4>{title}</h4>
        <p>{description}</p>
        <div className="method-status">
          {enabled ? (
            <>
              <ShieldCheck size={16} className="status-icon enabled" />
              <span>{t("account.2fa-setup.card.active")}</span>
            </>
          ) : (
            <>
              <ShieldX size={16} className="status-icon disabled" />
              <span>{t("account.2fa-setup.card.desactive")}</span>
            </>
          )}
        </div>
      </div>
      <div className="method-actions">
        {!enabled ? (
          <button
            className="enable-btn"
            onClick={() => handleEnable2FA(method)}
            disabled={isLoading}
          >
            {t("account.security.2fa_enable")}
          </button>
        ) : (
          <div className="enabled-actions">
            {method === "app" && (
              <button
                className="backup-btn"
                onClick={() => setShowBackupCodes(!showBackupCodes)}
              >
                {showBackupCodes
                  ? t("account.2fa-setup.card.mask-backupcodes")
                  : t("account.2fa-setup.card.show-backupcodes")}
              </button>
            )}
            <button
              className="disable-btn"
              onClick={() => handleDisable2FA(method)}
            >
              {t("account.security.2fa_disable")}
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const renderContent = () => {
    switch (step) {
      case "setup-app":
        return (
          <div className="setup-content">
            <div className="setup-header">
              <h3>{t("account.2fa-setup.setup-app.title")}</h3>
              <p>{t("account.2fa-setup.setup-app.description")}</p>
            </div>

            <div className="qr-section">
              <div className="qr-code-wrapper">
                <img
                  src={qrCodeUrl}
                  alt={t("account.2fa-setup.setup-app.qr-code-alt")}
                />
              </div>

              <div className="manual-key">
                <h4>{t("account.2fa-setup.setup-app.manual-key")}</h4>
                <div className="key-container">
                  <code>{secretKey}</code>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(secretKey)}
                    className="copy-btn"
                  >
                    <Copy size={16} />
                  </button>
                </div>
              </div>
            </div>

            <div className="setup-actions">
              <button
                className="primary-btn"
                onClick={() => setStep("verify-app")}
              >
                <Smartphone size={16} />
                {t("account.2fa-setup.setup-app.app-configured")}
              </button>
              <button className="secondary-btn" onClick={() => setStep("main")}>
                {t("common.cancel")}
              </button>
            </div>
          </div>
        );

      case "setup-webauthn":
        return (
          <div className="setup-content">
            <div className="setup-header">
              <h3>{t("account.2fa-setup.setup-webauthn.title")}</h3>
              <p>{t("account.2fa-setup.setup-webauthn.description")}</p>
              {webauthnError && (
                <div className="error-message">
                  <AlertTriangle size={16} />
                  {webauthnError}
                </div>
              )}
            </div>
            <div className="webauthn-actions">
              <button
                className="primary-btn"
                onClick={async () => {
                  try {
                    await registerWebAuthnCredential();
                    setStep("success");
                    setTwoFactorStatus((prev) => ({
                      ...prev,
                      webauthn: true,
                    }));
                    toast.success("Clé de sécurité enregistrée avec succès");
                  } catch (error) {
                    setWebauthnError(error.message);
                  }
                }}
              >
                <Fingerprint size={16} />
                {t("account.2fa-setup.setup-webauthn.config-now")}
              </button>
              <button className="secondary-btn" onClick={() => setStep("main")}>
                {t("common.cancel")}
              </button>
            </div>
          </div>
        );

      case "verify-app":
      case "verify-email":
        return (
          <div className="verify-content">
            <div className="verify-header">
              <h3>{t("account.2fa-setup.verify.title")}</h3>
              <p>
                {currentMethod === "app" &&
                  t("account.2fa-setup.verify.app-entercode")}
                {currentMethod === "email" &&
                  t("account.2fa-setup.verify.email-entercode")}
              </p>
            </div>

            <form onSubmit={handleVerify2FA} className="verify-form">
              <div className="code-input-group">
                <label htmlFor="verificationCode">
                  {t("account.2fa-setup.verify.label-code")}
                </label>
                <div className="code-input-wrapper">
                  <Key size={20} />
                  <input
                    type="text"
                    id="verificationCode"
                    value={verificationCode}
                    onChange={(e) =>
                      setVerificationCode(
                        e.target.value.replace(/\D/g, "").slice(0, 6),
                      )
                    }
                    placeholder="123456"
                    maxLength={6}
                  />
                </div>
              </div>

              <div className="verify-actions">
                <button
                  type="submit"
                  className="primary-btn"
                  disabled={isLoading || verificationCode.length !== 6}
                >
                  <CheckCircle2 size={16} />
                  {isLoading
                    ? t("auth.login.form.accesskey.verification")
                    : t("account.2fa-setup.verify.activate")}
                </button>
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() =>
                    setStep(currentMethod === "app" ? "setup-app" : "main")
                  }
                >
                  {t("common.back")}
                </button>
              </div>
            </form>
          </div>
        );

      case "backup":
        return (
          <div className="backup-content">
            <div className="backup-header">
              <h3>{t("account.2fa-setup.backup.title")}</h3>
              <p>{t("account.2fa-setup.backup.description")}</p>
            </div>

            <div className="backup-codes-section">
              <div className="backup-warning">
                <AlertTriangle size={20} />
                <div>
                  <h4>{t("account.2fa-setup.backup.important")}</h4>
                  <p>{t("account.2fa-setup.backup.warning")}</p>
                </div>
              </div>

              <div className="backup-codes-grid">
                {backupCodes.map((item, index) => (
                  <code key={item.id || index}>{item.code}</code>
                ))}
              </div>

              <button
                type="button"
                onClick={downloadBackupCodes}
                className="download-btn"
              >
                <Download size={16} />
                {t("account.2fa-setup.backup.download")}
              </button>
            </div>

            <button className="primary-btn" onClick={() => setStep("main")}>
              <CheckCircle2 size={16} />
              {t("account.2fa-setup.backup.final-button")}
            </button>
          </div>
        );

      case "success":
        return (
          <div className="success-content">
            <div className="success-icon">
              <CheckCircle2 size={48} />
            </div>
            <h3>{t("account.2fa-setup.success.title")}</h3>
            <p>{t("account.2fa-setup.success.description")}</p>
            <button className="primary-btn" onClick={() => setStep("main")}>
              {t("account.2fa-setup.success.back-to-settings")}
            </button>
          </div>
        );

      case "disable-email":
        return (
          <div className="disable-content">
            <div className="disable-header">
              <h3>{t("account.2fa-setup.disable-email.title")}</h3>
              <p>{t("account.2fa-setup.disable-email.description")}</p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleVerifyDisable2FA();
              }}
              className="disable-form"
            >
              <div className="code-input-group">
                <label htmlFor="password">{t("common.password")}</label>
                <div className="code-input-wrapper">
                  <Key size={20} />
                  <input
                    type="text"
                    id="password"
                    value={password}
                    autoComplete="current-password"
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t("auth.login.form.login.enterpassword")}
                    required
                  />
                </div>
              </div>

              <div className="disable-actions">
                <button
                  type="submit"
                  className="danger-btn"
                  disabled={isLoading || !password}
                >
                  <ShieldX size={16} />
                  {isLoading
                    ? t("auth.login.form.accesskey.verification")
                    : t("account.security.2fa_disable")}
                </button>
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() => setStep("main")}
                >
                  {t("common.cancel")}
                </button>
              </div>
            </form>
          </div>
        );

      case "disable-app":
        return (
          <div className="disable-content">
            <div className="disable-header">
              <h3>{t("account.2fa-setup.disable-email.title")}</h3>
              <p>{t("account.2fa-setup.disable-app.title")}</p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleVerifyDisable2FA();
              }}
              className="disable-form"
            >
              <div className="code-input-group">
                <label htmlFor="verificationCode">
                  {t("account.2fa-setup.verify.label-code")}
                </label>
                <div className="code-input-wrapper">
                  <Key size={20} />
                  <input
                    type="text"
                    id="verificationCode"
                    autoComplete="one-time-code"
                    placeholder="123456"
                    value={verificationCode}
                    onChange={(e) =>
                      setVerificationCode(
                        e.target.value.replace(/\D/g, "").slice(0, 6),
                      )
                    }
                    maxLength={6}
                  />
                </div>
              </div>

              <div className="disable-actions">
                <button
                  type="submit"
                  className="danger-btn"
                  disabled={isLoading || verificationCode.length !== 6}
                >
                  <ShieldX size={16} />
                  {isLoading
                    ? t("auth.login.form.accesskey.verification")
                    : t("account.security.2fa_disable")}
                </button>
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() => setStep("main")}
                >
                  {t("common.cancel")}
                </button>
              </div>
            </form>
          </div>
        );

      default:
        return (
          <div className="main-content">
            <div className="intro-section">
              <p>{t("account.2fa-setup.main.description")}</p>
            </div>

            <div className="methods-grid">
              {renderMethodCard(
                "app",
                <Smartphone size={24} />,
                t("account.2fa-setup.card.apptitle"),
                t("account.2fa-setup.card.appdescription"),
                twoFactorStatus.app,
              )}

              {renderMethodCard(
                "email",
                <Mail size={24} />,
                t("common.email"),
                t("account.2fa-setup.card.emaildescription"),
                twoFactorStatus.email,
              )}

              {renderMethodCard(
                "webauthn",
                <Fingerprint size={24} />,
                t("account.2fa-setup.card.webauthntitle"),
                t("account.2fa-setup.card.webauthndescription"),
                twoFactorStatus.webauthn,
              )}
            </div>

            {showBackupCodes && backupCodes.length > 0 && (
              <div className="backup-codes-display">
                <div className="backup-warning">
                  <AlertTriangle size={20} />
                  <div>
                    <h4>{t("account.2fa-setup.backup.title")}</h4>
                    <p>{t("account.2fa-setup.backup.keep")}</p>
                  </div>
                </div>
                <div className="backup-codes-grid">
                  {backupCodes.map((item, index) => (
                    <code key={item.id || index}>{item.code}</code>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={downloadBackupCodes}
                  className="download-btn"
                >
                  <Download size={16} />
                  {t("common.download")}
                </button>
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <div className="twofactor-page">
      <div className="twofactor-container">
        <div className="twofactor-header">
          <button className="back-btn" onClick={() => navigate("/settings")}>
            <ArrowLeft size={20} />
          </button>
          <div className="header-content">
            <div className="header-icon">
              <Shield size={24} />
            </div>
            <h1>{t("account.security.2fa")}</h1>
            <p>{t("account.2fa-setup.description")}</p>
          </div>
        </div>

        <div className="twofactor-content">{renderContent()}</div>
      </div>
    </div>
  );
}

export default TwoFactorSettings;
