import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { UAParser } from 'ua-parser-js'
// Context
import { useAuth } from '../../context/AuthContext'
import { useUser } from '../../context/UserContext'
import { toast } from 'react-hot-toast'
import { useTranslation, Trans } from 'react-i18next'
// Components
import Select from '../../components/Selector'
import Modal from '../../components/Modal'
import InputField from '../../components/InputField'
import PasswordStrengthMeter from '../../components/PasswordStrengthMeter'
import PrimaryBtn from '../../components/buttons/primaryBtn'
import SecondaryBtn from '../../components/buttons/secondaryBtn'
import DangerBtn from '../../components/buttons/dangerBtn'
import GlobalLoader from '../../utils/GlobalLoader'
// Icons
import {
  Globe,
  Moon,
  Sun,
  SunMoon,
  Shield,
  Bell,
  Eye,
  Lock,
  Smartphone,
  MonitorSmartphone,
  Monitor,
  User,
  Key,
  LogOut,
  Trash2,
  AlertTriangle,
  SunSnow,
} from 'lucide-react'
import './Settings.css'

const Settings = () => {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const { user, logout, deleteUser } = useAuth()
  const {
    updateThemePreference,
    updateLanguagePreference,
    updatePrivacySettings,
    updateNotificationPreferences,
    changePassword,
    getActiveSessions,
    terminateSession,
    terminateAllSessions,
  } = useUser()

  const [isLoading, setIsLoading] = useState(false)
  const [activeSessions, setActiveSessions] = useState([])
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')

  // Password change state
  const [isEditingPassword, setIsEditingPassword] = useState(false)
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [errors, setErrors] = useState({})

  // Privacy settings state
  const [privacySettings, setPrivacySettings] = useState({
    showActivityToFriends: true,
    allowFriendRequests: true,
    allowChallengeInvites: true,
    showLastLogin: false,
    showStatsPublicly: false,
  })

  // Notification preferences state
  const [notificationPreferences, setNotificationPreferences] = useState({
    activitySummary: false,
    newChallenges: false,
    friendRequests: false,
    goalAchieved: false,
    friendActivity: false,
  })

  // Options
  const languages = [
    { value: 'en', label: t('account.language.en') },
    { value: 'fr', label: t('account.language.fr') },
    { value: 'es', label: t('account.language.es') },
    { value: 'de', label: t('account.language.de') },
  ]

  useEffect(() => {
    if (user) {
      setPrivacySettings(user.privacySettings || privacySettings)
      setNotificationPreferences(
        user.notificationPreferences || notificationPreferences,
      )
    }
  }, [user])
  useEffect(() => {
    if (user) {
      loadActiveSessions()
    }
  }, [])

  const loadActiveSessions = async () => {
    setIsLoading(true)
    try {
      const sessions = await getActiveSessions(user._id)
      setActiveSessions(sessions || [])
    } catch (error) {
      console.error('Erreur lors du chargement des sessions:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const renderUserAgentInfo = (userAgent) => {
    if (!userAgent) return t('account.sessions.unknown-device')

    const parser = new UAParser(userAgent)
    const { browser, os, device } = parser.getResult()

    const browserName = browser.name || 'Navigateur inconnu'
    const browserVersion = browser.version
    const osName = os.name || 'OS inconnu'
    const osVersion = os.version || ''
    const deviceType = device.type || 'desktop'
    const deviceVendor = device.vendor || ''
    const deviceModel = device.model || ''

    return (
      <div className="session-device">
        <div className="icon" style={{ minWidth: '16px' }}>
          {' '}
          {deviceType === 'mobile' ? (
            <Smartphone size={16} />
          ) : (
            <Monitor size={16} />
          )}
        </div>
        <div className="device-info">
          <p>
            {t('account.sessions.device')} {deviceVendor} {deviceModel}
          </p>
          <p>
            {t('account.sessions.version')} {osName} {osVersion}
          </p>
          <p>
            {t('account.sessions.browser')} {browserName} {browserVersion}
          </p>
        </div>
      </div>
    )
  }

  // Password strength calculator

  const handlePasswordChange = (e) => {
    const { name, value } = e.target
    setPasswordData((prev) => ({ ...prev, [name]: value }))
  }

  const savePassword = async (e) => {
    e.preventDefault()

    if (!passwordData.currentPassword)
      return toast.error('Mot de passe actuel requis')

    if (passwordData.newPassword.length < 8)
      return toast.error(t('auth.resetpassword.form.passwordhint'))

    if (passwordStrength < 80) {
      setErrors({ password: t('account.password.weak') })
      return
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setErrors({ password: t('auth.login.form.error.passwordmismatch') })
      return
    }

    setIsLoading(true)
    try {
      await changePassword(user._id, passwordData, () => {
        setIsEditingPassword(false)
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        })
        setPasswordStrength(0)
        setErrors({})
      })
    } catch (error) {
      setErrors({ password: error.message })
    } finally {
      setIsLoading(false)
    }
  }

  const handleThemeChange = async (theme) => {
    if (theme === user.themePreference) return
    setIsLoading(true)
    try {
      await updateThemePreference(user._id, theme)
    } catch (error) {
      console.error('Erreur lors de la mise à jour du thème')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLanguageChange = async (language) => {
    if (language === user.languagePreference) return
    await i18n.changeLanguage(language)
    setIsLoading(true)
    try {
      await updateLanguagePreference(user._id, language)
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la langue', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePrivacyChange = async (setting, value) => {
    const newSettings = { ...privacySettings, [setting]: value }
    setPrivacySettings(newSettings)

    try {
      await updatePrivacySettings(user._id, newSettings)
    } catch (error) {
      console.error(
        'Erreur lors de la mise à jour des paramètres de confidentialité',
        error,
      )
      setPrivacySettings(privacySettings) // Revert on error
    }
  }

  const handleNotificationChange = async (setting, value) => {
    const newPreferences = { ...notificationPreferences, [setting]: value }
    setNotificationPreferences(newPreferences)

    setIsLoading(true)
    try {
      await updateNotificationPreferences(user._id, newPreferences)
    } catch (error) {
      console.error(
        'Erreur lors de la mise à jour des préférences de notification :',
        error,
      )
      setNotificationPreferences(notificationPreferences) // Revert on error
    } finally {
      setIsLoading(false)
    }
  }

  const handleTerminateSession = async (sessionId) => {
    try {
      await terminateSession(user?._id, sessionId)
      await loadActiveSessions()
    } catch (error) {
      console.error('Erreur lors de la terminaison de la session :', error)
    }
  }

  const handleTerminateAllSessions = async () => {
    try {
      await terminateAllSessions(user?._id)
      logout(() => {
        navigate('/login')
      })
    } catch (error) {
      console.error('Erreur lors de la terminaison des sessions :', error)
    }
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'SUPPRIMER') {
      toast.error(t('account.security.write-delete'))
      return
    }

    setIsLoading(true)
    try {
      await deleteUser(user._id)
      setShowDeleteConfirm(false)
      setDeleteConfirmText('')
      logout(() => {
        navigate('/login')
      })
    } catch (error) {
      console.error('Erreur lors de la suppression du compte :', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="settings-container">
      {isLoading && <GlobalLoader />}

      <div className="settings-header">
        <div className="header-content">
          <h1>{t('account.settings.title')}</h1>
          <PrimaryBtn onClick={() => navigate('/profile')}>
            <User size={20} />
            {t('account.settings.redirect')}
          </PrimaryBtn>
        </div>
      </div>

      <div className="settings-content">
        {/* Security Section */}
        <div className="settings-section">
          <h3>
            <Shield size={20} />
            {t('auth.resetpassword.visual.step2')}
          </h3>

          {/* Password Change */}
          <div className={`setting-item ${isEditingPassword ? 'editing' : ''}`}>
            <div className="setting-info">
              <Lock size={20} />
              <div>
                <h4>{t('common.password')}</h4>
                <p>{t('account.password.modify')}</p>
              </div>
            </div>
            {!isEditingPassword ? (
              <PrimaryBtn onClick={() => setIsEditingPassword(true)}>
                {t('account.buttons.edit')}
              </PrimaryBtn>
            ) : (
              <div className="password-editor">
                {errors.password && (
                  <div className="error-message">{errors.password}</div>
                )}
                <form onSubmit={savePassword}>
                  <div className="password-fields">
                    <InputField
                      type="password"
                      id="currentPassword"
                      name="currentPassword"
                      className="without-margin"
                      autoComplete="current-password"
                      label={t('account.password.current')}
                      placeholder={t('auth.login.form.login.enterpassword')}
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      icon={Lock}
                      required={true}
                      style={{ backgroundColor: 'transparent' }}
                    />
                    <InputField
                      type="password"
                      id="newPassword"
                      name="newPassword"
                      className="without-margin"
                      autoComplete="new-password"
                      placeholder={t('auth.resetpassword.form.enterpassword')}
                      label={t('account.password.new')}
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      icon={Lock}
                      required={true}
                      style={{ backgroundColor: 'transparent' }}
                    />
                    <PasswordStrengthMeter
                      password={passwordData.newPassword}
                      onStrengthChange={setPasswordStrength}
                      showScore={true}
                      showRequirements={true}
                      style={{ marginTop: '0px', marginBottom: '0px' }}
                    />
                    <InputField
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      className="without-margin"
                      autoComplete="new-password"
                      placeholder={t('account.password.confirm')}
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      required={true}
                      style={{ backgroundColor: 'transparent' }}
                    />
                  </div>
                  <div className="form-actions">
                    <DangerBtn
                      type="button"
                      onClick={() => {
                        setIsEditingPassword(false)
                        setPasswordData({
                          currentPassword: '',
                          newPassword: '',
                          confirmPassword: '',
                        })
                        setPasswordStrength(0)
                        setErrors({})
                      }}
                    >
                      {t('common.cancel')}
                    </DangerBtn>
                    <PrimaryBtn type="submit">
                      {t('account.buttons.save')}
                    </PrimaryBtn>
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
                <h4>{t('account.security.2fa')}</h4>
                <p>
                  {user?.twoFactorAuth?.appEnabled ||
                  user?.twoFactorAuth?.webauthnEnabled ||
                  user?.twoFactorAuth?.emailEnabled
                    ? t('account.security.2fa-enabled-description')
                    : t('account.security.2fa-disabled-description')}
                </p>
              </div>
            </div>
            <PrimaryBtn onClick={() => navigate('/settings/2fa')}>
              {user?.twoFactorAuth?.appEnabled ||
              user?.twoFactorAuth?.webauthnEnabled ||
              user?.twoFactorAuth?.emailEnabled
                ? t('common.manage')
                : t('account.security.2fa_enable')}
            </PrimaryBtn>
          </div>

          {/* Active Sessions */}
          <div className="setting-item sessions-item">
            <div
              className="setting-item"
              style={{ borderBottom: 'none', paddingBottom: '0' }}
            >
              <div className="setting-info">
                <MonitorSmartphone size={20} />
                <div>
                  <h4>{t('account.sessions.title')}</h4>
                  <p>{t('account.sessions.description')}</p>
                </div>
              </div>
              {activeSessions.length > 1 && (
                <DangerBtn onClick={handleTerminateAllSessions}>
                  {t('account.sessions.terminate-all')}
                </DangerBtn>
              )}
            </div>
            <div className="sessions-list">
              {activeSessions.map((session, index) => (
                <div key={session.id || index} className="session-item">
                  <div className="session-info">
                    {renderUserAgentInfo(session.userAgent)}
                    <div className="session-details">
                      <span>IP: {session.ipAddress}</span>
                      <span>
                        {t('account.sessions.loggedin')}{' '}
                        {new Date(session.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <DangerBtn onClick={() => handleTerminateSession(session.id)}>
                    <LogOut size={16} />
                  </DangerBtn>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Privacy Section */}
        <div className="settings-section">
          <h3>
            <Eye size={20} />
            {t('auth.login.footer.privacy')}
          </h3>

          <div className="setting-item">
            <div className="setting-info">
              <div>
                <h4>{t('account.privacy.friend-setting-title')}</h4>
                <p>{t('account.privacy.friend-setting-subtitle')}</p>
              </div>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={privacySettings.showActivityToFriends}
                onChange={(e) =>
                  handlePrivacyChange('showActivityToFriends', e.target.checked)
                }
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <div>
                <h4>{t('account.privacy.friend-request-setting-title')}</h4>
                <p>{t('account.privacy.friend-request-setting-subtitle')}</p>
              </div>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={privacySettings.allowFriendRequests}
                onChange={(e) =>
                  handlePrivacyChange('allowFriendRequests', e.target.checked)
                }
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <div>
                <h4>{t('account.privacy.challenge-setting-title')}</h4>
                <p>{t('account.privacy.challenge-setting-subtitle')}</p>
              </div>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={privacySettings.allowChallengeInvites}
                onChange={(e) =>
                  handlePrivacyChange('allowChallengeInvites', e.target.checked)
                }
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <div>
                <h4>{t('account.privacy.last-login-setting-title')}</h4>
                <p>{t('account.privacy.last-login-setting-subtitle')}</p>
              </div>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={privacySettings.showLastLogin}
                onChange={(e) =>
                  handlePrivacyChange('showLastLogin', e.target.checked)
                }
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <div>
                <h4>{t('account.privacy.public-stats-setting-title')}</h4>
                <p>{t('account.privacy.public-stats-setting-subtitle')}</p>
              </div>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={privacySettings.showStatsPublicly}
                onChange={(e) =>
                  handlePrivacyChange('showStatsPublicly', e.target.checked)
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
            {t('account.notif.title')}
          </h3>

          <div className="setting-item">
            <div className="setting-info">
              <div>
                <h4>{t('account.notif.activity-title')}</h4>
                <p>{t('account.notif.activity-description')}</p>
              </div>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={notificationPreferences.activitySummary}
                onChange={(e) =>
                  handleNotificationChange('activitySummary', e.target.checked)
                }
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <div>
                <h4>{t('account.notif.new-challenge-title')}</h4>
                <p>{t('account.notif.new-challenge-description')}</p>
              </div>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={notificationPreferences.newChallenges}
                onChange={(e) =>
                  handleNotificationChange('newChallenges', e.target.checked)
                }
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <div>
                <h4>{t('account.privacy.friend-request-setting-title')}</h4>
                <p>{t('account.notif.friend-request-description')}</p>
              </div>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={notificationPreferences.friendRequests}
                onChange={(e) =>
                  handleNotificationChange('friendRequests', e.target.checked)
                }
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <div>
                <h4>{t('account.notif.goal-reached-title')}</h4>
                <p>{t('account.notif.goal-reached-description')}</p>
              </div>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={notificationPreferences.goalAchieved}
                onChange={(e) =>
                  handleNotificationChange('goalAchieved', e.target.checked)
                }
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <div>
                <h4>{t('account.notif.friend-activity-title')}</h4>
                <p>{t('account.notif.friend-activity-description')}</p>
              </div>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={notificationPreferences.friendActivity}
                onChange={(e) =>
                  handleNotificationChange('friendActivity', e.target.checked)
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
            {t('account.user.preferences')}
          </h3>

          <div className="setting-item">
            <div className="setting-info">
              <Globe size={20} />
              <div>
                <h4>{t('account.language.title')}</h4>
                <p>{t('account.language.description')}</p>
              </div>
            </div>
            <Select
              options={languages}
              selected={user?.languagePreference || i18n.language || 'fr'}
              onChange={handleLanguageChange}
              placeholder={t('account.language.select')}
            />
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <SunSnow size={20} />
              <div>
                <h4>{t('account.theme.title')}</h4>
                <p>{t('account.theme.description')}</p>
              </div>
            </div>
            <div className="theme-selector">
              <div
                className={`theme-option ${
                  user?.themePreference === 'light' ? 'selected' : ''
                }`}
                onClick={() => handleThemeChange('light')}
              >
                <Sun size={16} />
                <span>{t('account.theme.light')}</span>
              </div>
              <div
                className={`theme-option ${
                  user?.themePreference === 'dark' ? 'selected' : ''
                }`}
                onClick={() => handleThemeChange('dark')}
              >
                <Moon size={16} />
                <span>{t('account.theme.dark')}</span>
              </div>
              <div
                className={`theme-option ${
                  user?.themePreference === 'auto' ? 'selected' : ''
                }`}
                onClick={() => handleThemeChange('auto')}
              >
                <SunMoon size={20} />
                <span>{t('account.theme.system')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="settings-section danger-zone">
          <h3>
            <AlertTriangle size={20} />
            {t('account.delete.title')}
          </h3>

          <div className="setting-item">
            <div className="setting-info">
              <Trash2 size={20} />
              <div>
                <h4>{t('account.delete.subtitle')}</h4>
                <p>{t('account.delete.description')}</p>
              </div>
            </div>
            <DangerBtn onClick={() => setShowDeleteConfirm(true)}>
              {t('common.delete')}
            </DangerBtn>
          </div>
        </div>
      </div>
      <Modal
        isOpen={showDeleteConfirm}
        Close={() => {
          setShowDeleteConfirm(false)
          setDeleteConfirmText('')
        }}
        title={t('account.delete.confirm')}
      >
        <p>{t('account.delete.confirm-description')}</p>
        <p>
          <Trans i18nKey="account.security.delete_confirmation">
            Tapez <strong>SUPPRIMER</strong> pour confirmer :
          </Trans>
        </p>
        <input
          type="text"
          value={deleteConfirmText}
          onChange={(e) => setDeleteConfirmText(e.target.value)}
          placeholder={t('account.delete.confirm-placeholder')}
        />
        <div className="modal-actions">
          <SecondaryBtn
            type="button"
            title={t('common.cancel')}
            ariaLabel={t('common.cancel')}
            onClick={() => {
              setShowDeleteConfirm(false)
              setDeleteConfirmText('')
            }}
          >
            {t('common.cancel')}
          </SecondaryBtn>
          <DangerBtn
            onClick={handleDeleteAccount}
            title={t('account.delete.confirm-button')}
            ariaLabel={t('account.delete.confirm-button')}
            disabled={
              deleteConfirmText !== t('account.delete.confirm-placeholder')
            }
          >
            {t('account.delete.confirm-button')}
          </DangerBtn>
        </div>
      </Modal>
    </div>
  )
}

export default Settings
