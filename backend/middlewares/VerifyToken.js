const jwt = require('jsonwebtoken')

const verifyToken = (req, res, next) => {
  const jwtauth = req.cookies.jwtauth;
  if (!jwtauth) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
  try {
    const decoded = jwt.verify(jwtauth, process.env.JWT_SECRET);
    if (!decoded) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    req.userId = decoded.id;
    next();
  } catch (error) {
    console.log(error);
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
};

module.exports = { verifyToken };