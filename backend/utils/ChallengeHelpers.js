const StepEntry = require('../models/StepEntry');
const User = require('../models/User');
const Challenge = require('../models/Challenge');

const calculateUserProgress = async (userId, challenge) => {
  try {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    const now = new Date();
    const challengeStart = new Date(challenge.startDate);
    const challengeEnd = challenge.endDate ? new Date(challenge.endDate) : null;

    // Vérifier si le challenge est actif
    if (now < challengeStart || (challengeEnd && now > challengeEnd)) {
      return {
        progress: 0,
        completed: false,
        details: { reason: 'Challenge not active' }
      };
    }

    // Calculer la durée écoulée pour les challenges time-based
    let elapsedDays = 1;
    if (challenge.time) {
      elapsedDays = Math.min(
        Math.ceil((now - challengeStart) / (1000 * 60 * 60 * 24)),
        challenge.time
      );
    }

    // Récupérer les données nécessaires selon le type de challenge
    let userValue = 0;
    const details = { activityType: challenge.activityType };

    switch (challenge.activityType) {
      case 'steps':
      case 'steps-time':
        const stepsData = await StepEntry.aggregate([
          {
            $match: {
              user: mongoose.Types.ObjectId(userId),
              date: { $gte: challengeStart, $lte: challengeEnd || now }
            }
          },
          { $group: { _id: null, total: { $sum: "$totalSteps" } } }
        ]);
        userValue = stepsData[0]?.total || 0;
        details.steps = userValue;
        break;

      case 'distance':
      case 'distance-time':
        const distanceData = await StepEntry.aggregate([
          {
            $match: {
              user: mongoose.Types.ObjectId(userId),
              date: { $gte: challengeStart, $lte: challengeEnd || now }
            }
          },
          { $group: { _id: null, total: { $sum: "$totalDistance" } } }
        ]);
        userValue = distanceData[0]?.total || 0;
        details.distance = userValue;
        break;

      case 'calories':
      case 'calories-time':
        const caloriesData = await StepEntry.aggregate([
          {
            $match: {
              user: mongoose.Types.ObjectId(userId),
              date: { $gte: challengeStart, $lte: challengeEnd || now }
            }
          },
          { $group: { _id: null, total: { $sum: "$totalCalories" } } }
        ]);
        userValue = caloriesData[0]?.total || 0;
        details.calories = userValue;
        break;

      case 'xp':
      case 'xp-time':
        userValue = user.totalXP || 0;
        // Pour les challenges XP, on soustrait la valeur initiale
        const participant = challenge.participants.find(p => p.user.toString() === userId);
        const initialXP = participant?.initialXP || userValue;
        userValue -= initialXP;
        details.xp = userValue;
        details.initialXP = initialXP;
        break;

      case 'any':
        // Prend la meilleure progression parmi toutes les métriques
        const [steps, distance, calories] = await Promise.all([
          StepEntry.aggregate([
            {
              $match: {
                user: mongoose.Types.ObjectId(userId),
                date: { $gte: challengeStart, $lte: challengeEnd || now }
              }
            },
            { $group: { _id: null, total: { $sum: "$totalSteps" } } }
          ]),
          StepEntry.aggregate([
            {
              $match: {
                user: mongoose.Types.ObjectId(userId),
                date: { $gte: challengeStart, $lte: challengeEnd || now }
              }
            },
            { $group: { _id: null, total: { $sum: "$totalDistance" } } }
          ]),
          StepEntry.aggregate([
            {
              $match: {
                user: mongoose.Types.ObjectId(userId),
                date: { $gte: challengeStart, $lte: challengeEnd || now }
              }
            },
            { $group: { _id: null, total: { $sum: "$totalCalories" } } }
          ])
        ]);

        const values = [
          steps[0]?.total || 0,
          distance[0]?.total || 0,
          calories[0]?.total || 0,
          user.totalXP || 0
        ];

        userValue = Math.max(...values);
        details.bestMetric = userValue;
        break;

      default:
        throw new Error('Unsupported activity type');
    }

    // Calculer la progression en fonction du type de challenge
    let progress = 0;
    let completed = false;

    if (challenge.activityType.endsWith('-time')) {
      const dailyGoal = challenge.goal;
      const startDate = new Date(challenge.startDate);
      const endDate = challenge.endDate ? new Date(challenge.endDate) : new Date();

      // Pour les nouveaux participants, on ne compte que les jours depuis leur arrivée
      if (participant && participant.joinedAt > startDate) {
        startDate = new Date(participant.joinedAt);
      }

      const achievedDays = await calculateAchievedDays(userId, challenge, dailyGoal, startDate, endDate);
      progress = Math.min(100, (achievedDays / challenge.time) * 100);
      completed = achievedDays >= challenge.time;
      details.achievedDays = achievedDays;
      details.requiredDays = challenge.time;
    } else {
      // Challenges avec objectif global
      progress = Math.min(100, (userValue / challenge.goal) * 100);
      completed = userValue >= challenge.goal;
    }

    return {
      progress: Math.round(progress * 100) / 100, // Arrondi à 2 décimales
      completed,
      details
    };

  } catch (error) {
    console.error('Error calculating user progress:', error);
    return {
      progress: 0,
      completed: false,
      details: { error: error.message }
    };
  }
};

