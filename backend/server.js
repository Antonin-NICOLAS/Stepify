const express = require('express')
const mongoose = require('mongoose')
const rootRoutes = require('./routes/root')
//.env
require('dotenv').config()

//express app
const app = express()

//middleware
app.use(express.json())
app.use((req, res, next) => {
    console.log(req.path, req.method)
    next()
})

//routes
app.use('/api/root', rootRoutes)

// database
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        //listen for requests
        app.listen(process.env.PORT, () => {
            console.log("DB connected and server running on port", process.env.PORT)
        })
    })
    .catch((error) => {
        console.log(error)
    })