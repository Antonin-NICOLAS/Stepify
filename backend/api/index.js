const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const cookieParser = require('cookie-parser')
const cloudinary = require('../config/cloudinary')
//cron
const { scheduleStatusUpdates } = require('../controllers/updateChallengeStatuses');
//routes
const AuthRoutes = require('../routes/AuthRoutes')
const UserRoutes = require('../routes/AccountRoutes')
const StepRoutes = require('../routes/StepRoutes')
const ChallengeRoutes = require('../routes/ChallengeRoutes')
//.env
require('dotenv').config()

//express app
const app = express()

//middleware
app.use(express.json({limit: '50mb'}))
app.use(cookieParser())
app.use(express.urlencoded({ extended: false, limit: '50mb' }))


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
});