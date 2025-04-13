const express = require('express')
const router = express.Router()

router.get('/', (req, res) => {
    res.json("GET all roots")
})

router.get('/:id', (req, res) => {
    res.json("GET a root with id")
})

router.post('/', (req, res) => {
    res.json("POST a workout")
})

router.delete('/:id', (req, res) => {
    res.json("DELETE a workout")
})

router.patch('/:id', (req, res) => {
    res.json("UPDATE a workout")
})

module.exports = router