const express = require('express')
const cors = require('cors');
require('dotenv').config();
//middleware
const { verifyToken } = require('../middlewares/VerifyToken')
const { localization } = require('../middlewares/Localization')
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

router.use(verifyToken, localization)

//routes
router.get('/:userId/all', getNotifications);
router.get('/:userId/challenge', getChallengeNotifications);
router.get('/:userId/friends', getFriendsList);
router.get('/:userId/pending-friend-requests', getPendingFriendRequests);

router.patch('/:userId/:notificationId/read', markNotificationAsRead);
router.patch('/:userId/mark-all-read', markAllNotificationsAsRead);

router.post('/:userId/friend-request', sendFriendRequest);
router.post('/:userId/:notificationId/accept-friend', acceptFriendRequest);
router.post('/:userId/:notificationId/cancel-friend', cancelFriendRequest);
router.post('/:userId/:notificationId/decline-friend', declineFriendRequest);
router.post('/:userId/:friendId/remove-friend', removeFriend);
router.post('/:userId/:notificationId/respond', respondToChallengeInvite);

router.get('/:userId/search', searchUsers);

router.delete('/:userId/:notificationId', deleteNotification);

module.exports = router