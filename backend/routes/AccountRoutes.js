const express = require('express')
const cors = require('cors');
require('dotenv').config();
//middleware
const { verifyToken } = require('../middlewares/VerifyToken')
//controllers
const { updateAvatar,
    updateProfile,
    updateEmail,
    updatePassword,
    updateStatus,
    updateDailyGoal,
    updateThemePreference,
    updateLanguagePreference,
    updatePrivacySettings,
    getUserProfile
} = require('../controllers/AccountController')

//router
const router = express.Router()

//middleware
router.use(
    cors({
        credentials: true,
        origin: process.env.FRONTEND_SERVER,
    })
);

//routes
router.patch('/:userId/avatar', verifyToken, updateAvatar)
router.patch('/:userId/updateprofile', verifyToken, updateProfile)
router.patch('/:userId/email', verifyToken, updateEmail)
router.patch('/:userId/password', verifyToken, updatePassword)
router.patch('/:userId/status', verifyToken, updateStatus)
router.patch('/:userId/daily-goal', verifyToken, updateDailyGoal)

router.patch('/:userId/theme', verifyToken, updateThemePreference);
router.patch('/:userId/language', verifyToken, updateLanguagePreference);
router.patch('/:userId/privacy', verifyToken, updatePrivacySettings);
router.get('/:userId/profile', verifyToken, getUserProfile);

module.exports = router