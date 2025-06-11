const UserModel = require('../models/User')
const bcrypt = require('bcryptjs')
const ms = require('ms')
const UAParser = require('ua-parser-js')
const {
  generateTwoFactorSecret,
  generateQRCode,
  verifyTwoFactorCode,
  generateBackupCodes,
  verifyBackupCode,
  hashEmailCode,
  compareEmailCode,
} = require('../helpers/TwoFactorHelpers')
const {
  GenerateAuthCookie,
  generateSessionFingerprint,
  findLocation,
} = require('../helpers/AuthHelpers')
const {
  sendLocalizedError,
  sendLocalizedSuccess,
} = require('../utils/ResponseHelper')
const {
  sendNewLoginEmail,
  sendTwoFactorSetupEmail,
  sendTwoFactorBackupCodesEmail,
  sendTwoFactorEmailCode,
} = require('../emails/services/SendMail')
const { verifyAuthentication } = require('./WebAuthnController')
// .env
require('dotenv').config()

// Obtenir le statut de la 2FA
const getStatus = async (req, res) => {
  try {
    const user = await UserModel.findById(req.userId)
    if (!user) {
      return sendLocalizedError(res, 404, 'errors.generic.user_not_found')
    }

    // Do not select credenital id and public key for security reasons
    const webauthnCredentials = user.twoFactorAuth.webauthnCredentials.map(
      (cred) => ({
        id: cred.id,
        deviceName: cred.deviceName,
        createdAt: cred.createdAt,
      }),
    )

    return sendLocalizedSuccess(
      res,
      null,
      {},
      {
        preferredMethod: user.twoFactorAuth.preferredMethod,
        appEnabled: user.twoFactorAuth.appEnabled,
        emailEnabled: user.twoFactorAuth.emailEnabled,
        webauthnEnabled: user.twoFactorAuth.webauthnEnabled,
        webauthnCredentials: webauthnCredentials || [],
        backupCodes: user.twoFactorAuth.backupCodes,
        lastVerified: user.twoFactorAuth.lastVerified,
      },
    )
  } catch (error) {
    console.error('Erreur lors de la récupération du statut de la 2FA:', error)
    return sendLocalizedError(res, 500, 'errors.2fa.status_error')
  }
}

// Activer la 2FA
const enableTwoFactor = async (req, res) => {
  try {
    const user = await UserModel.findById(req.userId)
    if (!user) {
      return sendLocalizedError(res, 404, 'errors.generic.user_not_found')
    }

    if (user.twoFactorAuth.appEnabled) {
      return sendLocalizedError(res, 400, 'errors.2fa.app_already_enabled')
    }

    const secret = generateTwoFactorSecret()
    const qrCode = await generateQRCode(secret)

    user.twoFactorAuth.secret = secret.base32
    user.twoFactorAuth.appEnabled = false

    await user.save()
    await sendTwoFactorSetupEmail(user.email, user.firstName)

    return sendLocalizedSuccess(
      res,
      'success.2fa.app_setup_initiated',
      {},
      {
        qrCode,
        secret: secret.base32,
      },
    )
  } catch (error) {
    console.error("Erreur lors de l'activation de la 2FA:", error)
    return sendLocalizedError(res, 500, 'errors.2fa.enable_error')
  }
}

