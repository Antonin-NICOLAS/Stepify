const UserModel = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { generateVerificationCode } = require('../utils/GenerateCode');
const { GenerateAuthCookie } = require('../utils/GenerateAuthCookie');
const { 
    sendVerificationEmail, 
    sendWelcomeEmail, 
    sendResetPasswordEmail, 
    sendResetPasswordSuccessfulEmail 
} = require('../utils/SendMail');
require('dotenv').config();

// Validation helpers
const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const validateUsername = (username) => {
    return /^[a-zA-Z0-9_]{3,30}$/.test(username);
};

//// ACCOUNT MANAGEMENT ////

// register
const createUser = async (req, res) => {
    const { firstName, lastName, username, email, password, stayLoggedIn } = req.body;

    try {
        // Validations améliorées
        if (!firstName || firstName.length < 2) {
            return res.status(400).json({ 
                success: false, 
                error: "Un prénom valide (2 caractères minimum) est requis" 
            });
        }
        if (!lastName || lastName.length < 2) {
            return res.status(400).json({ 
                success: false, 
                error: "Un nom valide (2 caractères minimum) est requis" 
            });
        }
        if (!email || !validateEmail(email)) {
            return res.status(400).json({ 
                success: false, 
                error: "Une adresse email valide est requise" 
            });
        }
        if (!username || !validateUsername(username)) {
            return res.status(400).json({ 
                success: false, 
                error: "Un nom d'utilisateur valide (3-30 caractères alphanumériques) est requis" 
            });
        }
        if (!password || password.length < 8) {
            return res.status(400).json({ 
                success: false, 
                error: "Un mot de passe de 8 caractères minimum est requis" 
            });
        }

        // Vérifications d'unicité optimisées
        const [emailExist, usernameExist] = await Promise.all([
            UserModel.findOne({ email }).select('_id').lean(),
            UserModel.findOne({ username }).select('_id').lean()
        ]);

        if (emailExist) {
            return res.status(400).json({ 
                success: false, 
                error: "L'email est déjà associé à un compte" 
            });
        }
        if (usernameExist) {
            return res.status(400).json({ 
                success: false, 
                error: "Le nom d'utilisateur est déjà pris" 
            });
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        const verificationCode = generateVerificationCode();

        const newUser = await UserModel.create({
            firstName,
            lastName,
            username,
            email,
            password: hashedPassword,
            verificationToken: verificationCode,
            verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000,
            isVerified: false,
            lastLoginAt: Date.now(),
            dailyGoal: 10000, // Valeur par défaut
            themePreference: 'auto',
            languagePreference: 'fr'
        });

        await sendVerificationEmail(newUser.email, verificationCode);
        GenerateAuthCookie(res, newUser, stayLoggedIn);

        // Ne pas renvoyer les informations sensibles
        const userResponse = newUser.toObject();
        delete userResponse.password;
        delete userResponse.verificationToken;
        delete userResponse.resetPasswordToken;

        return res.status(201).json({
            success: true,
            message: "Compte créé avec succès. Un email de vérification a été envoyé.",
            user: userResponse
        });
    } catch (error) {
        console.error("Erreur lors de la création du compte:", error);
        res.status(500).json({ 
            success: false, 
            error: "Une erreur est survenue lors de la création du compte" 
        });
    }
};

// verify email
const verifyEmail = async (req, res) => {
    const { code } = req.body;
    const { jwtauth } = req.cookies;

    try {
        if (!jwtauth) {
            return res.status(401).json({ 
                success: false, 
                error: "Authentification requise" 
            });
        }

        const decoded = jwt.verify(jwtauth, process.env.JWT_SECRET);
        const user = await UserModel.findById(decoded.id);

        if (!user) {
            return res.status(404).json({ 
                success: false, 
                error: "Utilisateur non trouvé" 
            });
        }

        if (user.isVerified) {
            return res.status(400).json({ 
                success: false, 
                error: "Email déjà vérifié" 
            });
        }

        if (user.verificationToken !== code) {
            return res.status(400).json({ 
                success: false, 
                error: "Code de vérification invalide" 
            });
        }

        if (user.verificationTokenExpiresAt < Date.now()) {
            return res.status(400).json({ 
                success: false, 
                error: "Le code de vérification a expiré" 
            });
        }

        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpiresAt = undefined;
        await user.save();

        await sendWelcomeEmail(user.email, user.firstName);

        const userResponse = user.toObject();
        delete userResponse.password;
        delete userResponse.verificationToken;
        delete userResponse.resetPasswordToken;

        return res.status(200).json({
            success: true,
            message: "Email vérifié avec succès",
            user: userResponse
        });
    } catch (error) {
        console.error("Erreur lors de la vérification de l'email:", error);
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ 
                success: false, 
                error: "Token invalide" 
            });
        }
        res.status(500).json({ 
            success: false, 
            error: "Une erreur est survenue lors de la vérification de l'email" 
        });
    }
};

