const express = require('express')
const cors = require('cors')
require('dotenv').config()
//middleware
const { verifyToken, requireAuth } = require('../middlewares/VerifyToken.js')
const { localization } = require('../middlewares/Localization')
//controllers
const {
  getAllRewards,
  getMyRewards,
  getVitrineRewards,
  setInVitrine,
} = require('../controllers/RewardController')

//router
const router = express.Router()

//middleware
router.use(
  cors({
    credentials: true,
    origin: process.env.FRONTEND_SERVER,
  }),
)
router.use(verifyToken, localization, requireAuth)

//routes
router.get('/:userId/all', getAllRewards)
router.get('/:userId/myrewards', getMyRewards)
router.get('/:userId/vitrine', getVitrineRewards)
router.post('/:userId/:rewardId/setinvitrine', setInVitrine)

module.exports = router
