const express = require('express')
const cors = require('cors');
require('dotenv').config();
//middleware
const { verifyToken, requireAuth } = require('../middlewares/VerifyToken')
const { localization } = require('../middlewares/Localization')
//controllers
const {
    getFriends,
    getFriendRequests,
    searchUsers,
    removeFriend,
} = require('../controllers/FriendController')

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
router.get('/:userId/friends', getFriends);
router.get('/:userId/search',  searchUsers);
router.get('/:userId/requests', getFriendRequests);
router.post('/:userId/:friendId/remove-friend', removeFriend);

module.exports = router