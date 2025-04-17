const express = require('express')
const cors = require('cors');
require('dotenv').config();
const UserModel = require('../models/User')
const { createUser,
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
router.delete('/:userId/delete', deleteUser)

router.post('/login', loginUser)
//router.post('/forgotpassword', forgotPassword)
router.post('/logout', logoutUser)
router.get('/profile', getUserProfile)
const checkCookie = (req, res) => {
    console.log("Cookies reçus :", req.cookies);
    res.send("Vérifié !");
};

router.get("/check-cookie", checkCookie);

router.patch('/:userId/avatar', updateAvatar)
router.patch('/:userId/username', updateUsername)
router.patch('/:userId/email', updateEmail)
router.patch('/:userId/password', updatePassword)
router.patch('/:userId/status', updateStatus)
router.patch('/:userId/daily-goal', updateDailyGoal)

module.exports = router