const UserModel = require('../models/User');
const ChallengeModel = require('../models/Challenge');
const StepEntryModel = require('../models/StepEntry');
const NotificationModel = require('../models/Notification');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const ms = require('ms');
const CryptoJS = require('crypto-js');
const cloudinary = require('../config/cloudinary');
const { generateVerificationCode } = require('../utils/GenerateCode');
const { GenerateAuthCookie, validateEmail, validateUsername, generateSessionFingerprint } = require('../utils/AuthHelpers');
const { sendLocalizedError, sendLocalizedSuccess } = require('../utils/ResponseHelper');
const {
    sendVerificationEmail,
    sendWelcomeEmail,
    sendResetPasswordEmail,
    sendResetPasswordSuccessfulEmail
} = require('../utils/SendMail');
require('dotenv').config();

//// ACCOUNT MANAGEMENT ////

// register
const createUser = async (req, res) => {
    const { firstName, lastName, username, email, password, stayLoggedIn } = req.body;

    try {
        // Validations améliorées
        if (!firstName || firstName.length < 2) {
            return sendLocalizedError(res, 400, 'errors.auth.firstName_min');
        }
        if (!lastName || lastName.length < 2) {
            return sendLocalizedError(res, 400, 'errors.auth.lastName_min');
        }
        if (!email || !validateEmail(email)) {
            return sendLocalizedError(res, 400, 'errors.auth.invalid_email');
        }
        if (!username || !validateUsername(username)) {
            return sendLocalizedError(res, 400, 'errors.auth.invalid_username');
        }
        if (!password || password.length < 8) {
            return sendLocalizedError(res, 400, 'errors.auth.password_min');
        }

        // Vérifications email/username existant
        const existingUser = await UserModel.findOne({
            $or: [{ email }, { username }]
        }).select('email username').lean();

        if (existingUser) {
            if (existingUser.email === email) {
                return sendLocalizedError(res, 400, 'errors.auth.email_exists');
            }
            if (existingUser.username === username) {
                return sendLocalizedError(res, 400, 'errors.auth.username_exists');
            }
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

        newUser.activeSessions.push({
            ipAddress,
            userAgent,
            fingerprint: generateSessionFingerprint(req),
            expiresAt: new Date(Date.now() + sessionDuration)
        });

        await newUser.save();

        // Ne pas renvoyer les informations sensibles
        const userResponse = newUser.toJSON();

        return sendLocalizedSuccess(res, 'success.auth.account_created', {}, { user: userResponse });
    } catch (error) {
        console.error("Erreur lors de la création du compte:", error);
        return sendLocalizedError(res, 500, 'errors.auth.creation_error');
    }
};

// verify email
const verifyEmail = async (req, res) => {
    const { code } = req.body;
    const { jwtauth } = req.cookies;

    try {
        if (!jwtauth) {
            return sendLocalizedError(res, 401, 'errors.generic.authentication_required');
        }

        const decoded = jwt.verify(jwtauth, process.env.JWT_SECRET);
        const user = await UserModel.findById(decoded.id);

        if (!user) {
            return sendLocalizedError(res, 404, 'errors.generic.user_not_found');
        }

        if (user.isVerified) {
            return sendLocalizedError(res, 400, 'errors.auth.already_verified');
        }

        if (user.verificationToken !== code) {
            return sendLocalizedError(res, 400, 'errors.auth.invalid_verification_code');
        }

        if (user.verificationTokenExpiresAt < Date.now()) {
            return sendLocalizedError(res, 400, 'errors.auth.verification_code_expired');
        }

        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpiresAt = undefined;
        user.lastLoginAt = new Date();
        await user.save();

        await sendWelcomeEmail(user.email, user.firstName);

        const userResponse = user.toJSON();

        return sendLocalizedSuccess(res, 'success.auth.email_verified', {}, { user: userResponse });
    } catch (error) {
        console.error("Erreur lors de la vérification de l'email:", error);
        if (error.name === 'JsonWebTokenError') {
            return sendLocalizedError(res, 401, 'errors.auth.invalid_token');
        }
        return sendLocalizedError(res, 500, 'errors.auth.email_verification_error');
    }
};

// resend verification email
const resendVerificationEmail = async (req, res) => {
    const { jwtauth } = req.cookies;

    try {
        if (!jwtauth) {
            return sendLocalizedError(res, 401, 'errors.generic.authentication_required');
        }

        const decoded = jwt.verify(jwtauth, process.env.JWT_SECRET);
        const user = await UserModel.findById(decoded.id);

        if (!user) {
            return sendLocalizedError(res, 404, 'errors.generic.user_not_found');
        }

        if (user.isVerified) {
            return sendLocalizedError(res, 400, 'errors.auth.already_verified');
        }

        // Générer un nouveau code avec une expiration
        user.verificationToken = generateVerificationCode();
        user.verificationTokenExpiresAt = Date.now() + ms(process.env.VERIFICATION_TOKEN_EXPIRY);
        await user.save();

        await sendVerificationEmail(user.email, user.verificationToken);

        return sendLocalizedSuccess(res, 'success.auth.verification_code_sent');
    } catch (error) {
        console.error("Erreur lors de la demande de renvoi du code de vérification:", error);
        return sendLocalizedError(res, 500, 'errors.auth.email_resent_error');
    }
};

// change verification email
const ChangeVerificationEmail = async (req, res) => {
    const { newEmail } = req.body;

    try {
        if (!newEmail || !validateEmail(newEmail)) {
            return sendLocalizedError(res, 400, 'errors.auth.invalid_email');
        }

        const user = await UserModel.findById(req.userId);
        if (!user) {
            return sendLocalizedError(res, 404, 'errors.generic.user_not_found');
        }

        if (user.isVerified) {
            return sendLocalizedError(res, 404, 'errors.auth.already_verified');
        }

        if (user.email === newEmail) {
            return sendLocalizedError(res, 404, 'errors.auth.same_email_change');
        }

        const emailExists = await UserModel.findOne({ email: newEmail });
        if (emailExists) {
            return sendLocalizedError(res, 404, 'errors.auth.email_exists');
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

        return sendLocalizedSuccess(res, 'success.auth.email_updated');
    } catch (error) {
        console.error("Erreur lors du changement d'email:", error);
        return sendLocalizedError(res, 500, 'errors.auth.email_change_error');
    }
};

// delete an account
const deleteUser = async (req, res) => {
    const { userId } = req.params;
    const { password } = req.body;

    try {
        if (!password) {
            return sendLocalizedError(res, 400, 'errors.auth.password_required');
        }

        const user = await UserModel.findById(userId);
        if (!user) {
            return sendLocalizedError(res, 404, 'errors.generic.user_not_found');
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return sendLocalizedError(res, 401, 'errors.auth.password_incorrect');
        }

        // 1. Supprimer les challenges créés par l'utilisateur
        await ChallengeModel.deleteMany({ creator: userId });

        // 2. Supprimer les participations à des challenges
        await ChallengeModel.updateMany(
            {},
            { $pull: { participants: { user: userId } } }
        );

        // 3. Supprimer les entrées de pas (StepEntry)
        await StepEntryModel.deleteMany({ user: userId });

        // 4. Supprimer toutes les notifications où il est destinataire ou expéditeur
        await NotificationModel.deleteMany({
            $or: [{ recipient: userId }, { sender: userId }]
        });

        // 5. Retirer l'utilisateur de la liste d'amis des autres
        await UserModel.updateMany(
            {},
            { $pull: { friends: { userId: userId } } }
        );

        // 6. Supprimer les demandes d'amis (envoyées ou reçues)
        await UserModel.updateMany(
            {},
            { $pull: { friendRequests: { userId: userId } } }
        );

        // 7. Supprimer l'avatar de l'utilisateur
        if (user.avatarUrl && user.avatarUrl.includes('res.cloudinary.com')) {
            const publicId = user.avatarUrl.split('/').slice(-1)[0].split('.')[0];
            await cloudinary.uploader.destroy(`stepify/avatars/${publicId}`);
        }

        // 8. Supprimer enfin l'utilisateur lui-même
        await UserModel.findByIdAndDelete(userId);

        res.clearCookie("jwtauth", {
            secure: process.env.NODE_ENV === "production",
            httpOnly: true,
            sameSite: process.env.NODE_ENV === "production" ? 'lax' : 'none',
            ...(process.env.NODE_ENV === "production" && { domain: 'step-ify.vercel.app' })
        });

        return sendLocalizedSuccess(res, 'success.auth.account_deleted');
    } catch (error) {
        console.error("Erreur lors de la suppression du compte:", error);
        return sendLocalizedError(res, 500, 'errors.auth.deletion_error');
    }
};

//// ACCOUNT REQ ////

// login
const loginUser = async (req, res) => {
    const { email, password, stayLoggedIn } = req.body;

    try {
        if (!email || !password) {
            return sendLocalizedError(res, 400, 'errors.auth.email_password_required');
        }

        const user = await UserModel.findOne({ email });
        if (!user) {
            return sendLocalizedError(res, 401, 'errors.auth.email_not_found');
        }

        if (user.lockUntil && user.lockUntil > Date.now()) {
            const remainingTime = Math.ceil((user.lockUntil - Date.now()) / (1000 * 60));
            return sendLocalizedError(res, 429, 'errors.auth.limit_reached', { remainingTime }, {
                retryAfter: remainingTime * 60 // en secondes
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            user.loginAttempts += 1;
            const delay = Math.min(1000 * Math.pow(2, user.loginAttempts), 30000); // Délai exponentiel max 30s
            await new Promise(resolve => setTimeout(resolve, delay));

            if (user.loginAttempts >= 5) {
                user.lockUntil = Date.now() + 15 * 60 * 1000;
                await user.save();
                return sendLocalizedError(res, 429, 'errors.auth.account_locked');
            }
            await user.save();
            return sendLocalizedError(res, 401, 'errors.auth.password_incorrect');
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
            fingerprint: generateSessionFingerprint(req),
            expiresAt: new Date(Date.now() + sessionDuration)
        });

        await user.save();

        GenerateAuthCookie(res, user, stayLoggedIn);

        const userResponse = user.toJSON();
        delete userResponse.lockUntil
        delete userResponse.lastLoginAt
        delete userResponse.customGoals
        delete userResponse.challenges
        delete userResponse.rewardsUnlocked
        delete userResponse.friendRequests
        delete userResponse.privacySettings
        delete userResponse.notificationPreferences

        return sendLocalizedSuccess(res, 'success.auth.successful_login', {}, { user: userResponse });
    } catch (error) {
        console.error("Erreur lors de la connexion:", error);
        return sendLocalizedError(res, 500, 'errors.auth.login_error');
    }
};

// forgot password
const forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        if (!email || !validateEmail(email)) {
            return sendLocalizedError(res, 400, 'errors.auth.invalid_email');
        }

        const user = await UserModel.findOne({ email });
        if (!user) {
            return sendLocalizedSuccess(res, 'success.auth.reset_link_sent');
        }

        const randomPart = CryptoJS.lib.WordArray.random(32).toString(CryptoJS.enc.Hex);
        const timestampPart = Date.now().toString(36);
        const resetToken = randomPart + timestampPart;
        user.resetPasswordToken = resetToken;
        user.resetPasswordTokenExpiresAt = Date.now() + ms(process.env.RESET_TOKEN_EXPIRY);
        await user.save();

        const resetUrl = `${process.env.FRONTEND_SERVER}/reset-password/${resetToken}`;
        await sendResetPasswordEmail(user.email, resetUrl);

        return sendLocalizedSuccess(res, 'success.auth.reset_link_sent');
    } catch (error) {
        console.error("Erreur lors de la demande de réinitialisation de mot de passe:", error);
        return sendLocalizedError(res, 500, 'errors.auth.reset_request_error');
    }
};

// reset password
const resetPassword = async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    try {
        if (!password || password.length < 8) {
            return sendLocalizedError(res, 400, 'errors.auth.password_min');
        }

        const user = await UserModel.findOne({
            resetPasswordToken: token,
            resetPasswordTokenExpiresAt: { $gt: Date.now() }
        });

        if (!user) {
            return sendLocalizedError(res, 400, 'errors.auth.invalid_reset_link');
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordTokenExpiresAt = undefined;
        await user.save();

        await sendResetPasswordSuccessfulEmail(user.email, user.firstName);

        return sendLocalizedSuccess(res, 'success.auth.password_reset');
    } catch (error) {
        console.error("Erreur lors de la réinitialisation du mot de passe:", error);
        return sendLocalizedError(res, 500, 'errors.auth.reset_error');
    }
};

// logout
const logoutUser = async (req, res) => {
    try {
        if (req.userId) {
            const user = await UserModel.findById(req.userId);
            if (!user) {
                return sendLocalizedError(res, 404, 'errors.generic.user_not_found');
            } else {
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

        return sendLocalizedSuccess(res, 'success.auth.logged_out');
    } catch (error) {
        console.error("Erreur lors de la déconnexion:", error);
        return sendLocalizedError(res, 500, 'errors.auth.logout_error');
    }
};

//// CONTEXT ////

// check auth
const checkAuth = async (req, res) => {
    try {
        const user = await UserModel.findById(req.userId)

        if (!user) {
            return sendLocalizedError(res, 404, 'errors.generic.user_not_found');
        }

        const currentFingerprint = generateSessionFingerprint(req);
        const currentSession = user.activeSessions.find(session =>
            session.fingerprint === currentFingerprint &&
            new Date(session.expiresAt) > new Date()
        );

        if (!currentSession) {
            res.clearCookie("jwtauth", {
                secure: process.env.NODE_ENV === "production" ? true : false,
                httpOnly: process.env.NODE_ENV === "production" ? true : false,
                sameSite: process.env.NODE_ENV === "production" ? 'strict' : '',
                ...(process.env.NODE_ENV === "production" && { domain: 'step-ify.vercel.app' })
            });
            return sendLocalizedError(res, 401, 'errors.auth.session_expired');
        }

        const userResponse = user.toJSON();
        delete userResponse.lockUntil
        delete userResponse.lastLoginAt
        delete userResponse.customGoals
        delete userResponse.challenges
        delete userResponse.rewardsUnlocked
        delete userResponse.friendRequests
        delete userResponse.privacySettings
        delete userResponse.notificationPreferences
        return sendLocalizedSuccess(res, null, {}, { user: userResponse });
    } catch (error) {
        console.error("Erreur lors de la vérification de l'authentification:", error);
        if (error.name === 'JsonWebTokenError') {
            return sendLocalizedError(res, 401, 'errors.auth.invalid_token');
        }
        return sendLocalizedError(res, 500, 'errors.auth.check_auth_error');
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