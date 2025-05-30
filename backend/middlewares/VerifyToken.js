const jwt = require('jsonwebtoken')
const { sendLocalizedError } = require('../utils/ResponseHelper')

const verifyToken = (req, res, next) => {
  const jwtauth = req.cookies.jwtauth;
  if (!jwtauth) {
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
    next();
  } catch (error) {
    console.error("Token verification error:", error);
    return sendLocalizedError(res, 401, error.name === 'TokenExpiredError' ? 'errors.generic.invalid_session' : 'errors.auth.invalid_token');
  }
};

module.exports = { verifyToken };