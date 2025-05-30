const User = require('../models/User');

// Récupérer le classement global
const getGlobalRanking = async (req, res) => {
  try {
    // Récupère tous les utilisateurs triés par totalSteps descendant
    const users = await User.find({})
      .sort({ totalSteps: -1 })
      .select('firstName lastName username avatarUrl totalSteps totalDistance totalCalories totalXP level');

    // Ajoute le rang à chaque utilisateur
    const rankedUsers = users.map((user, index) => ({
      ...user.toObject(),
      rank: index + 1
    }));

    return res.status(200).json({ success: true, ranking: rankedUsers });
  } catch (error) {
    console.error("Error fetching global ranking:", error);
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
};

// Récupérer le classement des amis d'un utilisateur
const getFriendsRanking = async (req, res) => {
  const { userId } = req.params;

  try {
    // Récupère l'utilisateur avec ses amis
    const user = await User.findById(userId)
      .populate('friends.userId', 'firstName lastName username avatarUrl totalSteps totalDistance totalCalories totalXP level');

    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    // Crée un tableau avec l'utilisateur et ses amis
    const friends = user.friends.map(f => f.userId);
    const allUsers = [user, ...friends];

    // Trie par totalSteps descendant
    const sortedUsers = allUsers.sort((a, b) => b.totalSteps - a.totalSteps);

    // Ajoute le rang à chaque utilisateur
    const rankedUsers = sortedUsers.map((user, index) => ({
      ...user.toObject(),
      rank: index + 1
    }));

    return res.status(200).json({ success: true, ranking: rankedUsers });
  } catch (error) {
    console.error("Error fetching friends ranking:", error);
    return res.status(500).json({ success: false, error: "Internal server error" });
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
  recordRankingHistory
};