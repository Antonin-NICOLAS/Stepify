const UserModel = require("../models/User");
const { generateBackupCodes } = require("../helpers/TwoFactorHelpers");
const {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} = require("@simplewebauthn/server");
const {
  isoBase64URL,
  isoUint8Array,
} = require("@simplewebauthn/server/helpers");
const {
  sendLocalizedError,
  sendLocalizedSuccess,
} = require("../utils/ResponseHelper");
const { sendTwoFactorBackupCodesEmail } = require("../utils/SendMail");

// Configuration WebAuthn
const rpName = "Stepify";
const rpID = process.env.DOMAIN;
const PORT = 5173;
const origin =
  process.env.NODE_ENV === "production"
    ? `https://${rpID}`
    : `http://${rpID}:${PORT}`;

// Générer les options d'enregistrement
const generateRegistrationOpt = async (req, res) => {
  try {
    const user = await UserModel.findById(req.userId);
    if (!user) {
      return sendLocalizedError(res, 404, "errors.generic.user_not_found");
    }

    const userPasskeys = user.twoFactorAuth.webauthnCredentials || [];

    const options = await generateRegistrationOptions({
      rpName,
      rpID,
      userID: isoUint8Array.fromUTF8String(user._id.toString()),
      userName: user.email,
      attestationType: "none",
      excludeCredentials: userPasskeys.map((passkey) => ({
        id: passkey.credentialId,
        type: "public-key",
        transports: passkey.transports || [],
      })),
      authenticatorSelection: {
        userVerification: "preferred",
        requireResidentKey: false,
      },
    });

    // Stocker le challenge temporairement
    user.twoFactorAuth.challenge = options.challenge;
    await user.save();

    return sendLocalizedSuccess(res, null, {}, { options });
  } catch (error) {
    console.error("Erreur génération options enregistrement:", error);
    return sendLocalizedError(
      res,
      500,
      "errors.webauthn.registration_options_error"
    );
  }
};

// Vérifier la réponse d'enregistrement
const verifyRegistration = async (req, res) => {
  try {
    const { attestationResponse } = req.body;
    const user = await UserModel.findById(req.userId);

    if (!user) {
      return sendLocalizedError(res, 404, "errors.generic.user_not_found");
    }

    if (user.twoFactorAuth.webauthnEnabled) {
      return sendLocalizedError(
        res,
        400,
        "errors.2fa.webauthn_already_enabled"
      );
    }

    if (!attestationResponse) {
      return sendLocalizedError(res, 400, "errors.webauthn.registration_error");
    }

    const expectedChallenge = user.twoFactorAuth.challenge;

    if (!expectedChallenge) {
      return sendLocalizedError(res, 400, "errors.webauthn.challenge_expired");
    }

    let verification;
    try {
      verification = await verifyRegistrationResponse({
        response: attestationResponse,
        expectedChallenge,
        expectedOrigin: origin,
        expectedRPID: rpID,
      });
    } catch (error) {
      console.error("Erreur vérification:", error);
      return sendLocalizedError(res, 400, "errors.webauthn.registration_error");
    }

    const { verified, registrationInfo } = verification;

    if (verified && registrationInfo) {
      const { credential } = registrationInfo;

      const newCredential = {
        credentialId: credential.id,
        publicKey: isoBase64URL.fromBuffer(credential.publicKey), // Stockage en base64
        counter: credential.counter || 0,
        transports: attestationResponse.transports || [],
        createdAt: new Date(),
      };

      user.twoFactorAuth.webauthnCredentials.push(newCredential);

      user.twoFactorAuth.challenge = null;

      user.twoFactorAuth.webauthnEnabled = true;

      user.twoFactorAuth.lastVerified = new Date();

      if (!user.twoFactorAuth.backupCodes) {
        const backupCodes = await generateBackupCodes();
        user.twoFactorAuth.backupCodes = backupCodes;
        await sendTwoFactorBackupCodesEmail(
          user.email,
          user.firstName,
          backupCodes
        );
      }

      if (!user.twoFactorAuth.preferredMethod) {
        user.twoFactorAuth.preferredMethod = "webauthn";
      }

      await user.save();

      if (
        user.twoFactorAuth.webauthnEnabled &&
        (user.twoFactorAuth.emailEnabled || user.twoFactorAuth.appEnabled)
      ) {
        return sendLocalizedSuccess(res, "success.2fa.new_method_enabled");
      } else {
        return sendLocalizedSuccess(
          res,
          "success.webauthn.registration_complete",
          {},
          {
            backupCodes: user.twoFactorAuth.backupCodes,
          }
        );
      }
    } else {
      return sendLocalizedError(
        res,
        400,
        "errors.webauthn.registration_failed"
      );
    }
  } catch (error) {
    console.error("Erreur vérification enregistrement:", error);
    return sendLocalizedError(res, 500, "errors.webauthn.registration_error");
  }
};

