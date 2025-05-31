const User = require('../models/User');
const Challenge = require('../models/Challenge');
const { sendLocalizedError, sendLocalizedSuccess } = require('../utils/ResponseHelper');

// Récupérer le classement global
const getGlobalRanking = async (req, res) => {
  try {
    // Récupère tous les utilisateurs triés par totalSteps descendant
    const users = await User.find({})
      .sort({ totalSteps: -1 })
      .select('firstName lastName username avatarUrl totalSteps totalDistance totalCalories totalXP level dailyGoal');

    // Ajoute le rang à chaque utilisateur
    const rankedUsers = [];
    for (let i = 0; i < users.length; i++) {
      const u = users[i];
      const dailyProgress = await u.calculateTodayProgress();

      rankedUsers.push({
        _id: u._id,
        firstName: u.firstName,
        lastName: u.lastName,
        fullName: u.fullName,
        username: u.username,
        avatarUrl: u.avatarUrl,
        totalSteps: u.totalSteps,
        totalDistance: u.totalDistance,
        totalCalories: u.totalCalories,
        totalXP: u.totalXP,
        dailyProgress,
        level: u.level,
        rank: i + 1
      });
    }

    return sendLocalizedSuccess(res, null, {}, { ranking: rankedUsers });
  } catch (error) {
    console.error("Error fetching global ranking:", error);
    return sendLocalizedError(res, 500, 'errors.ranking.fetch_error');
  }
};

// Récupérer le classement des amis d'un utilisateur
const getFriendsRanking = async (req, res) => {
  const { userId } = req.params;

  try {
    // Récupère l'utilisateur avec ses amis
    const user = await User.findById(userId)
      .populate('friends.userId', 'firstName lastName username avatarUrl totalSteps totalDistance totalCalories totalXP level dailyGoal');

    if (!user) {
      return sendLocalizedError(res, 404, 'errors.generic.user_not_found');
    }

    // Crée un tableau avec l'utilisateur et ses amis
    const friends = user.friends.map(f => f.userId);
    const allUsers = [user, ...friends];

    // Trie par totalSteps descendant
    const sortedUsers = allUsers.sort((a, b) => b.totalSteps - a.totalSteps);

    // Ajoute le rang à chaque utilisateur
    const rankedUsers = [];
    for (let i = 0; i < sortedUsers.length; i++) {
      const u = sortedUsers[i];
      const dailyProgress = await u.calculateTodayProgress();

      rankedUsers.push({
        _id: u._id,
        firstName: u.firstName,
        lastName: u.lastName,
        fullName: u.fullName,
        username: u.username,
        avatarUrl: u.avatarUrl,
        totalSteps: u.totalSteps,
        totalDistance: u.totalDistance,
        totalCalories: u.totalCalories,
        totalXP: u.totalXP,
        dailyProgress,
        level: u.level,
        rank: i + 1
      });
    }

    return sendLocalizedSuccess(res, null, {}, { ranking: rankedUsers });
  } catch (error) {
    console.error("Error fetching friends ranking:", error);
    return sendLocalizedError(res, 500, 'errors.ranking.fetch_error');
  }
};

// Récupérer le classement des participants pour les défis d'un utilisateur
const getChallengesRanking = async (req, res) => {
  const { userId } = req.params;
  const { sortBy = 'progress' } = req.query; // 'progress' ou 'xpEarned'

  try {
    // Récupère tous les défis où l'utilisateur est créateur ou participant
    const challenges = await Challenge.find({
      $or: [
        { creator: userId },
        { 'participants.user': userId }
      ]
    }).populate('participants.user', 'firstName lastName fullName username avatarUrl dailyGoal');

    if (!challenges || challenges.length === 0) {
      return sendLocalizedSuccess(res, null, {}, { rankings: [] });
    }

    // Prépare les classements pour chaque défi
    const challengeRankings = challenges.map(challenge => {
      // Trie les participants selon le critère choisi
      const sortedParticipants = [...challenge.participants].sort((a, b) => {
        if (sortBy === 'xpEarned') {
          return b.xpEarned - a.xpEarned;
        }
        return b.progress - a.progress;
      });

      // Ajoute le rang à chaque participant
      const rankedParticipants = sortedParticipants.map((participant, index) => ({
        user: {
          _id: participant.user._id,
          firstName: participant.user.firstName,
          lastName: participant.user.lastName,
          fullName: participant.user.fullName,
          username: participant.user.username,
          avatarUrl: participant.user.avatarUrl
        },
        progress: participant.progress,
        xpEarned: participant.xpEarned,
        rank: index + 1,
        joinedAt: participant.joinedAt,
        completed: participant.completed
      }));

      return {
        challengeId: challenge._id,
        name: challenge.name,
        status: challenge.status,
        startDate: challenge.startDate,
        endDate: challenge.endDate,
        participants: rankedParticipants
      };
    });

    return sendLocalizedSuccess(res, null, {}, { rankings: challengeRankings });
  } catch (error) {
    console.error("Error fetching challenges ranking:", error);
    return sendLocalizedError(res, 500, 'errors.ranking.fetch_error');
  }
};

// Fonction pour enregistrer l'historique des classements
const recordRankingHistory = async () => {
  try {
    const users = await User.find({}).sort({ totalSteps: -1 });
    for (let i = 0; i < users.length; i++) {
      const user = users[i];

      const existingEntryIndex = user.rankingHistory.findIndex(
        entry => entry.globalRank === i + 1
      );

      if (existingEntryIndex >= 0) {
        user.rankingHistory[existingEntryIndex].time += 1;
      } else {
        user.rankingHistory.push({
          time: 1,
          globalRank: i + 1
        });
      }

      await user.save();
    }

    console.log('Ranking history recorded successfully');
  } catch (error) {
    console.error('Error recording ranking history:', error);
  }
};

module.exports = {
  getGlobalRanking,
  getFriendsRanking,
  getChallengesRanking,
  recordRankingHistory
};