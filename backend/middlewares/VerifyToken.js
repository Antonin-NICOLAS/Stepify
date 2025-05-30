const jwt = require('jsonwebtoken')
const { sendLocalizedError } = require('../utils/ResponseHelper')
const Logger = require('../logs/Logger')

const verifyToken = (req, res, next) => {
  const jwtauth = req.cookies.jwtauth;
  if (!jwtauth) {
    Logger.warn('Tentative d\'accès sans token', {
      path: req.path,
      ip: req.ip,
      userAgent: req.headers['user-agent']
    });
    return sendLocalizedError(res, 401, 'errors.generic.authentication_required');
  }
  
  try {
    const decoded = jwt.verify(jwtauth, process.env.JWT_SECRET, {
      algorithms: ['HS256']
    });

    if (!decoded) {
      return sendLocalizedError(res, 401, 'errors.auth.invalid_token');
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
    return sendLocalizedError(res, 401, error.name === 'TokenExpiredError' ? 'errors.generic.invalid_session' : 'errors.auth.invalid_token');
  }
};

module.exports = { verifyToken };