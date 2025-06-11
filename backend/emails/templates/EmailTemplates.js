const TwoFactorSetupEmailTemplate = (firstName) => `
      <h1>Bonjour ${firstName},</h1>
      <p>Vous avez initié la configuration de l'authentification à deux facteurs sur votre compte Stepify.</p>
      <p>Pour finaliser la configuration, veuillez scanner le QR code qui vous a été fourni avec votre application d'authentification préférée (Google Authenticator, Authy, etc.).</p>
      <p>Une fois le QR code scanné, vous devrez entrer le code généré par l'application pour activer la 2FA.</p>
      <p>Si vous n'avez pas initié cette action, veuillez contacter immédiatement notre support.</p>
      <p>Cordialement,<br>L'équipe Stepify</p>
    `

const BackupCodesEmailTemplate = (firstName, backupCodes) => `
      <h1>Bonjour ${firstName},</h1>
      <p>Voici vos codes de secours pour l'authentification à deux facteurs. Conservez-les précieusement, ils ne vous seront montrés qu'une seule fois.</p>
      <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
        ${backupCodes
          .map(
            (code) =>
              `<div style="font-family: monospace; margin: 5px 0;">${code.code}</div>`,
          )
          .join('')}
      </div>
      <p>Ces codes vous permettront de vous connecter si vous perdez l'accès à votre application d'authentification.</p>
      <p>Chaque code ne peut être utilisé qu'une seule fois.</p>
      <p>Cordialement,<br>L'équipe Stepify</p>
	  `

const TwoFactorEmailCodeTemplate = (firstName, code) => `
        <h1>Bonjour ${firstName},</h1>
        <p>Votre code de vérification pour l'authentification à deux facteurs est :</p>
        <h2 style="font-size: 32px; letter-spacing: 5px; text-align: center; padding: 20px; background: #f5f5f5; border-radius: 8px;">${code}</h2>
        <p>Ce code expirera dans 10 minutes.</p>
        <p>Si vous n'avez pas demandé ce code, veuillez ignorer cet email.</p>
        <p>Cordialement,<br>L'équipe Stepify</p>`

module.exports = {
  TwoFactorSetupEmailTemplate,
  BackupCodesEmailTemplate,
  TwoFactorEmailCodeTemplate,
}
