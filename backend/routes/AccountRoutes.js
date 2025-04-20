const express = require('express')
const cors = require('cors');
require('dotenv').config();
//middleware
const { verifyToken } = require('../middlewares/VerifyToken')
//controllers
const { updateAvatar,
    updateUsername,
    updateEmail,
    updatePassword,
    updateStatus,
    updateDailyGoal
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
router.patch('/:userId/avatar', updateAvatar)
router.patch('/:userId/username', updateUsername)
router.patch('/:userId/email', verifyToken, updateEmail)
router.patch('/:userId/password', verifyToken, updatePassword)
router.patch('/:userId/status', updateStatus)
router.patch('/:userId/daily-goal', updateDailyGoal)

module.exports = router