const express = require('express')
const cors = require('cors')
require('dotenv').config()
//controllers
const {
  All,
  saveRank,
  ChallengeStatusUpdates,
  DeleteLonelyChallenges,
  RewardUpdates,
  DeleteExpiredNotifications,
  DeleteExpiredSessions,
} = require('../controllers/CronJobs')

//router
const router = express.Router()

//middleware
router.use(
  cors({
    credentials: true,
    origin: process.env.FRONTEND_SERVER,
  }),
)

router.get('/save-rank', saveRank)
router.get('/challenge-status-updates', ChallengeStatusUpdates)
router.get('/reward-updates', RewardUpdates)
router.get('/delete-lonely-challenges', DeleteLonelyChallenges)
router.get('/delete-expired-notifications', DeleteExpiredNotifications)
router.get('/delete-expired-sessions', DeleteExpiredSessions)
router.get('/all', All)

module.exports = router
