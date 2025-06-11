const cron = require('node-cron')
const Challenge = require('../../models/Challenge')
const Notification = require('../../models/Notification')
const User = require('../../models/User')
const { updateUserRewards } = require('../../controllers/RewardController')
const { saveRankInternal } = require('../../controllers/RankingController')
const {
  ChallengeStatusUpdatesInternal,
} = require('../../controllers/ChallengeController')
const Cache = require('../../logs/Cache')
const Logger = require('../../logs/Logger')

const CleanCache = () => {
  cron.schedule('0 * * * *', async () => {
    try {
      Cache.cleanup()
      console.log('[CRON] Nettoyage du cache effectué')
      Logger.info('[CRON] Nettoyage du cache effectué')
    } catch (error) {
      console.error(':', error)
      Logger.error('[CRON] Impossible de nettoyer le cache')
    }
  })
}

// Statut des challenges vérifiés tous les jours à minuit 0
const scheduleStatusUpdates = () => {
  cron.schedule('0 0 * * *', async () => {
    try {
      Logger.info('Running challenge status updates...')
      await ChallengeStatusUpdatesInternal()
      Logger.info('[CRON] Status updates completed')
    } catch (error) {
      console.error('[CRON] Error updating challenges status:', error)
      Logger.error('[CRON] Error updating challenges status:', { error })
    }
  })
}

// Supprimer les notifications expirées tous les jours à minuit 1
const deleteExpiredNotifications = () => {
  cron.schedule('0 */2 * * *', async () => {
    try {
      Logger.info('Début de la suppression des notifications expirées')
      const result = await Notification.deleteMany({
        DeleteAt: { $lte: new Date() },
      })
      Logger.info('Suppression des notifications expirées terminée', {
        deletedCount: result.deletedCount,
      })
    } catch (error) {
      console.error('[CRON] Error deleting notifications:', error)
      Logger.error('Erreur lors de la suppression des notifications expirées', {
        error,
      })
    }
  })
}

// Mettre à jour les rewards de tout le monde tous les jours à minuit 2
const scheduleDailyRewardUpdates = () => {
  cron.schedule('0 0 * * *', async () => {
    try {
      console.log('Starting daily reward updates for all users...')
      Logger.info('Starting daily reward updates for all users...')

      // Get all user IDs (just the IDs for efficiency)
      const users = await User.find({}, '_id')

      let processed = 0
      const totalUsers = users.length

      // Process users in batches to avoid memory issues
      const batchSize = 100
      for (let i = 0; i < totalUsers; i += batchSize) {
        const batch = users.slice(i, i + batchSize)

        // Process each user in parallel
        await Promise.all(
          batch.map(async (user) => {
            try {
              await updateUserRewards(user._id)
              processed++

              // Log progress every 100 users
              if (processed % 100 === 0) {
                console.log(`Processed ${processed} of ${totalUsers} users...`)
              }
            } catch (error) {
              console.error(
                `Error updating rewards for user ${user._id}:`,
                error,
              )
            }
          }),
        )
      }

      Logger.info('Mise à jour des récompenses quotidiennes terminée', {
        totalUsers: users.length,
      })
    } catch (error) {
      console.error('[CRON] Error in daily reward updates:', error)
      Logger.error(
        'Erreur lors de la mise à jour des récompenses quotidiennes',
        { error },
      )
    }
  })
}

// Delete Challenges with only creators - Every day at 1 AM
const deleteLonelyChallenges = () => {
  cron.schedule('0 1 * * *', async () => {
    try {
      console.log('Checking for lonely challenges to delete...')
      Logger.info('Checking for lonely challenges to delete...')

      const oneWeekAgo = new Date()
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

      const challengesToDelete = await Challenge.find({
        createdAt: { $lte: oneWeekAgo },
        $expr: {
          $and: [
            { $eq: [{ $size: '$participants' }, 1] },
            { $eq: ['$participants.0.user', '$creator'] },
          ],
        },
      })

      const deletedCount = await Challenge.deleteMany({
        _id: { $in: challengesToDelete.map((c) => c._id) },
      })

      console.log(`Deleted ${deletedCount.deletedCount} lonely challenges`)
      Logger.info(`Deleted ${deletedCount.deletedCount} lonely challenges`)

      // Supprimer les notifications associées
      await Notification.deleteMany({
        challenge: { $in: challengesToDelete.map((c) => c._id) },
      })
    } catch (error) {
      console.error('[CRON] Error deleting lonely challenges:', error)
      Logger.error('[CRON] Error deleting lonely challenges:', { error })
    }
  })
}

// Enregistre l'historique du classement toutes les 15 minutes
const saveRank = () => {
  cron.schedule('*/15 * * * *', () => {
    try {
      console.log('Running ranking history recording...')
      Logger.info('Running ranking history recording...')
      saveRankInternal()
      console.log('Ranking history recorded')
      Logger.info('Ranking history recorded')
    } catch (error) {
      console.error('[CRON] Error in daily reward updates:', error)
      Logger.error('[CRON] Error in daily reward updates:', { error })
    }
  })
}

module.exports = {
  CleanCache,
  scheduleStatusUpdates,
  deleteExpiredNotifications,
  scheduleDailyRewardUpdates,
  deleteLonelyChallenges,
  saveRank,
}
