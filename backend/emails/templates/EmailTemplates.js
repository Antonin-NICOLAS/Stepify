const TwoFactorSetupEmailTemplate = (firstName) => `
      <h1>Bonjour ${firstName},</h1>
      <p>Vous avez initié la configuration de l'authentification à deux facteurs sur votre compte Stepify.</p>
      <p>Pour finaliser la configuration, veuillez scanner le QR code qui vous a été fourni avec votre application d'authentification préférée (Google Authenticator, Authy, etc.).</p>
      <p>Une fois le QR code scanné, vous devrez entrer le code généré par l'application pour activer la 2FA.</p>
      <p>Si vous n'avez pas initié cette action, veuillez contacter immédiatement notre support.</p>
      <p>Cordialement,<br>L'équipe Stepify</p>
    `

module.exports = {
  TwoFactorSetupEmailTemplate,
}
