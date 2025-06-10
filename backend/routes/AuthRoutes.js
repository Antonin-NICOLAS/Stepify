const express = require('express')
const cors = require('cors')
require('dotenv').config()
//middleware
const { verifyToken, requireAuth } = require('../middlewares/VerifyToken.js')
const { localization } = require('../middlewares/Localization')
const authLimiter = require('../middlewares/AuthLimiter')
//controllers
const {
  createUser,
  verifyEmail,
  resendVerificationEmail,
  ChangeVerificationEmail,
  deleteUser,
  loginUser,
  forgotPassword,
  resetPassword,
  logoutUser,
  checkAuth,
} = require('../controllers/AuthController')

const {
  getStatus,
  enableTwoFactor,
  verifyAndEnableTwoFactor,
  disableTwoFactor,
  verifyLoginTwoFactor,
  useBackupCode,
  enableEmail2FA,
  verifyAndEnableEmail2FA,
  setPreferredMethod,
  disableEmail2FA,
} = require('../controllers/TwoFactorController')

const {
  generateRegistrationOpt,
  verifyRegistration,
  generateAuthenticationOpt,
  removeWebAuthnCredential,
} = require('../controllers/WebAuthnController')

//router
const router = express.Router()

//middleware
router.use(
  cors({
    credentials: true,
    origin: process.env.FRONTEND_SERVER,
  }),
  localization
)

//routes
router.post('/register', createUser)
router.post('/verify-email', verifyEmail)
router.post('/resend-verification-code', resendVerificationEmail)

router.post('/login', authLimiter, loginUser)
router.post('/forgot-password', authLimiter, forgotPassword)
router.post('/reset-password/:token', resetPassword)

router.post('/2fa/verify-login', verifyLoginTwoFactor)
router.post('/2fa/use-backup', useBackupCode)
router.post('/2fa/webauthn/generate-authentication', generateAuthenticationOpt)

router.use(verifyToken, localization, requireAuth)

router.get('/2fa/status', getStatus)

// 2FA App
router.post('/2fa/enable', enableTwoFactor)
router.post('/2fa/verify', verifyAndEnableTwoFactor)
router.post('/2fa/disable', disableTwoFactor)

// 2FA Email
router.post('/2fa/email/enable', enableEmail2FA)
router.post('/2fa/email/verify', verifyAndEnableEmail2FA)
router.post('/2fa/email/disable', disableEmail2FA)

// WebAuthn
router.post('/2fa/webauthn/generate-registration', generateRegistrationOpt)
router.post('/2fa/webauthn/verify-registration', verifyRegistration)
router.delete(
  '/2fa/webauthn/credentials/:credentialId',
  removeWebAuthnCredential
)

// Méthode préférée
router.post('/2fa/set-preferred-method', setPreferredMethod)

router.post('/change-verification-email', ChangeVerificationEmail)
router.get('/check-auth', checkAuth)
router.post('/logout', logoutUser)
router.delete('/:userId/delete', deleteUser)

module.exports = router
