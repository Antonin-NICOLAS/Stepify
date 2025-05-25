const UserModel = require('../models/User')
const cloudinary = require('../config/cloudinary');
const bcrypt = require('bcryptjs')
const { checkAuthorization } = require('../middlewares/VerifyAuthorization')
const { generateVerificationCode } = require('../utils/GenerateCode')
const { GenerateAuthCookie, validateEmail, validateUsername } = require('../utils/AuthHelpers')
const { sendVerificationEmail, sendResetPasswordSuccessfulEmail } = require('../utils/SendMail');
//.env
require('dotenv').config()

//======== UPDATE AN ACCOUNT =========//

const updateAvatar = async (req, res) => {
    const { userId } = req.params;
    const file = req.file; // image envoyée via multer

    if (!file) {
        return res.status(400).json({ success: false, error: 'Aucun fichier fourni' });
    }

    if (checkAuthorization(req, res, userId)) return;

    try {
        const user = await UserModel.findById(userId);

        // Supprimer l'ancien avatar s'il est sur Cloudinary
        if (user.avatarUrl && user.avatarUrl.includes('res.cloudinary.com')) {
            const publicId = user.avatarUrl.split('/').slice(-1)[0].split('.')[0]; // extraire l'id
            await cloudinary.uploader.destroy(`stepify/avatars/${publicId}`);
        }

        // Uploader la nouvelle image
        const result = await cloudinary.uploader.upload_stream(
            {
                folder: 'stepify/avatars',
                public_id: `avatar-${userId}-${Date.now()}`,
                resource_type: 'image',
            },
            async (error, result) => {
                if (error) return res.status(500).json({ success: false, error: error.message });

                user.avatarUrl = result.secure_url;
                await user.save();

                return res.status(200).json({ success: true, avatarUrl: result.secure_url });
            }
        );

        // Envoie le fichier à cloudinary
        result.end(file.buffer);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

const updateProfile = async (req, res) => {
    const { userId } = req.params;
    const updates = req.body;

    if (checkAuthorization(req, res, userId)) return;

    try {
        // Validation des champs
        if (updates.username) {
            if (!validateEmail(updates.username)) {
                return res.status(400).json({
                    success: false,
                    error: "Nom d'utilisateur invalide (3-30 caractères alphanumériques)"
                });
            }

            const existingUser = await UserModel.findOne({ username: updates.username });
            if (existingUser && existingUser._id.toString() !== userId) {
                return res.status(400).json({
                    success: false,
                    error: "Ce nom d'utilisateur est déjà pris"
                });
            }
        }

        if (updates.firstName && updates.firstName.length < 2) {
            return res.status(400).json({
                success: false,
                error: "Le prénom doit contenir au moins 2 caractères"
            });
        }

        if (updates.lastName && updates.lastName.length < 2) {
            return res.status(400).json({
                success: false,
                error: "Le nom doit contenir au moins 2 caractères"
            });
        }

        const user = await UserModel.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: "Utilisateur non trouvé"
            });
        }

        if (updates.username) user.username = updates.username;
        if (updates.firstName) user.firstName = updates.firstName;
        if (updates.lastName) user.lastName = updates.lastName;
        await user.save();


        res.status(200).json({
            success: true,
            message: 'Profil mis à jour',
            user
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

const updateEmail = async (req, res) => {
    const { newEmail } = req.body
    const { userId } = req.params;

    if (checkAuthorization(req, res, userId)) return;

    try {
        const user = await UserModel.findById(req.userId)
        if (!user) return res.status(404).json({ success: false, error: 'Utilisateur introuvable' })

        if (!newEmail || !validateEmail(newEmail)) {
            return res.status(400).json({
                success: false,
                error: "Une adresse email valide est requise"
            });
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
    const { userId } = req.params;

    if (checkAuthorization(req, res, userId)) return;

    try {
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ success: false, error: 'Les deux mots de passe sont requis' })
        }
        if (newPassword.length < 8) {
            return res.status(400).json({ success: false, error: 'Le mot de passe doit contenir au moins 8 caractères' })
        }
        const user = await UserModel.findById(req.userId)
        if (!user) return res.status(404).json({ success: false, error: 'Utilisateur introuvable' })

        const isMatch = await bcrypt.compare(currentPassword, user.password)
        if (!isMatch) return res.status(401).json({ success: false, error: 'Mot de passe actuel incorrect' })

        if (await bcrypt.compare(newPassword, user.password)) {
            return res.status(400).json({ success: false, error: 'Le nouveau mot de passe doit être différent' })
        }

        user.password = await bcrypt.hash(newPassword, 12)
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
        if (dailyGoal < 1000 || dailyGoal > 50000) {
            return res.status(400).json({
                success: false,
                error: "L'objectif quotidien doit être compris entre 1000 et 50000 pas"
            });
        }
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

const getUserProfile = async (req, res) => {
    const { userId } = req.params;

    try {
        const user = await UserModel.findById(userId)
            .populate([
                {
                    path: 'friends.userId',
                    select: 'username avatarUrl firstName lastName'
                },
                {
                    path: 'rewardsUnlocked.rewardId',
                    select: 'name description iconUrl'
                }
            ])

        if (!user) {
            return res.status(404).json({
                success: false,
                error: "Utilisateur non trouvé"
            });
        }

        const isOwner = req.userId === userId;
        const isFriend = user.friends.some(f => f.userId._id.toString() === req.userId);
        const todayProgress = await user.calculateTodayProgress();

        const userResponse = user.toJSON();

        if (!isOwner) {
            delete userResponse.email;
            delete userResponse.friendRequests;
            delete userResponse.customGoals;

            if (!isFriend && !userResponse.privacySettings.showStatsPublicly) {
                delete userResponse.dailyStats;
                delete userResponse.totalSteps;
                delete userResponse.totalDistance;
                delete userResponse.totalCalories;
            }
        }

        res.status(200).json({
            success: true,
            user: { ...userResponse, todayProgress }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: "Erreur lors de la récupération du profil"
        });
    }
};

// gestion des sessions actives
const getActiveSessions = async (req, res) => {
    const { userId } = req.params;

    if (checkAuthorization(req, res, userId)) return;

    try {
        const user = await UserModel.findById(userId)
            .select('activeSessions');

        // Filtrer les sessions expirées
        const activeSessions = user.activeSessions.filter(
            session => new Date(session.expiresAt) > new Date()
        );

        res.status(200).json({
            success: true,
            sessions: activeSessions
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: "Erreur lors de la récupération des sessions"
        });
    }
};

const revokeSession = async (req, res) => {
    const { userId, sessionId } = req.params;

    if (checkAuthorization(req, res, userId)) return;

    try {
        const user = await UserModel.findById(userId);
        user.activeSessions = user.activeSessions.filter(
            session => session._id.toString() !== sessionId
        );
        await user.save();

        res.status(200).json({
            success: true,
            message: "Session révoquée"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: "Erreur lors de la révocation de la session"
        });
    }
};

const revokeAllSessions = async (req, res) => {
    const { userId } = req.params;

    if (checkAuthorization(req, res, userId)) return;

    try {
        await UserModel.findByIdAndUpdate(userId, {
            activeSessions: []
        });

        res.status(200).json({
            success: true,
            message: "Toutes les sessions ont été révoquées"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: "Erreur lors de la révocation des sessions"
        });
    }
};

module.exports = {
    updateAvatar,
    updateProfile,
    updateEmail,
    updatePassword,
    updateStatus,
    updateDailyGoal,
    getUserProfile,
    getActiveSessions,
    revokeSession,
    revokeAllSessions
}