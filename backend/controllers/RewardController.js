const Reward = require('../models/Reward');
const User = require('../models/User');
const StepEntry = require('../models/StepEntry');
const { checkAuthorization } = require('../middlewares/VerifyAuthorization');
const { calculateProgress } = require('../utils/LevelSystem')
const { sendLocalizedError, sendLocalizedSuccess } = require('../utils/ResponseHelper');

const getAllRewards = async (req, res) => {
  try {
    const rewards = await Reward.find();

    if (!rewards) {
      return sendLocalizedError(res, 404, 'errors.rewards.none_found');
    }

    return sendLocalizedSuccess(res, null, {}, { rewards });
  } catch (error) {
    console.error("Error fetching rewards:", error);
    return sendLocalizedError(res, 500, 'errors.rewards.fetch_error');
  }
}

const getMyRewards = async (req, res) => {
  const { userId } = req.params;

  if (checkAuthorization(req, res, userId)) return;

  try {
    const user = await User.findById(userId).populate('rewardsUnlocked.rewardId', 'name description iconUrl criteria tier time earnedBy minLevel isInVitrine isRepeatable target');

    if (!user) {
      return sendLocalizedError(res, 404, 'errors.generic.user_not_found');
    }

    return sendLocalizedSuccess(res, null, {}, { rewards: user.rewardsUnlocked });
  } catch (error) {
    console.error("Error fetching user's rewards:", error);
    return sendLocalizedError(res, 500, 'errors.rewards.fetch_error');
  }
}

const getVitrineRewards = async (req, res) => {
  const { userId } = req.params;

  if (checkAuthorization(req, res, userId)) return;

  try {
    const user = await User.findById(userId)
      .populate('rewardsUnlocked.rewardId', 'name description iconUrl criteria tier')
      .select('rewardsUnlocked');

    if (!user) {
      return sendLocalizedError(res, 404, 'errors.generic.user_not_found');
    }

    const vitrineRewards = user.rewardsUnlocked
      .filter(r => r.isInVitrine)
      .slice(0, 3);

    return sendLocalizedSuccess(res, null, {}, { vitrine: vitrineRewards });
  } catch (error) {
    console.error("Error fetching vitrine rewards:", error);
    return sendLocalizedError(res, 500, 'errors.rewards.fetch_error');
  }
};

const setInVitrine = async (req, res) => {
  const { userId, rewardId } = req.params;

  if (checkAuthorization(req, res, userId)) return;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return sendLocalizedError(res, 404, 'errors.generic.user_not_found');
    }

    const reward = user.rewardsUnlocked.find(r => r.rewardId._id.toString() === rewardId);
    if (!reward) {
      return sendLocalizedError(res, 404, 'errors.rewards.not_found');
    }
    // Toggle isInVitrine status
    reward.isInVitrine === false ? reward.isInVitrine = true : reward.isInVitrine = false
    await user.save();

    return sendLocalizedSuccess(res, 'success.rewards.vitrine_updated');
  } catch (error) {
    console.error('Error updating vitrine status:', error);
    return sendLocalizedError(res, 500, 'errors.rewards.vitrine_update_error');
  }
};

/** Main function to check and update all possible rewards for a user */
const updateUserRewards = async (userId) => {
  try {
    const user = await User.findById(userId).populate('rewardsUnlocked.rewardId');
    if (!user) {
      console.error('User not found');
      return;
    }

    // Get all rewards from database
    const allRewards = await Reward.find({});

    // Get all step entries
    const allStepEntries = await StepEntry.find({ user: user._id }).sort({ date: 1 });

    // Check each reward type
    for (const reward of allRewards) {

      // Check if user meets minimum level requirement
      if (user.level < reward.minLevel) {
        continue;
      }

      // Check if user already has this reward (unless it's repeatable)
      const existingReward = user.rewardsUnlocked.find(r => r.rewardId._id.equals(reward._id));
      if (existingReward && !reward.isRepeatable) {
        continue;
      }

      // Check reward based on its criteria type
      let shouldAward = false;
      let progress = 0;

      switch (reward.criteria) {
        case 'steps':
          shouldAward = await checkStepsReward(reward, allStepEntries);
          progress = await calculateStepsProgress(reward, allStepEntries);
          break;

        case 'steps-time':
          shouldAward = await checkStepsTimeReward(reward, allStepEntries);
          progress = await calculateStepsTimeProgress(reward, allStepEntries);
          break;

        case 'distance':
          shouldAward = await checkDistanceReward(reward, allStepEntries);
          progress = await calculateDistanceProgress(reward, allStepEntries);
          break;

        case 'distance-time':
          shouldAward = await checkDistanceTimeReward(reward, allStepEntries);
          progress = await calculateDistanceTimeProgress(reward, allStepEntries);
          break;

        case 'calories':
          shouldAward = await checkCaloriesReward(reward, allStepEntries);
          progress = await calculateCaloriesProgress(reward, allStepEntries);
          break;

        case 'calories-time':
          shouldAward = await checkCaloriesTimeReward(reward, allStepEntries);
          progress = await calculateCaloriesTimeProgress(reward, allStepEntries);
          break;

        case 'streak':
          shouldAward = await checkStreakReward(user, reward);
          progress = calculateStreakProgress(user, reward);
          break;

        case 'customgoal':
          shouldAward = await checkCustomGoalReward(user, reward);
          progress = calculateCustomGoalProgress(user, reward);
          break;

        case 'challenges':
          shouldAward = await checkChallengesReward(user, reward);
          progress = calculateChallengesProgress(user, reward);
          break;

        case 'challenges-time':
          shouldAward = await checkChallengesTimeReward(user, reward);
          progress = calculateChallengesTimeProgress(user, reward);
          break;

        case 'level':
          shouldAward = await checkLevelReward(user, reward);
          progress = calculateLevelProgress(user, reward);
          break;

        case 'rank':
          shouldAward = await checkRankReward(user, reward);
          progress = calculateRankProgress(user, reward);
          break;

        case 'friend':
          shouldAward = await checkFriendReward(user, reward);
          progress = calculateFriendProgress(user, reward);
          break;

        default:
          console.log(`Unknown reward criteria: ${reward.criteria}`);
      }

      // Update or add the reward to user's unlocked rewards
      if (shouldAward || progress > 0) {
        await updateUserRewardStatus(user, reward, shouldAward, progress);
      }
    }

    console.log(`Rewards updated for user ${userId}`);
  } catch (error) {
    console.error('Error updating user rewards:', error);
  }
};

