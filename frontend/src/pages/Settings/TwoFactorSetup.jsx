import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { use2FA } from '../../context/2FA'
import { useTranslation } from 'react-i18next'
import {
  Shield,
  ShieldCheck,
  ShieldX,
  Binary,
  Copy,
  Download,
  Key,
  Smartphone,
  CheckCircle2,
  AlertTriangle,
  Mail,
  ArrowLeft,
  Fingerprint,
  Star,
  ChevronDown,
  ChevronUp,
  Lock,
  QrCode,
  Layers,
  Heart,
} from 'lucide-react'
import './TwoFactorSetup.css'

function TwoFactorSettings() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const {
    TwoFactorStatus,
    enableTwoFactor,
    enableEmail2FA,
    verifyTwoFactor,
    verifyEmail2FA,
    registerWebAuthnCredential,
    disableTwoFactor,
    disableEmail2FA,
    removeWebAuthnCredential,
    setPreferredMethod,
  } = use2FA()

  const [isLoading, setIsLoading] = useState(false)
  const [twoFactorStatus, setTwoFactorStatus] = useState({
    app: false,
    email: false,
    webauthn: false,
    preferredMethod: null,
  })
  const [qrCodeUrl, setQrCodeUrl] = useState('')
  const [secretKey, setSecretKey] = useState('')
  const [backupCodes, setBackupCodes] = useState([])
  const [showBackupCodes, setShowBackupCodes] = useState(false)
  const [verificationCode, setVerificationCode] = useState('')
  const [password, setPassword] = useState('')
  const [step, setStep] = useState('main')
  const [currentMethod, setCurrentMethod] = useState('')
  const [webauthnCredentials, setWebauthnCredentials] = useState([])
  const [webauthnError, setWebauthnError] = useState(null)
  const [deviceName, setDeviceName] = useState('')
  const [showWebauthnDevices, setShowWebauthnDevices] = useState(false)

  useEffect(() => {
    const checkTwoFactorStatus = async () => {
      try {
        const status = await TwoFactorStatus()
        setTwoFactorStatus({
          app: status.appEnabled || false,
          email: status.emailEnabled || false,
          webauthn: status.webauthnEnabled || false,
          preferredMethod: status.preferredMethod || null,
        })
        if (status) {
          setBackupCodes(status.backupCodes || [])
          setWebauthnCredentials(status.webauthnCredentials || [])
        }
      } catch (error) {
        console.error('Erreur lors de la vérification du statut 2FA:', error)
        navigate('/settings')
      }
    }

    checkTwoFactorStatus()
  }, [])

  const getDeviceInfo = () => {
    const userAgent = navigator.userAgent
    let deviceName = 'Mon appareil'

    if (userAgent.includes('Chrome')) deviceName = 'Chrome'
    else if (userAgent.includes('Firefox')) deviceName = 'Firefox'
    else if (userAgent.includes('Safari')) deviceName = 'Safari'
    else if (userAgent.includes('Edge')) deviceName = 'Edge'

    if (userAgent.includes('Windows')) deviceName += ' sur Windows'
    else if (userAgent.includes('Mac')) deviceName += ' sur Mac'
    else if (userAgent.includes('Linux')) deviceName += ' sur Linux'
    else if (userAgent.includes('Android')) deviceName += ' sur Android'
    else if (userAgent.includes('iOS')) deviceName += ' sur iOS'

    return deviceName
  }

  const handleEnable2FA = async (method) => {
    setIsLoading(true)
    setCurrentMethod(method)
    setWebauthnError(null)

    try {
      if (method === 'app') {
        const response = await enableTwoFactor()
        setQrCodeUrl(response.qrCode)
        setSecretKey(response.secret)
        setStep('setup-app')
      } else if (method === 'email') {
        await enableEmail2FA()
        setStep('verify-email')
      } else if (method === 'webauthn') {
        setDeviceName(getDeviceInfo())
        setStep('setup-webauthn')
      }
    } catch (error) {
      console.error("Erreur lors de l'activation de la 2FA :", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerify2FA = async (e) => {
    if (verificationCode.length !== 6) return

    e.preventDefault()
    setIsLoading(true)

    try {
      let res
      if (currentMethod === 'app') {
        res = await verifyTwoFactor(verificationCode)
      } else if (currentMethod === 'email') {
        res = await verifyEmail2FA(verificationCode)
      }
      console.log('Verification result:', res)
      if (res.backupCodes) {
        setBackupCodes(res.backupCodes)
      }
      if (res.preferredMethod) {
        setTwoFactorStatus((prev) => ({
          ...prev,
          preferredMethod: res.preferredMethod,
        }))
      }
      setTwoFactorStatus((prev) => ({
        ...prev,
        [currentMethod]: true,
      }))
      setVerificationCode('')
      setStep('backup')
    } catch (error) {
      console.error('Code de vérification incorrect :', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDisable2FA = async (method) => {
    setCurrentMethod(method)
    if (method === 'app') {
      setStep('disable-app')
    } else if (method === 'email') {
      setStep('disable-email')
    } else if (method === 'webauthn') {
      setStep('disable-webauthn')
    }
  }

  const handleVerifyDisable2FA = async () => {
    setIsLoading(true)
    try {
      if (currentMethod === 'app') {
        await disableTwoFactor(verificationCode)
      } else if (currentMethod === 'email') {
        await disableEmail2FA(password)
      } else if (currentMethod === 'webauthn') {
        await removeWebAuthnCredential(webauthnCredentials[0].id)
      }

      const updatedStatus = await TwoFactorStatus()
      setTwoFactorStatus({
        app: updatedStatus.appEnabled || false,
        email: updatedStatus.emailEnabled || false,
        webauthn: updatedStatus.webauthnEnabled || false,
        preferredMethod: updatedStatus.preferredMethod || null,
      })

      if (currentMethod === 'app') {
        setSecretKey(null)
        setQrCodeUrl('')
        setBackupCodes([])
      }
      if (
        !updatedStatus.appEnabled &&
        !updatedStatus.emailEnabled &&
        !updatedStatus.webauthnEnabled
      ) {
        setBackupCodes([])
      }
      setStep('main')
      setVerificationCode('')
      setPassword('')
    } catch (error) {
      console.error('Erreur lors de la désactivation :', error)
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = (secret) => {
    navigator.clipboard.writeText(secret)
    toast.success(t('account.2fa-setup.setup-webauthn.copy-key'))
  }

  const downloadBackupCodes = () => {
    const content = `${t('account.2fa-setup.backup.file.start')}
      \n\n${backupCodes.map((item) => item.code).join('\n')}\n\n
      ${t('account.2fa-setup.backup.file.end')}`

    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'Stepify-recovery.txt'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleSetPreferredMethod = async (method) => {
    setIsLoading(true)
    try {
      await setPreferredMethod(method)
      setTwoFactorStatus((prev) => ({
        ...prev,
        preferredMethod: method,
      }))
    } catch (error) {
      console.error('Error setting preferred method:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getVisualContent = () => {
    const activeMethods = [
      twoFactorStatus.app && 'app',
      twoFactorStatus.email && 'email',
      twoFactorStatus.webauthn && 'webauthn',
    ].filter(Boolean).length

    switch (step) {
      case 'setup-app':
        return {
          title: t('account.2fa-setup.setup-app.title'),
          description: t('account.2fa-setup.setup-app.description'),
          steps: [
            {
              icon: <Smartphone />,
              title: t('account.2fa-setup.setup-app.visual.step1'),
              description: t(
                'account.2fa-setup.setup-app.visual.step1description',
              ),
            },
            {
              icon: <QrCode />,
              title: t('account.2fa-setup.setup-app.visual.step2'),
              description: t(
                'account.2fa-setup.setup-app.visual.step2description',
              ),
            },
          ],
        }

      case 'setup-webauthn':
        return {
          title: t('account.2fa-setup.setup-webauthn.visual.title'),
          description: t('account.2fa-setup.setup-webauthn.visual.description'),
          steps: [
            {
              icon: <Fingerprint />,
              title: t('account.2fa-setup.setup-webauthn.visual.step1'),
              description: t(
                'account.2fa-setup.setup-webauthn.visual.step1description',
              ),
            },
            {
              icon: <Shield />,
              title: t('account.2fa-setup.setup-webauthn.visual.step2'),
              description: t(
                'account.2fa-setup.setup-webauthn.visual.step2description',
              ),
            },
          ],
        }

      case 'verify-app':
      case 'verify-email':
        return {
          title: t('account.2fa-setup.verify.visual.title'),
          description: t('account.2fa-setup.verify.visual.description'),
          steps: [
            {
              icon: currentMethod === 'app' ? <Smartphone /> : <Mail />,
              title:
                currentMethod === 'app'
                  ? t('account.2fa-setup.verify.visual.app-step1')
                  : t('account.2fa-setup.verify.visual.email-step1'),
              description:
                currentMethod === 'app'
                  ? t('account.2fa-setup.verify.visual.app-step1description')
                  : t('account.2fa-setup.verify.visual.email-step1description'),
            },
            {
              icon: <CheckCircle2 />,
              title: t('account.2fa-setup.verify.visual.step2'),
              description: t(
                'account.2fa-setup.verify.visual.step2description',
              ),
            },
          ],
        }
      case 'disable-email':
        return {
          title: t('account.2fa-setup.disable-email.visual.title'),
          description: t('account.2fa-setup.disable-email.visual.description'),
          steps: [
            {
              icon: <Key />,
              title: t('account.2fa-setup.disable-email.visual.step1'),
              description: t(
                'account.2fa-setup.disable-email.visual.step1description',
              ),
            },
            {
              icon: <ShieldX />,
              title: t('account.2fa-setup.disable-email.visual.step2'),
              description: t(
                'account.2fa-setup.disable-email.visual.step2description',
              ),
            },
          ],
        }

      case 'disable-app':
        return {
          title: t('account.2fa-setup.disable-app.visual.title'),
          description: t('account.2fa-setup.disable-app.visual.description'),
          steps: [
            {
              icon: <Key />,
              title: t('account.2fa-setup.disable-app.visual.step1'),
              description: t(
                'account.2fa-setup.disable-app.visual.step1description',
              ),
            },
            {
              icon: <ShieldX />,
              title: t('account.2fa-setup.disable-app.visual.step2'),
              description: t(
                'account.2fa-setup.disable-app.visual.step2description',
              ),
            },
            {
              icon: <Binary />,
              title: t('account.2fa-setup.disable-app.visual.step3'),
              description: t(
                'account.2fa-setup.disable-app.visual.step3description',
              ),
            },
          ],
        }

      case 'disable-webauthn':
        return {
          title: t('account.2fa-setup.disable-webauthn.visual.title'),
          description: t(
            'account.2fa-setup.disable-webauthn.visual.description',
          ),
          steps: [
            {
              icon: <Key />,
              title: t('account.2fa-setup.disable-webauthn.visual.step1'),
              description: t(
                'account.2fa-setup.disable-webauthn.visual.step1description',
              ),
            },
            {
              icon: <ShieldX />,
              title: t('account.2fa-setup.disable-webauthn.visual.step2'),
              description: t(
                'account.2fa-setup.disable-webauthn.visual.step2description',
              ),
            },
            {
              icon: <Binary />,
              title: t('account.2fa-setup.disable-webauthn.visual.step3'),
              description: t(
                'account.2fa-setup.disable-webauthn.visual.step3description',
              ),
            },
          ],
        }

      case 'backup':
        return {
          title: t('account.2fa-setup.backup.visual.title'),
          description: t('account.2fa-setup.backup.visual.description'),
          steps: [
            {
              icon: <Download />,
              title: t('account.2fa-setup.backup.visual.step1'),
              description: t(
                'account.2fa-setup.backup.visual.step1description',
              ),
            },
            {
              icon: <Lock />,
              title: t('account.2fa-setup.backup.visual.step2'),
              description: t(
                'account.2fa-setup.backup.visual.step2description',
              ),
            },
          ],
        }

      default:
        return {
          title: t('account.2fa-setup.main.title'),
          description: t('account.2fa-setup.main.description'),
          steps: [
            {
              icon: <Shield />,
              title: `${activeMethods}/3 ${
                activeMethods > 1
                  ? t('account.2fa-setup.main.visual.methods-active')
                  : t('account.2fa-setup.main.visual.method-active')
              }`,
              description: t(
                'account.2fa-setup.main.visual.methods-description',
              ),
            },
            {
              icon: <Layers />,
              title: t('account.2fa-setup.main.visual.multiple-options'),
              description: t(
                'account.2fa-setup.main.visual.options-description',
              ),
            },
            {
              icon: <Heart />,
              title: t('account.2fa-setup.main.visual.preferred-method'),
              description: t(
                'account.2fa-setup.main.visual.preferred-method-description',
              ),
            },
          ],
        }
    }
  }

  const renderMethodCard = (method, icon, title, description, enabled) => {
    const isPreferred = twoFactorStatus.preferredMethod === method
    const activeMethods = [
      twoFactorStatus.app && 'app',
      twoFactorStatus.email && 'email',
      twoFactorStatus.webauthn && 'webauthn',
    ].filter(Boolean)

    return (
      <div className={`method-card ${enabled ? 'enabled' : ''}`}>
        <div className="method-header">
          <div className="method-icon">{icon}</div>
          <div className="method-info">
            <h4>{title}</h4>
            {activeMethods.length > 1 &&
              (isPreferred ? (
                <span className="preferred-badge">
                  <Star size={14} fill="currentColor" />
                  {t('account.2fa-setup.preferred')}
                </span>
              ) : (
                activeMethods.includes(method) && (
                  <button
                    className="set-preferred-btn"
                    onClick={() => handleSetPreferredMethod(method)}
                  >
                    {t('account.2fa-setup.set-preferred')}
                  </button>
                )
              ))}
            <p>{description}</p>
          </div>
        </div>

        <div className="method-status">
          {enabled ? (
            <>
              <ShieldCheck size={16} className="status-icon enabled" />
              <span>{t('account.2fa-setup.card.active')}</span>
            </>
          ) : (
            <>
              <ShieldX size={16} className="status-icon disabled" />
              <span>{t('account.2fa-setup.card.desactive')}</span>
            </>
          )}
        </div>

        <div className="method-actions">
          {!enabled ? (
            <button
              className="auth-button auth-button-primary"
              onClick={() => handleEnable2FA(method)}
              disabled={isLoading}
            >
              {t('account.security.2fa_enable')}
            </button>
          ) : (
            <button
              className="auth-button danger-btn"
              onClick={() => handleDisable2FA(method)}
            >
              {t('account.security.2fa_disable')}
            </button>
          )}
        </div>
      </div>
    )
  }

  const renderBackupCodes = () => (
    <div className="backup-codes">
      <div
        className="backup-codes-header"
        onClick={() => setShowBackupCodes(!showBackupCodes)}
      >
        <h4>
          {showBackupCodes
            ? t('account.2fa-setup.card.hide-backupcodes')
            : t('account.2fa-setup.card.show-backupcodes')}
        </h4>
        {showBackupCodes ? <ChevronUp /> : <ChevronDown />}
      </div>
      {showBackupCodes && (
        <div className="backup-codes-display">
          <div className="auth-alert auth-alert-warning">
            <AlertTriangle size={20} />
            <div>
              <h4>{t('account.2fa-setup.backup.title')}</h4>
              <p>{t('account.2fa-setup.backup.keep')}</p>
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
            className="auth-button auth-button-secondary"
          >
            <Download size={16} />
            {t('common.download')}
          </button>
        </div>
      )}
    </div>
  )

  const renderWebauthnDevices = () => (
    <div className="webauthn-devices">
      <div
        className="devices-header"
        onClick={() => setShowWebauthnDevices(!showWebauthnDevices)}
      >
        <h4>{t('account.2fa-setup.webauthn.devices')}</h4>
        {showWebauthnDevices ? <ChevronUp /> : <ChevronDown />}
      </div>

      {showWebauthnDevices && (
        <div className="devices-list">
          {webauthnCredentials.length > 0 ? (
            webauthnCredentials.map((cred) => (
              <div key={cred.id} className="device-item">
                <div className="device-info">
                  <Fingerprint size={18} />
                  <span>
                    {cred.deviceName ||
                      t('account.2fa-setup.webauthn.unknown-device')}
                  </span>
                  {cred.lastUsed && (
                    <span className="last-used">
                      {new Date(cred.lastUsed).toLocaleDateString()}
                    </span>
                  )}
                </div>
                <button
                  className="auth-button danger-btn-small"
                  onClick={async () => {
                    try {
                      await removeWebAuthnCredential(cred.id)
                      const status = await TwoFactorStatus()
                      setWebauthnCredentials(status.webauthnCredentials || [])
                      setTwoFactorStatus((prev) => ({
                        ...prev,
                        webauthn: status.webauthnEnabled,
                        preferredMethod: status.preferredMethod,
                      }))
                    } catch (error) {
                      console.error(
                        'Erreur lors de la suppression du périphérique WebAuthn :',
                        error,
                      )
                    }
                  }}
                >
                  {t('common.delete')}
                </button>
              </div>
            ))
          ) : (
            <p className="no-devices">
              {t('account.2fa-setup.webauthn.no-devices')}
            </p>
          )}
        </div>
      )}
    </div>
  )

  const renderMainContent = () => (
    <div className="auth-form-content">
      <div className="methods-grid">
        {renderMethodCard(
          'app',
          <Smartphone size={24} />,
          t('account.2fa-setup.card.apptitle'),
          t('account.2fa-setup.card.appdescription'),
          twoFactorStatus.app,
        )}

        {renderMethodCard(
          'email',
          <Mail size={24} />,
          t('common.email'),
          t('account.2fa-setup.card.emaildescription'),
          twoFactorStatus.email,
        )}

        {renderMethodCard(
          'webauthn',
          <Fingerprint size={24} />,
          t('account.2fa-setup.card.webauthntitle'),
          t('account.2fa-setup.card.webauthndescription'),
          twoFactorStatus.webauthn,
        )}
      </div>

      {(twoFactorStatus.email ||
        twoFactorStatus.app ||
        twoFactorStatus.webauthn) && (
        <div className="additional-sections">
          {backupCodes.length > 0 && renderBackupCodes()}

          {twoFactorStatus.webauthn && renderWebauthnDevices()}
        </div>
      )}
    </div>
  )

  const renderSetupApp = () => (
    <div className="auth-form-content">
      <div className="setup-section">
        <div className="qr-section">
          <div className="qr-code-container">
            <img
              src={qrCodeUrl}
              alt={t('account.2fa-setup.setup-app.qr-code-alt')}
              className="qr-code"
            />
          </div>

          <div className="manual-key-section">
            <h4>{t('account.2fa-setup.setup-app.manual-key')}</h4>
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
            className="auth-button auth-button-primary"
            onClick={() => setStep('verify-app')}
          >
            <Smartphone size={16} />
            {t('account.2fa-setup.setup-app.app-configured')}
          </button>
          <button
            className="auth-button auth-button-secondary"
            onClick={() => setStep('main')}
          >
            {t('common.cancel')}
          </button>
        </div>
      </div>
    </div>
  )

  const renderSetupWebauthn = () => (
    <div className="auth-form-content">
      <div className="auth-input-group">
        <label htmlFor="deviceName">
          {t('account.2fa-setup.webauthn.device-name')}
        </label>
        <div className="auth-input-wrapper">
          <div className="auth-input-icon">
            <Fingerprint size={18} />
          </div>
          <input
            type="text"
            id="deviceName"
            value={deviceName}
            onChange={(e) => setDeviceName(e.target.value)}
            placeholder={t(
              'account.2fa-setup.webauthn.device-name-placeholder',
            )}
            aria-label={t('account.2fa-setup.webauthn.device-name')}
          />
        </div>
      </div>

      {webauthnError && (
        <div className="auth-alert auth-alert-error">
          <AlertTriangle size={16} />
          {webauthnError}
        </div>
      )}

      <div className="webauthn-actions">
        <button
          className="auth-button auth-button-primary"
          onClick={async () => {
            try {
              const newcredential = await registerWebAuthnCredential(deviceName)
              if (newcredential) {
                setTwoFactorStatus((prev) => ({
                  ...prev,
                  webauthn: true,
                  preferredMethod: newcredential.preferredMethod,
                }))
                console.log(twoFactorStatus, newcredential)
                setWebauthnCredentials(newcredential.webauthnCredentials || [])
                if (newcredential.backupCodes) {
                  setBackupCodes(newcredential.backupCodes)
                }
                setDeviceName('')
                setWebauthnError(null)
                setStep('backup')
              } else {
                setStep('main')
                setWebauthnCredentials([])
                setWebauthnError(newcredential.error || t('common.error'))
              }
            } catch (error) {
              setWebauthnError(error.message)
            }
          }}
        >
          <Fingerprint size={16} />
          {t('account.2fa-setup.setup-webauthn.config-now')}
        </button>
        <button
          className="auth-button auth-button-secondary"
          onClick={() => setStep('main')}
        >
          {t('common.cancel')}
        </button>
      </div>
    </div>
  )

  const renderVerification = () => (
    <form onSubmit={handleVerify2FA} className="auth-form-content">
      <div className="auth-input-group">
        <label htmlFor="disable-otp-1">
          {t('account.2fa-setup.verify.label-code')}
        </label>
        <div className="otp-container">
          {[0, 1, 2, 3, 4, 5].map((idx) => (
            <input
              key={idx}
              type="text"
              maxLength={1}
              value={verificationCode[idx] || ''}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '').slice(0, 1)
                const arr = verificationCode.split('')
                arr[idx] = val
                setVerificationCode(arr.join('').slice(0, 6))
                if (val && idx < 5) {
                  const next = document.getElementById(`otp-${idx + 1}`)
                  if (next) next.focus()
                }
              }}
              onKeyDown={(e) => {
                if (
                  e.key === 'Backspace' &&
                  !verificationCode[idx] &&
                  idx > 0
                ) {
                  const prev = document.getElementById(`otp-${idx - 1}`)
                  if (prev) prev.focus()
                }
              }}
              id={`otp-${idx}`}
              className="otp-input"
              inputMode="numeric"
              autoComplete="one-time-code"
              onPaste={(e) => {
                e.preventDefault()
                const pasteData = e.clipboardData.getData('text')
                if (!/^\d+$/.test(pasteData)) return
                const digits = pasteData.slice(0, 6).split('')
                const newCode = [...verificationCode]
                digits.forEach((digit, i) => {
                  if (i < 6) {
                    newCode[i] = digit
                    const next = document.getElementById(`otp-${i + 1}`)
                    if (next) next.focus()
                  }
                })
                setVerificationCode(newCode.join(''))
              }}
              aria-label={`Digit ${idx + 1}`}
              required
            />
          ))}
        </div>
      </div>

      <div className="verify-actions">
        <button
          type="submit"
          className="auth-button auth-button-primary"
          disabled={isLoading || verificationCode.length !== 6}
        >
          <CheckCircle2 size={16} />
          {isLoading
            ? t('auth.login.form.accesskey.verification')
            : t('account.2fa-setup.verify.activate')}
        </button>
        <button
          type="button"
          className="auth-button auth-button-secondary"
          onClick={() =>
            setStep(currentMethod === 'app' ? 'setup-app' : 'main')
          }
        >
          {t('common.back')}
        </button>
      </div>
    </form>
  )

  const renderBackup = () => (
    <div className="auth-form-content">
      <div className="backup-codes">
        <div className="auth-alert auth-alert-warning">
          <AlertTriangle size={20} />
          <div>
            <h4>{t('account.2fa-setup.backup.important')}</h4>
            <p>{t('account.2fa-setup.backup.warning')}</p>
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
          className="auth-button auth-button-secondary"
        >
          <Download size={16} />
          {t('account.2fa-setup.backup.download')}
        </button>
      </div>

      <button
        className="auth-button auth-button-primary"
        onClick={() => setStep('main')}
      >
        <CheckCircle2 size={16} />
        {t('account.2fa-setup.backup.final-button')}
      </button>
    </div>
  )

  const renderDisableEmail = () => (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        handleVerifyDisable2FA()
      }}
      className="auth-form-content"
    >
      <div className="auth-input-group">
        <label htmlFor="password">{t('common.password')}</label>
        <div className="auth-input-wrapper">
          <div className="auth-input-icon">
            <Key size={18} />
          </div>
          <input
            type="password"
            id="password"
            value={password}
            autoComplete="current-password"
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t('auth.login.form.login.enterpassword')}
            required
          />
        </div>
      </div>

      <div className="disable-actions">
        <button
          type="submit"
          className="auth-button danger-btn"
          disabled={isLoading || !password}
        >
          <ShieldX size={16} />
          {isLoading
            ? t('auth.login.form.accesskey.verification')
            : t('account.security.2fa_disable')}
        </button>
        <button
          type="button"
          className="auth-button auth-button-secondary"
          onClick={() => setStep('main')}
        >
          {t('common.cancel')}
        </button>
      </div>
    </form>
  )

  const renderDisableApp = () => (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        handleVerifyDisable2FA()
      }}
      className="auth-form-content"
    >
      <div className="auth-input-group">
        <label htmlFor="disable-otp-1">
          {t('account.2fa-setup.verify.label-code')}
        </label>
        <div className="otp-container">
          {[0, 1, 2, 3, 4, 5].map((idx) => (
            <input
              key={idx}
              type="text"
              maxLength={1}
              value={verificationCode[idx] || ''}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '').slice(0, 1)
                const arr = verificationCode.split('')
                arr[idx] = val
                setVerificationCode(arr.join('').slice(0, 6))
                if (val && idx < 5) {
                  const next = document.getElementById(`disable-otp-${idx + 1}`)
                  if (next) next.focus()
                }
              }}
              onKeyDown={(e) => {
                if (
                  e.key === 'Backspace' &&
                  !verificationCode[idx] &&
                  idx > 0
                ) {
                  const prev = document.getElementById(`disable-otp-${idx - 1}`)
                  if (prev) prev.focus()
                }
              }}
              id={`disable-otp-${idx}`}
              className="otp-input"
              inputMode="numeric"
              autoComplete="one-time-code"
              aria-label={`Digit ${idx + 1}`}
              required
            />
          ))}
        </div>
      </div>

      <div className="disable-actions">
        <button
          type="submit"
          className="auth-button danger-btn"
          disabled={isLoading || verificationCode.length !== 6}
        >
          <ShieldX size={16} />
          {isLoading
            ? t('auth.login.form.accesskey.verification')
            : t('account.security.2fa_disable')}
        </button>
        <button
          type="button"
          className="auth-button auth-button-secondary"
          onClick={() => setStep('main')}
        >
          {t('common.cancel')}
        </button>
      </div>
    </form>
  )

  const renderDisableWebauthn = () => (
    <div className="auth-form-content">
      {renderWebauthnDevices()}
      <div className="disable-actions">
        <button
          className="auth-button auth-button-secondary"
          onClick={() => setStep('main')}
        >
          {t('common.back')}
        </button>
      </div>
    </div>
  )

  const renderFormContent = () => {
    switch (step) {
      case 'setup-app':
        return renderSetupApp()
      case 'setup-webauthn':
        return renderSetupWebauthn()
      case 'verify-app':
      case 'verify-email':
        return renderVerification()
      case 'backup':
        return renderBackup()
      case 'disable-email':
        return renderDisableEmail()
      case 'disable-app':
        return renderDisableApp()
      case 'disable-webauthn':
        return renderDisableWebauthn()
      default:
        return renderMainContent()
    }
  }

  const visualContent = getVisualContent()

  return (
    <div className="twofactor-page">
      <div className="auth-container">
        <div className="auth-visual-section">
          <div className="auth-visual-content">
            <div className="auth-header">
              <button
                className="back-button"
                onClick={() =>
                  step === 'main' ? navigate('/settings') : setStep('main')
                }
              >
                <ArrowLeft size={20} />
                <span>{t('common.back')}</span>
              </button>
              <span className="title">Stepify</span>
            </div>
            <div className="auth-stats">
              <div
                className="auth-stat-item"
                style={{ flexDirection: 'column' }}
              >
                <h3>{visualContent.title}</h3>
                <p>{visualContent.description}</p>
              </div>
              {visualContent.steps.map((step, index) => (
                <div key={index} className="auth-stat-item">
                  <div className="auth-stat-icon">{step.icon}</div>
                  <div className="auth-stat-info">
                    <h4>{step.title}</h4>
                    <p>{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="auth-form-section">
          <div className="auth-form-container">{renderFormContent()}</div>
        </div>
      </div>
    </div>
  )
}

export default TwoFactorSettings
