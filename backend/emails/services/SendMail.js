const nodemailer = require('nodemailer')
const {
  TwoFactorSetupEmailTemplate,
  BackupCodesEmailTemplate,
  TwoFactorEmailCodeTemplate,
} = require('../templates/EmailTemplates')
const { NewLoginEmailTemplate } = require('../templates/NewLoginEmail')
const {
  EmailVerificationTokenTemplate,
} = require('../templates/EmailVerification')
const { WelcomeEmailTemplate } = require('../templates/Welcome')
const { EmailPasswordResetTemplate } = require('../templates/PasswordReset')
const { SucessfulResetTemplate } = require('../templates/SuccessfulReset')

const { t, interpolate } = require('../services/i18n')
// .env
require('dotenv').config()

const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    type: 'login',
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

const sendNewLoginEmail = async (user, ipAddress, deviceInfo, location) => {
  const options = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  }

  const loginDate = new Date().toLocaleDateString(
    user.languagePreference,
    options
  )

  console.log('user.languagePreference', user.languagePreference)

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: user.email,
    subject: t('newlogin.subject', user.languagePreference),
    html: interpolate(
      NewLoginEmailTemplate(user, loginDate, ipAddress, deviceInfo, location),
      { firstName: user.firstName }
    ),
  }

  try {
    await transporter.sendMail(mailOptions)
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email :", error)
    throw new Error("Échec de l'envoi de l'email de nouvelle connection")
  }
}

const sendVerificationEmail = async (email, verificationCode) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Vérification de votre email - Stepify',
    html: EmailVerificationTokenTemplate.replace(
      '{verificationCode}',
      verificationCode
    ),
  }

  try {
    await transporter.sendMail(mailOptions)
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email :", error)
    throw new Error("Échec de l'envoi de l'email de vérification")
  }
}

const sendWelcomeEmail = async (email, prenom) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "🎉 Bienvenue dans l'aventure Stepify !",
    html: WelcomeEmailTemplate.replace('{User.Prenom}', prenom),
  }

  try {
    await transporter.sendMail(mailOptions)
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email :", error)
    throw new Error("Échec de l'envoi de l'email de bienvenue")
  }
}

const sendResetPasswordEmail = async (email, resetUrl) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Réinitialisation de votre mot de passe Stepify',
    html: EmailPasswordResetTemplate.replace('{resetUrl}', resetUrl),
  }

  try {
    await transporter.sendMail(mailOptions)
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email :", error)
    throw new Error(
      "Échec de l'envoi de l'email de réinitialisation de mot de passe"
    )
  }
}

const sendResetPasswordSuccessfulEmail = async (email, prenom) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: '🔒 Ton mot de passe a été modifié',
    html: SucessfulResetTemplate.replace('{User.Prenom}', prenom),
  }

  try {
    await transporter.sendMail(mailOptions)
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email :", error)
    throw new Error(
      "Échec de l'envoi de l'email du succès de réinitialisation de mot de passe"
    )
  }
}

// Email de configuration 2FA
const sendTwoFactorSetupEmail = async (email, firstName) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Configuration de l'authentification à deux facteurs",
    html: TwoFactorSetupEmailTemplate(firstName),
  }

  try {
    await transporter.sendMail(mailOptions)
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email :", error)
    throw new Error(
      "Échec de l'envoi de l'email pour la configuration de l'authentification à deux facteurs"
    )
  }
}

// Email des codes de secours 2FA
const sendTwoFactorBackupCodesEmail = async (email, firstName, backupCodes) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Vos codes de secours pour l'authentification à deux facteurs",
    html: BackupCodesEmailTemplate(firstName, backupCodes),
  }

  try {
    await transporter.sendMail(mailOptions)
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email :", error)
    throw new Error(
      "Échec de l'envoi de l'email des codes de secours pour l'authentification à deux facteurs"
    )
  }
}

// Envoyer un code 2FA par email
const sendTwoFactorEmailCode = async (email, firstName, code) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Code de vérification Stepify',
    html: TwoFactorEmailCodeTemplate(firstName, code),
  }
  try {
    await transporter.sendMail(mailOptions)
  } catch (error) {
    console.error("Erreur lors de l'envoi du code 2FA par email:", error)
    throw error
  }
}

module.exports = {
  sendNewLoginEmail,
  sendVerificationEmail,
  sendWelcomeEmail,
  sendResetPasswordEmail,
  sendResetPasswordSuccessfulEmail,
  sendTwoFactorSetupEmail,
  sendTwoFactorBackupCodesEmail,
  sendTwoFactorEmailCode,
}
