const express = require('express')
const cors = require('cors');
require('dotenv').config();
//middleware
const { verifyToken, requireAuth } = require('../middlewares/VerifyToken.js')
const { localization } = require('../middlewares/Localization')
//controllers
const { getGlobalRanking,
    getFriendsRanking,
    getChallengesRanking,
    getRewardsRanking
} = require('../controllers/RankingController');

//router
const router = express.Router()

//middleware
router.use(
    cors({
        credentials: true,
        origin: process.env.FRONTEND_SERVER,
    })
);

router.use(verifyToken, localization, requireAuth)

//routes
router.get('/:userId', getGlobalRanking)
router.get('/:userId/friends', getFriendsRanking)
router.get('/:userId/challenges', getChallengesRanking)
router.get('/:userId/rewards', getRewardsRanking)

module.exports = router