const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const cookieParser = require('cookie-parser')
//routes
const AuthRoutes = require('./routes/AuthRoutes')
//.env
require('dotenv').config()

//express app
const app = express()

//middleware
app.use(express.json())
app.use(cookieParser())
app.use(express.urlencoded({ extended: false }))

//cors plugin
app.use(cors({
    credentials: true,
    origin: process.env.FRONTEND_SERVER
}))
app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', process.env.FRONTEND_SERVER);
    res.header('Access-Control-Allow-Credentials', true)
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

//routes
app.use('/api/auth', AuthRoutes)

//mongoDB connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("mongoDB connected")
    })
    .catch((err) => {
        console.log("failed to connect", err)
    })

const port = process.env.PORT || 8000;
const host = process.env.NODE_ENV === "production" ? 'stepify.vercel.app' : 'localhost'; //TODO ajouter le domaine
app.listen(port, function () {
    console.log("Server Has Started!");
    console.log(`Server is running at http://${host}:${port}`)
});