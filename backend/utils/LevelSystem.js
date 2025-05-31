// Système de niveaux avec progression exponentielle
const levelThresholds = [
    { level: 1, xp: 500 },
    { level: 2, xp: 1000 },
    { level: 3, xp: 1750 },
    { level: 4, xp: 2750 },
    { level: 5, xp: 4000 },
    { level: 6, xp: 5500 },
    { level: 7, xp: 7250 },
    { level: 8, xp: 9250 },
    { level: 9, xp: 11500 },
    { level: 10, xp: 14000 },
    { level: 11, xp: 16750 },
    { level: 12, xp: 19750 },
    { level: 13, xp: 21000 },
    { level: 14, xp: 23000 },
    { level: 15, xp: 25000 },
    { level: 16, xp: 27500 },
    { level: 17, xp: 30250 },
    { level: 18, xp: 33250 },
    { level: 19, xp: 36500 },
    { level: 20, xp: 40000 },
    { level: 21, xp: 44000 },
    { level: 22, xp: 48250 },
    { level: 23, xp: 52750 },
    { level: 24, xp: 56500 },
    { level: 25, xp: 60000 },
    { level: 26, xp: 65000 },
    { level: 27, xp: 70500 },
    { level: 28, xp: 76500 },
    { level: 29, xp: 87500 },
    { level: 30, xp: 100000 },
    { level: 31, xp: 108000 },
    { level: 32, xp: 116500 },
    { level: 33, xp: 125500 },
    { level: 34, xp: 137500 },
    { level: 35, xp: 150000 },
    { level: 36, xp: 165000 },
    { level: 37, xp: 181000 },
    { level: 38, xp: 198000 },
    { level: 39, xp: 211000 },
    { level: 40, xp: 225000 },
    { level: 41, xp: 245000 },
    { level: 42, xp: 266000 },
    { level: 43, xp: 288000 },
    { level: 44, xp: 306000 },
    { level: 45, xp: 325000 },
    { level: 46, xp: 356000 },
    { level: 47, xp: 389000 },
    { level: 48, xp: 405000 },
    { level: 49, xp: 427000 },
    { level: 50, xp: 450000 }
];

const calculateLevel = (totalXP) => {
    let currentLevel = 0;
    for (const threshold of levelThresholds) {
        if (totalXP >= threshold.xp) {
            currentLevel = threshold.level;
        } else {
            break;
        }
    }
    return currentLevel;
};

const calculateProgress = (totalXP, reward = null) => {
    const currentLevel = calculateLevel(totalXP);
    const currentThreshold = levelThresholds.find(t => t.level === currentLevel);
    if (reward) {
        const nextThreshold = levelThresholds.find(t => t.level === reward.target);
        if (!nextThreshold) return 100;

        const xpForCurrentLevel = currentThreshold ? currentThreshold.xp : 0;
        const xpForNextLevel = nextThreshold.xp;
        const xpProgress = totalXP - xpForCurrentLevel;
        const xpNeeded = xpForNextLevel - xpForCurrentLevel;

        return Math.min(Math.round((xpProgress / xpNeeded) * 100), 100);
    } else {
        const nextThreshold = levelThresholds.find(t => t.level === currentLevel + 1);
        if (!nextThreshold) return 100;

        const xpForCurrentLevel = currentThreshold ? currentThreshold.xp : 0;
        const xpForNextLevel = nextThreshold.xp;
        const xpProgress = totalXP - xpForCurrentLevel;
        const xpNeeded = xpForNextLevel - xpForCurrentLevel;

        return Math.min(Math.round((xpProgress / xpNeeded) * 100), 100);
    }
};

const getXPForNextLevel = (currentLevel) => {
    const nextThreshold = levelThresholds.find(t => t.level === currentLevel + 1);
    return nextThreshold ? nextThreshold.xp : null;
};

module.exports = {
    calculateLevel,
    calculateProgress,
    getXPForNextLevel,
    levelThresholds
}; 