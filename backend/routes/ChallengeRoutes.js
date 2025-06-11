const express = require('express')
const cors = require('cors')
require('dotenv').config()
//middleware
const { verifyToken, requireAuth } = require('../middlewares/VerifyToken.js')
const { localization } = require('../middlewares/Localization')
const upload = require('../middlewares/multer')
//controllers
const {
  getPublicChallenges,
  getMyChallenges,
  createChallenge,
  updateChallenge,
  joinChallenge,
  leaveChallenge,
  deleteChallenge,
  getChallengeDetails,
  getChallengeLeaderboard,
} = require('../controllers/ChallengeController')

//router
const router = express.Router()

//middleware
router.use(
  cors({
    credentials: true,
    origin: process.env.FRONTEND_SERVER,
  }),
  localization,
)

router.get('/challenges', getPublicChallenges)
router.get('/:challengeId', getChallengeDetails)
router.get('/:challengeId/leaderboard', getChallengeLeaderboard)

router.use(verifyToken, localization, requireAuth)

//routes
router.get('/:userId/mychallenges', getMyChallenges)
router.post('/:userId/new', createChallenge)

router.put('/:userId/:challengeId/modify', updateChallenge)
router.put('/:userId/join', joinChallenge)
router.put('/:userId/:challengeId/leave', leaveChallenge)

router.delete('/:userId/:challengeId/delete', deleteChallenge)

module.exports = router
