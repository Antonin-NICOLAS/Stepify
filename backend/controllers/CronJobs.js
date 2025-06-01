const Challenge = require('../models/Challenge');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { updateUserRewards } = require('./RewardController');
const { recordRankingHistory } = require('./RankingController');

// Update challenge statuses every hour
const ChallengeStatusUpdates = async (req, res) => {
    try {
        await ChallengeStatusUpdatesInternal();
        res.status(200).json({ message: '[CRON] Status updates completed' });
    } catch (error) {
        res.status(500).json({ error: '[CRON] Error updating challenges status' });
    }
};

const ChallengeStatusUpdatesInternal = async () => {
    console.log('[CRON] Running challenge status updates...');
    try {
        const now = new Date();

        // Mettre à jour les défis qui doivent démarrer
        await Challenge.updateMany(
            {
                status: 'upcoming',
                startDate: { $lte: now }
            },
            { $set: { status: 'active' } }
        );

        // Mettre à jour les défis qui doivent se terminer
        await Challenge.updateMany(
            {
                status: 'active',
                endDate: { $lte: now }
            },
            { $set: { status: 'completed' } }
        );
        console.log('[CRON] Status updates completed');
    } catch (error) {
        console.error('[CRON] Erreur lors de la mise à jour des statuts des défis', error);
    }
}

// Delete Notification 1 week after the response - Every day at 1 AM
const DeleteExpiredNotifications = async (req, res) => {
    try {
        await DeleteExpiredNotificationsInternal();
        return res.status(200).json({ message: '[CRON] Suppression des notifications expirées terminée' });
    } catch (error) {
        return res.status(500).json({ error: '[CRON] Error deleting notifications' });
    }
};

const DeleteExpiredNotificationsInternal = async () => {
    try {
        console.log('[CRON] Début de la suppression des notifications expirées');
        await Notification.deleteMany({
            DeleteAt: { $lte: new Date() }
        });
        console.log('[CRON] Suppression des notifications expirées terminée');
    } catch (error) {
        console.error('[CRON] Erreur lors de la suppression des notifications expirées:', error);
    }
}

// Update rewards for all users - Every day at 00:00 AM
const DailyRewardUpdates = async (req, res) => {
    try {
        await DailyRewardUpdatesInternal();
        return res.status(200).json({ message: '[CRON] Mise à jour des récompenses quotidiennes terminée' });
    } catch (error) {
        return res.status(500).json({ error: '[CRON] Erreur lors de la mise à jour des récompenses quotidiennes' });
    }
};

const DailyRewardUpdatesInternal = async () => {
    try {
        console.log('[CRON] Starting daily reward updates for all users...');

        // Get all user IDs (just the IDs for efficiency)
        const users = await User.find({}, '_id');

        let processed = 0;
        const totalUsers = users.length;

        // Process users in batches to avoid memory issues
        const batchSize = 100;
        for (let i = 0; i < totalUsers; i += batchSize) {
            const batch = users.slice(i, i + batchSize);

            // Process each user in parallel
            await Promise.all(batch.map(async (user) => {
                try {
                    await updateUserRewards(user._id);
                    processed++;

                    // Log progress every 100 users
                    if (processed % 100 === 0) {
                        console.log(`Processed ${processed} of ${totalUsers} users...`);
                    }
                } catch (error) {
                    console.error(`Error updating rewards for user ${user._id}:`, error);
                }
            }));
        }

        console.log('[CRON] Mise à jour des récompenses quotidiennes terminée', {
            totalUsers: users.length
        });
    } catch (error) {
        console.error('[CRON] Erreur mise à jour des récompenses quotidiennes:', error);
    }
}

// Delete Challenges with only creators - Every day at 1 AM
const DeleteLonelyChallenges = async (req, res) => {
    try {
        await DeleteLonelyChallengesInternal();
        return res.status(200).json({ message: '[CRON] Suppression des challenges orphelins et notif associées terminée' });

    } catch (error) {
        return res.status(500).json({ erreur: '[CRON] Erreur lors de la suppression des challenges orphelins' });
    }
};

const DeleteLonelyChallengesInternal = async () => {
    try {
        console.log('[CRON] Checking for lonely challenges to delete...');

        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        const challengesToDelete = await Challenge.find({
            createdAt: { $lte: oneWeekAgo },
            $expr: {
                $and: [
                    { $eq: [{ $size: "$participants" }, 1] },
                    { $eq: ["$participants.0.user", "$creator"] }
                ]
            }
        });

        const deletedCount = await Challenge.deleteMany({
            _id: { $in: challengesToDelete.map(c => c._id) }
        });

        // Supprimer les notifications associées
        await Notification.deleteMany({
            challenge: { $in: challengesToDelete.map(c => c._id) }
        });

        console.log(`[CRON] Deleted ${deletedCount.deletedCount} lonely challenges`);
    } catch (error) {
        console.error('[CRON] Error deleting lonely challenges:', error);
    }
}

const saveRank = async (req, res) => {
    try {
        await recordRankingHistory();
        res.status(200).json({ message: '[CRON] Historique du classement enregistré' });
    } catch (error) {
        res.status(500).json({ error: '[CRON] Erreur enregistrement du classement' });
    }
}

const All = async (req, res) => {
    const results = [];

    try {
        await recordRankingHistory();
        results.push('✅ Classement enregistré');
    } catch (err) {
        results.push('❌ Erreur enregistrement classement');
        console.error(err);
    }

    try {
        await ChallengeStatusUpdatesInternal();
        results.push('✅ Statuts des défis mis à jour');
    } catch (err) {
        results.push('❌ Erreur mise à jour statuts défis');
        console.error(err);
    }

    try {
        await DeleteLonelyChallengesInternal();
        results.push('✅ Défis orphelins supprimés');
    } catch (err) {
        results.push('❌ Erreur suppression défis orphelins');
        console.error(err);
    }

    try {
        await DailyRewardUpdatesInternal();
        results.push('✅ Récompenses mises à jour');
    } catch (err) {
        results.push('❌ Erreur mise à jour récompenses');
        console.error(err);
    }

    try {
        await DeleteExpiredNotificationsInternal();
        results.push('✅ Notifications expirées supprimées');
    } catch (err) {
        results.push('❌ Erreur suppression notifications expirées');
        console.error(err);
    }

    res.status(200).json({
        message: '[CRON] Tâches exécutées',
        results
    });
};

module.exports = {
    All,
    saveRank,
    ChallengeStatusUpdates,
    DeleteLonelyChallenges,
    DailyRewardUpdates,
    DeleteExpiredNotifications
};