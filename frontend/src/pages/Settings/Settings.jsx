import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useUser } from "../../context/UserContext";
import { toast } from "react-hot-toast";
import { useTranslation, Trans } from "react-i18next";
import GlobalLoader from "../../utils/GlobalLoader";
import {
  Globe,
  Moon,
  Sun,
  ChevronDown,
  Check,
  SunMoon,
  Shield,
  Bell,
  Eye,
  Lock,
  Smartphone,
  Monitor,
  User,
  Key,
  LogOut,
  Trash2,
  AlertTriangle,
  SunSnow,
} from "lucide-react";
import "./Settings.css";

const Settings = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user, logout, deleteUser } = useAuth();
  const {
    updateThemePreference,
    updateLanguagePreference,
    updatePrivacySettings,
    updateNotificationPreferences,
    changePassword,
    getActiveSessions,
    terminateSession,
    terminateAllSessions,
  } = useUser();

  const [isLoading, setIsLoading] = useState(false);
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
  const [activeSessions, setActiveSessions] = useState([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  // Password change state
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [errors, setErrors] = useState({});

  // Privacy settings state
  const [privacySettings, setPrivacySettings] = useState({
    showActivityToFriends: true,
    allowFriendRequests: true,
    allowChallengeInvites: true,
    showLastLogin: false,
    showStatsPublicly: false,
  });

  // Notification preferences state
  const [notificationPreferences, setNotificationPreferences] = useState({
    activitySummary: false,
    newChallenges: false,
    friendRequests: false,
    goalAchieved: false,
    friendActivity: false,
  });

  const languages = [
    { code: "en", name: t("account.language.en") },
    { code: "fr", name: t("account.language.fr") },
    { code: "es", name: t("account.language.es") },
    { code: "de", name: t("account.language.de") },
  ];

  useEffect(() => {
    if (user) {
      setPrivacySettings(user.privacySettings || privacySettings);
      setNotificationPreferences(
        user.notificationPreferences || notificationPreferences,
      );
      loadActiveSessions();
    }
  }, [user]);

  const loadActiveSessions = async () => {
    setIsLoading(true);
    try {
      const sessions = await getActiveSessions(user._id);
      setActiveSessions(sessions || []);
    } catch (error) {
      console.error("Erreur lors du chargement des sessions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Password strength calculator
  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (password.match(/[a-z]/)) strength += 25;
    if (password.match(/[A-Z]/)) strength += 25;
    if (password.match(/[0-9]/)) strength += 25;
    if (password.match(/[^a-zA-Z0-9]/)) strength += 25;
    return Math.min(strength, 100);
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));

    if (name === "newPassword") {
      setPasswordStrength(calculatePasswordStrength(value));
    }
  };

  const savePassword = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setErrors({ password: t("auth.login.form.error.passwordmismatch") });
      return;
    }

    if (passwordStrength < 75) {
      setErrors({ password: t("account.password.weak") });
      return;
    }

    setIsLoading(true);
    try {
      await changePassword(user._id, passwordData, () => {
        setIsEditingPassword(false);
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        setPasswordStrength(0);
        setErrors({});
      });
    } catch (error) {
      setErrors({ password: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleThemeChange = async (theme) => {
    if (theme === user.themePreference) return;
    setIsLoading(true);
    try {
      await updateThemePreference(user._id, theme);
    } catch (error) {
      console.error("Erreur lors de la mise à jour du thème");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLanguageChange = async (code) => {
    if (code === user.languagePreference) return;
    setIsLoading(true);
    try {
      setIsLanguageDropdownOpen(false);
      await updateLanguagePreference(user._id, code);
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la langue", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrivacyChange = async (setting, value) => {
    const newSettings = { ...privacySettings, [setting]: value };
    setPrivacySettings(newSettings);

    try {
      await updatePrivacySettings(user._id, newSettings);
    } catch (error) {
      console.error(
        "Erreur lors de la mise à jour des paramètres de confidentialité",
        error,
      );
      setPrivacySettings(privacySettings); // Revert on error
    }
  };

  const handleNotificationChange = async (setting, value) => {
    const newPreferences = { ...notificationPreferences, [setting]: value };
    setNotificationPreferences(newPreferences);

    setIsLoading(true);
    try {
      await updateNotificationPreferences(user._id, newPreferences);
    } catch (error) {
      console.error(
        "Erreur lors de la mise à jour des préférences de notification :",
        error,
      );
      setNotificationPreferences(notificationPreferences); // Revert on error
    } finally {
      setIsLoading(false);
    }
  };

  const handleTerminateSession = async (sessionId) => {
    try {
      await terminateSession(user?._id, sessionId);
      await loadActiveSessions();
    } catch (error) {
      console.error("Erreur lors de la terminaison de la session :", error);
    }
  };

  const handleTerminateAllSessions = async () => {
    try {
      await terminateAllSessions(user?._id);
      logout();
    } catch (error) {
      console.error("Erreur lors de la terminaison des sessions :", error);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "SUPPRIMER") {
      toast.error(t("account.security.write-delete"));
      return;
    }

    setIsLoading(true);
    try {
      await deleteUser(user._id);
      setShowDeleteConfirm(false);
      setDeleteConfirmText("");
      logout();
    } catch (error) {
      console.error("Erreur lors de la suppression du compte :", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength < 25) return "#ef4444";
    if (passwordStrength < 50) return "#f59e0b";
    if (passwordStrength < 75) return "#eab308";
    return "#10b981";
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength < 25) return t("account.password.very-low");
    if (passwordStrength < 50) return t("account.password.low");
    if (passwordStrength < 75) return t("account.password.medium");
    return t("account.password.strong");
  };

  return (
    <div className="settings-container">
      {isLoading && <GlobalLoader />}

      <div className="settings-header">
        <div className="header-content">
          <h1>{t("account.settings.title")}</h1>
          <button className="profile-btn" onClick={() => navigate("/profile")}>
            <User size={20} />
            {t("account.settings.redirect")}
          </button>
        </div>
      </div>

      <div className="settings-content">
        {/* Security Section */}
        <div className="settings-section">
          <h3>
            <Shield size={20} />
            {t("auth.resetpassword.visual.step2")}
          </h3>

          {/* Password Change */}
          <div className={`setting-item ${isEditingPassword ? "editing" : ""}`}>
            <div className="setting-info">
              <Lock size={20} />
              <div>
                <h4>{t("common.password")}</h4>
                <p>{t("account.password.modify")}</p>
              </div>
            </div>
            {!isEditingPassword ? (
              <button
                className="edit-btn"
                onClick={() => setIsEditingPassword(true)}
              >
                {t("account.buttons.edit")}
              </button>
            ) : (
              <div className="password-editor">
                {errors.password && (
                  <div className="error-message">{errors.password}</div>
                )}
                <form onSubmit={savePassword}>
                  <div className="password-fields">
                    <input
                      type="password"
                      name="currentPassword"
                      placeholder={t("account.password.current")}
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      required
                    />
                    <div className="new-password-group">
                      <input
                        type="password"
                        name="newPassword"
                        placeholder={t("account.password.new")}
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        required
                      />
                      {passwordData.newPassword && (
                        <div className="password-strength">
                          <div className="strength-bar">
                            <div
                              className="strength-fill"
                              style={{
                                width: `${passwordStrength}%`,
                                backgroundColor: getPasswordStrengthColor(),
                              }}
                            ></div>
                          </div>
                          <span style={{ color: getPasswordStrengthColor() }}>
                            {getPasswordStrengthText()}
                          </span>
                        </div>
                      )}
                    </div>
                    <input
                      type="password"
                      name="confirmPassword"
                      placeholder={t("account.password.confirm")}
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      required
                    />
                  </div>
                  <div className="password-requirements">
                    <h5>{t("account.password.criterias.title")}</h5>
                    <ul>
                      <li
                        className={
                          passwordData.newPassword.length >= 8 ? "valid" : ""
                        }
                      >
                        {t("account.password.criterias.len")}
                      </li>
                      <li
                        className={
                          /[a-z]/.test(passwordData.newPassword) ? "valid" : ""
                        }
                      >
                        {t("account.password.criterias.lowercase")}
                      </li>
                      <li
                        className={
                          /[A-Z]/.test(passwordData.newPassword) ? "valid" : ""
                        }
                      >
                        {t("account.password.criterias.uppercase")}
                      </li>
                      <li
                        className={
                          /[0-9]/.test(passwordData.newPassword) ? "valid" : ""
                        }
                      >
                        {t("account.password.criterias.number")}
                      </li>
                    </ul>
                  </div>
                  <div className="form-actions">
                    <button
                      type="button"
                      className="cancel-btn"
                      onClick={() => {
                        setIsEditingPassword(false);
                        setPasswordData({
                          currentPassword: "",
                          newPassword: "",
                          confirmPassword: "",
                        });
                        setPasswordStrength(0);
                        setErrors({});
                      }}
                    >
                      {t("common.cancel")}
                    </button>
                    <button type="submit" className="save-btn">
                      {t("account.buttons.save")}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* Two-Factor Authentication */}
          <div className="setting-item">
            <div className="setting-info">
              <Key size={20} />
              <div>
                <h4>{t("account.security.2fa")}</h4>
                <p>
                  {user?.twoFactorAuth?.appEnabled ||
                  user?.twoFactorAuth?.webauthnEnabled ||
                  user?.twoFactorAuth?.emailEnabled
                    ? t("account.security.2fa-enabled-description")
                    : t("account.security.2fa-disabled-description")}
                </p>
              </div>
            </div>
            <button
              className="action-btn"
              onClick={() => navigate("/settings/2fa")}
            >
              {user?.twoFactorAuth?.appEnabled ||
              user?.twoFactorAuth?.webauthnEnabled ||
              user?.twoFactorAuth?.emailEnabled
                ? t("common.manage")
                : t("account.security.2fa_enable")}
            </button>
          </div>

          {/* Active Sessions */}
          <div className="setting-item sessions-item">
            <div className="setting-info">
              <Monitor size={20} />
              <div>
                <h4>{t("account.sessions.title")}</h4>
                <p>{t("account.sessions.description")}</p>
              </div>
            </div>
            <div className="sessions-list">
              {activeSessions.map((session, index) => (
                <div key={session.id || index} className="session-item">
                  <div className="session-info">
                    <div className="session-device">
                      <Smartphone size={16} />
                      <span>
                        {session.userAgent ||
                          t("account.sessions.unknown-device")}
                      </span>
                    </div>
                    <div className="session-details">
                      <span>IP: {session.ipAddress}</span>
                      <span>
                        {t("account.sessions.loggedin")}{" "}
                        {new Date(session.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <button
                    className="terminate-btn"
                    onClick={() => handleTerminateSession(session.id)}
                  >
                    <LogOut size={16} />
                  </button>
                </div>
              ))}
              {activeSessions.length > 1 && (
                <button
                  className="terminate-all-btn"
                  onClick={handleTerminateAllSessions}
                >
                  {t("account.sessions.terminate-all")}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Privacy Section */}
        <div className="settings-section">
          <h3>
            <Eye size={20} />
            {t("auth.login.footer.privacy")}
          </h3>

          <div className="setting-item">
            <div className="setting-info">
              <div>
                <h4>{t("account.privacy.friend-setting-title")}</h4>
                <p>{t("account.privacy.friend-setting-subtitle")}</p>
              </div>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={privacySettings.showActivityToFriends}
                onChange={(e) =>
                  handlePrivacyChange("showActivityToFriends", e.target.checked)
                }
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <div>
                <h4>{t("account.privacy.friend-request-setting-title")}</h4>
                <p>{t("account.privacy.friend-request-setting-subtitle")}</p>
              </div>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={privacySettings.allowFriendRequests}
                onChange={(e) =>
                  handlePrivacyChange("allowFriendRequests", e.target.checked)
                }
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <div>
                <h4>{t("account.privacy.challenge-setting-title")}</h4>
                <p>{t("account.privacy.challenge-setting-subtitle")}</p>
              </div>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={privacySettings.allowChallengeInvites}
                onChange={(e) =>
                  handlePrivacyChange("allowChallengeInvites", e.target.checked)
                }
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <div>
                <h4>{t("account.privacy.last-login-setting-title")}</h4>
                <p>{t("account.privacy.last-login-setting-subtitle")}</p>
              </div>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={privacySettings.showLastLogin}
                onChange={(e) =>
                  handlePrivacyChange("showLastLogin", e.target.checked)
                }
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <div>
                <h4>{t("account.privacy.public-stats-setting-title")}</h4>
                <p>{t("account.privacy.public-stats-setting-subtitle")}</p>
              </div>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={privacySettings.showStatsPublicly}
                onChange={(e) =>
                  handlePrivacyChange("showStatsPublicly", e.target.checked)
                }
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>

        {/* Notifications Section */}
        <div className="settings-section">
          <h3>
            <Bell size={20} />
            {t("account.notif.title")}
          </h3>

          <div className="setting-item">
            <div className="setting-info">
              <div>
                <h4>{t("account.notif.activity-title")}</h4>
                <p>{t("account.notif.activity-description")}</p>
              </div>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={notificationPreferences.activitySummary}
                onChange={(e) =>
                  handleNotificationChange("activitySummary", e.target.checked)
                }
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <div>
                <h4>{t("account.notif.new-challenge-title")}</h4>
                <p>{t("account.notif.new-challenge-description")}</p>
              </div>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={notificationPreferences.newChallenges}
                onChange={(e) =>
                  handleNotificationChange("newChallenges", e.target.checked)
                }
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <div>
                <h4>{t("account.privacy.friend-request-setting-title")}</h4>
                <p>{t("account.notif.friend-request-description")}</p>
              </div>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={notificationPreferences.friendRequests}
                onChange={(e) =>
                  handleNotificationChange("friendRequests", e.target.checked)
                }
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <div>
                <h4>{t("account.notif.goal-reached-title")}</h4>
                <p>{t("account.notif.goal-reached-description")}</p>
              </div>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={notificationPreferences.goalAchieved}
                onChange={(e) =>
                  handleNotificationChange("goalAchieved", e.target.checked)
                }
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <div>
                <h4>{t("account.notif.friend-activity-title")}</h4>
                <p>{t("account.notif.friend-activity-description")}</p>
              </div>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={notificationPreferences.friendActivity}
                onChange={(e) =>
                  handleNotificationChange("friendActivity", e.target.checked)
                }
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>

        {/* Preferences Section */}
        <div className="settings-section">
          <h3>
            <User size={20} />
            {t("account.user.preferences")}
          </h3>

          <div className="setting-item">
            <div className="setting-info">
              <Globe size={20} />
              <div>
                <h4>{t("account.language.title")}</h4>
                <p>{t("account.language.description")}</p>
              </div>
            </div>
            <div className="language-selector">
              <div
                className="selected-language"
                onClick={() =>
                  setIsLanguageDropdownOpen(!isLanguageDropdownOpen)
                }
                aria-expanded={isLanguageDropdownOpen}
              >
                <span>
                  {languages.find((l) => l.code === i18n.language)?.name ||
                    t("account.language.fr")}
                </span>
                <ChevronDown
                  size={16}
                  className={isLanguageDropdownOpen ? "rotated" : ""}
                />
              </div>
              {isLanguageDropdownOpen && (
                <div className="language-dropdown">
                  {languages.map((language) => (
                    <div
                      key={language.code}
                      className={`language-option ${
                        user?.languagePreference === language.code
                          ? "selected"
                          : ""
                      }`}
                      onClick={() => handleLanguageChange(language.code)}
                    >
                      {language.name}
                      {user?.languagePreference === language.code && (
                        <Check size={16} className="check-icon" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <SunSnow size={20} />
              <div>
                <h4>{t("account.theme.title")}</h4>
                <p>{t("account.theme.description")}</p>
              </div>
            </div>
            <div className="theme-selector">
              <div
                className={`theme-option ${
                  user?.themePreference === "light" ? "selected" : ""
                }`}
                onClick={() => handleThemeChange("light")}
              >
                <Sun size={16} />
                <span>{t("account.theme.light")}</span>
              </div>
              <div
                className={`theme-option ${
                  user?.themePreference === "dark" ? "selected" : ""
                }`}
                onClick={() => handleThemeChange("dark")}
              >
                <Moon size={16} />
                <span>{t("account.theme.dark")}</span>
              </div>
              <div
                className={`theme-option ${
                  user?.themePreference === "auto" ? "selected" : ""
                }`}
                onClick={() => handleThemeChange("auto")}
              >
                <SunMoon size={20} />
                <span>{t("account.theme.system")}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="settings-section danger-zone">
          <h3>
            <AlertTriangle size={20} />
            {t("account.delete.title")}
          </h3>

          <div className="setting-item">
            <div className="setting-info">
              <Trash2 size={20} />
              <div>
                <h4>{t("account.delete.subtitle")}</h4>
                <p>{t("account.delete.description")}</p>
              </div>
            </div>
            <button
              className="danger-btn"
              onClick={() => setShowDeleteConfirm(true)}
            >
              {t("common.delete")}
            </button>
          </div>

          {showDeleteConfirm && (
            <div className="delete-confirm-modal">
              <div className="modal-content">
                <h4>{t("account.delete.confirm")}</h4>
                <p>{t("account.delete.confirm-description")}</p>
                <p>
                  <Trans i18nKey="account.security.delete_confirmation">
                    Tapez <strong>SUPPRIMER</strong> pour confirmer :
                  </Trans>
                </p>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder={t("account.delete.confirm-placeholder")}
                />
                <div className="modal-actions">
                  <button
                    className="cancel-btn"
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      setDeleteConfirmText("");
                    }}
                  >
                    {t("common.cancel")}
                  </button>
                  <button
                    className="danger-btn"
                    onClick={handleDeleteAccount}
                    disabled={deleteConfirmText !== "SUPPRIMER"}
                  >
                    {t("account.delete.confirm-button")}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
