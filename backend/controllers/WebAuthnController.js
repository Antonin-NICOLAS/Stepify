const UserModel = require('../models/User')
const { generateBackupCodes } = require('../helpers/TwoFactorHelpers')
const {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} = require('@simplewebauthn/server')
const {
  isoBase64URL,
  isoUint8Array,
} = require('@simplewebauthn/server/helpers')
const {
  setChallenge,
  getActiveCredentials,
  validateChallenge,
  clearChallenge,
  findCredentialById,
  updateCredentialCounter,
} = require('../helpers/WebAuthnHelpers')
const {
  sendLocalizedError,
  sendLocalizedSuccess,
} = require('../utils/ResponseHelper')
const { sendTwoFactorBackupCodesEmail } = require('../emails/services/SendMail')

// Configuration WebAuthn
const rpName = 'Stepify'
const rpID = process.env.DOMAIN
const PORT = 5173
const origin =
  process.env.NODE_ENV === 'production'
    ? `https://${rpID}`
    : `http://${rpID}:${PORT}`

// Générer les options d'enregistrement
const generateRegistrationOpt = async (req, res) => {
  try {
    const user = await UserModel.findById(req.userId)
    if (!user) {
      return sendLocalizedError(res, 404, 'errors.generic.user_not_found')
    }

    const activeCredentials = getActiveCredentials(user)

    const options = await generateRegistrationOptions({
      rpName,
      rpID,
      userID: isoUint8Array.fromUTF8String(user._id.toString()),
      userName: user.email,
      attestationType: 'none',
      excludeCredentials: activeCredentials.map((passkey) => ({
        id: isoBase64URL.toBuffer(passkey.credentialId),
        type: 'public-key',
        transports: passkey.transports || [],
      })),
      authenticatorSelection: {
        userVerification: 'preferred',
        requireResidentKey: false,
      },
      extensions: {
        credProps: true,
      },
    })

    // Stocker le challenge
    setChallenge(user, options.challenge)
    await user.save()

    return sendLocalizedSuccess(res, null, {}, { options })
  } catch (error) {
    console.error('Erreur génération options enregistrement:', error)
    return sendLocalizedError(
      res,
      500,
      'errors.webauthn.registration_options_error',
    )
  }
}

// Vérifier la réponse d'enregistrement
const verifyRegistration = async (req, res) => {
  try {
    const { attestationResponse, deviceName } = req.body
    const user = await UserModel.findById(req.userId)

    if (!user) {
      return sendLocalizedError(res, 404, 'errors.generic.user_not_found')
    }

    if (user.twoFactorAuth.webauthnEnabled) {
      return sendLocalizedError(res, 400, 'errors.2fa.webauthn_already_enabled')
    }

    if (!attestationResponse) {
      return sendLocalizedError(res, 400, 'errors.webauthn.registration_error')
    }

    if (!validateChallenge(user, attestationResponse.challenge)) {
      return sendLocalizedError(res, 400, 'errors.webauthn.challenge_expired')
    }

    console.log(
      user.twoFactorAuth.challenge,
      attestationResponse.challenge,
      'Vérification du challenge:',
      user.twoFactorAuth.challenge === attestationResponse.challenge,
    )

    let verification
    try {
      verification = await verifyRegistrationResponse({
        response: attestationResponse,
        expectedChallenge: user.twoFactorAuth.challenge,
        expectedOrigin: origin,
        expectedRPID: rpID,
      })
    } catch (error) {
      console.error('Erreur vérification:', error)
      return sendLocalizedError(res, 400, 'errors.webauthn.registration_error')
    }

    const { verified, registrationInfo } = verification

    if (verified && registrationInfo) {
      const { credential } = registrationInfo

      // Ajouter le deviceType basé sur les extensions
      const deviceType = attestationResponse.extensions?.credProps?.rk
        ? 'security-key'
        : 'platform'

      const newCredential = {
        credentialId: credential.id,
        publicKey: isoBase64URL.fromBuffer(credential.publicKey),
        counter: credential.counter || 0,
        transports: attestationResponse.transports || [],
        deviceType,
        deviceName: deviceName || 'Unknown Device',
        createdAt: new Date(),
        lastUsed: null,
        revoked: false,
      }

      user.twoFactorAuth.webauthnCredentials.push(newCredential)

      clearChallenge(user)

      user.twoFactorAuth.webauthnEnabled = true

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
        user.twoFactorAuth.preferredMethod = 'webauthn'
      }

      await user.save()

      if (
        user.twoFactorAuth.webauthnEnabled &&
        (user.twoFactorAuth.emailEnabled || user.twoFactorAuth.appEnabled)
      ) {
        return sendLocalizedSuccess(
          res,
          'success.2fa.new_method_enabled',
          {},
          {
            preferredMethod: user.twoFactorAuth.preferredMethod,
          },
        )
      } else {
        return sendLocalizedSuccess(
          res,
          'success.webauthn.registration_complete',
          {},
          {
            backupCodes: user.twoFactorAuth.backupCodes,
            preferredMethod: user.twoFactorAuth.preferredMethod,
          },
        )
      }
    } else {
      return sendLocalizedError(res, 400, 'errors.webauthn.registration_failed')
    }
  } catch (error) {
    console.error('Erreur vérification enregistrement:', error)
    return sendLocalizedError(res, 500, 'errors.webauthn.registration_error')
  }
}

