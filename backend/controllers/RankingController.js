const User = require('../models/User')
const Challenge = require('../models/Challenge')
const Reward = require('../models/Reward')
const {
  sendLocalizedError,
  sendLocalizedSuccess,
} = require('../utils/ResponseHelper')

// Récupérer le classement global
const getGlobalRanking = async (req, res) => {
  try {
    // Récupère tous les utilisateurs triés par totalSteps descendant
    const users = await User.find({})
      .sort({ totalSteps: -1 })
      .select(
        'firstName lastName username avatarUrl totalSteps totalDistance totalCalories totalXP level dailyGoal',
      )

    // Ajoute le rang à chaque utilisateur
    const rankedUsers = []
    for (let i = 0; i < users.length; i++) {
      const u = users[i]
      const dailyProgress = await u.calculateTodayProgress()

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
        rank: i + 1,
      })
    }

    return sendLocalizedSuccess(res, null, {}, { ranking: rankedUsers })
  } catch (error) {
    console.error('Error fetching global ranking:', error)
    return sendLocalizedError(res, 500, 'errors.ranking.fetch_error')
  }
}

// Récupérer le classement des amis d'un utilisateur
const getFriendsRanking = async (req, res) => {
  const { userId } = req.params

  try {
    // Récupère l'utilisateur avec ses amis
    const user = await User.findById(userId).populate(
      'friends.userId',
      'firstName lastName username avatarUrl totalSteps totalDistance totalCalories totalXP level dailyGoal',
    )

    if (!user) {
      return sendLocalizedError(res, 404, 'errors.generic.user_not_found')
    }

    // Crée un tableau avec l'utilisateur et ses amis
    const friends = user.friends.map((f) => f.userId)
    const allUsers = [user, ...friends]

    // Trie par totalSteps descendant
    const sortedUsers = allUsers.sort((a, b) => b.totalSteps - a.totalSteps)

    // Ajoute le rang à chaque utilisateur
    const rankedUsers = []
    for (let i = 0; i < sortedUsers.length; i++) {
      const u = sortedUsers[i]
      const dailyProgress = await u.calculateTodayProgress()

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
        rank: i + 1,
      })
    }

    return sendLocalizedSuccess(res, null, {}, { ranking: rankedUsers })
  } catch (error) {
    console.error('Error fetching friends ranking:', error)
    return sendLocalizedError(res, 500, 'errors.ranking.fetch_error')
  }
}

// Récupérer le classement des participants pour les défis d'un utilisateur
const getChallengesRanking = async (req, res) => {
  const { userId } = req.params
  const { sortBy = 'progress' } = req.query // 'progress' ou 'xpEarned'

  try {
    // Récupère tous les défis où l'utilisateur est créateur ou participant
    const challenges = await Challenge.find({
      $or: [{ creator: userId }, { 'participants.user': userId }],
    }).populate(
      'participants.user',
      'firstName lastName fullName username avatarUrl dailyGoal',
    )

    if (!challenges || challenges.length === 0) {
      return sendLocalizedSuccess(res, null, {}, { rankings: [] })
    }

    // Prépare les classements pour chaque défi
    const challengeRankings = challenges.map((challenge) => {
      // Trie les participants selon le critère choisi
      const sortedParticipants = [...challenge.participants].sort((a, b) => {
        if (sortBy === 'xpEarned') {
          return b.xpEarned - a.xpEarned
        }
        return b.progress - a.progress
      })

      // Ajoute le rang à chaque participant
      const rankedParticipants = sortedParticipants.map(
        (participant, index) => ({
          user: {
            _id: participant.user._id,
            firstName: participant.user.firstName,
            lastName: participant.user.lastName,
            fullName: participant.user.fullName,
            username: participant.user.username,
            avatarUrl: participant.user.avatarUrl,
          },
          progress: participant.progress,
          xpEarned: participant.xpEarned,
          rank: index + 1,
          joinedAt: participant.joinedAt,
          completed: participant.completed,
        }),
      )

      return {
        challengeId: challenge._id,
        name: challenge.name,
        description: challenge.description,
        status: challenge.status,
        startDate: challenge.startDate,
        endDate: challenge.endDate,
        participants: rankedParticipants,
      }
    })

    return sendLocalizedSuccess(res, null, {}, { rankings: challengeRankings })
  } catch (error) {
    console.error('Error fetching challenges ranking:', error)
    return sendLocalizedError(res, 500, 'errors.ranking.fetch_error')
  }
}

