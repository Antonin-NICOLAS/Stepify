const UserModel = require('../models/User')
const bcrypt = require('bcryptjs')
require('dotenv').config()

//// UPDATE AN ACCOUNT ////

const updateAvatar = async (req, res) => {
    const { userId } = req.params
    const { avatarUrl } = req.body

    try {
        const user = await UserModel.findByIdAndUpdate(userId, { avatarUrl }, { new: true })
        res.status(200).json(user)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

const updateUsername = async (req, res) => {
    const { userId } = req.params
    const { username } = req.body

    try {
        const user = await UserModel.findByIdAndUpdate(userId, { username }, { new: true })
        res.status(200).json(user)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

const updateEmail = async (req, res) => {
    const { userId } = req.params
    const { email } = req.body

    try {
        const user = await UserModel.findByIdAndUpdate(userId, { email }, { new: true })
        res.status(200).json(user)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

const updatePassword = async (req, res) => {
    const { userId } = req.params
    const { currentPassword, newPassword } = req.body

    try {
        const user = await UserModel.findById(userId)

        // Vérifier si le mot de passe actuel correspond à celui stocké
        const isMatch = await bcrypt.compare(currentPassword, user.password)
        if (!isMatch) return res.status(400).json({ error: 'Mot de passe actuel incorrect' })

        // Hash du nouveau mot de passe et mise à jour
        user.password = newPassword
        await user.save()

        res.status(200).json({ message: 'Mot de passe mis à jour avec succès' })
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

const updateStatus = async (req, res) => {
    const { userId } = req.params
    const { status } = req.body

    try {
        const user = await UserModel.findByIdAndUpdate(userId, { status }, { new: true })
        res.status(200).json(user)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

const updateDailyGoal = async (req, res) => {
    const { userId } = req.params
    const { dailyGoal } = req.body

    try {
        const user = await UserModel.findByIdAndUpdate(userId, { dailyGoal }, { new: true })
        res.status(200).json(user)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

module.exports = {
    updateAvatar,
    updateUsername,
    updateEmail,
    updatePassword,
    updateStatus,
    updateDailyGoal
}