const express = require('express')
const UserModel = require('../models/User')
const {    createUser,
    deleteUser,
    loginUser,
    logoutUser,
    getUserProfile,
    updateAvatar,
    updateUsername,
    updateEmail,
    updatePassword,
    updateStatus,
    updateDailyGoal
} = require('../controllers/UserCtrl')

//router
const router = express.Router()

//routes
router.post('/register', createUser)
router.delete('/:userId/delete', deleteUser)

router.post('/login', loginUser)
router.post('/logout', logoutUser)
router.get('/:userId/profile', getUserProfile)

router.patch('/:userId/avatar', updateAvatar)
router.patch('/:userId/username', updateUsername)
router.patch('/:userId/email', updateEmail)
router.patch('/:userId/password', updatePassword)
router.patch('/:userId/status', updateStatus)
router.patch('/:userId/daily-goal', updateDailyGoal)

module.exports = router