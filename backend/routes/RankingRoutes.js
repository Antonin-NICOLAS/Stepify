const express = require('express')
const cors = require('cors');
require('dotenv').config();
//middleware
const { verifyToken } = require('../middlewares/VerifyToken')
const { localization } = require('../middlewares/Localization')
//controllers
const { getGlobalRanking,
    getFriendsRanking,
    getChallengesRanking
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

router.use(verifyToken, localization)

//routes
router.get('/:userId', getGlobalRanking)
router.get('/:userId/friends', getFriendsRanking)
router.get('/:userId/challenges', getChallengesRanking)

module.exports = router