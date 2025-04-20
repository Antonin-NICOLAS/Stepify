const UserModel = require('../models/User')
const bcrypt = require('bcryptjs')
const { checkAuthorization } = require('../middlewares/VerifyAuthorization')
const { generateVerificationCode } = require('../utils/GenerateCode')
const { sendVerificationEmail, sendResetPasswordSuccessfulEmail } = require('../utils/SendMail');
//.env
require('dotenv').config()

//======== UPDATE AN ACCOUNT =========//


const updateAvatar = async (req, res) => {
    const { userId } = req.params;
    const { avatarUrl } = req.body;

    if (checkAuthorization(req, res, userId)) return;

    try {
        const user = await UserModel.findByIdAndUpdate(userId, { avatarUrl }, { new: true });
        res.status(200).json({ success: true, avatarUrl: user.avatarUrl });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

const updateUsername = async (req, res) => {
    const { userId } = req.params;
    const { username } = req.body;

    if (checkAuthorization(req, res, userId)) return;

    try {
        const user = await UserModel.findByIdAndUpdate(userId, { username }, { new: true });
        res.status(200).json({
            success: true,
            message: 'Le nom d\'utilisateur a été mis à jour',
            username: user.username });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

const updateEmail = async (req, res) => {
    const { newEmail } = req.body

    try {
        const user = await UserModel.findById(req.userId)
        if (!user) return res.status(404).json({ success: false, error: 'Utilisateur introuvable' })

        if (!newEmail) {
            return res.status(400).json({ success: false, error: "Nouvel email requis" });
        }

        if (user.email === newEmail) {
            return res.status(400).json({ success: false, error: 'Le nouvel email doit être différent' })
        }

        const existingUser = await UserModel.findOne({ email: newEmail })
        if (existingUser) return res.status(400).json({ success: false, error: 'L\'email est déjà associé à un compte' })

        user.email = newEmail
        user.isVerified = false
        user.verificationToken = generateVerificationCode()
        user.verificationTokenExpiresAt = Date.now() + 24 * 60 * 60 * 1000
        await user.save()

        // Supprimer le cookie de l'ancien email
        res.clearCookie("jwtauth", {
            secure: process.env.NODE_ENV === "production" ? true : false,
            httpOnly: process.env.NODE_ENV === "production" ? true : false,
            sameSite: process.env.NODE_ENV === "production" ? 'lax' : '',
            ...(process.env.NODE_ENV === "production" && { domain: 'step-ify.vercel.app' })
        });

        await sendVerificationEmail(newEmail, user.verificationToken)

        // Générer un nouveau cookie avec le nouvel email
        GenerateAuthCookie(res, user, false);

        res.status(200).json({
            success: true,
            message: 'Email mis à jour - Vérification requise',
            email: user.email,
            isVerified: user.isVerified
        })
    } catch (error) {
        if (error.code === 11000) return res.status(400).json({ error: 'Email déjà utilisé' })
        res.status(400).json({ success: false, error: error.message })
    }
}

const updatePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body

    try {
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ success: false, error: 'Les deux mots de passe sont requis' })
        }
        if (newPassword.length < 6) {
            return res.status(400).json({ success: false, error: 'Le mot de passe doit contenir au moins 6 caractères' })
        }
        const user = await UserModel.findById(req.userId)
        if (!user) return res.status(404).json({ success: false, error: 'Utilisateur introuvable' })

        const isMatch = await bcrypt.compare(currentPassword, user.password)
        if (!isMatch) return res.status(401).json({ success: false, error: 'Mot de passe actuel incorrect' })

        if (await bcrypt.compare(newPassword, user.password)) {
            return res.status(400).json({ success: false, error: 'Le nouveau mot de passe doit être différent' })
        }

        user.password = await bcrypt.hash(newPassword, 10)
        await user.save()

        await sendResetPasswordSuccessfulEmail(user.email, user.firstName)

        res.status(200).json({ success: true, message: 'Votre mot de passe a été mis à jour' })
    } catch (error) {
        res.status(400).json({ success: false, error: error.message })
    }
}

const updateStatus = async (req, res) => {
    const { userId } = req.params;
    const { status } = req.body;

    if (checkAuthorization(req, res, userId)) return;

    try {
        const user = await UserModel.findByIdAndUpdate(userId, { status }, { new: true });
        res.status(200).json({
            success: true,
            message: 'Le statut a été mis à jour',
            status: user.status
        });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

const updateDailyGoal = async (req, res) => {
    const { userId } = req.params;
    const { dailyGoal } = req.body;

    if (checkAuthorization(req, res, userId)) return;

    try {
        const user = await UserModel.findByIdAndUpdate(userId, { dailyGoal }, { new: true });
        res.status(200).json({ 
            success: true,
            message: 'L\'objectif quotidien a été mis à jour',
            dailyGoal: user.dailyGoal
        });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

//TODO: updatePrivacySettings – Gérer si les amis peuvent voir l’activité, etc.
//TODO: updateThemePreference – Sauvegarder le thème clair/sombre

module.exports = {
    updateAvatar,
    updateUsername,
    updateEmail,
    updatePassword,
    updateStatus,
    updateDailyGoal
}