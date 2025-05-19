const express = require('express')
const cors = require('cors');
require('dotenv').config();
//middleware
const { verifyToken } = require('../middlewares/VerifyToken')
const upload = require('../middlewares/multer')
//controllers
const { getPublicChallenges,
    getMyChallenges,
    createChallenge,
    updateChallenge,
    joinChallenge,
    leaveChallenge,
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
router.get('/challenges', getPublicChallenges)
router.get('/:userId/mychallenges', verifyToken, getMyChallenges)
router.get('/:userId/:challengeId', verifyToken, getChallengeDetails)
router.post('/:userId/new', verifyToken, createChallenge)

router.put('/:userId/:challengeId/modify', verifyToken, updateChallenge)
router.put('/:userId/join', verifyToken, joinChallenge)
router.put('/:userId/:challengeId/leave', verifyToken, leaveChallenge)
router.put('/:userId/:challengeId/progress', verifyToken, updateProgress)

router.delete('/:userId/:challengeId/delete', verifyToken, deleteChallenge)

module.exports = router