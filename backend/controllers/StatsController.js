const User = require('../models/User');
const StepEntry = require('../models/StepEntry');
const Logger = require('../logs/Logger');
const Cache = require('../logs/Cache');

const calculateDailyAverages = async (userId, days = 30) => {
    try {
        const cacheKey = `daily_averages_${userId}_${days}`;
        const cached = Cache.get(cacheKey);
        if (cached) return cached;

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const entries = await StepEntry.find({
            user: userId,
            date: { $gte: startDate }
        });

        const averages = {
            steps: Math.round(entries.reduce((sum, entry) => sum + entry.totalSteps, 0) / days),
            distance: +(entries.reduce((sum, entry) => sum + entry.totalDistance, 0) / days).toFixed(2),
            calories: Math.round(entries.reduce((sum, entry) => sum + entry.totalCalories, 0) / days),
            activeTime: Math.round(entries.reduce((sum, entry) => sum + (entry.totalActiveTime || 0), 0) / days)
        };

        Cache.set(cacheKey, averages, 3600); // Cache pour 1 heure
        return averages;
    } catch (error) {
        Logger.error('Erreur lors du calcul des moyennes journalières', { userId, days, error });
        throw error;
    }
};

const calculateWeeklyProgress = async (userId) => {
    try {
        const cacheKey = `weekly_progress_${userId}`;
        const cached = Cache.get(cacheKey);
        if (cached) return cached;

        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        startOfWeek.setHours(0, 0, 0, 0);

        const lastWeekStart = new Date(startOfWeek);
        lastWeekStart.setDate(lastWeekStart.getDate() - 7);

        const [thisWeekEntries, lastWeekEntries] = await Promise.all([
            StepEntry.find({
                user: userId,
                date: { $gte: startOfWeek, $lte: today }
            }),
            StepEntry.find({
                user: userId,
                date: { $gte: lastWeekStart, $lt: startOfWeek }
            })
        ]);

        const thisWeekStats = {
            steps: thisWeekEntries.reduce((sum, entry) => sum + entry.totalSteps, 0),
            distance: thisWeekEntries.reduce((sum, entry) => sum + entry.totalDistance, 0),
            calories: thisWeekEntries.reduce((sum, entry) => sum + entry.totalCalories, 0)
        };

        const lastWeekStats = {
            steps: lastWeekEntries.reduce((sum, entry) => sum + entry.totalSteps, 0),
            distance: lastWeekEntries.reduce((sum, entry) => sum + entry.totalDistance, 0),
            calories: lastWeekEntries.reduce((sum, entry) => sum + entry.totalCalories, 0)
        };

        const progress = {
            steps: calculateProgress(thisWeekStats.steps, lastWeekStats.steps),
            distance: calculateProgress(thisWeekStats.distance, lastWeekStats.distance),
            calories: calculateProgress(thisWeekStats.calories, lastWeekStats.calories)
        };

        Cache.set(cacheKey, progress, 3600);
        return progress;
    } catch (error) {
        Logger.error('Erreur lors du calcul de la progression hebdomadaire', { userId, error });
        throw error;
    }
};

const calculateProgress = (current, previous) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
};

const getActivityHeatmap = async (userId, days = 365) => {
    try {
        const cacheKey = `heatmap_${userId}_${days}`;
        const cached = Cache.get(cacheKey);
        if (cached) return cached;

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const entries = await StepEntry.find({
            user: userId,
            date: { $gte: startDate }
        }).select('date totalSteps');

        const heatmap = {};
        entries.forEach(entry => {
            const dateStr = entry.date.toISOString().split('T')[0];
            heatmap[dateStr] = entry.totalSteps;
        });

        Cache.set(cacheKey, heatmap, 3600);
        return heatmap;
    } catch (error) {
        Logger.error('Erreur lors de la génération de la heatmap', { userId, days, error });
        throw error;
    }
};

const getPersonalRecords = async (userId) => {
    try {
        const cacheKey = `records_${userId}`;
        const cached = Cache.get(cacheKey);
        if (cached) return cached;

        const entries = await StepEntry.find({ user: userId });

        const records = {
            mostSteps: {
                value: Math.max(...entries.map(e => e.totalSteps)),
                date: entries.reduce((a, b) => a.totalSteps > b.totalSteps ? a : b).date
            },
            mostDistance: {
                value: Math.max(...entries.map(e => e.totalDistance)),
                date: entries.reduce((a, b) => a.totalDistance > b.totalDistance ? a : b).date
            },
            mostCalories: {
                value: Math.max(...entries.map(e => e.totalCalories)),
                date: entries.reduce((a, b) => a.totalCalories > b.totalCalories ? a : b).date
            },
            mostActiveTime: {
                value: Math.max(...entries.map(e => e.totalActiveTime || 0)),
                date: entries.reduce((a, b) => (a.totalActiveTime || 0) > (b.totalActiveTime || 0) ? a : b).date
            }
        };

        Cache.set(cacheKey, records, 3600);
        return records;
    } catch (error) {
        Logger.error('Erreur lors de la récupération des records personnels', { userId, error });
        throw error;
    }
};

const getComparisonStats = async (userId) => {
    try {
        const user = await User.findById(userId);
        if (!user) throw new Error('Utilisateur non trouvé');

        const cacheKey = `comparison_${userId}`;
        const cached = Cache.get(cacheKey);
        if (cached) return cached;

        // Statistiques globales
        const [totalUsers, userRank] = await Promise.all([
            User.countDocuments(),
            User.countDocuments({ totalSteps: { $gt: user.totalSteps } })
        ]);

        const percentile = Math.round(((totalUsers - userRank) / totalUsers) * 100);

        // Comparaison avec les amis
        const friendIds = user.friends.map(f => f.userId);
        const friendStats = await User.find({
            _id: { $in: friendIds }
        }).select('totalSteps totalDistance totalCalories level');

        const comparison = {
            global: {
                percentile,
                rank: userRank + 1,
                totalUsers
            },
            friends: {
                totalFriends: friendStats.length,
                betterThanSteps: friendStats.filter(f => user.totalSteps > f.totalSteps).length,
                betterThanDistance: friendStats.filter(f => user.totalDistance > f.totalDistance).length,
                betterThanCalories: friendStats.filter(f => user.totalCalories > f.totalCalories).length,
                betterThanLevel: friendStats.filter(f => user.level > f.level).length
            }
        };

        Cache.set(cacheKey, comparison, 3600);
        return comparison;
    } catch (error) {
        Logger.error('Erreur lors du calcul des statistiques comparatives', { userId, error });
        throw error;
    }
};

module.exports = {
    calculateDailyAverages,
    calculateWeeklyProgress,
    getActivityHeatmap,
    getPersonalRecords,
    getComparisonStats
}; 