// resend verification email
const resendVerificationEmail = async (req, res) => {
    const { jwtauth } = req.cookies;

    try {
        if (!jwtauth) {
            return res.status(401).json({ 
                success: false, 
                error: "Authentification requise" 
            });
        }

        const decoded = jwt.verify(jwtauth, process.env.JWT_SECRET);
        const user = await UserModel.findById(decoded.id);

        if (!user) {
            return res.status(404).json({ 
                success: false, 
                error: "Utilisateur non trouvé" 
            });
        }

        if (user.isVerified) {
            return res.status(400).json({ 
                success: false, 
                error: "L'email est déjà vérifié" 
            });
        }

        // Générer un nouveau code avec une expiration
        user.verificationToken = generateVerificationCode();
        user.verificationTokenExpiresAt = Date.now() + 24 * 60 * 60 * 1000;
        await user.save();

        await sendVerificationEmail(user.email, user.verificationToken);

        return res.status(200).json({
            success: true,
            message: "Un nouveau code de vérification a été envoyé à votre email"
        });
    } catch (error) {
        console.error("Erreur lors de la demande de renvoi du code de vérification:", error);
        res.status(500).json({ 
            success: false, 
            error: "Une erreur est survenue lors du renvoi du code de vérification" 
        });
    }
};

// change verification email
const ChangeVerificationEmail = async (req, res) => {
    const { newEmail } = req.body;

    try {
        if (!newEmail || !validateEmail(newEmail)) {
            return res.status(400).json({ 
                success: false, 
                error: "Une adresse email valide est requise" 
            });
        }

        const user = await UserModel.findById(req.userId);
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                error: "Utilisateur introuvable" 
            });
        }

        if (user.isVerified) {
            return res.status(400).json({ 
                success: false, 
                error: "Votre compte est déjà vérifié" 
            });
        }

        if (user.email === newEmail) {
            return res.status(400).json({ 
                success: false, 
                error: "Le nouvel email doit être différent de l'actuel" 
            });
        }

        const emailExists = await UserModel.findOne({ email: newEmail });
        if (emailExists) {
            return res.status(400).json({ 
                success: false, 
                error: "L'email est déjà associé à un compte" 
            });
        }

        user.email = newEmail;
        user.isVerified = false;
        user.verificationToken = generateVerificationCode();
        user.verificationTokenExpiresAt = Date.now() + 24 * 60 * 60 * 1000;
        await user.save();

        res.clearCookie("jwtauth", {
            secure: process.env.NODE_ENV === "production",
            httpOnly: true,
            sameSite: process.env.NODE_ENV === "production" ? 'lax' : 'none',
            ...(process.env.NODE_ENV === "production" && { domain: 'step-ify.vercel.app' })
        });

        await sendVerificationEmail(user.email, user.verificationToken);
        GenerateAuthCookie(res, user, false);

        return res.status(200).json({
            success: true,
            message: "Email mis à jour. Un nouveau code de vérification a été envoyé."
        });
    } catch (error) {
        console.error("Erreur lors du changement d'email:", error);
        res.status(500).json({ 
            success: false, 
            error: "Une erreur est survenue lors du changement d'email" 
        });
    }
};

// delete an account
const deleteUser = async (req, res) => {
    const { userId } = req.params;
    const { password } = req.body;

    try {
        if (!password) {
            return res.status(400).json({ 
                success: false, 
                error: "Le mot de passe est requis pour supprimer le compte" 
            });
        }

        const user = await UserModel.findById(userId);
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                error: "Utilisateur introuvable" 
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ 
                success: false, 
                error: "Mot de passe incorrect" 
            });
        }

        await UserModel.findByIdAndDelete(userId);

        res.clearCookie("jwtauth", {
            secure: process.env.NODE_ENV === "production",
            httpOnly: true,
            sameSite: process.env.NODE_ENV === "production" ? 'lax' : 'none',
            ...(process.env.NODE_ENV === "production" && { domain: 'step-ify.vercel.app' })
        });

        return res.status(200).json({ 
            success: true, 
            message: "Compte supprimé avec succès" 
        });
    } catch (error) {
        console.error("Erreur lors de la suppression du compte:", error);
        res.status(500).json({ 
            success: false, 
            error: "Une erreur est survenue lors de la suppression du compte" 
        });
    }
};

//// ACCOUNT REQ ////

