const UserModel = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const ms = require('ms');
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

        // Vérifications email/username existant
        const existingUser = await UserModel.findOne({
            $or: [{ email }, { username }]
        }).select('email username').lean();

        if (existingUser) {
            const errors = {};
            if (existingUser.email === email) errors.email = "Email déjà utilisé";
            if (existingUser.username === username) errors.username = "Nom d'utilisateur déjà pris";

            return res.status(400).json({
                success: false,
                errors
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
            verificationTokenExpiresAt: Date.now() + ms(process.env.VERIFICATION_TOKEN_EXPIRY),
            isVerified: false,
            lastLoginAt: Date.now(),
            activeSessions: [{
                ipAddress: req.ip,
                userAgent: req.headers['user-agent']
            }],
            dailyGoal: 10000, // Valeur par défaut
            themePreference: 'auto',
            languagePreference: 'fr'
        });

        await sendVerificationEmail(newUser.email, verificationCode);
        GenerateAuthCookie(res, newUser, stayLoggedIn);

        //save new session
        const userAgent = req.headers['user-agent'] || 'unknown';
        const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        const sessionDuration = stayLoggedIn ? ms(process.env.SESSION_DURATION_LONG) : ms(process.env.SESSION_DURATION_SHORT);

        user.activeSessions.push({
            ipAddress,
            userAgent,
            expiresAt: new Date(Date.now() + sessionDuration)
        });

        await user.save();

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
        user.lastLoginAt = new Date();
        await user.save();

        await sendWelcomeEmail(user.email, user.firstName);

        const userResponse = user.toObject();
        delete userResponse.password;
        delete userResponse.verificationToken;
        delete userResponse.resetPasswordToken;
        delete userResponse.activeSessions;

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
        user.verificationTokenExpiresAt = Date.now() + ms(process.env.VERIFICATION_TOKEN_EXPIRY);
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
        user.verificationTokenExpiresAt = Date.now() + ms(process.env.VERIFICATION_TOKEN_EXPIRY);
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

        if (user.lockUntil && user.lockUntil > Date.now()) {
            const remainingTime = Math.ceil((user.lockUntil - Date.now()) / (1000 * 60));
            return res.status(429).json({
                success: false,
                error: `Trop de tentatives. Réessayez dans ${remainingTime} minutes`,
                retryAfter: remainingTime * 60 // en secondes
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            user.loginAttempts += 1;
            if (user.loginAttempts >= 5) {
                user.lockUntil = Date.now() + 15 * 60 * 1000;
                await user.save();
                return res.status(429).json({
                    success: false,
                    error: "Trop de tentatives. Votre compte est temporairement verrouillé."
                });
            }
            return res.status(401).json({
                success: false,
                error: "Mot de passe incorrect"
            });
        }

        // Mettre à jour la dernière connexion
        user.lastLoginAt = Date.now();
        user.loginAttempts = 0;
        user.lockUntil = null;

        const userAgent = req.headers['user-agent'] || 'unknown';
        const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        const sessionDuration = stayLoggedIn ? ms(process.env.SESSION_DURATION_LONG) : ms(process.env.SESSION_DURATION_SHORT);

        //vérification des sessions expirées
        user.activeSessions = user.activeSessions.filter(session =>
            session.expiresAt > Date.now()
        );

        // pas plus de 5 sessions en mm temps
        if (user.activeSessions.length >= 5) {
            user.activeSessions.sort((a, b) => a.expiresAt - b.expiresAt);
            user.activeSessions.shift();
        }

        user.activeSessions.push({
            ipAddress,
            userAgent,
            expiresAt: new Date(Date.now() + sessionDuration)
        });

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

        const resetToken = crypto.randomBytes(32).toString('hex') + Date.now().toString(36);
        user.resetPasswordToken = resetToken;
        user.resetPasswordTokenExpiresAt = Date.now() + ms(process.env.RESET_TOKEN_EXPIRY);
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
                error: "Lien invalide ou expiré. Veuillez faire une nouvelle demande de réinitialisation."
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
        if (req.userId) {
            const user = await UserModel.findById(req.userId);
            if (user) {
                const userAgent = req.headers['user-agent'] || 'unknown';
                const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;

                // Supprimer la session actuelle
                user.activeSessions = user.activeSessions.filter(session =>
                    !(session.ipAddress === ipAddress && session.userAgent === userAgent)
                );
                await user.save();
            }
        }

        res.clearCookie("jwtauth", {
            secure: process.env.NODE_ENV === "production" ? true : false,
            httpOnly: process.env.NODE_ENV === "production" ? true : false,
            sameSite: process.env.NODE_ENV === "production" ? 'lax' : '',
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

        if (!user) {
            return res.status(404).json({
                success: false,
                error: "Utilisateur non trouvé"
            });
        }
        const ip = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        const userAgent = req.headers['user-agent'] || 'unknown';
        const currentSession = user.activeSessions.find(session =>
            session.ipAddress === ip &&
            session.userAgent === userAgent &&
            new Date(session.expiresAt) > new Date(),
        );

        if (!currentSession) {
            res.clearCookie("jwtauth", {
                secure: process.env.NODE_ENV === "production" ? true : false,
                httpOnly: process.env.NODE_ENV === "production" ? true : false,
                sameSite: process.env.NODE_ENV === "production" ? 'lax' : '',
                ...(process.env.NODE_ENV === "production" && { domain: 'step-ify.vercel.app' })
            });
            return res.status(200).json({
                success: false,
                error: "Session expirée ou invalide",
            });
        }
        
        const userRes = user.toJSON();

        return res.status(200).json({
            success: true,
            user: userRes
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