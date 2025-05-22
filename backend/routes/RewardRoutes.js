const express = require('express')
const cors = require('cors');
require('dotenv').config();
//middleware
const { verifyToken } = require('../middlewares/VerifyToken')
//controllers
const { getAllRewards, getMyRewards, updateUserRewards } = require('../controllers/RewardController')

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
router.patch('/:userId/update', verifyToken, updateUserRewards);

router.patch('/:userId/:notificationId/read', verifyToken,);

router.post('/:userId/friend-request', verifyToken,);
router.post('/:userId/:inviteId/accept-friend', verifyToken,);
router.post('/:userId/:inviteId/respond', verifyToken,);

module.exports = router