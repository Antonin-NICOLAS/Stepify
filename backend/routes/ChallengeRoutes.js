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
router.get('/:challengeId', getChallengeDetails)
router.post('/:userId/new', verifyToken, createChallenge)

router.put('/:userId/:challengeId/modify', verifyToken, updateChallenge)
router.put('/:userId/join', verifyToken, joinChallenge)
router.put('/:userId/:challengeId/leave', verifyToken, leaveChallenge)

router.delete('/:userId/:challengeId/delete', verifyToken, deleteChallenge)

module.exports = router