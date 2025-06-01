const Challenge = require('../../models/Challenge');
const Notification = require('../../models/Notification');
const User = require('../../models/User');
const { updateUserRewards } = require('../../controllers/RewardController');
const { recordRankingHistory } = require('../../controllers/RankingController');

const cron = async (req, res) => {
  try {
    const now = new Date();

    // 1. Mise à jour des statuts des défis
    try {
      const startingChallenges = await Challenge.updateMany(
        { status: 'upcoming', startDate: { $lte: now } },
        { $set: { status: 'active' } }
      );
      const endingChallenges = await Challenge.updateMany(
        { status: 'active', endDate: { $lte: now } },
        { $set: { status: 'completed' } }
      );
      console.log('challenges qui commencent :', startingChallenges, 'challenges qui se terminent :', endingChallenges)
    } catch (error) {
      console.error('[CRON] Erreur lors de la mise à jour des statuts des défis', error);
    }

    // 2. Suppression des notifications expirées
    try {
      const deleted = await Notification.deleteMany({
        DeleteAt: { $lte: now }
      });
      console.log('Notifications expirées supprimées', deleted.deletedCount);
    } catch (error) {
      console.error('[CRON] Erreur suppression des notifications expirées', error);
    }

    // 3. Suppression des défis solitaires
    try {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(now.getDate() - 7);

      const challengesToDelete = await Challenge.find({
        createdAt: { $lte: oneWeekAgo },
        $expr: {
          $and: [
            { $eq: [{ $size: "$participants" }, 1] },
            { $eq: ["$participants.0.user", "$creator"] }
          ]
        }
      });

      const deletedChallenges = await Challenge.deleteMany({
        _id: { $in: challengesToDelete.map(c => c._id) }
      });

      await Notification.deleteMany({
        challenge: { $in: challengesToDelete.map(c => c._id) }
      });

      console.log('Défis solitaires supprimés', deletedChallenges.deletedCount);
    } catch (error) {
      console.error('[CRON] Erreur suppression défis solitaires', error);
    }

    // 4. Enregistrement de l'historique du classement
    try {
      await recordRankingHistory();
      console.log('Historique du classement enregistré');
    } catch (error) {
      console.error('[CRON] Erreur enregistrement du classement', error);
    }

    // 5. Mise à jour des récompenses quotidiennes
    try {
      if (now.getHours() === 0) {
        const users = await User.find({}, '_id');
        const batchSize = 100;
        for (let i = 0; i < users.length; i += batchSize) {
          const batch = users.slice(i, i + batchSize);
          await Promise.all(batch.map(async (user) => {
            try {
              await updateUserRewards(user._id);
            } catch (err) {
              console.error(`Erreur récompense user ${user._id}`, err);
            }
          }));
        }
        console.log('Récompenses mises à jour pour tous les utilisateurs');
      }
    } catch (error) {
      console.error('[CRON] Erreur mise à jour des récompenses', error);
    }

    res.status(200).json({ message: 'Tâches planifiées exécutées avec succès' });

  } catch (globalError) {
    console.error('[CRON] Erreur globale dans l’exécution des tâches', globalError);
    res.status(500).json({ error: 'Erreur globale dans les tâches planifiées' });
  }
}

module.exports = {
  cron
};