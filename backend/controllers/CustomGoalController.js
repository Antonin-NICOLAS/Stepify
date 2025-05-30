const UserModel = require('../models/UserModel');
const Reward = require('../models/Reward');
const { checkAuthorization } = require('../utils/authUtils');
const { NotificationType, createSystemNotification } = require('../utils/NotificationManager');

const addCustomGoal = async (req, res) => {
    const { userId } = req.params;
    const { type, target, time, deadline } = req.body;

    if (checkAuthorization(req, res, userId)) return;

    if (new Date(deadline) <= new Date()) {
        return res.status(400).json({
            success: false,
            error: "La date limite doit être dans le futur"
        });
    }

    // Validate activity type specific requirements
    if (['steps-time', 'distance-time', 'calories-time', 'xp-time'].includes(type) && !time) {
        return res.status(400).json({
            success: false,
            error: `Time is required for activity type: ${type}`
        });
    }

    try {
        const user = await UserModel.findById(userId);

        user.customGoals.push({ type, target, time, deadline });
        await user.save();

        res.status(201).json({
            success: true,
            message: "Objectif personnalisé ajouté",
            goal: user.customGoals[user.customGoals.length - 1]
        });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

const updateCustomGoal = async (req, res) => {
    const { userId, goalId } = req.params;
    const updates = req.body;

    if (checkAuthorization(req, res, userId)) return;

    try {
        const user = await UserModel.findById(userId);
        const goal = user.customGoals.id(goalId);

        if (!goal) {
            return res.status(404).json({
                success: false,
                error: "Objectif non trouvé"
            });
        }

        if (updates.deadline && new Date(updates.deadline) <= new Date()) {
            return res.status(400).json({
                success: false,
                error: "La nouvelle date limite doit être dans le futur"
            });
        }

        Object.assign(goal, updates);
        await user.save();

        res.status(200).json({
            success: true,
            message: "Objectif mis à jour",
            goal
        });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

const deleteCustomGoal = async (req, res) => {
    const { userId, goalId } = req.params;

    if (checkAuthorization(req, res, userId)) return;

    try {
        const user = await UserModel.findById(userId);
        const goal = user.customGoals.id(goalId);

        if (!goal) {
            return res.status(404).json({
                success: false,
                error: "Objectif non trouvé"
            });
        }

        goal.remove();
        await user.save();

        res.status(200).json({
            success: true,
            message: "Objectif supprimé"
        });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

const addCustomGoalFromReward = async (req, res) => {
    try {
        const { rewardId } = req.body;
        const userId = req.user.id;

        // Vérifier si la récompense existe
        const reward = await Reward.findById(rewardId);
        if (!reward) {
            return res.status(404).json({
                success: false,
                error: "Récompense non trouvée"
            });
        }

        // Vérifier si l'utilisateur n'a pas déjà cette récompense
        const user = await UserModel.findById(userId);
        const hasReward = user.rewardsUnlocked.some(r => r.rewardId.equals(rewardId));
        if (hasReward) {
            return res.status(400).json({
                success: false,
                error: "Vous avez déjà débloqué cette récompense"
            });
        }

        // Créer l'objectif personnalisé basé sur la récompense
        const deadline = new Date();
        deadline.setDate(deadline.getDate() + (reward.time || 30)); // 30 jours par défaut si pas de temps spécifié

        const newCustomGoal = {
            type: reward.criteria,
            target: reward.target,
            time: reward.time,
            deadline,
            progress: 0,
            isCompleted: false
        };

        // Ajouter l'objectif à l'utilisateur
        user.customGoals.push(newCustomGoal);
        await user.save();

        // Créer une notification
        await createSystemNotification({
            recipient: userId,
            type: NotificationType.CUSTOM_GOAL_ADDED,
            sender: null,
            content: `Nouvel objectif ajouté : ${reward.name[user.languagePreference] || reward.name.fr}`,
        });

        return res.status(200).json({
            success: true,
            message: "Objectif personnalisé créé avec succès",
            customGoal: newCustomGoal
        });
    } catch (error) {
        console.error('Error adding custom goal from reward:', error);
        return res.status(500).json({
            success: false,
            error: "Erreur lors de la création de l'objectif personnalisé"
        });
    }
};

module.exports = {
    addCustomGoal,
    updateCustomGoal,
    deleteCustomGoal,
    addCustomGoalFromReward
};