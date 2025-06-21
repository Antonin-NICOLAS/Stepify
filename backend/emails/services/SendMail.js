const nodemailer = require('nodemailer')
const { TwoFactorSetupEmailTemplate } = require('../templates/EmailTemplates')
const { NewLoginEmailTemplate } = require('../templates/NewLoginEmail')
const { EmailVerificationTemplate } = require('../templates/EmailVerification')
const { WelcomeEmailTemplate } = require('../templates/Welcome')
const { EmailPasswordResetTemplate } = require('../templates/PasswordReset')
const { SucessfulResetTemplate } = require('../templates/SuccessfulReset')
const { Email2FACodeTemplate } = require('../templates/Email2FACode')
const { BackupCodesEmailTemplate } = require('../templates/BackupCodesEmail')

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
    options,
  )

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: user.email,
    subject: t('newlogin.subject', user.languagePreference),
    html: interpolate(
      NewLoginEmailTemplate(user, loginDate, ipAddress, deviceInfo, location),
      { firstName: user.firstName },
    ),
  }

  try {
    await transporter.sendMail(mailOptions)
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email :", error)
    throw new Error("Échec de l'envoi de l'email de nouvelle connection")
  }
}

const sendVerificationEmail = async (user, verificationCode) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: user.email,
    subject: t('emailverification.subject', user.languagePreference),
    html: EmailVerificationTemplate(user, verificationCode),
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

const sendResetPasswordEmail = async (user, resetUrl) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: user.email,
    subject: t('passwordreset.subject', user.languagePreference),
    html: EmailPasswordResetTemplate(user, resetUrl),
  }

  try {
    await transporter.sendMail(mailOptions)
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email :", error)
    throw new Error(
      "Échec de l'envoi de l'email de réinitialisation de mot de passe",
    )
  }
}

const sendResetPasswordSuccessfulEmail = async (user) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: user.email,
    subject: t('successfulreset.subject', user.languagePreference),
    html: interpolate(SucessfulResetTemplate(user), {
      firstName: user.firstName,
    }),
  }

  try {
    await transporter.sendMail(mailOptions)
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email :", error)
    throw new Error(
      "Échec de l'envoi de l'email du succès de réinitialisation de mot de passe",
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
      "Échec de l'envoi de l'email pour la configuration de l'authentification à deux facteurs",
    )
  }
}

// Email des codes de secours 2FA
const sendTwoFactorBackupCodesEmail = async (user, backupCodes) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: user.email,
    subject: t('backupcodes.subject', user.languagePreference),
    html: interpolate(
      BackupCodesEmailTemplate(backupCodes, user.languagePreference),
      {
        firstName: user.firstName,
      },
    ),
  }

  try {
    await transporter.sendMail(mailOptions)
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email :", error)
    throw new Error(
      "Échec de l'envoi de l'email des codes de secours pour l'authentification à deux facteurs",
    )
  }
}

// Envoyer un code 2FA par email
const sendTwoFactorEmailCode = async (user, code) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: user.email,
    subject: t('email2FAcode.subject', user.languagePreference),
    html: interpolate(Email2FACodeTemplate(code, user.languagePreference), {
      firstName: user.firstName,
    }),
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
