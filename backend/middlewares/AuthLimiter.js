const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // Limite chaque IP à 20 requêtes
    message: {
        success: false,
        error: "Trop de requêtes, veuillez réessayer plus tard"
    },
    skipSuccessfulRequests: true,
    standardHeaders: true,
    legacyHeaders: false
});

module.exports = authLimiter;