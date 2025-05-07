import { useMemo } from "react";

export const useStepsStats = (filteredEntries) => {
    const formatActiveTime = (minutes) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours}h${mins.toString().padStart(2, "0")}`;
    };

    const stats = useMemo(() => {
        if (filteredEntries.length === 0) {
            return {
                totalSteps: 0,
                totalDistance: 0,
                totalCalories: 0,
                totalActiveTime: 0,
                goalAchieved: false,
                goalPercentage: 0,
            };
        }

        const totalSteps = filteredEntries.reduce((sum, entry) => sum + entry.totalSteps, 0);
        const totalDistance = filteredEntries.reduce((sum, entry) => sum + entry.totalDistance, 0);
        const totalCalories = filteredEntries.reduce((sum, entry) => sum + entry.totalCalories, 0);
        const totalActiveTime = filteredEntries.reduce((sum, entry) => sum + entry.totalActiveTime, 0);

        // Assuming a daily goal of 10,000 steps
        const dailyGoal = 10000;
        const averageSteps = totalSteps / filteredEntries.length;
        const goalAchieved = averageSteps >= dailyGoal;
        const goalPercentage = Math.min(100, Math.round((averageSteps / dailyGoal) * 100));

        return {
            totalSteps,
            totalDistance: totalDistance.toFixed(1),
            totalCalories: Math.round(totalCalories),
            totalActiveTime: formatActiveTime(totalActiveTime),
            goalAchieved,
            goalPercentage,
        };
    }, [filteredEntries]);

    return stats;
};