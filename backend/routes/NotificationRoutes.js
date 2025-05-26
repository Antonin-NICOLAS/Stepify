const express = require('express')
const cors = require('cors');
require('dotenv').config();
//middleware
const { verifyToken } = require('../middlewares/VerifyToken')
//controllers
const {
    searchUsers,
    sendFriendRequest,
    acceptFriendRequest,
    cancelFriendRequest,
    declineFriendRequest,
    removeFriend,
    deleteNotification,
    markAllNotificationsAsRead,
    respondToChallengeInvite,
    markNotificationAsRead,
    getNotifications,
    getChallengeNotifications,
    getFriendsList,
    getPendingFriendRequests,
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
router.get('/:userId/friends', verifyToken, getFriendsList);
router.get('/:userId/pending-friend-requests', verifyToken, getPendingFriendRequests);

router.patch('/:userId/:notificationId/read', verifyToken, markNotificationAsRead);
router.patch('/:userId/mark-all-read', verifyToken, markAllNotificationsAsRead);

router.post('/:userId/friend-request', verifyToken, sendFriendRequest);
router.post('/:userId/:notificationId/accept-friend', verifyToken, acceptFriendRequest);
router.post('/:userId/:notificationId/cancel-friend', verifyToken, cancelFriendRequest);
router.post('/:userId/:notificationId/decline-friend', verifyToken, declineFriendRequest);
router.post('/:userId/:friendId/remove-friend', verifyToken, removeFriend);
router.post('/:userId/:notificationId/respond', verifyToken, respondToChallengeInvite);

router.get('/:userId/search', verifyToken, searchUsers);

router.delete('/:userId/:notificationId', verifyToken, deleteNotification);

module.exports = router