// Activer la 2FA par email
const enableEmail2FA = async (req, res) => {
  try {
    const user = await UserModel.findById(req.userId)
    if (!user) {
      return sendLocalizedError(res, 404, 'errors.generic.user_not_found')
    }

    if (!user.isVerified) {
      return sendLocalizedError(
        res,
        403,
        'errors.2fa.email_verification_required',
      )
    }

    if (user.twoFactorAuth.emailEnabled) {
      return sendLocalizedError(res, 400, 'errors.2fa.email_already_enabled')
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString()
    user.twoFactorAuth.emailCode = hashEmailCode(code)
    user.twoFactorAuth.emailCodeExpires = new Date(Date.now() + 10 * 60 * 1000)

    await user.save()
    await sendTwoFactorEmailCode(user.email, user.firstName, code)

    return sendLocalizedSuccess(res, 'success.2fa.email_setup_initiated')
  } catch (error) {
    console.error("Erreur lors de l'activation de la 2FA par email:", error)
    return sendLocalizedError(res, 500, 'errors.2fa.enable_error')
  }
}

// Vérifier et activer la 2FA
const verifyAndEnableTwoFactor = async (req, res) => {
  const { token } = req.body

  if (!token || token.length !== 6 || !/^\d+$/.test(token)) {
    return sendLocalizedError(res, 400, 'errors.2fa.invalid_code')
  }
  try {
    const user = await UserModel.findById(req.userId)

    if (!user) {
      return sendLocalizedError(res, 404, 'errors.generic.user_not_found')
    }

    if (!user.twoFactorAuth.secret) {
      return sendLocalizedError(res, 400, 'errors.2fa.setup_required')
    }

    const isValid = verifyTwoFactorCode(user.twoFactorAuth.secret, token)
    if (!isValid) {
      return sendLocalizedError(res, 400, 'errors.2fa.invalid_code')
    }

    user.twoFactorAuth.appEnabled = true

    user.twoFactorAuth.lastVerified = new Date()

    if (
      !user.twoFactorAuth.backupCodes ||
      user.twoFactorAuth.backupCodes.length < 2
    ) {
      const backupCodes = await generateBackupCodes()
      user.twoFactorAuth.backupCodes = backupCodes
      await sendTwoFactorBackupCodesEmail(
        user.email,
        user.firstName,
        backupCodes,
      )
    }

    if (!user.twoFactorAuth.preferredMethod) {
      user.twoFactorAuth.preferredMethod = 'app'
    }

    await user.save()

    if (
      user.twoFactorAuth.appEnabled &&
      (user.twoFactorAuth.emailEnabled || user.twoFactorAuth.webauthnEnabled)
    ) {
      return sendLocalizedSuccess(res, 'success.2fa.new_method_enabled')
    } else {
      return sendLocalizedSuccess(
        res,
        'success.2fa.enabled',
        {},
        {
          backupCodes: user.twoFactorAuth.backupCodes,
        },
      )
    }
  } catch (error) {
    console.error('Erreur lors de la vérification de la 2FA:', error)
    return sendLocalizedError(res, 500, 'errors.2fa.verify_error')
  }
}

// Vérifier et activer la 2FA par email
const verifyAndEnableEmail2FA = async (req, res) => {
  const { code } = req.body

  if (!code || code.length !== 6 || !/^\d+$/.test(code)) {
    return sendLocalizedError(res, 400, 'errors.2fa.invalid_code')
  }

  try {
    const user = await UserModel.findById(req.userId)
    if (!user) {
      return sendLocalizedError(res, 404, 'errors.generic.user_not_found')
    }

    if (!user.twoFactorAuth.emailCode || !user.twoFactorAuth.emailCodeExpires) {
      return sendLocalizedError(res, 400, 'errors.2fa.setup_required')
    }

    if (new Date(user.twoFactorAuth.emailCodeExpires) < new Date()) {
      return sendLocalizedError(res, 400, 'errors.2fa.code_expired')
    }

    if (!compareEmailCode(user.twoFactorAuth.emailCode, code)) {
      return sendLocalizedError(res, 400, 'errors.2fa.invalid_code')
    }

    user.twoFactorAuth.emailEnabled = true

    user.twoFactorAuth.emailCode = undefined

    user.twoFactorAuth.emailCodeExpires = undefined

    user.twoFactorAuth.lastVerified = new Date()

    if (
      !user.twoFactorAuth.backupCodes ||
      user.twoFactorAuth.backupCodes.length < 2
    ) {
      const backupCodes = await generateBackupCodes()
      user.twoFactorAuth.backupCodes = backupCodes
      await sendTwoFactorBackupCodesEmail(
        user.email,
        user.firstName,
        backupCodes,
      )
    }

    if (!user.twoFactorAuth.preferredMethod) {
      user.twoFactorAuth.preferredMethod = 'email'
    }

    await user.save()

    if (
      user.twoFactorAuth.emailEnabled &&
      (user.twoFactorAuth.appEnabled || user.twoFactorAuth.webauthnEnabled)
    ) {
      return sendLocalizedSuccess(res, 'success.2fa.new_method_enabled')
    } else {
      return sendLocalizedSuccess(
        res,
        'success.2fa.enabled',
        {},
        {
          backupCodes: user.twoFactorAuth.backupCodes,
        },
      )
    }
  } catch (error) {
    console.error('Erreur lors de la vérification de la 2FA par email:', error)
    return sendLocalizedError(res, 500, 'errors.2fa.verify_error')
  }
}

// Vérifier le code 2FA lors de la connexion
const verifyLoginTwoFactor = async (req, res) => {
  try {
    const { email, stayLoggedIn, token } = req.body

    // Validate required fields
    if (!email || !token) {
      return sendLocalizedError(res, 400, 'errors.generic.missing_fields')
    }

    const user = await UserModel.findOne({ email })
    if (!user) {
      return sendLocalizedError(res, 404, 'errors.generic.user_not_found')
    }

    // Check if 2FA is locked
    if (
      user.twoFactorAuth.lockUntil &&
      user.twoFactorAuth.lockUntil > Date.now()
    ) {
      return sendLocalizedError(res, 403, 'errors.2fa.temporarily_locked')
    }

    // Verify based on preferred method
    let isValid = false
    switch (user.twoFactorAuth.preferredMethod) {
      case 'app':
        isValid = verifyTwoFactorCode(user.twoFactorAuth.secret, token)
        break
      case 'email':
        isValid =
          user.twoFactorAuth.emailCode === token &&
          new Date(user.twoFactorAuth.emailCodeExpires) > new Date()
        break
      case 'webauthn':
        try {
          const verification = await verifyAuthentication({
            responsekey: token,
            user,
            res,
          })
          isValid = verification.verified || false

          // Ajouter des informations sur l'appareil utilisé
          req.deviceType = verification.deviceType
        } catch (error) {
          isValid = false

          // Gestion des tentatives échouées
          user.twoFactorAuth.attempts += 1
          if (user.twoFactorAuth.attempts >= 5) {
            user.twoFactorAuth.lockUntil = new Date(Date.now() + 15 * 60 * 1000)
          }
          await user.save()
        }
        break
    }

    if (!isValid) {
      // Increment failed attempts
      user.twoFactorAuth.attempts += 1
      if (user.twoFactorAuth.attempts >= 5) {
        user.twoFactorAuth.lockUntil = new Date(Date.now() + 15 * 60 * 1000) // 15 min lock
      }
      await user.save()
      return sendLocalizedError(res, 400, 'errors.2fa.invalid_code')
    }

    // Reset attempts on success
    user.twoFactorAuth.attempts = 0
    user.twoFactorAuth.lockUntil = null

    user.twoFactorAuth.lastVerified = new Date()
    user.lastLoginAt = Date.now()
    user.loginAttempts = 0
    user.lockUntil = null

    const userAgent = req.headers['user-agent'] || 'unknown'
    const ipAddress =
      req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress
    const sessionDuration = stayLoggedIn
      ? ms(process.env.SESSION_DURATION_LONG)
      : ms(process.env.SESSION_DURATION_SHORT)

    //vérification des sessions expirées
    user.activeSessions = user.activeSessions.filter(
      (session) => session.expiresAt > Date.now(),
    )

    await user.save()

    // pas plus de 5 sessions en mm temps
    if (user.activeSessions.length >= 5) {
      user.activeSessions.sort((a, b) => a.expiresAt - b.expiresAt)
      user.activeSessions.shift()
    }

    user.activeSessions.push({
      ipAddress,
      userAgent,
      fingerprint: generateSessionFingerprint(req),
      expiresAt: new Date(Date.now() + sessionDuration),
    })

    await user.save()

    GenerateAuthCookie(res, user, stayLoggedIn)
    const location = await findLocation(user, ipAddress)

    const parser = new UAParser(userAgent)
    const device = parser.getDevice()
    const os = parser.getOS()
    const browser = parser.getBrowser()

    const deviceInfo =
      `${browser.name} ${browser.version} sur ${os.name} ${os.version}` +
      (device.model ? ` (${device.vendor || ''} ${device.model})` : '')

    await sendNewLoginEmail(user, ipAddress, deviceInfo, location)

    const userResponse = user.toMinimal()

    return sendLocalizedSuccess(
      res,
      'success.auth.successful_login',
      {},
      { user: userResponse, isVerified: user.isVerified },
    )
  } catch (error) {
    console.error('Erreur lors de la vérification de la 2FA:', error)
    return sendLocalizedError(res, 500, 'errors.2fa.login_error')
  }
}

// Définir la méthode préférée
const setPreferredMethod = async (req, res) => {
  try {
    const { method } = req.body
    const user = await UserModel.findById(req.userId)

    if (!user) {
      return sendLocalizedError(res, 404, 'errors.generic.user_not_found')
    }

    if (!['app', 'email', 'webauthn'].includes(method)) {
      return sendLocalizedError(res, 400, 'errors.2fa.invalid_method')
    }

    // Vérifier que la méthode est activée
    if (method === 'email' && !user.twoFactorAuth.emailEnabled) {
      return sendLocalizedError(res, 400, 'errors.2fa.email_not_enabled')
    }
    if (method === 'webauthn' && !user.twoFactorAuth.webauthnEnabled) {
      return sendLocalizedError(res, 400, 'errors.2fa.webauthn_not_enabled')
    }
    if (method === 'app' && !user.twoFactorAuth.appEnabled) {
      return sendLocalizedError(res, 400, 'errors.2fa.app_not_enabled')
    }

    user.twoFactorAuth.preferredMethod = method
    await user.save()

    return sendLocalizedSuccess(res, 'success.2fa.preferred_method_updated')
  } catch (error) {
    console.error(
      'Erreur lors de la mise à jour de la méthode préférée:',
      error,
    )
    return sendLocalizedError(res, 500, 'errors.2fa.preferred_method_error')
  }
}

// Désactiver la 2FA
const disableTwoFactor = async (req, res) => {
  const { token } = req.body
  if (!token) {
    return sendLocalizedError(res, 400, 'errors.generic.fields_missing')
  }
  if (token.length !== 6 || !/^\d+$/.test(token)) {
    return sendLocalizedError(res, 400, 'errors.2fa.invalid_code')
  }
  try {
    const user = await UserModel.findById(req.userId)

    if (!user) {
      return sendLocalizedError(res, 404, 'errors.generic.user_not_found')
    }

    if (!user.twoFactorAuth.appEnabled) {
      return sendLocalizedError(res, 400, 'errors.2fa.app_not_enabled')
    }

    const isValid = verifyTwoFactorCode(user.twoFactorAuth.secret, token)
    if (!isValid) {
      return sendLocalizedError(res, 400, 'errors.2fa.invalid_code')
    }

    user.twoFactorAuth = {
      appEnabled: false,
      secret: null,
    }

    if (user.twoFactorAuth.preferredMethod === 'app') {
      user.twoFactorAuth.preferredMethod = user.twoFactorAuth.emailEnabled
        ? 'email'
        : user.twoFactorAuth.webauthnEnabled
          ? 'webauthn'
          : undefined
    }

    if (
      !user.twoFactorAuth.emailEnabled &&
      !user.twoFactorAuth.webauthnEnabled
    ) {
      user.twoFactorAuth = {
        backupCodes: [],
        lastVerified: null,
      }
    }

    await user.save()

    return sendLocalizedSuccess(res, 'success.2fa.app_disabled')
  } catch (error) {
    console.error('Erreur lors de la désactivation de la 2FA:', error)
    return sendLocalizedError(res, 500, 'errors.2fa.disable_error')
  }
}

// Désactiver la 2FA par email
const disableEmail2FA = async (req, res) => {
  const { password } = req.body
  if (!password) {
    return sendLocalizedError(res, 400, 'errors.auth.invalid_password')
  }
  try {
    const user = await UserModel.findById(req.userId)
    if (!user) {
      return sendLocalizedError(res, 404, 'errors.generic.user_not_found')
    }

    if (!user.twoFactorAuth.emailEnabled) {
      return sendLocalizedError(res, 400, 'errors.2fa.email_not_enabled')
    }

    // Vérifier le mot de passe
    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
      return sendLocalizedError(res, 400, 'errors.auth.password_incorrect')
    }

    user.twoFactorAuth.emailEnabled = false
    if (user.twoFactorAuth.preferredMethod === 'email') {
      user.twoFactorAuth.preferredMethod = user.twoFactorAuth.appEnabled
        ? 'app'
        : user.twoFactorAuth.webauthnEnabled
          ? 'webauthn'
          : undefined
    }

    if (!user.twoFactorAuth.appEnabled && !user.twoFactorAuth.webauthnEnabled) {
      user.twoFactorAuth = {
        backupCodes: [],
        lastVerified: null,
      }
    }

    await user.save()

    return sendLocalizedSuccess(res, 'success.2fa.email_disabled')
  } catch (error) {
    console.error('Erreur lors de la désactivation de la 2FA par email:', error)
    return sendLocalizedError(res, 500, 'errors.2fa.disable_error')
  }
}

