const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const cookieParser = require('cookie-parser')
//cron
const { scheduleStatusUpdates, deleteExpiredNotifications, scheduleDailyRewardUpdates, deleteLonelyChallenges, saveRank } = require('./cron/ScheduledTasks');
//routes
const AuthRoutes = require('../routes/AuthRoutes')
const UserRoutes = require('../routes/AccountRoutes')
const StepRoutes = require('../routes/StepRoutes')
const ChallengeRoutes = require('../routes/ChallengeRoutes')
const FriendRoutes = require('../routes/FriendRoutes')
const NotificationRoutes = require('../routes/NotificationRoutes.js')
const RewardRoutes = require('../routes/RewardRoutes')
const LeaderboardRoutes = require('../routes/RankingRoutes')
// vercel cron
const { cron } = require('./cron/all-tasks')
const { saveRankByVercel } = require('./cron/save-rank')
//middleware
const accessLogger = require('../middlewares/AccessLogger')
//logs
const Logger = require('../logs/Logger')
//.env
require('dotenv').config()

//express app
const app = express()

//middleware
app.set('trust proxy', 1);
app.use(express.json({ limit: '50mb' }))
app.use(cookieParser())
app.use(express.static('public'));
app.use(express.urlencoded({ extended: false, limit: '50mb' }))
app.use(accessLogger)

//cors
const corsOptions = {
    origin: process.env.FRONTEND_SERVER,
    credentials: true
};

app.use(cors(corsOptions));

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", process.env.FRONTEND_SERVER);
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

//routes
app.get('/', (req, res) => {
    res.send("Hello ! Here is Stepify API")
})
app.use('/auth', AuthRoutes)
app.use('/account', UserRoutes)
app.use('/step', StepRoutes)
app.use('/challenge', ChallengeRoutes)
app.use('/friend', FriendRoutes)
app.use('/notification', NotificationRoutes)
app.use('/reward', RewardRoutes)
app.use('/leaderboard', LeaderboardRoutes)
app.use('/cron/all', cron)
app.use('/cron/save-rank', saveRankByVercel)

// Gestion des erreurs globale
app.use((err, req, res, next) => {
    Logger.error('Erreur non gérée', {
        error: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method,
        userId: (req.userId || undefined)
    });

    res.status(500).json({
        error: process.env.NODE_ENV === 'production'
            ? 'Une erreur interne est survenue'
            : err.message
    });
});

//mongoDB connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        Logger.info("MongoDB connecté avec succès");
        console.log("mongoDB connected")
    })
    .catch((err) => {
        Logger.error("Échec de la connexion MongoDB", { error: err });
        console.log("failed to connect", err)
    })

const port = process.env.PORT || 8000;
const host = process.env.NODE_ENV === "production" ? 'step-ify.vercel.app' : 'localhost';
app.listen(port, function () {
    console.log("Server Has Started!");
    console.log(`Server is running at http://${host}:${port}`);
    Logger.info(`Serveur démarré sur le port ${port}`);
    scheduleStatusUpdates();
    deleteExpiredNotifications();
    scheduleDailyRewardUpdates();
    deleteLonelyChallenges();
    saveRank();
});