// Récupérer le classement des participants pour les rewards
const getRewardsRanking = async (req, res) => {
  const { userId } = req.params
  const { sortBy = 'times' } = req.query // 'times' ou 'date' ou 'progress'

  try {
    // Récupère toutes les récompenses qui ont été gagnées par au moins un utilisateur
    const rewards = await Reward.find({
      'earnedBy.0': { $exists: true },
    }).populate(
      'earnedBy.user',
      'firstName lastName fullName username avatarUrl dailyGoal',
    )

    // Récupère tous les utilisateurs qui ont des récompenses (débloquées ou en cours)
    const usersWithRewards = await User.find({
      'rewardsUnlocked.rewardId': { $exists: true },
    }).select(
      '_id firstName lastName fullName username avatarUrl rewardsUnlocked',
    )

    if (!rewards || rewards.length === 0) {
      return sendLocalizedSuccess(res, null, {}, { rankings: [] })
    }

    // Prépare les classements pour chaque récompense
    const rewardRankings = rewards.map((reward) => {
      // Récupère tous les utilisateurs qui ont cette récompense en cours (unlockedAt est null)
      const usersInProgress = usersWithRewards
        .filter((u) =>
          u.rewardsUnlocked.some(
            (r) =>
              r.rewardId.toString() === reward._id.toString() && !r.unlockedAt,
          ),
        )
        .map((u) => {
          const rewardProgress = u.rewardsUnlocked.find(
            (r) => r.rewardId.toString() === reward._id.toString(),
          )
          return {
            user: {
              _id: u._id,
              firstName: u.firstName,
              lastName: u.lastName,
              fullName: u.fullName,
              username: u.username,
              avatarUrl: u.avatarUrl,
            },
            progress: rewardProgress.progress || 0,
            isInProgress: true,
          }
        })

      // Récupère tous les utilisateurs qui ont déjà gagné cette récompense
      const completedUsers = (reward.earnedBy || []).map((earner) => ({
        user: {
          _id: earner.user._id,
          firstName: earner.user.firstName,
          lastName: earner.user.lastName,
          fullName: earner.user.fullName,
          username: earner.user.username,
          avatarUrl: earner.user.avatarUrl,
        },
        times: earner.times,
        date: earner.date,
        progress: 100,
        isCompleted: true,
      }))

      // Combine et trie tous les utilisateurs selon le critère choisi
      let allUsers = [...completedUsers, ...usersInProgress]
      allUsers.sort((a, b) => {
        if (sortBy === 'date' && a.date && b.date) {
          return new Date(b.date) - new Date(a.date)
        } else if (sortBy === 'times') {
          const bTimes = b.times || 0
          const aTimes = a.times || 0
          if (bTimes === aTimes) {
            return b.progress - a.progress
          }
          return bTimes - aTimes
        } else {
          // 'progress'
          return b.progress - a.progress
        }
      })

      // Ajoute le rang à chaque utilisateur
      const rankedUsers = allUsers.map((user, index) => ({
        ...user,
        rank: index + 1,
      }))

      return {
        rewardId: reward._id,
        name: reward.name,
        description: reward.description,
        iconUrl: reward.iconUrl,
        criteria: reward.criteria,
        tier: reward.tier,
        target: reward.target,
        minLevel: reward.minLevel,
        isRepeatable: reward.isRepeatable,
        earners: rankedUsers,
      }
    })

    // Trie les récompenses par tier (du plus prestigieux au moins prestigieux)
    const tierOrder = {
      diamond: 0,
      sapphire: 1,
      ruby: 2,
      platinum: 3,
      gold: 4,
      silver: 5,
      bronze: 6,
    }

    rewardRankings.sort((a, b) => tierOrder[a.tier] - tierOrder[b.tier])

    return sendLocalizedSuccess(res, null, {}, { rankings: rewardRankings })
  } catch (error) {
    console.error('Error fetching rewards ranking:', error)
    return sendLocalizedError(res, 500, 'errors.ranking.fetch_error')
  }
}

