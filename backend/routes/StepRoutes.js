const express = require('express')
const cors = require('cors')
require('dotenv').config()
//middleware
const { verifyToken, requireAuth } = require('../middlewares/VerifyToken.js')
const { localization } = require('../middlewares/Localization')
const upload = require('../middlewares/multer')
//controllers
const {
  getMySteps,
  createStepEntry,
  updateStepEntry,
  FavoriteStepEntry,
  deleteStepEntry,
  importHealthData,
} = require('../controllers/StepController')

//router
const router = express.Router()

//middleware
router.use(
  cors({
    credentials: true,
    origin: process.env.FRONTEND_SERVER,
  })
)

router.use(verifyToken, localization, requireAuth)

//routes
router.get('/:userId/mysteps', getMySteps)
router.post('/:userId/new', createStepEntry)
router.put('/:userId/:entryId/modify', updateStepEntry)
router.put('/:userId/:entryId/favorite', FavoriteStepEntry)
router.delete('/:userId/:entryId/delete', deleteStepEntry)
router.post('/:userId/import', upload.single('exported-data'), importHealthData)

module.exports = router
