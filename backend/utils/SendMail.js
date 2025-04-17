const nodemailer = require('nodemailer');
const { WelcomeEmailTemplate, EmailVerificationTokenTemplate, EmailPasswordResetTemplate, ResetPasswordSuccessfulTemplate } = require('./EmailTemplates');

const sendVerificationEmail = async (email, verificationCode) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            type: "login",
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Vérification de votre email - Stepify',
        html: EmailVerificationTokenTemplate.replace("{verificationCode}", verificationCode)
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Email de vérification envoyé');
    } catch (error) {
        console.error("Erreur lors de l'envoi de l'email :", error);
        throw new Error("Échec de l'envoi de l'email de vérification");
    }
};

const sendWelcomeEmail = async (email, prenom) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            type: "login",
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: '🎉 Bienvenue dans l’aventure Stepify !',
        html: WelcomeEmailTemplate.replace("{User.Prenom}", prenom)
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Email de bienvenue envoyé');
    } catch (error) {
        console.error("Erreur lors de l'envoi de l'email :", error);
        throw new Error("Échec de l'envoi de l'email de bienvenue");
    }
};

const sendResetPasswordEmail = async (email, resetUrl) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            type: "login",
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Réinitialisation de votre mot de passe Stepify',
        html: EmailPasswordResetTemplate.replace("{resetUrl}", resetUrl)
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Email de réinitialisation de mot de passe envoyé');
    } catch (error) {
        console.error("Erreur lors de l'envoi de l'email :", error);
        throw new Error("Échec de l'envoi de l'email de réinitialisation de mot de passe");
    }
};

const sendResetPasswordSuccessfulEmail = async (email, prenom) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            type: "login",
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: '🔒 Ton mot de passe a été modifié',
        html: ResetPasswordSuccessfulTemplate.replace("{User.Prenom}", prenom)
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Email du succès de réinitialisation de mot de passe envoyé');
    } catch (error) {
        console.error("Erreur lors de l'envoi de l'email :", error);
        throw new Error("Échec de l'envoi de l'email du succès de réinitialisation de mot de passe");
    }
};

module.exports = { sendVerificationEmail, sendWelcomeEmail, sendResetPasswordEmail, sendResetPasswordSuccessfulEmail };