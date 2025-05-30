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
    { level: 15, xp: 25000 },
    { level: 20, xp: 40000 },
    { level: 25, xp: 60000 },
    { level: 30, xp: 100000 },
    { level: 35, xp: 150000 },
    { level: 40, xp: 225000 },
    { level: 45, xp: 325000 },
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

const calculateProgress = (totalXP) => {
    const currentLevel = calculateLevel(totalXP);
    const currentThreshold = levelThresholds.find(t => t.level === currentLevel);
    const nextThreshold = levelThresholds.find(t => t.level === currentLevel + 1);
    
    if (!nextThreshold) return 100; // Max level atteint
    
    const xpForCurrentLevel = currentThreshold ? currentThreshold.xp : 0;
    const xpForNextLevel = nextThreshold.xp;
    const xpProgress = totalXP - xpForCurrentLevel;
    const xpNeeded = xpForNextLevel - xpForCurrentLevel;
    
    return Math.min(Math.round((xpProgress / xpNeeded) * 100), 100);
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