const UserModel = require('../models/User')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const { generateVerificationCode } = require('../utils/GenerateCode')
const { GenerateAuthCookie } = require('../utils/GenerateAuthCookie');
const { sendVerificationEmail, sendWelcomeEmail, sendResetPasswordEmail, sendResetPasswordSuccessfulEmail } = require('../utils/SendMail');
//.env
require('dotenv').config()

// SOMMAIRE
//// ACCOUNT MANAGEMENT ////
// - register
// - verify email
// - resend verification email
// - delete account

//// ACCOUNT REQ ////
// - login
// - forgot password
// - reset password
// - logout

//// CONTEXT ////
// - check auth

//// ACCOUNT MANAGEMENT ////

// register
const createUser = async (req, res) => {
    const { firstName, lastName, username, email, password, stayLoggedIn } = req.body

    // Vérifications
    if (!firstName) {
        return res.status(400).json({success: false, error: "Le prénom est requis" });
    }
    if (!lastName) {
        return res.status(400).json({success: false, error: "Le nom est requis" });
    }
    if (!email) {
        return res.status(400).json({success: false, error: "L'email est requis" });
    }
    if (!username) {
        return res.status(400).json({success: false, error: "Le nom d'utilisateur est requis" });
    }

    // l'adresse mail doit être unique
    const emailexist = await UserModel.findOne({ email });
    if (emailexist) {
        return res.status(400).json({success: false, error: "L'email est déjà associé à un compte" });
    }
    // le nom d'utilisateur doit être unique
    const usernameexist = await UserModel.findOne({ username });
    if (usernameexist) {
        return res.status(400).json({success: false, error: "Le nom d'utilisateur est déjà associé à un compte. Il doit être unique" });
    }
    // le mot de passe doit contenir au moins 6 caractères
    if (!password || password.length < 6) {
        return res.status(400).json({success: false, error: "Un mot de passe est requis, d'une longueur de 6 caractères au moins" });
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

// verify email
const verifyEmail = async (req, res) => {
    const { code } = req.body;
    const { jwtauth } = req.cookies;

    try {
        // Vérifier le JWT pour obtenir l'ID utilisateur
        const decoded = jwt.verify(jwtauth, process.env.JWT_SECRET);
        const user = await UserModel.findById(decoded.id);

        if (!user) {
            return res.status(404).json({success: false, error: "Utilisateur non trouvé" });
        }

        // Le reste de la logique reste identique...
        if (user.isVerified) {
            return res.status(400).json({success: false, error: "Email déjà vérifié" });
        }

        if (user.verificationToken !== code) {
            return res.status(400).json({success: false, error: "Code de vérification invalide" });
        }

        if (user.verificationTokenExpiresAt < Date.now()) {
            return res.status(400).json({success: false, error: "Le code de vérification a expiré" });
        }

        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpiresAt = undefined;
        await user.save();
        await sendWelcomeEmail(user.email, user.firstName);

        return res.status(200).json({
            success: true,
            message: "Email vérifié",
            user: { ...user._doc, password: undefined },
        });
    } catch (error) {
        console.log("Erreur lors de la vérification de l'email :", error);
        res.status(400).json({ success: false, error: error.message });
    }
};

// resend verification email
const resendVerificationEmail = async (req, res) => {
    const { jwtauth } = req.cookies;
    if (!jwtauth) return res.status(401).json({success: false, error: "Non autorisé" });

    const decoded = jwt.verify(jwtauth, process.env.JWT_SECRET);
    const email = decoded.email;

    const user = await UserModel.findOne({ email });
    if (!user || user.isVerified) return res.status(400).json({success: false, error: "Déjà vérifié ou inexistant" });

    user.verificationToken = generateVerificationCode();
    user.verificationTokenExpiresAt = Date.now() + 24 * 60 * 60 * 1000;
    await user.save();

    await sendVerificationEmail(user.email, user.verificationToken);
    return res.status(200).json({
        success: true,
        message: "Email de vérification renvoyé",
        user: { ...user._doc, password: undefined },
    });
};

// delete an account
const deleteUser = async (req, res) => {
    const { userId } = req.params

    try {
        const deletedUser = await UserModel.findByIdAndDelete(userId)
        if (!deletedUser) return res.status(404).json({success: false, error: "Utilisateur introuvable" })
        res.status(200).json({success: true, message: "Compte supprimé avec succès" })
    } catch (error) {
        console.log("Le compte n'a pas pu être supprimé", error);
        res.status(400).json({success: false, error: error.message })
    }
}

//// ACCOUNT REQ ////

// login
const loginUser = async (req, res) => {
    const { email, password, stayLoggedIn } = req.body

    try {
        // Trouver l'utilisateur par son email
        const user = await UserModel.findOne({ email })
        if (!user) return res.status(400).json({success: false, error: "L'email n'est associé à aucun compte" })

        // Vérifier si le mot de passe est correct
        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) return res.status(400).json({success: false, error: 'Mot de passe incorrect' })

        // Vérifier si l'utilisateur a un vérifié l'email
        const isVerified = user.isVerified;
        if (!isVerified) return res.status(401).json({success: false, error: "Email non vérifié" });
        // Générer un token JWT
        GenerateAuthCookie(res, user, stayLoggedIn);
        // Supprimer le mot de passe du résultat
        user.password = undefined;
        return res.status(201).json({
            success: true,
            message: "Vous êtes connecté",
            user: { ...user._doc, password: undefined },
        });

    } catch (error) {
        res.status(400).json({success: false, error: error.message })
    }
}
// forgot password
const forgotPassword = async (req, res) => {
    const { email } = req.body
    try {
        const user = await UserModel.findOne({ email });
        if (!user) return res.status(400).json({success: false, error: "L'email n'est associé à aucun compte" })

        // Vérifier si l'utilisateur a un vérifié l'email
        const isVerified = user.isVerified;
        if (!isVerified) return res.status(401).json({success: false, error: "Email non vérifié" });

        const resetPasswordToken = crypto.randomBytes(32).toString('hex');
        const resetPasswordTokenExpiresAt = Date.now() + 3600000; // 1 heure
        user.resetPasswordToken = resetPasswordToken;
        user.resetPasswordTokenExpiresAt = resetPasswordTokenExpiresAt;

        await user.save();
        await sendResetPasswordEmail(user.email, `${process.env.FRONTEND_SERVER}/reset-password/${resetPasswordToken}`);

        return res.status(200).json({success: true, message: "Email de réinitialisation de mot de passe envoyé" });
    } catch (error) {
        console.log("Erreur lors de l'envoi du mail de réinitialisation du mot de passe :", error);
        res.status(400).json({success: false, error: error.message })
    }
}

// reset password
const resetPassword = async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    try {
        const user = await UserModel.findOne({
            resetPasswordToken: token,
            resetPasswordTokenExpiresAt: { $gt: Date.now() }
        });
        if (!user) return res.status(400).json({success: false, error: "Lien invalide ou expiré. Veuillez renvoyer un email" })

        if (!password || password.length < 6) {
            return res.status(400).json({success: false, error: "Le mot de passe doit contenir au moins 6 caractères" });
        }

        // Hash du nouveau mot de passe
        const hashedPassword = await bcrypt.hash(password, 10);
        user.password = hashedPassword;

        user.resetPasswordToken = undefined;
        user.resetPasswordTokenExpiresAt = undefined;

        await user.save();

        await sendResetPasswordSuccessfulEmail(user.email, user.firstName);

        res.status(200).json({success: true, message: "Mot de passe réinitialisé" })
    } catch (error) {
        console.log("Erreur lors de la réinitialisation du mot de passe :", error);
        res.status(400).json({success: false, error: error.message })
    }
}

// logout
const logoutUser = async (req, res) => {
    try {
        res.clearCookie("jwtauth", {
            secure: process.env.NODE_ENV === "production" ? true : false,
            httpOnly: process.env.NODE_ENV === "production" ? true : false,
            sameSite: process.env.NODE_ENV === "production" ? 'lax' : '',
            ...(process.env.NODE_ENV === "production" && { domain: 'step-ify.vercel.app' })
        })
        return res.status(200).json({ success: true, message: "Déconnecté" })
    } catch (error) {
        res.status(400).json({success: false, error: error.message })
    }
}

//// CONTEXT ////

// check auth
const checkAuth = async (req, res) => {
    try {
        const user = await UserModel.findById(req.userId);
        if (!user) {
            return res.status(400).json({ success: false, error: "Utilisateur non trouvé" });
        }

        res.status(200).json({
            success: true,
            user: { ...user._doc, password: undefined }
        });
    } catch (error) {
        console.log("erreur survenue lors de la vérification de la connexion", error);
        res.status(400).json({ success: false, error: error.message });
    }
};

module.exports = {
    createUser,
    verifyEmail,
    resendVerificationEmail,
    deleteUser,
    loginUser,
    forgotPassword,
    resetPassword,
    logoutUser,
    checkAuth
}
