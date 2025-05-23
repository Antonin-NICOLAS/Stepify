const Reward = require('../models/Reward');
const User = require('../models/User');
const StepEntry = require('../models/StepEntry');
const { checkAuthorization } = require('../middlewares/VerifyAuthorization')

const getAllRewards = async (req, res) => {

    try {
        const rewards = await Reward.find();

        if (!rewards) {
            return res.status(404).json({ success: false, error: "No reward found" });
        }

        return res.status(200).json({ success: true, rewards });
    } catch (error) {
        console.error("Error fetching rewards:", error);
        return res.status(500).json({ success: false, error: "Internal server error" });
    }
}

const getMyRewards = async (req, res) => {
    const { userId } = req.params;

    if (checkAuthorization(req, res, userId)) return;

    try {
        const user = await User.findById(userId).populate('rewardsUnlocked.rewardId', 'name description iconUrl criteria tier time earnedBy minLevel isInVitrine isRepeatable target');

        if (!user) {
            return res.status(404).json({ success: false, error: "User not found" });
        }

        return res.status(200).json({ success: true, rewards: user.rewardsUnlocked });
    } catch (error) {
        console.error("Error fetching user's rewards:", error);
        return res.status(500).json({ success: false, error: "Internal server error" });
    }
}

/** Main function to check and update all possible rewards for a user */
const updateUserRewards = async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await User.findById(userId).populate('rewardsUnlocked.rewardId');
    if (!user) {
      console.error('User not found');
      return;
    }

    // Get all rewards from database
    const allRewards = await Reward.find({});
    
    // Check each reward type
    for (const reward of allRewards) {
      // Skip level and rank rewards as requested
      if (reward.criteria === 'level' || reward.criteria === 'rank') {
        continue;
      }

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
          shouldAward = await checkStepsReward(user, reward);
          progress = calculateStepsProgress(user, reward);
          console.log('REWARD PAS', reward.tier, 'pas totaux :', user.totalSteps, 'objectif :', reward.target, shouldAward, progress);
          break;
          
        case 'steps-time':
          shouldAward = await checkStepsTimeReward(user, reward);
          progress = calculateStepsTimeProgress(user, reward);
          break;
          
        case 'distance':
          shouldAward = await checkDistanceReward(user, reward);
          progress = calculateDistanceProgress(user, reward);
                    console.log('REWARD DISTANCE', reward.tier, 'distance totaux :', user.totalDistance, 'objectif :', reward.target, shouldAward, progress);
          break;
          
        case 'distance-time':
          shouldAward = await checkDistanceTimeReward(user, reward);
          progress = calculateDistanceTimeProgress(user, reward);
          break;
          
        case 'calories':
          shouldAward = await checkCaloriesReward(user, reward);
          progress = calculateCaloriesProgress(user, reward);
          console.log('REWARD calories', reward.tier, 'objectif :', reward.target, shouldAward, progress);
          break;
          
        case 'calories-time':
          shouldAward = await checkCaloriesTimeReward(user, reward);
          progress = calculateCaloriesTimeProgress(user, reward);
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
const checkStepsReward = async (user, reward) => {
  const entries = await StepEntry.find({ user: user._id });
  const maxStepsInDay = Math.max(...entries.map(entry => entry.totalSteps), 0);
  return maxStepsInDay >= reward.target;
};

const calculateStepsProgress = async (user, reward) => {
  const entries = await StepEntry.find({ user: user._id });
  const maxStepsInDay = Math.max(...entries.map(entry => entry.totalSteps), 0);
  return Math.min(Math.round((maxStepsInDay / reward.target) * 100), 100);
};

// Steps over time rewards
const checkStepsTimeReward = async (user, reward) => {
  const days = reward.time || 7; // default to 7 days if not specified
  const dateThreshold = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  
  const entries = await StepEntry.find({
    user: user._id,
    date: { $gte: dateThreshold }
  });
  
  const totalSteps = entries.reduce((sum, entry) => sum + entry.totalSteps, 0);
  return totalSteps >= reward.target;
};

const calculateStepsTimeProgress = async (user, reward) => {
  const days = reward.time || 7;
  const dateThreshold = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  
  const entries = await StepEntry.find({
    user: user._id,
    date: { $gte: dateThreshold }
  });
  
  const totalSteps = entries.reduce((sum, entry) => sum + entry.totalSteps, 0);
  return Math.min(Math.round((totalSteps / reward.target) * 100), 100);
};

// Distance-based rewards
const checkDistanceReward = async (user, reward) => {
  const entries = await StepEntry.find({ user: user._id });
  const maxDistanceInDay = Math.max(...entries.map(entry => entry.totalDistance), 0);
  return maxDistanceInDay >= reward.target;
};

const calculateDistanceProgress = async (user, reward) => {
  const entries = await StepEntry.find({ user: user._id });
  const maxDistanceInDay = Math.max(...entries.map(entry => entry.totalDistance), 0);
  return Math.min(Math.round((maxDistanceInDay / reward.target) * 100), 100);
};

// Distance over time rewards
const checkDistanceTimeReward = async (user, reward) => {
  const days = reward.time || 7;
  const dateThreshold = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  
  const entries = await StepEntry.find({
    user: user._id,
    date: { $gte: dateThreshold }
  });
  
  const totalDistance = entries.reduce((sum, entry) => sum + entry.totalDistance, 0);
  return totalDistance >= reward.target;
};

const calculateDistanceTimeProgress = async (user, reward) => {
  const days = reward.time || 7;
  const dateThreshold = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  
  const entries = await StepEntry.find({
    user: user._id,
    date: { $gte: dateThreshold }
  });
  
  const totalDistance = entries.reduce((sum, entry) => sum + entry.totalDistance, 0);
  return Math.min(Math.round((totalDistance / reward.target) * 100), 100);
};

// Calories-based rewards
const checkCaloriesReward = async (user, reward) => {
  const entries = await StepEntry.find({ user: user._id });
  const maxCaloriesInDay = Math.max(...entries.map(entry => entry.totalCalories), 0);
  return maxCaloriesInDay >= reward.target;
};

const calculateCaloriesProgress = async (user, reward) => {
  const entries = await StepEntry.find({ user: user._id });
  const maxCaloriesInDay = Math.max(...entries.map(entry => entry.totalCalories), 0);
  return Math.min(Math.round((maxCaloriesInDay / reward.target) * 100), 100);
};

// Calories over time rewards
const checkCaloriesTimeReward = async (user, reward) => {
  const days = reward.time || 7;
  const dateThreshold = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  
  const entries = await StepEntry.find({
    user: user._id,
    date: { $gte: dateThreshold }
  });
  
  const totalCalories = entries.reduce((sum, entry) => sum + entry.totalCalories, 0);
  return totalCalories >= reward.target;
};

const calculateCaloriesTimeProgress = async (user, reward) => {
  const days = reward.time || 7;
  const dateThreshold = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  
  const entries = await StepEntry.find({
    user: user._id,
    date: { $gte: dateThreshold }
  });
  
  const totalCalories = entries.reduce((sum, entry) => sum + entry.totalCalories, 0);
  return Math.min(Math.round((totalCalories / reward.target) * 100), 100);
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

// Friend-based rewards
const checkFriendReward = async (user, reward) => {
  return user.friends.length >= reward.target;
};

const calculateFriendProgress = (user, reward) => {
  return Math.min(Math.round((user.friends.length / reward.target) * 100), 100);
};

// Helper function to get total calories (placeholder - implement based on your data model)
const getTotalCaloriesForUser = async (userId) => {
  const entries = await StepEntry.find({ user: userId });
  console.log(entries.reduce((sum, entry) => sum + (entry.totalCalories || 0), 0));
  return entries.reduce((sum, entry) => sum + (entry.totalCalories || 0), 0);
};

module.exports = {
    getAllRewards,
    getMyRewards,
    updateUserRewards
}