const UserModel = require('../models/User')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { generateVerificationCode } = require('../utils/GenerateCode')
const { GenerateAuthCookie } = require('../utils/GenerateAuthCookie');
const { sendVerificationEmail } = require('../utils/SendVerificationMail');
//.env
require('dotenv').config()

// SOMMAIRE
//// ACCOUNT MANAGEMENT ////
// - register
// - delete account

//// ACCOUNT REQ ////
// - login
// - logout
// - forgot password
// - get profile

//// UPDATE AN ACCOUNT ////
// - change avatar
// - change username
// - change email
// - change password
// - change status
// - change daily goal

//// ACCOUNT MANAGEMENT ////

// register
const createUser = async (req, res) => {
    const { firstName, lastName, username, email, password, stayLoggedIn } = req.body

    // Vérifications
    if (!firstName) {
        return res.status(400).json({ error: "Le prénom est requis" });
    }
    if (!lastName) {
        return res.status(400).json({ error: "Le nom est requis" });
    }
    if (!email) {
        return res.status(400).json({ error: "L'email est requis" });
    }
    if (!username) {
        return res.status(400).json({ error: "Le nom d'utilisateur est requis" });
    }
    if (!password || password.length < 6) {
        return res.status(400).json({ error: "Un mot de passe est requis, d'une longueur de 6 caractères au moins" });
    }

    // l'adresse mail doit être unique
    const emailexist = await UserModel.findOne({ email });
    if (emailexist) {
        return res.status(400).json({ error: "L'email est déjà associé à un compte" });
    }
    // le nom d'utilisateur doit être unique
    const usernameexist = await UserModel.findOne({ username });
    if (usernameexist) {
        return res.status(400).json({ error: "Le nom d'utilisateur est déjà associé à un compte. Il doit être unique" });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const verificationCode = generateVerificationCode();
        const newUser = await UserModel.create({
            firstName,
            lastName,
            username,
            email,
            password: hashedPassword,
            verificationToken: verificationCode,
            verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 heures
            isVerified: false,
        })

        // Envoi de l'email de vérification
        await sendVerificationEmail(newUser.email, verificationCode);

        GenerateAuthCookie(res, newUser, stayLoggedIn);
        return res.status(201).json({
            success: true,
            message: "Compte créé avec succès",
            user: { ...newUser._doc, password: undefined },
        });
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

// delete an account
const deleteUser = async (req, res) => {
    const { userId } = req.params

    try {
        const deletedUser = await UserModel.findByIdAndDelete(userId)
        if (!deletedUser) return res.status(404).json({ error: "Utilisateur introuvable" })
        res.status(200).json({ message: "Compte supprimé avec succès" })
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

//// ACCOUNT REQ ////

// login
const loginUser = async (req, res) => {
    const { email, password, stayLoggedIn } = req.body

    try {
        // Trouver l'utilisateur par son email
        const user = await UserModel.findOne({ email })
        if (!user) return res.status(400).json({ error: "L'email n'est associé à aucun compte" })

        // Vérifier si le mot de passe est correct
        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) return res.status(400).json({ error: 'Mot de passe incorrect' })

        // Générer un token JWT
        GenerateAuthCookie(res, user, stayLoggedIn);
        return res.status(201).json(user);

    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

// disconnect
const logoutUser = async (req, res) => {
    try {
        res.clearCookie("jwtauth", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? 'lax' : '',
            domain: process.env.NODE_ENV === "production" ? 'stepify.vercel.app' : '', //TODO ajouter le domaine
        })
        return res.status(200).json({ message: "Déconnexion réussie" })
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

// get profile
const getUserProfile = (req, res) => {
    const { jwtauth } = req.cookies;
    if (!jwtauth) return res.status(401).json({ error: "Non autorisé" });

    jwt.verify(jwtauth, process.env.JWT_SECRET, async (err, decoded) => {
        if (err) return res.status(401).json({ error: "Token invalide" });

        try {
            const user = await UserModel.findById(decoded.id).select('-password').lean();
            if (!user) {
                return res.status(404).json({ error: "Utilisateur non trouvé" });
            }

            const { firstName, lastName, ...rest } = user;
            const responseData = {
                ...rest,
                nom: lastName,
                prenom: firstName
            };

            return res.status(200).json(responseData);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });
};

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
    createUser,
    deleteUser,
    loginUser,
    logoutUser,
    getUserProfile,
    updateAvatar,
    updateUsername,
    updateEmail,
    updatePassword,
    updateStatus,
    updateDailyGoal
}