// Fonction pour enregistrer l'historique des classements
const saveRankInternal = async () => {
  try {
    // 1. Enregistrement du classement global XP
    const users = await User.find({}).sort({ totalXP: -1 })
    const userRankUpdates = []

    // Gestion des égalités pour le classement global
    let currentRank = 1
    let currentXP = null
    let sameRankCount = 0

    for (let i = 0; i < users.length; i++) {
      const user = users[i]

      // Si c'est un nouveau score XP, on met à jour le rang
      if (user.totalXP !== currentXP) {
        currentRank = i + 1 - sameRankCount
        currentXP = user.totalXP
        sameRankCount = 0
      } else {
        // Même score XP que le précédent, on garde le même rang
        sameRankCount++
      }

      const existingEntryIndex = user.rankingHistory.findIndex(
        (entry) => entry.globalRank === currentRank && !entry.challengeRank,
      )

      if (existingEntryIndex >= 0) {
        user.rankingHistory[existingEntryIndex].time += 0.25
      } else {
        user.rankingHistory.push({
          time: 0.25,
          globalRank: currentRank,
        })
      }
      userRankUpdates.push(user)
    }

    // 2. Enregistrement du classement des défis actifs
    const activeChallenges = await Challenge.find({
      status: 'active',
      'participants.1': { $exists: true }, // Au moins 2 participants
    }).populate('participants.user')

    for (const challenge of activeChallenges) {
      // Trie les participants par progression
      const sortedParticipants = [...challenge.participants].sort(
        (a, b) => b.progress - a.progress,
      )

      // Gestion des égalités pour chaque défi
      let currentRank = 1
      let currentProgress = null
      let sameRankCount = 0

      for (let i = 0; i < sortedParticipants.length; i++) {
        const participant = sortedParticipants[i]

        // Si c'est une nouvelle progression, on met à jour le rang
        if (participant.progress !== currentProgress) {
          currentRank = i + 1 - sameRankCount
          currentProgress = participant.progress
          sameRankCount = 0
        } else {
          // Même progression que le précédent, on garde le même rang
          sameRankCount++
        }

        const user =
          userRankUpdates.find((u) => u._id.equals(participant.user._id)) ||
          (await User.findById(participant.user._id))

        if (!user) continue

        const existingEntryIndex = user.rankingHistory.findIndex(
          (entry) =>
            entry.challengeRank?.equals(challenge._id) &&
            entry.globalRank === currentRank,
        )

        if (existingEntryIndex >= 0) {
          user.rankingHistory[existingEntryIndex].time += 0.25
        } else {
          user.rankingHistory.push({
            time: 0.25,
            globalRank: currentRank,
            challengeRank: challenge._id,
          })
        }

        if (!userRankUpdates.some((u) => u._id.equals(user._id))) {
          userRankUpdates.push(user)
        }
      }
    }

    // 3. Sauvegarde en masse des mises à jour
    await Promise.all(userRankUpdates.map((user) => user.save()))
    console.log('[CRON] Historique du classement enregistré')
  } catch (error) {
    console.error('[CRON] Erreur enregistrement du classement', error)
  }
}

module.exports = {
  getGlobalRanking,
  getFriendsRanking,
  getChallengesRanking,
  getRewardsRanking,
  saveRankInternal,
}
