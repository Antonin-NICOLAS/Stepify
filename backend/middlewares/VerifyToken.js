const jwt = require('jsonwebtoken')
const Logger = require('../logs/Logger')
const { sendLocalizedError } = require('../utils/ResponseHelper')

const verifyToken = (req, res, next) => {
  const jwtauth = req.cookies.jwtauth;
  if (!jwtauth) {
    req.authError = 'errors.generic.authentication_required';
    return next();
  }

  try {
    const decoded = jwt.verify(jwtauth, process.env.JWT_SECRET, {
      algorithms: ['HS256']
    });

    if (!decoded) {
      req.authError = 'errors.auth.invalid_token';
      return next();
    }

    req.userId = decoded.id;
    req.token = jwtauth;
    Logger.debug('Token vérifié avec succès', {
      userId: decoded.id,
      path: req.path
    });

    next();
  } catch (error) {
    Logger.error('Token verification error:', error);
    req.authError = error.name === 'TokenExpiredError'
      ? 'errors.generic.invalid_session'
      : 'errors.auth.invalid_token';
    return next();
  }
};

const requireAuth = (req, res, next) => {
  if (req.authError) {
    return sendLocalizedError(res, 401, req.authError);
  }
  next();
};

module.exports = {verifyToken, requireAuth };