// Générer les options d'authentification
const generateAuthenticationOpt = async (req, res) => {
  try {
    const { email } = req.body
    if (!email) {
      return sendLocalizedError(res, 400, 'errors.auth.email_required')
    }
    const user = await UserModel.findOne({ email })

    if (!user) {
      return sendLocalizedError(res, 400, 'errors.generic.user_not_found')
    }
    if (!user.twoFactorAuth.webauthnEnabled) {
      return sendLocalizedError(res, 400, 'errors.2fa.webauthn_not_enabled')
    }

    const options = await generateAuthenticationOptions({
      rpID,
      allowCredentials: user.twoFactorAuth.webauthnCredentials.map((cred) => ({
        id: cred.credentialId,
        type: 'public-key',
        transports: cred.transports,
      })),
      userVerification: 'preferred',
    })

    // Stocker le challenge temporairement
    setChallenge(user, options.challenge)

    await user.save()
    console.log('Challenge stocké:', user.twoFactorAuth.challenge)

    return sendLocalizedSuccess(res, null, {}, { options })
  } catch (error) {
    console.error('Erreur génération options auth:', error)
    return sendLocalizedError(
      res,
      500,
      'errors.webauthn.authentication_options_error',
    )
  }
}

// Vérifier la réponse d'authentification
const verifyAuthentication = async ({ responsekey, user, res }) => {
  try {
    if (!user) {
      return sendLocalizedError(res, 404, 'errors.generic.user_not_found')
    }

    console.log("Réponse d'authentification reçue:", responsekey)
    console.log(responsekey.challenge)

    // Vérifier le challenge
    if (!validateChallenge(user, responsekey.challenge)) {
      return sendLocalizedError(res, 400, 'errors.webauthn.challenge_expired')
    }

    const credentialId = responsekey.id
    const dbCredential = findCredentialById(user, credentialId)

    if (!dbCredential) {
      return sendLocalizedError(
        res,
        400,
        'errors.webauthn.credential_not_found',
      )
    }

    // Conversion critique des données
    const authenticator = {
      id: dbCredential.credentialId,
      publicKey: isoBase64URL.toBuffer(dbCredential.publicKey),
      counter: Number(dbCredential.counter),
      transports: dbCredential.transports || [],
    }

    let verification
    try {
      verification = await verifyAuthenticationResponse({
        response: responsekey,
        expectedChallenge: user.twoFactorAuth.challenge,
        expectedOrigin: origin,
        expectedRPID: rpID,
        credential: authenticator,
      })
    } catch (error) {
      console.error("Détails de l'erreur:", {
        error: error.message,
        stack: error.stack,
      })
      return sendLocalizedError(
        res,
        400,
        'errors.webauthn.authentication_failed',
      )
    }

    if (verification.verified) {
      updateCredentialCounter(
        user,
        credentialId,
        verification.authenticationInfo.newCounter,
      )
      clearChallenge(user)

      await user.save()

      return {
        verified: true,
        credentialId,
        deviceType: dbCredential.deviceType,
      }
    } else {
      return sendLocalizedError(
        res,
        400,
        'errors.webauthn.authentication_failed',
      )
    }
  } catch (error) {
    console.error('Erreur complète:', {
      message: error.message,
      stack: error.stack,
      raw: error,
    })
    return sendLocalizedError(res, 500, 'errors.webauthn.authentication_error')
  }
}

// Supprimer une clé WebAuthn
const removeWebAuthnCredential = async (req, res) => {
  try {
    const { credentialId } = req.params
    const user = await UserModel.findById(req.userId)

    if (!user) {
      return sendLocalizedError(res, 404, 'errors.generic.user_not_found')
    }

    const credentialIndex = user.twoFactorAuth.webauthnCredentials.findIndex(
      (cred) => cred.id === credentialId,
    )

    if (credentialIndex === -1) {
      return sendLocalizedError(
        res,
        404,
        'errors.webauthn.credential_not_found',
      )
    }

    user.twoFactorAuth.webauthnCredentials.splice(credentialIndex, 1)

    if (user.twoFactorAuth.webauthnCredentials.length === 0) {
      user.twoFactorAuth.webauthnEnabled = false
      if (user.twoFactorAuth.preferredMethod === 'webauthn') {
        user.twoFactorAuth.preferredMethod = user.twoFactorAuth.appEnabled
          ? 'app'
          : user.twoFactorAuth.emailEnabled
            ? 'email'
            : undefined
      }

      if (!user.twoFactorAuth.appEnabled && !user.twoFactorAuth.emailEnabled) {
        user.twoFactorAuth = {
          backupCodes: [],
          lastVerified: null,
        }
      }
    }

    await user.save()
    return sendLocalizedSuccess(res, 'success.webauthn.credential_removed')
  } catch (error) {
    console.error('Erreur lors de la suppression de la clé WebAuthn:', error)
    return sendLocalizedError(res, 500, 'errors.webauthn.remove_error')
  }
}

const getWebAuthnDevices = async (req, res) => {
  try {
    const user = await UserModel.findById(req.userId)
    if (!user) {
      return sendLocalizedError(res, 404, 'errors.generic.user_not_found')
    }

    const devices = user.twoFactorAuth.webauthnCredentials
      .filter((cred) => !cred.revoked)
      .map((cred) => ({
        id: cred.credentialId,
        type: cred.deviceType,
        name: cred.deviceName,
        lastUsed: cred.lastUsed,
        createdAt: cred.createdAt,
      }))

    return sendLocalizedSuccess(res, null, {}, { devices })
  } catch (error) {
    console.error('Erreur récupération appareils:', error)
    return sendLocalizedError(res, 500, 'errors.webauthn.devices_error')
  }
}

module.exports = {
  generateRegistrationOpt,
  verifyRegistration,
  generateAuthenticationOpt,
  verifyAuthentication,
  removeWebAuthnCredential,
  getWebAuthnDevices,
}