// Générer les options d'authentification
const generateAuthenticationOpt = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return sendLocalizedError(res, 400, "errors.auth.email_required");
    }
    const user = await UserModel.findOne({ email });

    if (!user) {
      return sendLocalizedError(res, 400, "errors.generic.user_not_found");
    }
    if (!user.twoFactorAuth.webauthnEnabled) {
      return sendLocalizedError(res, 400, "errors.2fa.webauthn_not_enabled");
    }

    const options = await generateAuthenticationOptions({
      rpID,
      allowCredentials: user.twoFactorAuth.webauthnCredentials.map((cred) => ({
        id: cred.credentialId,
        type: "public-key",
        transports: cred.transports,
      })),
      userVerification: "preferred",
    });

    // Stocker le challenge temporairement
    user.twoFactorAuth.challenge = options.challenge;
    await user.save();

    return sendLocalizedSuccess(res, null, {}, { options });
  } catch (error) {
    console.error("Erreur génération options auth:", error);
    return sendLocalizedError(
      res,
      500,
      "errors.webauthn.authentication_options_error"
    );
  }
};

// Vérifier la réponse d'authentification
const verifyAuthentication = async ({ responsekey, user, res }) => {
  try {
    if (!user) {
      return sendLocalizedError(res, 404, "errors.generic.user_not_found");
    }

    const expectedChallenge = user.twoFactorAuth.challenge;
    if (!expectedChallenge) {
      return sendLocalizedError(res, 400, "errors.webauthn.challenge_expired");
    }

    const dbCredential = user.twoFactorAuth.webauthnCredentials.find(
      (cred) => cred.credentialId === responsekey.id
    );

    if (!dbCredential) {
      return sendLocalizedError(
        res,
        400,
        "errors.webauthn.credential_not_found"
      );
    }

    // Conversion critique des données
    const authenticator = {
      id: dbCredential.credentialId,
      publicKey: isoBase64URL.toBuffer(dbCredential.publicKey),
      counter: Number(dbCredential.counter),
      transports: dbCredential.transports || [],
    };

    let verification;
    try {
      verification = await verifyAuthenticationResponse({
        response: responsekey,
        expectedChallenge,
        expectedOrigin: origin,
        expectedRPID: rpID,
        credential: authenticator,
      });
    } catch (error) {
      console.error("Détails de l'erreur:", {
        error: error.message,
        stack: error.stack,
      });
      return sendLocalizedError(
        res,
        400,
        "errors.webauthn.authentication_failed"
      );
    }

    if (verification.verified) {
      const credIndex = user.twoFactorAuth.webauthnCredentials.findIndex(
        (cred) => cred.credentialId === responsekey.id
      );
      user.twoFactorAuth.webauthnCredentials[credIndex].counter =
        verification.authenticationInfo.newCounter;
      user.twoFactorAuth.challenge = null;
      await user.save();
    }

    return verification;
  } catch (error) {
    console.error("Erreur complète:", {
      message: error.message,
      stack: error.stack,
      raw: error,
    });
    return sendLocalizedError(res, 500, "errors.webauthn.authentication_error");
  }
};

// Supprimer une clé WebAuthn
const removeWebAuthnCredential = async (req, res) => {
  try {
    const { credentialId } = req.params;
    const user = await UserModel.findById(req.userId);

    if (!user) {
      return sendLocalizedError(res, 404, "errors.generic.user_not_found");
    }

    const credentialIndex = user.twoFactorAuth.webauthnCredentials.findIndex(
      (cred) => cred.credentialId === credentialId
    );

    if (credentialIndex === -1) {
      return sendLocalizedError(
        res,
        404,
        "errors.webauthn.credential_not_found"
      );
    }

    user.twoFactorAuth.webauthnCredentials.splice(credentialIndex, 1);

    if (user.twoFactorAuth.webauthnCredentials.length === 0) {
      user.twoFactorAuth.webauthnEnabled = false;
      if (user.twoFactorAuth.preferredMethod === "webauthn") {
        user.twoFactorAuth.preferredMethod = user.twoFactorAuth.appEnabled
          ? "app"
          : user.twoFactorAuth.emailEnabled
          ? "email"
          : undefined;
      }

      if (!user.twoFactorAuth.appEnabled && !user.twoFactorAuth.emailEnabled) {
        user.twoFactorAuth = {
          backupCodes: [],
          lastVerified: null,
        };
      }
    }

    await user.save();
    return sendLocalizedSuccess(res, "success.webauthn.credential_removed");
  } catch (error) {
    console.error("Erreur lors de la suppression de la clé WebAuthn:", error);
    return sendLocalizedError(res, 500, "errors.webauthn.remove_error");
  }
};

module.exports = {
  generateRegistrationOpt,
  verifyRegistration,
  generateAuthenticationOpt,
  verifyAuthentication,
  removeWebAuthnCredential,
};
