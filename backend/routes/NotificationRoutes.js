const express = require('express')
const cors = require('cors');
require('dotenv').config();
//middleware
const { verifyToken, requireAuth } = require('../middlewares/VerifyToken.js')
const { localization } = require('../middlewares/Localization')
//controllers
const {
    sendFriendRequest,
    acceptFriendRequest,
    cancelFriendRequest,
    declineFriendRequest,
    deleteNotification,
    markAllNotificationsAsRead,
    respondToChallengeInvite,
    markNotificationAsRead,
    getNotifications,
    getChallengeNotifications,
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

router.use(verifyToken, localization, requireAuth)

//routes
router.get('/:userId/all', getNotifications);
router.get('/:userId/challenge', getChallengeNotifications);

router.patch('/:userId/:notificationId/read', markNotificationAsRead);
router.patch('/:userId/mark-all-read', markAllNotificationsAsRead);

router.post('/:userId/friend-request', sendFriendRequest);
router.post('/:userId/:notificationId/accept-friend', acceptFriendRequest);
router.post('/:userId/:notificationId/cancel-friend', cancelFriendRequest);
router.post('/:userId/:notificationId/decline-friend', declineFriendRequest);
router.post('/:userId/:notificationId/respond', respondToChallengeInvite);

router.delete('/:userId/:notificationId', deleteNotification);

module.exports = router