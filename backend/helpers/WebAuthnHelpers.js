const setChallenge = (user, challenge) => {
  user.twoFactorAuth.challenge = challenge
  user.twoFactorAuth.challengeExpiresAt = new Date(Date.now() + 5 * 60 * 1000) // 5 min expiration
}

const validateChallenge = (user, challenge) => {
  if (!user.twoFactorAuth.challenge || !user.twoFactorAuth.challengeExpiresAt) {
    return false
  }

  return (
    user.twoFactorAuth.challenge === challenge &&
    new Date(user.twoFactorAuth.challengeExpiresAt) > new Date()
  )
}

const clearChallenge = (user) => {
  user.twoFactorAuth.challenge = null
  user.twoFactorAuth.challengeExpiresAt = null
}

const findCredentialById = (user, credentialId) => {
  return user.twoFactorAuth.webauthnCredentials.find(
    (cred) => cred.credentialId === credentialId,
  )
}

const normalizeCredentialId = (credentialId) => {
  return credentialId.replace(/\s+/g, '').toLowerCase()
}

const updateCredentialCounter = (user, credentialId, newCounter) => {
  const credential = findCredentialById(user, credentialId)
  if (credential) {
    credential.counter = newCounter
    credential.lastUsed = new Date()
  }
}

const getActiveCredentials = (user) => {
  if (
    !user.twoFactorAuth ||
    user.twoFactorAuth.webauthnCredentials.length === 0
  ) {
    return []
  }
  return user.twoFactorAuth.webauthnCredentials.filter((cred) => !cred.revoked)
}

module.exports = {
  setChallenge,
  validateChallenge,
  clearChallenge,
  findCredentialById,
  normalizeCredentialId,
  updateCredentialCounter,
  getActiveCredentials,
}
