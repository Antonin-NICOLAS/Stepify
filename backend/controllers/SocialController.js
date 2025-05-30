const User = require('../models/User');
const Challenge = require('../models/Challenge');
const Logger = require('../logs/Logger');
const Cache = require('../logs/Cache');

// Obtenir le classement des amis
const getFriendsLeaderboard = async (userId, period = 'week') => {
    const cacheKey = `leaderboard_${userId}_${period}`;
    const cachedLeaderboard = Cache.get(cacheKey);
    if (cachedLeaderboard) return cachedLeaderboard;

    try {
        const user = await User.findById(userId).populate('friends.userId');
        if (!user) throw new Error('Utilisateur non trouvé');

        // Inclure l'utilisateur actuel dans la liste
        const friendIds = [...user.friends.map(f => f.userId._id), userId];

        const users = await User.find({
            _id: { $in: friendIds }
        }).select('username avatarUrl totalXP level totalSteps streak');

        // Trier par XP total
        const leaderboard = users
            .map(u => ({
                userId: u._id,
                username: u.username,
                avatarUrl: u.avatarUrl,
                totalXP: u.totalXP,
                level: u.level,
                totalSteps: u.totalSteps,
                currentStreak: u.streak.current,
                isCurrentUser: u._id.toString() === userId
            }))
            .sort((a, b) => b.totalXP - a.totalXP)
            .map((user, index) => ({ ...user, rank: index + 1 }));

        Cache.set(cacheKey, leaderboard, 3600); // Cache pour 1 heure
        return leaderboard;
    } catch (error) {
        Logger.error('Erreur lors de la récupération du classement', { userId, error });
        throw error;
    }
};

// Suggestions d'amis basées sur les activités similaires
const getFriendSuggestions = async (userId) => {
    try {
        const user = await User.findById(userId);
        if (!user) throw new Error('Utilisateur non trouvé');

        // Exclure les amis existants et les demandes en attente
        const existingFriendIds = user.friends.map(f => f.userId);
        const pendingRequestIds = user.friendRequests.map(r => r.notificationId);

        // Trouver des utilisateurs avec des statistiques similaires
        const similarUsers = await User.find({
            _id: { 
                $nin: [...existingFriendIds, userId, ...pendingRequestIds] 
            },
            level: { 
                $gte: user.level - 2,
                $lte: user.level + 2
            },
            totalSteps: {
                $gte: user.totalSteps * 0.7,
                $lte: user.totalSteps * 1.3
            }
        })
        .select('username avatarUrl level totalSteps')
        .limit(10);

        return similarUsers.map(u => ({
            userId: u._id,
            username: u.username,
            avatarUrl: u.avatarUrl,
            level: u.level,
            totalSteps: u.totalSteps,
            compatibility: calculateCompatibility(user, u)
        }));
    } catch (error) {
        Logger.error('Erreur lors de la recherche de suggestions d\'amis', { userId, error });
        throw error;
    }
};

// Calcul de compatibilité entre deux utilisateurs
const calculateCompatibility = (user1, user2) => {
    const levelDiff = Math.abs(user1.level - user2.level);
    const stepsDiff = Math.abs(user1.totalSteps - user2.totalSteps) / user1.totalSteps;
    
    // Score de 0 à 100
    const levelScore = Math.max(0, 100 - (levelDiff * 20));
    const stepsScore = Math.max(0, 100 - (stepsDiff * 100));
    
    return Math.round((levelScore + stepsScore) / 2);
};

// Obtenir les défis communs avec un ami
const getCommonChallenges = async (userId, friendId) => {
    try {
        const [user, friend] = await Promise.all([
            User.findById(userId),
            User.findById(friendId)
        ]);

        if (!user || !friend) throw new Error('Utilisateur non trouvé');

        // Vérifier si ils sont amis
        if (!user.friends.some(f => f.userId.toString() === friendId)) {
            throw new Error('Utilisateurs non amis');
        }

        const userChallenges = user.challenges.map(c => c.challengeId.toString());
        const friendChallenges = friend.challenges.map(c => c.challengeId.toString());

        // Trouver les défis en commun
        const commonChallengeIds = userChallenges.filter(id => 
            friendChallenges.includes(id)
        );

        const commonChallenges = await Challenge.find({
            _id: { $in: commonChallengeIds }
        });

        return commonChallenges.map(challenge => ({
            challengeId: challenge._id,
            name: challenge.name,
            userProgress: user.challenges.find(c => 
                c.challengeId.toString() === challenge._id.toString()
            ).progress,
            friendProgress: friend.challenges.find(c => 
                c.challengeId.toString() === challenge._id.toString()
            ).progress
        }));
    } catch (error) {
        Logger.error('Erreur lors de la récupération des défis communs', { userId, friendId, error });
        throw error;
    }
};

module.exports = {
    getFriendsLeaderboard,
    getFriendSuggestions,
    getCommonChallenges
}; 