// ChallengeHelpers.js
const updateSingleChallengeProgress = async (userId, challengeId) => {
  try {
    const now = new Date();
    const challenge = await Challenge.findOne({
      _id: challengeId,
      'participants.user': userId,
      status: 'active',
      startDate: { $lte: now },
      $or: [
        { endDate: null },
        { endDate: { $gte: now } }
      ]
    }).populate('participants.user');

    if (!challenge) return;

    const participant = challenge.participants.find(p => p.user._id.toString() === userId);
    if (!participant) return;

    const progressData = await calculateUserProgress(userId, challenge);

    participant.progress = progressData.progress;
    participant.completed = progressData.completed;
    participant.lastUpdated = now;

    if (progressData.completed && !participant.xpEarned) {
      participant.xpEarned = challenge.xpReward;
      await User.findByIdAndUpdate(userId, { $inc: { totalXP: challenge.xpReward } });

      await Notification.create({
        recipient: userId,
        type: 'challenge_complete',
        challenge: challenge._id,
        content: {
          en: `You completed "${challenge.name.en}"! +${challenge.xpReward}XP`,
          fr: `Défi "${challenge.name.fr}" réussi ! +${challenge.xpReward}XP`
        },
        status: 'unread'
      });
    }

    await challenge.save();
  } catch (error) {
    console.error('Single challenge progress update error:', error);
  }
};

/** Calcule le nombre de jours où l'objectif quotidien a été atteint */
const calculateAchievedDays = async (userId, challenge, dailyGoal, startDate, endDate) => {
  // Pour les challenges de type 'xp-time', on utilise les données utilisateur
  if (challenge.activityType === 'xp-time') {
    const xpEntries = await StepEntry.find({
      user: userId,
      date: { $gte: startDate, $lte: endDate }
    }).sort({ date: 1 });

    let currentXP = (await User.findById(userId)).totalXP;
    let achievedDays = 0;

    // Parcourir à rebours pour calculer le gain quotidien
    for (let i = xpEntries.length - 1; i >= 0; i--) {
      const entry = xpEntries[i];
      const prevXP = currentXP - entry.xp;
      const dailyXP = currentXP - prevXP;
      
      if (dailyXP >= dailyGoal) {
        achievedDays++;
      }
      currentXP = prevXP;
    }

    return achievedDays;
  }

  // Pour les autres types time-based
  const aggregation = await StepEntry.aggregate([
    { 
      $match: { 
        user: mongoose.Types.ObjectId(userId),
        date: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
        total: { 
          $sum: getFieldForActivityType(challenge.activityType)
        }
      }
    },
    {
      $match: { total: { $gte: dailyGoal } }
    },
    {
      $count: "achievedDays"
    }
  ]);

  return aggregation[0]?.achievedDays || 0;
};

/**
 * Retourne le champ à agréger selon le type d'activité
 */
const getFieldForActivityType = (activityType) => {
  switch (activityType) {
    case 'steps-time': return '$totalSteps';
    case 'distance-time': return '$totalDistance';
    case 'calories-time': return '$totalCalories';
    default: return '$totalSteps';
  }
};

module.exports = {
  calculateUserProgress,
  updateSingleChallengeProgress
};