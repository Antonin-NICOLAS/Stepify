const UserModel = require('../models/UserModel');
const { checkAuthorization } = require('../utils/authUtils');

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

module.exports = {
    addCustomGoal,
    updateCustomGoal,
    deleteCustomGoal
};