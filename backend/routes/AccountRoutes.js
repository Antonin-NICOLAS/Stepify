const express = require('express')
const cors = require('cors');
require('dotenv').config();
//middleware
const { verifyToken } = require('../middlewares/VerifyToken')
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

// account
router.get('/:userId/profile', verifyToken, getUserProfile)
router.patch('/:userId/avatar', verifyToken, upload.single('avatar'), updateAvatar);
router.patch('/:userId/profile', verifyToken, updateProfile);
router.patch('/:userId/email', verifyToken, updateEmail);
router.patch('/:userId/daily-goal', verifyToken, updateDailyGoal);
router.patch('/:userId/password', verifyToken, updatePassword);
router.patch('/:userId/status', verifyToken, updateStatus);

// preferences
router.patch('/:userId/theme', verifyToken, updateThemePreference);
router.patch('/:userId/language', verifyToken, updateLanguagePreference);
router.patch('/:userId/privacy', verifyToken, updatePrivacySettings);
router.patch('/:userId/notifications', verifyToken, updateNotificationPreferences);

// sessions
router.get('/:userId/sessions', verifyToken, getActiveSessions);
router.delete('/:userId/sessions/:sessionId', verifyToken, revokeSession);
router.delete('/:userId/sessions', verifyToken, revokeAllSessions);

module.exports = router