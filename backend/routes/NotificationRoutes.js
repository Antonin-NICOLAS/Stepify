const express = require('express')
const cors = require('cors');
require('dotenv').config();
//middleware
const { verifyToken } = require('../middlewares/VerifyToken')
//controllers
const { sendFriendRequest,
    acceptFriendRequest,
    respondToChallengeInvite,
    getNotifications,
    getChallengeNotifications,
    markNotificationAsRead,
    //rejectFriendRequest,
    //getFriendRequests,
    //getFriends,
    //removeFriend,
} = require('../controllers/NotificationController')

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
router.get('/:userId/all', verifyToken, getNotifications);
router.get('/:userId/challenge', verifyToken, getChallengeNotifications);

router.patch('/:userId/:notificationId/read', verifyToken, markNotificationAsRead);

router.post('/:userId/friend-request', verifyToken, sendFriendRequest);
router.post('/:userId/:inviteId/accept-friend', verifyToken, acceptFriendRequest);
router.post('/:userId/:inviteId/respond', verifyToken, respondToChallengeInvite);

module.exports = router