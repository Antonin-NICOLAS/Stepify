const UserModel = require('../models/UserModel');
const Reward = require('../models/Reward');
const { checkAuthorization } = require('../utils/authUtils');
const { NotificationType, createSystemNotification } = require('../utils/NotificationManager');
const { sendLocalizedError, sendLocalizedSuccess } = require('../utils/ResponseHelper');

const addCustomGoal = async (req, res) => {
    const { userId } = req.params;
    const { type, target, time, deadline } = req.body;

    if (checkAuthorization(req, res, userId)) return;

    if (new Date(deadline) <= new Date()) {
        return sendLocalizedError(res, 400, 'errors.goals.future_deadline_required');
    }

    // Validate activity type specific requirements
    if (['steps-time', 'distance-time', 'calories-time', 'xp-time'].includes(type) && !time) {
        return sendLocalizedError(res, 400, 'errors.goals.time_required', { type });
    }

    try {
        const user = await UserModel.findById(userId);

        user.customGoals.push({ type, target, time, deadline });
        await user.save();

        return sendLocalizedSuccess(res, 'success.goals.created', {}, {
            goal: user.customGoals[user.customGoals.length - 1]
        });
    } catch (error) {
        console.error('Error adding custom goal:', error);
        return sendLocalizedError(res, 500, 'errors.goals.creation_error');
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
            return sendLocalizedError(res, 404, 'errors.goals.not_found');
        }

        if (updates.deadline && new Date(updates.deadline) <= new Date()) {
            return sendLocalizedError(res, 400, 'errors.goals.future_deadline_required');
        }

        Object.assign(goal, updates);
        await user.save();

        return sendLocalizedSuccess(res, 'success.goals.updated', {}, { goal });
    } catch (error) {
        console.error('Error updating custom goal:', error);
        return sendLocalizedError(res, 500, 'errors.goals.update_error');
    }
};

const deleteCustomGoal = async (req, res) => {
    const { userId, goalId } = req.params;

    if (checkAuthorization(req, res, userId)) return;

    try {
        const user = await UserModel.findById(userId);
        const goal = user.customGoals.id(goalId);

        if (!goal) {
            return sendLocalizedError(res, 404, 'errors.goals.not_found');
        }

        goal.remove();
        await user.save();

        return sendLocalizedSuccess(res, 'success.goals.deleted');
    } catch (error) {
        console.error('Error deleting custom goal:', error);
        return sendLocalizedError(res, 500, 'errors.goals.delete_error');
    }
};

const addCustomGoalFromReward = async (req, res) => {
    try {
        const { rewardId } = req.body;
        const userId = req.user.id;

        // Vérifier si la récompense existe
        const reward = await Reward.findById(rewardId);
        if (!reward) {
            return sendLocalizedError(res, 404, 'errors.rewards.not_found');
        }

        // Vérifier si l'utilisateur n'a pas déjà cette récompense
        const user = await UserModel.findById(userId);
        const hasReward = user.rewardsUnlocked.some(r => r.rewardId.equals(rewardId));
        if (hasReward) {
            return sendLocalizedError(res, 400, 'errors.rewards.already_unlocked');
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
            content: {
                en: `New goal added: ${reward.name[user.languagePreference] || reward.name.en}`,
                fr: `Nouvel objectif ajouté : ${reward.name[user.languagePreference] || reward.name.fr}`,
                es: `Nuevo objetivo añadido: ${reward.name[user.languagePreference] || reward.name.es}`,
                de: `Neues Ziel hinzugefügt: ${reward.name[user.languagePreference] || reward.name.de}`
            }
        });

        return sendLocalizedSuccess(res, 'success.goals.created_from_reward', {}, { customGoal: newCustomGoal });
    } catch (error) {
        console.error('Error adding custom goal from reward:', error);
        return sendLocalizedError(res, 500, 'errors.goals.creation_error');
    }
};

module.exports = {
    addCustomGoal,
    updateCustomGoal,
    deleteCustomGoal,
    addCustomGoalFromReward
};