// Helper function to update user's reward status
const updateUserRewardStatus = async (user, reward, shouldAward, progress) => {
  const existingRewardIndex = user.rewardsUnlocked.findIndex(r => r.rewardId.equals(reward._id));

  if (existingRewardIndex >= 0) {
    // Update existing reward
    if (shouldAward) {
      user.rewardsUnlocked[existingRewardIndex].progress = 100;
      user.rewardsUnlocked[existingRewardIndex].unlockedAt = new Date();
    } else {
      user.rewardsUnlocked[existingRewardIndex].progress = Math.max(
        user.rewardsUnlocked[existingRewardIndex].progress,
        progress
      );
    }
  } else {
    // Add new reward
    user.rewardsUnlocked.push({
      rewardId: reward._id,
      progress: shouldAward ? 100 : progress,
      unlockedAt: shouldAward ? new Date() : null
    });
  }

  // Update the reward's earnedBy array if awarded
  if (shouldAward) {
    const rewardToUpdate = await Reward.findById(reward._id);
    const earnedByEntry = rewardToUpdate.earnedBy.find(e => e.user.equals(user._id));

    if (earnedByEntry) {
      earnedByEntry.times += 1;
      earnedByEntry.date = new Date();
    } else {
      rewardToUpdate.earnedBy.push({
        user: user._id,
        times: 1,
        date: new Date()
      });
    }

    await rewardToUpdate.save();
  }

  await user.save();
};

// Steps-based rewards
const checkStepsReward = async (reward, allStepEntries) => {
  const maxStepsInDay = Math.max(...allStepEntries.map(entry => entry.totalSteps), 0);
  return maxStepsInDay >= reward.target;
};

const calculateStepsProgress = async (reward, allStepEntries) => {
  const maxStepsInDay = Math.max(...allStepEntries.map(entry => entry.totalSteps), 0);
  return Math.min(Math.round((maxStepsInDay / reward.target) * 100), 100);
};

// Steps over time rewards (now checks best historical period)
const checkStepsTimeReward = async (reward, allStepEntries) => {
  const daysRequired = reward.time || 7;

  // Find all periods where the target was met for consecutive days
  let currentStreak = 0;
  let maxStreak = 0;

  for (const entry of allStepEntries) {
    if (entry.totalSteps >= reward.target) {
      currentStreak++;
      maxStreak = Math.max(maxStreak, currentStreak);
    } else {
      currentStreak = 0;
    }
  }

  return maxStreak >= daysRequired;
};

const calculateStepsTimeProgress = async (reward, allStepEntries) => {
  const daysRequired = reward.time || 7;

  let currentStreak = 0;
  let maxStreak = 0;

  for (const entry of allStepEntries) {
    if (entry.totalSteps >= reward.target) {
      currentStreak++;
      maxStreak = Math.max(maxStreak, currentStreak);
    } else {
      currentStreak = 0;
    }
  }

  return Math.min(Math.round((maxStreak / daysRequired) * 100), 100);
};

// Distance-based rewards
const checkDistanceReward = async (reward, allStepEntries) => {
  const maxDistanceInDay = Math.max(...allStepEntries.map(entry => entry.totalDistance), 0);
  return maxDistanceInDay >= reward.target;
};

const calculateDistanceProgress = async (reward, allStepEntries) => {
  const maxDistanceInDay = Math.max(...allStepEntries.map(entry => entry.totalDistance), 0);
  return Math.min(Math.round((maxDistanceInDay / reward.target) * 100), 100);
};

