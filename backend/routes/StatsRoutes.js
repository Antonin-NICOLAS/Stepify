const express = require('express');
const cors = require('cors');
const { verifyToken } = require('../middlewares/VerifyToken');
const StatsController = require('../controllers/StatsController');
const Logger = require('../logs/Logger');

//router
const router = express.Router()

//middleware
router.use(
    cors({
        credentials: true,
        origin: process.env.FRONTEND_SERVER,
    })
);

// Routes pour les statistiques
router.get('/daily-averages/:days', verifyToken, async (req, res) => {
    try {
        const days = parseInt(req.params.days) || 30;
        const averages = await StatsController.calculateDailyAverages(req.userId, days);
        res.json({ success: true, data: averages });
    } catch (error) {
        Logger.error('Erreur lors de la récupération des moyennes journalières', { error });
        res.status(500).json({ success: false, message: error.message });
    }
});

router.get('/weekly-progress', verifyToken, async (req, res) => {
    try {
        const progress = await StatsController.calculateWeeklyProgress(req.userId);
        res.json({ success: true, data: progress });
    } catch (error) {
        Logger.error('Erreur lors de la récupération de la progression hebdomadaire', { error });
        res.status(500).json({ success: false, message: error.message });
    }
});

router.get('/heatmap/:days', verifyToken, async (req, res) => {
    try {
        const days = parseInt(req.params.days) || 365;
        const heatmap = await StatsController.getActivityHeatmap(req.userId, days);
        res.json({ success: true, data: heatmap });
    } catch (error) {
        Logger.error('Erreur lors de la récupération de la heatmap', { error });
        res.status(500).json({ success: false, message: error.message });
    }
});

router.get('/records', verifyToken, async (req, res) => {
    try {
        const records = await StatsController.getPersonalRecords(req.userId);
        res.json({ success: true, data: records });
    } catch (error) {
        Logger.error('Erreur lors de la récupération des records', { error });
        res.status(500).json({ success: false, message: error.message });
    }
});

router.get('/comparison', verifyToken, async (req, res) => {
    try {
        const comparison = await StatsController.getComparisonStats(req.userId);
        res.json({ success: true, data: comparison });
    } catch (error) {
        Logger.error('Erreur lors de la récupération des statistiques comparatives', { error });
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router; 