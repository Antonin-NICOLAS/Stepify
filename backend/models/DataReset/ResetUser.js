const mongoose = require('mongoose')
const User = require('../User')
//.env
require('dotenv').config()

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('[RESET] MongoDB connecté'))
  .catch((err) => console.error('[RESET] Erreur de connexion MongoDB:', err))

async function resetUserStats() {
  try {
    const resetStats = {
      // Base
      verificationToken: null,
      verificationTokenExpiresAt: null,
      resetPasswordToken: null,
      resetPasswordTokenExpiresAt: null,

      // Réinitialisation des statistiques
      totalXP: 0,
      totalSteps: 0,
      totalDistance: 0,
      totalCalories: 0,
      totalCustomGoalsCompleted: 0,
      totalChallengesCompleted: 0,
      level: 0,
      dailyGoal: 10000,

      // Réinitialisation des tableaux
      customGoals: [],
      rewardsUnlocked: [],
      challenges: [],
      rankingHistory: [],
      activeSessions: [],

      // Réinitialisation OTP
      twoFactorAuth: {
        attempts: 0,
        lastAttempt: null,
        lastVerified: null,
        appEnabled: false,
        secret: null,
        emailEnabled: false,
        webauthnEnabled: false,
        challenge: null,
        challengeExpiresAt: null,
        webauthnCredentials: [],
        backupCodes: [],
      },

      // Réinitialisation du streak
      streak: {
        current: 0,
        max: 0,
        lastAchieved: null,
        startDate: null,
        endDate: null,
      },
    }

    const result = await User.updateMany(
      {}, // Tous les utilisateurs
      {
        $set: resetStats,
      },
      { multi: true },
    )

    console.log(
      '[RESET] Statistiques réinitialisées pour',
      result.modifiedCount,
      'utilisateurs',
    )

    // Vérification
    const users = await User.find({})
    for (const user of users) {
      console.log(`[RESET] ${user.username}:`, {
        xp: user.totalXP,
        steps: user.totalSteps,
        rewards: user.rewardsUnlocked.length,
        challenges: user.challenges.length,
      })
    }
  } catch (err) {
    console.error('[RESET] Erreur lors de la réinitialisation:', err)
  } finally {
    await mongoose.connection.close()
    console.log('[RESET] Connexion MongoDB fermée')
  }
}

// Demande de confirmation avant l'exécution
console.log(
  '\n⚠️  ATTENTION: Cette opération va réinitialiser toutes les statistiques des utilisateurs',
)
console.log('Les données suivantes seront conservées:')
console.log('- Informations de compte (email, mot de passe, etc.)')
console.log('- Paramètres de confidentialité')
console.log('- Préférences utilisateur')
console.log("- Liste d'amis\n")

const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout,
})

readline.question(
  'Êtes-vous sûr de vouloir continuer ? (oui/non) ',
  async (answer) => {
    if (answer.toLowerCase() === 'oui') {
      console.log('\n[RESET] Début de la réinitialisation...\n')
      await resetUserStats()
    } else {
      console.log('\n[RESET] Opération annulée')
      process.exit(0)
    }
    readline.close()
  },
)
