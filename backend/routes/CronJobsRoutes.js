const express = require('express')
const cors = require('cors');
require('dotenv').config();
//controllers
const {
    All,
    saveRank,
    ChallengeStatusUpdates,
    DeleteLonelyChallenges,
    DailyRewardUpdates,
    DeleteExpiredNotifications
} = require('../controllers/CronJobs')

//router
const router = express.Router()

//middleware
router.use(
    cors({
        credentials: true,
        origin: process.env.FRONTEND_SERVER,
    }),
);

router.get('/save-rank', saveRank)
router.get('/all', All)

module.exports = router