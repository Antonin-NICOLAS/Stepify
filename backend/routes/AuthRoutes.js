const express = require('express')
const cors = require('cors');
require('dotenv').config();
const { createUser,
    verifyEmail,
    deleteUser,
    loginUser,
    forgotPassword,
    resetPassword,
    logoutUser,
    getUserProfile,
    updateAvatar,
    updateUsername,
    updateEmail,
    updatePassword,
    updateStatus,
    updateDailyGoal
} = require('../controllers/AuthController')

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
router.post('/register', createUser)
router.post('/verify-email', verifyEmail)
router.delete('/:userId/delete', deleteUser)

router.post('/login', loginUser)
router.post('/forgot-password', forgotPassword)
router.post('/reset-password/:token', resetPassword)
router.post('/logout', logoutUser)
router.get('/profile', getUserProfile)

router.patch('/:userId/avatar', updateAvatar)
router.patch('/:userId/username', updateUsername)
router.patch('/:userId/email', updateEmail)
router.patch('/:userId/password', updatePassword)
router.patch('/:userId/status', updateStatus)
router.patch('/:userId/daily-goal', updateDailyGoal)

module.exports = router