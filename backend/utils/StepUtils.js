const StepEntry = require('../models/StepEntry');
const User = require('../models/User');

const updateUserStatsAfterImport = async (userId, newEntries) => {
  const user = await User.findById(userId);
  const dailyGoal = user.dailyGoal || 10000;

  const stepsPerDay = {};
  let totalStepsToAdd = 0;
  let distanceToAdd = 0;
  let totalXPToAdd = 0;

  for (const entry of newEntries) {
    const day = entry.day;
    stepsPerDay[day] = (stepsPerDay[day] || 0) + entry.totalSteps;
    totalStepsToAdd += entry.totalSteps || 0;
    distanceToAdd += entry.totalDistance || 0;
    caloriestoAdd += entry.totalCalories || 0;
    totalXPToAdd += entry.xp;
  }

  const updatedDays = Object.keys(stepsPerDay);
  const updatedStreakDays = new Set();

  for (const day of updatedDays) {
    const entries = await StepEntry.find({ user: userId, day });
    const totalForDay = entries.reduce((sum, e) => sum + e.totalSteps, 0);

    if (totalForDay >= dailyGoal) {
      updatedStreakDays.add(day);
    }
  }

  const allStreakDates = [...updatedStreakDays].sort(); // 'YYYY-MM-DD' strings
  let streakCurrent = 0;
  let streakMax = user.streak.max || 0;
  let lastAchieved = user.streak.lastAchieved;
  let startDate = null;
  let endDate = null;

  // Pour reconstituer le streak continu le plus récent
  for (let i = 0; i < allStreakDates.length; i++) {
    const currentDate = new Date(allStreakDates[i]);
    const currentStr = currentDate.toISOString().split('T')[0];

    const prevDate = new Date(currentDate);
    prevDate.setDate(prevDate.getDate() - 1);
    const prevStr = prevDate.toISOString().split('T')[0];

    const wasPrevAchieved = await StepEntry.find({ user: userId, day: prevStr })
      .then(entries => entries.reduce((sum, e) => sum + e.totalSteps, 0) >= dailyGoal);

    if (!wasPrevAchieved) {
      // Nouveau streak
      streakCurrent = 1;
      startDate = currentDate;
    } else {
      streakCurrent++;
    }

    endDate = currentDate;

    if (stepsPerDay[currentStr] >= dailyGoal) {
      lastAchieved = currentDate;
    }

    if (streakCurrent > streakMax) {
      streakMax = streakCurrent;
    }
  }

  await User.findByIdAndUpdate(userId, {
    $inc: {
      totalSteps: totalStepsToAdd,
      totalDistance: distanceToAdd,
      totalCalories: caloriestoAdd,
      totalXP: totalXPToAdd
    },
    $set: {
      'streak.current': streakCurrent,
      'streak.max': streakMax,
      'streak.lastAchieved': lastAchieved,
      'streak.startDate': startDate,
      'streak.endDate': endDate
    }
  });
};

const updateUserStats = async (userId) => {
  const user = await User.findById(userId);
  const dailyGoal = user.dailyGoal || 10000;

  const entries = await StepEntry.find({ user: userId });

  let totalSteps = 0;
  let totalXP = 0;
  let totalDistance = 0;
  let totalCalories = 0;
  let totalActiveTime = 0;

  const stepsPerDay = {};

  for (const entry of entries) {
    totalSteps += entry.totalSteps;
    totalXP += entry.xp;
    totalDistance += entry.totalDistance;
    totalCalories += entry.totalCalories || 0;
    totalActiveTime += entry.totalActiveTime || 0;

    const day = entry.day;
    stepsPerDay[day] = (stepsPerDay[day] || 0) + entry.totalSteps;
  }

  // === Calcul du streak ===
  const allDates = Object.keys(stepsPerDay)
    .filter(day => stepsPerDay[day] >= dailyGoal)
    .sort(); // 'YYYY-MM-DD'

  let streakCurrent = 0;
  let streakMax = 0;
  let lastAchieved = null;
  let startDate = null;
  let endDate = null;

  for (let i = 0; i < allDates.length; i++) {
    const currentDate = new Date(allDates[i]);
    const prevDate = new Date(currentDate);
    prevDate.setDate(prevDate.getDate() - 1);

    const prevStr = prevDate.toISOString().split('T')[0];

    const isConsecutive = allDates.includes(prevStr);

    if (!isConsecutive) {
      // Nouveau streak
      streakCurrent = 1;
      startDate = currentDate;
    } else {
      streakCurrent++;
    }

    endDate = currentDate;
    lastAchieved = currentDate;

    if (streakCurrent > streakMax) {
      streakMax = streakCurrent;
    }
  }

  await User.findByIdAndUpdate(userId, {
    totalSteps,
    totalXP,
    totalDistance,
    totalCalories,
    totalActiveTime,
    'streak.current': streakCurrent,
    'streak.max': streakMax,
    'streak.lastAchieved': lastAchieved,
    'streak.startDate': startDate,
    'streak.endDate': endDate
  });
};

module.exports = { updateUserStats, updateUserStatsAfterImport };