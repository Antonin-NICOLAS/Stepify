const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const cookieParser = require('cookie-parser')
//cron
const { scheduleStatusUpdates, deleteExpiredNotifications, scheduleDailyRewardUpdates, deleteLonelyChallenges, saveRank } = require('./ScheduledTasks');
//routes
const AuthRoutes = require('../routes/AuthRoutes')
const UserRoutes = require('../routes/AccountRoutes')
const StepRoutes = require('../routes/StepRoutes')
const ChallengeRoutes = require('../routes/ChallengeRoutes')
const NotificationRoutes = require('../routes/NotificationRoutes')
const RewardRoutes = require('../routes/RewardRoutes')
//middleware
const { localization } = require('../middlewares/Localization')
//.env
require('dotenv').config()

//express app
const app = express()

//middleware
app.use(express.json({limit: '50mb'}))
app.use(cookieParser())
app.use(express.urlencoded({ extended: false, limit: '50mb' }))

//localization middleware
app.use(localization)

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
app.use('/notification', NotificationRoutes)
app.use('/reward', RewardRoutes)

//mongoDB connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("mongoDB connected")
    })
    .catch((err) => {
        console.log("failed to connect", err)
    })

const port = process.env.PORT || 8000;
const host = process.env.NODE_ENV === "production" ? 'step-ify.vercel.app' : 'localhost';
app.listen(port, function () {
    console.log("Server Has Started!");
    console.log(`Server is running at http://${host}:${port}`);
    scheduleStatusUpdates();
    deleteExpiredNotifications();
    scheduleDailyRewardUpdates();
    deleteLonelyChallenges();
    saveRank();
});