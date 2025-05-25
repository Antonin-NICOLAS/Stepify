// preferencesController.js
const UserModel = require('../models/User');
const { checkAuthorization } = require('../middlewares/VerifyAuthorization');

const updateThemePreference = async (req, res) => {
    const { userId } = req.params;
    const { themePreference } = req.body;

    if (checkAuthorization(req, res, userId)) return;

    try {
        if (!['light', 'dark', 'auto'].includes(themePreference)) {
            return res.status(400).json({
                success: false,
                error: "Préférence de thème invalide"
            });
        }

        const user = await UserModel.findByIdAndUpdate(
            userId,
            { themePreference },
            { new: true }
        ).select('-password -verificationToken');

        res.status(200).json({
            success: true,
            message: 'Préférence de thème mise à jour',
            themePreference: user.themePreference
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: "Erreur lors de la mise à jour du thème"
        });
    }
};

const updateLanguagePreference = async (req, res) => {
    const { userId } = req.params;
    const { languagePreference } = req.body;

    if (checkAuthorization(req, res, userId)) return;

    try {
        // Liste des langues supportées - à adapter selon vos besoins
        const supportedLanguages = ['fr', 'en', 'es', 'de'];
        if (!supportedLanguages.includes(languagePreference)) {
            return res.status(400).json({
                success: false,
                error: "Langue non supportée"
            });
        }

        const user = await UserModel.findByIdAndUpdate(
            userId,
            { languagePreference },
            { new: true }
        ).select('-password -verificationToken');

        res.status(200).json({
            success: true,
            message: 'Préférence linguistique mise à jour',
            languagePreference: user.languagePreference
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: "Erreur lors de la mise à jour de la langue"
        });
    }
};

const updatePrivacySettings = async (req, res) => {
    const { userId } = req.params;
    const {
        showActivityToFriends,
        showStatsPublicly,
        allowFriendRequests
    } = req.body;

    if (checkAuthorization(req, res, userId)) return;

    try {
        const updates = {
            privacySettings: {
                showActivityToFriends: !!showActivityToFriends,
                showStatsPublicly: !!showStatsPublicly,
                allowFriendRequests: !!allowFriendRequests
            }
        };

        const user = await UserModel.findByIdAndUpdate(
            userId,
            updates,
            { new: true }
        ).select('-password -verificationToken');

        res.status(200).json({
            success: true,
            message: 'Paramètres de confidentialité mis à jour',
            privacySettings: user.privacySettings
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: "Erreur lors de la mise à jour des paramètres"
        });
    }
};

const updateNotificationPreferences = async (req, res) => {
    const { userId } = req.params;
    const preferences = req.body;

    if (checkAuthorization(req, res, userId)) return;

    try {
        const validPreferences = {
            activitySummary: typeof preferences.activitySummary === 'boolean' ? preferences.activitySummary : true,
            newChallenges: typeof preferences.newChallenges === 'boolean' ? preferences.newChallenges : true,
            friendRequests: typeof preferences.friendRequests === 'boolean' ? preferences.friendRequests : true,
            goalAchieved: typeof preferences.goalAchieved === 'boolean' ? preferences.goalAchieved : true,
            friendActivity: typeof preferences.friendActivity === 'boolean' ? preferences.friendActivity : true
        };

        await UserModel.findByIdAndUpdate(userId, {
            notificationPreferences: validPreferences
        });

        res.status(200).json({
            success: true,
            message: "Préférences de notification mises à jour",
            preferences: validPreferences
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: "Erreur lors de la mise à jour des préférences"
        });
    }
};

module.exports = {
    updateThemePreference,
    updateLanguagePreference,
    updatePrivacySettings,
    updateNotificationPreferences
};