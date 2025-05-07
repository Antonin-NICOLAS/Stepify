const express = require('express')
const cors = require('cors');
require('dotenv').config();
//middleware
const { verifyToken } = require('../middlewares/VerifyToken')
const upload = require('../middlewares/multer')
//controllers
const { getMySteps,
    createStepEntry,
    updateStepEntry,
    FavoriteStepEntry,
    deleteStepEntry,
    importHealthData
} = require('../controllers/StepController')

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
router.get('/:userId/mysteps', verifyToken, getMySteps)
router.post('/:userId/new', verifyToken, createStepEntry)
router.put('/:userId/:entryId/modify', verifyToken, updateStepEntry)
router.put('/:userId/:entryId/favorite', verifyToken, FavoriteStepEntry)
router.delete('/:userId/:entryId/delete', verifyToken, deleteStepEntry)
router.post('/:userId/import', verifyToken, upload.single('exported-data'), importHealthData)

module.exports = router