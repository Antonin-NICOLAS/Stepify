const crypto = require('crypto')

const generateChallenge = () => {
  return crypto.randomBytes(32).toString('base64').replace(/[+/=]/g, '')
}

const setChallenge = (user, challenge) => {
  user.twoFactorAuth.challenge = challenge
  user.twoFactorAuth.challengeExpires = new Date(Date.now() + 5 * 60 * 1000) // 5 min expiration
}

const validateChallenge = (user, challenge) => {
  if (!user.twoFactorAuth.challenge || !user.twoFactorAuth.challengeExpires) {
    return false
  }

  return (
    user.twoFactorAuth.challenge === challenge &&
    new Date(user.twoFactorAuth.challengeExpires) > new Date()
  )
}

const clearChallenge = (user) => {
  user.twoFactorAuth.challenge = null
  user.twoFactorAuth.challengeExpires = null
}

const findCredentialById = (user, credentialId) => {
  return user.twoFactorAuth.webauthnCredentials.find(
    (cred) => cred.credentialId === credentialId
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
  return user.twoFactorAuth.webauthnCredentials.filter((cred) => !cred.revoked)
}

module.exports = {
  generateChallenge,
  setChallenge,
  validateChallenge,
  clearChallenge,
  findCredentialById,
  normalizeCredentialId,
  updateCredentialCounter,
  getActiveCredentials,
}
