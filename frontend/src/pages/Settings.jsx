import { useState, useRef, useEffect } from "react"
//Context
import { useAuth } from '../context/AuthContext';
import { useUser } from "../context/UserContext"
import { toast } from "react-hot-toast";
//icons
import { Camera, Edit, Upload, Globe, Moon, Sun, ChevronDown, Check, SunMoon } from "lucide-react"
import AccountImage from "../assets/account.png"
//CSS
import "./Settings.css"

const AccountPage = () => {
  // Contexts
  const { user } = useAuth()
  const {
    updateAvatar,
    updateStatus,
    updateProfile,
    updateEmail,
    updateDailyGoal,
    updateThemePreference,
    updateLanguagePreference,
    changePassword,
    getUserProfile
  } = useUser()

  // UI state
  const [isEditingPassword, setIsEditingPassword] = useState(false)
  const [isEditingGoal, setIsEditingGoal] = useState(false)
  const [isEditingUrlAvatar, setIsEditingUrlAvatar] = useState(false)
  const [isEditingAvatar, setIsEditingAvatar] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false)
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false)
  const [isCustomStatus, setIsCustomStatus] = useState(false)
  const [Image, setImage] = useState("")
  const fileInputRef = useRef(null)

  // Form states
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    avatarUrl: "",
    status: "",
    dailyGoal: 10000,
  })
  useEffect(() => {
    if (user) {
      getUserProfile(user._id)
    }
  }, [getUserProfile])

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
  })

  const [errors, setErrors] = useState({
    password: "",
    profile: "",
    general: ""
  })

  // Options
  const statusOptions = [
    "Salut, j'utilise Stepify !",
    "Disponible",
    "À la salle de sport",
    "En course",
    "Occupé",
    "Ne pas déranger",
    "Personnalisé"
  ]

  const languages = [
    { code: "en", name: "English" },
    { code: "fr", name: "Français" },
    { code: "es", name: "Español" },
    { code: "de", name: "Deutsch" }
  ]

  // 1. Avatar Handlers
  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    previewFile(file)
  }
  const handleFileSubmit = async (e) => {
    e.preventDefault();
    const file = fileInputRef.current.files[0];
    if (!file) return toast.error("Aucun fichier sélectionné");

    try {
      await updateAvatar(user._id, file);
      setIsEditingAvatar(false);
      setImage("");
    } catch (err) {
      console.error(err);
    }
  };
  const previewFile = (file) => {
    const reader = new FileReader();
    reader.readAsDataURL(file)
    reader.onloadend = () => {
      setImage(reader.result)
    }
  }
  const handleAvatarUrlSubmit = async (e) => {
    e.preventDefault()
    await updateAvatar(user._id, profileData.avatarUrl);
    setIsEditingUrlAvatar(false);
  }
  //handle drag & drop
  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => setIsDragging(false)

  const handleDrop = async (e) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith("image/")) {
      handleFileChange({ target: { files: [file] } })
    }
  }

  // 2. Profile Handlers (nom/prénom/email/username)
  const handleProfileChange = (e) => {
    const { name, value } = e.target
    setProfileData(prev => ({ ...prev, [name]: value }))
  }
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

    try {
      if (Object.keys(changes).length > 0) {
        await updateProfile(user._id, changes);
      }

      if (profileData.email !== user.email) {
        await updateEmail(user._id, profileData.email);
      }

    } catch (error) {
      toast.error("Erreur lors de la mise à jour du profil");
    }
  };

  // 3. Status Handlers
  const handleStatusChange = async (status) => {
    if (status === "Personnalisé") {
      setIsCustomStatus(true)
      setIsStatusDropdownOpen(false)
      return
    }
    setIsCustomStatus(false)
    setIsStatusDropdownOpen(false)
    if (status !== user.status[user?.languagePreference]) {
      setIsCustomStatus(false)
      setIsStatusDropdownOpen(false)
      await updateStatus(user._id, status);
      setIsCustomStatus(false);
      setIsStatusDropdownOpen(false);
    }
  }

  // 4. Password Handlers (inchangé)
  const handlePasswordChange = (e) => {
    const { name, value } = e.target
    setPasswordData(prev => ({ ...prev, [name]: value }))
  }
  const savePassword = async (e) => {
    e.preventDefault()
    await changePassword(user._id, passwordData, () => {
      setIsEditingPassword(false);
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
    })
  }

  // 5. Daily Goal Handlers
  const saveDailyGoal = async (e) => {
    e.preventDefault()
    await updateDailyGoal(
      user._id,
      profileData.dailyGoal,
      () => setIsEditingGoal(false)
    );
    setIsEditingGoal(false);
  }

  // 6. Theme Preference Handler
  const handleThemeChange = async (theme) => {
    if (theme === user.themePreference) return;

    try {
      await updateThemePreference(user._id, theme);
    } catch (error) {
      toast.error("Erreur lors de la mise à jour du thème");
    }
  };

  // 7. Language Preference Handler
  const handleLanguageChange = async (code) => {
    if (code === user.languagePreference) return;

    try {
      await updateLanguagePreference(user._id, code);
      setIsLanguageDropdownOpen(false);
    } catch (error) {
      toast.error("Erreur lors de la mise à jour de la langue");
    }
  };

  // Helpers
  const formatNumber = (num) => num?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") || "0"
  const formatDate = (dateString) => {
    if (!dateString) return ""
    const options = { year: 'numeric', month: 'long', day: 'numeric' }
    return new Date(dateString).toLocaleDateString(user?.languagePreference || 'fr-FR', options)
  }

  return (
    <div className="account-container">
      <div className="account-header">
        <h1>Mon Compte</h1>
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
              {isEditingUrlAvatar &&
                <img src={profileData.avatarUrl || AccountImage} className="avatar" />
              }
              {isEditingAvatar &&
                <img src={Image || AccountImage} className="avatar" />
              }
              {!isEditingAvatar && !isEditingUrlAvatar &&
                <img src={user?.avatarUrl || AccountImage} className="avatar" />
              }
              {!isEditingUrlAvatar &&
                <div className="avatar-overlay">
                  <button
                    className="avatar-edit-btn"
                    onClick={() => {
                      setIsEditingAvatar(true);
                      setTimeout(() => {
                        fileInputRef.current.click()
                      }, 200);
                    }}
                    aria-label="Changer d'avatar"
                  >
                    <Camera size={20} />
                  </button>
                </div>
              }
              {isDragging && <div className="drop-indicator">Déposer l'image ici</div>}
            </div>
            {isEditingAvatar &&
              <form className="avatar-file-form" onSubmit={handleFileSubmit}>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  style={{ display: "none" }}
                />
                <button type="button" className="cancel-btn cancel-avatar-btn" onClick={() => setIsEditingAvatar(false)}>Annuler</button>
                <button className="save-btn save-avatar-btn" type="submit">Enregistrer</button>
              </form>
            }
          </div>
          {!isEditingAvatar &&
            <button onClick={() => setIsEditingUrlAvatar(!isEditingUrlAvatar)}>{isEditingUrlAvatar ? "Annuler" : "Changer d'Avatar"}</button>
          }
          {isEditingUrlAvatar &&
            <form className="avatar-url-form" onSubmit={handleAvatarUrlSubmit}>
              <input
                type="text"
                name="avatarUrl"
                placeholder="URL de l'image"
                value={profileData.avatarUrl}
                onChange={handleProfileChange}
              />
              <button type="submit" aria-label="Mettre à jour l'avatar">
                <Upload size={16} />
              </button>
            </form>
          }
          <div className="user-info">
            <div className="name-container">
              <h2>{user?.firstName} {user?.lastName}</h2>
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
                  <ChevronDown size={16} className={isStatusDropdownOpen ? "rotated" : ""} />
                </div>
                {isStatusDropdownOpen && (
                  <div className="status-dropdown">
                    {statusOptions.map((status) => (
                      <div
                        key={status}
                        className={`status-option ${user?.status[user?.languagePreference] === status ? "selected" : ""}`}
                        onClick={() => handleStatusChange(status)}
                      >
                        <span className={`status-indicator ${status.toLowerCase().replace(/\s+/g, "-")}`}></span>
                        <span>{status}</span>
                        {user?.status[user?.languagePreference] === status && <Check size={16} className="check-icon" />}
                      </div>
                    ))}
                  </div>
                )}
                {isCustomStatus && (
                  <form
                    className="custom-status-input"
                    onSubmit={e => {
                      e.preventDefault()
                      handleStatusChange(profileData.status)
                    }}
                  >
                    <input
                      type="text"
                      name="status"
                      placeholder="Ecrivez votre statut personnalisé"
                      value={profileData.status}
                      onChange={handleProfileChange}
                    />
                    <button type="button" className="cancel-btn cancel-status-btn" onClick={() => setIsCustomStatus(false)}>Annuler</button>
                    <button className="save-btn save-status-btn" type="submit">Enregister</button>
                  </form>
                )}
              </div>
            </div>
            <div className="account-creation">
              <span>Membre depuis le {formatDate(user?.createdAt)}</span>
            </div>
          </div>
        </div>

        {/* Account Details Section */}
        <div className="account-section details-section">
          <h3>Détails du compte</h3>
          {errors.profile && <div className="error-message">{errors.profile}</div>}
          <form>
            <div className="form-group">
              <label htmlFor="firstName">Prénom</label>
              <input
                id="firstName"
                type="text"
                name="firstName"
                value={profileData.firstName}
                onChange={handleProfileChange} />
            </div>
            <div className="form-group">
              <label htmlFor="lastName">Nom</label>
              <input
                id="lastName"
                type="text"
                name="lastName"
                value={profileData.lastName}
                onChange={handleProfileChange} />
            </div>
            <div className="form-group">
              <label htmlFor="username">Nom d'utilisateur</label>
              <input
                id="username"
                type="text"
                name="username"
                value={profileData.username}
                onChange={handleProfileChange} />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                name="email"
                value={profileData.email}
                onChange={handleProfileChange} />
            </div>
            <button type="submit" className="save-btn save-profile-btn" onClick={saveProfile}>
              Enregistrer les modifications
            </button>
          </form>
          <div className="form-group">
            <label>Mot de passe</label>
            {!isEditingPassword ? (
              <div className="password-field">
                <input type="text" value="••••••••" disabled />
                <button className="edit-btn" onClick={() => setIsEditingPassword(true)} aria-label="Modifier le mot de passe">
                  <Edit size={16} />
                </button>
              </div>
            ) : (
              <form className="password-editor" onSubmit={savePassword}>
                {errors.password && <div className="error-message">{errors.password}</div>}
                <div className="password-fields">
                  <input
                    type="password"
                    name="currentPassword"
                    placeholder="Mot de passe actuel"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange} required />
                  <input
                    type="password"
                    name="newPassword"
                    placeholder="Nouveau mot de passe"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange} required />
                  <input
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirmer le nouveau mot de passe"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange} required />
                </div>
                <div className="password-actions">
                  <button type="button" className="cancel-btn" onClick={() => { setIsEditingPassword(false); setErrors({ ...errors, password: "" }) }}>Annuler</button>
                  <button type="submit" className="save-btn">Enregistrer</button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Stats Section */}
        <div className="account-section stats-section">
          <h3>Votre Activité</h3>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">{formatNumber(user?.totalSteps)}</div>
              <div className="stat-label">Pas totaux</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{user?.totalDistance?.toFixed(1)}</div>
              <div className="stat-label">Distance (km)</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{user?.totalChallengesCompleted}</div>
              <div className="stat-label">Défis complétés</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{user?.streak?.max || 0}</div>
              <div className="stat-label">Record (jours)</div>
            </div>
          </div>
          <div className="daily-goal">
            <h4>Objectif quotidien</h4>
            {!isEditingGoal ? (
              <>
                <span className="progress-text">
                  {user?.todayProgress} %
                </span>
                <div className="goal-display">
                  <div className="goal-progress">
                    <div
                      className="progress-bar"
                      style={{
                        width: `${Math.min(100, user?.todayProgress)}%`
                      }}
                    ></div>
                  </div>
                  <button className="edit-btn" onClick={() => setIsEditingGoal(true)} aria-label="Modifier l'objectif quotidien">
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
                  <button type="button" className="cancel-btn" onClick={() => setIsEditingGoal(false)}>
                    Annuler
                  </button>
                  <button type="submit" className="save-btn">
                    Enregistrer
                  </button>
              </form>
            )}
          </div>
        </div>

        {/* Preferences Section */}
        <div className="account-section preferences-section">
          <h3>Préférences</h3>
          <div className="preference-item">
            <div className="preference-label">
              <Globe size={20} />
              <span>Langue</span>
            </div>
            <div className="language-selector">
              <div
                className="selected-language"
                onClick={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)}
                aria-expanded={isLanguageDropdownOpen}
              >
                <span>{languages.find(l => l.code === user?.languagePreference)?.name || 'Français'}</span>
                <ChevronDown size={16} className={isLanguageDropdownOpen ? "rotated" : ""} />
              </div>
              {isLanguageDropdownOpen && (
                <div className="language-dropdown">
                  {languages.map((language) => (
                    <div
                      key={language.code}
                      className={`language-option ${user?.languagePreference === language.code ? "selected" : ""}`}
                      onClick={() => handleLanguageChange(language.code)}
                    >
                      {language.name}
                      {user?.languagePreference === language.code && <Check size={16} className="check-icon" />}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="preference-item">
            <div className="preference-label">
              {user?.themePreference === 'light' ? <Sun size={20} /> : <Moon size={20} />}
              <span>Thème</span>
            </div>
            <div className="theme-selector">
              <div
                className={`theme-option ${user?.themePreference === 'light' ? "selected" : ""}`}
                onClick={() => handleThemeChange('light')}
              >
                <Sun size={16} />
                <span>Clair</span>
              </div>
              <div
                className={`theme-option ${user?.themePreference === 'dark' ? "selected" : ""}`}
                onClick={() => handleThemeChange('dark')}
              >
                <Moon size={16} />
                <span>Sombre</span>
              </div>
              <div
                className={`theme-option ${user?.themePreference === 'auto' ? "selected" : ""}`}
                onClick={() => handleThemeChange('auto')}
              >
                <SunMoon size={20} />
                <span>Automatique</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AccountPage