const express = require('express')
const cors = require('cors');
require('dotenv').config();
//middleware
const { verifyToken } = require('../middlewares/VerifyToken')
//controllers
const { getAllRewards, getMyRewards, getVitrineRewards, setInVitrine } = require('../controllers/RewardController')

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
router.get('/:userId/all', verifyToken, getAllRewards);
router.get('/:userId/myrewards', verifyToken, getMyRewards);
router.get('/:userId/vitrine', verifyToken, getVitrineRewards);
router.post('/:userId/:rewardId/setinvitrine', verifyToken, setInVitrine);

module.exports = router