// Utiliser un code de secours
const useBackupCode = async (req, res) => {
  try {
    const { email, backupCode } = req.body
    const user = await UserModel.findOne({ email })

    if (!user) {
      return sendLocalizedError(res, 404, 'errors.generic.user_not_found')
    }

    if (
      !user.twoFactorAuth.appEnabled &&
      !user.twoFactorAuth.emailEnabled &&
      !user.twoFactorAuth.webauthnEnabled
    ) {
      return sendLocalizedError(res, 400, 'errors.2fa.not_enabled')
    }

    const isValid = verifyBackupCode(user, backupCode)
    if (!isValid) {
      return sendLocalizedError(res, 400, 'errors.2fa.invalid_backup_code')
    }

    await user.save()
    return sendLocalizedSuccess(res, 'success.2fa.backup_code_used')
  } catch (error) {
    console.error("Erreur lors de l'utilisation du code de secours:", error)
    return sendLocalizedError(res, 500, 'errors.2fa.backup_code_error')
  }
}

module.exports = {
  getStatus,
  enableTwoFactor,
  enableEmail2FA,
  verifyAndEnableTwoFactor,
  verifyAndEnableEmail2FA,
  verifyLoginTwoFactor,
  disableTwoFactor,
  disableEmail2FA,
  setPreferredMethod,
  useBackupCode,
}