// Distance over time rewards (updated for historical data)
const checkDistanceTimeReward = async (reward, allStepEntries) => {
  const daysRequired = reward.time || 7;

  let currentStreak = 0;
  let maxStreak = 0;

  for (const entry of allStepEntries) {
    if (entry.totalDistance >= reward.target) {
      currentStreak++;
      maxStreak = Math.max(maxStreak, currentStreak);
    } else {
      currentStreak = 0;
    }
  }

  return maxStreak >= daysRequired;
};

const calculateDistanceTimeProgress = async (reward, allStepEntries) => {
  const daysRequired = reward.time || 7;

  let currentStreak = 0;
  let maxStreak = 0;

  for (const entry of allStepEntries) {
    if (entry.totalDistance >= reward.target) {
      currentStreak++;
      maxStreak = Math.max(maxStreak, currentStreak);
    } else {
      currentStreak = 0;
    }
  }

  return Math.min(Math.round((maxStreak / daysRequired) * 100), 100);
};

// Calories-based rewards
const checkCaloriesReward = async (reward, allStepEntries) => {
  const maxCaloriesInDay = Math.max(...allStepEntries.map(entry => entry.totalCalories), 0);
  return maxCaloriesInDay >= reward.target;
};

const calculateCaloriesProgress = async (reward, allStepEntries) => {
  const maxCaloriesInDay = Math.max(...allStepEntries.map(entry => entry.totalCalories), 0);
  return Math.min(Math.round((maxCaloriesInDay / reward.target) * 100), 100);
};

// Calories over time rewards (updated for historical data)
const checkCaloriesTimeReward = async (reward, allStepEntries) => {
  const daysRequired = reward.time || 7;

  let currentStreak = 0;
  let maxStreak = 0;

  for (const entry of allStepEntries) {
    if (entry.totalCalories >= reward.target) {
      currentStreak++;
      maxStreak = Math.max(maxStreak, currentStreak);
    } else {
      currentStreak = 0;
    }
  }

  return maxStreak >= daysRequired;
};

const calculateCaloriesTimeProgress = async (reward, allStepEntries) => {
  const daysRequired = reward.time || 7;

  let currentStreak = 0;
  let maxStreak = 0;

  for (const entry of allStepEntries) {
    if (entry.totalCalories >= reward.target) {
      currentStreak++;
      maxStreak = Math.max(maxStreak, currentStreak);
    } else {
      currentStreak = 0;
    }
  }

  return Math.min(Math.round((maxStreak / daysRequired) * 100), 100);
};

// Streak-based rewards
const checkStreakReward = async (user, reward) => {
  return user.streak.current >= reward.target;
};

const calculateStreakProgress = (user, reward) => {
  return Math.min(Math.round((user.streak.current / reward.target) * 100), 100);
};

// Custom goal rewards
const checkCustomGoalReward = async (user, reward) => {
  return user.totalCustomGoalsCompleted >= reward.target;
};

const calculateCustomGoalProgress = (user, reward) => {
  return Math.min(Math.round((user.totalCustomGoalsCompleted / reward.target) * 100), 100);
};

// Challenges rewards
const checkChallengesReward = async (user, reward) => {
  return user.totalChallengesCompleted >= reward.target;
};

const calculateChallengesProgress = (user, reward) => {
  return Math.min(Math.round((user.totalChallengesCompleted / reward.target) * 100), 100);
};

// Challenges over time rewards
const checkChallengesTimeReward = async (user, reward) => {
  const days = reward.time || 30; // default to 30 days for challenges
  const dateThreshold = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const completedChallenges = user.challenges.filter(c =>
    c.completed && c.lastUpdated >= dateThreshold
  );

  return completedChallenges.length >= reward.target;
};

const calculateChallengesTimeProgress = async (user, reward) => {
  const days = reward.time || 30;
  const dateThreshold = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const completedChallenges = user.challenges.filter(c =>
    c.completed && c.lastUpdated >= dateThreshold
  );

  return Math.min(Math.round((completedChallenges.length / reward.target) * 100), 100);
};

// Level-based rewards
const checkLevelReward = async (user, reward) => {
  return user.level >= reward.target;
};

const calculateLevelProgress = (user, reward) => {
  return calculateProgress(user, reward);
};

//TODO: Rank-based rewards
const checkRankReward = async (user, reward) => {
  return user.level <= reward.target;
};

const calculateRankProgress = (user, reward) => {
  return Math.min(Math.round((reward.target / user.level) * 100), 100);
};

// Friend-based rewards
const checkFriendReward = async (user, reward) => {
  return user.friends.length >= reward.target;
};

const calculateFriendProgress = (user, reward) => {
  return Math.min(Math.round((user.friends.length / reward.target) * 100), 100);
};

module.exports = {
  getAllRewards,
  getMyRewards,
  getVitrineRewards,
  setInVitrine,
  updateUserRewards
}