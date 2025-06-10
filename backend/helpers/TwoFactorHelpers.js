const speakeasy = require("speakeasy");
const QRCode = require("qrcode");
const CryptoJS = require("crypto-js");

// Générer un secret pour la 2FA
const generateTwoFactorSecret = () => {
  return speakeasy.generateSecret({
    name: "Stepify",
    length: 20,
  });
};

// Générer un QR code pour la 2FA
const generateQRCode = async (secret) => {
  try {
    return await QRCode.toDataURL(secret.otpauth_url);
  } catch (error) {
    console.error("Erreur lors de la génération du QR code:", error);
    throw error;
  }
};

// Vérifier le code 2FA
const verifyTwoFactorCode = (secret, token) => {
  return speakeasy.totp.verify({
    secret: secret,
    encoding: "base32",
    token: token,
    window: 1, // Permet une fenêtre de 30 secondes avant/après
  });
};

// Générer des codes de secours
const generateBackupCodes = (count = 8) => {
  const codes = [];
  for (let i = 0; i < count; i++) {
    const randomValue = Date.now().toString() + Math.random().toString();
    const hash = CryptoJS.SHA256(randomValue)
      .toString(CryptoJS.enc.Hex)
      .toUpperCase();
    const code = hash.substring(0, 8);
    codes.push({
      code: code,
      used: false,
    });
  }
  return codes;
};

// Vérifier un code de secours
const verifyBackupCode = (user, code) => {
  const backupCode = user.twoFactorAuth.backupCodes.find(
    (bc) => bc.code === code && !bc.used
  );

  if (backupCode) {
    backupCode.used = true;
    return true;
  }
  return false;
};

module.exports = {
  generateTwoFactorSecret,
  generateQRCode,
  verifyTwoFactorCode,
  generateBackupCodes,
  verifyBackupCode,
};
