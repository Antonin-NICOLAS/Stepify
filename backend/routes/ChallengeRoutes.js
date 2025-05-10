const express = require('express')
const cors = require('cors');
require('dotenv').config();
//middleware
const { verifyToken } = require('../middlewares/VerifyToken')
const upload = require('../middlewares/multer')
//controllers
const { getMyChallenges,
    createChallenge,
    updateChallenge,
    joinChallenge,
    updateProgress,
    deleteChallenge,
    getChallengeDetails
} = require('../controllers/ChallengeController')

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
router.get('/:userId/mychallenges', verifyToken, getMyChallenges)
router.post('/:userId/new', verifyToken, createChallenge)
router.put('/:userId/:challengeId/modify', verifyToken, updateChallenge)
router.put('/:userId/:challengeId/join', verifyToken, joinChallenge)
router.get('/:userId/:challengeId', verifyToken, getChallengeDetails)
router.delete('/:userId/:challengeId/delete', verifyToken, deleteChallenge)

module.exports = router