// login
const loginUser = async (req, res) => {
    const { email, password, stayLoggedIn } = req.body;

    try {
        if (!email || !password) {
            return res.status(400).json({ 
                success: false, 
                error: "L'email et le mot de passe sont requis" 
            });
        }

        const user = await UserModel.findOne({ email });
        if (!user) {
            return res.status(401).json({ 
                success: false, 
                error: "Email associé à aucun compte" 
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ 
                success: false, 
                error: "Mot de passe incorrect" 
            });
        }

        // Mettre à jour la dernière connexion
        user.lastLoginAt = Date.now();
        await user.save();

        GenerateAuthCookie(res, user, stayLoggedIn);

        const userResponse = user.toObject();
        delete userResponse.password;
        delete userResponse.verificationToken;
        delete userResponse.resetPasswordToken;

        return res.status(200).json({
            success: true,
            message: "Connexion réussie",
            user: userResponse
        });
    } catch (error) {
        console.error("Erreur lors de la connexion:", error);
        res.status(500).json({ 
            success: false, 
            error: "Une erreur est survenue lors de la connexion" 
        });
    }
};

// forgot password
const forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        if (!email || !validateEmail(email)) {
            return res.status(400).json({ 
                success: false, 
                error: "Une adresse email valide est requise" 
            });
        }

        const user = await UserModel.findOne({ email });
        if (!user) {
            return res.status(200).json({ 
                success: true, 
                message: "Si l'email existe, un lien de réinitialisation a été envoyé" 
            });
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        user.resetPasswordToken = resetToken;
        user.resetPasswordTokenExpiresAt = Date.now() + 3600000; // 1 heure
        await user.save();

        const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
        await sendResetPasswordEmail(user.email, resetUrl);

        return res.status(200).json({ 
            success: true, 
            message: "Un lien de réinitialisation a été envoyé à votre email" 
        });
    } catch (error) {
        console.error("Erreur lors de la demande de réinitialisation de mot de passe:", error);
        res.status(500).json({ 
            success: false, 
            error: "Une erreur est survenue lors de la demande de réinitialisation" 
        });
    }
};

// reset password
const resetPassword = async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    try {
        if (!password || password.length < 8) {
            return res.status(400).json({ 
                success: false, 
                error: "Un mot de passe de 8 caractères minimum est requis" 
            });
        }

        const user = await UserModel.findOne({
            resetPasswordToken: token,
            resetPasswordTokenExpiresAt: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ 
                success: false, 
                error: "Lien invalide ou expiré. Veuillez faire une nouvelle demande." 
            });
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordTokenExpiresAt = undefined;
        await user.save();

        await sendResetPasswordSuccessfulEmail(user.email, user.firstName);

        return res.status(200).json({ 
            success: true, 
            message: "Mot de passe réinitialisé avec succès" 
        });
    } catch (error) {
        console.error("Erreur lors de la réinitialisation du mot de passe:", error);
        res.status(500).json({ 
            success: false, 
            error: "Une erreur est survenue lors de la réinitialisation du mot de passe" 
        });
    }
};

// logout
const logoutUser = async (req, res) => {
    try {
        res.clearCookie("jwtauth", {
            secure: process.env.NODE_ENV === "production",
            httpOnly: true,
            sameSite: process.env.NODE_ENV === "production" ? 'lax' : 'none',
            ...(process.env.NODE_ENV === "production" && { domain: 'step-ify.vercel.app' })
        });

        return res.status(200).json({ 
            success: true, 
            message: "Déconnexion réussie" 
        });
    } catch (error) {
        console.error("Erreur lors de la déconnexion:", error);
        res.status(500).json({ 
            success: false, 
            error: "Une erreur est survenue lors de la déconnexion" 
        });
    }
};

//// CONTEXT ////

// check auth
const checkAuth = async (req, res) => {
    try {
        const user = await UserModel.findById(req.userId)
            .select('-password -verificationToken -resetPasswordToken')
            .lean();

        if (!user) {
            return res.status(404).json({ 
                success: false, 
                error: "Utilisateur non trouvé" 
            });
        }

        return res.status(200).json({
            success: true,
            user
        });
    } catch (error) {
        console.error("Erreur lors de la vérification de l'authentification:", error);
        res.status(500).json({ 
            success: false, 
            error: "Une erreur est survenue lors de la vérification de l'authentification" 
        });
    }
};

module.exports = {
    createUser,
    verifyEmail,
    resendVerificationEmail,
    ChangeVerificationEmail,
    deleteUser,
    loginUser,
    forgotPassword,
    resetPassword,
    logoutUser,
    checkAuth
};