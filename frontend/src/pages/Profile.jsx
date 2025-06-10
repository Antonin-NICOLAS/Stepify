import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useUser } from "../context/UserContext";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import GlobalLoader from "../utils/GlobalLoader";
import {
  Camera,
  Edit,
  Upload,
  ChevronDown,
  Check,
  Settings,
  Trophy,
  Target,
  Calendar,
  TrendingUp,
  Award,
  Zap,
} from "lucide-react";
import "./Profile.css";

const Profile = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    updateAvatar,
    updateStatus,
    updateProfile,
    updateEmail,
    updateDailyGoal,
    getUserProfile,
  } = useUser();

  // UI state
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [isEditingUrlAvatar, setIsEditingUrlAvatar] = useState(false);
  const [isEditingAvatar, setIsEditingAvatar] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [isCustomStatus, setIsCustomStatus] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
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

  const [errors, setErrors] = useState({
    profile: "",
    general: "",
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

  // Mapping des couleurs par clé de statut
  const statusColorMap = {
    available: "#28a745", // Vert
    busy: "#dc3545", // Rouge
    gym: "#ffc107", // Jaune
    dnd: "#6c757d", // Gris
    custom: "#007bff", // Bleu
    running: "#17a2b8",
  };

  // Retourne la couleur à partir de la clé du statut
  const getStatusColor = (statusKey) => {
    return statusColorMap[statusKey] || "#6c757d";
  };

  // Options
  const statusOptions = [
    { label: "available", value: t("account.status.options.available") },
    { label: "busy", value: t("account.status.options.busy") },
    { label: "gym", value: t("account.status.options.gym") },
    { label: "dnd", value: t("account.status.options.dnd") },
    { label: "custom", value: t("account.status.options.custom") },
    { label: "running", value: t("account.status.options.running") },
    { label: "base", value: t("account.status.options.default") },
  ];

  // Avatar Handlers
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    previewFile(file);
  };

  const handleFileSubmit = async (e) => {
    e.preventDefault();
    const file = fileInputRef.current.files[0];
    if (!file) return toast.error(t("account.errors.nofileselected"));

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
        error,
      );
    } finally {
      setIsLoading(false);
    }
  };

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

  // Profile Handlers
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
      setIsEditingProfile(false);
    } catch (error) {
      console.error("Erreur lors de la mise à jour du profil :", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Status Handlers
  const handleStatusChange = async (status) => {
    if (status === t("account.status.options.custom")) {
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

  // Daily Goal Handlers
  const saveDailyGoal = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await updateDailyGoal(user._id, profileData.dailyGoal, () =>
        setIsEditingGoal(false),
      );
    } catch (error) {
      console.error("erreur lors de la mise à jour de l'objectif quotidien");
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
      options,
    );
  };

  return (
    <div className="profile-container">
      {isLoading && <GlobalLoader />}

      <div className="profile-header">
        <div className="header-content">
          <h1>{t("account.title")}</h1>
          <button
            className="settings-btn"
            onClick={() => navigate("/settings")}
          >
            <Settings size={20} />
            {t("account.settings.title")}
          </button>
        </div>
      </div>

      {errors.general && <div className="error-message">{errors.general}</div>}

      <div className="profile-content">
        {/* Main Profile Section */}
        <div className="profile-main">
          <div className="profile-card">
            <div className="avatar-section">
              <div
                className={`avatar-wrapper ${isDragging ? "dragging" : ""}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                {isEditingUrlAvatar && (
                  <img
                    src={
                      profileData.avatarUrl ||
                      "https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg"
                    }
                    className="avatar"
                    alt={t("account.avatar.title")}
                  />
                )}
                {isEditingAvatar && (
                  <img
                    src={
                      Image ||
                      "https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg"
                    }
                    className="avatar"
                    alt={t("account.avatar.title")}
                  />
                )}
                {!isEditingAvatar && !isEditingUrlAvatar && (
                  <img
                    src={
                      user?.avatarUrl ||
                      "https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg"
                    }
                    className="avatar"
                    alt={t("account.avatar.title")}
                  />
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
                      aria-label={t("account.avatar.update")}
                    >
                      <Camera size={20} />
                    </button>
                  </div>
                )}
                {isDragging && (
                  <div className="drop-indicator">
                    {t("account.avatar.dropHere")}
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
                  <div className="form-actions">
                    <button
                      type="button"
                      className="cancel-btn"
                      onClick={() => setIsEditingAvatar(false)}
                    >
                      {t("common.cancel")}
                    </button>
                    <button className="save-btn" type="submit">
                      {t("account.buttons.save")}
                    </button>
                  </div>
                </form>
              )}

              {!isEditingAvatar && (
                <button
                  className="change-avatar-btn"
                  onClick={() => setIsEditingUrlAvatar(!isEditingUrlAvatar)}
                >
                  {isEditingUrlAvatar
                    ? t("common.cancel")
                    : t("account.avatar.edit")}
                </button>
              )}

              {isEditingUrlAvatar && (
                <form
                  className="avatar-url-form"
                  onSubmit={handleAvatarUrlSubmit}
                >
                  <input
                    type="text"
                    name="avatarUrl"
                    placeholder={t("account.upload")}
                    value={profileData.avatarUrl}
                    onChange={handleProfileChange}
                  />
                  <button type="submit" aria-label={t("account.avatar.update")}>
                    <Upload size={16} />
                  </button>
                </form>
              )}
            </div>

            <div className="profile-info">
              <div className="name-section">
                <h2>
                  {user?.firstName} {user?.lastName}
                </h2>
                <div className="username">@{user?.username}</div>
                <div className="member-since">
                  <Calendar size={16} />
                  {t("account.user.membersince")} {formatDate(user?.createdAt)}
                </div>
              </div>

              <div className="status-section">
                <div className="status-selector">
                  <div
                    className="current-status"
                    onClick={() =>
                      setIsStatusDropdownOpen(!isStatusDropdownOpen)
                    }
                    aria-expanded={isStatusDropdownOpen}
                  >
                    <div
                      className="status-indicator"
                      style={{
                        backgroundColor: getStatusColor(
                          user?.status[user?.languagePreference],
                        ),
                      }}
                    ></div>
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
                          key={status.label}
                          className={`status-option ${
                            user?.status[user?.languagePreference] ===
                            status.value
                              ? "selected"
                              : ""
                          }`}
                          onClick={() => handleStatusChange(status)}
                        >
                          <div
                            className="status-indicator"
                            style={{
                              backgroundColor: getStatusColor(status.label),
                            }}
                          ></div>
                          <span>{status.value}</span>
                          {user?.status[user?.languagePreference] ===
                            status.value && (
                            <Check size={16} className="check-icon" />
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {isCustomStatus && (
                    <form
                      className="custom-status-form"
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleStatusChange(profileData.status);
                      }}
                    >
                      <input
                        type="text"
                        name="status"
                        placeholder={t(
                          "account.status.custom_status_placeholder",
                        )}
                        value={profileData.status}
                        onChange={handleProfileChange}
                      />
                      <div className="form-actions">
                        <button
                          type="button"
                          className="cancel-btn"
                          onClick={() => setIsCustomStatus(false)}
                        >
                          {t("common.cancel")}
                        </button>
                        <button className="save-btn" type="submit">
                          {t("account.buttons.save")}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>

              {!isEditingProfile ? (
                <button
                  className="edit-profile-btn"
                  onClick={() => setIsEditingProfile(true)}
                >
                  <Edit size={16} />
                  {t("account.buttons.edit")}
                </button>
              ) : (
                <form className="profile-edit-form" onSubmit={saveProfile}>
                  {errors.profile && (
                    <div className="error-message">{errors.profile}</div>
                  )}
                  <div className="form-grid">
                    <div className="form-group">
                      <label htmlFor="firstName">
                        {t("account.user.firstName")}
                      </label>
                      <input
                        id="firstName"
                        type="text"
                        name="firstName"
                        placeholder={t(
                          "auth.login.form.register.enterfirstname",
                        )}
                        value={profileData.firstName}
                        onChange={handleProfileChange}
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="lastName">
                        {t("account.user.lastName")}
                      </label>
                      <input
                        id="lastName"
                        type="text"
                        name="lastName"
                        placeholder={t(
                          "auth.login.form.register.enterlastname",
                        )}
                        value={profileData.lastName}
                        onChange={handleProfileChange}
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="username">
                        {t("auth.login.form.register.username")}
                      </label>
                      <input
                        id="username"
                        type="text"
                        name="username"
                        placeholder={t(
                          "auth.login.form.register.enterusername",
                        )}
                        value={profileData.username}
                        onChange={handleProfileChange}
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="email">{t("common.email")}</label>
                      <input
                        id="email"
                        type="email"
                        name="email"
                        value={profileData.email}
                        onChange={handleProfileChange}
                      />
                    </div>
                  </div>
                  <div className="form-actions">
                    <button
                      type="button"
                      className="cancel-btn"
                      onClick={() => setIsEditingProfile(false)}
                    >
                      {t("common.cancel")}
                    </button>
                    <button type="submit" className="save-btn">
                      {t("account.buttons.saveProfile")}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="stats-section">
          <h3>
            <Trophy size={24} />
            {t("account.activity.title")}
          </h3>
          <div className="stats-grid">
            <div className="stat-card steps">
              <div className="stat-icon">
                <TrendingUp size={24} />
              </div>
              <div className="stat-content">
                <div className="stat-value">
                  {formatNumber(user?.totalSteps)}
                </div>
                <div className="stat-label">{t("account.activity.steps")}</div>
              </div>
            </div>
            <div className="stat-card distance">
              <div className="stat-icon">
                <Target size={24} />
              </div>
              <div className="stat-content">
                <div className="stat-value">
                  {user?.totalDistance?.toFixed(1)} km
                </div>
                <div className="stat-label">
                  {t("account.activity.distance")}
                </div>
              </div>
            </div>
            <div className="stat-card challenges">
              <div className="stat-icon">
                <Award size={24} />
              </div>
              <div className="stat-content">
                <div className="stat-value">
                  {user?.totalChallengesCompleted}
                </div>
                <div className="stat-label">
                  {t("account.activity.challenges")}
                </div>
              </div>
            </div>
            <div className="stat-card streak">
              <div className="stat-icon">
                <Zap size={24} />
              </div>
              <div className="stat-content">
                <div className="stat-value">{user?.streak?.max || 0}</div>
                <div className="stat-label">{t("account.activity.streak")}</div>
              </div>
            </div>
          </div>

          {/* Daily Goal Section */}
          <div className="daily-goal-card">
            <div className="goal-header">
              <h4>{t("account.dailyGoal.title")}</h4>
              {!isEditingGoal && (
                <button
                  className="edit-btn"
                  onClick={() => setIsEditingGoal(true)}
                  aria-label={t("account.dailyGoal.edit")}
                >
                  <Edit size={16} />
                </button>
              )}
            </div>

            {!isEditingGoal ? (
              <div className="goal-display">
                <div className="progress-info">
                  <span className="progress-text">
                    {user?.todayProgress || 0}%
                  </span>
                  <span className="goal-text">
                    {formatNumber(user?.dailyGoal)}{" "}
                    {t("common.activityTypes.steps")}
                  </span>
                </div>
                <div className="goal-progress">
                  <div
                    className="progress-bar"
                    style={{
                      width: `${Math.min(100, user?.todayProgress || 0)}%`,
                    }}
                  ></div>
                </div>
              </div>
            ) : (
              <form className="goal-editor" onSubmit={saveDailyGoal}>
                <div className="goal-input-group">
                  <input
                    type="number"
                    name="dailyGoal"
                    value={profileData.dailyGoal}
                    onChange={handleProfileChange}
                    min="1000"
                    max="50000"
                    step="500"
                  />
                  <span>{t("common.activityTypes.steps")}</span>
                </div>
                <div className="form-actions">
                  <button
                    type="button"
                    className="cancel-btn"
                    onClick={() => setIsEditingGoal(false)}
                  >
                    {t("common.cancel")}
                  </button>
                  <button type="submit" className="save-btn">
                    {t("account.buttons.save")}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
