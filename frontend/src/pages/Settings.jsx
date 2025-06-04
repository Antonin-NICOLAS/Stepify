import { useState, useRef, useEffect } from "react";
//Context
import { useAuth } from "../context/AuthContext";
import { useUser } from "../context/UserContext";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import GlobalLoader from "../utils/GlobalLoader";
//icons
import {
  Camera,
  Edit,
  Upload,
  Globe,
  Moon,
  Sun,
  ChevronDown,
  Check,
  SunMoon,
} from "lucide-react";
import AccountImage from "../assets/account.png";
//CSS
import "./Settings.css";

const AccountPage = () => {
  // Contexts
  const { t, i18n } = useTranslation(["account", "common"]);
  const { user } = useAuth();
  const {
    updateAvatar,
    updateStatus,
    updateProfile,
    updateEmail,
    updateDailyGoal,
    updateThemePreference,
    updateLanguagePreference,
    changePassword,
    getUserProfile,
  } = useUser();

  // UI state
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [isEditingUrlAvatar, setIsEditingUrlAvatar] = useState(false);
  const [isEditingAvatar, setIsEditingAvatar] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [isCustomStatus, setIsCustomStatus] = useState(false);
  const [Image, setImage] = useState("");
  const fileInputRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);

  // Form states
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    avatarUrl: "",
    status: "",
    dailyGoal: 10000,
  });
  useEffect(() => {
    setIsLoading(true);
    if (user) {
      getUserProfile(user._id);
    }
    setIsLoading(false);
  }, [getUserProfile]);

  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        username: user.username || "",
        email: user.email || "",
        avatarUrl: user.avatarUrl || "",
        status: user.status[user?.languagePreference] || "",
        dailyGoal: user.dailyGoal || 10000,
      });
    }
  }, [user]);

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({
    password: "",
    profile: "",
    general: "",
  });

  // Options
  const statusOptions = Object.values(
    t("account:account.user.status", { returnObjects: true })
  );

  const languages = [
    { code: "en", name: t("account:account.language.en") },
    { code: "fr", name: t("account:account.language.fr") },
    { code: "es", name: t("account:account.language.es") },
    { code: "de", name: t("account:account.language.de") },
  ];

  // 1. Avatar Handlers
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    previewFile(file);
  };

  const handleFileSubmit = async (e) => {
    e.preventDefault();
    const file = fileInputRef.current.files[0];
    if (!file) return toast.error(t("account:account.errors.nofileselected"));

    setIsLoading(true);
    try {
      await updateAvatar(user._id, file);
      setIsEditingAvatar(false);
      setImage("");
    } catch (error) {
      console.error("erreur lors de la mise à jour de l'avatar", error);
    } finally {
      setIsLoading(false);
    }
  };
  const previewFile = (file) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      setImage(reader.result);
    };
  };
  const handleAvatarUrlSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await updateAvatar(user._id, profileData.avatarUrl);
      setIsEditingUrlAvatar(false);
    } catch (error) {
      console.error(
        "erreur lors de la mise à jour de l'avatar par url :",
        error
      );
    } finally {
      setIsLoading(false);
    }
  };
  //handle drag & drop
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      handleFileChange({ target: { files: [file] } });
    }
  };

  // 2. Profile Handlers (nom/prénom/email/username)
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    const changes = {};

    if (profileData.username !== user.username) {
      changes.username = profileData.username;
    }
    if (profileData.firstName !== user.firstName) {
      changes.firstName = profileData.firstName;
    }
    if (profileData.lastName !== user.lastName) {
      changes.lastName = profileData.lastName;
    }

    setIsLoading(true);
    try {
      if (Object.keys(changes).length > 0) {
        await updateProfile(user._id, changes);
      }

      if (profileData.email !== user.email) {
        await updateEmail(user._id, profileData.email);
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour du profil :", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Status Handlers
  const handleStatusChange = async (status) => {
    if (status === "Personnalisé") {
      setIsCustomStatus(true);
      setIsStatusDropdownOpen(false);
      return;
    }
    setIsCustomStatus(false);
    setIsStatusDropdownOpen(false);
    if (status !== user.status[user?.languagePreference]) {
      setIsLoading(true);
      try {
        setIsCustomStatus(false);
        setIsStatusDropdownOpen(false);
        await updateStatus(user._id, status);
      } catch (error) {
        console.error("erreur lors de la mise à jour du statut :", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // 4. Password Handlers (inchangé)
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };
  const savePassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await changePassword(user._id, passwordData, () => {
        setIsEditingPassword(false);
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      });
    } catch (error) {
      console.error("erreur lors du changement de mot de passe", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 5. Daily Goal Handlers
  const saveDailyGoal = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await updateDailyGoal(user._id, profileData.dailyGoal, () =>
        setIsEditingGoal(false)
      );
    } catch (error) {
      console.error("erreur lors de la mise à jour de l'objectif quotidien");
    } finally {
      setIsLoading(false);
    }
  };

  // 6. Theme Preference Handler
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

  // 7. Language Preference Handler
  const handleLanguageChange = async (code) => {
    if (code === user.languagePreference) return;
    setIsLoading(true);
    try {
      setIsLanguageDropdownOpen(false);
      await updateLanguagePreference(user._id, code);
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la langue");
    } finally {
      setIsLoading(false);
    }
  };

  // Helpers

  const formatNumber = (num) => {
    return new Intl.NumberFormat(i18n.language).format(num || 0);
  };
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(
      i18n.language || "fr-FR",
      options
    );
  };

  return (
    <div className="account-container">
      {isLoading && <GlobalLoader />}
      <div className="account-header">
        <h1>{t("account:account.title")}</h1>
      </div>
      {errors.general && <div className="error-message">{errors.general}</div>}

      <div className="account-content">
        {/* Profile Section */}
        <div className="account-section profile-section">
          <div className="avatar-container">
            <div
              className={`avatar-wrapper ${isDragging ? "dragging" : ""}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {isEditingUrlAvatar && (
                <img
                  src={profileData.avatarUrl || AccountImage}
                  className="avatar"
                />
              )}
              {isEditingAvatar && (
                <img src={Image || AccountImage} className="avatar" />
              )}
              {!isEditingAvatar && !isEditingUrlAvatar && (
                <img src={user?.avatarUrl || AccountImage} className="avatar" />
              )}
              {!isEditingUrlAvatar && (
                <div className="avatar-overlay">
                  <button
                    className="avatar-edit-btn"
                    onClick={() => {
                      setIsEditingAvatar(true);
                      setTimeout(() => {
                        fileInputRef.current.click();
                      }, 200);
                    }}
                    aria-label={t("account:account.avatar.edit")}
                  >
                    <Camera size={20} />
                  </button>
                </div>
              )}
              {isDragging && (
                <div className="drop-indicator">
                  {t("account:account.avatar.dropHere")}
                </div>
              )}
            </div>
            {isEditingAvatar && (
              <form className="avatar-file-form" onSubmit={handleFileSubmit}>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  style={{ display: "none" }}
                />
                <button
                  type="button"
                  className="cancel-btn cancel-avatar-btn"
                  onClick={() => setIsEditingAvatar(false)}
                >
                  {t("account:account.buttons.cancel")}
                </button>
                <button className="save-btn save-avatar-btn" type="submit">
                  {t("account:account.buttons.save")}
                </button>
              </form>
            )}
          </div>
          {!isEditingAvatar && (
            <button onClick={() => setIsEditingUrlAvatar(!isEditingUrlAvatar)}>
              {isEditingUrlAvatar
                ? t("account:account.buttons.cancel")
                : t("account:account.avatar.edit")}
            </button>
          )}
          {isEditingUrlAvatar && (
            <form className="avatar-url-form" onSubmit={handleAvatarUrlSubmit}>
              <input
                type="text"
                name="avatarUrl"
                placeholder={t("account:account.upload")}
                value={profileData.avatarUrl}
                onChange={handleProfileChange}
              />
              <button
                type="submit"
                aria-label={t("account:account.avatar.update")}
              >
                <Upload size={16} />
              </button>
            </form>
          )}
          <div className="user-info">
            <div className="name-container">
              <h2>
                {user?.firstName} {user?.lastName}
              </h2>
              <span className="username">@{user?.username}</span>
            </div>
            <div className="status-container">
              <div className="status-selector">
                <div
                  className="current-status"
                  onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                  aria-expanded={isStatusDropdownOpen}
                >
                  <span>{user?.status[user?.languagePreference]}</span>
                  <ChevronDown
                    size={16}
                    className={isStatusDropdownOpen ? "rotated" : ""}
                  />
                </div>
                {isStatusDropdownOpen && (
                  <div className="status-dropdown">
                    {statusOptions.map((status) => (
                      <div
                        key={status}
                        className={`status-option ${
                          user?.status[user?.languagePreference] === status
                            ? "selected"
                            : ""
                        }`}
                        onClick={() => handleStatusChange(status)}
                      >
                        <span
                          className={`status-indicator ${status
                            .toLowerCase()
                            .replace(/\s+/g, "-")}`}
                        ></span>
                        <span>{status}</span>
                        {user?.status[user?.languagePreference] === status && (
                          <Check size={16} className="check-icon" />
                        )}
                      </div>
                    ))}
                  </div>
                )}
                {isCustomStatus && (
                  <form
                    className="custom-status-input"
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleStatusChange(profileData.status);
                    }}
                  >
                    <input
                      type="text"
                      name="status"
                      placeholder={t(
                        "account:account.user.custom_status_placeholder"
                      )}
                      value={profileData.status}
                      onChange={handleProfileChange}
                    />
                    <button
                      type="button"
                      className="cancel-btn cancel-status-btn"
                      onClick={() => setIsCustomStatus(false)}
                    >
                      {t("account:account.buttons.cancel")}
                    </button>
                    <button className="save-btn save-status-btn" type="submit">
                      {t("account:account.buttons.save")}
                    </button>
                  </form>
                )}
              </div>
            </div>
            <div className="account-creation">
              <span>
                {t("account:account.user.membersince")}{" "}
                {formatDate(user?.createdAt)}
              </span>
            </div>
          </div>
        </div>

        {/* Account Details Section */}
        <div className="account-section details-section">
          <h3>{t("account:account.user.details")}</h3>
          {errors.profile && (
            <div className="error-message">{errors.profile}</div>
          )}
          <form>
            <div className="form-group">
              <label htmlFor="firstName">
                {t("account:account.user.firstName")}
              </label>
              <input
                id="firstName"
                type="text"
                name="firstName"
                value={profileData.firstName}
                onChange={handleProfileChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="lastName">
                {t("account:account.user.lastName")}
              </label>
              <input
                id="lastName"
                type="text"
                name="lastName"
                value={profileData.lastName}
                onChange={handleProfileChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="username">
                {t("account:account.user.username")}
              </label>
              <input
                id="username"
                type="text"
                name="username"
                value={profileData.username}
                onChange={handleProfileChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">{t("account:account.user.email")}</label>
              <input
                id="email"
                type="email"
                name="email"
                value={profileData.email}
                onChange={handleProfileChange}
              />
            </div>
            <button
              type="submit"
              className="save-btn save-profile-btn"
              onClick={saveProfile}
            >
              {t("account:account.buttons.saveProfile")}
            </button>
          </form>
          <div className="form-group">
            <label>{t("account:account.password.title")}</label>
            {!isEditingPassword ? (
              <div className="password-field">
                <input type="text" value="••••••••" disabled />
                <button
                  className="edit-btn"
                  onClick={() => setIsEditingPassword(true)}
                  aria-label="Modifier le mot de passe"
                >
                  <Edit size={16} />
                </button>
              </div>
            ) : (
              <form className="password-editor" onSubmit={savePassword}>
                {errors.password && (
                  <div className="error-message">{errors.password}</div>
                )}
                <div className="password-fields">
                  <input
                    type="password"
                    name="currentPassword"
                    placeholder={t("account:account.password.current")}
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    required
                  />
                  <input
                    type="password"
                    name="newPassword"
                    placeholder={t("account:account.password.new")}
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    required
                  />
                  <input
                    type="password"
                    name="confirmPassword"
                    placeholder={t("account:account.password.confirm")}
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    required
                  />
                </div>
                <div className="password-actions">
                  <button
                    type="button"
                    className="cancel-btn"
                    onClick={() => {
                      setIsEditingPassword(false);
                      setErrors({ ...errors, password: "" });
                    }}
                  >
                    {t("account:account.buttons.cancel")}
                  </button>
                  <button type="submit" className="save-btn">
                    {t("account:account.buttons.save")}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Stats Section */}
        <div className="account-section stats-section">
          <h3>{t("account:account.activity.title")}</h3>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">{formatNumber(user?.totalSteps)}</div>
              <div className="stat-label">
                {t("account:account.activity.steps")}
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-value">
                {user?.totalDistance?.toFixed(1)}
              </div>
              <div className="stat-label">
                {t("account:account.activity.challenges")}
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{user?.totalChallengesCompleted}</div>
              <div className="stat-label">
                {t("account:account.activity.distance")}
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{user?.streak?.max || 0}</div>
              <div className="stat-label">
                {t("account:account.activity.streak")}
              </div>
            </div>
          </div>
          <div className="daily-goal">
            <h4>{t("account:account.dailyGoal.title")}</h4>
            {!isEditingGoal ? (
              <>
                <span className="progress-text">{user?.todayProgress} %</span>
                <div className="goal-display">
                  <div className="goal-progress">
                    <div
                      className="progress-bar"
                      style={{
                        width: `${Math.min(100, user?.todayProgress)}%`,
                      }}
                    ></div>
                  </div>
                  <button
                    className="edit-btn"
                    onClick={() => setIsEditingGoal(true)}
                    aria-label={t("account:account.dailyGoal.edit")}
                  >
                    <Edit size={16} />
                  </button>
                </div>
              </>
            ) : (
              <form className="goal-editor" onSubmit={saveDailyGoal}>
                <input
                  type="number"
                  name="dailyGoal"
                  value={profileData.dailyGoal}
                  onChange={handleProfileChange}
                  min="1000"
                  max="50000"
                  step="500"
                />
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setIsEditingGoal(false)}
                >
                  {t("account:account.buttons.cancel")}
                </button>
                <button type="submit" className="save-btn">
                  {t("account:account.buttons.save")}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Preferences Section */}
        <div className="account-section preferences-section">
          <h3>{t("account:account.user.preferences")}</h3>
          <div className="preference-item">
            <div className="preference-label">
              <Globe size={20} />
              <span>{t("account:account.language.title")}</span>
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
                    "Français"}
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
          <div className="preference-item">
            <div className="preference-label">
              {user?.themePreference === "light" ? (
                <Sun size={20} />
              ) : (
                <Moon size={20} />
              )}
              <span>{t("account:account.theme.title")}</span>
            </div>
            <div className="theme-selector">
              <div
                className={`theme-option ${
                  user?.themePreference === "light" ? "selected" : ""
                }`}
                onClick={() => handleThemeChange("light")}
              >
                <Sun size={16} />
                <span>{t("account:account.theme.light")}</span>
              </div>
              <div
                className={`theme-option ${
                  user?.themePreference === "dark" ? "selected" : ""
                }`}
                onClick={() => handleThemeChange("dark")}
              >
                <Moon size={16} />
                <span>{t("account:account.theme.dark")}</span>
              </div>
              <div
                className={`theme-option ${
                  user?.themePreference === "auto" ? "selected" : ""
                }`}
                onClick={() => handleThemeChange("auto")}
              >
                <SunMoon size={20} />
                <span>{t("account:account.theme.system")}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountPage;
