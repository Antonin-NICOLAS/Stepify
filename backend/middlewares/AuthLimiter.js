const rateLimit = require("express-rate-limit");
const { getLocalizedMessage } = require("./Localization");

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limite chaque IP à 20 requêtes
  handler: (req, res) => {
    const message = getLocalizedMessage(
      req.locale || "fr",
      "errors.auth.limit_reached",
      { remainingTime: 15 }
    );
    res.status(429).json({
      success: false,
      message,
    });
  },
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = authLimiter;
