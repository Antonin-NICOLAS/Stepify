const jwt = require('jsonwebtoken')

const verifyToken = (req, res, next) => {
  const jwtauth = req.cookies.jwtauth;
  if (!jwtauth) {
    return res.status(401).json({ success: false, error: "Authentification requise" });
  }
  
  try {
    const decoded = jwt.verify(jwtauth, process.env.JWT_SECRET, {
      algorithms: ['HS256']
    });

    if (!decoded) {
      return res.status(401).json({ success: false, error: "Token invalide" });
    }
    req.userId = decoded.id;
    req.token = jwtauth;
    next();
  } catch (error) {
    console.error("Token verification error:", error);
    return res.status(401).json({ 
      success: false, 
      error: "Session invalide",
      details: error.name === 'TokenExpiredError' ? 'Token expiré' : 'Token invalide'
    });
  }
};

module.exports = { verifyToken };