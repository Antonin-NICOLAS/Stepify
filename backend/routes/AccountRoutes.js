const express = require('express')
const cors = require('cors');
require('dotenv').config();
//middleware
const { verifyToken, requireAuth } = require('../middlewares/VerifyToken')
const { localization } = require('../middlewares/Localization')
const upload = require('../middlewares/multer');
//controllers
const { updateAvatar,
    updateProfile,
    updateEmail,
    updatePassword,
    updateStatus,
    updateDailyGoal,
    getUserProfile,
    getActiveSessions,
    revokeSession,
    revokeAllSessions
} = require('../controllers/AccountController')
const {
    updateLanguagePreference,
    updateThemePreference,
    updatePrivacySettings,
    updateNotificationPreferences
} = require('../controllers/PreferencesController')

//router
const router = express.Router()

//middleware
router.use(
    cors({
        credentials: true,
        origin: process.env.FRONTEND_SERVER,
    })
);
router.use(verifyToken, localization, requireAuth)

// account
router.get('/:userId/profile', getUserProfile)
router.patch('/:userId/avatar', upload.single('avatar'), updateAvatar);
router.patch('/:userId/updateprofile', updateProfile);
router.patch('/:userId/email', updateEmail);
router.patch('/:userId/daily-goal', updateDailyGoal);
router.patch('/:userId/password', updatePassword);
router.patch('/:userId/status', updateStatus);

// preferences
router.patch('/:userId/theme', updateThemePreference);
router.patch('/:userId/language', updateLanguagePreference);
router.patch('/:userId/privacy', updatePrivacySettings);
router.patch('/:userId/notifications', updateNotificationPreferences);

// sessions
router.get('/:userId/sessions', getActiveSessions);
router.delete('/:userId/sessions/:sessionId', revokeSession);
router.delete('/:userId/sessions', revokeAllSessions);

module.exports = router