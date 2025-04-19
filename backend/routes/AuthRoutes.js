const express = require('express')
const cors = require('cors');
require('dotenv').config();
//middleware
const { verifyToken } = require('../middlewares/VerifyToken')
//controllers
const { createUser,
    verifyEmail,
    resendVerificationEmail,
    ChangeVerificationEmail,
    deleteUser,
    loginUser,
    forgotPassword,
    resetPassword,
    logoutUser,
    checkAuth
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
router.post('/resend-verification-code', resendVerificationEmail)
router.post("/change-verification-email", verifyToken, ChangeVerificationEmail);

router.delete('/:userId/delete', deleteUser)

router.post('/login', loginUser)
router.post('/forgot-password', forgotPassword)
router.post('/reset-password/:token', resetPassword)
router.post('/logout', logoutUser)

router.get('/check-auth', verifyToken, checkAuth)

module.exports = router